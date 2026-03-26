import os
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'
import joblib
import numpy as np
import pandas as pd
import torch
from sentence_transformers import SentenceTransformer, util
import google.generativeai as genai
from dotenv import load_dotenv 

print("Loading AI Models into memory... This might take a moment.")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "production_models")

env_path = os.path.join(BASE_DIR, "..", "Backend", ".env")
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing! Please check your .env file.")

genai.configure(api_key=API_KEY)
llm_model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')

# Load pre-trained models and dataframes
df_books = joblib.load(f'{MODEL_DIR}/books_dataframe.pkl')
content_sim_matrix = joblib.load(f'{MODEL_DIR}/content_sim_matrix.pkl')
df_ratings = joblib.load(f'{MODEL_DIR}/df_ratings.pkl')

nlp_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
nlp_book_embeddings = joblib.load(f'{MODEL_DIR}/nlp_book_embeddings.pkl')

# Permanently convert the embeddings matrix to a PyTorch Tensor in memory
if not isinstance(nlp_book_embeddings, torch.Tensor):
    nlp_book_embeddings = torch.tensor(nlp_book_embeddings)

df_nlp = joblib.load(f'{MODEL_DIR}/nlp_books_dataframe.pkl')

print("✅ All Models Loaded Successfully!")

def get_smart_content_recommendations(user_id=None, user_department="", num_recommendations=6, user_prefs=None):
    """
    Advanced recommendation algorithm based on actual student data 
    (favorites and borrowing history) rather than static/mock data.
    """
    # 1. Extract actual user preferences sent from the backend
    liked_titles = user_prefs.get("liked_books", []) if user_prefs else []
    fav_categories = user_prefs.get("favorite_categories", []) if user_prefs else []

    # Initialize a scoring array for all books in the library
    scores = np.zeros(len(df_books))
    dept_keyword = user_department.split()[0].lower() if user_department else ""

    # 2. Score calculation based on the user's department
    for idx, row in df_books.iterrows():
        genre = str(row.get('genre', '')).lower()
        
        # Apply a high weight if the book matches the user's department
        if dept_keyword and dept_keyword in genre:
            scores[idx] += 2.0  
        
        # Apply an additional weight for books in the user's favorite categories
        for cat in fav_categories:
            if cat.lower() in genre:
                scores[idx] += 1.0

    # 3. Score calculation based on Semantic Similarity (NLP) with liked books
    if liked_titles and 'content_sim_matrix' in globals():
        # Find indices of the books the user has already read/liked
        liked_indices = df_books[df_books['title'].isin(liked_titles)].index.tolist()
        
        for idx in liked_indices:
            # Add similarity scores from the pre-computed similarity matrix
            scores += content_sim_matrix[idx]
        
        # Heavily penalize already read books (-100) to prevent re-recommending them
        for idx in liked_indices:
            scores[idx] -= 100.0

    # 4. Apply a slight weight to popular books to break ties (Trend Boost)
    if 'rating' in df_books.columns:
        scores += (df_books['rating'].fillna(0).values * 0.1)

    # 5. Select the top-scoring books and format the results
    top_indices = scores.argsort()[::-1][:num_recommendations]
    recommendations = df_books.iloc[top_indices].copy()

    return recommendations.to_dict('records')

def get_similar_books(book_id, current_df=df_books, current_sim_matrix=content_sim_matrix, num_recommendations=5):
    """
    Fetches a list of books similar to a target book based on the pre-computed similarity matrix.
    """
    final_response = {"target_book_id": book_id, "status": "success", "similar_books": [], "message": ""}
    
    # Check if the requested book exists in the database
    if book_id not in current_df['book_id'].values:
        final_response["status"] = "error"
        final_response["message"] = "Book not found in database."
        return final_response
        
    # Retrieve similarity scores for the target book
    idx = current_df.index[current_df['book_id'] == book_id].tolist()[0]
    sim_scores = sorted(list(enumerate(current_sim_matrix[idx])), key=lambda x: x[1], reverse=True)[1:num_recommendations + 1]
    
    # Format the response with book details and match percentages
    final_response["similar_books"] = [
        {"recommended_book_id": int(current_df['book_id'].iloc[i[0]]), 
         "title": current_df['title'].iloc[i[0]], 
         "genre": current_df['genre'].iloc[i[0]], 
         "match_score": f"{round(i[1] * 100, 1)}%"} 
        for i in sim_scores
    ]
    final_response["message"] = f"Successfully fetched {len(final_response['similar_books'])} similar books."
    
    return final_response

