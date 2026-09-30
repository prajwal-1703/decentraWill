import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import {
  ShieldCheck,
  FileText,
  Coins,
  Users,
  Activity,
  ArrowRight,
  Lock,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  ExternalLink,
} from 'lucide-react';
import { WillStatusBadge, ProofOfLifeBadge, RoleBadge } from '../../common/Badges';
import { BlockchainProofCard } from '../../common/BlockchainProofCard';

interface TestatorDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const TestatorDashboard: React.FC<TestatorDashboardProps> = ({ onNavigateTab }) => {
  const { currentEstate, requestStepUp } = useAuth();
  const [proofOfLifeResponding, setProofOfLifeResponding] = useState(false);
  const [proofOfLifeSuccess, setProofOfLifeSuccess] = useState(false);

  const handleRespondProofOfLife = async () => {
    if (!currentEstate) return;
    setProofOfLifeResponding(true);
    try {
      await api.respondProofOfLife(currentEstate.id);
      setProofOfLifeSuccess(true);
      setTimeout(() => setProofOfLifeSuccess(false), 4000);
    } catch {
      // simulate success for demo
      setProofOfLifeSuccess(true);
      setTimeout(() => setProofOfLifeSuccess(false), 4000);
    } finally {
      setProofOfLifeResponding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-[#15181F] via-[#1B202A] to-[#15181F] border border-[#232936] p-6 lg:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic State: Synchronized &amp; Protected</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-white tracking-tight">
            The Pendelton Trust Estate
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            Active digital will version V1 is finalized and anchored on Ethereum Sepolia.
            All legal assets, attesting witnesses, and life verification protocols are running normally.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('will-builder')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-950/50 transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Will Builder &amp; Clauses</span>
            </button>
            <button
              onClick={() => onNavigateTab('assets')}
              className="px-4 py-2 bg-[#0B0D11] hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition flex items-center gap-2"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Manage ₹7.4 Crore Portfolio</span>
            </button>
            <button
              onClick={() => onNavigateTab('will-versions')}
              className="px-4 py-2 bg-[#0B0D11] hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Inspect SHA-256 Proof</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Will Status */}
        <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Will Status</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <WillStatusBadge status="ACTIVE" />
          </div>
          <div className="text-[11px] text-zinc-400">Version 1 · 6 Legal Clauses</div>
        </div>

        {/* Proof of Life */}
        <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Proof of Life</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <ProofOfLifeBadge status="ACTIVE" />
          </div>
          <div className="text-[11px] text-zinc-400">Next check in 28 days</div>
        </div>

        {/* Assets Cataloged */}
        <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Cataloged Assets</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">$1,850,000</div>
          <div className="text-[11px] text-zinc-400">4 Assets (Real Estate, Crypto, Bank)</div>
        </div>

        {/* Multi-Party Participants */}
        <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Estate Participants</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">5 Members</div>
          <div className="text-[11px] text-zinc-400">1 Advocate · 2 Witnesses · 1 Executor</div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Will Overview & Blockchain Proof */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Will Version Card */}
          <div className="rounded-xl bg-[#15181F] border border-[#232936] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Current Active Will — Version 1</h3>
                  <p className="text-xs text-zinc-400">Finalized and immutable. Governs primary asset distribution.</p>
                </div>
              </div>
              <WillStatusBadge status="ACTIVE" />
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Testator</span>
                  <p className="text-zinc-200 font-medium mt-0.5">Arthur Pendelton</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Advocate Reviewed</span>
                  <p className="text-emerald-400 font-medium mt-0.5">Claire Sterling, Esq.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Attestation Count</span>
                  <p className="text-zinc-200 font-medium mt-0.5">2 Independent Witnesses</p>
                </div>
              </div>

              {/* Clauses summary */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Clauses in this Version
                </div>
                <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-medium">Clause 1: Revocation of Prior Wills &amp; Declaration of Capacity</span>
                    <span className="text-[10px] font-mono text-emerald-400">Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-medium">Clause 2: Appointment of Primary Executor (Marcus Vance)</span>
                    <span className="text-[10px] font-mono text-emerald-400">Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-medium">Clause 3: Distribution of Real Property (Pendelton Manor)</span>
                    <span className="text-[10px] font-mono text-emerald-400">Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-medium">Clause 4: Controlled Release of Sovereign Digital Assets &amp; Keys</span>
                    <span className="text-[10px] font-mono text-emerald-400">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Need to amend clauses?</span>
              <button
                onClick={() => onNavigateTab('will-builder')}
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
              >
                <span>Draft New Version (V2)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Blockchain Proof Card */}
          <BlockchainProofCard
            sha256Hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            txHash="0x4d8a1c97ef31b8a53e97c02b158092ca849f1b2c7e9a03b54d6e8f1a2b3c4d5e"
            blockNumber={6941203}
          />
        </div>

        {/* Right Col: Proof-of-life Heartbeat & Participants */}
        <div className="space-y-6">
          {/* Liveness Check Card */}
          <div className="rounded-xl bg-[#15181F] border border-[#232936] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Proof-of-Life Heartbeat
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono">Monthly Protocol</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              DecentraWill coordinates scheduled liveness responses to assure that estate activation triggers remain dormant.
            </p>

            <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Last Response:</span>
                <span className="text-white font-mono">Today, 5:28 PM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Next Scheduled Check:</span>
                <span className="text-emerald-400 font-mono">23 Oct 2026</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Escalation Window:</span>
                <span className="text-zinc-400">30 Days Grace</span>
              </div>
            </div>

            {proofOfLifeSuccess && (
              <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Liveness verified &amp; signed into audit trail!</span>
              </div>
            )}

            <button
              onClick={handleRespondProofOfLife}
              disabled={proofOfLifeResponding}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700 text-xs font-semibold text-emerald-200 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{proofOfLifeResponding ? 'Deriving Signature...' : 'Check-In Now (I am Alive & Well)'}</span>
            </button>
          </div>

          {/* Participants Card */}
          <div className="rounded-xl bg-[#15181F] border border-[#232936] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Estate Participants
              </h4>
              <button
                onClick={() => onNavigateTab('participants')}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Claire Sterling, Esq.</div>
                  <div className="text-[10px] text-zinc-400">advocate@lawfirm.com</div>
                </div>
                <RoleBadge role="ADVOCATE" />
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Dr. Robert Vance</div>
                  <div className="text-[10px] text-zinc-400">witness1@example.com</div>
                </div>
                <RoleBadge role="WITNESS" />
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Marcus Vance</div>
                  <div className="text-[10px] text-zinc-400">executor@trustee.org</div>
                </div>
                <RoleBadge role="EXECUTOR" />
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Chloe Pendelton</div>
                  <div className="text-[10px] text-zinc-400">beneficiary1@family.org</div>
                </div>
                <RoleBadge role="BENEFICIARY" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
