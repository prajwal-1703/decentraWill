import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Sliders, ShieldAlert, CheckCircle2, Lock, Save, Loader2 } from 'lucide-react';

export const EstatePolicies: React.FC = () => {
  const { requestStepUp } = useAuth();
  const [witnessCount, setWitnessCount] = useState(2);
  const [advocateReviewRequired, setAdvocateReviewRequired] = useState(true);
  const [gracePeriodDays, setGracePeriodDays] = useState(30);
  const [challengeWindowDays, setChallengeWindowDays] = useState(14);
  const [governanceQuorum, setGovernanceQuorum] = useState(60);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await requestStepUp('Modify governance policies and cryptographic witness rules for the estate.');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (e) {
      console.warn('Policy update cancelled', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Estate Workflow Governance &amp; Policies
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Define statutory thresholds, witness attestation minimums, and post-activation challenge windows.
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg">
          Policy Ver: 2.1 Enforced
        </span>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Policies successfully updated and anchored into smart contract rules!</span>
        </div>
      )}

      <form onSubmit={handleSavePolicies} className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Witness Requirements */}
          <div className="p-4 rounded-xl bg-[#0B0D11] border border-zinc-800 space-y-2">
            <label className="block font-semibold text-white">Required Attesting Witnesses</label>
            <p className="text-zinc-400 text-[11px]">
              Minimum number of independent verified witnesses required to finalize any will version.
            </p>
            <select
              value={witnessCount}
              onChange={(e) => setWitnessCount(Number(e.target.value))}
              className="w-full mt-2 px-3 py-2 bg-[#15181F] border border-zinc-700 rounded-lg text-white font-mono"
            >
              <option value={2}>2 Witnesses (Statutory Standard)</option>
              <option value={3}>3 Witnesses (Enhanced Trust)</option>
              <option value={4}>4 Witnesses (Institutional)</option>
            </select>
          </div>

          {/* Advocate Review Requirement */}
          <div className="p-4 rounded-xl bg-[#0B0D11] border border-zinc-800 space-y-2">
            <label className="block font-semibold text-white">Mandatory Advocate Legal Review</label>
            <p className="text-zinc-400 text-[11px]">
              Prevents will finalization until licensed legal counsel certifies clause validity.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="advocateReq"
                checked={advocateReviewRequired}
                onChange={(e) => setAdvocateReviewRequired(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <label htmlFor="advocateReq" className="text-zinc-300">
                Enforce mandatory advocate review before witnessing
              </label>
            </div>
          </div>

          {/* Grace Period */}
          <div className="p-4 rounded-xl bg-[#0B0D11] border border-zinc-800 space-y-2">
            <label className="block font-semibold text-white">Activation Grace Window</label>
            <p className="text-zinc-400 text-[11px]">
              Number of days between activation request and potential asset release.
            </p>
            <input
              type="number"
              min={14}
              max={90}
              value={gracePeriodDays}
              onChange={(e) => setGracePeriodDays(Number(e.target.value))}
              className="w-full mt-2 px-3 py-2 bg-[#15181F] border border-zinc-700 rounded-lg text-white font-mono"
            />
          </div>

          {/* Challenge Window */}
          <div className="p-4 rounded-xl bg-[#0B0D11] border border-zinc-800 space-y-2">
            <label className="block font-semibold text-white">Heir Challenge Window</label>
            <p className="text-zinc-400 text-[11px]">
              Duration in days where any interested party may lodge formal dispute evidence.
            </p>
            <input
              type="number"
              min={7}
              max={60}
              value={challengeWindowDays}
              onChange={(e) => setChallengeWindowDays(Number(e.target.value))}
              className="w-full mt-2 px-3 py-2 bg-[#15181F] border border-zinc-700 rounded-lg text-white font-mono"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-zinc-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Policy modifications are audited and require step-up re-authentication.</span>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Policies</span>
          </button>
        </div>
      </form>
    </div>
  );
};
