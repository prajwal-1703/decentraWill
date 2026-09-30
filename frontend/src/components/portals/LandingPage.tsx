import React, { useState } from 'react';
import {
  Shield,
  FileCheck,
  Users,
  Lock,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  KeyRound,
  Scale,
  Send,
  Vote,
  ExternalLink,
} from 'lucide-react';
import { RoleType } from '../../types';
import { RoleBadge } from '../common/Badges';

interface LandingPageProps {
  onEnterApp: () => void;
  onSelectRoleDemo: (role: RoleType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onSelectRoleDemo }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does DecentraWill replace courts, probate, or statutory succession laws?',
      a: 'No. DecentraWill explicitly does NOT replace probate courts, succession statutes, licensed advocates, or official executor roles. Instead, it provides a tamper-proof digital trust, verification, and asset coordination layer that eliminates evidentiary disputes and ensures tamper detection.',
    },
    {
      q: 'How does DecentraWill ensure documents are not altered?',
      a: 'Every will version and attached document is hashed using SHA-256 cryptographic algorithms upon finalization. The canonical digest is anchored onto Ethereum smart contracts. Any post-finalization mutation in the file immediately fails cryptographic verification.',
    },
    {
      q: 'What happens if a Proof-of-Life check-in is missed?',
      a: 'Missing a heartbeat does NOT automatically confirm death or release assets. It transitions the estate into an escalated verification state, alerting designated advocates and executors to conduct real-world verification and submit certified evidence before any grace period begins.',
    },
    {
      q: 'Can beneficiaries see the will contents before authorized release?',
      a: 'Never. The platform enforces strict cryptographic role boundaries. Beneficiaries can only access released documents and designated asset instructions after all legal preconditions, grace periods, and executor approvals are verified.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F8F7F3] selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* 1. TOP NAVBAR */}
      <nav className="sticky top-0 z-50 h-16 bg-[#0B0D11]/90 backdrop-blur-md border-b border-[#1F242E] px-4 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-forest-800 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-500/40">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-white">
              Decentra<span className="text-emerald-400">Will</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-wider text-emerald-400/80 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              V2 Protocol
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-zinc-300 font-medium">
          <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
          <a href="#trust-layer" className="hover:text-emerald-400 transition">Trust Architecture</a>
          <a href="#roles" className="hover:text-emerald-400 transition">Role Ecosystem</a>
          <a href="#security" className="hover:text-emerald-400 transition">Cryptographic Security</a>
          <a href="#faq" className="hover:text-emerald-400 transition">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEnterApp}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950/60 border border-emerald-500/40 transition group"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative px-4 pt-20 pb-16 lg:pt-32 lg:pb-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Production-Grade Digital Trust &amp; Inheritance Coordination</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          Secure the <span className="italic font-normal text-emerald-400">continuity</span> of your digital &amp; physical estate.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
          DecentraWill adds a cryptographically auditable digital trust layer around the traditional will
          and inheritance process — coordinating advocates, witnesses, proof-of-life, and controlled asset release.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-forest-600 to-emerald-700 hover:from-emerald-500 hover:to-forest-500 text-white text-sm font-semibold rounded-xl shadow-xl shadow-emerald-950/70 border border-emerald-400/40 transition flex items-center justify-center gap-2"
          >
            <span>Open Testator Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#roles"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#15181F] hover:bg-[#1B202A] text-zinc-200 hover:text-white text-sm font-medium rounded-xl border border-[#232936] transition flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Explore 6 Role Portals</span>
          </a>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-3 rounded-lg bg-[#15181F]/50 border border-zinc-800">
            <div className="font-mono text-emerald-400 text-xs font-semibold">SHA-256 Digest</div>
            <div className="text-[11px] text-zinc-400 mt-1">Immutable document hashing on every finalization</div>
          </div>
          <div className="p-3 rounded-lg bg-[#15181F]/50 border border-zinc-800">
            <div className="font-mono text-emerald-400 text-xs font-semibold">Sepolia Anchor</div>
            <div className="text-[11px] text-zinc-400 mt-1">Smart contract state synchronization</div>
          </div>
          <div className="p-3 rounded-lg bg-[#15181F]/50 border border-zinc-800">
            <div className="font-mono text-emerald-400 text-xs font-semibold">Advocate Review</div>
            <div className="text-[11px] text-zinc-400 mt-1">Multi-party legal attestation workflow</div>
          </div>
          <div className="p-3 rounded-lg bg-[#15181F]/50 border border-zinc-800">
            <div className="font-mono text-emerald-400 text-xs font-semibold">Controlled Release</div>
            <div className="text-[11px] text-zinc-400 mt-1">Grace windows &amp; governance threshold checks</div>
          </div>
        </div>
      </section>

      {/* 3. TRADITIONAL WILL + DIGITAL TRUST LAYER */}
      <section id="trust-layer" className="py-20 bg-[#0F1115] border-y border-[#1F242E] px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-semibold">
              The DecentraWill Paradigm
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              Strengthening Traditional Wills With Cryptographic Assurance
            </h2>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              We do not bypass legal requirements. We empower estates with transparency, auditability, and automated coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Will Limitations */}
            <div className="p-6 rounded-2xl bg-[#15181F] border border-red-900/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-950/50 text-red-400 border border-red-800/40">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Traditional Estate Challenges</h3>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Paper wills are prone to loss, unauthorized tampering, and silent physical destruction.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Digital assets, crypto keys, and offshore registries are frequently lost forever due to lack of coordination.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Witness signatures lack verifiable timestamps and cryptographic non-repudiation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Lengthy probate disputes with no immutable evidence of earlier drafts or version progression.</span>
                </li>
              </ul>
            </div>

            {/* DecentraWill Trust Layer */}
            <div className="p-6 rounded-2xl bg-[#15181F] border border-emerald-800/50 space-y-4 shadow-xl shadow-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-700/50">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">DecentraWill Digital Trust Layer</h3>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Cryptographic Immutability:</strong> Every draft version generates a SHA-256 fingerprint anchored on blockchain.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Multi-Party Attestation:</strong> Advocates and witnesses sign specific document hashes with ECDSA proofs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Proof-of-Life Heartbeats:</strong> Proactive liveness checks with configurable grace &amp; challenge windows.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Role-Scoped Access Control:</strong> Beneficiaries cannot see sensitive allocations until certified legal activation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPLETE LIFECYCLE WALKTHROUGH */}
      <section id="how-it-works" className="py-20 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-semibold">
            End-to-End Coordination
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
            The DecentraWill Lifecycle
          </h2>
          <p className="text-sm text-zinc-400 mt-3">
            A cohesive journey from initial testator drafting through immutable anchoring to controlled execution.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Draft & Inventory',
              desc: 'Structured 12-step will builder cataloging real estate, liquid capital, digital keys, and beneficiaries.',
              icon: FileText,
            },
            {
              step: '02',
              title: 'Advocate & Witness',
              desc: 'Legal counsel reviews legal clauses; independent witnesses submit cryptographic attestations against SHA-256 hashes.',
              icon: Scale,
            },
            {
              step: '03',
              title: 'Anchor & Finalize',
              desc: 'High-security step-up authorization seals the version into an immutable hash anchored onto Ethereum Sepolia.',
              icon: Lock,
            },
            {
              step: '04',
              title: 'Govern & Distribute',
              desc: 'Upon verified life-events, grace windows allow executor coordination and policy-governed asset release.',
              icon: Send,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-5 rounded-xl bg-[#15181F] border border-zinc-800 hover:border-emerald-700/60 transition group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold">{item.step}</span>
                  <Icon className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1.5">{item.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ROLE ECOSYSTEM SELECTOR */}
      <section id="roles" className="py-20 bg-[#0F1115] border-t border-[#1F242E] px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-semibold">
              Interactive Role Simulation
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              Six Purpose-Built Role Portals
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Click any persona below to launch the live application directly into their authorized command center.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                role: 'TESTATOR' as RoleType,
                title: 'Testator Workspace',
                name: 'Arthur Pendelton',
                desc: 'Create wills, manage assets, allocate shares, upload vault documents, and configure proof-of-life intervals.',
                features: ['Will Builder & Clauses', 'Asset Allocations', 'Proof-of-Life Check-In', 'Document Vault'],
              },
              {
                role: 'ADVOCATE' as RoleType,
                title: 'Advocate Review',
                name: 'Claire Sterling, Esq.',
                desc: 'Review legal provisions in dual-pane workspace, submit clause amendments, and provide legal attestations.',
                features: ['Dual-Pane Will Review', 'Legal Compliance Checklist', 'Attestation Signing', 'Audit History'],
              },
              {
                role: 'WITNESS' as RoleType,
                title: 'Witness Attestation',
                name: 'Dr. Robert Vance',
                desc: 'View authorized will previews, verify identity, and sign non-repudiable attestations against document digests.',
                features: ['Invitation Acceptance', 'Cryptographic Attestation', 'SHA-256 Receipt', 'Version Isolation'],
              },
              {
                role: 'EXECUTOR' as RoleType,
                title: 'Executor Portal',
                name: 'Marcus Vance',
                desc: 'Handle activation requests, upload legal death certificates, coordinate grace periods, and execute asset transfers.',
                features: ['Activation Management', 'Evidence Verification', 'Transfer Cases', 'Estate Closure'],
              },
              {
                role: 'BENEFICIARY' as RoleType,
                title: 'Beneficiary Portal',
                name: 'Chloe Pendelton',
                desc: 'View authorized and released inheritances, download verified documents, and cast estate governance votes.',
                features: ['Released Asset Portfolio', 'Restricted Documents', 'Governance Voting', 'Transparent Audit'],
              },
              {
                role: 'ADMIN' as RoleType,
                title: 'Security Operations',
                name: 'DecentraWill Security Admin',
                desc: 'Monitor NestJS backend health, Redis queues, Sepolia blockchain synchronization, and exceptional access audits.',
                features: ['Cluster Health', 'Security Events Stream', 'Blockchain Reconciler', 'Exceptional Access'],
              },
            ].map((p) => (
              <div
                key={p.role}
                className="p-6 rounded-2xl bg-[#15181F] border border-[#232936] hover:border-emerald-600/70 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <RoleBadge role={p.role} />
                    <span className="text-xs font-mono text-zinc-500">{p.name}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{p.desc}</p>
                  <div className="space-y-1.5 mb-6">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectRoleDemo(p.role)}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#0B0D11] hover:bg-emerald-950/60 border border-zinc-700 hover:border-emerald-600 text-xs font-medium text-emerald-400 hover:text-white transition flex items-center justify-center gap-1.5"
                >
                  <span>Launch as {p.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-semibold">
            Common Questions
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#15181F] border border-zinc-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4.5 flex items-center justify-between text-sm font-medium text-zinc-200 hover:text-white transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </button>
                {isOpen && (
                  <div className="px-4.5 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. LEGAL BOUNDARY STATEMENT */}
      <section className="py-10 px-4 max-w-4xl mx-auto">
        <div className="p-5 rounded-xl bg-[#15181F]/40 border border-zinc-800 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-semibold mb-2">
            <Scale className="w-4 h-4" />
            Legal Boundary &amp; Non-Substitution Notice
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            DecentraWill is an evidentiary preservation and coordination platform. It does not provide legal advice, 
            nor does it claim that blockchain registration replaces statutory probate requirements, notarizations, or 
            judicial review under your local jurisdiction. All will executions remain subject to governing law.
          </p>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-12 border-t border-[#1F242E] px-4 lg:px-12 bg-[#0B0D11]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-serif text-base font-bold text-white">DecentraWill</span>
            <span className="text-xs text-zinc-500 ml-2">© 2026 DecentraWill Trust Protocol. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sepolia Testnet #6941203
            </span>
            <button onClick={onEnterApp} className="hover:text-white transition font-medium">
              Launch Console
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
