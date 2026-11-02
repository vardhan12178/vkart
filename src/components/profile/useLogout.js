import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "../axiosInstance";
import { logout } from "../../redux/authSlice";
import { clearCart } from "../../redux/cartSlice";
import { clearWishlist } from "../../redux/wishlistSlice";
import { qk } from "../../query/queryKeys";

const USER_QUERIES = [
  qk.profile.root,
  qk.profile.orders,
  qk.profile.addresses,
  qk.profile.wallet,
  qk.profile.cart,
  qk.profile.wishlist,
  qk.membership.status,
];

// Signs out on the server, then clears everything held for this shopper on the client.
export default function useLogout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      queryClient.setQueryData(qk.auth.session, { authenticated: false, user: null });
      USER_QUERIES.forEach((queryKey) => queryClient.removeQueries({ queryKey }));
      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_token");
      dispatch(clearCart());
      dispatch(clearWishlist());
      dispatch(logout());
      navigate("/");
    }
  }, [dispatch, navigate, queryClient]);
}
