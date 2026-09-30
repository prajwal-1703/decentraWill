import React from 'react';
import { WillStatus, KycStatus, DocumentStatus, RoleType, AssetType, ProofOfLifeStatus } from '../../types';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, FileText, Lock, AlertCircle, Ban } from 'lucide-react';

export const WillStatusBadge: React.FC<{ status: WillStatus }> = ({ status }) => {
  const configs: Record<WillStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
    DRAFT: {
      label: 'Draft',
      bg: 'bg-zinc-800/80',
      text: 'text-zinc-300',
      border: 'border-zinc-700',
      icon: Clock,
    },
    VERIFICATION_PENDING: {
      label: 'Verification Pending',
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      border: 'border-amber-800/50',
      icon: AlertCircle,
    },
    READY_TO_FINALIZE: {
      label: 'Ready to Finalize',
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-300',
      border: 'border-emerald-700/60',
      icon: CheckCircle2,
    },
    FINALIZED: {
      label: 'Finalized & Immutable',
      bg: 'bg-emerald-900/60',
      text: 'text-emerald-200',
      border: 'border-emerald-500',
      icon: Lock,
    },
    ACTIVE: {
      label: 'Active on Blockchain',
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-400',
      border: 'border-emerald-600',
      icon: ShieldCheck,
    },
    SUPERSEDED: {
      label: 'Superseded',
      bg: 'bg-zinc-900',
      text: 'text-zinc-500',
      border: 'border-zinc-800',
      icon: Ban,
    },
    REVOKED: {
      label: 'Revoked',
      bg: 'bg-red-950/40',
      text: 'text-red-400',
      border: 'border-red-800',
      icon: AlertTriangle,
    },
    ACTIVATION_PENDING: {
      label: 'Activation Pending',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-700',
      icon: AlertTriangle,
    },
    RELEASED: {
      label: 'Controlled Release',
      bg: 'bg-blue-950/50',
      text: 'text-blue-300',
      border: 'border-blue-700',
      icon: FileText,
    },
    CLOSED: {
      label: 'Estate Closed',
      bg: 'bg-zinc-900',
      text: 'text-zinc-400',
      border: 'border-zinc-700',
      icon: Lock,
    },
  };

  const config = configs[status] || configs.DRAFT;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export const KycBadge: React.FC<{ status: KycStatus }> = ({ status }) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          KYC Verified
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-800/60">
          <Clock className="w-3.5 h-3.5" />
          KYC Processing
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
          Identity Unverified
        </span>
      );
  }
};

export const DocumentStatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          SHA-256 Validated
        </span>
      );
    case 'SCANNING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-blue-950/40 text-blue-400 border border-blue-800 animate-pulse">
          <Clock className="w-3 h-3" />
          Scanning Sandbox
        </span>
      );
    case 'QUARANTINED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/40 text-red-400 border border-red-800">
          <AlertTriangle className="w-3 h-3" />
          Quarantined
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
          {status}
        </span>
      );
  }
};

export const RoleBadge: React.FC<{ role: RoleType; className?: string }> = ({ role, className = '' }) => {
  const roleStyles: Record<RoleType, { label: string; color: string }> = {
    TESTATOR: { label: 'Testator / Grantor', color: 'bg-emerald-950/50 text-emerald-300 border-emerald-800' },
    ADVOCATE: { label: 'Legal Advocate', color: 'bg-indigo-950/50 text-indigo-300 border-indigo-800' },
    WITNESS: { label: 'Attesting Witness', color: 'bg-amber-950/50 text-amber-300 border-amber-800' },
    EXECUTOR: { label: 'Estate Executor', color: 'bg-purple-950/50 text-purple-300 border-purple-800' },
    BENEFICIARY: { label: 'Named Beneficiary', color: 'bg-teal-950/50 text-teal-300 border-teal-800' },
    ADMIN: { label: 'Security Admin', color: 'bg-red-950/50 text-red-300 border-red-800' },
  };

  const c = roleStyles[role] || roleStyles.TESTATOR;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${c.color} ${className}`}>
      {c.label}
    </span>
  );
};

export const ProofOfLifeBadge: React.FC<{ status: ProofOfLifeStatus }> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Confirmed Alive
        </span>
      );
    case 'DUE_SOON':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/50 text-amber-400 border border-amber-800">
          Check Due Soon
        </span>
      );
    case 'ACTION_REQUIRED':
    case 'REMINDER_SENT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-950/60 text-orange-300 border border-orange-700">
          Response Required
        </span>
      );
    case 'ESCALATED':
    case 'UNDER_VERIFICATION':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-950/60 text-red-300 border border-red-700">
          Escalated to Verification
        </span>
      );
    default:
      return <span className="text-zinc-400 text-xs">{status}</span>;
  }
};
