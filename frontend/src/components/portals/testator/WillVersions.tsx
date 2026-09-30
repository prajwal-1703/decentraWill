import React, { useState } from 'react';
import { Layers, ShieldCheck, Lock, CheckCircle2, Copy, Check, ExternalLink, Plus, Eye, History } from 'lucide-react';
import { WillStatusBadge } from '../../common/Badges';
import { BlockchainProofCard } from '../../common/BlockchainProofCard';

export const WillVersions: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [copiedHash, setCopiedHash] = useState(false);

  const versions = [
    {
      versionNo: 1,
      status: 'ACTIVE' as const,
      title: 'Canonical Family Trust & Asset Distribution',
      createdDate: '25 Sep 2026, 4:15 PM',
      creator: 'Arthur Pendelton',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      txHash: '0x4d8a1c97ef31b8a53e97c02b158092ca849f1b2c7e9a03b54d6e8f1a2b3c4d5e',
      blockNumber: 6941203,
      clausesCount: 6,
      attestations: [
        { role: 'ADVOCATE', name: 'Claire Sterling, Esq.', status: 'Reviewed & Certified' },
        { role: 'WITNESS', name: 'Dr. Robert Vance', status: 'Cryptographically Attested' },
        { role: 'WITNESS', name: 'Eleanor Bennett', status: 'Cryptographically Attested' },
      ],
      isCurrent: true,
    },
    {
      versionNo: 0,
      status: 'SUPERSEDED' as const,
      title: 'Initial Preliminary Draft',
      createdDate: '12 Sep 2026, 11:30 AM',
      creator: 'Arthur Pendelton',
      sha256: '14b09c8129e71f928c0498172938174092837409283749283749283749283749',
      txHash: '0x12a84b9c7e0f218394a821948120491823901928340192834019283401928340',
      blockNumber: 6938910,
      clausesCount: 4,
      attestations: [
        { role: 'ADVOCATE', name: 'Claire Sterling, Esq.', status: 'Draft Feedback Provided' },
      ],
      isCurrent: false,
    },
  ];

  const currentVer = versions.find((v) => v.versionNo === selectedVersion) || versions[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Immutable Version Registry &amp; Proofs
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Historical versions are cryptographically sealed. Any amendment spawns a new version without mutating historical anchors.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-xs font-semibold text-emerald-300 transition">
          <Plus className="w-3.5 h-3.5" />
          <span>Draft Version 2</span>
        </button>
      </div>

      {/* Version Selector Tabs */}
      <div className="flex items-center gap-3">
        {versions.map((v) => (
          <button
            key={v.versionNo}
            onClick={() => setSelectedVersion(v.versionNo)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition flex items-center gap-2.5 ${
              selectedVersion === v.versionNo
                ? 'bg-[#15181F] border-emerald-600 text-white shadow-md'
                : 'bg-[#0B0D11] border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="font-mono font-bold">V{v.versionNo}</span>
            <span>{v.isCurrent ? '(Active Will)' : '(Superseded)'}</span>
            <WillStatusBadge status={v.status} />
          </button>
        ))}
      </div>

      {/* Selected Version Detail Card */}
      <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Version {currentVer.versionNo}
              </span>
              <h3 className="text-base font-semibold text-white">{currentVer.title}</h3>
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
              <span>Sealed on: {currentVer.createdDate}</span>
              <span>•</span>
              <span>Creator: {currentVer.creator}</span>
            </div>
          </div>
          <WillStatusBadge status={currentVer.status} />
        </div>

        {/* Attestations in this version */}
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Multi-Party Cryptographic Attestations ({currentVer.attestations.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentVer.attestations.map((att, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0B0D11] border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">{att.role}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-semibold text-white">{att.name}</div>
                <div className="text-[11px] text-emerald-400">{att.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Anchor Proof */}
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Sepolia On-Chain Proof
          </h4>
          <BlockchainProofCard
            sha256Hash={currentVer.sha256}
            txHash={currentVer.txHash}
            blockNumber={currentVer.blockNumber}
          />
        </div>
      </div>
    </div>
  );
};
