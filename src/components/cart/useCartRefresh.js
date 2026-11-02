import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "../axiosInstance";
import { refreshCartLines } from "../../redux/cartSlice";

// Refreshes price and stock of catalog lines from the server so the bag never shows stale values.
export default function useCartRefresh(cartItems) {
  const dispatch = useDispatch();
  const key = cartItems
    .filter((it) => it.catalog === "v2")
    .map((it) => `${it.productId}:${it.sku}:${it.quantity}`)
    .join("|");

  useEffect(() => {
    const lines = cartItems.filter((it) => it.catalog === "v2" && it.productId && it.sku);
    if (!lines.length) return;
    axios
      .post("/api/v2/cart/resolve", {
        items: lines.map((it) => ({
          productId: String(it.productId),
          sku: it.sku,
          quantity: it.quantity,
        })),
      })
      .then(({ data }) => dispatch(refreshCartLines(data?.items || [])))
      .catch(() => {
        /* keep the stored values; the server re-prices at checkout anyway */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
