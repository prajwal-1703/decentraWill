import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Lock,
  Send,
  Loader2,
  Users,
  Coins,
  Scale,
} from 'lucide-react';

export const ExecutorPortal: React.FC = () => {
  const { requestStepUp } = useAuth();
  const [activationRequested, setActivationRequested] = useState(false);
  const [evidenceUploaded, setEvidenceUploaded] = useState(true);
  const [gracePeriodActive, setGracePeriodActive] = useState(true);
  const [isAuthorizingRelease, setIsAuthorizingRelease] = useState(false);
  const [estateClosed, setEstateClosed] = useState(false);

  const handleApproveRelease = async () => {
    setIsAuthorizingRelease(true);
    try {
      await requestStepUp('Authorize Controlled Inheritance Asset Release and execute executor coordination order');
      setGracePeriodActive(false);
    } catch (e) {
      console.warn('Execution cancelled', e);
    } finally {
      setIsAuthorizingRelease(false);
    }
  };

  const handleCloseEstate = async () => {
    try {
      await requestStepUp('Formally close estate administration after full asset transfer distribution');
      setEstateClosed(true);
    } catch (e) {
      console.warn('Close cancelled', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            Executor Administration &amp; Activation Command
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Marcus Vance · Appointed Primary Trustee &amp; Executor
          </p>
        </div>

        <span className="text-xs font-mono font-medium text-purple-300 bg-purple-950/60 border border-purple-800 px-3 py-1.5 rounded-lg">
          Estate: The Pendelton Trust Estate
        </span>
      </div>

      {/* Activation Lifecycle Timeline */}
      <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Activation &amp; Controlled Release Lifecycle</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0B0D11] border border-emerald-800/80 text-emerald-400 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. Initiation
            </div>
            <p className="text-[11px] text-zinc-400">Formal life-event notice received</p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0D11] border border-emerald-800/80 text-emerald-400 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2. Evidence
            </div>
            <p className="text-[11px] text-zinc-400">Certified death certificate uploaded</p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0D11] border border-amber-800/80 text-amber-400 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> 3. Grace Window
            </div>
            <p className="text-[11px] text-zinc-400">30-day challenge window active (18 days left)</p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0D11] border border-zinc-800 text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-200">4. Controlled Release</div>
            <p className="text-[11px] text-zinc-500">Scoped keys and physical title handover</p>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0D11] border border-zinc-800 text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-200">5. Estate Closure</div>
            <p className="text-[11px] text-zinc-500">Final distribution audited &amp; archived</p>
          </div>
        </div>
      </div>

      {/* Main Execution Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Verification Card */}
        <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-4 text-xs">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Activation Evidence Verification
          </h4>
          <p className="text-zinc-400 leading-relaxed">
            Statutory death certificate and court letters of administration required before estate release authorizations can unlock.
          </p>

          <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="font-medium text-white">UK_General_Register_Death_Cert_66190.pdf</span>
              <span className="text-emerald-400 font-mono text-[11px]">Verified SHA-256</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono">
              Hash: 8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 flex items-center gap-2 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Advocate Claire Sterling verified official register seal.</span>
          </div>
        </div>

        {/* Transfer Coordination & Execution Card */}
        <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-4 text-xs">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            Asset Transfer Execution Tasks
          </h4>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Pendelton Manor (Real Estate)</div>
                <div className="text-[11px] text-zinc-400">Transfer Coordination with UK Land Registry</div>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                In Progress
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Cold Storage Sovereign Vault (Crypto)</div>
                <div className="text-[11px] text-zinc-400">Multi-Sig Timelock Smart Contract</div>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Ready for Release
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleApproveRelease}
              disabled={isAuthorizingRelease}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 text-white font-medium rounded-lg shadow-md transition flex items-center justify-center gap-2"
            >
              {isAuthorizingRelease ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Execute Scoped Release Order</span>
            </button>

            {!estateClosed ? (
              <button
                onClick={handleCloseEstate}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#0B0D11] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium rounded-lg transition"
              >
                Close Estate Administration
              </button>
            ) : (
              <span className="text-zinc-500 font-mono text-[11px]">Estate Closed &amp; Archived</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
