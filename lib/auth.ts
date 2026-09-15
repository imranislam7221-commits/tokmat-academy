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
    const res = await fetch("/api/auth");
    const data = await res.json();
    if (data.ok && data.user) return data.user as TokmatUser;
    return null;
  } catch {
    return null;
  }
}

export function isAdminEmail(email: string): boolean {
  return ["maasum1231@gmail.com"].includes(email.trim().toLowerCase());
}

export async function logout() {
  try {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "logout" }),
    });
  } catch {}
  window.location.href = "/login";
}

export async function getRole(): Promise<UserRole | null> {
  const u = await getUser();
  return u?.role || null;
}
