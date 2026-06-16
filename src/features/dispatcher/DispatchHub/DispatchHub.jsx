import React, { useState, useEffect, useRef } from "react";
import useTopbarStore from "../../../store/useTopbarStore";
import { MOCK_PROVIDERS, INITIAL_INCIDENTS } from "./data";
import "./DispatchHub.css";

const DispatchHub = () => {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [selectedId, setSelectedId] = useState(INITIAL_INCIDENTS[0].id);
  const [providers] = useState(MOCK_PROVIDERS);
  
  // Transcription states
  const [transcripts, setTranscripts] = useState({});
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionIndex, setTranscriptionIndex] = useState(0);
  const [typingInput, setTypingInput] = useState("");
  
  // Modal / Confirm States
  const [dispatchSuccess, setDispatchSuccess] = useState(null);
  
  const { setSlot, clearSlot } = useTopbarStore();
  const transcriptEndRef = useRef(null);

  const activeIncident = incidents.find((i) => i.id === selectedId) || incidents[0];

  // Initialize transcripts for each incident
  useEffect(() => {
    const initialTranscripts = {};
    incidents.forEach((inc) => {
      // Load first 2 lines as initial dialog, rest will be transcribed
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
          <span className="material-symbols-outlined text-sm text-emerald-400">payments</span>
          Dispatcher 3rd Party Mode
        </div>
      </div>
    );
    return () => clearSlot();
  }, [incidents]);

  // Scroll to bottom of chat log
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, transcriptionIndex, isTranscribing, selectedId]);

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

  // Dispatcher suggests top providers inside chat
  const suggestProvidersInChat = () => {
    const suggestionMessage = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sender: "System",
      text: "GỢI Ý CÁC ĐƠN VỊ CỨU HỘ TOP ĐẦU CHO KHÁCH HÀNG:",
      isSuggestion: true
    };

    setTranscripts((prev) => ({
      ...prev,
      [activeIncident.id]: [...(prev[activeIncident.id] || []), suggestionMessage]
    }));
  };

  // Direct selection of provider
  const selectProvider = (provId) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === activeIncident.id
          ? { ...inc, providerSelected: provId }
          : inc
      )
    );

    // Append to chat log
    const provName = providers.find(p => p.id === provId)?.name;
    const selectLog = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sender: "System",
      text: `Dispatcher đã chọn nhà cung cấp: **${provName}**`
    };

    setTranscripts((prev) => ({
      ...prev,
      [activeIncident.id]: [...(prev[activeIncident.id] || []), selectLog]
    }));
  };

  // Trigger Transfer to Provider & Hospital
  const confirmAndTriggerDispatch = () => {
    if (!activeIncident.providerSelected) return;

    const selectedProviderObj = providers.find(p => p.id === activeIncident.providerSelected);
    
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === activeIncident.id
          ? { ...inc, status: "Transferred to Provider" }
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

  // Form field changes for Acquaintance Mode
  const handleVictimFieldChange = (field, val) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === activeIncident.id
          ? { ...inc, [field]: val }
          : inc
      )
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Tactical Dispatch Hub Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <h2 className="text-lg font-bold text-white tracking-wider font-mono">
            TACTICAL DISPATCH HUB (3RD PARTY GATEWAY)
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="font-mono text-xs text-slate-400">
            {new Date().toLocaleDateString("vi-VN")} · GPS Monitoring System
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        
        {/* Left Column: SOS Incident Queue */}
        <section className="col-span-3 flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              Live SOS Feed
            </span>
            <span className="bg-red-950 text-red-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-800/60">
              {incidents.filter(i => i.status === "Awaiting Dispatch").length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {incidents.map((inc) => {
              const isActive = inc.id === selectedId;
              const isCritical = inc.priority === "CRITICAL";
              return (
                <article
                  key={inc.id}
                  onClick={() => setSelectedId(inc.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative overflow-hidden text-left
                    ${isActive 
                      ? "bg-slate-800 border-slate-600 shadow-lg scale-[1.01]" 
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80"}`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${isCritical ? "bg-red-500" : "bg-orange-500"}`} />
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      ID #{inc.id}
                    </span>
                    <span className={`font-mono text-[11px] font-bold flex items-center gap-0.5 
                      ${isCritical ? "text-red-400" : "text-orange-400"}`}>
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      {inc.timeAgo}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 mb-3">
                    <p><strong className="text-slate-200">Category:</strong> {inc.category}</p>
                    <p className="truncate"><strong className="text-slate-200">Phone:</strong> {inc.callerPhone}</p>
                    <p className="truncate"><strong className="text-slate-200">Mode:</strong> {inc.type}</p>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      isCritical ? "bg-red-950 text-red-400 border border-red-900" : "bg-orange-950 text-orange-400 border border-orange-900"
                    }`}>
                      {inc.priority}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[9px] px-2 py-0.5 rounded font-mono">
                      {inc.genderAge}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Center Column: AI Incident Workspace */}
        <section className="col-span-5 flex flex-col h-full bg-slate-900/30 border border-slate-800/50 rounded-xl overflow-hidden relative shadow-2xl">
          
          {/* Live Calling HUD */}
          <div className="bg-slate-900/90 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 animate-pulse text-xl">call</span>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                  INCOMING CHANNEL · {activeIncident.type.toUpperCase()}
                </div>
                <div className="text-lg font-bold font-mono tracking-tight text-red-400">
                  {activeIncident.callerPhone}
                </div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-[10px] font-bold text-slate-400">STATUS</div>
              <div className="text-xs bg-slate-800 border border-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded mt-0.5">
                {activeIncident.status}
              </div>
            </div>
          </div>

          {/* Victim Details Form (Self vs Acquaintance details) */}
          <div className="bg-slate-900/40 p-4 border-b border-slate-800 shrink-0 text-left space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-400">person_search</span>
                Thông tin người cần hỗ trợ
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeIncident.type === "Đặt cho người quen" ? "bg-amber-950 text-amber-400 border border-amber-900" : "bg-blue-950 text-blue-400 border border-blue-900"
              }`}>
                {activeIncident.type}
              </span>
            </div>

            {activeIncident.type === "Đặt cho người quen" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Họ Tên Nạn Nhân</label>
                  <input
                    type="text"
                    value={activeIncident.victimName}
                    onChange={(e) => handleVictimFieldChange("victimName", e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={activeIncident.victimPhone}
                    onChange={(e) => handleVictimFieldChange("victimPhone", e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Địa Chỉ Sự Cố</label>
                  <input
                    type="text"
                    value={activeIncident.victimAddress}
                    onChange={(e) => handleVictimFieldChange("victimAddress", e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Tình Trạng Nạn Nhân</label>
                  <textarea
                    rows={1}
                    value={activeIncident.victimConditions}
                    onChange={(e) => handleVictimFieldChange("victimConditions", e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            ) : (
              // Caller placing for themselves
              <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/80 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Người yêu cầu:</span>
                  <span className="font-bold text-slate-200">{activeIncident.callerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Địa chỉ:</span>
                  <span className="font-bold text-slate-200">{activeIncident.victimAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tình trạng mô tả:</span>
                  <span className="font-bold text-red-400">{activeIncident.victimConditions}</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Transcription / Chat Log Panel */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/10">
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold font-mono text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-purple-400">psychology</span>
                AI Transcription & Chat Log
              </span>
              <button
                onClick={startVoiceAnalysis}
                disabled={isTranscribing}
                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded transition-all
                  ${isTranscribing 
                    ? "bg-purple-950/40 text-purple-400 border border-purple-800" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"}`}
              >
                <span className="material-symbols-outlined text-[13px] animate-pulse">mic</span>
                {isTranscribing ? "ANALYZING VOICE..." : "START VOICE ANALYSIS"}
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {transcripts[activeIncident.id]?.map((msg, idx) => {
                const isUser = msg.sender === "Caller";
                const isSystem = msg.sender === "System";
                return (
                  <div key={idx} className={`flex gap-3 text-left ${isUser ? "flex-row" : "flex-row-reverse"}`}>
                    <span className="font-mono text-[9px] text-slate-500 shrink-0 pt-1">
                      {msg.time || "00:00"}
                    </span>
                    <div className={`max-w-[80%] p-2.5 rounded-lg text-xs shadow-sm border
                      ${isUser 
                        ? "bg-slate-900/80 border-slate-800 text-slate-200" 
                        : isSystem
                          ? "bg-blue-950/30 border-blue-900/50 text-blue-300 w-full"
                          : "bg-slate-800 border-slate-700 text-slate-100"}`}
                    >
                      <div className="font-bold text-[9px] text-slate-400 uppercase tracking-wider mb-1">
                        {msg.sender}
                      </div>
                      
                      <div className="leading-relaxed">
                        {highlightText(msg.text)}
                      </div>

                      {/* Top Provider Suggestions buttons in Chat bubble */}
                      {msg.isSuggestion && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {providers.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => selectProvider(p.id)}
                              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2 rounded text-left transition-all hover:border-blue-500 active:scale-95 group"
                            >
                              <div className="font-bold text-[10px] text-slate-200 group-hover:text-blue-400 truncate">{p.name}</div>
                              <div className="text-[9px] text-slate-400 flex justify-between mt-1">
                                <span>Cước: {p.fare.toLocaleString()}đ</span>
                                <span className="text-emerald-400">-{p.eta}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {isTranscribing && (
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span>AI is listening and transcribing call audio...</span>
                </div>
              )}
              
              <div ref={transcriptEndRef} />
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2 shrink-0">
              <input
                type="text"
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                placeholder="Type command or manual response to user..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold transition-all active:scale-95"
              >
                Send
              </button>
            </form>
          </div>

          {/* Confirm Transfer Dispatch Button */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 shrink-0">
            <button
              onClick={confirmAndTriggerDispatch}
              disabled={!activeIncident.providerSelected}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2 text-xs uppercase
                ${activeIncident.providerSelected 
                  ? "bg-red-600 hover:bg-red-700 text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850"}`}
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              {activeIncident.providerSelected 
                ? "XÁC NHẬN & CHUYỂN TIẾP CHO PROVIDER & HOSPITAL" 
                : "CHỌN ĐƠN VỊ CỨU HỘ ĐỂ KÍCH HOẠT"}
            </button>
          </div>
        </section>

        {/* Column 3: Third-Party Provider Suggestions */}
        <section className="col-span-4 flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
          
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              3rd Party Ambulance Provider
            </span>
            <button
              onClick={suggestProvidersInChat}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 font-mono bg-blue-950 px-2 py-1 rounded border border-blue-900"
            >
              Gợi ý đơn vị cứu hộ
            </button>
          </div>

          {/* Provider Lists */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
            {providers.map((p) => {
              const isSelected = activeIncident.providerSelected === p.id;
              
              // Cước xe & Phí hoa hồng
              const fareVND = p.fare;
              const commissionVND = fareVND * p.commissionRate;
              
              return (
                <div
                  key={p.id}
                  className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors duration-200 text-left
                    ${isSelected 
                      ? "bg-blue-950/20 border-blue-500" 
                      : "border-slate-800 bg-slate-900/30 hover:bg-slate-900/50"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-200 truncate max-w-[160px]">
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
                      onClick={() => selectProvider(p.id)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all active:scale-95
                        ${isSelected 
                          ? "bg-blue-600 text-white font-mono" 
                          : "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"}`}
                    >
                      {isSelected ? "ĐÃ CHỌN" : "CHỌN ĐƠN VỊ"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">CƯỚC XE (FARE)</span>
                      <span className="font-bold text-slate-200 text-xs">
                        {fareVND.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PLATFORM HOA HỒNG</span>
                      <span className="font-bold text-emerald-400 text-xs">
                        {commissionVND.toLocaleString("vi-VN")}đ ({(p.commissionRate * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulated Live Minimap Display */}
          <div className="h-44 bg-slate-950 relative overflow-hidden border-t border-slate-800 shrink-0">
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, #475569 19px, #475569 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #475569 19px, #475569 20px)" }}></div>
            
            {/* Grid street layout simulation */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0,35% 100%,35%" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 45%,0 45%,100%" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 0,70% 100%,70%" stroke="#cbd5e1" strokeWidth="1.5" />
            </svg>

            {/* Radar sweep animation */}
            <div className="radar-sweep" style={{ top: "50%", left: "50%" }}></div>
            <div className="radar-rings" style={{ top: "calc(50% - 130px)", left: "calc(50% - 130px)" }}></div>

            {/* Incident pulse marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0 bg-red-500 rounded-full pulse-ring z-0"></div>
              <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg relative z-10 animate-ping">
                <span className="material-symbols-outlined text-white text-[10px]">warning</span>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 font-mono text-[9px] text-slate-500 bg-slate-900/80 border border-slate-800 px-1.5 py-0.5 rounded">
              GPS LIVE RADAR VIEW
            </div>
          </div>
        </section>

      </div>

      {/* Success Modal Backdrop Overlay */}
      {dispatchSuccess && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
              *Hệ thống 3rd party đã thông báo tự động cho bệnh viện liên kết của đơn vị.
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
    </div>
  );
};

export default DispatchHub;
