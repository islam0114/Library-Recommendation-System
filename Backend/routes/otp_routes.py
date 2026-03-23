"""
otp_routes.py — BiblioTech
===========================
Endpoints الـ OTP لإعادة تعيين كلمة المرور
أضفها في main.py هكذا:

    from otp_routes import make_otp_router
    # داخل startup() بعد ما يتعمل pool:
    app.include_router(make_otp_router(get_db))
"""

import random, threading
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.email_service import send_otp_email, send_password_changed_email
import bcrypt

# ── In-memory OTP store: { email: {code, expires_at} } ──
# في الـ production استبدلها بـ Redis أو جدول في الداتابيز
import time
_OTP_STORE: dict[str, dict] = {}

# ── Schemas ────────────────────────────────────────────
class RequestOtpBody(BaseModel):
    email: str

class VerifyOtpBody(BaseModel):
    email: str
    code: str
    new_password: str


def make_otp_router(get_db_dep):
    r = APIRouter()

    # ── POST /api/auth/request-otp ──────────────────────
    @r.post("/api/auth/request-otp")
    async def request_otp(body: RequestOtpBody, db=Depends(get_db_dep)):
        email = body.email.strip().lower()

        # تحقق إن الإيميل موجود في الداتابيز
        await db.execute(
            "SELECT id, full_name FROM students WHERE email = %s", (email,)
        )
        student = await db.fetchone()
        if not student:
            raise HTTPException(404, "لا يوجد حساب مرتبط بهذا البريد الإلكتروني")

        # توليد كود 6 أرقام
        code = str(random.randint(100000, 999999))
        _OTP_STORE[email] = {
            "code": code,
            "expires_at": time.time() + 600,  # 10 دقائق
            "student_id": student["id"],
        }

        # إرسال الإيميل في background thread
        threading.Thread(
            target=send_otp_email,
            args=(email, student["full_name"], code),
            daemon=True,
        ).start()

        return {"message": "تم إرسال الكود إلى بريدك الإلكتروني"}

    # ── POST /api/auth/verify-otp ───────────────────────
    @r.post("/api/auth/verify-otp")
    async def verify_otp(body: VerifyOtpBody, db=Depends(get_db_dep)):
        email = body.email.strip().lower()

        entry = _OTP_STORE.get(email)
        if not entry:
            raise HTTPException(400, "لم يتم طلب كود لهذا البريد، أرسل الكود أولاً")

        if time.time() > entry["expires_at"]:
            _OTP_STORE.pop(email, None)
            raise HTTPException(410, "انتهت صلاحية الكود، اطلب كوداً جديداً")

        if entry["code"] != body.code.strip():
            raise HTTPException(400, "الكود غير صحيح")

        if len(body.new_password) < 6:
            raise HTTPException(422, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")

        # تحديث كلمة المرور
        hashed = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
        await db.execute(
            "UPDATE students SET password = %s WHERE id = %s",
            (hashed, entry["student_id"])
        )

        # حذف الكود بعد الاستخدام
        _OTP_STORE.pop(email, None)

        # إرسال إيميل تأكيد تغيير الباسورد
        await db.execute(
            "SELECT full_name FROM students WHERE id = %s", (entry["student_id"],)
        )
        student = await db.fetchone()
        if student:
            threading.Thread(
                target=send_password_changed_email,
                args=(email, student["full_name"]),
                daemon=True,
            ).start()

        return {"message": "تم تغيير كلمة المرور بنجاح"}

    return r
