import { useState, useEffect } from "react";
import useTopbarStore from "../../../../store/useTopbarStore";

// Styles
import "./Support.css";

// Sub-components
import { Accordion } from "./Accordion";
import { NewTicketModal } from "./NewTicketModal";

// Data
import {
  FAQS,
  TICKETS,
  PRIORITY_BADGE,
  STATUS_BADGE,
} from "./data";

const Support = () => {
  const [ticketModal, setTicketModal] = useState(false);
  const [search, setSearch] = useState("");
  const { setSlot, clearSlot } = useTopbarStore();

  const openCount = TICKETS.filter((t) => t.status !== "Resolved").length;

  /* ── Topbar slot: open tickets + quick button ── */
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-900/40 border border-indigo-800 text-indigo-300">
          {openCount} open tickets
        </span>
        <button
          onClick={() => setTicketModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[12px]">add</span>
          New Ticket
        </button>
      </div>,
    );
    return () => clearSlot();
  }, [ticketModal]);

  const filteredFaqs = FAQS.filter(
    (f) => !search || f.q.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-12 space-y-6 max-w-[1100px] mx-auto">
      {ticketModal && <NewTicketModal onClose={() => setTicketModal(false)} />}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-white flex items-center gap-2">
            <span
              className="material-symbols-outlined text-indigo-400 text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              help
            </span>
            Help & Support
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Documentation, tickets, and contact resources
          </p>
        </div>
        <button
          onClick={() => setTicketModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>New
          Ticket
        </button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "menu_book",    label: "Documentation",  desc: "Full admin user guide",        color: "bg-indigo-600", href: "#" },
          { icon: "play_circle",  label: "Video Tutorials", desc: "Step-by-step walkthroughs",    color: "bg-purple-600", href: "#" },
          { icon: "chat",         label: "Live Chat",       desc: "Chat with support team",       color: "bg-emerald-600",href: "#" },
        ].map((l) => (
          <a key={l.label} href={l.href}
            className="flex items-center gap-4 p-5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
            <div className={`${l.color} p-3 rounded-xl group-hover:scale-110 transition-transform opacity-90`}>
              <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{l.icon}</span>
            </div>
            <div>
              <p className="font-bold text-white text-[14px]">{l.label}</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{l.desc}</p>
            </div>
            <span className="material-symbols-outlined text-slate-700 ml-auto group-hover:text-indigo-400 transition-colors">arrow_forward</span>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[18px]">quiz</span>
              Frequently Asked Questions
            </h3>
            <div className="relative mt-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions…"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
              />
            </div>
          </div>
          <div className="p-4 space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((f, i) => <Accordion key={i} q={f.q} a={f.a} />)
            ) : (
              <div className="text-center py-8 text-slate-600">
                <span className="material-symbols-outlined text-[40px] block mb-2">search_off</span>
                <p className="text-[13px]">No results found</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket list */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[18px]">confirmation_number</span>
              Recent Tickets
            </h3>
            <span className="text-[11px] text-slate-400">
              {TICKETS.filter((t) => t.status !== "Resolved").length} open
            </span>
          </div>
          <div className="divide-y divide-slate-800">
            {TICKETS.map((t) => (
              <div key={t.id} className="px-5 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-500 font-bold">{t.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[t.priority]}`}>{t.priority}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-700 group-hover:text-indigo-400 transition-colors text-[18px] flex-shrink-0">open_in_new</span>
                </div>
                <p className="text-[13px] font-semibold text-slate-200">{t.title}</p>
                <div className="flex gap-4 mt-1.5 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                    {t.created}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                    {t.assignee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h3 className="font-bold text-white text-[15px] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400 text-[18px]">contact_support</span>
          Contact Support Team
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "phone",     label: "Phone Support",      value: "1800 115 000",  note: "Mon–Fri 8:00–18:00", color: "text-emerald-400" },
            { icon: "email",     label: "Email",              value: "support@ems.vn",note: "Response within 4h", color: "text-indigo-400" },
            { icon: "emergency", label: "Critical Escalation",value: "0908 000 115",  note: "24/7 on-call",       color: "text-red-400" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className={`material-symbols-outlined ${c.color} text-[20px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-semibold">{c.label}</p>
                <p className="text-[14px] font-bold text-white">{c.value}</p>
                <p className="text-[11px] text-slate-500">{c.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
