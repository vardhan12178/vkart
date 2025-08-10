import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SearchIcon,
  MapIcon,
  BriefcaseIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";

// ---- Mock roles (swap with API later) --------------------------------------
const ROLES = [
  {
    id: "fe-1",
    title: "Frontend Engineer",
    dept: "Engineering",
    location: "Remote (India)",
    type: "Full-time",
    level: "Mid–Senior",
    posted: "2025-07-20",
    blurb:
      "Ship delightful interfaces in React, own component quality, and collaborate with design.",
    details: {
      responsibilities: [
        "Build and maintain reusable React components",
        "Own accessibility and performance budgets",
        "Collaborate with Design on the Vkart UI system",
      ],
      requirements: [
        "3+ years in React + TypeScript",
        "Familiar with Tailwind and state management",
        "Strong sense for UX quality",
      ],
    },
  },
  {
    id: "pd-1",
    title: "Product Designer",
    dept: "Design",
    location: "Remote (Anywhere)",
    type: "Full-time",
    level: "Mid",
    posted: "2025-07-12",
    blurb:
      "Craft intuitive flows, run quick UX experiments, and evolve the Vkart design system.",
    details: {
      responsibilities: [
        "Create wireframes, prototypes, and polished UI",
        "Run lightweight usability tests",
        "Partner with PM + Eng on delivery",
      ],
      requirements: [
        "2+ years in product design",
        "Portfolio showing shipped work",
        "Figma proficiency",
      ],
    },
  },
  {
    id: "be-1",
    title: "Backend Engineer",
    dept: "Engineering",
    location: "Hyderabad",
    type: "Contract",
    level: "Junior",
    posted: "2025-06-30",
    blurb:
      "Build APIs, tune performance, and work with Node + PostgreSQL on core commerce features.",
    details: {
      responsibilities: [
        "Design REST/GraphQL endpoints",
        "Write tests and monitor performance",
        "Collaborate on deployment pipelines",
      ],
      requirements: [
        "Solid JS/TS fundamentals",
        "Node + SQL experience",
        "Good debugging habits",
      ],
    },
  },
];

const uniq = (arr) => Array.from(new Set(arr));
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

// Lightweight Toast system (no deps)
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = (msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    // auto-remove after 3.2s
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  };
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, add, remove };
}

const Toasts = ({ stack, onClose }) => (
  <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
    {stack.map((t) => (
      <div
        key={t.id}
        className="pointer-events-auto flex items-start gap-3 rounded-xl border border-emerald-200 bg-white/95 p-3 shadow-lg"
      >
        <CheckCircleIcon className="mt-0.5 h-5 w-5 text-emerald-600" />
        <div className="text-sm text-gray-800">{t.msg}</div>
        <button
          onClick={() => onClose(t.id)}
          className="ml-auto rounded-md p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    ))}
  </div>
);

const Careers = () => {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [loc, setLoc] = useState("All");
  const [openId, setOpenId] = useState(null); // expand inline details
  const { toasts, add, remove } = useToasts();

  const departments = useMemo(() => ["All", ...uniq(ROLES.map((r) => r.dept))], []);
  const locations = useMemo(() => ["All", ...uniq(ROLES.map((r) => r.location))], []);

  const filtered = useMemo(() => {
    let list = [...ROLES];
    if (dept !== "All") list = list.filter((r) => r.dept === dept);
    if (loc !== "All") list = list.filter((r) => r.location === loc);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          r.blurb.toLowerCase().includes(s) ||
          r.dept.toLowerCase().includes(s)
      );
    }
    // newest first
    list.sort((a, b) => new Date(b.posted) - new Date(a.posted));
    return list;
  }, [q, dept, loc]);

  const onApply = (role) => {
    add(`Application submitted for ${role.title}. We\'ll be in touch!`);
  };

  return (
    <main className="relative min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* soft background accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="container mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-14">
        {/* Hero */}
        <section className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Join <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Vkart</span>
          </h1>
          <p className="mt-3 text-lg text-gray-700">
            Not a real hiring board for this portfolio — but here’s how our careers page would feel.
          </p>
        </section>

        {/* Filters */}
        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search roles, teams…"
              className="w-full rounded-xl border border-gray-200 bg-white/80 pl-10 pr-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Listings */}
        <section className="mt-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-8">
              <h3 className="text-xl font-semibold text-gray-900">No roles match</h3>
              <p className="mt-1 text-gray-600">Try a different search, department, or location.</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {filtered.map((r) => {
                const isOpen = openId === r.id;
                return (
                  <li key={r.id} className="group overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white shadow hover:shadow-md">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{r.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{r.blurb}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700">
                          <BriefcaseIcon className="h-4 w-4" /> {r.dept}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1.5"><MapIcon className="h-4 w-4" /> {r.location}</span>
                        <span className="inline-flex items-center gap-1.5"><ClockIcon className="h-4 w-4" /> {r.type}</span>
                        <span className="text-gray-500">{r.level} · Posted {formatDate(r.posted)}</span>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : r.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-gray-900 hover:border-gray-400"
                        >
                          {isOpen ? (
                            <>Hide details <ChevronDownIcon className="h-4 w-4 rotate-180" /></>
                          ) : (
                            <>View details <ChevronRightIcon className="h-4 w-4" /></>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onApply(r)}
                          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-medium text-white shadow hover:bg-orange-700"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Inline expandable details */}
                      {isOpen && (
                        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">Responsibilities</h4>
                              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                                {r.details.responsibilities.map((it) => (
                                  <li key={it}>{it}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Requirements</h4>
                              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                                {r.details.requirements.map((it) => (
                                  <li key={it}>{it}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Perks */}
        <section className="mt-12">
          <div className="mb-4 text-sm font-medium text-gray-800 inline-flex items-center gap-2">
            {/* simple star svg to avoid extra imports */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.56 5.8 22 7 14.14l-5-4.87 7.1-1.01L12 2z"/></svg>
            Life at Vkart
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "Remote-first",
                d: "Work from anywhere, sync async, and meet quarterly for team onsites.",
              },
              {
                t: "Learning budget",
                d: "Annual stipend for courses, books, and conferences.",
              },
              { t: "Flexible hours", d: "Own your calendar — outcomes over hours." },
            ].map((p) => (
              <div key={p.t} className="rounded-2xl ring-1 ring-gray-200 bg-white p-5 shadow">
                <h4 className="font-semibold text-gray-900">{p.t}</h4>
                <p className="mt-1 text-gray-700">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <p className="mt-8 text-sm text-gray-600">
          Curious about our work? Check the {" "}
          <Link to="/about" className="text-orange-700 hover:underline">About</Link> page.
        </p>
      </div>

      {/* Toasts stack */}
      <Toasts stack={toasts} onClose={remove} />
    </main>
  );
};

export default Careers;
