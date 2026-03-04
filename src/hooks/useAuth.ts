export function useAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return {
    isAuthenticated: !!token,
    user: user ? JSON.parse(user) : null,
  };
}
