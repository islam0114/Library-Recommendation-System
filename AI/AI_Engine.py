import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from sentence_transformers import SentenceTransformer, util
import google.generativeai as genai
from dotenv import load_dotenv # <-- الإضافة الجديدة هنا

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

# Load Recommendation Models
cf_model = tf.keras.models.load_model(f'{MODEL_DIR}/collaborative_model.keras')
encoders = joblib.load(f'{MODEL_DIR}/encoders.pkl')
user2encoded = encoders['user2encoded']
book2encoded = encoders['book2encoded']

df_books = joblib.load(f'{MODEL_DIR}/books_dataframe.pkl')
content_sim_matrix = joblib.load(f'{MODEL_DIR}/content_sim_matrix.pkl')
df_ratings = joblib.load(f'{MODEL_DIR}/df_ratings.pkl')

# Load NLP Models
nlp_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
nlp_book_embeddings = joblib.load(f'{MODEL_DIR}/nlp_book_embeddings.pkl')
df_nlp = joblib.load(f'{MODEL_DIR}/nlp_books_dataframe.pkl')

print("✅ All Models Loaded Successfully!")

# ==========================================
# 2. Recommendation Functions
# ==========================================

def get_recommendations(book_id, cosine_sim=content_sim_matrix, df=df_books):
    if book_id not in df['book_id'].values:
        return []
    idx = df.index[df['book_id'] == book_id].tolist()[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:4]
    
    results = []
    for i in sim_scores:
        results.append({
            "recommended_book_id": int(df['book_id'].iloc[i[0]]),
            "title": df['title'].iloc[i[0]],
            "match_score": f"{round(i[1] * 100, 1)}%"
        })
    return results

def get_collaborative_recommendations(user_id, model=cf_model, ratings=df_ratings, num_recommendations=2):
    if user_id not in user2encoded:
        return []
    all_books = ratings['book_id'].unique()
    books_read_by_user = ratings[ratings['user_id'] == user_id]['book_id'].values
    books_not_read = [book for book in all_books if book not in books_read_by_user]
    
    if len(books_not_read) == 0:
        return []
        
    user_encoded = user2encoded[user_id]
    books_not_read_encoded = [book2encoded[book] for book in books_not_read]
    
    user_input_array = np.array([user_encoded] * len(books_not_read_encoded))
    book_input_array = np.array(books_not_read_encoded)
    
    predicted_ratings = model.predict([user_input_array, book_input_array], verbose=0).flatten()
    book_rating_pairs = sorted(list(zip(books_not_read, predicted_ratings)), key=lambda x: x[1], reverse=True)
    
    results = []
    for book_id, predicted_rating in book_rating_pairs[:num_recommendations]:
        clipped_rating = np.clip(float(predicted_rating), 1.0, 5.0)
        results.append({
            "recommended_book_id": int(book_id),
            "predicted_rating": round(clipped_rating, 1)
        })
    return results

def get_hybrid_recommendations(user_id, user_department, df_ratings=df_ratings, current_df=df_books, current_sim_matrix=content_sim_matrix, cf_model=cf_model, history_threshold=2):
    final_response = {
        "user_id": user_id,
        "department": user_department,
        "status": "success",
        "collaborative_picks": [],
        "content_based_picks": [],
        "message": ""
    }
    
    user_history = df_ratings[df_ratings['user_id'] == user_id]
    
    if len(user_history) < history_threshold:
        final_response["message"] = f"Cold Start: User has no history. Recommending based on department ({user_department})."
        department_books = current_df[current_df['genre'].str.contains(user_department, case=False, na=False)]
        default_book_id = int(department_books.iloc[0]['book_id']) if not department_books.empty else 101 
        final_response["content_based_picks"] = get_recommendations(default_book_id, current_sim_matrix, current_df)
        return final_response

    final_response["message"] = "Active User: Generating hybrid recommendations based on personal history."
    final_response["collaborative_picks"] = get_collaborative_recommendations(user_id, cf_model, df_ratings, num_recommendations=2)
    highest_rated_book = user_history.sort_values(by='rating', ascending=False).iloc[0]['book_id']
    final_response["content_based_picks"] = get_recommendations(highest_rated_book, current_sim_matrix, current_df)
    
    return final_response

