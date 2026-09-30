import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Asset, AssetType } from '../../../types';
import {
  Coins,
  Building,
  Wallet,
  Landmark,
  Plus,
  Percent,
  CheckCircle2,
  ExternalLink,
  Shield,
  FileText,
  Sliders,
} from 'lucide-react';

export const AssetManagement: React.FC = () => {
  const { currentEstate } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<string>('asset-1');
  const [showAddModal, setShowAddModal] = useState(false);

  const initialAssets: Asset[] = [
    {
      id: 'asset-1',
      estateId: 'estate-1',
      name: 'Pendelton Country Manor & Surrounding Land',
      assetType: 'REAL_ESTATE',
      estimatedValueUsd: 1200000,
      currency: 'USD',
      custodianOrInstitution: 'HM Land Registry UK',
      identifierOrAccountRef: 'Title Deed No: KNG-889412',
      isBlockchainNative: false,
      transferStatus: 'MANUAL_COORDINATION',
      allocations: [
        { beneficiaryId: 'ben-1', beneficiaryName: 'Chloe Pendelton', percentage: 60, conditions: 'Sole lifetime residential right' },
        { beneficiaryId: 'ben-2', beneficiaryName: 'Julian Pendelton', percentage: 40, conditions: 'Equity trust distribution' },
      ],
      createdAt: '2026-09-15',
    },
    {
      id: 'asset-2',
      estateId: 'estate-1',
      name: 'Sovereign Digital Cold Storage (BTC / ETH)',
      assetType: 'CRYPTO',
      estimatedValueUsd: 450000,
      currency: 'USD',
      custodianOrInstitution: 'Ledger HSM Multisig Vault',
      identifierOrAccountRef: '0x71C...89A',
      isBlockchainNative: true,
      network: 'Ethereum Mainnet / Bitcoin',
      contractAddress: '0x1234567890123456789012345678901234567890',
      transferStatus: 'READY_FOR_RELEASE',
      allocations: [
        { beneficiaryId: 'ben-1', beneficiaryName: 'Chloe Pendelton', percentage: 50 },
        { beneficiaryId: 'ben-2', beneficiaryName: 'Julian Pendelton', percentage: 50 },
      ],
      createdAt: '2026-09-18',
    },
    {
      id: 'asset-3',
      estateId: 'estate-1',
      name: 'Barclays Capital Private Wealth Account',
      assetType: 'BANK_ACCOUNT',
      estimatedValueUsd: 200000,
      currency: 'USD',
      custodianOrInstitution: 'Barclays Private Bank (London)',
      identifierOrAccountRef: 'Acct Ending ****-9921',
      isBlockchainNative: false,
      transferStatus: 'PENDING',
      allocations: [
        { beneficiaryId: 'ben-1', beneficiaryName: 'Chloe Pendelton', percentage: 40 },
        { beneficiaryId: 'ben-2', beneficiaryName: 'Julian Pendelton', percentage: 40 },
        { beneficiaryId: 'ben-3', beneficiaryName: 'Children Heritage Foundation', percentage: 20 },
      ],
      createdAt: '2026-09-20',
    },
  ];

  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const activeAsset = assets.find((a) => a.id === selectedAsset) || assets[0];

  const totalValue = assets.reduce((acc, a) => acc + a.estimatedValueUsd, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            Asset Portfolio &amp; Allocation Controls
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Catalog traditional properties, capital accounts, and sovereign blockchain assets with cryptographic allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0B0D11] border border-zinc-800 text-xs">
            <span className="text-zinc-500 mr-2 font-mono">Total Est. Value:</span>
            <span className="text-emerald-400 font-mono font-bold">${totalValue.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-xs font-semibold text-emerald-300 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Asset List (Left) + Detail & Allocation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Cards */}
        <div className="space-y-3">
          {assets.map((asset) => {
            const isSelected = asset.id === selectedAsset;
            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#15181F] border-emerald-600 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-[#0F1115] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {asset.isBlockchainNative ? (
                      <Wallet className="w-4 h-4 text-emerald-400" />
                    ) : asset.assetType === 'REAL_ESTATE' ? (
                      <Building className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Landmark className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-xs font-semibold text-white truncate max-w-[160px]">
                      {asset.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-[#0B0D11] px-1.5 py-0.5 rounded border border-zinc-800">
                    {asset.assetType}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 font-bold">
                    ${asset.estimatedValueUsd.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {asset.allocations.length} Beneficiaries
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Asset Details & Allocation Bar */}
        <div className="lg:col-span-2 rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {activeAsset.assetType}
                </span>
                <h3 className="text-base font-bold text-white">{activeAsset.name}</h3>
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Custodian / Registry: <span className="text-zinc-200">{activeAsset.custodianOrInstitution}</span> · {activeAsset.identifierOrAccountRef}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-400">Estimated Value</div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                ${activeAsset.estimatedValueUsd.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Blockchain Native Metadata if applicable */}
          {activeAsset.isBlockchainNative && (
            <div className="p-4 rounded-xl bg-[#0B0D11] border border-emerald-800/40 text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Network:</span>
                <span className="text-white">{activeAsset.network}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Contract / Vault Address:</span>
                <span className="text-emerald-400 truncate max-w-[240px]">{activeAsset.contractAddress}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Transfer Protocol:</span>
                <span className="text-zinc-300">Multi-Sig Timelock with Dead-Man Switch</span>
              </div>
            </div>
          )}

          {/* Allocation Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Distribution Allocations
              </h4>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Total: {activeAsset.allocations.reduce((acc, a) => acc + a.percentage, 0)}%
              </span>
            </div>

            {/* Visual allocation bar */}
            <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
              {activeAsset.allocations.map((al, idx) => (
                <div
                  key={idx}
                  style={{ width: `${al.percentage}%` }}
                  className={`${
                    idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : 'bg-amber-500'
                  } h-full`}
                  title={`${al.beneficiaryName}: ${al.percentage}%`}
                />
              ))}
            </div>

            <div className="space-y-2.5 pt-2">
              {activeAsset.allocations.map((al, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{al.beneficiaryName}</div>
                    {al.conditions && (
                      <div className="text-[11px] text-zinc-400 mt-0.5">{al.conditions}</div>
                    )}
                  </div>
                  <div className="font-mono text-emerald-400 font-bold text-sm">
                    {al.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
