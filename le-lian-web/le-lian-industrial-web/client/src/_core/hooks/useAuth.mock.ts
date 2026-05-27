export function useAuth(_options?: unknown) {
  return {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    refresh: () => {},
    logout: async () => {},
  };
}
