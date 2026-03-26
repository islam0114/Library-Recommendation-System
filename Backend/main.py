import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import os, threading, urllib.request as _ur
import aiomysql, bcrypt, jwt
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
from AI.AI_Engine import (
    get_smart_content_recommendations,
    get_similar_books,
    chatbot_semantic_search,
    generate_rag_response,
)

_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path)

DB_HOST    = os.getenv("DB_HOST", "localhost")
DB_PORT    = int(os.getenv("DB_PORT", 3306))
DB_USER    = os.getenv("DB_USER", "root")
DB_PASS    = os.getenv("DB_PASS", "")
DB_NAME    = os.getenv("DB_NAME", "bibliotech")
JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
JWT_EXPIRE = int(os.getenv("JWT_EXPIRE_HOURS", 24))
SUPER_ADMIN_EMAIL = os.getenv("SUPER_ADMIN_EMAIL", "admin@benha.edu.eg").lower()

DEPT_COLORS = {
    "Computers":          ["#064e3b","#065f46"],
    "Business":           ["#052e16","#064e3b"],
    "History":            ["#1e3a8a","#1e40af"],
    "Social Science":     ["#3b0764","#4c1d95"],
    "Science":            ["#0c4a6e","#075985"],
    "Medical":            ["#7f1d1d","#991b1b"],
    "Philosophy":         ["#0f172a","#1e293b"],
    "Psychology":         ["#500724","#701a75"],
    "Education":          ["#1a1a2e","#16213e"],
    "Political Science":  ["#14532d","#166534"],
    "Technology":         ["#431407","#7c2d12"],
    "Literary Criticism": ["#1e1b4b","#312e81"],
    "Language Arts":      ["#0a0a23","#172554"],
    "Architecture":       ["#1c1917","#292524"],
    "Reference":          ["#111827","#1f2937"],
    "Law":                ["#1a0a00","#3b1c00"],
}
DEFAULT_COLOR = ["#1a1a2e","#16213e"]

