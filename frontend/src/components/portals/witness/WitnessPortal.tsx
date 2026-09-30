import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  Download,
  Lock,
  Loader2,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { WillStatusBadge, KycBadge } from '../../common/Badges';

export const WitnessPortal: React.FC = () => {
  const { requestStepUp, switchRole } = useAuth();
  const [statement, setStatement] = useState(
    'I, Dr. Robert Vance, declare under penalty of perjury that I observed the testator in sound mind and hereby affix my digital signature to Will Version 1.'
  );
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(true); // already signed in seed data
  const [receiptGenerated, setReceiptGenerated] = useState(false);

  const handleSignWitness = async () => {
    setIsSigning(true);
    try {
      await requestStepUp('Witness formal attestation for Will Version 1 (SHA-256: e3b0c442...)');
      setSigned(true);
    } catch (e) {
      console.warn('Witness attestation cancelled', e);
    } finally {
      setIsSigning(false);
    }
  };

  const downloadReceipt = () => {
    const content = `DECENTRAWILL WITNESS ATTESTATION RECEIPT
==============================================
Estate: The Pendelton Trust Estate
Will Instrument: Version 1 (Finalized)
Canonical SHA-256 Digest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Witness Name: Dr. Robert Vance
Witness Email: witness1@example.com
Attestation Timestamp: 25 Sep 2026, 3:40 PM UTC
Sepolia Block Height: #6941203
ECDSA Signature Proof: 0x94b01e8471c90538a719c042183b501f84b62947e1039d8a1c97ef31b8a53e97
Status: Cryptographically Confirmed on Ethereum Testnet`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Witness_Attestation_Receipt_V1_RobertVance.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    setReceiptGenerated(true);
    setTimeout(() => setReceiptGenerated(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-400" />
            Independent Witness Attestation Workspace
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Dr. Robert Vance · Registered Independent Attesting Witness
          </p>
        </div>

        <div className="flex items-center gap-2">
          <KycBadge status="VERIFIED" />
        </div>
      </div>

      {/* Scope & Multi-Role Capability Bar */}
      <div className="p-4 rounded-xl bg-[#15181F] border border-amber-600/30 text-xs text-zinc-300 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Multi-Role Capability &amp; Strict Version Binding</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchRole('TESTATOR')}
              className="px-2.5 py-1 rounded bg-[#0B0D11] hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 border border-zinc-700 text-[11px] transition"
            >
              Draft My Own Will (Testator) →
            </button>
            <button
              onClick={() => switchRole('BENEFICIARY')}
              className="px-2.5 py-1 rounded bg-[#0B0D11] hover:bg-zinc-800 text-teal-400 hover:text-teal-300 border border-zinc-700 text-[11px] transition"
            >
              My Beneficiary Portal →
            </button>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed text-[11px]">
          <strong>Role Flexibility:</strong> You are currently acting as an independent attesting witness for <strong className="text-white">The Pendelton Trust Estate</strong>. You can simultaneously be a testator for your own personal estate, or a beneficiary under someone else's will. However, under legal conflict of interest rules, an advocate cannot act as witness on the same contract.
        </p>
      </div>

      {/* Attestation Details & Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Will Preview & Hash */}
        <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Assigned Instrument Details</h3>
            <WillStatusBadge status="ACTIVE" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Estate Name</span>
              <p className="text-white font-medium mt-0.5">The Pendelton Trust Estate</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Testator</span>
              <p className="text-white font-medium mt-0.5">Arthur Pendelton</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 font-mono text-[11px]">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold font-sans">Document SHA-256</span>
              <p className="text-emerald-400 truncate mt-0.5">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
            </div>
          </div>
        </div>

        {/* Right: Signature & Receipt */}
        <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">Attestation Status</h3>

          {signed ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/80 text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-white text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Attestation Formally Signed &amp; Recorded</span>
                </div>
                <p className="text-zinc-300 text-xs">
                  Your ECDSA digital signature is sealed into the Sepolia smart contract registry.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 pt-1">
                  Signature: 0x94b01e8471c9...53e97
                </div>
              </div>

              <button
                onClick={downloadReceipt}
                className="w-full py-2.5 px-4 bg-[#0B0D11] hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Cryptographic Attestation Receipt</span>
              </button>

              {receiptGenerated && (
                <div className="text-[11px] text-emerald-400 text-center">Receipt downloaded successfully.</div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <textarea
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full p-3 bg-[#0B0D11] border border-zinc-700 rounded-lg text-white"
              />
              <button
                onClick={handleSignWitness}
                disabled={isSigning}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {isSigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
                <span>Affix Witness Digital Signature</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
