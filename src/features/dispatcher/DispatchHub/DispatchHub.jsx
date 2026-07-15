import React, { useState, useEffect, useRef } from "react";
import useTopbarStore from "../../../store/useTopbarStore";
import { MOCK_PROVIDERS, INITIAL_INCIDENTS } from "./data";
import ManualSOSEntryForm from "../components/ManualSOSEntryForm";
import "./DispatchHub.css";
import { Lock } from 'lucide-react';

const maskPhone = (phone) => {
  if (!phone) return "";
  // Keeps the country code and first digits, masks the middle, leaves the last two
  return phone.replace(/(\+?\d{2,3}\s?\d{2})\d+(\d{2})/, "$1****$2");
};

const DispatchHub = () => {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [selectedId, setSelectedId] = useState(INITIAL_INCIDENTS[0].id);
  const [providers] = useState(MOCK_PROVIDERS);
  
  // Transcription states
  const [transcripts, setTranscripts] = useState({});
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [typingInput, setTypingInput] = useState("");
  
  // Modal / Confirm States
  const [dispatchSuccess, setDispatchSuccess] = useState(null);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  
  const { setSlot, clearSlot } = useTopbarStore();
  const transcriptEndRef = useRef(null);

  const activeIncident = incidents.find((i) => i.id === selectedId) || incidents[0];
  const selectedProviderObj = activeIncident.providerSelected 
    ? providers.find(p => p.id === activeIncident.providerSelected) 
    : null;

  const handleCreateManualSOS = (payload) => {
    const newId = `EMS-${incidents.length + 102}`;
    const newIncident = {
      id: newId,
      priority: payload.priority,
      category: 'Manual Entry',
      type: 'Đặt khẩn cấp (Manual)',
      timeAgo: '0m 01s',
      status: 'Awaiting Dispatch',
      callerName: payload.callerName,
      callerPhone: payload.callerPhone,
      victimName: payload.victimName,
      victimPhone: payload.callerPhone,
      victimAddress: payload.victimAddress,
      victimConditions: payload.victimConditions,
      genderAge: 'UNKNOWN',
      providerSelected: null,
      userTier: "STANDARD MEMBER",
      transcription: [
        { time: '00:01', sender: 'System', text: `VÉ KHẨN CẤP ĐƯỢC TẠO THỦ CÔNG BỞI ĐIỀU PHỐI VIÊN. Người gọi: ${payload.callerName} (${maskPhone(payload.callerPhone)}).` },
        { time: '00:02', sender: 'System', text: `Vị trí sự cố: ${payload.victimAddress}.` },
        { time: '00:03', sender: 'System', text: `Ghi chú y tế: ${payload.victimConditions}.` },
        { time: '00:05', sender: 'Dispatcher', text: 'Tôi đã khởi tạo yêu cầu điều phối. Đang tìm xe cứu thương thích hợp gần nhất.' }
      ]
    };

    setTranscripts(prev => ({
      ...prev,
      [newId]: newIncident.transcription
    }));

    setIncidents([newIncident, ...incidents]);
    setSelectedId(newId);
    setIsManualFormOpen(false);
  };

  // Initialize transcripts for each incident
  useEffect(() => {
    const initialTranscripts = {};
    incidents.forEach((inc) => {
      initialTranscripts[inc.id] = inc.transcription.slice(0, 2);
    });
    setTranscripts(initialTranscripts);
  }, []);

  // Update topbar details
  useEffect(() => {
    const activeCount = incidents.filter(i => i.status === "Awaiting Dispatch").length;
    setSlot(
      <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-1.5 bg-red-950/50 border border-red-800 text-red-400 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {activeCount} Awaiting Telemetry
        </div>
        <div className="hidden sm:inline-block h-4 w-px bg-slate-800" />
        <div className="hidden md:flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-emerald-400">shield</span>
          Anti-Fraud Moderation Active
        </div>
      </div>
    );
    return () => clearSlot();
  }, [incidents]);

  // Scroll to bottom of chat log
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, isTranscribing, selectedId]);

  // Handle Speech-to-Text Simulation
  const startVoiceAnalysis = () => {
    if (isTranscribing) return;
    
    const totalLines = activeIncident.transcription.length;
    const currentLines = transcripts[activeIncident.id]?.length || 0;
    
    if (currentLines >= totalLines) {
      alert("Cuộc gọi đã được ghi âm phân tích hoàn tất!");
      return;
    }

    setIsTranscribing(true);
    let index = currentLines;

    const interval = setInterval(() => {
      if (index < totalLines) {
        setTranscripts((prev) => ({
          ...prev,
          [activeIncident.id]: [...(prev[activeIncident.id] || []), activeIncident.transcription[index]]
        }));
        index++;
      } else {
        clearInterval(interval);
        setIsTranscribing(false);
      }
    }, 2000);
  };

  // Dispatcher sends manual message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typingInput.trim()) return;

    const newMessage = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sender: "Dispatcher",
      text: typingInput
    };

    setTranscripts((prev) => ({
      ...prev,
      [activeIncident.id]: [...(prev[activeIncident.id] || []), newMessage]
    }));
    setTypingInput("");
  };

  // Direct selection of provider
  const selectProvider = (provId) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === activeIncident.id
          ? { ...inc, providerSelected: provId, status: "Matching with Provider..." }
          : inc
      )
    );

    const provName = providers.find(p => p.id === provId)?.name;
    const selectLog = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sender: "System",
      text: `Đang liên hệ: **${provName}**. Trạng thái: Chờ xác nhận từ tài xế.`
    };

    setTranscripts((prev) => ({
      ...prev,
      [activeIncident.id]: [...(prev[activeIncident.id] || []), selectLog]
    }));
  };

  // Trigger Transfer to Provider & Hospital
  const confirmAndTriggerDispatch = () => {
    if (!activeIncident.providerSelected) return;

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === activeIncident.id
          ? { ...inc, status: "Driver En Route" }
          : inc
      )
    );

    setDispatchSuccess({
      incidentId: activeIncident.id,
      providerName: selectedProviderObj.name,
      fare: selectedProviderObj.fare,
      commission: selectedProviderObj.fare * selectedProviderObj.commissionRate,
      address: activeIncident.victimAddress,
      victim: activeIncident.victimName
    });
  };

  // Helper to highlight emergency words
  const highlightText = (text) => {
    if (typeof text !== "string") return text;
    const keywords = [
      "unconscious", "bất tỉnh", "đau ngực", "ngất xỉu", 
      "gãy chân", "chảy máu", "hen suyễn", "khó thở", "tim tái"
    ];
    let highlighted = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "gi");
      highlighted = highlighted.replace(
        regex,
        `<span class="bg-red-500/20 text-red-400 font-bold border border-red-500/30 px-1 py-0.5 rounded">$1</span>`
      );
    });
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Tactical Dispatch Hub Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <h2 className="text-lg font-bold text-white tracking-wider font-mono">
            COMMAND CENTER - DISPATCH & ANTI-FRAUD
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsManualFormOpen(true)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold px-3 py-1.5 rounded border border-red-800 transition-all active:scale-95 shadow-lg shadow-red-900/30"
          >
            <span className="material-symbols-outlined text-[16px] align-middle">add_circle</span>
            CREATE MANUAL SOS
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        
        {/* LEFT COLUMN: MATCHING ENGINE UI */}
        <section className="col-span-4 flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              MATCHING ENGINE
            </span>
            <span className="text-[10px] text-emerald-400 border border-emerald-900 bg-emerald-950/30 px-2 py-0.5 rounded">
              {providers.length} Fleets Active
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
            {providers.map((p) => {
              const isSelected = activeIncident.providerSelected === p.id;
              const isEligible = p.walletBalance > 0;
              
              const fareVND = p.fare;
              const commissionVND = fareVND * p.commissionRate;
              
              return (
                <div
                  key={p.id}
                  className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors duration-200 text-left relative overflow-hidden
                    ${!isEligible ? "border-slate-800" : isSelected ? "bg-blue-950/20 border-blue-500" : "border-slate-800 bg-slate-900/30 hover:bg-slate-900/50"}`}
                >
                  {/* INELIGIBLE OVERLAY */}
                  {!isEligible && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center border-2 border-slate-800 rounded-xl">
                      <Lock className="text-red-500 mb-2 animate-pulse" size={24} />
                      <span className="text-[10px] font-bold font-mono text-red-500 bg-red-950/80 border border-red-900 px-3 py-1 rounded">
                        INELIGIBLE - INSUFFICIENT PLATFORM FUNDS
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-200 truncate max-w-[200px]">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-yellow-400 flex items-center">
                          ★{p.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Distance: {p.distance} · ETA: {p.eta}
                      </p>
                    </div>

                    <button
                      disabled={!isEligible}
                      onClick={() => selectProvider(p.id)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all active:scale-95 z-0
                        ${isSelected 
                          ? "bg-blue-600 text-white font-mono" 
                          : "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"}`}
                    >
                      {isSelected ? "ĐÃ CHỌN" : "CHỌN ĐƠN VỊ"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">CƯỚC XE</span>
                      <span className="font-bold text-slate-200 text-xs">
                        {fareVND.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">HOA HỒNG</span>
                      <span className="font-bold text-emerald-400 text-xs">
                        {commissionVND.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                  
                  {/* Anti-fraud masked contact indicator */}
                  <div className="text-[9px] text-slate-500 font-mono mt-1 text-right">
                    Contact: <span className="bg-slate-800 px-1 rounded text-slate-400">Platform Mediated</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CENTER COLUMN: SMART RADAR MAP & CONFIRMATION */}
        <section className="col-span-4 flex flex-col h-full bg-slate-900/30 border border-slate-800/50 rounded-xl overflow-hidden relative shadow-2xl">
          
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-blue-400">my_location</span>
              SMART RADAR MAP
            </span>
            <span className="text-[9px] text-slate-500 border border-slate-800 bg-slate-950 px-2 py-0.5 rounded font-mono">
              Live Coordinate Sync
            </span>
          </div>

          <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Grid street layout simulation */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, #475569 19px, #475569 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #475569 19px, #475569 20px)" }}></div>
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0,35% 100%,35%" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 45%,0 45%,100%" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 0,70% 100%,70%" stroke="#cbd5e1" strokeWidth="1.5" />
            </svg>

            {/* Radar sweep animation */}
            <div className="radar-sweep absolute" style={{ top: "50%", left: "50%" }}></div>
            <div className="radar-rings absolute" style={{ top: "calc(50% - 130px)", left: "calc(50% - 130px)" }}></div>

            {/* Incident pulse marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0 bg-red-500 rounded-full pulse-ring z-0"></div>
              <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg relative z-10 animate-ping">
                <span className="material-symbols-outlined text-white text-[14px]">warning</span>
              </div>
            </div>
            
            {/* Top HUD Overlay for Tier Display */}
            <div className="absolute top-4 w-[90%] left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md z-20 text-center">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Active Incident SOS
              </div>
              
              {/* GAMIFIED USER TIER */}
              <div className={`font-black tracking-tight text-lg uppercase bg-clip-text text-transparent mb-1
                ${activeIncident.userTier.includes("GOLD") 
                  ? "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600" 
                  : activeIncident.userTier.includes("SILVER")
                    ? "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500"
                    : "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-700"}`}>
                {activeIncident.userTier}
              </div>
              <div className="text-xs font-mono font-bold text-white">
                {activeIncident.victimAddress}
              </div>
            </div>

            {/* Bottom HUD Overlay for Provider Status */}
            <div className="absolute bottom-4 w-[90%] left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md z-20 text-center">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Provider Status
              </div>
              {selectedProviderObj ? (
                <>
                  <div className="font-bold text-blue-400 text-sm">{selectedProviderObj.name}</div>
                  <div className="text-xs text-slate-300 mt-1">{activeIncident.status}</div>
                </>
              ) : (
                <div className="font-bold text-slate-400 text-sm">NO PROVIDER ASSIGNED YET</div>
              )}
            </div>
          </div>

          {/* Confirm Transfer Dispatch Button */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 shrink-0">
            <button
              onClick={confirmAndTriggerDispatch}
              disabled={!activeIncident.providerSelected}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2 text-xs uppercase
                ${activeIncident.providerSelected 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850"}`}
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              {activeIncident.providerSelected 
                ? "DISPATCH TO DRIVER APP" 
                : "AWAITING PROVIDER SELECTION"}
            </button>
          </div>

        </section>

        {/* RIGHT COLUMN: SOS QUEUE & CHAT WORKSPACE */}
        <section className="col-span-4 flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
          
          {/* Top Half: SOS Queue */}
          <div className="h-1/3 flex flex-col border-b border-slate-800">
            <div className="bg-slate-900/90 px-4 py-2 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                Live SOS Queue
              </span>
              <span className="bg-red-950 text-red-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-800/60">
                {incidents.filter(i => i.status === "Awaiting Dispatch").length} Active
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
              {incidents.map((inc) => {
                const isActive = inc.id === selectedId;
                const isCritical = inc.priority === "CRITICAL";
                return (
                  <article
                    key={inc.id}
                    onClick={() => setSelectedId(inc.id)}
                    className={`cursor-pointer rounded-lg p-3 border transition-all duration-200 relative overflow-hidden text-left
                      ${isActive 
                        ? "bg-slate-800 border-slate-600 shadow-md" 
                        : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80"}`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? "bg-red-500" : "bg-orange-500"}`} />
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-300">
                        #{inc.id} - {inc.category}
                      </span>
                      <span className={`font-mono text-[9px] font-bold ${isCritical ? "text-red-400" : "text-orange-400"}`}>
                        {inc.timeAgo}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Bottom Half: Incident Info & Chat */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/10">
            {/* Caller Info Header */}
            <div className="bg-slate-900/90 text-white p-3 flex items-center gap-3 border-b border-slate-800 shrink-0">
              <div className="w-8 h-8 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 animate-pulse text-sm">call</span>
              </div>
              <div>
                <div className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                  {activeIncident.type}
                </div>
                <div className="text-sm font-bold font-mono tracking-tight text-red-400">
                  {/* Mask Caller Phone for Security */}
                  {maskPhone(activeIncident.callerPhone)}
                </div>
              </div>
            </div>

            {/* AI Transcription Panel */}
            <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-bold font-mono text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-purple-400">psychology</span>
                AI Voice Transcription
              </span>
              <button
                onClick={startVoiceAnalysis}
                disabled={isTranscribing}
                className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded transition-all
                  ${isTranscribing 
                    ? "bg-purple-950/40 text-purple-400 border border-purple-800" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"}`}
              >
                <span className="material-symbols-outlined text-[11px] animate-pulse">mic</span>
                {isTranscribing ? "ANALYZING..." : "START SCAN"}
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              <div className="text-[9px] font-mono text-center text-slate-500 mb-2 border border-slate-800 bg-slate-900/50 py-1 rounded">
                Direct Contact Disabled until Driver Confirms
              </div>
              
              {transcripts[activeIncident.id]?.map((msg, idx) => {
                const isUser = msg.sender === "Caller";
                const isSystem = msg.sender === "System";
                return (
                  <div key={idx} className={`flex gap-2 text-left ${isUser ? "flex-row" : "flex-row-reverse"}`}>
                    <div className={`max-w-[85%] p-2 rounded-lg text-[11px] shadow-sm border
                      ${isUser 
                        ? "bg-slate-900/80 border-slate-800 text-slate-200" 
                        : isSystem
                          ? "bg-blue-950/30 border-blue-900/50 text-blue-300 w-full"
                          : "bg-slate-800 border-slate-700 text-slate-100"}`}
                    >
                      <div className="font-bold text-[8px] text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
                        <span>{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <div className="leading-relaxed">
                        {highlightText(msg.text)}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTranscribing && (
                <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-mono p-2">
                  <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                  <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span>AI listening...</span>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 flex gap-2 shrink-0">
              <input
                type="text"
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                placeholder="Type manual response..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-slate-200 outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[10px] font-bold transition-all active:scale-95"
              >
                Send
              </button>
            </form>
          </div>
        </section>

      </div>

      {/* Success Modal Backdrop Overlay */}
      {dispatchSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            
            <h3 className="text-xl font-bold text-white font-mono">DISPATCH ROUTED SUCCESSFULLY</h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Yêu cầu của nạn nhân <strong className="text-slate-200">{dispatchSuccess.victim}</strong> tại địa chỉ <strong className="text-slate-200">{dispatchSuccess.address}</strong> đã được chuyển tiếp thành công đến đơn vị cung cấp thứ ba:
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị tiếp nhận:</span>
                <span className="font-bold text-slate-200">{dispatchSuccess.providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã yêu cầu:</span>
                <span className="font-bold text-red-400">#{dispatchSuccess.incidentId}</span>
              </div>
              <div className="flex justify-between border-t border-slate-900 pt-2 mt-2">
                <span className="text-slate-500">Cước xe dự kiến:</span>
                <span className="font-bold text-slate-200">{dispatchSuccess.fare.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Hoa hồng thu hộ:</span>
                <span className="font-bold">+{dispatchSuccess.commission.toLocaleString()}đ</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              *Tài xế hiện đã nhận được lộ trình và sẽ liên lạc nạn nhân.
            </p>

            <button
              onClick={() => setDispatchSuccess(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition-all active:scale-95 mt-4"
            >
              Quay lại Command Center
            </button>
          </div>
        </div>
      )}

      {isManualFormOpen && (
        <ManualSOSEntryForm 
          onSubmit={handleCreateManualSOS} 
          onClose={() => setIsManualFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default DispatchHub;
