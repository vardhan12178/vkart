import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { removeFromWishlist, clearWishlist } from "../redux/wishlistSlice";
import { addToCart } from "../redux/cartSlice";
import {
  FaArrowRight,
  FaCartPlus,
  FaHeart,
  FaShoppingBag,
  FaTrash,
} from "react-icons/fa";
import { showToast } from "../utils/toast";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const keyOf = (item) =>
  item?._id || item?.productId || item?.externalId || item?.id;

const productPath = (item) =>
  `/product/${item?._id || item?.productId || item?.id}`;

const categoryName = (category = "") =>
  category.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function Wishlist() {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist);
  const count = wishlist.length;

  const moveToCart = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
    dispatch(removeFromWishlist(keyOf(item)));
    showToast("Moved to cart", "success");
  };

  const removeItem = (item) => {
    dispatch(removeFromWishlist(keyOf(item)));
    showToast("Removed from saved items", "success");
  };

  const clearSavedItems = () => {
    dispatch(clearWishlist());
    showToast("Saved items cleared", "success");
  };

  return (
    <main className="premium-page premium-wishlist min-h-screen bg-[#f6f3ed] text-[#1d1c19]">
      <Helmet>
        <title>Saved Items | VKart</title>
        <meta
          name="description"
          content="Revisit your saved VKart products and move your favourites to the bag."
        />
      </Helmet>

      <section className="wishlist-masthead border-b border-black/[0.08] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a85d37]">
              Your personal edit
            </p>
            <span className="h-3 w-px bg-black/15" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a857b]">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end lg:gap-12">
            <h1 className="max-w-3xl font-editorial text-4xl leading-[0.94] tracking-[-0.04em] text-[#1d1c19] sm:text-5xl lg:text-6xl">
              Worth another look.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-[#6f6b62] lg:pb-1 lg:text-[15px] lg:leading-7">
              A considered shortlist of the pieces that caught your eye—kept together until you are ready to choose.
            </p>
          </div>
        </div>
      </section>

      {count > 0 ? (
        <>
          <section className="wishlist-toolbar border-b border-black/[0.08] bg-[#f6f3ed]/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a85d37]/10 text-[#a85d37]">
                  <FaHeart size={13} />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#1d1c19]">Saved collection</p>
                  <p className="hidden text-xs text-[#8a857b] sm:block">Ready when you are</p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearSavedItems}
                className="wishlist-clear-button"
                aria-label="Clear all saved items"
              >
                <FaTrash size={10} />
                Clear list
              </button>
            </div>
          </section>

          <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {wishlist.map((item) => {
                  const key = keyOf(item);
                  const selling = item.price || 0;
                  const discount = Number(item.discountPercentage) || 0;
                  const mrp = discount > 0 ? selling / (1 - discount / 100) : null;
                  const image = item.thumbnail || item.images?.[0];

                  return (
                    <article
                      key={key}
                      className="wishlist-product group overflow-hidden rounded-[1.25rem] border border-black/[0.08] bg-[#fbfaf7] transition duration-300 hover:-translate-y-1 hover:border-black/[0.14] hover:shadow-[0_20px_50px_rgba(30,27,22,0.09)]"
                    >
                      <Link
                        to={productPath(item)}
                        className="block"
                        aria-label={`View ${item.title}`}
                      >
                        <div className="relative aspect-[1.08/1] overflow-hidden bg-[#ebe7df] p-6 sm:p-7">
                          {image ? (
                            <img
                              src={image}
                              alt={item.title}
                              className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[#b6b0a5]">
                              <FaShoppingBag size={30} />
                            </div>
                          )}

                          {discount > 0 && (
                            <span className="absolute left-3 top-3 rounded-full border border-[#a85d37]/15 bg-[#f6eee8]/95 px-2.5 py-1 text-[10px] font-bold tracking-[0.04em] text-[#925033] backdrop-blur-sm">
                              Save {Math.round(discount)}%
                            </span>
                          )}

                          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.07] bg-[#fbfaf7]/90 text-[#a85d37] shadow-sm backdrop-blur-sm">
                            <FaHeart size={11} />
                          </span>
                        </div>
                      </Link>

                      <div className="flex min-h-[208px] flex-col p-4 sm:p-5">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a9489]">
                          {categoryName(item.category) || "VKart selection"}
                        </p>
                        <Link to={productPath(item)}>
                          <h3 className="wishlist-product-title line-clamp-2 min-h-[2.7rem] text-[15px] font-bold leading-[1.4] tracking-[-0.01em] text-[#282621] transition-colors hover:text-[#925033]">
                            {item.title}
                          </h3>
                        </Link>

                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-lg font-black tracking-[-0.025em] text-[#1d1c19]">
                            {INR(selling)}
                          </span>
                          {mrp && (
                            <span className="text-xs text-[#a5a096] line-through">
                              {INR(mrp)}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex gap-2 pt-4">
                          <button
                            type="button"
                            onClick={() => moveToCart(item)}
                            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#1d1c19] px-4 text-xs font-bold text-white shadow-[0_8px_20px_rgba(29,28,25,0.12)] transition hover:bg-[#34312c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1c19]/30 focus-visible:ring-offset-2"
                          >
                            <FaCartPlus size={12} /> Move to bag
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/[0.09] bg-transparent text-[#8a857b] transition-colors hover:border-[#a85d37]/25 hover:bg-[#a85d37]/[0.07] hover:text-[#925033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a85d37]/30 focus-visible:ring-offset-2"
                            aria-label={`Remove ${item.title} from saved items`}
                            title="Remove from saved items"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="wishlist-continue mt-10 flex flex-col items-start justify-between gap-5 rounded-[1.5rem] border border-black/[0.08] bg-[#ebe6dc] px-6 py-6 sm:flex-row sm:items-center sm:px-8">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85d37]">
                    Keep looking
                  </p>
                  <h2 className="font-editorial text-2xl leading-tight tracking-[-0.025em] text-[#1d1c19] sm:text-3xl">
                    Your next good find is waiting.
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-[#1d1c19] px-6 text-sm font-bold text-white transition hover:bg-[#34312c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1c19]/30 focus-visible:ring-offset-2"
                >
                  Continue shopping <FaArrowRight size={12} />
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.5rem] border border-black/[0.08] bg-[#ebe6dc] lg:grid-cols-[.8fr_1.2fr]">
            <div className="flex min-h-[270px] items-center justify-center border-b border-black/[0.08] p-8 lg:border-b-0 lg:border-r">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#a85d37]/15 bg-[#f6f3ed] text-[#a85d37] shadow-[0_18px_45px_rgba(29,28,25,0.08)]">
                <FaHeart size={34} />
              </div>
            </div>
            <div className="flex flex-col items-start justify-center p-8 sm:p-12 lg:p-16">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#a85d37]">
                Start your edit
              </p>
              <h2 className="max-w-xl font-editorial text-3xl leading-[1] tracking-[-0.035em] text-[#1d1c19] sm:text-5xl">
                Nothing saved—yet.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#6f6b62] sm:text-[15px] sm:leading-7">
                Tap the heart on anything worth remembering. We will keep it here so it is easy to find again.
              </p>
              <Link
                to="/products"
                className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#1d1c19] px-6 text-sm font-bold text-white transition hover:bg-[#34312c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1c19]/30 focus-visible:ring-offset-2"
              >
                Explore the collection <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
