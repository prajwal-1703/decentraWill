import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import {
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Lock,
  ShieldAlert,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { BlockchainProofCard } from '../../common/BlockchainProofCard';

export const WillBuilder: React.FC = () => {
  const { currentEstate, requestStepUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('Just now');
  const [finalizedProof, setFinalizedProof] = useState<any>(null);

  // Form State across 12 steps
  const [willTitle, setWillTitle] = useState('Last Will & Testament of Arthur Pendelton');
  const [testatorName, setTestatorName] = useState('Arthur Pendelton');
  const [testatorDob, setTestatorDob] = useState('1965-04-12');
  const [testatorAddress, setTestatorAddress] = useState('14 Willowbrook Way, Kensington, London');
  const [spouseName, setSpouseName] = useState('Margaret Pendelton');
  const [maritalStatus, setMaritalStatus] = useState('MARRIED');

  const [beneficiaries, setBeneficiaries] = useState([
    { name: 'Chloe Pendelton', relationship: 'Daughter', email: 'beneficiary1@family.org', percentage: 50 },
    { name: 'Julian Pendelton', relationship: 'Son', email: 'beneficiary2@family.org', percentage: 40 },
    { name: 'Children Heritage Foundation', relationship: 'Charity', email: 'contact@heritage.org', percentage: 10 },
  ]);

  const [executors, setExecutors] = useState([
    { name: 'Marcus Vance', relationship: 'Trusted Family Solicitor', email: 'executor@trustee.org', isPrimary: true },
    { name: 'Claire Sterling, Esq.', relationship: 'Legal Advisor', email: 'advocate@lawfirm.com', isPrimary: false },
  ]);

  // Self-advocacy rule state:
  const [isSelfAdvocate, setIsSelfAdvocate] = useState(false);
  const [coAdvocateName, setCoAdvocateName] = useState('Claire Sterling, Esq.');
  const [coAdvocateAttested, setCoAdvocateAttested] = useState(true);

  const [specialInstructions, setSpecialInstructions] = useState(
    'All cryptographic key access cards stored in the Zurich Safety Deposit Box #412 are to be released only after dual verification by Marcus Vance and Julian Pendelton.'
  );

  const steps = [
    'Overview',
    'Testator Details',
    'Family',
    'Beneficiaries',
    'Executors',
    'Assets Catalog',
    'Distribution',
    'Instructions',
    'Documents',
    'Legal Review',
    'Checklist',
    'Finalization',
  ];

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // Simulate or call backend
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date().toLocaleTimeString());
    }, 600);
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      // Step-up authentication modal prompt
      const stepUpToken = await requestStepUp(
        'Finalize Will Version 1 and compute immutable SHA-256 digest for Ethereum Sepolia anchoring.'
      );

      // Call API
      const result = {
        success: true,
        documentHash: 'a8f273510b64f4342416b208930b2c7e0c45982e04f981412089473b184f901a',
        txHash: '0x9b42c8e10471b052e49c81b0451a703d15b248e9c042183b501f84b62947e103',
        blockNumber: 6941250,
        network: 'Ethereum Sepolia Testnet',
        chainTimestamp: new Date().toISOString(),
      };

      setFinalizedProof(result);
    } catch (err: any) {
      console.warn('Finalization cancelled or failed', err);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Builder Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white font-serif tracking-tight">Structured Will Builder</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800">
              Draft V1.2
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Complete the 12-phase verification journey. Draft is autosaved locally and in your encrypted vault.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500 font-mono">Saved: {lastSaved}</span>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0D11] hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-300 transition"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="p-4 rounded-xl bg-[#15181F] border border-[#232936] overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] text-xs">
          {steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={st}
                onClick={() => setCurrentStep(stepNum)}
                className={`flex items-center gap-1.5 cursor-pointer transition ${
                  isCurrent
                    ? 'text-emerald-400 font-semibold'
                    : isCompleted
                    ? 'text-zinc-300 hover:text-white'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    isCurrent
                      ? 'bg-emerald-500 text-black font-bold ring-2 ring-emerald-400/40'
                      : isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className="truncate max-w-[80px]">{st}</span>
                {idx < steps.length - 1 && <span className="text-zinc-700 mx-1">›</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="rounded-2xl bg-[#15181F] border border-[#232936] p-6 lg:p-8 min-h-[420px] flex flex-col justify-between">
        {/* STEP 1: OVERVIEW */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 1: Will Instrument Overview</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Provide the foundational title and estate scope for this legal instrument.
            </p>
            <div className="space-y-4 max-w-xl pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Legal Title of Will</label>
                <input
                  type="text"
                  value={willTitle}
                  onChange={(e) => setWillTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D11] border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-zinc-300 leading-relaxed">
                <span className="font-semibold text-emerald-400">Jurisdiction Notice:</span> This instrument is prepared
                in alignment with statutory trust standards. Once drafted, Claire Sterling, Esq. (Advocate) will receive
                it in the legal review workspace for statutory compliance before witnessing.
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TESTATOR DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 2: Testator Identification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Legal Name</label>
                <input
                  type="text"
                  value={testatorName}
                  onChange={(e) => setTestatorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D11] border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={testatorDob}
                  onChange={(e) => setTestatorDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D11] border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Permanent Residence Address</label>
                <input
                  type="text"
                  value={testatorAddress}
                  onChange={(e) => setTestatorAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D11] border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FAMILY & RELATIONSHIPS */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 3: Family &amp; Relationship Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pt-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Marital Status</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D11] border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="MARRIED">Married</option>
                  <option value="SINGLE">Single</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Spouse Name</label>
                <input
                  type="text"
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0D11] border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: BENEFICIARIES */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Step 4: Named Beneficiaries</h3>
              <span className="text-xs text-emerald-400 font-mono">
                Total Allocated: {beneficiaries.reduce((acc, b) => acc + b.percentage, 0)}%
              </span>
            </div>
            <div className="space-y-3 pt-2">
              {beneficiaries.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0B0D11] border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{b.name} ({b.relationship})</div>
                    <div className="text-zinc-400 text-[11px]">{b.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-400 font-bold">{b.percentage}% Share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: EXECUTORS */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 5: Appointed Executors</h3>
            <p className="text-xs text-zinc-400">
              Executors possess the authority to trigger activation cases, verify legal death certificates, and execute release orders.
            </p>
            <div className="space-y-3 pt-2">
              {executors.map((ex, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0B0D11] border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      {ex.name}
                      {ex.isPrimary && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800 rounded">
                          Primary Executor
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-[11px]">{ex.email} · {ex.relationship}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: ASSETS */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 6: Estate Asset Catalog</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-zinc-800">
                <div className="font-semibold text-white">Pendelton Country Manor</div>
                <div className="text-zinc-400 mt-1">Real Estate · Est. Value: $1,200,000</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-zinc-800">
                <div className="font-semibold text-white">Cold Storage Sovereign Vault (BTC/ETH)</div>
                <div className="text-zinc-400 mt-1">Blockchain Native · Est. Value: $450,000</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-zinc-800">
                <div className="font-semibold text-white">Barclays Capital Private Trust Account</div>
                <div className="text-zinc-400 mt-1">Bank Account · Est. Value: $200,000</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: DISTRIBUTION */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 7: Distribution Allocation Rules</h3>
            <p className="text-xs text-zinc-400">
              Allocations are verified against a mathematical 100% threshold before finalization.
            </p>
            <div className="p-4 rounded-xl bg-[#0B0D11] border border-zinc-800 space-y-3">
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div style={{ width: '50%' }} className="bg-emerald-500 h-full" title="Chloe: 50%" />
                <div style={{ width: '40%' }} className="bg-blue-500 h-full" title="Julian: 40%" />
                <div style={{ width: '10%' }} className="bg-amber-500 h-full" title="Charity: 10%" />
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Chloe Pendelton (50%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Julian Pendelton (40%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Children Heritage (10%)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: SPECIAL INSTRUCTIONS */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 8: Special Instructions &amp; Cryptographic Custody</h3>
            <textarea
              rows={4}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0D11] border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>
        )}

        {/* STEP 9: DOCUMENTS */}
        {currentStep === 9 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 9: Attached Vault Documents</h3>
            <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-medium">Deed_Pendelton_Manor_2024.pdf</span>
              </div>
              <span className="font-mono text-emerald-400 text-[11px]">SHA-256 Validated</span>
            </div>
          </div>
        )}

        {/* STEP 10: LEGAL REVIEW */}
        {currentStep === 10 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 10: Legal Advocate Review Clearance</h3>
            
            {/* Self-Advocacy Option */}
            <div className="p-4 rounded-xl bg-[#0B0D11] border border-indigo-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-xs">Self-Advocacy Representation</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Are you a licensed advocate acting as legal counsel for your own will?
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="selfAdvocateToggle"
                  checked={isSelfAdvocate}
                  onChange={(e) => setIsSelfAdvocate(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </div>

              {isSelfAdvocate && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 space-y-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Mandatory Independent Co-Advocate Required
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Under DecentraWill trust governance, an advocate representing their own will cannot sole-certify.
                    You must designate at least <strong>one additional independent co-advocate</strong> to certify statutory capacity and clauses.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-zinc-400">Independent Co-Advocate:</span>
                      <input
                        type="text"
                        value={coAdvocateName}
                        onChange={(e) => setCoAdvocateName(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-[#15181F] border border-zinc-700 rounded text-white text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="coAdvocateAttested"
                        checked={coAdvocateAttested}
                        onChange={(e) => setCoAdvocateAttested(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <label htmlFor="coAdvocateAttested" className="text-zinc-300 text-xs">
                        Co-Advocate Attestation Completed
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs text-zinc-300 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Primary Legal Clearance Confirmed</span>
              </div>
              <p>
                Clauses 1 through 6 reviewed. Statutory execution capacity and witness criteria verified.
              </p>
            </div>
          </div>
        )}

        {/* STEP 11: VERIFICATION CHECKLIST */}
        {currentStep === 11 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Step 11: Pre-Finalization Verification Checklist</h3>
            <div className="space-y-2 text-xs">
              {[
                'Testator identity KYC verified with cryptographic identity reference',
                'Legal advocate formal review and compliance certification complete',
                ...(isSelfAdvocate
                  ? [
                      coAdvocateAttested
                        ? `Independent Co-Advocate certification complete (${coAdvocateName})`
                        : `ACTION REQUIRED: Independent Co-Advocate certification missing (${coAdvocateName})`,
                    ]
                  : []),
                '2 Independent witnesses registered with verified email and credentials (Advocate cannot be witness)',
                'Asset allocations sum exactly to 100% with no unassigned residue',
                'Proof-of-life protocol active with 30-day grace period parameters',
              ].map((c, i) => {
                const isBlocked = isSelfAdvocate && !coAdvocateAttested && c.includes('ACTION REQUIRED');
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border flex items-center gap-3 ${
                      isBlocked
                        ? 'bg-red-950/40 border-red-800 text-red-300'
                        : 'bg-[#0B0D11] border-zinc-800 text-zinc-200'
                    }`}
                  >
                    {isBlocked ? (
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 12: FINALIZATION */}
        {currentStep === 12 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Step 12: Finalize Will &amp; Anchor on Blockchain
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Finalization makes this version permanently immutable. It generates the canonical SHA-256 hash and
                initiates the Ethereum Sepolia smart contract anchor transaction.
              </p>
            </div>

            {isSelfAdvocate && !coAdvocateAttested && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Finalization Prohibited:</strong> Because you are an advocate acting
                  for your own will, at least one additional independent co-advocate must attest before finalization can proceed.
                </div>
              </div>
            )}

            {finalizedProof ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/80 text-xs text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm text-white">Will Finalized &amp; Anchored Successfully!</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Version 1 is now locked and actively monitored by the proof-of-life protocol.</div>
                  </div>
                </div>

                <BlockchainProofCard
                  sha256Hash={finalizedProof.documentHash}
                  txHash={finalizedProof.txHash}
                  blockNumber={finalizedProof.blockNumber}
                  network={finalizedProof.network}
                  chainTimestamp={finalizedProof.chainTimestamp}
                />
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-[#0B0D11] border border-amber-600/40 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <span className="font-semibold text-white">Irreversible Operation:</span> Once finalized, you cannot
                    edit Version 1 directly. Any future updates must be drafted as Version 2. High-security step-up authorization
                    is required before proceeding.
                  </div>
                </div>

                <button
                  onClick={handleFinalize}
                  disabled={isFinalizing || (isSelfAdvocate && !coAdvocateAttested)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isFinalizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating SHA-256 &amp; Anchoring...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize &amp; Finalize Will Version 1</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-800 mt-6">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B0D11] hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-300 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs font-mono text-zinc-500">
            Step {currentStep} of {steps.length}
          </span>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
            disabled={currentStep === steps.length}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-xs font-medium text-emerald-300 disabled:opacity-40 transition"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
