import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "../axiosInstance";
import { qk } from "../../query/queryKeys";
import { logout } from "../../redux/authSlice";
import { clearCart } from "../../redux/cartSlice";
import { clearWishlist } from "../../redux/wishlistSlice";

export default function useHeaderLogout() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      queryClient.setQueryData(qk.auth.session, { authenticated: false, user: null });
      [
        qk.profile.root,
        qk.profile.orders,
        qk.profile.addresses,
        qk.profile.wallet,
        qk.profile.cart,
        qk.profile.wishlist,
        qk.membership.status,
      ].forEach((queryKey) => {
        queryClient.removeQueries({ queryKey });
      });
      dispatch(clearCart());
      dispatch(clearWishlist());
      dispatch(logout());
      navigate("/", { replace: true });
    }
  };
}
