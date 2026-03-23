import asyncio
import aiomysql
import os
import bcrypt
import pandas as pd
import re
import ast
import random
from datetime import date, datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# 1. تحميل الإعدادات من ملف .env
load_dotenv(dotenv_path="../.env")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "root")
DB_NAME = os.getenv("DB_NAME", "bibliotech")

# 2. تحديد مسار ملف الـ CSV
CSV_PATH = Path(__file__).resolve().parent.parent.parent / "Data" / "raw_files" / "Books_Details.csv"

# دوال مساعدة
def parse_list_column(raw, default="Unknown"):
    if not raw or pd.isna(raw): return default
    try:
        lst = ast.literal_eval(raw)
        if isinstance(lst, list): return ", ".join(str(a).strip() for a in lst if a)
    except: pass
    cleaned = re.sub(r"[\[\]']", "", str(raw)).strip()
    return cleaned or default

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

# دالة لتوليد تاريخ عشوائي في آخر 3 سنين
def get_random_date():
    start_date = datetime.now() - timedelta(days=3 * 365)
    random_days = random.randint(0, 3 * 365)
    return (start_date + timedelta(days=random_days)).strftime('%Y-%m-%d %H:%M:%S')

async def seed_data():
    print("🚀 Starting Professional Seeding Process...")
    if not CSV_PATH.exists():
        print(f"❌ Error: CSV File not found at {CSV_PATH}")
        return

    try:
        pool = await aiomysql.create_pool(
            host=DB_HOST, user=DB_USER, password=DB_PASS, db=DB_NAME, autocommit=True
        )
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                
                # --- 1. إضافة Super Admin ---
                pw = hash_password("123456")
                await cur.execute("""
                    INSERT IGNORE INTO admins (full_name, email, password, role, is_super) 
                    VALUES ('Super Admin', 'admin@benha.edu.eg', %s, 'super_admin', TRUE)
                """, (pw,))
                print("✅ Admin seeded (admin@benha.edu.eg | 123456)")

                # --- 2. إضافة طلاب تجريبيين ---
                students = [
                    ('LIB-10001', 'Solom', 'solom@student.com', 'Computers'),
                    ('LIB-10002', 'Ahmed Mohamed', 'ahmed@student.com', 'Engineering')
                ]
                for s in students:
                    await cur.execute("""
                        INSERT IGNORE INTO students 
                        (lib_id, full_name, email, password, department, faculty, university, joined_at) 
                        VALUES (%s, %s, %s, %s, %s, %s, 'Benha', %s)
                    """, (s[0], s[1], s[2], pw, s[3], s[3], date.today()))
                print(f"✅ {len(students)} Students seeded (Pass: 123456)")

                # --- 3. سحب كافة الكتب من الـ CSV مع بيانات عشوائية ---
                print(f"📊 Reading CSV: {CSV_PATH.name}...")
                df = pd.read_csv(CSV_PATH)
                df.columns = [c.lower() for c in df.columns]
                
                total_rows = len(df)
                print(f"📦 Total books to process: {total_rows}")

                batch = []
                batch_size = 500
                count = 0

                # SQL الإدخال المحدث (إضافة المتغيرات العشوائية وإزالة preview_link)
                INSERT_SQL = """
                    INSERT IGNORE INTO books 
                    (id, title, author, description, genre, image_url, info_link, copies_total, copies_available, borrows_count, created_at) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                for _, row in df.iterrows():
                    b_id    = int(row.get('book_id', count + 1))
                    b_title = str(row.get('title', 'Untitled')).strip()[:490]
                    b_auth  = parse_list_column(row.get('authors'), "Unknown")[:490]
                    b_desc  = str(row.get('description', ''))[:2000] if not pd.isna(row.get('description')) else ""
                    b_genre = parse_list_column(row.get('categories'), "Reference")[:140]
                    b_img   = str(row.get('image', '')) if not pd.isna(row.get('image')) else None
                    b_info  = str(row.get('infolink', '')) if not pd.isna(row.get('infolink')) else None
                    
                    # 🎲 توليد البيانات العشوائية للكتب
                    rand_copies_total = random.randint(3, 20)
                    rand_copies_avail = random.randint(0, rand_copies_total)
                    rand_borrows = random.randint(0, 150)
                    rand_created_at = get_random_date()

                    batch.append((
                        b_id, b_title, b_auth, b_desc, b_genre, b_img, b_info,
                        rand_copies_total, rand_copies_avail, rand_borrows, rand_created_at
                    ))
                    
                    if len(batch) >= batch_size:
                        await cur.executemany(INSERT_SQL, batch)
                        count += len(batch)
                        print(f"   💾 Progress: {count}/{total_rows} books saved...")
                        batch = []

                # إدخال ما تبقى من الكتب
                if batch:
                    await cur.executemany(INSERT_SQL, batch)
                    count += len(batch)

                print(f"✅ SUCCESS: {count} Books imported successfully with random stats.")

        pool.close()
        await pool.wait_closed()
        print("🎉 Seeding complete! Database is ready.")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())