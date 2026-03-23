"""
books_routes_v2.py — BiblioTech
══════════════════════════════════════════════════════════
GET  /api/admin/stats           ← داشبورد إحصائيات
PUT  /api/admin/books/bulk-delete ← حذف متعدد (bulk)
GET  /api/books                 ← دعم sort param
══════════════════════════════════════════════════════════
"""

import os
import uuid
from pathlib import Path
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from pydantic import BaseModel
import aiomysql

# ── التعديل هنا لضمان حفظ الصور في المكان الصحيح ──
BASE_DIR   = Path(__file__).resolve().parent.parent
COVERS_DIR = BASE_DIR / "uploads" / "book_covers"
COVERS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_SIZE_MB  = 5

class BookCreate(BaseModel):
    title:        str
    author:       str
    description:  Optional[str]  = None
    genre:        Optional[str]  = "Reference"
    image_url:    Optional[str]  = None
    copies_total: Optional[int]  = 1

class BookUpdate(BaseModel):
    title:        Optional[str]  = None
    author:       Optional[str]  = None
    description:  Optional[str]  = None
    genre:        Optional[str]  = None
    image_url:    Optional[str]  = None
    copies_total: Optional[int]  = None
    available:    Optional[bool] = None

class BulkDeleteBody(BaseModel):
    ids: List[int]

def _book_to_dict(row: dict, base_url: str = "") -> dict:
    if row.get("image_local"):
        cover = f"{base_url}/api/book-cover/{row['image_local']}"
    else:
        cover = row.get("image_url") or ""
    return {
        "id":           row["id"],
        "book_id":      row["id"],
        "title":        row["title"],
        "author":       row["author"],
        "description":  row.get("description") or "",
        "genre":        row.get("genre") or "Reference",
        "dept":         row.get("genre") or "Reference",
        "image_url":    cover,
        "available":    bool(row.get("available", 1)),
        "copies_total": row.get("copies_total", 1),
        "copies_avail": row.get("copies_available") if row.get("copies_available") is not None else 0,
        "borrows":      row.get("borrows_count", 0), # 👈 إضافة الاستعارات
        "added_by":     row.get("added_by"),
        "created_at":   str(row["created_at"]) if row.get("created_at") else "",
    }

