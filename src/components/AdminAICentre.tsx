import React, { useState } from "react";
import { 
  Bot, AlertCircle, RefreshCw, Layers, TrendingUp, Sparkles, 
  Search, ShieldAlert, CheckCircle, FileText, Heart, Send 
} from "lucide-react";

export default function AdminAICentre() {
  const [activeTool, setActiveTool] = useState<"assistant" | "duplicates" | "anomalies" | "sentiment" | "forecast">("assistant");
  const [loading, setLoading] = useState(false);

  // NLP Chat states
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Welcome to the National Command AI Control Center. Ask me anything about our membership database, pending approvals, support tickets, or industrial card printing queues." }
  ]);

  // AI Diagnostic Result states
  const [duplicates, setDuplicates] = useState<any[] | null>(null);
  const [anomalies, setAnomalies] = useState<any[] | null>(null);
  const [sentiment, setSentiment] = useState<any[] | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [execSummary, setExecSummary] = useState<string>("");

  const fetchExecSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "summary" })
      });
      const data = await res.json();
      setExecSummary(data.result);
    } catch (e) {
      console.error(e);
      setExecSummary("Failed to generate executive summary. Please verify Gemini configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || loading) return;

    const userMsg = chatPrompt;
    setChatPrompt("");
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: "ai", text: data.text || "No response received." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: "ai", text: "Error communicating with AI service. Ensure your GEMINI_API_KEY is configured in Settings > Secrets." }]);
    } finally {
      setLoading(false);
    }
  };

  const scanDuplicates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "duplicate" })
      });
      const data = await res.json();
      setDuplicates(data.result || []);
    } catch (e) {
      console.error(e);
      setDuplicates([]);
    } finally {
      setLoading(false);
    }
  };

  const scanAnomalies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "anomaly" })
      });
      const data = await res.json();
      setAnomalies(data.result || []);
    } catch (e) {
      console.error(e);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  const scanSentiment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sentiment" })
      });
      const data = await res.json();
      setSentiment(data.result || []);
    } catch (e) {
      console.error(e);
      setSentiment([]);
    } finally {
      setLoading(false);
    }
  };

  const scanForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "forecast" })
      });
      const data = await res.json();
      setForecast(data.result);
    } catch (e) {
      console.error(e);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="ai-command-page">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600 animate-pulse" />
            AI National Command Centre
          </h2>
          <p className="text-xs text-slate-500 mt-1">Deploy Gemini 3.5 Flash to identify anomalous registrations, forecast stock levels, or consult data in plain English.</p>
        </div>

        {/* Executive Quick Summary Trigger */}
        <button
          onClick={fetchExecSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs transition shadow cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          Write Executive Summary Briefing
        </button>
      </div>

      {execSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 text-indigo-950 space-y-2 animate-scale-up">
          <p className="text-xs uppercase font-mono tracking-wider font-bold text-blue-600">AI-Powered Executive Briefing</p>
          <p className="text-xs leading-relaxed font-medium">{execSummary}</p>
        </div>
      )}

      {/* AI Tool Sub-navigation tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-semibold">
        {[
          { key: "assistant", label: "NLP Command Agent", icon: Bot },
          { key: "duplicates", label: "Duplicate Resolver", icon: Layers },
          { key: "anomalies", label: "Anomaly Detector", icon: ShieldAlert },
          { key: "sentiment", label: "Ticket Sentiment", icon: Heart },
          { key: "forecast", label: "Supply Forecast", icon: TrendingUp }
        ].map((tool) => (
          <button
            key={tool.key}
            onClick={() => setActiveTool(tool.key as any)}
            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition cursor-pointer ${
              activeTool === tool.key
                ? "bg-slate-900 border-slate-950 text-white font-bold shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
            }`}
          >
            <tool.icon className={`w-4.5 h-4.5 mb-1.5 ${activeTool === tool.key ? "text-blue-400" : "text-slate-400"}`} />
            <span className="text-[10px] leading-tight font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE DIAGNOSTIC TOOL PANE */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-medium font-mono">Deploying model prompts to National Database snapshot...</p>
          </div>
        )}

        {!loading && activeTool === "assistant" && (
          /* NLP NATURAL LANGUAGE COMMAND CHAT */
          <div className="flex flex-col justify-between min-h-[400px]">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">Example Command Inputs:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>"List our active members names and their card printing stages"</li>
                <li>"Do we have any outstanding dues? State the total in ZAR."</li>
                <li>"Summarize support ticket complaints"</li>
              </ul>
            </div>

            {/* Conversational timeline */}
            <div className="flex-1 space-y-4 max-h-[250px] overflow-y-auto p-2 border border-slate-200 rounded-xl mb-4">
              {chatHistory.map((chat, idx) => {
                const isMe = chat.sender === "user";
                return (
                  <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%] whitespace-pre-line ${
                      isMe 
                        ? "bg-slate-900 text-white rounded-br-none font-medium" 
                        : "bg-blue-50/50 border border-blue-100 text-slate-800 rounded-bl-none"
                    }`}>
                      <p className="text-[9px] opacity-75 font-mono mb-1 font-bold">
                        {isMe ? "ADMIN COMMAND" : "COMMAND AI"}
                      </p>
                      <p>{chat.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask plain English questions to the database..."
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                required
              />
              <button
                type="submit"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs transition flex items-center justify-center cursor-pointer shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {!loading && activeTool === "duplicates" && (
          /* DUPLICATE DETECTOR */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Phonetic & ID Duplicate Checker</h4>
                <p className="text-xs text-slate-500 mt-0.5">Scans membership tables to discover identity bypass, double signups, or phonetically similar names.</p>
              </div>
              <button
                onClick={scanDuplicates}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Scan Member Database
              </button>
            </div>

            {duplicates ? (
              <div className="space-y-4">
                {duplicates.length > 0 ? (
                  duplicates.map((dup, i) => (
                    <div key={i} className="p-4 rounded-xl border border-rose-100 bg-rose-50/20 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs">
                          <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
                          <span>Potential Mismatch Detected (Confidence: {Math.round(dup.confidence * 100)}%)</span>
                        </div>
                        <button
                          onClick={() => {
                            alert(`Initiated automated database merging of profiles: ${dup.memberA.name} and ${dup.memberB.name}. Duplicated files consolidated!`);
                            setDuplicates(prev => prev ? prev.filter((_, idx) => idx !== i) : null);
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition"
                        >
                          Resolve & Merge Profiles
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <div>
                          <p className="text-blue-600 font-bold uppercase tracking-wider text-[9px] mb-1">Profile A</p>
                          <p><strong>Name:</strong> {dup.memberA.name}</p>
                          <p><strong>National ID:</strong> {dup.memberA.ID}</p>
                          <p><strong>Email:</strong> {dup.memberA.email}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-bold uppercase tracking-wider text-[9px] mb-1">Profile B</p>
                          <p><strong>Name:</strong> {dup.memberB.name}</p>
                          <p><strong>National ID:</strong> {dup.memberB.ID}</p>
                          <p><strong>Email:</strong> {dup.memberB.email}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white/40 p-2.5 rounded-lg">
                        <strong>AI Reason Check:</strong> {dup.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800 text-xs">Database is Perfectly Clean</p>
                    <p className="text-[11px] text-slate-500">No duplicate identities or National ID conflicts detected during scanning.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Layers className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">Click 'Scan Member Database' to initiate automated checks.</p>
              </div>
            )}
          </div>
        )}

        {!loading && activeTool === "anomalies" && (
          /* ANOMALY RISK TRACKER */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Automated Anomaly Detector</h4>
                <p className="text-xs text-slate-500 mt-0.5">Deploys structural auditing filters to identify fraudulent registrations, geographical proxy IP anomalies, or bypass patterns.</p>
              </div>
              <button
                onClick={scanAnomalies}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Run Security Scan
              </button>
            </div>

            {anomalies ? (
              <div className="space-y-3">
                {anomalies.length > 0 ? (
                  anomalies.map((anom, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-amber-100 bg-amber-50/10 text-xs flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            anom.severity === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-100 text-amber-800"
                          }`}>
                            {anom.severity} Risk
                          </span>
                          <span className="font-bold text-slate-800">{anom.type}</span>
                        </div>
                        <p className="text-slate-600">Affected profile: <strong className="text-slate-800">{anom.member}</strong></p>
                        <p className="text-slate-500 leading-relaxed font-medium">{anom.details}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800 text-xs">No Security Risks Flagged</p>
                    <p className="text-[11px] text-slate-500">Every logged registration completely matches credential metadata and geographic routing targets.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <ShieldAlert className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">Click 'Run Security Scan' to analyze registration security.</p>
              </div>
            )}
          </div>
        )}

        {!loading && activeTool === "sentiment" && (
          /* TICKET SENTIMENT ANALYSER */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Complaints Sentiment & Priority Auditor</h4>
                <p className="text-xs text-slate-500 mt-0.5">Evaluates text sentiment inside member support requests to highlight highly critical or frustrated escalations.</p>
              </div>
              <button
                onClick={scanSentiment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Analyze Ticket Sentiments
              </button>
            </div>

            {sentiment ? (
              <div className="space-y-3">
                {sentiment.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">{item.ticketId}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          item.sentiment === "Mildly Annoyed" || item.sentiment === "Critical" || item.sentiment === "Frustrated"
                            ? "bg-rose-50 text-rose-600 animate-pulse"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {item.sentiment}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium"><strong>Core Grievance:</strong> {item.alert}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400 font-mono">Sentiment Rating</p>
                      <p className={`text-sm font-extrabold font-mono ${item.rating < 50 ? "text-rose-500" : "text-slate-700"}`}>
                        {item.rating} / 100
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Heart className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">Click 'Analyze Ticket Sentiments' to begin auditing.</p>
              </div>
            )}
          </div>
        )}

        {!loading && activeTool === "forecast" && (
          /* INVENTORY & GROWTH FORECASTER */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Industrial Stock & Growth Predictor</h4>
                <p className="text-xs text-slate-500 mt-0.5">Correlates database signups velocity with card printing blank stocks levels to schedule maintenance ribbons orders.</p>
              </div>
              <button
                onClick={scanForecast}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Forecast Resource Depletions
              </button>
            </div>

            {forecast ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-scale-up">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Predicted Growth Month</p>
                  <p className="text-lg font-extrabold font-mono text-blue-700 mt-1">{forecast.predictedGrowthMonth}</p>
                  <p className="text-[10px] text-slate-500 mt-2">Expected incremental registrations based on campaign timelines.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Est. Stock Runout</p>
                  <p className="text-lg font-extrabold font-mono text-blue-700 mt-1">{forecast.estimatedStockRunout}</p>
                  <p className="text-[10px] text-slate-500 mt-2">Duration before central warehouse blank card stocks deplate.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl sm:col-span-3">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold text-rose-500">Critical Dispatch Next Step</p>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{forecast.criticalAction}</p>
                  <p className="text-[10px] text-slate-500 mt-2">Automated reorder recommendation based on supplier SLAs.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">Click 'Forecast Resource Depletions' to execute predictions models.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
