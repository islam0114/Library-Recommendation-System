import os
import joblib
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer, util
import google.generativeai as genai
from dotenv import load_dotenv 

# ==========================================
# 1. Configuration & Loading Models
# ==========================================
print("Loading AI Models into memory... This might take a moment.")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "production_models")
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing! Please check your .env file.")

genai.configure(api_key=API_KEY)
llm_model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')

# Load Content-Based Recommendation Artifacts
df_books = joblib.load(f'{MODEL_DIR}/books_dataframe.pkl')
content_sim_matrix = joblib.load(f'{MODEL_DIR}/content_sim_matrix.pkl')
df_ratings = joblib.load(f'{MODEL_DIR}/df_ratings.pkl')

# Load NLP Models & Embeddings
nlp_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
nlp_book_embeddings = joblib.load(f'{MODEL_DIR}/nlp_book_embeddings.pkl')
df_nlp = joblib.load(f'{MODEL_DIR}/nlp_books_dataframe.pkl')

print("✅ All Models Loaded Successfully!")

# ==========================================
# 2. Recommendation Functions (Home Page & Book Details)
# ==========================================

def get_smart_content_recommendations(user_id, user_department, df_ratings=df_ratings, current_df=df_books, current_sim_matrix=content_sim_matrix, num_recommendations=5):
    """
    Smart Content-Based Recommender: 
    Relies purely on NLP Semantic Similarity and User Demographics.
    Used for the Home Page.
    """
    final_response = {
        "user_id": user_id,
        "department": user_department,
        "status": "success",
        "recommended_picks": [],
        "message": ""
    }
    
    # Map university departments to standard book genres
    department_to_genre = {
        "AI": "Computers",
        "Computer Science": "Computers",
        "Civil": "Technology",
        "Mechanical": "Engineering",
        "Business": "Business",
        "Arts": "Art",
        "Philosophy": "Philosophy"
    }
    
    # Extract User History
    user_history = df_ratings[df_ratings['user_id'] == user_id]
    books_read = user_history['book_id'].tolist() if not user_history.empty else []
    
    # Filter highly rated books (4.0 or 5.0)
    favorite_books = user_history[user_history['rating'] >= 4.0].sort_values(by='rating', ascending=False)
    
    # ------------------------------------------
    # 1. Active User Scenario
    # ------------------------------------------
    if not favorite_books.empty:
        final_response["message"] = "Active User: Generating Content-Based recommendations from top-rated past reads."
        
        # Seed search with top 2 books read
        top_seed_books = favorite_books.head(2)['book_id'].tolist()
        raw_recommendations = []
        
        for seed_book_id in top_seed_books:
            if seed_book_id in current_df['book_id'].values:
                idx = current_df.index[current_df['book_id'] == seed_book_id].tolist()[0]
                sim_scores = list(enumerate(current_sim_matrix[idx]))
                sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
                
                # Fetch top 10 similar books to filter out already read ones
                for i in sim_scores[1:11]:
                    rec_book_id = int(current_df['book_id'].iloc[i[0]])
                    
                    if rec_book_id not in books_read:
                        raw_recommendations.append({
                            "recommended_book_id": rec_book_id,
                            "title": current_df['title'].iloc[i[0]],
                            "genre": current_df['genre'].iloc[i[0]],
                            "match_score_raw": float(i[1]),
                            "match_score": f"{round(i[1] * 100, 1)}%"
                        })
        
        # Remove duplicates and sort by highest similarity
        unique_recs = {}
        for rec in raw_recommendations:
            b_id = rec['recommended_book_id']
            if b_id not in unique_recs or rec['match_score_raw'] > unique_recs[b_id]['match_score_raw']:
                unique_recs[b_id] = rec
                
        sorted_recs = sorted(list(unique_recs.values()), key=lambda x: x['match_score_raw'], reverse=True)
        
        # Clean up internal score before returning
        for rec in sorted_recs:
            del rec['match_score_raw']
            
        final_response["recommended_picks"] = sorted_recs[:num_recommendations]
        return final_response

    # ------------------------------------------
    # 2. Cold Start Scenario
    # ------------------------------------------
    final_response["message"] = f"Cold Start: Recommending foundation books based on department ({user_department})."
    
    search_genre = department_to_genre.get(user_department, user_department)
    department_books = current_df[current_df['genre'].str.contains(search_genre, case=False, na=False)]
    
    if not department_books.empty:
        default_book_id = int(department_books.iloc[0]['book_id'])
    else:
        default_book_id = int(current_df.iloc[0]['book_id']) 
        
    idx = current_df.index[current_df['book_id'] == default_book_id].tolist()[0]
    sim_scores = list(enumerate(current_sim_matrix[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[0:num_recommendations]
    
    dept_recs = []
    for i in sim_scores:
        dept_recs.append({
            "recommended_book_id": int(current_df['book_id'].iloc[i[0]]),
            "title": current_df['title'].iloc[i[0]],
            "genre": current_df['genre'].iloc[i[0]],
            "match_score": f"{round(i[1] * 100, 1)}%"
        })
        
    final_response["recommended_picks"] = dept_recs
    return final_response

def get_similar_books(book_id, current_df=df_books, current_sim_matrix=content_sim_matrix, num_recommendations=5):
    """
    Finds books similar to a SPECIFIC book.
    Used for the "Similar Books" section in a Book Details page.
    """
    final_response = {
        "target_book_id": book_id,
        "status": "success",
        "similar_books": [],
        "message": ""
    }
    
    if book_id not in current_df['book_id'].values:
        final_response["status"] = "error"
        final_response["message"] = "Book not found in database."
        return final_response
        
    idx = current_df.index[current_df['book_id'] == book_id].tolist()[0]
    sim_scores = list(enumerate(current_sim_matrix[idx]))
    
    # Sort and exclude the first result (which is the book itself)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:num_recommendations + 1]
    
    results = []
    for i in sim_scores:
        results.append({
            "recommended_book_id": int(current_df['book_id'].iloc[i[0]]),
            "title": current_df['title'].iloc[i[0]],
            "genre": current_df['genre'].iloc[i[0]],
            "match_score": f"{round(i[1] * 100, 1)}%"
        })
        
    final_response["similar_books"] = results
    final_response["message"] = f"Successfully fetched {len(results)} similar books."
    
    return final_response


# ==========================================
# 3. NLP & RAG Functions (Chatbot)
# ==========================================

def chatbot_semantic_search(user_message, model=nlp_model, df=df_nlp, corpus_embeddings=nlp_book_embeddings, top_k=5, nlp_threshold=0.40):
    query_embedding = model.encode(user_message, convert_to_tensor=True)
    cosine_scores = util.cos_sim(query_embedding, corpus_embeddings)[0]
    top_results = np.argsort(cosine_scores.cpu().numpy())[::-1][:top_k * 2]
    
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
            
    if not final_picks:
        return {"bot_reply": "عذراً، لم أتمكن من العثور على كتب تطابق طلبك بدقة في مكتبتنا حالياً. هل يمكنك توضيح بحثك أو استخدام مصطلحات أخرى؟", "recommended_books": []}

    return {"bot_reply": "", "recommended_books": final_picks}

def generate_rag_response(user_message, search_results):
    if not search_results:
        return "عذراً، لم أجد كتباً تطابق طلبك بدقة. الفهرس الحالي قد لا يحتوي على مراجع في هذا التخصص الدقيق."
    
    context_text = ""
    for book in search_results:
        context_text += f"- Book Title: [{book['title']}]\n  Match Score: {book['match_score']}%\n"

    prompt = f"""
    أنت مستشار أكاديمي خبير وموجه للطلاب في مكتبة الجامعة. دورك هو إرشاد الطالب للإجابة على سؤاله بناءً على نتائج البحث.
    طريقتك رسمية، مهنية، أكاديمية، وحيادية تماماً باللغة العربية الفصحى.
    يجب الاحتفاظ بالمصطلحات التقنية باللغة الإنجليزية كما هي بين أقواس مربعة [ ].

    استفسار الطالب: "{user_message}"
    
    نتائج البحث من فهرس المكتبة:
    {context_text}
    
    المطلوب منك بالترتيب:
    1. تحية رسمية محايدة: ابدأ رسالتك بـ "أهلاً بك." فقط. (يُمنع منعاً باتاً استخدام ألقاب مثل: يا بني، عزيزي، أيها الطالب، إلخ).
    2. التصفية الذكية الصامتة (Silent Veto): راجع الكتب المقترحة أولاً. إذا وجدت كتاباً ليس له علاقة منطقية بمجال الطالب، تجاهله تماماً. **(قانون صارم: يُمنع إخبار الطالب أنك قمت باستبعاد كتب، ويُمنع ذكر أسماء الكتب المستبعدة. الفلترة يجب أن تحدث في صمت تام دون تبرير)**.
    3. التقييم الأكاديمي: للكتب التي نجت من التصفية (إن وجدت)، اعرضها في نقاط (Bullet points) واشرح بصدق وموضوعية كيف تفيده. 
    4. التعامل مع النقص: إذا قمت بتجاهل كل النتائج لأنها غير مناسبة، صارح الطالب بلباقة أن المكتبة تفتقر حالياً للمراجع المتخصصة في مجاله الدقيق، واقترح عليه مصطلحات بحث بديلة.
    5. اختم رسالتك بعبارة ختامية مهنية قصيرة (مثل: "مع خالص التمنيات بالتوفيق"، أو ما شابه).
    
    قيود صارمة (RAG Constraints):
    - لا تقترح أي كتاب من خارج (نتائج البحث المطابقة) إطلاقاً.
    - الفلترة صامتة: لا تكتب أي جملة تفيد بأنك قمت بمراجعة أو تصفية أو استبعاد نتائج.
    - خلو النص تماماً من أي رموز تعبيرية (Emojis).
    """
    
    try:
        response = llm_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"حدث خطأ في الاتصال: {e}"