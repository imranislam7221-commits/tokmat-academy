// Auth helper — ekhon REAL session based (HttpOnly cookie via /api/auth)
// localStorage "tokmat_user" ar use hoy na.

export type UserRole = "admin" | "user";

export interface TokmatUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  plan?: string;
  joined?: string;
}

// Server theke current user ane (async — await korte hobe)
export async function getUser(): Promise<TokmatUser | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/auth", { cache: "no-store", credentials: "include" });
    const data = await res.json();
    if (data.ok && data.user) return data.user as TokmatUser;
    return null;
  } catch {
    return null;
  }
}

import { isAdminEmail } from "./admin";

export { isAdminEmail };

export async function logout() {
  // 1) Firebase session clear (Google login er jonno)
  try {
    // @ts-ignore
    const { signOut } = await import("firebase/auth");
    // @ts-ignore
    const { auth } = await import("@/lib/firebase");
    await signOut(auth).catch(()=>{});
  } catch {}
  // 2) Server-side logout — sob DB session revoke + sob cookie variant clear
  try {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ action: "logout2" }),
    });
  } catch {}
  // 3) Local storage/session clear
  try { localStorage.clear(); sessionStorage.clear(); } catch {}
  // 4) redirect (replace — back button e logged-in page fire ashbe na)
  window.location.replace("/login?loggedout=1");
}

export async function getRole(): Promise<UserRole | null> {
  const u = await getUser();
  return u?.role || null;
}