def chatbot_semantic_search(user_message, model=nlp_model, df=df_nlp, corpus_embeddings=nlp_book_embeddings, top_k=20, nlp_threshold=0.35):
    """
    Performs a semantic search query against the library corpus using NLP embeddings.
    """
    # 1. Convert the user's query into an NLP embedding tensor
    query_embedding = model.encode(user_message, convert_to_tensor=True)
    
    # 2. Strict Safeguard: Ensure the corpus is a PyTorch Tensor, not a Numpy Array 
    if not isinstance(corpus_embeddings, torch.Tensor):
        corpus_embeddings = torch.tensor(corpus_embeddings)
        
    # 3. Ensure corpus_embeddings are on the same device (CPU/GPU) as the query_embedding
    corpus_device_matched = corpus_embeddings.to(query_embedding.device)
    
    # 4. Calculate Cosine Similarity between the query and all books
    cosine_scores = util.cos_sim(query_embedding, corpus_device_matched)[0]
    
    # Get top results sorted by score
    top_results = np.argsort(cosine_scores.cpu().numpy())[::-1][:top_k * 2]
    
    # 5. Filter results based on the defined threshold
    final_picks = []
    for idx in top_results:
        score = float(cosine_scores[idx])
        if score >= nlp_threshold:
            final_picks.append({
                "recommended_book_id": int(df.iloc[idx]['book_id']), 
                "title": df.iloc[idx]['title'], 
                "match_score": round(score * 100, 1)
            })
            
    final_picks = final_picks[:top_k]
    
    # Return a fallback message if no relevant books meet the threshold
    if not final_picks:
        return {"bot_reply": "عذراً، لم أتمكن من العثور على كتب تطابق طلبك بدقة في مكتبتنا حالياً. هل يمكنك توضيح بحثك أو استخدام مصطلحات أخرى؟", "recommended_books": []}
        
    return {"bot_reply": "", "recommended_books": final_picks}

def generate_rag_response(user_message, search_results):
    """
    Generates a contextual response using the Gemini LLM based on the semantic search results (RAG implementation).
    """
    if not search_results:
        return "عذراً، لم أجد كتباً تطابق طلبك بدقة. الفهرس الحالي قد لا يحتوي على مراجع في هذا التخصص الدقيق."
        
    # Format the search results to be injected into the LLM prompt
    context_text = "".join([f"- Book Title: [{book['title']}]\n   Match Score: {book['match_score']}%\n" for book in search_results])
    
    # Construct the RAG prompt (Kept in Arabic to ensure the LLM replies to the student in Arabic)
    prompt = f"""أنت مستشار أكاديمي خبير وموجه للطلاب في مكتبة الجامعة.
        استفسار الطالب: "{user_message}"
        نتائج البحث الأولية من فهرس المكتبة (20 كتاب):
        {context_text}
        
        المطلوب منك:
        1. تحية رسمية محايدة: ابدأ رسالتك بـ "أهلاً بك." فقط.
        2. التصفية الذكية الصامتة: راجع الكتب بعناية، واختر فقط الأنسب لطلب الطالب (بحد أقصى 5 كتب).
        3. التنسيق: يُمنع تماماً استخدام علامات النجمة (**) أو الأقواس المربعة ([]).
        4. طريقة العرض: اعرض كل كتاب في نقطة منفصلة تبدأ برمز (•).
        5. اسم الكتاب: يجب كتابة اسم الكتاب باللغة الإنجليزية كما هو بالضبط بين علامتي تنصيص هكذا: "اسم الكتاب" لكي يتعرف عليه النظام.
        6. التقييم الأكاديمي: بجانب اسم الكتاب، اشرح باختصار لماذا اخترته وكيف سيفيد الطالب.
        7. خاتمة مهنية قصيرة.
        """
        
    try: 
        return llm_model.generate_content(prompt).text
    except Exception as e: 
        return f"حدث خطأ في الاتصال: {e}"