app = FastAPI(title="BiblioTech API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

pool = None

@app.on_event("startup")
async def startup():
    global pool
    pool = await aiomysql.create_pool(
        host=DB_HOST, port=DB_PORT,
        user=DB_USER, password=DB_PASS,
        db=DB_NAME, charset="utf8mb4",
        autocommit=True, minsize=2, maxsize=10
    )
    print("✅ MySQL connected")
    
    # Auto-create book_reviews table
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS book_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                book_id VARCHAR(255) NOT NULL,
                user_id INT NOT NULL,
                review_text TEXT NOT NULL,
                rating INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)
            # Social tables
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS friendships (
                id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                sender_id  INT UNSIGNED NOT NULL,
                receiver_id INT UNSIGNED NOT NULL,
                status     ENUM('pending','accepted','blocked') NOT NULL DEFAULT 'pending',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uq_pair (sender_id, receiver_id),
                INDEX idx_receiver (receiver_id),
                INDEX idx_sender   (sender_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS direct_messages (
                id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                sender_id   INT UNSIGNED NOT NULL,
                receiver_id INT UNSIGNED NOT NULL,
                content     TEXT NOT NULL,
                seen        TINYINT(1) NOT NULL DEFAULT 0,
                created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_conv (sender_id, receiver_id),
                INDEX idx_recv (receiver_id),
                INDEX idx_time (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS communities (
                id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name        VARCHAR(120) NOT NULL,
                description TEXT,
                category    VARCHAR(80)  NOT NULL DEFAULT 'General',
                cover_color VARCHAR(20)  NOT NULL DEFAULT '#0d9488',
                created_by  INT UNSIGNED NOT NULL,
                member_count INT UNSIGNED NOT NULL DEFAULT 1,
                created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_category (category)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS community_members (
                community_id INT UNSIGNED NOT NULL,
                student_id   INT UNSIGNED NOT NULL,
                role         ENUM('admin','member') NOT NULL DEFAULT 'member',
                joined_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (community_id, student_id),
                INDEX idx_student (student_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            await cur.execute("""
            CREATE TABLE IF NOT EXISTS community_messages (
                id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                community_id INT UNSIGNED NOT NULL,
                sender_id    INT UNSIGNED NOT NULL,
                content      TEXT NOT NULL,
                created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_community (community_id, created_at),
                INDEX idx_sender    (sender_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            await conn.commit()
    print("✅ book_reviews + social tables initialized")

    from routes.register_routes import make_register_router
    app.include_router(make_register_router(get_db))
    
    from routes.otp_routes import make_otp_router
    app.include_router(make_otp_router(get_db))
    
    from routes.books_routes import make_books_router
    app.include_router(make_books_router(get_db, require_admin))
    
    from routes.social_routes import make_social_router
    app.include_router(make_social_router(get_db, require_student))

@app.on_event("shutdown")
async def shutdown():
    pool.close()
    await pool.wait_closed()

async def get_db():
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            yield cur

# JWT 
def create_token(data: dict) -> str:
    payload = {**data, "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def check_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

security = HTTPBearer(auto_error=False)

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return decode_token(creds.credentials)

def require_student(user=Depends(get_current_user)):
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Students only")
    return user

def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user

def require_super_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    if not user.get("is_super"):
        raise HTTPException(status_code=403, detail="Only the super admin can perform this action")
    return user

# Pydantic Models 
class StudentLogin(BaseModel):
    email: str
    password: str

class AdminLogin(BaseModel):
    email: str
    password: str

class BorrowRequestCreate(BaseModel):
    book_id: str
    book_title: str
    book_author: str
    book_dept: str

class AnnCreate(BaseModel):
    title: str
    body: str
    priority: str = "normal"

class WishlistToggle(BaseModel):
    book_id: str

class NotifMarkRead(BaseModel):
    ids: List[int] = []

class CreateUserBody(BaseModel):
    role:        str
    full_name:   str
    email:       str
    password:    str
    national_id: Optional[str] = None
    university:  Optional[str] = None
    faculty:     Optional[str] = None
    department:  Optional[str] = None 
    year:        Optional[str] = None
    username:    Optional[str] = None
    phone:       Optional[str] = None
    is_super:    Optional[bool] = False

class AdminUpdateUser(BaseModel):
    target_role:  str
    target_id:    int
    full_name:    Optional[str] = None
    email:        Optional[str] = None
    department:   Optional[str] = None
    university:   Optional[str] = None
    faculty:      Optional[str] = None
    year:         Optional[str] = None
    status:       Optional[str] = None
    new_password: Optional[str] = None
    phone:        Optional[str] = None
    national_id:  Optional[str] = None

class RecommendRequest(BaseModel):
    user_id: int
    user_department: str
    num_recommendations: int = 5

class SimilarBooksRequest(BaseModel):
    book_id: int
    num_recommendations: int = 5

class ChatRequest(BaseModel):
    message: str

class BookReviewCreate(BaseModel):
    review_text: str
    rating: int

#  HEALTH
@app.get("/")
async def health(db=Depends(get_db)):
    await db.execute("SELECT COUNT(*) as cnt FROM books")
    cnt = (await db.fetchone())["cnt"]
    return {"status": "BiblioTech API running ✅", "books": cnt}

@app.get("/health")
def health2():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

#  IMAGE PROXY — serves external book covers with cache
import httpx as _httpx
from fastapi.responses import Response as _Response

_proxy_client = _httpx.AsyncClient(
    timeout=8,
    follow_redirects=True,
    headers={"User-Agent": "BiblioTech/1.0"},
    limits=_httpx.Limits(max_connections=40, max_keepalive_connections=20),
)

@app.get("/api/image-proxy")
async def image_proxy(url: str = Query(...)):
    """
    Proxies an external image URL and returns it with 24h cache headers.
    Eliminates CORS errors and lets the browser cache book covers aggressively.
    """
    if not url.startswith(("https://", "http://")):
        return _Response(status_code=400, content=b"Invalid URL")
    try:
        r = await _proxy_client.get(url)
        content_type = r.headers.get("content-type", "image/jpeg")
        return _Response(
            content=r.content,
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
                "X-Proxied-From": url[:80],
            },
        )
    except Exception:
        # Return a tiny 1×1 transparent PNG as fallback so <img> never breaks
        BLANK_PNG = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        return _Response(content=BLANK_PNG, media_type="image/png",
                         headers={"Cache-Control": "public, max-age=60"})


@app.get("/api/books")
async def get_all_books(
    dept: Optional[str] = Query(None),
    q:    Optional[str] = Query(None),
    page: int           = Query(0),
    size: int           = Query(0),
    db=Depends(get_db),
):
    where_clauses = []
    params = []

    if dept and dept != "All":
        where_clauses.append("genre = %s")
        params.append(dept)

    if q:
        where_clauses.append("(title LIKE %s OR author LIKE %s)")
        params.extend([f"%{q}%", f"%{q}%"])

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    await db.execute(f"SELECT COUNT(*) as cnt FROM books {where_sql}", tuple(params))
    total = (await db.fetchone())["cnt"]

    if size > 0:
        offset = page * size
        await db.execute(
            f"SELECT * FROM books {where_sql} ORDER BY id LIMIT %s OFFSET %s",
            tuple(params + [size, offset])
        )
    else:
        await db.execute(f"SELECT * FROM books {where_sql} ORDER BY id", tuple(params))

    rows = await db.fetchall()

    def row_to_book(row):
        bid   = row["id"]
        genre = row.get("genre") or "Reference"
        if row.get("image_local"):
            img = f"/api/book-cover/{row['image_local']}"
        else:
            img = row.get("image_url") or ""
        return {
            "id":           f"DB{bid:04d}",
            "book_id":      bid,
            "title":        row["title"],
            "author":       row.get("author") or "Unknown",
            "dept":         genre,
            "genre":        genre,
            "rating":       0,
            "borrows":      row.get("borrows_count") or 0,
            "available":    bool(row.get("available", 1)),
            "status":       "available" if row.get("available", 1) else "unavailable",
            "copies_total": row.get("copies_total") or 1,
            "copies_avail": row.get("copies_available") if row.get("copies_available") is not None else 0,
            "cover":        DEPT_COLORS.get(genre, DEFAULT_COLOR),
            "isNew":        False,
            "desc":         (row.get("description") or "")[:500],
            "description":  (row.get("description") or ""),
            "image_url":    img,
            "created_at":   str(row.get("created_at") or ""),
        }

    return {"total": total, "books": [row_to_book(r) for r in rows]}

#  AI & RECOMMENDATIONS
@app.post("/api/recommendations")
def recommendations(req: RecommendRequest):
    return get_smart_content_recommendations(
        user_id=req.user_id,
        user_department=req.user_department,
        num_recommendations=req.num_recommendations,
    )

@app.get("/api/students/{student_id}/ai-recommendations")
async def get_personalized_recommendations(student_id: int, db=Depends(get_db)):
    await db.execute("SELECT department FROM students WHERE id=%s", (student_id,))
    student = await db.fetchone()
    department = student["department"] if student and student["department"] else ""

    await db.execute("""
        SELECT b.title 
        FROM books b
        LEFT JOIN wishlist w ON b.id = w.book_id AND w.student_id = %s
        LEFT JOIN borrow_requests r ON b.id = r.book_id AND r.student_id = %s
        WHERE w.book_id IS NOT NULL OR r.book_id IS NOT NULL
    """, (student_id, student_id))
    
    user_history = await db.fetchall()
    liked_titles = [row["title"] for row in user_history]

    user_prefs = {
        "favorite_categories": [department] if department else [],
        "liked_books": liked_titles
    }

    try:
        recommendations = get_smart_content_recommendations(
            user_id=student_id, 
            user_department=department, 
            num_recommendations=6,
            user_prefs=user_prefs
        )
        return {"status": "success", "recommendations": recommendations}
    except Exception as e:
        print(f"AI Engine Error: {e}")
        return {"status": "fallback", "recommendations": []}

@app.post("/api/similar-books")
def similar_books(req: SimilarBooksRequest):
    return get_similar_books(book_id=req.book_id, num_recommendations=req.num_recommendations)

@app.post("/api/chat")
def chat(req: ChatRequest):
    result = chatbot_semantic_search(req.message)
    
    if not result["recommended_books"]:
        return {"bot_reply": result["bot_reply"], "recommended_books": []}
    
    bot_reply = generate_rag_response(req.message, result["recommended_books"])
    
    filtered_books = []
    for book in result["recommended_books"]:
        if book["title"] in bot_reply:
            filtered_books.append(book)
            
    return {"bot_reply": bot_reply, "recommended_books": filtered_books}

@app.get("/api/image-proxy")
def image_proxy(url: str = Query(...)):
    try:
        req = _ur.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with _ur.urlopen(req, timeout=8) as r:
            data = r.read()
            ct   = r.headers.get("content-type", "image/jpeg")
            if len(data) < 10000:
                return Response(status_code=204)
            return Response(content=data, media_type=ct)
    except:
        return Response(status_code=204)

#  AUTH & PROFILES
@app.post("/api/auth/student")
async def student_login(body: StudentLogin, db=Depends(get_db)):
    await db.execute("SELECT * FROM students WHERE email = %s", (body.email,))
    student = await db.fetchone()
    if not student or not check_password(body.password, student["password"]):
        raise HTTPException(401, "Invalid email or password")
    if student["status"] == "suspended":
        raise HTTPException(403, "Account suspended")
    token = create_token({"role":"student","id":student["id"],"lib_id":student["lib_id"]})
    return {
        "token": token,
        "user": {
            "id":          student["id"],
            "lib_id":      student["lib_id"],
            "name":        student["full_name"],
            "email":       student["email"],
            "dept":        student["department"] or "",
            "university":  student["university"] or "",
            "faculty":     student["faculty"] or "",
            "year":        student["year"] or "",
            "national_id": student["national_id"] or "",
            "status":      student["status"],
            "joined":      str(student["joined_at"]) if student["joined_at"] else "",
        }
    }

@app.post("/api/auth/admin")
async def admin_login(body: AdminLogin, db=Depends(get_db)):
    email = body.email.strip().lower()
    await db.execute("SELECT * FROM admins WHERE email = %s", (email,))
    admin = await db.fetchone()
    if not admin:
        raise HTTPException(401, "Wrong credentials")
    stored_pw = admin["password"] or ""
    if stored_pw.startswith("$2b$") or stored_pw.startswith("$2a$"):
        valid = check_password(body.password, stored_pw)
    else:
        valid = (body.password == stored_pw)
    if not valid:
        raise HTTPException(401, "Wrong credentials")
    db_role  = (admin.get("role") or "")
    is_super = (db_role == "super_admin") or (email == SUPER_ADMIN_EMAIL)
    token = create_token({"role":"admin","id":admin["id"],"email":email,"is_super":is_super})
    return {
        "token": token,
        "admin": {
            "id":          admin["id"],
            "full_name":   admin.get("full_name") or "",
            "name":        admin.get("full_name") or "",
            "email":       admin.get("email") or "",
            "phone":       admin.get("phone") or "",
            "national_id": admin.get("national_id") or "",
            "is_super":    is_super,
            "role":        "super_admin" if is_super else "admin",
        }
    }

class ResetPassword(BaseModel):
    email: str
    national_id: str
    new_password: str

@app.post("/api/auth/reset-password")
async def reset_password(body: ResetPassword, db=Depends(get_db)):
    await db.execute(
        "SELECT id FROM students WHERE email = %s AND national_id = %s",
        (body.email, body.national_id)
    )
    student = await db.fetchone()
    if not student:
        raise HTTPException(status_code=404, detail="البريد الإلكتروني أو الرقم القومي غير صحيح")
    hashed_password = hash_password(body.new_password)
    await db.execute("UPDATE students SET password = %s WHERE id = %s", (hashed_password, student["id"]))
    return {"message": "تم تغيير كلمة المرور بنجاح"}

class UpdateProfile(BaseModel):
    full_name:    Optional[str] = None
    email:        Optional[str] = None
    department:   Optional[str] = None
    university:   Optional[str] = None
    faculty:      Optional[str] = None
    year:         Optional[str] = None
    new_password: Optional[str] = None

@app.put("/api/students/update-profile")
async def update_profile(body: UpdateProfile, user=Depends(get_current_user), db=Depends(get_db)):
    await db.execute("SELECT faculty, university FROM students WHERE id=%s", (user["id"],))
    current = await db.fetchone()

    fields, params = [], []
    if body.full_name  is not None: fields.append("full_name=%s");  params.append(body.full_name.strip())
    if body.email      is not None: fields.append("email=%s");      params.append(body.email.strip().lower())
    if body.university is not None: fields.append("university=%s"); params.append(body.university.strip())
    if body.faculty    is not None: fields.append("faculty=%s");    params.append(body.faculty.strip())
    if body.department is not None: fields.append("department=%s"); params.append(body.department.strip())
    if body.year       is not None: fields.append("year=%s");       params.append(body.year.strip())

    if fields:
        params.append(user["id"])
        await db.execute(f"UPDATE students SET {', '.join(fields)} WHERE id=%s", tuple(params))

    if body.new_password and body.new_password.strip():
        hashed = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
        await db.execute("UPDATE students SET password=%s WHERE id=%s", (hashed, user["id"]))

    await db.connection.commit()
    await db.execute("SELECT * FROM students WHERE id=%s", (user["id"],))
    updated = await db.fetchone()
    return {
        "message": "تم تحديث البيانات بنجاح",
        "user": {
            "name":        updated["full_name"],
            "lib_id":      updated["lib_id"],
            "email":       updated["email"]        or "",
            "dept":        updated["department"]   or "",
            "university":  updated["university"]   or "",
            "faculty":     updated["faculty"]      or "",
            "year":        updated["year"]         or "",
            "national_id": updated["national_id"]  or "",
            "status":      updated["status"],
        }
    }

#  BOOK REVIEWS
@app.get("/api/books/{book_id}/reviews")
async def get_book_reviews(book_id: str, db=Depends(get_db)):
    await db.execute("""
        SELECT br.id, br.user_id, br.review_text, br.rating, br.created_at,
               COALESCE(s.full_name, 'Anonymous') AS user_name
        FROM book_reviews br
        LEFT JOIN students s ON s.id = br.user_id
        WHERE br.book_id = %s
        ORDER BY br.created_at DESC
    """, (book_id,))
    rows = await db.fetchall()
    return {"reviews": [{
        "id": r["id"],
        "user_id": r["user_id"],
        "user_name": r["user_name"],
        "review_text": r["review_text"],
        "rating": r["rating"],
        "created_at": r["created_at"].strftime("%d %b %Y, %I:%M %p") if r.get("created_at") else ""
    } for r in rows]}

@app.post("/api/books/{book_id}/reviews")
async def add_book_review(book_id: str, body: BookReviewCreate, user=Depends(get_current_user), db=Depends(get_db)):
    # Validate rating
    if body.rating < 1 or body.rating > 5:
        raise HTTPException(400, "Rating must be between 1 and 5")
    
    await db.execute(
        "INSERT INTO book_reviews (book_id, user_id, review_text, rating) VALUES (%s, %s, %s, %s)",
        (book_id, user["id"], body.review_text, body.rating)
    )
    return {"message": "Review added successfully", "status": "success"}

#  BORROW REQUESTS & WISHLIST & NOTIFICATIONS
@app.get("/api/requests")
async def get_all_requests(user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("""
        SELECT br.*, s.lib_id, s.full_name as student_name
        FROM borrow_requests br
        LEFT JOIN students s ON s.id = br.student_id
        ORDER BY br.requested_at DESC
    """)
    rows = await db.fetchall()
    return {"requests": [_fmt_request(r) for r in rows]}

@app.post("/api/requests")
async def create_request(body: BorrowRequestCreate, user=Depends(require_student), db=Depends(get_db)):
    book_num = int(str(body.book_id).replace("DB", ""))
    
    await db.execute("SELECT copies_available FROM books WHERE id=%s", (book_num,))
    book_record = await db.fetchone()
    
    if not book_record:
        raise HTTPException(404, "الكتاب غير موجود في قاعدة البيانات")
        
    if book_record["copies_available"] <= 0:
        raise HTTPException(400, "عذراً، لا توجد نسخ متاحة من هذا الكتاب حالياً لطلبها.")

    await db.execute(
        "SELECT id FROM borrow_requests WHERE student_id=%s AND book_id=%s AND status IN ('pending','approved')", 
        (user["id"], body.book_id)
    )
    if await db.fetchone():
        raise HTTPException(409, "Request already exists")
        
    await db.execute(
        "INSERT INTO borrow_requests (student_id,book_id,book_title,book_author,book_dept) VALUES (%s,%s,%s,%s,%s)", 
        (user["id"], body.book_id, body.book_title, body.book_author, body.book_dept)
    )
    req_id = db.lastrowid
    
    await db.execute(
        "INSERT INTO notifications (student_id,type,title,message,book_id) VALUES (%s,'info','Request Sent',%s,%s)", 
        (user["id"], f'Your borrow request for "{body.book_title}" has been sent.', body.book_id)
    )
    
    await db.execute(
        "UPDATE books SET copies_available = GREATEST(0, copies_available - 1) WHERE id=%s", 
        (book_num,)
    )
    
    return {"id": req_id, "status": "pending"}
@app.get("/api/requests/my")
async def my_requests(user=Depends(require_student), db=Depends(get_db)):
    await db.execute("SELECT * FROM borrow_requests WHERE student_id=%s ORDER BY requested_at DESC", (user["id"],))
    rows = await db.fetchall()
    return {"requests": [_fmt_request(r) for r in rows]}

@app.patch("/api/requests/{req_id}/approve")
async def approve_request(req_id: int, user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("SELECT * FROM borrow_requests WHERE id=%s", (req_id,))
    req = await db.fetchone()
    if not req: raise HTTPException(404, "Not found")
    due_date = (datetime.now() + timedelta(days=14)).date()
    await db.execute("UPDATE borrow_requests SET status='approved',approved_at=NOW(),due_date=%s,admin_id=%s WHERE id=%s", (due_date, user["id"], req_id))
    await db.execute("INSERT INTO notifications (student_id,type,title,message,book_id) VALUES (%s,'approved','Request Approved',%s,%s)", (req["student_id"], f'Your request for "{req["book_title"]}" was approved. Return by {due_date.strftime("%d %b %Y")}.', req["book_id"]))
    return {"status": "approved", "due_date": str(due_date)}

@app.patch("/api/requests/{req_id}/reject")
async def reject_request(req_id: int, user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("SELECT * FROM borrow_requests WHERE id=%s", (req_id,))
    req = await db.fetchone()
    if not req: raise HTTPException(404, "Not found")
    await db.execute("UPDATE borrow_requests SET status='rejected',admin_id=%s WHERE id=%s", (user["id"], req_id))
    await db.execute("INSERT INTO notifications (student_id,type,title,message,book_id) VALUES (%s,'rejected','Request Not Approved',%s,%s)", (req["student_id"], f'Your request for "{req["book_title"]}" was not approved this time.', req["book_id"]))
    
    book_num = int(str(req["book_id"]).replace("DB", ""))
    await db.execute("UPDATE books SET copies_available = LEAST(copies_total, copies_available + 1) WHERE id=%s", (book_num,))
    
    return {"status": "rejected"}

@app.patch("/api/requests/{req_id}/return")
async def mark_returned(req_id: int, user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("SELECT * FROM borrow_requests WHERE id=%s", (req_id,))
    req = await db.fetchone()
    if not req: raise HTTPException(404, "Not found")
    await db.execute("UPDATE borrow_requests SET status='returned',returned_at=NOW() WHERE id=%s", (req_id,))
    await db.execute("INSERT INTO notifications (student_id,type,title,message,book_id) VALUES (%s,'returned','Book Returned',%s,%s)", (req["student_id"], f'"{req["book_title"]}" has been marked as returned. Thank you!', req["book_id"]))
    
    book_num = int(str(req["book_id"]).replace("DB", ""))
    await db.execute("UPDATE books SET copies_available = LEAST(copies_total, copies_available + 1) WHERE id=%s", (book_num,))
    
    return {"status": "returned"}

def _fmt_request(r: dict) -> dict:
    return {
        "id":           r["id"],
        "bid":          r["book_id"],
        "bTitle":       r["book_title"],
        "bAuthor":      r["book_author"],
        "bDept":        r.get("book_dept",""),
        "status":       r["status"],
        "sid":          r.get("lib_id",""),
        "sName":        r.get("student_name",""),
        "reqDate":      r["requested_at"].strftime("%d %b %Y") if r.get("requested_at") else "",
        "dueDate":      r["due_date"].strftime("%d %b %Y") if r.get("due_date") else None,
        "dueDateISO":   str(r["due_date"]) if r.get("due_date") else None,
        "returnDate":   r["returned_at"].strftime("%d %b %Y") if r.get("returned_at") else None,
        "approvedDate": r["approved_at"].strftime("%d %b %Y") if r.get("approved_at") else None,
    }

@app.get("/api/notifications")
async def get_notifications(user=Depends(require_student), db=Depends(get_db)):
    await db.execute("SELECT * FROM notifications WHERE student_id=%s ORDER BY created_at DESC LIMIT 50", (user["id"],))
    rows = await db.fetchall()
    return {"notifications": [_fmt_notif(n) for n in rows]}

@app.patch("/api/notifications/mark-read")
async def mark_read(body: NotifMarkRead, user=Depends(require_student), db=Depends(get_db)):
    if body.ids:
        fmt = ",".join(["%s"] * len(body.ids))
        await db.execute(f"UPDATE notifications SET is_read=1 WHERE student_id=%s AND id IN ({fmt})", (user["id"], *body.ids))
    else:
        await db.execute("UPDATE notifications SET is_read=1 WHERE student_id=%s", (user["id"],))
    return {"ok": True}

def _fmt_notif(n: dict) -> dict:
    return {"id": n["id"], "type": n["type"], "title": n["title"], "msg": n["message"], "bid": n.get("book_id"), "date": n["created_at"].strftime("%d %b %Y") if n.get("created_at") else "", "read": bool(n["is_read"])}

@app.get("/api/announcements")
async def get_announcements(db=Depends(get_db)):
    await db.execute("SELECT * FROM announcements ORDER BY created_at DESC")
    rows = await db.fetchall()
    return {"announcements": [_fmt_ann(a) for a in rows]}

@app.post("/api/announcements")
async def post_announcement(body: AnnCreate, user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("INSERT INTO announcements (admin_id,title,body,priority) VALUES (%s,%s,%s,%s)", (user["id"], body.title, body.body, body.priority))
    return {"id": db.lastrowid}

@app.delete("/api/announcements/{ann_id}")
async def delete_announcement(ann_id: int, user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("DELETE FROM announcements WHERE id=%s", (ann_id,))
    return {"ok": True}

def _fmt_ann(a: dict) -> dict:
    dt = a["created_at"]
    return {"id": a["id"], "title": a["title"], "body": a["body"], "priority": a["priority"], "date": dt.strftime("%d %b %Y") if dt else "", "time": dt.strftime("%H:%M") if dt else ""}

@app.get("/api/wishlist")
async def get_wishlist(user=Depends(require_student), db=Depends(get_db)):
    await db.execute("SELECT book_id FROM wishlist WHERE student_id=%s", (user["id"],))
    return {"wishlist": [r["book_id"] for r in await db.fetchall()]}

@app.post("/api/wishlist/toggle")
async def toggle_wishlist(body: WishlistToggle, user=Depends(require_student), db=Depends(get_db)):
    await db.execute("SELECT id FROM wishlist WHERE student_id=%s AND book_id=%s", (user["id"], body.book_id))
    if await db.fetchone():
        await db.execute("DELETE FROM wishlist WHERE student_id=%s AND book_id=%s", (user["id"], body.book_id))
        return {"action": "removed"}
    await db.execute("INSERT INTO wishlist (student_id,book_id) VALUES (%s,%s)", (user["id"], body.book_id))
    return {"action": "added"}

#  ADMIN (USERS & STATS)
@app.get("/api/students")
async def get_students(user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("""SELECT s.*, COUNT(CASE WHEN br.status='approved' AND br.returned_at IS NULL THEN 1 END) as active_loans, COUNT(CASE WHEN br.status='pending' THEN 1 END) as pending_requests FROM students s LEFT JOIN borrow_requests br ON br.student_id=s.id GROUP BY s.id ORDER BY s.created_at DESC""")
    rows = await db.fetchall()
    colors = ["#6366f1","#0d9488","#f97316","#8b5cf6","#3b82f6","#ec4899","#f59e0b"]
    return {"students": [{"id": r["id"], "libId": r["lib_id"], "name": r["full_name"], "email": r["email"], "dept": r["department"] or "", "university": r["university"] or "", "faculty": r["faculty"] or "", "year": r["year"] or "", "national_id": r["national_id"] or "", "status": r["status"], "joined": r["joined_at"].strftime("%b %Y") if r.get("joined_at") else "", "activeLoans": r["active_loans"], "pendingRequests": r["pending_requests"], "color": colors[r["id"] % len(colors)]} for r in rows]}

@app.get("/api/stats")
async def get_stats(user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("SELECT COUNT(*) as cnt FROM students WHERE status='active'")
    students = (await db.fetchone())["cnt"]
    await db.execute("SELECT COUNT(*) as cnt FROM borrow_requests WHERE status='approved' AND returned_at IS NULL")
    active_loans = (await db.fetchone())["cnt"]
    await db.execute("SELECT COUNT(*) as cnt FROM borrow_requests WHERE status='pending'")
    pending = (await db.fetchone())["cnt"]
    await db.execute("SELECT MIN(DATE_FORMAT(requested_at,'%b')) as m, COUNT(*) as borrows, SUM(CASE WHEN status='returned' THEN 1 ELSE 0 END) as returns FROM borrow_requests WHERE requested_at >= DATE_SUB(NOW(), INTERVAL 7 MONTH) GROUP BY DATE_FORMAT(requested_at,'%Y-%m') ORDER BY MIN(requested_at)")
    monthly = await db.fetchall()
    return {"students": students, "activeLoans": active_loans, "pending": pending, "monthly": [{"m":r["m"],"borrows":r["borrows"],"returns":r["returns"] or 0} for r in monthly]}

@app.get("/api/admin/admins")
async def get_admins(user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("SELECT * FROM admins ORDER BY id")
    rows = await db.fetchall()
    colors = ["#6366f1","#0d9488","#f97316","#8b5cf6","#3b82f6","#ec4899","#f59e0b"]
    return {"admins": [{"id": r["id"], "full_name": r.get("full_name") or "", "name": r.get("full_name") or "", "email": r.get("email") or "", "phone": r.get("phone") or "", "national_id": r.get("national_id") or "", "role": r.get("role") or "admin", "is_super": (r.get("role") == "super_admin") or ((r.get("email") or "").lower() == SUPER_ADMIN_EMAIL), "joined": r["created_at"].strftime("%d %b %Y") if r.get("created_at") else "", "color": colors[r["id"] % len(colors)]} for r in rows]}

@app.post("/api/admin/create-user", status_code=201)
async def admin_create_user(body: CreateUserBody, user=Depends(require_admin), db=Depends(get_db)):
    import re
    from datetime import date as _date
    from services.email_service import send_welcome_email

    if not body.full_name.strip() or not body.email.strip() or not body.password: raise HTTPException(422, "All required fields must be filled")
    if len(body.password) < 6: raise HTTPException(422, "Password must be at least 6 characters")
    hashed = hash_password(body.password)
    email  = body.email.strip().lower()

    if body.role == "student":
        if not body.national_id or not re.fullmatch(r"\d{14}", body.national_id.strip()): raise HTTPException(422, "National ID must be exactly 14 digits")
        await db.execute("SELECT id FROM students WHERE email=%s", (email,))
        if await db.fetchone(): raise HTTPException(409, "Email already registered")
        await db.execute("SELECT id FROM students WHERE national_id=%s", (body.national_id.strip(),))
        if await db.fetchone(): raise HTTPException(409, "National ID already registered")

        await db.execute("SELECT lib_id FROM students ORDER BY id DESC LIMIT 1")
        row = await db.fetchone()
        try:    last_num = int(row["lib_id"].split("-")[1]) + 1 if row else 10001
        except: last_num = 10001
        lib_id = f"LIB-{last_num}"

        fac, univ = (body.faculty or "").strip(), (body.university or "").strip()
        dept = (body.department or "").strip() # يتم أخذ القسم كما هو من الـ request
        await db.execute("INSERT INTO students (lib_id,full_name,email,password,national_id,department,faculty,university,year,status,joined_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,'active',%s)", (lib_id, body.full_name.strip(), email, hashed, body.national_id.strip(), dept, fac, univ, body.year or "", _date.today()))
        threading.Thread(target=send_welcome_email, args=(email, body.full_name.strip(), lib_id), daemon=True).start()
        return {"message": "Student created successfully", "lib_id": lib_id}
    elif body.role == "admin":
        if not user.get("is_super"): raise HTTPException(403, "Only the super admin can create admin accounts")
        await db.execute("SELECT id FROM admins WHERE email=%s", (email,))
        if await db.fetchone(): raise HTTPException(409, "Email already registered")
        admin_role = "super_admin" if body.is_super else "admin"
        await db.execute("INSERT INTO admins (full_name, email, password, phone, national_id, role) VALUES (%s,%s,%s,%s,%s,%s)", (body.full_name.strip(), email, hashed, (body.phone or "").strip(), (body.national_id or "").strip(), admin_role))
        return {"message": "Admin created successfully", "id": db.lastrowid, "role": admin_role}
    else: raise HTTPException(422, "role must be 'student' or 'admin'")

@app.put("/api/admin/update-user")
async def admin_update_user(body: AdminUpdateUser, admin=Depends(require_admin), db=Depends(get_db)):
    from services.email_service import send_profile_update_email, send_password_changed_email
    changed_fields = []

    if body.target_role == "student":
        await db.execute("SELECT full_name, email, faculty, university FROM students WHERE id=%s", (body.target_id,))
        student = await db.fetchone()
        if not student: raise HTTPException(404, "Student not found")

        fields, params = [], []
        if body.full_name  is not None: fields.append("full_name=%s");  params.append(body.full_name.strip());  changed_fields.append("Full Name")
        if body.email      is not None: fields.append("email=%s");      params.append(body.email.strip().lower()); changed_fields.append("Email")
        if body.university is not None: fields.append("university=%s"); params.append(body.university.strip()); changed_fields.append("University")
        if body.faculty    is not None: fields.append("faculty=%s");    params.append(body.faculty.strip());    changed_fields.append("Faculty")
        if body.year       is not None: fields.append("year=%s");       params.append(body.year.strip());       changed_fields.append("Academic Year")
        if body.status     is not None: fields.append("status=%s");     params.append(body.status);             changed_fields.append("Account Status")
        if body.department is not None: fields.append("department=%s"); params.append(body.department.strip()); changed_fields.append("Department")

        if fields:
            params.append(body.target_id)
            await db.execute(f"UPDATE students SET {', '.join(fields)} WHERE id=%s", tuple(params))

        if body.new_password and body.new_password.strip():
            if not admin.get("is_super"): raise HTTPException(403, "Only the super admin can change passwords")
            if len(body.new_password.strip()) < 6: raise HTTPException(422, "Password must be at least 6 characters")
            await db.execute("UPDATE students SET password=%s WHERE id=%s", (hash_password(body.new_password), body.target_id))
            changed_fields.append("Password")

        await db.execute("SELECT full_name, email FROM students WHERE id=%s", (body.target_id,))
        updated = await db.fetchone()

    elif body.target_role == "admin":
        await db.execute("SELECT full_name, email FROM admins WHERE id=%s", (body.target_id,))
        if not await db.fetchone(): raise HTTPException(404, "Admin not found")

        fields, params = [], []
        if body.full_name    is not None: fields.append("full_name=%s");    params.append(body.full_name.strip());         changed_fields.append("Full Name")
        if body.email       is not None: fields.append("email=%s");       params.append(body.email.strip().lower());    changed_fields.append("Email")
        if body.phone       is not None: fields.append("phone=%s");       params.append(body.phone.strip());            changed_fields.append("Phone")
        if body.national_id is not None: fields.append("national_id=%s"); params.append(body.national_id.strip());     changed_fields.append("National ID")
        if fields:
            params.append(body.target_id)
            await db.execute(f"UPDATE admins SET {', '.join(fields)} WHERE id=%s", tuple(params))
        if body.new_password and body.new_password.strip():
            if not admin.get("is_super"): raise HTTPException(403, "Only the super admin can change passwords")
            if len(body.new_password.strip()) < 6: raise HTTPException(422, "Password must be at least 6 characters")
            await db.execute("UPDATE admins SET password=%s WHERE id=%s", (hash_password(body.new_password), body.target_id))
            changed_fields.append("Password")
        await db.execute("SELECT full_name, email FROM admins WHERE id=%s", (body.target_id,))
        updated = await db.fetchone()
    else: raise HTTPException(422, "target_role must be 'student' or 'admin'")

    notify_email, notify_name = updated["email"], updated["full_name"]
    if changed_fields and notify_email:
        info = [f for f in changed_fields if f != "Password"]
        if info: threading.Thread(target=send_profile_update_email, args=(notify_email, notify_name, info), daemon=True).start()
        if "Password" in changed_fields: threading.Thread(target=send_password_changed_email, args=(notify_email, notify_name), daemon=True).start()
    return {"message": "User updated successfully", "changed": changed_fields}

class AdminProfileUpdate(BaseModel):
    full_name:    Optional[str] = None
    email:        Optional[str] = None
    phone:        Optional[str] = None
    national_id:  Optional[str] = None
    new_password: Optional[str] = None

@app.get("/api/admin/profile")
async def get_admin_profile(user=Depends(require_admin), db=Depends(get_db)):
    await db.execute("SELECT * FROM admins WHERE id=%s", (user["id"],))
    row = await db.fetchone()
    if not row: raise HTTPException(404, "Admin not found")
    is_super = (row.get("role") == "super_admin") or ((row["email"] or "").lower() == SUPER_ADMIN_EMAIL)
    return {"id": row["id"], "full_name": row["full_name"] or "", "email": row["email"] or "", "phone": row.get("phone") or "", "national_id": row.get("national_id") or "", "role": "super_admin" if is_super else "admin", "is_super": is_super, "joined": row["created_at"].strftime("%d %b %Y") if row.get("created_at") else ""}

@app.put("/api/admin/profile")
async def update_admin_profile(body: AdminProfileUpdate, user=Depends(require_admin), db=Depends(get_db)):
    from services.email_service import send_profile_update_email, send_password_changed_email
    fields, params, changed = [], [], []
    if body.full_name   is not None and body.full_name.strip(): fields.append("full_name=%s");   params.append(body.full_name.strip());      changed.append("Full Name")
    if body.email       is not None and body.email.strip():
        new_email = body.email.strip().lower()
        await db.execute("SELECT id FROM admins WHERE email=%s AND id!=%s", (new_email, user["id"]))
        if await db.fetchone(): raise HTTPException(409, "Email already in use")
        fields.append("email=%s"); params.append(new_email); changed.append("Email")
    if body.phone       is not None: fields.append("phone=%s");       params.append(body.phone.strip());           changed.append("Phone")
    if body.national_id is not None: fields.append("national_id=%s"); params.append(body.national_id.strip());    changed.append("National ID")
    
    if fields:
        params.append(user["id"])
        await db.execute(f"UPDATE admins SET {', '.join(fields)} WHERE id=%s", tuple(params))
    
    pw_changed = False
    if body.new_password and body.new_password.strip():
        if len(body.new_password.strip()) < 6: raise HTTPException(422, "Password must be at least 6 characters")
        await db.execute("UPDATE admins SET password=%s WHERE id=%s", (hash_password(body.new_password), user["id"]))
        pw_changed = True
        changed.append("Password")
        
    await db.execute("SELECT full_name, email FROM admins WHERE id=%s", (user["id"],))
    updated = await db.fetchone()
    if updated and updated["email"]:
        info = [f for f in changed if f != "Password"]
        if info: threading.Thread(target=send_profile_update_email, args=(updated["email"], updated["full_name"] or "Admin", info), daemon=True).start()
        if pw_changed: threading.Thread(target=send_password_changed_email, args=(updated["email"], updated["full_name"] or "Admin"), daemon=True).start()
    return {"message": "Profile updated successfully", "changed": changed}

@app.delete("/api/admin/delete-user/{role}/{user_id}", status_code=200)
async def admin_delete_user(role: str, user_id: int, admin=Depends(require_admin), db=Depends(get_db)):
    from services.email_service import _send, _base_template
    from datetime import datetime as _dt

    if role == "student":
        await db.execute("SELECT full_name, email FROM students WHERE id=%s", (user_id,))
        target = await db.fetchone()
        if not target: raise HTTPException(404, "Student not found")
        await db.execute("DELETE FROM wishlist WHERE student_id=%s", (user_id,))
        await db.execute("DELETE FROM notifications WHERE student_id=%s", (user_id,))
        await db.execute("DELETE FROM borrow_requests WHERE student_id=%s", (user_id,))
        await db.execute("DELETE FROM students WHERE id=%s", (user_id,))
    elif role == "admin":
        if not admin.get("is_super"): raise HTTPException(403, "Only the super admin can delete admin accounts")
        if user_id == admin["id"]: raise HTTPException(400, "You cannot delete your own account")
        await db.execute("SELECT full_name, email FROM admins WHERE id=%s", (user_id,))
        target = await db.fetchone()
        if not target: raise HTTPException(404, "Admin not found")
        await db.execute("DELETE FROM admins WHERE id=%s", (user_id,))
    else: raise HTTPException(422, "role must be 'student' or 'admin'")

    def _send_deletion_email():
        try:
            now = _dt.now().strftime("%d %b %Y at %H:%M")
            content = f'<h2 style="color:#f0eef9;font-size:20px;font-weight:700;margin:0 0 8px;">Account Deleted</h2><p style="color:#8b9ab0;font-size:14px;margin:0 0 24px;">Hi <strong style="color:#f0eef9;">{target["full_name"]}</strong>, your BiblioTech account has been removed.</p><div style="background:#1a0800;border:1px solid rgba(239,68,68,0.25);border-radius:14px;padding:22px;text-align:center;margin-bottom:24px;"><div style="font-size:36px;margin-bottom:10px;">🗑️</div><p style="color:#ef4444;font-size:13px;font-weight:600;margin:0 0 6px;">Account permanently removed</p><p style="color:#3d4a5c;font-size:12px;margin:0;">{now}</p></div><p style="color:#3d4a5c;font-size:12px;text-align:center;">If you believe this was a mistake, please contact library support.</p>'
            _send(target["email"], "🗑️ BiblioTech — Your Account Has Been Removed", _base_template(content))
        except Exception: pass
    threading.Thread(target=_send_deletion_email, daemon=True).start()
    return {"message": f"{role.capitalize()} account deleted successfully", "deleted_id": user_id}