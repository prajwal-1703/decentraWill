import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Sliders,
  History,
  Send,
} from 'lucide-react';
import { ProofOfLifeBadge } from '../../common/Badges';

export const ProofOfLifeCenter: React.FC = () => {
  const { currentEstate } = useAuth();
  const [status, setStatus] = useState<'ACTIVE' | 'DUE_SOON' | 'ESCALATED'>('ACTIVE');
  const [lastCheckin, setLastCheckin] = useState('25 Sep 2026, 5:28 PM');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const handleRespond = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setStatus('ACTIVE');
      setLastCheckin(new Date().toLocaleString());
      setIsProcessing(false);
      setNotificationMsg('Heartbeat confirmed. Next verification check scheduled in 30 days.');
      setTimeout(() => setNotificationMsg(''), 4000);
    }, 600);
  };

  const handleSimulateMissed = () => {
    setStatus('ESCALATED');
    setNotificationMsg('Simulation triggered: Estate status transitioned to ESCALATED. Grace window active.');
    setTimeout(() => setNotificationMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Proof-of-Life Heartbeat Protocol
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Automated liveness verification ensuring that activation protocols remain dormant while the grantor is active.
          </p>
        </div>

        <ProofOfLifeBadge status={status} />
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Critical Legal Explanation Box */}
      <div className="p-4.5 rounded-xl bg-[#15181F] border border-amber-600/30 text-xs text-zinc-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Operational Safety Principle</span>
        </div>
        <p className="leading-relaxed text-zinc-400">
          Proof-of-life checks coordinate automated reminders and trigger human verification workflows. Missing a scheduled
          check-in <strong className="text-white">DOES NOT independently establish death</strong> or trigger automated asset distribution.
          It solely initiates the formal grace period and alerts designated executors and advocates to begin real-world verification.
        </p>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liveness Controls */}
        <div className="md:col-span-2 rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Current Heartbeat Status</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0B0D11] border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Last Recorded Heartbeat</span>
              <p className="text-white font-mono font-medium mt-1">{lastCheckin}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0D11] border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Heartbeat Cadence</span>
              <p className="text-emerald-400 font-mono font-medium mt-1">30 Days</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0D11] border border-zinc-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Escalation Grace Period</span>
              <p className="text-amber-400 font-mono font-medium mt-1">30 Days Challenge</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleRespond}
              disabled={isProcessing}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Check-In Now (Cryptographic Heartbeat)</span>
            </button>

            <button
              onClick={handleSimulateMissed}
              className="w-full sm:w-auto px-4 py-3 bg-[#0B0D11] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition"
            >
              Simulate Inactivity Trigger
            </button>
          </div>
        </div>

        {/* Protocol Escalation Steps */}
        <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-4 text-xs">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Escalation Timeline
          </h4>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px] font-mono shrink-0">
                1
              </div>
              <div>
                <strong className="text-white">Day 0:</strong>
                <p className="text-zinc-400 text-[11px]">Primary email &amp; secure app notification sent to Testator.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                2
              </div>
              <div>
                <strong className="text-white">Day 7:</strong>
                <p className="text-zinc-400 text-[11px]">Secondary reminder sent; notification to Advocate.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center text-[10px] font-mono shrink-0">
                3
              </div>
              <div>
                <strong className="text-white">Day 14:</strong>
                <p className="text-zinc-400 text-[11px]">Escalation state active; Executor alerted to perform physical verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-[10px] font-mono shrink-0">
                4
              </div>
              <div>
                <strong className="text-white">Day 30+:</strong>
                <p className="text-zinc-400 text-[11px]">Formal evidence required before grace period release commences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
