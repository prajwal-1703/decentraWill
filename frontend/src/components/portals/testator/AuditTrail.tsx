import React, { useState } from 'react';
import { History, ShieldCheck, CheckCircle2, Lock, FileText, Search, ExternalLink } from 'lucide-react';
import { AuditEvent } from '../../../types';

export const AuditTrail: React.FC = () => {
  const [filter, setFilter] = useState('');

  const events: AuditEvent[] = [
    {
      id: 'aud-1',
      actorEmail: 'testator@decentrawill.org',
      actorRole: 'TESTATOR',
      action: 'PROOF_OF_LIFE_HEARTBEAT_CONFIRMED',
      entityType: 'ESTATE',
      entityId: 'estate-1',
      details: 'Testator submitted valid HMAC response from authenticated session.',
      sha256Hash: 'e7a1b028471c90538a719c042183b501f84b62947e1039d8a1c97ef31b8a53e9',
      timestamp: '25 Sep 2026, 5:28 PM',
    },
    {
      id: 'aud-2',
      actorEmail: 'system-relayer@decentrawill.org',
      actorRole: 'SYSTEM',
      action: 'BLOCKCHAIN_ANCHOR_CONFIRMED',
      entityType: 'WILL_VERSION',
      entityId: 'ver-1',
      details: 'Sepolia block #6941203 confirmed transaction 0x4d8a...b3c4.',
      sha256Hash: 'a8f273510b64f4342416b208930b2c7e0c45982e04f981412089473b184f901a',
      timestamp: '25 Sep 2026, 4:22 PM',
    },
    {
      id: 'aud-3',
      actorEmail: 'witness1@example.com',
      actorRole: 'WITNESS',
      action: 'WITNESS_ATTESTATION_SUBMITTED',
      entityType: 'WILL_VERSION',
      entityId: 'ver-1',
      details: 'Dr. Robert Vance signed cryptographic attestation against SHA-256 digest.',
      sha256Hash: '6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
      timestamp: '25 Sep 2026, 3:40 PM',
    },
    {
      id: 'aud-4',
      actorEmail: 'advocate@lawfirm.com',
      actorRole: 'ADVOCATE',
      action: 'LEGAL_COMPLIANCE_CERTIFIED',
      entityType: 'WILL_VERSION',
      entityId: 'ver-1',
      details: 'Claire Sterling, Esq. verified clauses 1-6 for statutory compliance.',
      sha256Hash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      timestamp: '25 Sep 2026, 2:10 PM',
    },
    {
      id: 'aud-5',
      actorEmail: 'testator@decentrawill.org',
      actorRole: 'TESTATOR',
      action: 'DOCUMENT_VAULT_UPLOAD',
      entityType: 'DOCUMENT',
      entityId: 'doc-1',
      details: 'Title_Deed_Pendelton_Manor_2024.pdf scanned and verified cleanly.',
      sha256Hash: '4a8b72c9103e845f1b2c7e9a03b54d6e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
      timestamp: '25 Sep 2026, 1:15 PM',
    },
  ];

  const filteredEvents = events.filter(
    (e) =>
      e.action.toLowerCase().includes(filter.toLowerCase()) ||
      e.actorEmail.toLowerCase().includes(filter.toLowerCase()) ||
      e.details?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Cryptographic Audit Trail
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Every estate transition is cryptographically chained and timestamped, creating tamper-evident court admissibility.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search action or actor..."
            className="px-3.5 py-1.5 pl-8 bg-[#0B0D11] border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="space-y-3">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className="p-4 rounded-xl bg-[#15181F] border border-[#232936] hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-emerald-400 text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {ev.action}
                </span>
                <span className="text-zinc-400">by</span>
                <strong className="text-white">{ev.actorEmail}</strong>
                <span className="text-[10px] text-zinc-500 font-mono">({ev.actorRole})</span>
              </div>
              <p className="text-zinc-300 text-xs mt-1">{ev.details}</p>
              <div className="text-[10px] font-mono text-zinc-500 truncate max-w-xl">
                Hash: <span className="text-zinc-400">{ev.sha256Hash}</span>
              </div>
            </div>

            <div className="text-right shrink-0 text-zinc-400 text-[11px] font-mono">
              {ev.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
