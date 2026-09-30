import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Scale,
  CheckCircle2,
  FileText,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  FolderLock,
  ArrowRight,
  Briefcase,
  Users,
  Building,
  Lock,
  Loader2,
  Info,
} from 'lucide-react';
import { WillStatusBadge } from '../../common/Badges';

export const AdvocatePortal: React.FC = () => {
  const { requestStepUp, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'cases' | 'review' | 'attestations'>('cases');
  const [selectedCaseId, setSelectedCaseId] = useState('case-1');
  const [attestationStatement, setAttestationStatement] = useState(
    'I, Claire Sterling, Esq., have thoroughly examined Will Version 1 for Arthur Pendelton. I certify the clauses conform to governing trust law and the testator possesses execution capacity.'
  );
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationSuccess, setAttestationSuccess] = useState(false);

  // Client cases assigned to this advocate
  const clientCases = [
    {
      id: 'case-1',
      clientName: 'Arthur Pendelton',
      estateName: 'The Pendelton Trust Estate',
      relationship: 'Family Trust & Sovereign Vault',
      activeWillVersion: 'V1 (Finalized & Anchored)',
      status: 'ACTIVE',
      myRole: 'Primary Legal Advocate',
      witnessProhibitionNotice: 'Cannot act as witness on this contract (Conflict of Interest)',
      clausesCount: 4,
      pendingAction: 'All statutory reviews complete. Active on Sepolia.',
    },
    {
      id: 'case-2',
      clientName: 'Eleanor Montgomery',
      estateName: 'The Montgomery Heritage Estate',
      relationship: 'Commercial Real Estate & Equities',
      activeWillVersion: 'V2 (Draft Pending Advocate Certification)',
      status: 'VERIFICATION_PENDING',
      myRole: 'Co-Advocate & Reviewer',
      witnessProhibitionNotice: 'Cannot act as witness on this contract (Conflict of Interest)',
      clausesCount: 7,
      pendingAction: 'Review Clause 4 (Charitable Residuary) before witness attestation.',
    },
  ];

  const activeCase = clientCases.find((c) => c.id === selectedCaseId) || clientCases[0];

  const clauses = [
    {
      no: 1,
      title: 'Revocation of Prior Instruments',
      text: 'I hereby revoke all previous testamentary dispositions, codicils, and wills executed prior to this instrument.',
      status: 'APPROVED',
    },
    {
      no: 2,
      title: 'Appointment of Executor & Trustee',
      text: 'I appoint Marcus Vance as sole primary executor and trustee. In the event of unwillingness or incapacity, Claire Sterling, Esq. is appointed alternate.',
      status: 'APPROVED',
    },
    {
      no: 3,
      title: 'Specific Bequest of Real Estate',
      text: 'I give and devise the real estate known as Pendelton Country Manor, Kensington, London, to my daughter Chloe Pendelton subject to lifetime residency rights.',
      status: 'APPROVED',
    },
    {
      no: 4,
      title: 'Cryptographic Sovereign Assets & Key Protocols',
      text: 'My executor is instructed to follow the Shamir Secret Sharing recovery procedures deposited in Vault Document #3 for access to cold storage keys.',
      status: 'APPROVED',
    },
  ];

  const handleAttest = async () => {
    setIsAttesting(true);
    try {
      await requestStepUp('Sign formal Advocate Legal Attestation with ECDSA credential');
      setAttestationSuccess(true);
    } catch (e) {
      console.warn('Attestation cancelled', e);
    } finally {
      setIsAttesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict Legal Role Boundaries Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            Advocate Client Cases &amp; Contract Registry
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Claire Sterling, Esq. · Managing Legal Counsel for Client Estates
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'cases' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Client Cases ({clientCases.length})
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'review' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Review Workspace
          </button>
          <button
            onClick={() => setActiveTab('attestations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'attestations' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Attestations on Record
          </button>
        </div>
      </div>

      {/* Critical Conflict of Interest Notice */}
      <div className="p-4 rounded-xl bg-[#15181F] border border-indigo-900/40 text-xs text-zinc-300 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Advocate Portal Rules &amp; Conflict of Interest Boundaries</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchRole('TESTATOR')}
              className="px-2.5 py-1 rounded bg-[#0B0D11] hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 border border-zinc-700 text-[11px] transition"
            >
              Draft My Own Will (Testator Portal) →
            </button>
            <button
              onClick={() => switchRole('WITNESS')}
              className="px-2.5 py-1 rounded bg-[#0B0D11] hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-700 text-[11px] transition"
            >
              Witness Other Estates →
            </button>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed text-[11px]">
          <strong>Dual-Role Prohibition:</strong> For any client contract where you serve as Legal Advocate, you are legally
          barred from acting as an attesting witness. To create your own will, switch to the Testator Portal (if you act as your own advocate, you will be required to designate an additional independent co-advocate). To act as an independent witness for an external party, access the Witness Portal.
        </p>
      </div>

      {attestationSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Formal legal attestation signed and anchored into the contract audit trail!</span>
        </div>
      )}

      {/* CLIENT CASES TAB */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Client Wills &amp; Estates Under Legal Supervision
            </h3>
            <span className="text-xs font-mono text-zinc-500">2 Active Contracts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {clientCases.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-[#15181F] border border-[#232936] hover:border-indigo-700/60 transition flex flex-col justify-between space-y-4 text-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                      {c.myRole}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{c.activeWillVersion}</span>
                  </div>

                  <h4 className="text-base font-bold text-white">{c.estateName}</h4>
                  <div className="text-zinc-300">
                    Client: <strong className="text-white">{c.clientName}</strong> · {c.relationship}
                  </div>

                  <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800 space-y-1">
                    <div className="text-[11px] text-zinc-400 font-medium">Pending Counsel Status:</div>
                    <div className="text-white">{c.pendingAction}</div>
                  </div>

                  <div className="p-2.5 rounded bg-red-950/20 border border-red-900/30 text-red-300 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{c.witnessProhibitionNotice}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px] font-mono">{c.clausesCount} Clauses</span>
                  <button
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setActiveTab('review');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800/60 border border-indigo-700 text-indigo-200 text-xs font-medium rounded-lg transition"
                  >
                    <span>Open Case Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DUAL PANE REVIEW WORKSPACE TAB */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#0B0D11] border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">Reviewing Client Contract:</span>
              <strong className="text-white">{activeCase.estateName} ({activeCase.clientName})</strong>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">
              Witness Role Disabled by Legal Ethics
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Will Document Clauses (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Client Will Provisions ({activeCase.clientName})</h3>
                </div>
                <WillStatusBadge status="ACTIVE" />
              </div>

              <div className="space-y-3">
                {clauses.map((c) => (
                  <div key={c.no} className="p-4 rounded-xl bg-[#0B0D11] border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        Clause {c.no}: {c.title}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Legally Sound
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-serif pl-2 border-l-2 border-emerald-600/60">
                      "{c.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Advocate Review Panel (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Statutory Compliance Checklist
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-zinc-200">Testamentary capacity verified through current medical record</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-zinc-200">No undue influence indicators detected</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-zinc-200">Real estate title matches UK Land Registry documentation</span>
                </div>
              </div>

              {/* Advocate Attestation Action */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <label className="block text-xs font-semibold text-white">
                  Formal Advocate Attestation Statement
                </label>
                <textarea
                  rows={4}
                  value={attestationStatement}
                  onChange={(e) => setAttestationStatement(e.target.value)}
                  className="w-full p-3 bg-[#0B0D11] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />

                <button
                  onClick={handleAttest}
                  disabled={isAttesting}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center justify-center gap-2"
                >
                  {isAttesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
                  <span>Sign Cryptographic Attestation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attestations History Tab */}
      {activeTab === 'attestations' && (
        <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Certified Legal Attestations on Record</h3>
          <div className="p-4 rounded-xl bg-[#0B0D11] border border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="font-semibold text-white">Claire Sterling, Esq. (Legal Counsel)</span>
              <span className="font-mono text-emerald-400">Status: Signed &amp; Anchored</span>
            </div>
            <p className="text-zinc-400 italic">
              "I confirm statutory validity and capacity for Will V1 of Arthur Pendelton under London jurisdiction standards."
            </p>
            <div className="text-[10px] font-mono text-zinc-500">
              Signature Proof: 0x8a91b4...2c0e · Block #6941203
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
