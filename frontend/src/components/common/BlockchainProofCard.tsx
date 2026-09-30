import React, { useState } from 'react';
import { ShieldCheck, Check, Copy, ExternalLink, Link2 } from 'lucide-react';

interface BlockchainProofProps {
  sha256Hash: string;
  txHash?: string;
  blockNumber?: number;
  chainTimestamp?: string;
  network?: string;
  isConfirmed?: boolean;
}

export const BlockchainProofCard: React.FC<BlockchainProofProps> = ({
  sha256Hash,
  txHash = '0x8f9c2d1b7e4a503612849e7b23c561a09d3e845f1b2c7e9a03b54d6e8f1a2b3c',
  blockNumber = 6941203,
  chainTimestamp = new Date().toISOString(),
  network = 'Ethereum Sepolia Testnet',
  isConfirmed = true,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  const copyToClipboard = (text: string, isHash: boolean) => {
    navigator.clipboard.writeText(text);
    if (isHash) {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  return (
    <div className="rounded-xl bg-[#15181F] border border-emerald-800/40 p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <ShieldCheck className="w-24 h-24 text-emerald-400" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">Cryptographic Integrity Anchor</h4>
            <p className="text-[11px] text-zinc-400">SHA-256 Digest Anchored to Smart Contract Registry</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {isConfirmed ? 'Proof Confirmed On-Chain' : 'Anchoring Queued'}
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {/* SHA-256 Hash */}
        <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 flex items-center justify-between">
          <div className="space-y-0.5 overflow-hidden pr-2">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-semibold">
              Canonical SHA-256 Digest
            </div>
            <div className="text-emerald-400 truncate text-xs select-all">
              {sha256Hash}
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(sha256Hash, true)}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition shrink-0"
            title="Copy SHA-256"
          >
            {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Transaction Hash */}
        <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 flex items-center justify-between">
          <div className="space-y-0.5 overflow-hidden pr-2">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-semibold">
              Sepolia Transaction Hash
            </div>
            <div className="text-zinc-300 truncate text-xs select-all">
              {txHash}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => copyToClipboard(txHash, false)}
              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              title="Copy TX"
            >
              {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 transition"
              title="View on Sepolia Etherscan"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-2.5 rounded-lg bg-[#0B0D11]/70 border border-zinc-800/80">
            <div className="text-[10px] text-zinc-500 font-sans font-medium">Network</div>
            <div className="text-zinc-200 text-xs font-sans mt-0.5">{network}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0B0D11]/70 border border-zinc-800/80">
            <div className="text-[10px] text-zinc-500 font-sans font-medium">Block Height</div>
            <div className="text-emerald-400 text-xs font-mono mt-0.5">#{blockNumber}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0B0D11]/70 border border-zinc-800/80 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-zinc-500 font-sans font-medium">Timestamp</div>
            <div className="text-zinc-300 text-xs font-sans mt-0.5 truncate">
              {new Date(chainTimestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