def make_books_router(get_db, require_admin):
    router = APIRouter()

    @router.get("/api/admin/stats")
    async def get_stats(admin=Depends(require_admin), db=Depends(get_db)):
        stats = {}
        await db.execute("SELECT COUNT(*) as cnt FROM books")
        stats["total_books"] = (await db.fetchone())["cnt"]

        await db.execute("SELECT COUNT(*) as cnt FROM books WHERE available = 1")
        stats["available_books"] = (await db.fetchone())["cnt"]
        stats["unavailable_books"] = stats["total_books"] - stats["available_books"]

        await db.execute("SELECT COUNT(*) as cnt FROM students WHERE status = 'active'")
        stats["active_students"] = (await db.fetchone())["cnt"]

        await db.execute("SELECT COUNT(*) as cnt FROM borrow_requests WHERE status = 'pending'")
        stats["pending_requests"] = (await db.fetchone())["cnt"]

        await db.execute("SELECT COUNT(*) as cnt FROM borrow_requests WHERE status = 'approved'")
        stats["approved_requests"] = (await db.fetchone())["cnt"]

        await db.execute("SELECT genre, COUNT(*) as cnt FROM books GROUP BY genre ORDER BY cnt DESC LIMIT 5")
        stats["top_genres"] = [{"genre": r["genre"] or "Reference", "count": r["cnt"]} for r in await db.fetchall()]

        await db.execute("SELECT SUM(copies_total) as s, SUM(copies_avail) as a FROM books")
        row = await db.fetchone()
        stats["total_copies"]     = int(row["s"] or 0)
        stats["available_copies"] = int(row["a"] or 0)
        return stats

    @router.get("/api/books/{book_id}")
    async def get_book(book_id: int, db=Depends(get_db)):
        await db.execute("SELECT * FROM books WHERE id=%s", (book_id,))
        row = await db.fetchone()
        if not row: raise HTTPException(404, "Book not found")
        return _book_to_dict(row)

    @router.post("/api/admin/books", status_code=201)
    async def add_book(body: BookCreate, admin=Depends(require_admin), db=Depends(get_db)):
        if not body.title.strip(): raise HTTPException(422, "Title is required")
        if not body.author.strip(): raise HTTPException(422, "Author is required")
        copies = max(1, body.copies_total or 1)
        await db.execute(
            "INSERT INTO books (title, author, description, genre, image_url, copies_total, copies_avail, added_by) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (body.title.strip()[:500], body.author.strip()[:500], (body.description or "").strip()[:5000] or None, (body.genre or "Reference").strip()[:150], (body.image_url or "").strip() or None, copies, copies, admin["id"])
        )
        new_id = db.lastrowid
        await db.execute("SELECT * FROM books WHERE id=%s", (new_id,))
        row = await db.fetchone()
        return {"message": "Book added successfully", "book": _book_to_dict(row)}

    @router.put("/api/admin/books/{book_id}")
    async def update_book(book_id: int, body: BookUpdate, admin=Depends(require_admin), db=Depends(get_db)):
        await db.execute("SELECT id FROM books WHERE id=%s", (book_id,))
        if not await db.fetchone(): raise HTTPException(404, "Book not found")
        fields, params = [], []
        if body.title       is not None: fields.append("title=%s");       params.append(body.title.strip()[:500])
        if body.author      is not None: fields.append("author=%s");      params.append(body.author.strip()[:500])
        if body.description is not None: fields.append("description=%s"); params.append(body.description.strip()[:5000] or None)
        if body.genre       is not None: fields.append("genre=%s");       params.append(body.genre.strip()[:150])
        if body.available   is not None: fields.append("available=%s");   params.append(int(body.available))
        if body.image_url   is not None:
            fields.append("image_url=%s");   params.append(body.image_url.strip() or None)
            fields.append("image_local=%s"); params.append(None)
        if body.copies_total is not None:
            copies = max(1, body.copies_total)
            fields.append("copies_total=%s"); params.append(copies)
            await db.execute("SELECT copies_total, copies_avail FROM books WHERE id=%s", (book_id,))
            cur   = await db.fetchone()
            avail = max(0, copies - (cur["copies_total"] - cur["copies_avail"]))
            fields.append("copies_avail=%s"); params.append(avail)

        if not fields: raise HTTPException(422, "Nothing to update")
        params.append(book_id)
        await db.execute(f"UPDATE books SET {', '.join(fields)} WHERE id=%s", tuple(params))
        await db.execute("SELECT * FROM books WHERE id=%s", (book_id,))
        return {"message": "Book updated successfully", "book": _book_to_dict(await db.fetchone())}

    @router.delete("/api/admin/books/{book_id}")
    async def delete_book(book_id: int, admin=Depends(require_admin), db=Depends(get_db)):
        await db.execute("SELECT image_local FROM books WHERE id=%s", (book_id,))
        row = await db.fetchone()
        if not row: raise HTTPException(404, "Book not found")
        if row.get("image_local"):
            img_path = COVERS_DIR / row["image_local"]
            if img_path.exists(): img_path.unlink()
        await db.execute("DELETE FROM books WHERE id=%s", (book_id,))
        return {"message": "Book deleted successfully", "deleted_id": book_id}

    @router.delete("/api/admin/books/bulk")
    async def bulk_delete_books(body: BulkDeleteBody, admin=Depends(require_admin), db=Depends(get_db)):
        if not body.ids: raise HTTPException(422, "No IDs provided")
        if len(body.ids) > 200: raise HTTPException(422, "Maximum 200 books per bulk delete")
        deleted = []
        for book_id in body.ids:
            await db.execute("SELECT image_local FROM books WHERE id=%s", (book_id,))
            row = await db.fetchone()
            if not row: continue
            if row.get("image_local"):
                img_path = COVERS_DIR / row["image_local"]
                if img_path.exists(): img_path.unlink()
            await db.execute("DELETE FROM books WHERE id=%s", (book_id,))
            deleted.append(book_id)
        return {"message": f"Deleted {len(deleted)} books", "deleted_ids": deleted, "failed_count": len(body.ids) - len(deleted)}

    @router.post("/api/admin/books/{book_id}/cover")
    async def upload_book_cover(book_id: int, file: UploadFile = File(...), admin=Depends(require_admin), db=Depends(get_db)):
        await db.execute("SELECT image_local FROM books WHERE id=%s", (book_id,))
        row = await db.fetchone()
        if row is None: raise HTTPException(404, "Book not found")
        ext = Path(file.filename or "").suffix.lower()
        if ext not in ALLOWED_EXT: raise HTTPException(422, f"File type not allowed. Use: {', '.join(ALLOWED_EXT)}")
        contents = await file.read()
        if len(contents) > MAX_SIZE_MB * 1024 * 1024: raise HTTPException(413, f"File too large (max {MAX_SIZE_MB} MB)")
        if row.get("image_local"):
            old_path = COVERS_DIR / row["image_local"]
            if old_path.exists(): old_path.unlink()
        filename  = f"cover_{book_id}_{uuid.uuid4().hex[:8]}{ext}"
        save_path = COVERS_DIR / filename
        with open(save_path, "wb") as f: f.write(contents)
        await db.execute("UPDATE books SET image_local=%s, image_url=NULL WHERE id=%s", (filename, book_id))
        return {"message": "Cover uploaded successfully", "filename": filename, "cover_url": f"/api/book-cover/{filename}"}

    @router.get("/api/book-cover/{filename}")
    async def get_book_cover(filename: str):
        from fastapi.responses import FileResponse
        safe_name = Path(filename).name
        img_path  = COVERS_DIR / safe_name
        if not img_path.exists(): raise HTTPException(404, "Cover not found")
        return FileResponse(str(img_path))

    return router