# ==========================================
# 3. NLP & RAG Functions
# ==========================================

def chatbot_semantic_search(user_message, model=nlp_model, df=df_nlp, corpus_embeddings=nlp_book_embeddings, top_k=2, similarity_threshold=0.2):
    query_embedding = model.encode(user_message, convert_to_tensor=True)
    cosine_scores = util.cos_sim(query_embedding, corpus_embeddings)[0]
    top_results = np.argsort(cosine_scores.cpu().numpy())[::-1][:top_k]
    
    final_picks = []
    for idx in top_results:
        score = float(cosine_scores[idx])
        if score >= similarity_threshold:
            final_picks.append({
                "recommended_book_id": int(df.iloc[idx]['book_id']),
                "title": df.iloc[idx]['title'],
                "match_score": round(score * 100, 1)
            })
    
    if not final_picks:
        return {"bot_reply": "عذراً، لم أتمكن من العثور على كتب تطابق طلبك بدقة في مكتبتنا حالياً. هل يمكنك توضيح بحثك أكثر؟", "recommended_books": []}
    else:
        return {"bot_reply": "لقد قمت بالبحث في المكتبة، ووجدت هذه الكتب التي تناسب ما تبحث عنه تماماً:", "recommended_books": final_picks}

def generate_personalized_rag(user_message, search_results, user_history_books=None):
    if not search_results:
        return "عذراً، لم أجد كتباً تطابق طلبك بدقة. هل يمكنك توضيح بحثك أكثر؟"
    
    context_text = ""
    for book in search_results:
        context_text += f"- اسم الكتاب: [{book['title']}]\n  نسبة تطابق المحتوى: {book['match_score']}%\n"

    history_text = "الطالب جديد وليس لديه تاريخ استعارات سابق."
    if user_history_books:
        history_text = "تاريخ الطالب الأكاديمي (الكتب التي قرأها مسبقاً في المكتبة):\n"
        for title in user_history_books:
            history_text += f"- [{title}]\n"

    prompt = f"""
    أنت المساعد الرقمي الرسمي لمكتبة الجامعة. دورك هو إرشاد الطلاب للمصادر الأكاديمية باحترافية.
    طريقتك رسمية، مهنية، وأكاديمية باللغة العربية الفصحى. يُمنع التودد الزائد أو الألفاظ العامية.
    يُسمح بل يُفضل الاحتفاظ بالمصطلحات التقنية باللغة الإنجليزية كما هي لضمان الدقة.

    معلومات عن الطالب:
    {history_text}

    استفسار الطالب الحالي: "{user_message}"
    
    نتائج البحث المطابقة من فهرس المكتبة للإجابة على سؤاله:
    {context_text}
    
    المطلوب منك:
    1. تحية رسمية عملية.
    2. عرض الكتب المقترحة في نقاط (Bullet points) فقط، مع شرح أكاديمي موجز لكيفية خدمتها لاستفساره.
    3. (التخصيص الذكي): اربط بذكاء بين استفساره الحالي وبين الكتب التي قرأها مسبقاً (إن وُجدت) لتبين له مسار تطوره الأكاديمي.
    4. حماية التنسيق: ضع أي مصطلح أو اسم كتاب إنجليزي بين أقواس مربعة [ ].
    5. خاتمة رسمية موجزة.
    
    قيود صارمة (RAG Constraints):
    - لا تقترح أي كتاب من خارج (نتائج البحث المطابقة) بأي شكل من الأشكال.
    - خلو النص تماماً من أي رموز تعبيرية (Emojis).
    """
    
    try:
        response = llm_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"حدث خطأ في الاتصال: {e}"