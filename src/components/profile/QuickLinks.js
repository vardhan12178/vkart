import React, { useState } from "react";
import { Link } from "react-router-dom";
import SupportChatWidget from "../support/SupportChatWidget";
import { InfoIcon, MailIcon, PackageOpenIcon } from "../ui/icons";

const CARD =
  "group bg-white p-3 sm:p-4 rounded-2xl border border-line shadow-2xs hover:shadow-md transition-all text-left w-full";

function Tile({ icon, title, desc, color, bg }) {
  return (
    <div className="text-center sm:text-left">
      <div className={`p-2 rounded-xl ${bg} ${color} text-sm sm:text-base inline-flex mb-1.5`}>
        {icon}
      </div>
      <h4 className="font-bold text-ink text-xs sm:text-sm">{title}</h4>
      <p className="text-[10px] text-muted-light truncate hidden sm:block mt-0.5">{desc}</p>
    </div>
  );
}

export default function QuickLinks() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        <Link to="/products" className={CARD}>
          <Tile
            icon={<PackageOpenIcon />}
            title="Shop"
            desc="Browse items"
            color="text-accent"
            bg="bg-accent/10"
          />
        </Link>
        <Link to="/about" className={CARD}>
          <Tile
            icon={<InfoIcon />}
            title="About"
            desc="Our story"
            color="text-ink-soft"
            bg="bg-tint"
          />
        </Link>
        <button type="button" onClick={() => setChatOpen(true)} className={CARD}>
          <Tile
            icon={<MailIcon />}
            title="Support"
            desc="Live chat"
            color="text-ink-soft"
            bg="bg-tint"
          />
        </button>
      </div>
      <SupportChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
