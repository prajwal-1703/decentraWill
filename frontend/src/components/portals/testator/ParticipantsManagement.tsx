import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { RoleType } from '../../../types';
import { Users, UserPlus, Mail, ShieldCheck, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { RoleBadge } from '../../common/Badges';

export const ParticipantsManagement: React.FC = () => {
  const { currentEstate } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleType>('WITNESS');
  const [inviteName, setInviteName] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [participants, setParticipants] = useState([
    { id: 'm-1', name: 'Arthur Pendelton', email: 'testator@decentrawill.org', role: 'TESTATOR' as RoleType, status: 'ACTIVE' },
    { id: 'm-2', name: 'Claire Sterling, Esq.', email: 'advocate@lawfirm.com', role: 'ADVOCATE' as RoleType, status: 'ACTIVE' },
    { id: 'm-3', name: 'Dr. Robert Vance', email: 'witness1@example.com', role: 'WITNESS' as RoleType, status: 'ACTIVE' },
    { id: 'm-4', name: 'Eleanor Bennett', email: 'witness2@example.com', role: 'WITNESS' as RoleType, status: 'ACTIVE' },
    { id: 'm-5', name: 'Marcus Vance', email: 'executor@trustee.org', role: 'EXECUTOR' as RoleType, status: 'ACTIVE' },
    { id: 'm-6', name: 'Chloe Pendelton', email: 'beneficiary1@family.org', role: 'BENEFICIARY' as RoleType, status: 'ACTIVE' },
    { id: 'm-7', name: 'Julian Pendelton', email: 'beneficiary2@family.org', role: 'BENEFICIARY' as RoleType, status: 'ACTIVE' },
  ]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember = {
      id: `m-${Date.now()}`,
      name: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'INVITED',
    };

    setParticipants([...participants, newMember]);
    setInviteEmail('');
    setInviteName('');
    setShowInviteModal(false);
    setSuccessMsg(`Cryptographic invitation token sent to ${newMember.email}`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Estate Participants &amp; Role Assignments
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Authorize legal counsel, independent witnesses, and executors. Each role receives cryptographically scoped permissions.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white text-xs font-semibold shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Participant</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Participants Table */}
      <div className="rounded-xl bg-[#15181F] border border-[#232936] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B0D11] border-b border-zinc-800 text-zinc-400 font-medium">
            <tr>
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4">Estate Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Security Validation</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-800/30 transition">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-[11px] text-zinc-400">{p.email}</div>
                </td>
                <td className="py-3.5 px-4">
                  <RoleBadge role={p.role} />
                </td>
                <td className="py-3.5 px-4">
                  {p.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                      <Clock className="w-3 h-3" /> Token Pending
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                  KYC Verified · ECDSA Key Registered
                </td>
                <td className="py-3.5 px-4 text-right">
                  {p.role !== 'TESTATOR' && (
                    <button
                      onClick={() => setParticipants(participants.filter((x) => x.id !== p.id))}
                      className="p-1 text-zinc-500 hover:text-red-400 transition"
                      title="Revoke Permission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#15181F] border border-zinc-700 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Invite Estate Participant</h3>
            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Attorney Sarah Connor"
                  className="w-full px-3 py-2 bg-[#0B0D11] border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full px-3 py-2 bg-[#0B0D11] border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Role Assignment</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 bg-[#0B0D11] border border-zinc-700 rounded-lg text-white"
                >
                  <option value="ADVOCATE">Legal Advocate</option>
                  <option value="WITNESS">Attesting Witness</option>
                  <option value="EXECUTOR">Estate Executor</option>
                  <option value="BENEFICIARY">Named Beneficiary</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg"
                >
                  Send Cryptographic Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
