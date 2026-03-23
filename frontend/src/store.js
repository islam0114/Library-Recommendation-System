// ── SHARED STORE ─────────────────────────────────────────────────
// Connects student borrow requests → admin approval panel
// Uses localStorage so data persists across page refreshes

const REQUESTS_KEY = "bt_borrow_requests";
const ADMIN_KEY    = "bt_admin_session";

export function getRequests() {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
  } catch { return []; }
}

export function saveRequest(request) {
  const all = getRequests();
  const exists = all.find(r => r.bookId === request.bookId && r.studentId === request.studentId && r.status === "pending");
  if (exists) return false; // already requested
  all.unshift({ ...request, id: Date.now(), status: "pending", date: new Date().toLocaleDateString("en-GB") });
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(all));
  return true;
}

export function updateRequest(id, status) {
  const all = getRequests();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return;
  all[idx].status = status;
  all[idx].updatedAt = new Date().toLocaleDateString("en-GB");
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(all));
}

export function hasActiveRequest(bookId, studentId) {
  return getRequests().some(r => r.bookId === bookId && r.studentId === studentId && r.status === "pending");
}

export function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_KEY) === "true";
}

export function adminLogin(user, pass) {
  if (user === "admin" && pass === "admin123") {
    localStorage.setItem(ADMIN_KEY, "true");
    return true;
  }
  return false;
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_KEY);
}
