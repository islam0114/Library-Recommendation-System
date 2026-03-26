"""
otp_routes.py — BiblioTech
==========================================================
OTP Endpoints for Password Reset functionality.
Include this in main.py as follows:

    from otp_routes import make_otp_router
    # Inside startup() after initializing the database pool:
    app.include_router(make_otp_router(get_db))
==========================================================
"""

import random
import threading
import time
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.email_service import send_otp_email, send_password_changed_email
import bcrypt

# ── In-memory OTP store: { email: {code, expires_at, student_id} } ──
# Note: For production environments, it is highly recommended to replace this 
# with Redis or a dedicated database table for better persistence and scalability.
_OTP_STORE: dict[str, dict] = {}

# --- Pydantic Models ---
class RequestOtpBody(BaseModel):
    email: str

class VerifyOtpBody(BaseModel):
    email: str
    code: str
    new_password: str

def make_otp_router(get_db_dep):
    r = APIRouter()

    @r.post("/api/auth/request-otp")
    async def request_otp(body: RequestOtpBody, db=Depends(get_db_dep)):
        """
        Generates a 6-digit OTP for password reset and sends it via email.
        """
        email = body.email.strip().lower()

        # Verify if the email exists in the database
        await db.execute(
            "SELECT id, full_name FROM students WHERE email = %s", (email,)
        )
        student = await db.fetchone()
        
        if not student:
            raise HTTPException(404, "لا يوجد حساب مرتبط بهذا البريد الإلكتروني")

        # Generate a 6-digit OTP code
        code = str(random.randint(100000, 999999))
        
        # Store OTP data with a 10-minute expiration time
        _OTP_STORE[email] = {
            "code": code,
            "expires_at": time.time() + 600,  # 600 seconds = 10 minutes
            "student_id": student["id"],
        }

        # Send the OTP email asynchronously in a background thread to avoid blocking
        threading.Thread(
            target=send_otp_email,
            args=(email, student["full_name"], code),
            daemon=True,
        ).start()

        return {"message": "تم إرسال الكود إلى بريدك الإلكتروني"}


    @r.post("/api/auth/verify-otp")
    async def verify_otp(body: VerifyOtpBody, db=Depends(get_db_dep)):
        """
        Verifies the provided OTP code and updates the user's password if valid.
        """
        email = body.email.strip().lower()

        # Check if an OTP was requested for this email
        entry = _OTP_STORE.get(email)
        if not entry:
            raise HTTPException(400, "لم يتم طلب كود لهذا البريد، أرسل الكود أولاً")

        # Check if the OTP has expired
        if time.time() > entry["expires_at"]:
            _OTP_STORE.pop(email, None)
            raise HTTPException(410, "انتهت صلاحية الكود، اطلب كوداً جديداً")

        # Validate the provided OTP code
        if entry["code"] != body.code.strip():
            raise HTTPException(400, "الكود غير صحيح")

        # Validate password length
        if len(body.new_password) < 6:
            raise HTTPException(422, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")

        # Hash the new password and update the database
        hashed = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
        await db.execute(
            "UPDATE students SET password = %s WHERE id = %s",
            (hashed, entry["student_id"])
        )

        # Remove the OTP entry from memory after successful use
        _OTP_STORE.pop(email, None)

        # Fetch user details to send a success confirmation email
        await db.execute(
            "SELECT full_name FROM students WHERE id = %s", (entry["student_id"],)
        )
        student = await db.fetchone()
        
        # Send password change confirmation email asynchronously
        if student:
            threading.Thread(
                target=send_password_changed_email,
                args=(email, student["full_name"]),
                daemon=True,
            ).start()

        return {"message": "تم تغيير كلمة المرور بنجاح"}

    return r