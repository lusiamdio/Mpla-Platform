import React, { useState } from "react";
import { Member, InventoryStats } from "../types";
import { 
  CreditCard, Truck, Settings, RefreshCw, AlertTriangle, 
  CheckCircle, Play, Package, ShieldCheck, ShoppingCart, 
  Layers, HardDrive 
} from "lucide-react";

interface AdminCardCentreProps {
  members: Member[];
  inventory: InventoryStats;
  onUpdateMember: (id: string, updatedData: Partial<Member>) => void;
  onUpdateInventory: (updatedInv: Partial<InventoryStats>) => void;
}

export default function AdminCardCentre({
  members,
  inventory,
  onUpdateMember,
  onUpdateInventory
}: AdminCardCentreProps) {
  const [printingBatch, setPrintingBatch] = useState(false);
  const [printingMessage, setPrintingMessage] = useState("");

  const queue = members.filter(m => 
    m.physicalCardStatus === "Submitted" || 
    m.physicalCardStatus === "Verification" ||
    m.physicalCardStatus === "Approved" ||
    m.physicalCardStatus === "Printing" ||
    m.physicalCardStatus === "Quality Check" ||
    m.physicalCardStatus === "Ready for Dispatch" ||
    m.physicalCardStatus === "In Transit" ||
    m.physicalCardStatus === "Available for Collection"
  );

  const pendingPrints = members.filter(m => m.physicalCardStatus === "Printing" || m.physicalCardStatus === "Approved");

  // Trigger simulated card print batch run
  const runPrintRun = () => {
    if (pendingPrints.length === 0) {
      alert("No cards are currently pending in the printing queue.");
      return;
    }
    if (inventory.blankCards < pendingPrints.length) {
      alert("Insufficient blank card stock! Please trigger a supplier restock first.");
      return;
    }

    setPrintingBatch(true);
    setPrintingMessage("Initializing thermal printing engine...");

    setTimeout(() => {
      setPrintingMessage("Applying secure holographic layers...");
      setTimeout(() => {
        setPrintingMessage("Completing quality assurance check...");
        setTimeout(() => {
          // Update members
          pendingPrints.forEach(m => {
            onUpdateMember(m.id, {
              physicalCardStatus: "Available for Collection",
              physicalCardEstDate: new Date().toISOString().split("T")[0]
            });
          });

          // Decrement stock
          onUpdateInventory({
            blankCards: Math.max(0, inventory.blankCards - pendingPrints.length),
            inkPercent: Math.max(10, inventory.inkPercent - (pendingPrints.length * 2)),
            ribbonPercent: Math.max(12, inventory.ribbonPercent - (pendingPrints.length * 1.5)),
            holograms: Math.max(0, inventory.holograms - pendingPrints.length)
          });

          setPrintingBatch(false);
          setPrintingMessage("");
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleRestock = () => {
    onUpdateInventory({
      blankCards: 5000,
      inkPercent: 100,
      ribbonPercent: 100,
      packagingEnvelopes: 15000,
      holograms: 5000
    });
    alert("Warehouse blank stocks, print ribbons, and toner envelopes restocked successfully!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="card-centre-panel">
      {/* Visual Industrial Print Controller */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Industrial Thermal Card Print Queue
              </h3>
              <p className="text-xs text-slate-500 mt-1">Manage print runs, write magnetic strips, and release batches to logistics.</p>
            </div>

            <span className="px-2.5 py-1 bg-amber-50 rounded-full text-[10px] font-mono font-bold text-amber-700 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" /> Queue Size: {pendingPrints.length} cards
            </span>
          </div>

          {printingBatch ? (
            /* PRINT RUN LOADER */
            <div className="py-12 text-center bg-slate-900 text-white rounded-xl border border-slate-950 p-6 space-y-4 animate-pulse">
              <RefreshCw className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
              <div>
                <p className="text-sm font-semibold tracking-wide font-display">{printingMessage}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Processing batch of {pendingPrints.length} membership badges...</p>
              </div>
            </div>
          ) : (
            /* CONTROL BLOCK */
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Simulated Print Engine Control</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trigger printing run to process approved accounts. This will print actual member cards, update statuses to "Available for Collection", and decrement warehouse stocks.
                </p>
              </div>
              <button
                onClick={runPrintRun}
                disabled={pendingPrints.length === 0}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-md shadow-blue-100 cursor-pointer"
              >
                <Play className="w-4 h-4" /> Trigger Card Printing Run
              </button>
            </div>
          )}

          {/* Members Card Dispatch List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Card Dispatch Status Matrix</h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-mono font-bold">
                    <th className="p-3">Member Details</th>
                    <th className="p-3">Province</th>
                    <th className="p-3">Current Dispatch status</th>
                    <th className="p-3 text-right">Advance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {queue.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/30 transition">
                      <td className="p-3 font-semibold text-slate-800">{m.fullName}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{m.province}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-blue-50 text-blue-700">
                          {m.physicalCardStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={m.physicalCardStatus}
                          onChange={(e) => onUpdateMember(m.id, { physicalCardStatus: e.target.value as any })}
                          className="p-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] outline-none"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Verification">Verification</option>
                          <option value="Approved">Approved</option>
                          <option value="Printing">Printing</option>
                          <option value="Quality Check">Quality Check</option>
                          <option value="Ready for Dispatch">Ready for Dispatch</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Available for Collection">Available for Collection</option>
                          <option value="Collected">Collected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse stocks and print metrics */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-blue-600" />
              Warehouse Assets
            </h3>
            <button 
              onClick={handleRestock}
              className="text-[10px] font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Restock
            </button>
          </div>

          <div className="space-y-4">
            {/* Blank Cardstock bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Blank Thermal Cardstock</span>
                <span className="font-mono">{inventory.blankCards} units</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    inventory.blankCards < 500 ? "bg-rose-500" : "bg-emerald-500"
                  }`} 
                  style={{ width: `${Math.min(100, (inventory.blankCards / 5000) * 100)}%` }} 
                />
              </div>
              {inventory.blankCards < 500 && (
                <p className="text-[9px] text-rose-500 font-bold flex items-center gap-1 font-mono">
                  <AlertTriangle className="w-3 h-3" /> Critical Stock Alert: Order now
                </p>
              )}
            </div>

            {/* Thermal ribbon bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Toner Cartridge Print Ink</span>
                <span className="font-mono">{inventory.inkPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    inventory.inkPercent < 25 ? "bg-rose-500" : "bg-blue-600"
                  }`} 
                  style={{ width: `${inventory.inkPercent}%` }} 
                />
              </div>
            </div>

            {/* Printing Ribbons bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Magnetic Strip Ribbons</span>
                <span className="font-mono">{inventory.ribbonPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    inventory.ribbonPercent < 25 ? "bg-rose-500" : "bg-blue-600"
                  }`} 
                  style={{ width: `${inventory.ribbonPercent}%` }} 
                />
              </div>
            </div>

            {/* Security Holograms bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Security Holograms Sheets</span>
                <span className="font-mono">{inventory.holograms} remaining</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-blue-600 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (inventory.holograms / 5000) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
