// ===== Centralized Admin Email =====
// Admin email EK JAYGAY defined — env variable diye override kora jay.
// Vercel e MASTER_ADMIN_EMAIL env set korle oi email master admin hobe.
// 4 jaygay hardcoded chilo — sob ekhon ekhane:

export function getMasterAdminEmails(): string[] {
  const envEmails = (process.env.MASTER_ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return envEmails.length > 0 ? envEmails : ["maasum1231@gmail.com"];
}

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return getMasterAdminEmails().includes(email.trim().toLowerCase());
}
