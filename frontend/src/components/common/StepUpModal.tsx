import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, KeyRound, X, Loader2, CheckCircle2 } from 'lucide-react';

export const StepUpModal: React.FC = () => {
  const { stepUpModalOpen, stepUpReason, submitStepUp, cancelStepUp } = useAuth();
  const [password, setPassword] = useState('SecureP@ssw0rd!2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!stepUpModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await submitStepUp(password);
    } catch (err: any) {
      setError(err.message || 'Authorization failed. Incorrect password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#15181F] border border-amber-600/40 rounded-xl shadow-2xl p-6 text-[#F8F7F3] overflow-hidden">
        {/* Amber trust accent top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-emerald-500 to-amber-600" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white">Step-Up Authentication Required</h3>
              <p className="text-xs text-zinc-400">High-security privilege escalation</p>
            </div>
          </div>
          <button
            onClick={cancelStepUp}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5 p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 text-xs leading-relaxed text-zinc-300">
          <span className="font-semibold text-amber-400">Action:</span> {stepUpReason || 'Sensitive cryptographic estate modification'}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Issues a temporary 10-minute HMAC token recorded in the audit trail.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Confirm Account Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="w-full px-3.5 py-2.5 bg-[#0B0D11] border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition pl-10"
              />
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Default demo password: <code className="text-zinc-400">SecureP@ssw0rd!2026</code></p>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={cancelStepUp}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deriving Proof...
                </>
              ) : (
                'Authorize Action'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
