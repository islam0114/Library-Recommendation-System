"""
social_routes.py — BiblioTech Social Layer
══════════════════════════════════════════════════════════════
Friends + Direct Messages + Communities + Community Messages

SQL Tables needed (run once):
──────────────────────────────
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

CREATE TABLE IF NOT EXISTS community_members (
    community_id INT UNSIGNED NOT NULL,
    student_id   INT UNSIGNED NOT NULL,
    role         ENUM('admin','member') NOT NULL DEFAULT 'member',
    joined_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, student_id),
    INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS community_messages (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    community_id INT UNSIGNED NOT NULL,
    sender_id    INT UNSIGNED NOT NULL,
    content      TEXT NOT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_community (community_id, created_at),
    INDEX idx_sender    (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

══════════════════════════════════════════════════════════════
Endpoints:
  FRIENDS
    GET    /api/social/users/search?q=       <- Search for students
    GET    /api/social/users/{id}/profile    <- Get student profile
    POST   /api/social/friends/request       <- Send friend request
    POST   /api/social/friends/{id}/accept   <- Accept friend request
    POST   /api/social/friends/{id}/reject   <- Reject friend request
    DELETE /api/social/friends/{id}          <- Remove friend
    GET    /api/social/friends               <- List of my friends
    GET    /api/social/friends/requests      <- Incoming friend requests

  DIRECT MESSAGES
    GET    /api/social/dm/{friend_id}        <- Get chat messages
    POST   /api/social/dm/{friend_id}        <- Send direct message
    GET    /api/social/dm/conversations      <- List all conversations
    POST   /api/social/dm/{friend_id}/seen   <- Mark conversation as seen

  COMMUNITIES
    GET    /api/social/communities           <- List all communities
    POST   /api/social/communities           <- Create new community
    GET    /api/social/communities/{id}      <- Get community details
    POST   /api/social/communities/{id}/join <- Join a community
    DELETE /api/social/communities/{id}/leave<- Leave a community
    GET    /api/social/communities/{id}/messages <- Get community messages
    POST   /api/social/communities/{id}/messages <- Send message to community
    GET    /api/social/communities/mine      <- My joined communities
══════════════════════════════════════════════════════════════
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import re

# ══════════════════════════════════════════════════════════
#  Pydantic Schemas
# ══════════════════════════════════════════════════════════
class FriendRequestBody(BaseModel):
    receiver_id: int

class SendMessageBody(BaseModel):
    content: str

class CreateCommunityBody(BaseModel):
    name:        str
    description: Optional[str] = None
    category:    Optional[str] = "General"
    cover_color: Optional[str] = "#0d9488"

# ══════════════════════════════════════════════════════════
#  Helper Formatters
# ══════════════════════════════════════════════════════════
def _fmt_student(row: dict) -> dict:
    """Formats raw database row into a structured student dictionary."""
    return {
        "id":         row["id"],
        "name":       row.get("full_name") or "",
        "lib_id":     row.get("lib_id")    or "",
        "faculty":    row.get("faculty")   or "",
        "university": row.get("university")or "",
        "year":       row.get("year")      or "",
        "dept":       row.get("department")or "",
        "joined":     str(row["joined_at"]) if row.get("joined_at") else "",
    }

def _fmt_msg(row: dict) -> dict:
    """Formats raw database row into a structured message dictionary."""
    return {
        "id":         row["id"],
        "sender_id":  row["sender_id"],
        "sender_name":row.get("sender_name") or "",
        "content":    row["content"],
        "seen":       bool(row.get("seen", 0)),
        "created_at": str(row["created_at"]),
    }

def _fmt_community(row: dict, is_member: bool = False) -> dict:
    """Formats raw database row into a structured community dictionary."""
    return {
        "id":           row["id"],
        "name":         row["name"],
        "description":  row.get("description") or "",
        "category":     row.get("category")    or "General",
        "cover_color":  row.get("cover_color") or "#0d9488",
        "member_count": row.get("member_count")or 0,
        "created_by":   row.get("created_by"),
        "created_at":   str(row["created_at"]) if row.get("created_at") else "",
        "is_member":    is_member,
        "creator_name": row.get("creator_name") or "",
    }


# ══════════════════════════════════════════════════════════
#  Router Factory
# ══════════════════════════════════════════════════════════
def make_social_router(get_db, require_student):
    r = APIRouter()

    # ──────────────────────────────────────────────────────
    #  USERS — Search & Profile
    # ──────────────────────────────────────────────────────
    @r.get("/api/social/users/search")
    async def search_users(q: str = "", db=Depends(get_db), me=Depends(require_student)):
        """Search for active students by name, lib_id, or faculty."""
        if len(q.strip()) < 2:
            return {"users": []}
            
        like = f"%{q.strip()}%"
        await db.execute(
            """SELECT id, full_name, lib_id, faculty, university, year, department, joined_at
               FROM students
               WHERE status='active' AND id != %s
                 AND (full_name LIKE %s OR lib_id LIKE %s OR faculty LIKE %s)
               LIMIT 20""",
            (me["id"], like, like, like)
        )
        rows = await db.fetchall()
        results = []
        
        for row in rows:
            # Check friendship status for each result
            await db.execute(
                """SELECT status FROM friendships
                   WHERE (sender_id=%s AND receiver_id=%s)
                      OR (sender_id=%s AND receiver_id=%s)
                   LIMIT 1""",
                (me["id"], row["id"], row["id"], me["id"])
            )
            fr = await db.fetchone()
            d = _fmt_student(row)
            d["friendship_status"] = fr["status"] if fr else None
            results.append(d)
            
        return {"users": results}

    @r.get("/api/social/users/{user_id}/profile")
    async def get_profile(user_id: int, db=Depends(get_db), me=Depends(require_student)):
        """Retrieve a student's public profile, connection status, and shared communities."""
        await db.execute(
            "SELECT id, full_name, lib_id, faculty, university, year, department, joined_at FROM students WHERE id=%s AND status='active'",
            (user_id,)
        )
        row = await db.fetchone()
        if not row:
            raise HTTPException(404, "User not found")

        # Check friendship connection
        await db.execute(
            """SELECT status, sender_id FROM friendships
               WHERE (sender_id=%s AND receiver_id=%s)
                  OR (sender_id=%s AND receiver_id=%s)
               LIMIT 1""",
            (me["id"], user_id, user_id, me["id"])
        )
        fr = await db.fetchone()

        # Count total accepted friends
        await db.execute(
            """SELECT COUNT(*) as cnt FROM friendships
               WHERE status='accepted' AND (sender_id=%s OR receiver_id=%s)""",
            (user_id, user_id)
        )
        fc = (await db.fetchone())["cnt"]

        # Find shared communities between current user and target user
        await db.execute(
            """SELECT c.id, c.name, c.cover_color FROM communities c
               JOIN community_members cm1 ON cm1.community_id=c.id AND cm1.student_id=%s
               JOIN community_members cm2 ON cm2.community_id=c.id AND cm2.student_id=%s
               LIMIT 5""",
            (me["id"], user_id)
        )
        shared = await db.fetchall()

        profile = _fmt_student(row)
        profile["friendship_status"]  = fr["status"]    if fr else None
        profile["friendship_sender"]  = fr["sender_id"] if fr else None
        profile["friends_count"]      = fc
        profile["shared_communities"] = [{"id": s["id"], "name": s["name"], "color": s["cover_color"]} for s in shared]
        
        return profile

    # ──────────────────────────────────────────────────────
    #  FRIENDS — Connections Management
    # ──────────────────────────────────────────────────────
    @r.post("/api/social/friends/request")
    async def send_friend_request(body: FriendRequestBody, db=Depends(get_db), me=Depends(require_student)):
        """Send a friend request to another student."""
        if body.receiver_id == me["id"]:
            raise HTTPException(400, "Cannot add yourself")

        await db.execute("SELECT id FROM students WHERE id=%s AND status='active'", (body.receiver_id,))
        if not await db.fetchone():
            raise HTTPException(404, "User not found")

        # Check for existing requests or accepted friendships
        await db.execute(
            "SELECT id, status FROM friendships WHERE (sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s)",
            (me["id"], body.receiver_id, body.receiver_id, me["id"])
        )
        existing = await db.fetchone()
        
        if existing:
            if existing["status"] == "accepted":
                raise HTTPException(409, "Already friends")
            if existing["status"] == "pending":
                raise HTTPException(409, "Request already sent")

        # Insert new pending request or update if previously blocked/rejected
        await db.execute(
            "INSERT INTO friendships (sender_id, receiver_id, status) VALUES (%s, %s, 'pending') ON DUPLICATE KEY UPDATE status='pending', updated_at=NOW()",
            (me["id"], body.receiver_id)
        )
        return {"message": "Friend request sent"}

    @r.post("/api/social/friends/{sender_id}/accept")
    async def accept_friend(sender_id: int, db=Depends(get_db), me=Depends(require_student)):
        """Accept an incoming friend request."""
        await db.execute(
            "SELECT id FROM friendships WHERE sender_id=%s AND receiver_id=%s AND status='pending'",
            (sender_id, me["id"])
        )
        if not await db.fetchone():
            raise HTTPException(404, "No pending request found")
            
        await db.execute(
            "UPDATE friendships SET status='accepted', updated_at=NOW() WHERE sender_id=%s AND receiver_id=%s",
            (sender_id, me["id"])
        )
        return {"message": "Friend request accepted"}

    @r.post("/api/social/friends/{sender_id}/reject")
    async def reject_friend(sender_id: int, db=Depends(get_db), me=Depends(require_student)):
        """Reject an incoming friend request."""
        await db.execute(
            "DELETE FROM friendships WHERE sender_id=%s AND receiver_id=%s AND status='pending'",
            (sender_id, me["id"])
        )
        return {"message": "Request rejected"}

    @r.delete("/api/social/friends/{friend_id}")
    async def remove_friend(friend_id: int, db=Depends(get_db), me=Depends(require_student)):
        """Remove an accepted friend from connections."""
        await db.execute(
            "DELETE FROM friendships WHERE status='accepted' AND ((sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s))",
            (me["id"], friend_id, friend_id, me["id"])
        )
        return {"message": "Friend removed"}

    @r.get("/api/social/friends")
    async def get_friends(db=Depends(get_db), me=Depends(require_student)):
        """Get the current user's friend list with last message context."""
        await db.execute(
            """SELECT s.id, s.full_name, s.lib_id, s.faculty, s.university, s.year, s.department, s.joined_at,
                      f.created_at as friends_since
               FROM friendships f
               JOIN students s ON s.id = CASE WHEN f.sender_id=%s THEN f.receiver_id ELSE f.sender_id END
               WHERE f.status='accepted' AND (f.sender_id=%s OR f.receiver_id=%s)
               ORDER BY s.full_name""",
            (me["id"], me["id"], me["id"])
        )
        rows = await db.fetchall()
        friends = []
        
        for row in rows:
            # Fetch last message between the two users
            await db.execute(
                """SELECT content, created_at, seen, sender_id FROM direct_messages
                   WHERE (sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s)
                   ORDER BY created_at DESC LIMIT 1""",
                (me["id"], row["id"], row["id"], me["id"])
            )
            last = await db.fetchone()
            
            # Count unread messages from this friend
            await db.execute(
                "SELECT COUNT(*) as cnt FROM direct_messages WHERE sender_id=%s AND receiver_id=%s AND seen=0",
                (row["id"], me["id"])
            )
            unread = (await db.fetchone())["cnt"]

            d = _fmt_student(row)
            d["friends_since"] = str(row["friends_since"]) if row.get("friends_since") else ""
            d["last_message"]  = last["content"][:60]   if last else None
            d["last_msg_time"] = str(last["created_at"]) if last else None
            d["unread_count"]  = unread
            friends.append(d)
            
        return {"friends": friends}

    @r.get("/api/social/friends/requests")
    async def friend_requests(db=Depends(get_db), me=Depends(require_student)):
        """Get a list of all incoming pending friend requests."""
        await db.execute(
            """SELECT s.id, s.full_name, s.lib_id, s.faculty, s.university, s.year, s.department, s.joined_at,
                      f.created_at as req_date
               FROM friendships f
               JOIN students s ON s.id = f.sender_id
               WHERE f.receiver_id=%s AND f.status='pending'
               ORDER BY f.created_at DESC""",
            (me["id"],)
        )
        rows = await db.fetchall()
        result = []
        
        for row in rows:
            d = _fmt_student(row)
            d["req_date"] = str(row["req_date"]) if row.get("req_date") else ""
            result.append(d)
            
        return {"requests": result}

    # ──────────────────────────────────────────────────────
    #  DIRECT MESSAGES
    # ──────────────────────────────────────────────────────
    @r.get("/api/social/dm/conversations")
    async def get_conversations(db=Depends(get_db), me=Depends(require_student)):
        """Retrieve a list of all active conversations with the latest message snippet."""
        # Find all distinct users the current user has messaged
        await db.execute(
            """SELECT DISTINCT
                 CASE WHEN dm.sender_id=%s THEN dm.receiver_id ELSE dm.sender_id END AS other_id
               FROM direct_messages dm
               WHERE dm.sender_id=%s OR dm.receiver_id=%s""",
            (me["id"], me["id"], me["id"])
        )
        other_ids = [r["other_id"] for r in await db.fetchall()]

        conversations = []
        for oid in other_ids:
            await db.execute(
                "SELECT id, full_name, lib_id, faculty FROM students WHERE id=%s", (oid,)
            )
            other = await db.fetchone()
            if not other:
                continue
                
            # Get latest message metadata
            await db.execute(
                """SELECT content, created_at, seen, sender_id FROM direct_messages
                   WHERE (sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s)
                   ORDER BY created_at DESC LIMIT 1""",
                (me["id"], oid, oid, me["id"])
            )
            last = await db.fetchone()
            
            # Get unread count
            await db.execute(
                "SELECT COUNT(*) as cnt FROM direct_messages WHERE sender_id=%s AND receiver_id=%s AND seen=0",
                (oid, me["id"])
            )
            unread = (await db.fetchone())["cnt"]

            # Verify if they are still friends (in case friendship was revoked)
            await db.execute(
                "SELECT status FROM friendships WHERE status='accepted' AND ((sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s))",
                (me["id"], oid, oid, me["id"])
            )
            is_friend = bool(await db.fetchone())

            conversations.append({
                "other_id":      oid,
                "other_name":    other["full_name"],
                "other_lib_id":  other["lib_id"],
                "other_faculty": other.get("faculty") or "",
                "last_message":  last["content"][:80]    if last else "",
                "last_msg_time": str(last["created_at"]) if last else "",
                "unread_count":  unread,
                "is_friend":     is_friend,
                "last_sender_me": last["sender_id"] == me["id"] if last else False,
            })

        # Sort conversations by the latest message time
        conversations.sort(key=lambda x: x["last_msg_time"], reverse=True)
        return {"conversations": conversations}

    @r.get("/api/social/dm/{friend_id}")
    async def get_dm(friend_id: int, limit: int = 50, before_id: int = 0, db=Depends(get_db), me=Depends(require_student)):
        """Retrieve paginated direct messages with a specific friend."""
        # Validate active friendship
        await db.execute(
            "SELECT id FROM friendships WHERE status='accepted' AND ((sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s))",
            (me["id"], friend_id, friend_id, me["id"])
        )
        if not await db.fetchone():
            raise HTTPException(403, "You must be friends to message")

        # Pagination logic
        if before_id:
            await db.execute(
                """SELECT dm.*, s.full_name as sender_name FROM direct_messages dm
                   JOIN students s ON s.id=dm.sender_id
                   WHERE ((dm.sender_id=%s AND dm.receiver_id=%s) OR (dm.sender_id=%s AND dm.receiver_id=%s))
                     AND dm.id < %s
                   ORDER BY dm.created_at DESC LIMIT %s""",
                (me["id"], friend_id, friend_id, me["id"], before_id, limit)
            )
        else:
            await db.execute(
                """SELECT dm.*, s.full_name as sender_name FROM direct_messages dm
                   JOIN students s ON s.id=dm.sender_id
                   WHERE (dm.sender_id=%s AND dm.receiver_id=%s) OR (dm.sender_id=%s AND dm.receiver_id=%s)
                   ORDER BY dm.created_at DESC LIMIT %s""",
                (me["id"], friend_id, friend_id, me["id"], limit)
            )
            
        rows = await db.fetchall()
        rows = list(reversed(rows))  # Order chronologically for the UI

        # Mark fetched messages as seen automatically
        await db.execute(
            "UPDATE direct_messages SET seen=1 WHERE sender_id=%s AND receiver_id=%s AND seen=0",
            (friend_id, me["id"])
        )
        return {"messages": [_fmt_msg(r) for r in rows]}

    @r.post("/api/social/dm/{friend_id}")
    async def send_dm(friend_id: int, body: SendMessageBody, db=Depends(get_db), me=Depends(require_student)):
        """Send a new direct message to a friend."""
        content = body.content.strip()
        if not content:
            raise HTTPException(422, "Message cannot be empty")
        if len(content) > 2000:
            raise HTTPException(422, "Message too long (max 2000 chars)")

        # Validate active friendship
        await db.execute(
            "SELECT id FROM friendships WHERE status='accepted' AND ((sender_id=%s AND receiver_id=%s) OR (sender_id=%s AND receiver_id=%s))",
            (me["id"], friend_id, friend_id, me["id"])
        )
        if not await db.fetchone():
            raise HTTPException(403, "You must be friends to message")

        # Insert message
        await db.execute(
            "INSERT INTO direct_messages (sender_id, receiver_id, content) VALUES (%s, %s, %s)",
            (me["id"], friend_id, content)
        )
        msg_id = db.lastrowid
        
        return {
            "id":         msg_id,
            "sender_id":  me["id"],
            "content":    content,
            "seen":       False,
            "created_at": "just now",
        }

    @r.post("/api/social/dm/{friend_id}/seen")
    async def mark_seen(friend_id: int, db=Depends(get_db), me=Depends(require_student)):
        """Mark unread messages from a specific friend as seen."""
        await db.execute(
            "UPDATE direct_messages SET seen=1 WHERE sender_id=%s AND receiver_id=%s AND seen=0",
            (friend_id, me["id"])
        )
        return {"ok": True}

    # ──────────────────────────────────────────────────────
    #  COMMUNITIES
    # ──────────────────────────────────────────────────────
    @r.get("/api/social/communities/mine")
    async def my_communities(db=Depends(get_db), me=Depends(require_student)):
        """Get a list of communities the user has joined."""
        await db.execute(
            """SELECT c.*, s.full_name as creator_name, cm.role FROM communities c
               JOIN community_members cm ON cm.community_id=c.id AND cm.student_id=%s
               JOIN students s ON s.id=c.created_by
               ORDER BY cm.joined_at DESC""",
            (me["id"],)
        )
        rows = await db.fetchall()
        result = []
        for row in rows:
            d = _fmt_community(row, True)
            d["my_role"] = row.get("role") or "member"
            result.append(d)
            
        return {"communities": result}

    @r.get("/api/social/communities")
    async def list_communities(q: str = "", db=Depends(get_db), me=Depends(require_student)):
        """Discover public communities, with optional search query."""
        if q.strip():
            like = f"%{q.strip()}%"
            await db.execute(
                """SELECT c.*, s.full_name as creator_name FROM communities c
                   JOIN students s ON s.id=c.created_by
                   WHERE c.name LIKE %s OR c.category LIKE %s OR c.description LIKE %s
                   ORDER BY c.member_count DESC LIMIT 50""",
                (like, like, like)
            )
        else:
            await db.execute(
                """SELECT c.*, s.full_name as creator_name FROM communities c
                   JOIN students s ON s.id=c.created_by
                   ORDER BY c.member_count DESC LIMIT 50"""
            )
            
        rows = await db.fetchall()
        result = []
        for row in rows:
            # Check if current user is already a member
            await db.execute(
                "SELECT 1 FROM community_members WHERE community_id=%s AND student_id=%s",
                (row["id"], me["id"])
            )
            is_member = bool(await db.fetchone())
            result.append(_fmt_community(row, is_member))
            
        return {"communities": result}

    @r.post("/api/social/communities", status_code=201)
    async def create_community(body: CreateCommunityBody, db=Depends(get_db), me=Depends(require_student)):
        """Create a new community group."""
        name = body.name.strip()
        if not name or len(name) < 3:
            raise HTTPException(422, "Name must be at least 3 characters")
        if len(name) > 120:
            raise HTTPException(422, "Name too long")

        # Ensure community name is unique
        await db.execute("SELECT id FROM communities WHERE name=%s", (name,))
        if await db.fetchone():
            raise HTTPException(409, "Community name already taken")

        # Create the community
        await db.execute(
            """INSERT INTO communities (name, description, category, cover_color, created_by, member_count)
               VALUES (%s, %s, %s, %s, %s, 1)""",
            (name, (body.description or "").strip()[:500] or None,
             (body.category or "General").strip()[:80],
             (body.cover_color or "#0d9488")[:20],
             me["id"])
        )
        cid = db.lastrowid
        
        # Add creator as an admin member
        await db.execute(
            "INSERT INTO community_members (community_id, student_id, role) VALUES (%s, %s, 'admin')",
            (cid, me["id"])
        )
        
        await db.execute("SELECT c.*, s.full_name as creator_name FROM communities c JOIN students s ON s.id=c.created_by WHERE c.id=%s", (cid,))
        row = await db.fetchone()
        
        return {"message": "Community created", "community": _fmt_community(row, True)}

    @r.get("/api/social/communities/{community_id}")
    async def get_community(community_id: int, db=Depends(get_db), me=Depends(require_student)):
        """Retrieve community details and recent members list."""
        await db.execute(
            "SELECT c.*, s.full_name as creator_name FROM communities c JOIN students s ON s.id=c.created_by WHERE c.id=%s",
            (community_id,)
        )
        row = await db.fetchone()
        if not row:
            raise HTTPException(404, "Community not found")

        await db.execute(
            "SELECT 1 FROM community_members WHERE community_id=%s AND student_id=%s",
            (community_id, me["id"])
        )
        is_member = bool(await db.fetchone())

        # Fetch up to 20 recent members
        await db.execute(
            """SELECT s.id, s.full_name, s.lib_id, s.faculty, cm.role, cm.joined_at
               FROM community_members cm JOIN students s ON s.id=cm.student_id
               WHERE cm.community_id=%s ORDER BY cm.joined_at LIMIT 20""",
            (community_id,)
        )
        members = await db.fetchall()

        d = _fmt_community(row, is_member)
        d["members"] = [{"id": m["id"], "name": m["full_name"], "lib_id": m["lib_id"],
                          "faculty": m.get("faculty") or "", "role": m["role"]} for m in members]
                          
        return d

    @r.post("/api/social/communities/{community_id}/join")
    async def join_community(community_id: int, db=Depends(get_db), me=Depends(require_student)):
        """Join a public community."""
        await db.execute("SELECT id FROM communities WHERE id=%s", (community_id,))
        if not await db.fetchone():
            raise HTTPException(404, "Community not found")

        await db.execute(
            "SELECT 1 FROM community_members WHERE community_id=%s AND student_id=%s",
            (community_id, me["id"])
        )
        if await db.fetchone():
            raise HTTPException(409, "Already a member")

        # Insert membership and increment community member count
        await db.execute(
            "INSERT INTO community_members (community_id, student_id, role) VALUES (%s, %s, 'member')",
            (community_id, me["id"])
        )
        await db.execute(
            "UPDATE communities SET member_count = member_count + 1 WHERE id=%s",
            (community_id,)
        )
        return {"message": "Joined successfully"}

    @r.delete("/api/social/communities/{community_id}/leave")
    async def leave_community(community_id: int, db=Depends(get_db), me=Depends(require_student)):
        """Leave a community, ensuring an admin remains if applicable."""
        await db.execute(
            "SELECT role FROM community_members WHERE community_id=%s AND student_id=%s",
            (community_id, me["id"])
        )
        membership = await db.fetchone()
        
        if not membership:
            raise HTTPException(404, "Not a member")
            
        if membership["role"] == "admin":
            # Ensure the community doesn't become orphaned without an admin
            await db.execute(
                "SELECT COUNT(*) as cnt FROM community_members WHERE community_id=%s AND role='admin'",
                (community_id,)
            )
            admin_count = (await db.fetchone())["cnt"]
            if admin_count <= 1:
                raise HTTPException(400, "Transfer admin role before leaving")

        # Remove membership and decrement community member count safely
        await db.execute(
            "DELETE FROM community_members WHERE community_id=%s AND student_id=%s",
            (community_id, me["id"])
        )
        await db.execute(
            "UPDATE communities SET member_count = GREATEST(member_count - 1, 0) WHERE id=%s",
            (community_id,)
        )
        return {"message": "Left community"}

    @r.get("/api/social/communities/{community_id}/messages")
    async def get_community_messages(community_id: int, limit: int = 50, before_id: int = 0, db=Depends(get_db), me=Depends(require_student)):
        """Retrieve paginated messages for a specific community group."""
        # Must be a member to view messages
        await db.execute(
            "SELECT 1 FROM community_members WHERE community_id=%s AND student_id=%s",
            (community_id, me["id"])
        )
        if not await db.fetchone():
            raise HTTPException(403, "Join the community first")

        if before_id:
            await db.execute(
                """SELECT cm.*, s.full_name as sender_name FROM community_messages cm
                   JOIN students s ON s.id=cm.sender_id
                   WHERE cm.community_id=%s AND cm.id < %s
                   ORDER BY cm.created_at DESC LIMIT %s""",
                (community_id, before_id, limit)
            )
        else:
            await db.execute(
                """SELECT cm.*, s.full_name as sender_name FROM community_messages cm
                   JOIN students s ON s.id=cm.sender_id
                   WHERE cm.community_id=%s
                   ORDER BY cm.created_at DESC LIMIT %s""",
                (community_id, limit)
            )
            
        rows = await db.fetchall()
        rows = list(reversed(rows))
        return {"messages": [_fmt_msg(r) for r in rows]}

    @r.post("/api/social/communities/{community_id}/messages")
    async def send_community_message(community_id: int, body: SendMessageBody, db=Depends(get_db), me=Depends(require_student)):
        """Send a new message to a community group."""
        content = body.content.strip()
        if not content:
            raise HTTPException(422, "Message cannot be empty")
        if len(content) > 2000:
            raise HTTPException(422, "Message too long")

        # Must be a member to send messages
        await db.execute(
            "SELECT 1 FROM community_members WHERE community_id=%s AND student_id=%s",
            (community_id, me["id"])
        )
        if not await db.fetchone():
            raise HTTPException(403, "Join the community first")

        # Insert the message
        await db.execute(
            "INSERT INTO community_messages (community_id, sender_id, content) VALUES (%s, %s, %s)",
            (community_id, me["id"], content)
        )
        msg_id = db.lastrowid
        
        await db.execute("SELECT full_name FROM students WHERE id=%s", (me["id"],))
        name_row = await db.fetchone()
        
        return {
            "id":          msg_id,
            "sender_id":   me["id"],
            "sender_name": name_row["full_name"] if name_row else "",
            "content":     content,
            "seen":        True,  # Community messages are inherently public
            "created_at":  "just now",
        }

    # ──────────────────────────────────────────────────────
    #  SOCIAL SUMMARY — Quick Analytics
    # ──────────────────────────────────────────────────────
    @r.get("/api/social/summary")
    async def social_summary(db=Depends(get_db), me=Depends(require_student)):
        """Provide a quick overview of the user's social notifications."""
        
        # Total Friends
        await db.execute(
            "SELECT COUNT(*) as cnt FROM friendships WHERE status='accepted' AND (sender_id=%s OR receiver_id=%s)",
            (me["id"], me["id"])
        )
        friends_count = (await db.fetchone())["cnt"]

        # Pending Incoming Requests
        await db.execute(
            "SELECT COUNT(*) as cnt FROM friendships WHERE receiver_id=%s AND status='pending'",
            (me["id"],)
        )
        pending_requests = (await db.fetchone())["cnt"]

        # Joined Communities Count
        await db.execute(
            "SELECT COUNT(*) as cnt FROM community_members WHERE student_id=%s",
            (me["id"],)
        )
        communities_count = (await db.fetchone())["cnt"]

        # Total Unread Direct Messages from active friends
        await db.execute(
            """SELECT COUNT(*) as cnt FROM direct_messages dm
               JOIN friendships f ON f.status='accepted'
                 AND ((f.sender_id=dm.sender_id AND f.receiver_id=dm.receiver_id)
                   OR (f.sender_id=dm.receiver_id AND f.receiver_id=dm.sender_id))
               WHERE dm.receiver_id=%s AND dm.seen=0""",
            (me["id"],)
        )
        unread_dms = (await db.fetchone())["cnt"]

        return {
            "friends_count":    friends_count,
            "pending_requests": pending_requests,
            "communities_count":communities_count,
            "unread_dms":       unread_dms,
        }

    return r