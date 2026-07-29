import React from "react";

// Mock trpc client for local preview (no backend needed)
const noop = () => {};
const mockQuery = (data: unknown = null) => ({
  data,
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: noop,
});
const mockMutation = () => ({
  mutateAsync: async () => ({}),
  mutate: noop,
  isPending: false,
  isLoading: false,
  error: null,
  reset: noop,
});

const makeProxy = (): any => new Proxy(function(){} as any, {
  get(_t, prop: string) {
    if (prop === "useUtils") return () => makeProxy();
    if (prop === "useQuery") return () => mockQuery();
    if (prop === "useMutation") return () => mockMutation();
    if (prop === "useInfiniteQuery") return () => mockQuery([]);
    if (prop === "setData") return noop;
    if (prop === "invalidate") return async () => {};
    if (prop === "createClient") return () => ({});
    if (prop === "Provider") {
      return ({ children }: { children: React.ReactNode }) => children;
    }
    return makeProxy();
  },
  apply() { return makeProxy(); },
});

export const trpc = makeProxy();
