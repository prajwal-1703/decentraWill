import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleType } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Coins,
  FolderLock,
  Users,
  Activity,
  Sliders,
  History,
  CheckCircle,
  FileCheck2,
  Lock,
  Scale,
  Send,
  Vote,
  Server,
  ShieldAlert,
  GitCompare,
  KeyRound,
  FileSignature,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentRole } = useAuth();

  const getNavItems = (role: RoleType) => {
    switch (role) {
      case 'TESTATOR':
        return [
          { id: 'dashboard', label: 'Estate Dashboard', icon: LayoutDashboard },
          { id: 'will-builder', label: 'Will Builder & Clauses', icon: FileText },
          { id: 'will-versions', label: 'Versions & SHA-256 Proofs', icon: Layers },
          { id: 'assets', label: 'Assets & Allocations', icon: Coins },
          { id: 'documents', label: 'Document Vault', icon: FolderLock },
          { id: 'participants', label: 'Participants & Roles', icon: Users },
          { id: 'proof-of-life', label: 'Proof-of-Life Check-In', icon: Activity },
          { id: 'policies', label: 'Estate Policies & Rules', icon: Sliders },
          { id: 'audit', label: 'Cryptographic Audit Trail', icon: History },
        ];
      case 'ADVOCATE':
        return [
          { id: 'dashboard', label: 'Advocate Dashboard', icon: LayoutDashboard },
          { id: 'review-workspace', label: 'Will Review Workspace', icon: Scale },
          { id: 'evidence', label: 'Legal Evidence & Vault', icon: FolderLock },
          { id: 'attestations', label: 'Advocate Attestations', icon: FileSignature },
          { id: 'client-estates', label: 'Client Estates', icon: Users },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ];
      case 'WITNESS':
        return [
          { id: 'dashboard', label: 'Witness Dashboard', icon: LayoutDashboard },
          { id: 'invitations', label: 'Attestation Invitations', icon: Users },
          { id: 'witness-attest', label: 'Sign Attestation', icon: FileCheck2 },
          { id: 'receipts', label: 'Attestation Receipts', icon: CheckCircle },
          { id: 'audit', label: 'Verification Log', icon: History },
        ];
      case 'EXECUTOR':
        return [
          { id: 'dashboard', label: 'Executor Dashboard', icon: LayoutDashboard },
          { id: 'activation', label: 'Activation Cases & Evidence', icon: ShieldAlert },
          { id: 'governance', label: 'Governance Decisions', icon: Vote },
          { id: 'execution', label: 'Asset Transfers & Execution', icon: Send },
          { id: 'closure', label: 'Estate Closure', icon: Lock },
          { id: 'audit', label: 'Compliance Audit', icon: History },
        ];
      case 'BENEFICIARY':
        return [
          { id: 'dashboard', label: 'Beneficiary Dashboard', icon: LayoutDashboard },
          { id: 'released-assets', label: 'Released Assets', icon: Coins },
          { id: 'documents', label: 'Authorized Documents', icon: FolderLock },
          { id: 'governance-vote', label: 'Governance Voting', icon: Vote },
          { id: 'activity', label: 'Activity Log', icon: History },
        ];
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Admin Command Center', icon: LayoutDashboard },
          { id: 'system-health', label: 'System Health & Services', icon: Server },
          { id: 'security-events', label: 'Security & Auth Audit', icon: ShieldAlert },
          { id: 'blockchain-reconciliation', label: 'Blockchain Reconciler', icon: GitCompare },
          { id: 'exceptional-access', label: 'Exceptional Access Protocol', icon: KeyRound },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems(currentRole);

  return (
    <aside className="w-64 bg-[#0F1115] border-r border-[#1F242E] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
          {currentRole} Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition text-left ${
                isActive
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#15181F]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Security Status Box */}
      <div className="p-3 m-3 rounded-xl bg-[#15181F] border border-[#232936] text-[11px] text-zinc-400 space-y-2">
        <div className="flex items-center justify-between text-zinc-300 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            HSM Vault
          </span>
          <span className="font-mono text-[10px] text-emerald-400">Sepolia Active</span>
        </div>
        <p className="text-[10px] leading-relaxed text-zinc-500">
          All document hashes anchored immutably via ECDSA signatures.
        </p>
      </div>
    </aside>
  );
};
