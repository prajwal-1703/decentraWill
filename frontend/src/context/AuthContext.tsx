import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, RoleType, Estate } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  currentRole: RoleType;
  currentEstate: Estate | null;
  estates: Estate[];
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsPersona: (role: RoleType) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: RoleType) => void;
  switchEstate: (estate: Estate) => void;
  refreshEstates: () => Promise<void>;
  requestStepUp: (reason: string) => Promise<string>;
  stepUpModalOpen: boolean;
  stepUpReason: string;
  submitStepUp: (password: string) => Promise<void>;
  cancelStepUp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick persona accounts matching the seeded database
export const DEMO_PERSONAS: Record<RoleType, { email: string; name: string; desc: string }> = {
  TESTATOR: {
    email: 'testator@decentrawill.org',
    name: 'Arthur Pendelton',
    desc: 'Estate Owner & Will Grantor',
  },
  ADVOCATE: {
    email: 'advocate@lawfirm.com',
    name: 'Claire Sterling, Esq.',
    desc: 'Legal Counsel & Reviewer',
  },
  WITNESS: {
    email: 'witness1@example.com',
    name: 'Dr. Robert Vance',
    desc: 'Attestation Witness',
  },
  EXECUTOR: {
    email: 'executor@trustee.org',
    name: 'Marcus Vance',
    desc: 'Estate Trustee & Executor',
  },
  BENEFICIARY: {
    email: 'beneficiary1@family.org',
    name: 'Chloe Pendelton',
    desc: 'Named Trust Beneficiary',
  },
  ADMIN: {
    email: 'admin@decentrawill.org',
    name: 'DecentraWill Security Admin',
    desc: 'System Security & Ops',
  },
};

const DEFAULT_PASSWORD = 'SecureP@ssw0rd!2026';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dw_access_token'));
  const [currentRole, setCurrentRole] = useState<RoleType>('TESTATOR');
  const [currentEstate, setCurrentEstate] = useState<Estate | null>(null);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Step-up state
  const [stepUpModalOpen, setStepUpModalOpen] = useState(false);
  const [stepUpReason, setStepUpReason] = useState('');
  const [stepUpResolver, setStepUpResolver] = useState<{
    resolve: (token: string) => void;
    reject: (err: Error) => void;
  } | null>(null);

  // Auto-login or hydrate state on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dw_access_token');
      if (storedToken) {
        try {
          const userEstates = await api.getEstates();
          setEstates(userEstates);
          if (userEstates.length > 0) {
            setCurrentEstate(userEstates[0]);
          }
          // Read user profile info from token or default
          const storedEmail = localStorage.getItem('dw_user_email') || 'testator@decentrawill.org';
          const storedName = localStorage.getItem('dw_user_name') || 'Arthur Pendelton';
          const storedRole = (localStorage.getItem('dw_current_role') as RoleType) || 'TESTATOR';
          setUser({
            id: 'u-current',
            email: storedEmail,
            fullName: storedName,
            roles: ['TESTATOR', 'ADVOCATE', 'WITNESS', 'EXECUTOR', 'BENEFICIARY', 'ADMIN'],
            kycStatus: 'VERIFIED',
            walletAddress: '0x71C...89A',
          });
          setCurrentRole(storedRole);
        } catch {
          // If token expired, clear
          localStorage.removeItem('dw_access_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setToken(res.accessToken);
      const userProfile: UserProfile = {
        id: res.user?.id || 'u-auth',
        email: res.user?.email || email,
        fullName: res.user?.fullName || email.split('@')[0],
        roles: res.user?.roles || ['TESTATOR'],
        kycStatus: res.user?.kycStatus || 'VERIFIED',
      };
      setUser(userProfile);
      localStorage.setItem('dw_user_email', userProfile.email);
      localStorage.setItem('dw_user_name', userProfile.fullName);

      // Determine initial role
      const initialRole = userProfile.roles[0] || 'TESTATOR';
      setCurrentRole(initialRole);
      localStorage.setItem('dw_current_role', initialRole);

      // Fetch estates
      const userEstates = await api.getEstates().catch(() => []);
      if (userEstates.length > 0) {
        setEstates(userEstates);
        setCurrentEstate(userEstates[0]);
      } else {
        // Fallback default estate if new user
        const fallback: Estate = {
          id: 'estate-pendelton',
          name: 'The Pendelton Trust Estate',
          description: 'Comprehensive family trust covering real property, liquid capital, and sovereign digital assets.',
          ownerId: userProfile.id,
          ownerName: userProfile.fullName,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        setEstates([fallback]);
        setCurrentEstate(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsPersona = async (role: RoleType) => {
    const persona = DEMO_PERSONAS[role];
    await login(persona.email, DEFAULT_PASSWORD);
    setCurrentRole(role);
    localStorage.setItem('dw_current_role', role);
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
    setCurrentEstate(null);
    localStorage.removeItem('dw_access_token');
    localStorage.removeItem('dw_refresh_token');
    localStorage.removeItem('dw_user_email');
    localStorage.removeItem('dw_user_name');
  };

  const switchRole = (role: RoleType) => {
    setCurrentRole(role);
    localStorage.setItem('dw_current_role', role);
  };

  const switchEstate = (estate: Estate) => {
    setCurrentEstate(estate);
  };

  const refreshEstates = async () => {
    try {
      const userEstates = await api.getEstates();
      setEstates(userEstates);
      if (userEstates.length > 0 && !currentEstate) {
        setCurrentEstate(userEstates[0]);
      }
    } catch (e) {
      console.error('Failed refreshing estates', e);
    }
  };

  // Step-up request handling
  const requestStepUp = (reason: string): Promise<string> => {
    setStepUpReason(reason);
    setStepUpModalOpen(true);
    return new Promise<string>((resolve, reject) => {
      setStepUpResolver({ resolve, reject });
    });
  };

  const submitStepUp = async (password: string) => {
    try {
      const res = await api.stepUp(password, stepUpReason);
      if (stepUpResolver) {
        stepUpResolver.resolve(res.stepUpToken);
      }
      setStepUpModalOpen(false);
      setStepUpResolver(null);
    } catch (err: any) {
      if (stepUpResolver) {
        stepUpResolver.reject(err);
      }
      throw err;
    }
  };

  const cancelStepUp = () => {
    if (stepUpResolver) {
      stepUpResolver.reject(new Error('Step-up authorization cancelled by user.'));
    }
    setStepUpModalOpen(false);
    setStepUpResolver(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentRole,
        currentEstate,
        estates,
        isLoading,
        login,
        loginAsPersona,
        logout,
        switchRole,
        switchEstate,
        refreshEstates,
        requestStepUp,
        stepUpModalOpen,
        stepUpReason,
        submitStepUp,
        cancelStepUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
