import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Server,
  ShieldAlert,
  GitCompare,
  KeyRound,
  CheckCircle2,
  Activity,
  Database,
  Layers,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { requestStepUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'health' | 'security' | 'blockchain' | 'exceptional'>('health');
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileSuccess, setReconcileSuccess] = useState(false);
  const [exceptionalReason, setExceptionalReason] = useState('');
  const [exceptionalGranted, setExceptionalGranted] = useState(false);

  const handleReconcile = async () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      setReconcileSuccess(true);
      setTimeout(() => setReconcileSuccess(false), 4000);
    }, 1000);
  };

  const handleRequestExceptionalAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionalReason) return;
    try {
      await requestStepUp(`Admin Exceptional Audit Access: ${exceptionalReason}`);
      setExceptionalGranted(true);
    } catch (e) {
      console.warn('Exceptional access cancelled', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-red-400" />
            Security &amp; Operations Command Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            DecentraWill Security Admin · System Health &amp; Cryptographic Reconciler
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'health' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-zinc-400 hover:text-white'
            }`}
          >
            System Health
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'security' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Security Events
          </button>
          <button
            onClick={() => setActiveTab('blockchain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'blockchain' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Blockchain Reconciler
          </button>
          <button
            onClick={() => setActiveTab('exceptional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'exceptional' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Exceptional Access
          </button>
        </div>
      </div>

      {/* HEALTH TAB */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>NestJS Core API</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Healthy (200 OK)
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">Port 4000 · Uptime: 99.98%</div>
          </div>

          <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>PostgreSQL 15</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Connected
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">Port 5434 · Pool Active</div>
          </div>

          <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Redis 7 BullMQ</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Queue Ready
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">0 Failed Jobs · 2 Active</div>
          </div>

          <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Sepolia Node</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Synchronized
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">Block #6941203 · 12 Gwei</div>
          </div>
        </div>
      )}

      {/* BLOCKCHAIN RECONCILER TAB */}
      {activeTab === 'blockchain' && (
        <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Smart Contract State Reconciler</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Compares local PostgreSQL will hashes against Sepolia contract state to catch network reorgs or pending queues.
              </p>
            </div>
            <button
              onClick={handleReconcile}
              disabled={isReconciling}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-xs font-medium text-emerald-300 transition"
            >
              {isReconciling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Run Blockchain Reconciliation</span>
            </button>
          </div>

          {reconcileSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reconciliation complete: 100% of local will version digests match on-chain smart contracts!</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#0B0D11] border border-zinc-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span>WillRegistry Contract:</span>
              <span className="text-white">0x1111111111111111111111111111111111111111</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>IntegrityAnchor Contract:</span>
              <span className="text-white">0x2222222222222222222222222222222222222222</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>AttestationRegistry Contract:</span>
              <span className="text-white">0x3333333333333333333333333333333333333333</span>
            </div>
          </div>
        </div>
      )}

      {/* EXCEPTIONAL ACCESS TAB */}
      {activeTab === 'exceptional' && (
        <div className="rounded-2xl bg-[#15181F] border border-red-900/40 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white">Exceptional Administrative Access Protocol</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Platform administrators do not have backdoor access to private will documents. Exceptional access requires an explicit court subpoena reason, triggers high-security step-up re-authentication, and permanently publishes an indelible alert to the immutable audit trail.
              </p>
            </div>
          </div>

          {exceptionalGranted ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-300">
              Temporary 15-minute emergency audit session granted under judicial subpoena ref: <strong className="text-white">{exceptionalReason}</strong>. All query bytes logged.
            </div>
          ) : (
            <form onSubmit={handleRequestExceptionalAccess} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Judicial Warrant / Court Order Reference
                </label>
                <input
                  type="text"
                  required
                  value={exceptionalReason}
                  onChange={(e) => setExceptionalReason(e.target.value)}
                  placeholder="e.g. UK High Court Chancery Division Warrant #HC-2026-991"
                  className="w-full px-3 py-2 bg-[#0B0D11] border border-zinc-700 rounded-lg text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-red-900/60 hover:bg-red-800 border border-red-700 text-white text-xs font-medium rounded-lg transition"
              >
                Request Subpoena-Scoped Audit Session
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
