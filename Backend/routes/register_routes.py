"""
register_routes.py — BiblioTech
==========================================================
Handles new student registration, input validation, 
and Library ID (LIB-ID) generation.
==========================================================
"""

import re
import threading
from datetime import date
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import bcrypt

# Attempt to import the email service; fallback gracefully if unavailable
try:
    from services.email_service import send_welcome_email
except ImportError:
    send_welcome_email = None

def hash_password(plain: str) -> str:
    """Hashes a plain text password using bcrypt."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

# --- Pydantic Models ---
class RegisterStudent(BaseModel):
    full_name: str
    email: str
    password: str
    national_id: str
    university: str
    faculty: str
    department: str  # Explicitly capturing the student's department
    year: str

def make_register_router(get_db):
    router = APIRouter()

    @router.post("/api/register")
    async def register_student(body: RegisterStudent, db=Depends(get_db)):
        """
        Registers a new student, validates input, generates a unique Library ID (LIB-ID),
        and triggers an asynchronous welcome email.
        """
        # 1. Input Validation
        if not body.full_name.strip() or not body.email.strip() or not body.password:
            raise HTTPException(422, "جميع الحقول المطلوبة يجب ملؤها")
            
        if len(body.password) < 6:
            raise HTTPException(422, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
            
        if not body.national_id or not re.fullmatch(r"\d{14}", body.national_id.strip()):
            raise HTTPException(422, "الرقم القومي يجب أن يكون 14 رقماً بالضبط")

        email = body.email.strip().lower()

        # 2. Check for duplicate email
        await db.execute("SELECT id FROM students WHERE email=%s", (email,))
        if await db.fetchone():
            raise HTTPException(409, "البريد الإلكتروني مسجل بالفعل")

        # 3. Check for duplicate National ID
        await db.execute("SELECT id FROM students WHERE national_id=%s", (body.national_id.strip(),))
        if await db.fetchone():
            raise HTTPException(409, "الرقم القومي مسجل بالفعل")

        # 4. Generate Library ID (LIB-ID) sequentially
        await db.execute("SELECT lib_id FROM students ORDER BY id DESC LIMIT 1")
        row = await db.fetchone()
        try:
            last_num = int(row["lib_id"].split("-")[1]) + 1 if row else 10001
        except Exception:
            last_num = 10001
            
        lib_id = f"LIB-{last_num}"
        hashed = hash_password(body.password)
        
        # 5. Insert new student record into the database
        await db.execute(
            """
            INSERT INTO students 
            (lib_id, full_name, email, password, national_id, department, faculty, university, year, status, joined_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'active', %s)
            """,
            (
                lib_id, 
                body.full_name.strip(), 
                email, 
                hashed, 
                body.national_id.strip(), 
                body.department.strip(), # Properly mapping the department field
                body.faculty.strip(), 
                body.university.strip(), 
                body.year.strip(), 
                date.today()
            )
        )

        # 6. Send welcome email asynchronously
        if send_welcome_email:
            threading.Thread(
                target=send_welcome_email, 
                args=(email, body.full_name.strip(), lib_id), 
                daemon=True
            ).start()

        return {"message": "تم إنشاء الحساب بنجاح", "lib_id": lib_id}

    return router