"""
email_service.py — BiblioTech
==============================
إرسال إيميلات حقيقية عبر SMTP (Gmail / Outlook / أي provider)

متطلبات .env (في نفس مجلد Backend):
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_app_password   ← Gmail: App Password مش الباسورد الأصلي
    SMTP_FROM_NAME=BiblioTech Library

ملاحظة Gmail: لازم تفعّل "2-Step Verification" وتعمل App Password من:
    https://myaccount.google.com/apppasswords
"""

import smtplib, ssl, os
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from dotenv import load_dotenv

# ── تحميل .env بشكل صريح ────────────────────────────────
# بيدور على .env في Backend/ أو في نفس المجلد أو parent
_here = Path(__file__).resolve().parent
for _candidate in [
    _here / ".env",
    _here.parent / "Backend" / ".env",
    _here.parent / ".env",
]:
    if _candidate.exists():
        load_dotenv(dotenv_path=_candidate, override=True)
        print(f"✅ email_service: loaded .env from {_candidate}")
        break

# ── Config من .env ────────────────────────────────────────
SMTP_HOST      = os.getenv("SMTP_HOST",      "smtp.gmail.com")
SMTP_PORT      = int(os.getenv("SMTP_PORT",  "587"))
SMTP_USER      = os.getenv("SMTP_USER",      "")
SMTP_PASS      = os.getenv("SMTP_PASS",      "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "BiblioTech Library")


# ══════════════════════════════════════════════════════════
#  CORE — إرسال إيميل HTML
# ══════════════════════════════════════════════════════════
def _send(to_email: str, subject: str, html_body: str) -> None:
    """يرسل إيميل HTML — بيعمل raise لو فشل."""
    if not SMTP_USER or not SMTP_PASS:
        raise RuntimeError(
            "SMTP credentials not set!\n"
            "تأكد إن SMTP_USER و SMTP_PASS موجودين في .env\n"
            f"SMTP_USER = '{SMTP_USER}'\n"
            f"SMTP_HOST = '{SMTP_HOST}:{SMTP_PORT}'"
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{SMTP_FROM_NAME} <{SMTP_USER}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    ctx = ssl.create_default_context()
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls(context=ctx)
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
        print(f"✅ Email sent to {to_email} — {subject}")
    except smtplib.SMTPAuthenticationError:
        raise RuntimeError(
            "SMTP Authentication failed!\n"
            "لو بتستخدم Gmail:\n"
            "  1. فعّل 2-Step Verification\n"
            "  2. اعمل App Password من: myaccount.google.com/apppasswords\n"
            "  3. حط الـ App Password في SMTP_PASS (مش الباسورد الأصلي)"
        )
    except smtplib.SMTPConnectError as e:
        raise RuntimeError(f"Cannot connect to SMTP server {SMTP_HOST}:{SMTP_PORT} — {e}")
    except Exception as e:
        raise RuntimeError(f"Email send failed: {type(e).__name__}: {e}")


# ══════════════════════════════════════════════════════════
#  TEMPLATES
# ══════════════════════════════════════════════════════════
def _base_template(content_html: str) -> str:
    """Wrapper HTML بتصميم BiblioTech."""
    year = datetime.now().year
    return f"""<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>BiblioTech</title>
</head>
<body style="margin:0;padding:0;background:#07090f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07090f;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <div style="width:40px;height:40px;background:rgba(0,0,0,0.25);border-radius:12px;display:inline-block;line-height:40px;text-align:center;font-size:20px;">📚</div>
            <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Biblio<span style="opacity:0.75">Tech</span></span>
          </div>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#0f1219;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);padding:36px;">
          {content_html}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#0a0e16;border-radius:0 0 16px 16px;border:1px solid rgba(255,255,255,0.05);border-top:none;padding:18px 36px;text-align:center;">
          <p style="color:#3d4a5c;font-size:12px;margin:0;">© {year} BiblioTech · Benha University</p>
          <p style="color:#2a3548;font-size:11px;margin:6px 0 0;">This email was sent automatically. Please do not reply.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


# ══════════════════════════════════════════════════════════
#  1)  OTP — تغيير كلمة المرور
# ══════════════════════════════════════════════════════════
def send_otp_email(to_email: str, student_name: str, otp_code: str) -> None:
    content = f"""
    <h2 style="color:#f0eef9;font-size:20px;font-weight:700;margin:0 0 8px;">Password Reset Code</h2>
    <p style="color:#8b9ab0;font-size:14px;margin:0 0 28px;">Hi <strong style="color:#f0eef9;">{student_name}</strong>, use the code below to reset your password.</p>

    <div style="background:#141824;border:1px solid rgba(13,148,136,0.3);border-radius:14px;padding:28px;text-align:center;margin-bottom:24px;">
      <p style="color:#8b9ab0;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 14px;">Your Verification Code</p>
      <div style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:12px;padding:16px 32px;">
        <span style="font-size:36px;font-weight:800;color:#fff;letter-spacing:12px;font-family:'Courier New',monospace;">{otp_code}</span>
      </div>
      <p style="color:#3d4a5c;font-size:12px;margin:16px 0 0;">⏱ Valid for <strong style="color:#f59e0b;">10 minutes</strong> only</p>
    </div>

    <div style="background:#1a0a00;border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px;">
      <p style="color:#ef4444;font-size:12px;margin:0;">⚠️ If you didn't request this, please ignore this email. Your account is safe.</p>
    </div>
    """
    _send(to_email, "🔐 BiblioTech — Your Password Reset Code", _base_template(content))


# ══════════════════════════════════════════════════════════
#  2)  Welcome — حساب جديد
# ══════════════════════════════════════════════════════════
def send_welcome_email(to_email: str, student_name: str, lib_id: str) -> None:
    content = f"""
    <h2 style="color:#f0eef9;font-size:20px;font-weight:700;margin:0 0 8px;">Welcome to BiblioTech! 🎉</h2>
    <p style="color:#8b9ab0;font-size:14px;margin:0 0 24px;">Hi <strong style="color:#f0eef9;">{student_name}</strong>, your library account has been created successfully.</p>

    <div style="background:#141824;border:1px solid rgba(13,148,136,0.25);border-radius:14px;padding:24px;margin-bottom:24px;">
      <p style="color:#8b9ab0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 14px;">Your Library Card</p>
      <span style="font-size:28px;font-weight:800;color:#0d9488;letter-spacing:2px;font-family:'Courier New',monospace;">{lib_id}</span>
      <p style="color:#3d4a5c;font-size:12px;margin:10px 0 0;">Save this ID — you'll need it to log in.</p>
    </div>

    <p style="color:#3d4a5c;font-size:12px;text-align:center;margin:0;">You can now log in to your library portal.</p>
    """
    _send(to_email, "🎉 Welcome to BiblioTech — Account Created!", _base_template(content))


# ══════════════════════════════════════════════════════════
#  3)  Profile Updated
# ══════════════════════════════════════════════════════════
def send_profile_update_email(to_email: str, student_name: str, changed_fields: list[str]) -> None:
    fields_html = "".join(
        f'<li style="color:#8b9ab0;font-size:13px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">'
        f'<span style="color:#0d9488;">✓</span> {f}</li>'
        for f in changed_fields
    )
    content = f"""
    <h2 style="color:#f0eef9;font-size:20px;font-weight:700;margin:0 0 8px;">Profile Updated</h2>
    <p style="color:#8b9ab0;font-size:14px;margin:0 0 24px;">Hi <strong style="color:#f0eef9;">{student_name}</strong>, your profile was just updated successfully.</p>

    <div style="background:#141824;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;margin-bottom:24px;">
      <p style="color:#8b9ab0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 12px;">Fields Updated</p>
      <ul style="list-style:none;margin:0;padding:0;">{fields_html}</ul>
    </div>

    <div style="background:#1a0a00;border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px;">
      <p style="color:#ef4444;font-size:12px;margin:0;">⚠️ Didn't make this change? Contact library support immediately.</p>
    </div>
    """
    _send(to_email, "✏️ BiblioTech — Profile Updated", _base_template(content))


# ══════════════════════════════════════════════════════════
#  4)  Password Changed Confirmation
# ══════════════════════════════════════════════════════════
def send_password_changed_email(to_email: str, student_name: str) -> None:
    now = datetime.now().strftime("%d %b %Y at %H:%M")
    content = f"""
    <h2 style="color:#f0eef9;font-size:20px;font-weight:700;margin:0 0 8px;">Password Changed</h2>
    <p style="color:#8b9ab0;font-size:14px;margin:0 0 24px;">Hi <strong style="color:#f0eef9;">{student_name}</strong>, your password was changed successfully.</p>

    <div style="background:#141824;border:1px solid rgba(34,197,94,0.2);border-radius:14px;padding:20px;margin-bottom:24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:10px;">🔒</div>
      <p style="color:#22c55e;font-size:13px;font-weight:600;margin:0 0 6px;">Password updated successfully</p>
      <p style="color:#3d4a5c;font-size:12px;margin:0;">{now}</p>
    </div>

    <div style="background:#1a0a00;border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px;">
      <p style="color:#ef4444;font-size:12px;margin:0;">⚠️ If you didn't do this, contact library support immediately and reset your password.</p>
    </div>
    """
    _send(to_email, "🔒 BiblioTech — Password Changed", _base_template(content))


# ══════════════════════════════════════════════════════════
#  DEBUG HELPER — شغّلها مباشرة لاختبار الإيميل
#  python email_service.py
# ══════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=== BiblioTech Email Test ===")
    print(f"SMTP_HOST : {SMTP_HOST}:{SMTP_PORT}")
    print(f"SMTP_USER : {SMTP_USER or '❌ NOT SET'}")
    print(f"SMTP_PASS : {'✅ SET' if SMTP_PASS else '❌ NOT SET'}")
    if not SMTP_USER or not SMTP_PASS:
        print("\n⚠️  Set SMTP_USER and SMTP_PASS in .env first!")
    else:
        test_to = input(f"\nSend test email to: ").strip()
        try:
            send_welcome_email(test_to, "Test User", "LIB-99999")
            print(f"✅ Test email sent to {test_to}")
        except Exception as e:
            print(f"❌ Error: {e}")
