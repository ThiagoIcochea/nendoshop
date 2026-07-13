const STORAGE_KEY = "pending2faFlow";
const SECURE_ROUTES = {
  login: "/s/nc-login-a9p",
  adminLogin: "/access-panel-admin",
  profile: "/s/nc-profile-h3u"
};

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
  if (pendingProfileUpdate) return SECURE_ROUTES.profile;
  if (forgotPassword) return "/";
  if (pendingPasswordChange) return requireAdmin ? SECURE_ROUTES.adminLogin : SECURE_ROUTES.login;
  if (requireAdmin && user?.role !== "admin") return SECURE_ROUTES.login;
  if (user?.role === "admin") return SECURE_ROUTES.adminLogin;
  return "/";
};

export const clearPending2FAFlow = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};
