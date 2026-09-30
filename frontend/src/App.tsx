import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleType } from './types';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { StepUpModal } from './components/common/StepUpModal';
import { LandingPage } from './components/portals/LandingPage';

// Portal views
import { TestatorDashboard } from './components/portals/testator/TestatorDashboard';
import { WillBuilder } from './components/portals/testator/WillBuilder';
import { WillVersions } from './components/portals/testator/WillVersions';
import { AssetManagement } from './components/portals/testator/AssetManagement';
import { DocumentVault } from './components/portals/testator/DocumentVault';
import { ParticipantsManagement } from './components/portals/testator/ParticipantsManagement';
import { ProofOfLifeCenter } from './components/portals/testator/ProofOfLifeCenter';
import { EstatePolicies } from './components/portals/testator/EstatePolicies';
import { AuditTrail } from './components/portals/testator/AuditTrail';

import { AdvocatePortal } from './components/portals/advocate/AdvocatePortal';
import { WitnessPortal } from './components/portals/witness/WitnessPortal';
import { ExecutorPortal } from './components/portals/executor/ExecutorPortal';
import { BeneficiaryPortal } from './components/portals/beneficiary/BeneficiaryPortal';
import { AdminPortal } from './components/portals/admin/AdminPortal';

const AppContent: React.FC = () => {
  const { currentRole, switchRole, loginAsPersona } = useAuth();
  const [view, setView] = useState<'LANDING' | 'APP'>('LANDING');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const handleLaunchApp = () => {
    setView('APP');
    setCurrentTab('dashboard');
  };

  const handleRoleDemoSelect = async (role: RoleType) => {
    await loginAsPersona(role);
    setView('APP');
    setCurrentTab('dashboard');
  };

  if (view === 'LANDING') {
    return (
      <LandingPage
        onEnterApp={handleLaunchApp}
        onSelectRoleDemo={handleRoleDemoSelect}
      />
    );
  }

  const renderRoleTabContent = () => {
    switch (currentRole) {
      case 'TESTATOR':
        switch (currentTab) {
          case 'will-builder':
            return <WillBuilder />;
          case 'will-versions':
            return <WillVersions />;
          case 'assets':
            return <AssetManagement />;
          case 'documents':
            return <DocumentVault />;
          case 'participants':
            return <ParticipantsManagement />;
          case 'proof-of-life':
            return <ProofOfLifeCenter />;
          case 'policies':
            return <EstatePolicies />;
          case 'audit':
            return <AuditTrail />;
          case 'dashboard':
          default:
            return <TestatorDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
        }

      case 'ADVOCATE':
        return <AdvocatePortal />;

      case 'WITNESS':
        return <WitnessPortal />;

      case 'EXECUTOR':
        return <ExecutorPortal />;

      case 'BENEFICIARY':
        return <BeneficiaryPortal />;

      case 'ADMIN':
        return <AdminPortal />;

      default:
        return <TestatorDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F8F7F3] flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tabId) => setCurrentTab(tabId)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#0B0D11]">
          {/* Top Quick Bar: Return to landing & current breadcrumbs */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <button
                onClick={() => setView('LANDING')}
                className="hover:text-emerald-400 transition"
              >
                ← Back to Overview
              </button>
              <span>/</span>
              <span className="text-zinc-200 font-medium capitalize">{currentRole.toLowerCase()} Portal</span>
              <span>/</span>
              <span className="text-emerald-400 font-medium capitalize">{currentTab.replace('-', ' ')}</span>
            </div>
            <span className="hidden sm:inline-block font-mono text-[10px] text-zinc-500">
              Sepolia Testnet Synchronized
            </span>
          </div>

          {renderRoleTabContent()}
        </main>
      </div>

      {/* Global Step-Up Authentication Modal */}
      <StepUpModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
