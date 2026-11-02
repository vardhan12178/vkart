import { useDispatch } from "react-redux";
import { addToCart, cartItemKey, removeFromCart } from "../../redux/cartSlice";
import { removeFromWishlist, toggleWishlist, wishlistItemKey } from "../../redux/wishlistSlice";
import { cartItemFromSaved } from "../shop/shopItems";
import { showToast } from "../../utils/toast";

// "Save for later" and "Move to cart".
export default function useCartMoves() {
  const dispatch = useDispatch();

  const moveToWishlist = (item) => {
    dispatch(removeFromCart(cartItemKey(item)));
    dispatch(toggleWishlist(item));
    showToast("Moved to Wishlist", "success");
  };

  const moveToCart = (item) => {
    let line = { ...item, quantity: 1 };
    if (item.catalog === "v2") {
      line = cartItemFromSaved(item);
      if (!line) {
        showToast("Open the product to choose a variant", "info");
        return;
      }
    }
    dispatch(addToCart(line));
    dispatch(removeFromWishlist(wishlistItemKey(item)));
    showToast("Moved to Cart", "success");
  };

  return { moveToWishlist, moveToCart };
}
