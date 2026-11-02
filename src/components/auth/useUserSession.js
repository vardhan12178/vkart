import { useQueryClient } from "@tanstack/react-query";
import { qk } from "../../query/queryKeys";

const USER_SCOPED_QUERIES = [
  qk.profile.orders,
  qk.profile.addresses,
  qk.profile.wallet,
  qk.profile.cart,
  qk.profile.wishlist,
  qk.membership.status,
];

// Turns a login/register/Google response into the signed-in user and seeds the query cache.
// `requireUserSession` throws when the response has no user, so callers can show one error.
export default function useUserSession() {
  const queryClient = useQueryClient();

  const hydrateUserSession = (data) => {
    if (!data?.user) return null;
    const session = { authenticated: true, user: data.user };
    queryClient.setQueryData(qk.auth.session, session);
    queryClient.setQueryData(qk.profile.root, session.user);
    USER_SCOPED_QUERIES.forEach((queryKey) => queryClient.removeQueries({ queryKey }));
    return session.user;
  };

  const requireUserSession = (data) => {
    const user = hydrateUserSession(data);
    if (!user) throw new Error("Invalid session response");
    return user;
  };

  return { hydrateUserSession, requireUserSession };
}
