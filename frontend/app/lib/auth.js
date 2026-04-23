'use client';

export const AUTH_STORAGE_KEY = 'agritech.auth.session';
export const LEGACY_TOKEN_KEY = 'token';
export const LEGACY_USERNAME_KEY = 'username';
export const AUTH_CHANGED_EVENT = 'agritech-auth-changed';
export const DEFAULT_AUTH_REDIRECT = '/dashboard';
export const PROTECTED_APP_ROUTES = ['/dashboard', '/agro', '/devices', '/readings'];
export const ROLE_ADMIN = 'admin';
export const ROLE_MANAGER = 'manager';
export const ROLE_VIEWER = 'viewer';
const AUTH_COOKIE_CANDIDATES = [AUTH_STORAGE_KEY, LEGACY_TOKEN_KEY, LEGACY_USERNAME_KEY, 'jwt', 'accessToken'];

const isBrowser = () => typeof window !== 'undefined';

const dispatchAuthChanged = () => {
  if (isBrowser()) {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = window.atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = isBrowser() ? decodeJwtPayload(token) : null;
  const expiration = payload?.exp;

  if (!expiration) {
    return false;
  }

  return Date.now() >= (Number(expiration) * 1000) - 5000;
};

export const buildLoginHref = (redirectPath = DEFAULT_AUTH_REDIRECT) => {
  const target = redirectPath || DEFAULT_AUTH_REDIRECT;
  return `/?redirect=${encodeURIComponent(target)}`;
};

export const hardRedirect = (targetPath) => {
  if (!isBrowser()) {
    return;
  }

  window.location.replace(targetPath);
};

export const isProtectedAppRoute = (pathname = '') => PROTECTED_APP_ROUTES.some(
  (route) => pathname === route || pathname.startsWith(`${route}/`)
);

export const clearAuthSession = ({ notify = true } = {}) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_USERNAME_KEY);

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  window.sessionStorage.removeItem(LEGACY_USERNAME_KEY);

  AUTH_COOKIE_CANDIDATES.forEach((cookieName) => {
    document.cookie = `${cookieName}=; Max-Age=0; path=/`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  if (notify) {
    dispatchAuthChanged();
  }
};

export const getAuthSession = () => {
  if (!isBrowser()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession);

    if (!session?.token || isTokenExpired(session.token)) {
      clearAuthSession();
      return null;
    }

    return session;
  } catch {
    clearAuthSession();
    return null;
  }
};

export const getAccessToken = () => getAuthSession()?.token || '';

export const getCurrentUserRole = () => {
  const rawRole = getAuthSession()?.role;
  return typeof rawRole === 'string' ? rawRole.trim().toLowerCase() : '';
};

export const isAuthenticated = () => Boolean(getAccessToken());

export const canManageOrganizations = () => getCurrentUserRole() === ROLE_ADMIN;

export const canManageAgroResources = () => {
  const role = getCurrentUserRole();
  return role === ROLE_ADMIN || role === ROLE_MANAGER;
};

export const canManageDevices = () => {
  const role = getCurrentUserRole();
  return role === ROLE_ADMIN || role === ROLE_MANAGER;
};

export const saveAuthSession = (authResponse) => {
  if (!isBrowser() || !authResponse?.token) {
    return null;
  }

  const session = {
    token: authResponse.token,
    userId: authResponse.userId ?? null,
    email: authResponse.email ?? '',
    username: authResponse.username ?? authResponse.email ?? '',
    organizationId: authResponse.organizationId ?? '',
    role: authResponse.role ?? '',
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem(LEGACY_TOKEN_KEY, session.token);
  window.localStorage.setItem(LEGACY_USERNAME_KEY, session.username);
  dispatchAuthChanged();

  return session;
};
