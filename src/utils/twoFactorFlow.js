const STORAGE_KEY = "pending2faFlow";

export const savePending2FAFlow = (payload) => {
  if (typeof window === "undefined") return;
  const normalized = payload && typeof payload === "object" ? payload : {};
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
};

export const readPending2FAFlow = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getTwoFactorSuccessTarget = ({
  redirectTo,
  pendingPasswordChange,
  forgotPassword,
  pendingProfileUpdate,
  user,
  requireAdmin,
}) => {
  if (redirectTo) return redirectTo;
  if (pendingProfileUpdate) return "/profile";
  if (pendingPasswordChange || forgotPassword) return "/login";
  if (requireAdmin && user?.role !== "admin") return "/login";
  if (user?.role === "admin") return "/admin-access-panel";
  return "/";
};

export const clearPending2FAFlow = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};
