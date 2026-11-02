import { useEffect, useState } from "react";
import { fetchProduct, fetchSimilar, defaultVariant, toCardFromDetail } from "../catalogApi";
import { readRecent, pushRecent } from "../recentlyViewed";

// Loads a product (plus similar items) and resets per-product state whenever the slug changes.
export default function useProduct(slug, linkedSku) {
  const [p, setP] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing | error
  const [similar, setSimilar] = useState([]);
  const [recent, setRecent] = useState([]);
  const [opts, setOpts] = useState({});
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setStatus("loading");
    setSimilar([]);
    window.scrollTo(0, 0);
    fetchProduct(slug)
      .then((prod) => {
        if (!live) return;
        if (!prod) {
          setP(null);
          setStatus("missing");
          return;
        }
        setP(prod);
        // ?variant=<sku> opens that exact option (shared links, refreshes)
        const linked = prod.variants.find((v) => v.sku === linkedSku);
        setOpts((linked || defaultVariant(prod)).options);
        setImgIdx(0);
        setQty(1);
        setNotice("");
        setRecent(readRecent().filter((c) => c.slug !== prod.slug));
        pushRecent(toCardFromDetail(prod));
        setStatus("ready");
        fetchSimilar(slug)
          .then((res) => live && setSimilar(res?.products || []))
          .catch(() => {});
      })
      .catch(() => live && setStatus("error"));
    return () => {
      live = false;
    };
    // linkedSku is only read when a product loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, attempt]);

  return {
    p,
    status,
    similar,
    recent,
    opts,
    setOpts,
    imgIdx,
    setImgIdx,
    qty,
    setQty,
    notice,
    setNotice,
    retry: () => setAttempt((n) => n + 1),
  };
}
