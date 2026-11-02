import React from "react";

export default function Description({ text }) {
  if (!text) return null;
  return (
    <section className="rounded-3xl bg-paper p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-ink">Product description</h2>
      {text.split("\n\n").map((para, i) => (
        <p key={i} className="mt-3 text-sm leading-relaxed text-ink-soft">
          {para}
        </p>
      ))}
    </section>
  );
}
