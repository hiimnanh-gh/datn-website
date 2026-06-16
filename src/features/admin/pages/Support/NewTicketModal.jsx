import React, { useState } from "react";

export const NewTicketModal = ({ onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 1500);
  };
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="bg-[#131b2e] px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-bold text-[15px]">
              Submit Support Ticket
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {done ? (
            <div className="p-8 text-center">
              <span
                className="material-symbols-outlined text-green-500 text-[56px] block mb-3"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <p className="text-[16px] font-bold text-gray-900">
                Ticket Submitted!
              </p>
              <p className="text-[13px] text-gray-500 mt-1">
                Our team will respond within 4 business hours.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2.5 bg-[#2563eb] text-white rounded-xl text-[13px] font-bold hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                  Title
                </label>
                <input
                  placeholder="Brief description of the issue…"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Priority
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Category
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
                    <option>Technical</option>
                    <option>GPS / Fleet</option>
                    <option>Account</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue in detail…"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default NewTicketModal;
