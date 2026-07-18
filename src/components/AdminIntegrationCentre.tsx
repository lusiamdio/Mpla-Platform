import React, { useState, useEffect } from "react";
import { 
  Network, CheckCircle, Link2, Settings, Activity, Wifi, RefreshCw, Play, 
  Fingerprint, MessageSquare, Mail, CreditCard, QrCode, HardDrive, MapPin, 
  Layers2, Users2, BarChart, AlertCircle, ShieldAlert 
} from "lucide-react";

export default function AdminIntegrationCentre() {
  const [integrations, setIntegrations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  // Load integrations from backend
  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/system/integrations");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  // Update integration state on the backend
  const handleUpdateIntegration = async (updatedData: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/system/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChange = (key: string) => {
    const updated = {
      ...integrations,
      [key]: {
        ...integrations[key],
        enabled: !integrations[key].enabled
      }
    };
    setIntegrations(updated);
    handleUpdateIntegration(updated);
  };

  const handleFieldChange = (key: string, field: string, value: string) => {
    setIntegrations({
      ...integrations,
      [key]: {
        ...integrations[key],
        [field]: value
      }
    });
  };

  const handleSaveField = (key: string) => {
    handleUpdateIntegration(integrations);
  };

  // Test integration connection invoking server ping endpoint
  const testConnection = async (key: string) => {
    setTestingKey(key);
    try {
      const res = await fetch("/api/system/test-integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          provider: integrations[key].provider
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(prev => ({
          ...prev,
          [key]: data.message
        }));
      }
    } catch (e) {
      console.error(e);
      setTestResult(prev => ({
        ...prev,
        [key]: "Gateway communication failed. Inspect firewalls or security tokens."
      }));
    } finally {
      setTestingKey(null);
    }
  };

  if (loading || !integrations) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 text-[#D3122A] animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider">Retrieving Active API Gateways snapshot...</p>
      </div>
    );
  }

  // Configurations mapping for UI Cards
  const integrationSchema = [
    {
      key: "nationalIdVerification",
      label: "National ID Verification",
      icon: Fingerprint,
      description: "Direct biometrics & verification bridge to Department of Home Affairs National Register.",
      fields: [
        { label: "API Provider Label", name: "provider", type: "text" },
        { label: "Secure Gateway Endpoint URL", name: "endpoint", type: "text" },
        { label: "Private Authority API Token", name: "apiKey", type: "password" }
      ]
    },
    {
      key: "smsProvider",
      label: "National SMS Gateway",
      icon: MessageSquare,
      description: "Dispatches critical security OTP and card delivery notices to registered mobile subnets.",
      fields: [
        { label: "SMS Provider", name: "provider", type: "text" },
        { label: "Sender Identifier (Alphanumeric Mask)", name: "senderId", type: "text" },
        { label: "Account SID / API Access Token", name: "apiKey", type: "text" },
        { label: "API Authorization Secret Key", name: "apiSecret", type: "password" }
      ]
    },
    {
      key: "emailService",
      label: "SMTP & Transactional Email",
      icon: Mail,
      description: "Automated HTML verification email sequences and membership PDF certificates.",
      fields: [
        { label: "Email Provider", name: "provider", type: "text" },
        { label: "SMTP Server Relays Endpoint", name: "host", type: "text" },
        { label: "Port", name: "port", type: "number" },
        { label: "Authorizing Username", name: "username", type: "text" },
        { label: "Relay Secret Password", name: "password", type: "password" }
      ]
    },
    {
      key: "paymentGateway",
      label: "Transactional Payment Gateway",
      icon: CreditCard,
      description: "Reconciles digital wallet deposits, mobile subscription renewals, and campaign donations.",
      fields: [
        { label: "Payment Processor Gateway", name: "provider", type: "text" },
        { label: "Authorized Merchant ID Reference", name: "merchantId", type: "text" },
        { label: "Gateway Encryption Key", name: "secretKey", type: "password" }
      ]
    },
    {
      key: "qrVerification",
      label: "QR Token Verification",
      icon: QrCode,
      description: "Allows local ward monitors to verify physical digital card signatures via QR cameras.",
      fields: [
        { label: "Verification Engine", name: "provider", type: "text" },
        { label: "Secure Verification Webhook URL", name: "validationEndpoint", type: "text" }
      ]
    },
    {
      key: "cloudStorage",
      label: "Encrypted Cloud Storage Vault",
      icon: HardDrive,
      description: "Offloads scanned citizen proofs of residence and biometric profile photos to cold storage.",
      fields: [
        { label: "Cloud Provider Core", name: "provider", type: "text" },
        { label: "Secure Bucket Name", name: "bucketName", type: "text" },
        { label: "Local Region Identifier", name: "region", type: "text" }
      ]
    },
    {
      key: "gisMapping",
      label: "GIS Geographic & Boundary Engine",
      icon: MapPin,
      description: "Renders physical coordinates to automatically assign registrants to their correct Ward Branch.",
      fields: [
        { label: "Geospatial Boundary Provider", name: "provider", type: "text" },
        { label: "Map Platform API Token", name: "mapsApiKey", type: "password" }
      ]
    },
    {
      key: "erpSystem",
      label: "ERP Financial System Synchronizer",
      icon: Layers2,
      description: "Syncs membership revenue tallies with external corporate SAP or Oracle general ledger suites.",
      fields: [
        { label: "Corporate ERP Provider", name: "provider", type: "text" },
        { label: "Integration Synchronization Webhook", name: "endpointUrl", type: "text" }
      ]
    },
    {
      key: "crmSystem",
      label: "CRM Outreach Sync Integration",
      icon: Users2,
      description: "Pushes member engagement parameters and contact profiles into CRM workspaces.",
      fields: [
        { label: "Enterprise CRM Platform", name: "provider", type: "text" },
        { label: "Synchronizer App Client ID Key", name: "clientId", type: "text" }
      ]
    },
    {
      key: "biPlatform",
      label: "BI Advanced Analytics Platform",
      icon: BarChart,
      description: "Feeds anonymized demographics to BI reporting charts for regional coordinators.",
      fields: [
        { label: "BI Display Suite", name: "provider", type: "text" },
        { label: "Embed dashboard Link", name: "dashboardUrl", type: "text" }
      ]
    }
  ];

  return (
    <div className="space-y-6" id="integration-centre">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
            <Network className="w-6 h-6 text-[#D3122A] animate-pulse" />
            External Integration Centre
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authorize secure cloud storage, link identity lookups, adjust payment processing, and test transactional SMS triggers.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px] rounded-lg tracking-wider uppercase">
          <Wifi className="w-3.5 h-3.5" />
          Gateway Nodes: 100% Online
        </div>
      </div>

      {/* SYSTEM TOPOLOGY GRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 text-white p-6 rounded-xl border border-slate-950 shadow-md">
        <div className="lg:col-span-8 space-y-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-red-400">System Gateway Diagram</span>
            <h3 className="font-display font-bold text-sm text-slate-100">Synchronized API Integration Topology</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Our secure server routes critical tasks asynchronously to verified third-party endpoints. TLS encryption applies to all parameters before transmission.
            </p>
          </div>

          {/* Visual topology connector lines */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-wrap justify-center items-center gap-4 py-8">
            <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-center font-bold">
              <Fingerprint className="w-4 h-4 mx-auto mb-1 text-red-400" />
              HomeAffairs API
            </div>
            <span className="text-slate-600 font-mono">──</span>
            <div className="px-4 py-3 bg-[#D3122A] border-red-500 rounded text-xs text-center font-extrabold shadow-md shadow-red-500/20">
              <Activity className="w-5 h-5 mx-auto mb-1 text-white animate-pulse" />
              Unified Node Server
            </div>
            <span className="text-slate-600 font-mono">──</span>
            <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-center font-bold">
              <Mail className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
              SendGrid Mail
            </div>
            <div className="w-full flex justify-center mt-2">
              <div className="flex flex-col items-center">
                <span className="text-slate-600 font-mono text-xs">│</span>
                <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-center font-bold inline-block">
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  PayFast Gateway
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Live API Traffic Log</h4>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-400 leading-normal">
              <p className="text-green-400">⚡ [09:12] ID Lookup: CONFIRMED (960312508...)</p>
              <p className="text-slate-500">📥 [10:45] SMS dispatch complete via Twilio S2</p>
              <p className="text-slate-500">📎 [11:15] Proof of Res. uploaded to AWS Bucket</p>
              <p className="text-slate-500">💳 [12:30] Webhook parsed: PayFast checkout renewal</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>Core Latency AVG</span>
            <span className="text-red-400 font-bold">14ms (Excellent)</span>
          </div>
        </div>
      </div>

      {/* CORE INTEGRATIONS MANAGEMENT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrationSchema.map((item) => {
          const config = integrations[item.key] || { enabled: false, provider: "" };
          const isEnabled = config.enabled;
          const pingResult = testResult[item.key];
          
          return (
            <div 
              key={item.key} 
              className={`bg-white rounded-xl border p-6 space-y-5 transition shadow-xs hover:shadow-sm ${
                isEnabled ? "border-red-200" : "border-slate-200"
              }`}
            >
              {/* Header block with switch */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    isEnabled ? "bg-red-50 text-[#D3122A]" : "bg-slate-100 text-slate-400"
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {item.label}
                      {isEnabled ? (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      ) : (
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {/* iOS Style Custom Toggle Switch */}
                <button
                  onClick={() => handleToggleChange(item.key)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    isEnabled ? "bg-[#D3122A]" : "bg-slate-200"
                  }`}
                >
                  <span 
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                      isEnabled ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Form Config Fields (Only interactive when enabled) */}
              {isEnabled ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 gap-3.5">
                    {item.fields.map((fld) => (
                      <div key={fld.name} className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-extrabold">
                          {fld.label}
                        </label>
                        <input
                          type={fld.type}
                          value={config[fld.name] || ""}
                          onChange={(e) => handleFieldChange(item.key, fld.name, e.target.value)}
                          onBlur={() => handleSaveField(item.key)}
                          placeholder={`Enter ${fld.label.toLowerCase()}`}
                          className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D3122A] outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Test button & Ping feedback */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      onClick={() => testConnection(item.key)}
                      disabled={testingKey !== null}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition cursor-pointer flex items-center gap-1.5"
                    >
                      {testingKey === item.key ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      Test Endpoint Ping
                    </button>
                    {saving && (
                      <span className="text-[10px] font-mono font-bold text-[#D3122A] animate-pulse">
                        ● Auto-Saving configuration...
                      </span>
                    )}
                  </div>

                  {pingResult && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-600 leading-normal font-mono relative">
                      <p>{pingResult}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400 font-mono">
                  Gateway Disabled. Activate toggle to define credentials and test connections.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
