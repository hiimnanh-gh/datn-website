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
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
          {openCount} open tickets
        </span>
        <button
          onClick={() => setTicketModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#2563eb] text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
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
    <div className="max-w-[1100px] mx-auto pb-12 space-y-6">
      {ticketModal && <NewTicketModal onClose={() => setTicketModal(false)} />}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-blue-600 text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              help
            </span>
            Help & Support
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Documentation, tickets, and contact resources
          </p>
        </div>
        <button
          onClick={() => setTicketModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>New
          Ticket
        </button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: "menu_book",
            label: "Documentation",
            desc: "Full admin user guide",
            color: "bg-blue-600",
            href: "#",
          },
          {
            icon: "play_circle",
            label: "Video Tutorials",
            desc: "Step-by-step walkthroughs",
            color: "bg-purple-600",
            href: "#",
          },
          {
            icon: "chat",
            label: "Live Chat",
            desc: "Chat with support team",
            color: "bg-green-600",
            href: "#",
          },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <div
              className={`${l.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}
            >
              <span
                className="material-symbols-outlined text-white text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {l.icon}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-[14px]">{l.label}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{l.desc}</p>
            </div>
            <span className="material-symbols-outlined text-gray-300 ml-auto group-hover:text-blue-400 transition-colors">
              arrow_forward
            </span>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">
                quiz
              </span>
              Frequently Asked Questions
            </h3>
            <div className="relative mt-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions…"
                className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          <div className="p-4 space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((f, i) => <Accordion key={i} q={f.q} a={f.a} />)
            ) : (
              <div className="text-center py-8 text-gray-400">
                <span className="material-symbols-outlined text-[40px] block mb-2">
                  search_off
                </span>
                <p className="text-[13px]">No results found</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">
                confirmation_number
              </span>
              Recent Tickets
            </h3>
            <span className="text-[11px] text-gray-400">
              {TICKETS.filter((t) => t.status !== "Resolved").length} open
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {TICKETS.map((t) => (
              <div
                key={t.id}
                className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-gray-400 font-bold">
                      {t.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[t.priority]}`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-400 transition-colors text-[18px] flex-shrink-0">
                    open_in_new
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-gray-800">
                  {t.title}
                </p>
                <div className="flex gap-4 mt-1.5 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">
                      calendar_today
                    </span>
                    {t.created}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">
                      person
                    </span>
                    {t.assignee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 text-[15px] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">
            contact_support
          </span>
          Contact Support Team
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: "phone",
              label: "Phone Support",
              value: "1800 115 000",
              note: "Mon–Fri 8:00–18:00",
              color: "text-green-600",
            },
            {
              icon: "email",
              label: "Email",
              value: "support@ems.vn",
              note: "Response within 4h",
              color: "text-blue-600",
            },
            {
              icon: "emergency",
              label: "Critical Escalation",
              value: "0908 000 115",
              note: "24/7 on-call",
              color: "text-red-600",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="p-2.5 rounded-xl bg-white border border-gray-100">
                <span
                  className={`material-symbols-outlined ${c.color} text-[20px]`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {c.icon}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-semibold">
                  {c.label}
                </p>
                <p className="text-[14px] font-bold text-gray-900">{c.value}</p>
                <p className="text-[11px] text-gray-400">{c.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
