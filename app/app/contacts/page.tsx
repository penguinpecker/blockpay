"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search, UserPlus } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  handle: string;
  lastInteraction: string;
  initial: string;
  tint: string;
};

const contacts: Contact[] = [
  {
    id: "c-1",
    name: "Sara Liu",
    handle: "@sara",
    lastInteraction: "Yesterday",
    initial: "S",
    tint: "from-[#86efac] to-[#22c55e]",
  },
  {
    id: "c-2",
    name: "Mike Chen",
    handle: "@mike",
    lastInteraction: "2 days ago",
    initial: "M",
    tint: "from-[#7dd3fc] to-[#0ea5e9]",
  },
  {
    id: "c-3",
    name: "Jen Park",
    handle: "@jen",
    lastInteraction: "2h ago",
    initial: "J",
    tint: "from-[#fcd34d] to-[#f59e0b]",
  },
  {
    id: "c-4",
    name: "Theo Vance",
    handle: "@theo",
    lastInteraction: "Apr 30",
    initial: "T",
    tint: "from-[#c4b5fd] to-[#7c3aed]",
  },
  {
    id: "c-5",
    name: "Mia Lopez",
    handle: "@mia",
    lastInteraction: "Apr 24",
    initial: "M",
    tint: "from-[#fda4af] to-[#e11d48]",
  },
  {
    id: "c-6",
    name: "Coffee Club",
    handle: "@coffeeclub",
    lastInteraction: "Yesterday",
    initial: "C",
    tint: "from-[#fdba74] to-[#ea580c]",
  },
  {
    id: "c-7",
    name: "Dev Patel",
    handle: "@dev.eth",
    lastInteraction: "Mar 12",
    initial: "D",
    tint: "from-[#67e8f9] to-[#0891b2]",
  },
];

export default function ContactsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-5"
    >
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            ENS, SNS, and email aliases.
          </p>
        </div>
        <button
          type="button"
          className="btn-pill px-3 py-1.5 text-xs"
          aria-label="Add contact"
        >
          <UserPlus size={14} strokeWidth={2.4} />
          Add
        </button>
      </header>

      <label htmlFor="contact-search" className="sr-only">
        Search contacts
      </label>
      <div className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5 focus-within:border-[rgba(74,222,128,0.45)]">
        <Search size={16} strokeWidth={2} className="text-zinc-500" />
        <input
          id="contact-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or handle"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card-frame-tight px-6 py-10 text-center">
          <p className="text-sm text-zinc-400">No contacts matched.</p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="border-b border-[rgba(255,255,255,0.04)] last:border-b-0"
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-[rgba(74,222,128,0.04)]"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.tint} text-sm font-bold text-[#052e16]`}
                >
                  {c.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">
                    {c.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {c.handle} · {c.lastInteraction}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  className="text-zinc-600"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
