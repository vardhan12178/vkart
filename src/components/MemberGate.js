import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function MemberGate({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  benefits = [],
  icon: Icon = LockKeyhole,
}) {
  return (
    <main className="premium-page min-h-[calc(100vh-7rem)] bg-[#f6f3ed] px-4 py-8 text-[#1d1c19] sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[1.6rem] border border-black/[0.08] bg-[#fffdf8] md:min-h-[36rem] md:grid-cols-[1.1fr_.9fr]">
        <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1d1c19] text-white">
                <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.8} />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a85d37]">
                {eyebrow}
              </span>
            </div>

            <h1 className="max-w-2xl font-editorial text-[2.8rem] font-normal leading-[0.95] tracking-[-0.04em] text-[#1d1c19] sm:text-[4rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#6f6b62] sm:text-base">
              {description}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to={primaryTo}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#1d1c19] px-6 text-sm font-bold text-white transition-colors hover:bg-black"
            >
              {primaryLabel} <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
            <Link
              to={secondaryTo}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-bold text-[#5f5a52] transition-colors hover:bg-black/[0.035] hover:text-[#1d1c19]"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>

        <aside className="relative flex flex-col justify-end overflow-hidden bg-[#1d1c19] p-7 text-white sm:p-10 lg:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/[0.06]" />
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/[0.06]" />

          <p className="relative mb-8 max-w-sm font-editorial text-3xl leading-[1.05] tracking-[-0.03em] text-white">
            Everything stays considered, secure, and ready when you return.
          </p>

          <div className="relative divide-y divide-white/[0.09] border-y border-white/[0.09]">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="grid grid-cols-[2rem_1fr] gap-3 py-5">
                <span className="pt-0.5 text-xs font-bold text-[#d18b64]">0{index + 1}</span>
                <div>
                  <h2 className="text-sm font-bold text-white">{benefit.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-white/55">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
