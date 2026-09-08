// Small helper functions for saving/reading the logged in user.
// We just use the browser's localStorage — its basically a little
// box that remembers stuff even after you close the tab.

// Call this right after a successfull login, to remember who is
// logged in and there token.
export function saveLogin(token: string, user: any) {
  window.localStorage.setItem("liquidityToken", token);
  window.localStorage.setItem("liquidityUser", JSON.stringify(user));
}

// Get back the user object we saved earlier, or null if nobody
// is logged in (or we are running on the server, where there is
// no localStorage at all).
export function getUser(): any {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem("liquidityUser");
  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("liquidityToken");
}

// Forget the logged in user, e.g. when they click "Log out".
export function logout() {
  window.localStorage.removeItem("liquidityToken");
  window.localStorage.removeItem("liquidityUser");
}
