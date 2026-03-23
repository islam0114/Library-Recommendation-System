import asyncio
import aiomysql
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "root") # تأكد من الباسورد
DB_NAME = os.getenv("DB_NAME", "bibliotech")

async def create_database():
    print(f"🚀 Fixing Database Schema for '{DB_NAME}'...")
    try:
        pool = await aiomysql.create_pool(
            host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, db=DB_NAME, autocommit=True
        )
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
                
                tables = [
                    "book_reviews", "community_messages", "community_members", "communities",
                    "friendships", "direct_messages", "borrow_requests", "requests", 
                    "wishlist", "notifications", "announcements", "students", "admins", "books"
                ]
                for table in tables:
                    await cur.execute(f"DROP TABLE IF EXISTS {table}")

                print("Creating corrected tables...")

                # 1. Books
                await cur.execute("""
                CREATE TABLE books (
                    id INT PRIMARY KEY,
                    title VARCHAR(500) NOT NULL,
                    author VARCHAR(500) NOT NULL DEFAULT 'Unknown',
                    description TEXT,
                    genre VARCHAR(150) DEFAULT 'Reference',
                    image_url TEXT,
                    image_local VARCHAR(300),
                    info_link TEXT,
                    copies_total INT DEFAULT 5,
                    copies_available INT DEFAULT 5,
                    borrows_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FULLTEXT INDEX ft_search (title, author, description)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """)

                # 2. Admins
                await cur.execute("""
                CREATE TABLE admins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(50),
                    national_id VARCHAR(14),
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'admin',
                    is_super BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 3. Students
                await cur.execute("""
                CREATE TABLE students (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    lib_id VARCHAR(50) UNIQUE NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    national_id VARCHAR(14) UNIQUE,
                    department VARCHAR(100),
                    faculty VARCHAR(100),
                    university VARCHAR(100),
                    year VARCHAR(50),
                    status ENUM('active', 'suspended') DEFAULT 'active',
                    joined_at DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 4. Announcements
                await cur.execute("""
                CREATE TABLE announcements (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    admin_id INT NULL,
                    title VARCHAR(255) NOT NULL,
                    body TEXT NOT NULL,
                    priority VARCHAR(50) DEFAULT 'normal',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 5. Notifications (تم تعديل book_id ليقبل نصوص)
                await cur.execute("""
                CREATE TABLE notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    type VARCHAR(50),
                    title VARCHAR(255),
                    message TEXT,
                    book_id VARCHAR(50) NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 6. Wishlist (تم تعديل book_id ليقبل نصوص)
                await cur.execute("""
                CREATE TABLE wishlist (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    book_id VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uq_wish (student_id, book_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 7. Borrow Requests (تم تعديل book_id ليقبل نصوص)
                await cur.execute("""
                CREATE TABLE borrow_requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    book_id VARCHAR(50) NOT NULL,
                    book_title VARCHAR(500),
                    book_author VARCHAR(500),
                    book_dept VARCHAR(150),
                    status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending',
                    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    approved_at TIMESTAMP NULL,
                    due_date DATE NULL,
                    returned_at TIMESTAMP NULL,
                    admin_id INT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 8. Direct Messages
                await cur.execute("""
                CREATE TABLE direct_messages (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    sender_id INT UNSIGNED NOT NULL,
                    receiver_id INT UNSIGNED NOT NULL,
                    content TEXT NOT NULL,
                    seen TINYINT(1) DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 9. Friendships (إضافة updated_at المطلوبة)
                await cur.execute("""
                CREATE TABLE friendships (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    sender_id INT UNSIGNED NOT NULL,
                    receiver_id INT UNSIGNED NOT NULL,
                    status ENUM('pending','accepted','blocked') DEFAULT 'pending',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uq_friend (sender_id, receiver_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 10. Communities (إضافة created_by و cover_color)
                await cur.execute("""
                CREATE TABLE communities (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(120) NOT NULL,
                    description TEXT,
                    category VARCHAR(80) DEFAULT 'General',
                    cover_color VARCHAR(20) DEFAULT '#0d9488',
                    created_by INT UNSIGNED NOT NULL,
                    member_count INT UNSIGNED DEFAULT 1,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_category (category)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 11. Community Members
                await cur.execute("""
                CREATE TABLE community_members (
                    community_id INT UNSIGNED NOT NULL,
                    student_id INT UNSIGNED NOT NULL,
                    role ENUM('admin','member') DEFAULT 'member',
                    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (community_id, student_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 12. Community Messages
                await cur.execute("""
                CREATE TABLE community_messages (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    community_id INT UNSIGNED NOT NULL,
                    sender_id INT UNSIGNED NOT NULL,
                    content TEXT NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                # 13. Book Reviews (تم تعديل book_id ليقبل نصوص)
                await cur.execute("""
                CREATE TABLE book_reviews (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    book_id VARCHAR(50) NOT NULL,
                    user_id INT NOT NULL,
                    review_text TEXT NOT NULL,
                    rating INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """)

                await cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
                print("✅ Schema updated successfully! All tables match main.py and social_routes perfectly.")

        pool.close()
        await pool.wait_closed()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_database())