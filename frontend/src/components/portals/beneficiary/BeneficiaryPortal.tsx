import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Coins,
  FolderLock,
  Vote,
  Shield,
  CheckCircle2,
  Lock,
  Download,
  Building,
  Wallet,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const BeneficiaryPortal: React.FC = () => {
  const { currentEstate, requestStepUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'assets' | 'documents' | 'votes'>('assets');
  const [voted, setVoted] = useState(false);

  // Scoped to Chloe Pendelton ONLY
  const scopedAssets = [
    {
      id: 'ben-asset-1',
      name: 'Pendelton Country Manor (Residential Devise)',
      type: 'REAL_ESTATE',
      share: '60% Ownership Share (Lifetime Occupancy Right)',
      status: 'Pending Legal Land Registry Coordination',
      custodian: 'HM Land Registry UK',
    },
    {
      id: 'ben-asset-2',
      name: 'Sovereign Digital Cold Storage (BTC / ETH)',
      type: 'CRYPTO',
      share: '50% Vault Beneficiary Allocation (~$225,000)',
      status: 'Timelock Escrow Active',
      custodian: 'Smart Contract Vault Registry',
    },
  ];

  const handleVote = async () => {
    try {
      await requestStepUp('Cast estate governance vote on Trustee Compensation Proposal');
      setVoted(true);
    } catch (e) {
      console.warn('Vote cancelled', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-teal-400" />
            Beneficiary Portal
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Chloe Pendelton · Named Beneficiary under The Pendelton Trust Estate
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'assets' ? 'bg-teal-950 text-teal-300 border border-teal-700' : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Allocated Assets
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'documents' ? 'bg-teal-950 text-teal-300 border border-teal-700' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Authorized Documents
          </button>
          <button
            onClick={() => setActiveTab('votes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'votes' ? 'bg-teal-950 text-teal-300 border border-teal-700' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Estate Votes
          </button>
        </div>
      </div>

      {/* Privacy & Scope Notice */}
      <div className="p-4 rounded-xl bg-[#15181F] border border-teal-800/30 text-xs text-zinc-300 flex items-center gap-3">
        <Shield className="w-5 h-5 text-teal-400 shrink-0" />
        <p className="leading-relaxed text-zinc-400">
          <strong className="text-white">Strict Privacy Boundary:</strong> Under estate trust governance, beneficiaries only have access to resources explicitly allocated to them. Private details regarding other heirs remain confidential.
        </p>
      </div>

      {/* Tab Content */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Your Authorized Asset Allocations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scopedAssets.map((asset) => (
              <div key={asset.id} className="p-5 rounded-2xl bg-[#15181F] border border-[#232936] space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {asset.type === 'REAL_ESTATE' ? <Building className="w-4 h-4 text-amber-400" /> : <Wallet className="w-4 h-4 text-emerald-400" />}
                    <h4 className="font-semibold text-white">{asset.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-[#0B0D11] px-2 py-0.5 rounded border border-zinc-800">
                    {asset.type}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-500 font-medium">Your Scoped Share:</div>
                  <div className="text-emerald-400 font-semibold">{asset.share}</div>
                </div>

                <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1">
                  <span>Custodian: {asset.custodian}</span>
                  <span className="font-mono text-amber-400">{asset.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Released Estate Documents for Chloe Pendelton</h3>
          <div className="p-4.5 rounded-xl bg-[#15181F] border border-[#232936] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-white">Excerpt_Clause_3_Pendelton_Manor_Bequest.pdf</div>
              <div className="text-[11px] text-zinc-400">Authenticated legal extract certifying your ownership devise</div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0D11] hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-white transition">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'votes' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Pending Beneficiary Governance Decisions</h3>
          <div className="p-5 rounded-xl bg-[#15181F] border border-[#232936] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white text-sm">Proposal #104: Annual Estate Maintenance Reserve Allocation</h4>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Voting Active
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Authorizes trustee Marcus Vance to retain 5% of liquid dividends for municipal property tax and structural upkeep of Pendelton Manor.
            </p>

            {voted ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your vote (YES) has been cryptographically recorded into the governance registry.</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleVote}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
                >
                  Vote YES (Approve)
                </button>
                <button
                  onClick={handleVote}
                  className="px-4 py-2 bg-[#0B0D11] hover:bg-zinc-800 text-zinc-300 font-medium rounded-lg border border-zinc-700 transition"
                >
                  Vote NO (Reject)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
