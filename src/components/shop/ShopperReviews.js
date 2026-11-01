import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Star, ThumbsUp } from "lucide-react";
import axios from "../axiosInstance";
import { Bone, Dots, SkeletonRegion } from "../ui/Skeleton";
import { showToast } from "../../utils/toast";

// Reviews from shoppers whose order was delivered ("Verified buyer"). Anyone can read them;
// the write form appears only for a shopper who received this product and hasn't reviewed it yet.

const SORTS = [
  { key: "recent", label: "Newest" },
  { key: "helpful", label: "Most helpful" },
  { key: "high", label: "Highest rated" },
  { key: "low", label: "Lowest rated" },
];
const fmtDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const errText = (e) => e?.response?.data?.message || e?.response?.data?.errors?.[0]?.msg || "Something went wrong. Please try again.";

export function StarPicker({ value, onChange, label = "Your rating" }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <div className="mt-1 flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            className="rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Star className={`h-7 w-7 ${n <= value ? "fill-accent text-accent" : "text-line-strong"}`} strokeWidth={1.6} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ReviewForm({ slug, initial, onDone }) {
  const qc = useQueryClient();
  const [stars, setStars] = useState(initial?.stars || 0);
  const [title, setTitle] = useState(initial?.title || "");
  const [body, setBody] = useState(initial?.body || "");
  const [error, setError] = useState("");
  const editing = Boolean(initial);

  const save = useMutation({
    mutationFn: () => (editing
      ? axios.put(`/api/v2/reviews/${initial.id}`, { stars, title, body })
      : axios.post(`/api/v2/products/${slug}/reviews`, { stars, title, body })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopper-reviews", slug] });
      showToast(editing ? "Review updated" : "Thanks! Your review is live");
      onDone?.();
    },
    onError: (e) => setError(errText(e)),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!stars) return setError("Pick a star rating first.");
    if (body.trim().length < 10) return setError("Write at least 10 characters about the product.");
    setError("");
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-line bg-sand p-4" noValidate>
      <StarPicker value={stars} onChange={setStars} />
      <div>
        <label htmlFor="rv-title" className="text-sm font-semibold text-ink">Headline <span className="font-normal text-muted">(optional)</span></label>
        <input id="rv-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-accent focus:ring-0" placeholder="What stood out?" />
      </div>
      <div>
        <label htmlFor="rv-body" className="text-sm font-semibold text-ink">Your review</label>
        <textarea id="rv-body" value={body} maxLength={1500} rows={4} onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-accent focus:ring-0" placeholder="How is it in daily use? Battery, build, value for money…" />
        <p className="mt-1 text-right text-xs text-muted">{body.length}/1500</p>
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-alert">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-bold text-white hover:bg-black disabled:opacity-70">
          {save.isPending ? <>Saving <Dots /></> : editing ? "Save changes" : "Post review"}
        </button>
        {onDone && <button type="button" onClick={onDone} className="rounded-full border border-line-strong px-5 py-2 text-sm font-semibold text-ink hover:bg-tint">Cancel</button>}
      </div>
    </form>
  );
}

function Card({ r, slug, signedIn, onEdit }) {
  const qc = useQueryClient();
  const vote = useMutation({
    mutationFn: () => axios.post(`/api/v2/reviews/${r.id}/helpful`).then((x) => x.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopper-reviews", slug] }),
    onError: (e) => showToast(errText(e), "error"),
  });
  const del = useMutation({
    mutationFn: () => axios.delete(`/api/v2/reviews/${r.id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shopper-reviews", slug] }); showToast("Review deleted"); },
    onError: (e) => showToast(errText(e), "error"),
  });
  return (
    <article className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-0.5 rounded bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">
          {r.stars} <Star className="h-2.5 w-2.5 fill-star text-star" aria-hidden="true" /><span className="sr-only">out of 5 stars</span>
        </span>
        {r.title && <h4 className="text-sm font-semibold text-ink">{r.title}</h4>}
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ok"><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />Verified buyer</span>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{r.body}</p>
      {r.variant && <p className="mt-2 text-xs text-muted">{r.variant}</p>}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span><span className="font-semibold text-ink-soft">{r.name}</span> · {fmtDate(r.date)}</span>
        {r.mine ? (
          <span className="flex gap-3">
            <button type="button" onClick={onEdit} className="font-semibold text-accent hover:underline">Edit</button>
            <button type="button" disabled={del.isPending} onClick={() => window.confirm("Delete your review?") && del.mutate()} className="font-semibold text-alert hover:underline">Delete</button>
          </span>
        ) : (
          <button type="button" aria-pressed={r.voted} disabled={!signedIn || vote.isPending} onClick={() => vote.mutate()}
            title={signedIn ? undefined : "Sign in to vote"}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition disabled:opacity-60 ${r.voted ? "border-ink text-ink" : "border-line-strong hover:border-ink"}`}>
            <ThumbsUp className="h-3 w-3" aria-hidden="true" /> Helpful{r.helpful > 0 ? ` (${r.helpful})` : ""}
          </button>
        )}
      </div>
    </article>
  );
}

export default function ShopperReviews({ slug }) {
  const signedIn = useSelector((s) => s.auth?.isAuthenticated);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [writing, setWriting] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shopper-reviews", slug, sort, page, Boolean(signedIn)],
    queryFn: () => axios.get(`/api/v2/products/${slug}/reviews`, { params: { sort, page, limit: 5 }, withCredentials: true }).then((r) => r.data),
    placeholderData: keepPreviousData,
    retry: false,
  });

  // Older backends without the endpoint: hide the section instead of showing an error
  if (isError) return null;

  return (
    <section id="verified-reviews" aria-labelledby="verified-reviews-title" className="scroll-mt-24 rounded-3xl bg-paper p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="verified-reviews-title" className="text-xl font-bold text-ink">
          Verified buyer reviews{data ? ` (${data.total})` : ""}
        </h2>
        {data?.total > 1 && (
          <label className="flex items-center gap-2 text-xs text-muted">
            Sort by
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="rounded-lg border border-line bg-white py-1 pl-2 pr-7 text-xs font-semibold text-ink focus:border-accent focus:ring-0">
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
        )}
      </div>

      {isLoading && (
        <SkeletonRegion label="Loading reviews" className="mt-4 space-y-3">
          <Bone className="h-4 w-1/3" /><Bone className="h-3 w-full" /><Bone className="h-3 w-4/5" />
        </SkeletonRegion>
      )}

      {data && (
        <>
          {data.canReview && !writing && (
            <button type="button" onClick={() => setWriting(true)}
              className="mt-3 rounded-full border-2 border-ink px-5 py-2 text-sm font-bold text-ink transition hover:bg-ink hover:text-white">
              Write a review
            </button>
          )}
          {data.canReview && writing && <ReviewForm slug={slug} onDone={() => setWriting(false)} />}
          {data.myReview && editing && <ReviewForm slug={slug} initial={data.myReview} onDone={() => setEditing(false)} />}

          {!data.canReview && !data.myReview && (
            <p className="mt-2 text-xs text-muted">
              {signedIn ? "Only shoppers whose order was delivered can review a product." : <>Bought this? <Link to="/login" className="font-semibold text-accent hover:underline">Sign in</Link> to review it once it's delivered.</>}
            </p>
          )}

          <div className="mt-4">
            {data.reviews.length === 0 && <p className="text-sm text-muted">No reviews from buyers yet. Be the first once your order arrives.</p>}
            {data.reviews.map((r) => <Card key={r.id} r={r} slug={slug} signedIn={signedIn} onEdit={() => setEditing(true)} />)}
          </div>

          {data.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-line-strong px-4 py-1.5 font-semibold disabled:opacity-40">Previous</button>
              <span className="text-xs text-muted">Page {page} of {data.pages}</span>
              <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded-full border border-line-strong px-4 py-1.5 font-semibold disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
