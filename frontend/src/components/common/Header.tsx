import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import { RoleType } from '../../types';
import {
  Shield,
  Building,
  ChevronDown,
  Bell,
  User,
  LogOut,
  ExternalLink,
  Wallet,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { RoleBadge, KycBadge } from './Badges';

export const Header: React.FC = () => {
  const {
    user,
    currentRole,
    currentEstate,
    estates,
    switchRole,
    switchEstate,
    loginAsPersona,
    logout,
  } = useAuth();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [estateDropdownOpen, setEstateDropdownOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const rolesList: RoleType[] = ['TESTATOR', 'ADVOCATE', 'WITNESS', 'EXECUTOR', 'BENEFICIARY', 'ADMIN'];

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#0B0D11]/95 backdrop-blur-md border-b border-[#1F242E] px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Brand + Estate Selector */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-forest-800 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-500/30">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-serif tracking-tight text-base font-bold text-white flex items-center gap-1.5">
              Decentra<span className="text-emerald-400">Will</span>
            </div>
            <div className="text-[10px] tracking-wider text-zinc-400 uppercase font-mono">
              Digital Trust Vault
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block" />

        {/* Estate Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setEstateDropdownOpen(!estateDropdownOpen);
              setRoleDropdownOpen(false);
              setPersonaDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#15181F] hover:bg-[#1B202A] border border-[#232936] text-xs font-medium text-zinc-200 transition"
          >
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[140px] md:max-w-[200px] truncate">
              {currentEstate?.name || 'Select Estate'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {estateDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-[#15181F] border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in">
              <div className="px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80">
                Active Estates
              </div>
              {estates.map((estate) => (
                <button
                  key={estate.id}
                  onClick={() => {
                    switchEstate(estate);
                    setEstateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-zinc-800/60 transition ${
                    currentEstate?.id === estate.id ? 'text-emerald-400 font-semibold' : 'text-zinc-300'
                  }`}
                >
                  <span className="truncate">{estate.name}</span>
                  {currentEstate?.id === estate.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Role Switcher, Demo Personas, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Persona Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setPersonaDropdownOpen(!personaDropdownOpen);
              setRoleDropdownOpen(false);
              setEstateDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40 text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch Persona</span>
            <ChevronDown className="w-3 h-3 text-emerald-400/80" />
          </button>

          {personaDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#15181F] border border-emerald-800/60 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Instant Role-Simulation
              </div>
              <p className="px-2 text-[11px] text-zinc-400 mb-2">
                Switch perspective with live credentials
              </p>
              {rolesList.map((r) => {
                const p = DEMO_PERSONAS[r];
                const isActive = currentRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      loginAsPersona(r);
                      setPersonaDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition mb-1 ${
                      isActive ? 'bg-emerald-950/80 border border-emerald-700/80 text-white' : 'hover:bg-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white flex items-center gap-1.5">
                        {p.name}
                        {isActive && <span className="text-[10px] text-emerald-400">(Active)</span>}
                      </div>
                      <div className="text-[10px] text-zinc-400">{p.desc}</div>
                    </div>
                    <RoleBadge role={r} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Active Role Badge & Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setPersonaDropdownOpen(false);
              setEstateDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-zinc-800/60 transition"
          >
            <RoleBadge role={currentRole} />
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#15181F] border border-zinc-800 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Switch Role Context
              </div>
              {rolesList.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-800/60 transition ${
                    currentRole === r ? 'text-emerald-400 font-semibold' : 'text-zinc-300'
                  }`}
                >
                  <span>{r}</span>
                  {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#15181F] border border-zinc-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-semibold text-white">Trust & Security Alerts</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">2 New</span>
              </div>
              <div className="space-y-2.5 mt-2.5 text-xs">
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60">
                  <div className="font-medium text-emerald-400 text-[11px]">SHA-256 Proof Anchored</div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Will Version 1 hash registered on Sepolia testnet at block #6941203.</p>
                  <span className="text-[10px] text-zinc-500">12 mins ago</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60">
                  <div className="font-medium text-amber-400 text-[11px]">Witness Attestation Completed</div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Dr. Robert Vance submitted formal cryptographic attestation for V1.</p>
                  <span className="text-[10px] text-zinc-500">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800/60 transition border border-transparent hover:border-zinc-700"
          >
            <div className="w-7 h-7 rounded-full bg-forest-900 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-300">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-white truncate max-w-[120px]">
                {user?.fullName || 'Arthur Pendelton'}
              </div>
              <div className="text-[10px] text-zinc-400">KYC Verified</div>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#15181F] border border-zinc-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="pb-2 border-b border-zinc-800">
                <div className="text-xs font-semibold text-white">{user?.fullName}</div>
                <div className="text-[11px] text-zinc-400 truncate">{user?.email}</div>
                <div className="mt-1.5">
                  <KycBadge status="VERIFIED" />
                </div>
              </div>

              <div className="py-2 space-y-1 text-xs text-zinc-300">
                <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Wallet className="w-3.5 h-3.5 text-zinc-500" />
                    Vault Wallet
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">0x71C...89A</span>
                </div>
                <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                    Security Level
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">HSM + MultiSig</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <button
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:bg-red-950/30 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out Securely
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
