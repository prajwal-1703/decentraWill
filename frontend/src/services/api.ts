import {
  UserProfile,
  Estate,
  Will,
  WillVersion,
  Asset,
  EstateDocument,
  Attestation,
  ProofOfLifeRecord,
  GovernanceProposal,
  ActivationCase,
  AuditEvent,
  SystemNotification,
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private getHeaders(stepUpToken?: string): HeadersInit {
    const token = localStorage.getItem('dw_access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (stepUpToken) {
      headers['x-step-up-token'] = stepUpToken;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      if (response.status === 401) {
        // Try refresh token if available or emit session expired
        const refreshToken = localStorage.getItem('dw_refresh_token');
        if (refreshToken && !endpoint.includes('/auth/refresh')) {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('dw_access_token', data.accessToken);
            // retry once
            return this.request<T>(endpoint, options);
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP error ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      console.warn(`[API] ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // --- AUTHENTICATION ---
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: UserProfile }> {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('dw_access_token', res.accessToken);
    localStorage.setItem('dw_refresh_token', res.refreshToken);
    return res;
  }

  async register(data: { email: string; password: string; fullName: string; role?: string }): Promise<any> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('dw_access_token');
      localStorage.removeItem('dw_refresh_token');
    }
  }

  async stepUp(password: string, reason: string): Promise<{ stepUpToken: string; expiresAt: string }> {
    return this.request('/auth/step-up', {
      method: 'POST',
      body: JSON.stringify({ password, reason }),
    });
  }

  async connectWallet(address: string, chainId: number): Promise<any> {
    return this.request('/wallets/connect', {
      method: 'POST',
      body: JSON.stringify({ address, chainId }),
    });
  }

  // --- KYC / IDENTITY ---
  async getKycStatus(): Promise<{ status: string; reference?: string; verifiedAt?: string }> {
    return this.request('/kyc/status');
  }

  async startKyc(data: { idType: string; documentNumber: string }): Promise<any> {
    return this.request('/kyc/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async mockVerifyKyc(): Promise<any> {
    return this.request('/kyc/mock-verify', {
      method: 'POST',
      body: JSON.stringify({ status: 'VERIFIED' }),
    });
  }

  // --- ESTATES ---
  async getEstates(): Promise<Estate[]> {
    return this.request('/estates');
  }

  async getEstateById(estateId: string): Promise<Estate> {
    return this.request(`/estates/${estateId}`);
  }

  async createEstate(data: { name: string; description: string }): Promise<Estate> {
    return this.request('/estates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async inviteParticipant(estateId: string, data: { email: string; role: string; fullName?: string }): Promise<any> {
    return this.request(`/estates/${estateId}/participants/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- WILLS & VERSIONS ---
  async createWill(data: { estateId: string; title: string; description?: string }): Promise<Will> {
    return this.request('/wills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createWillVersion(willId: string, data: { versionNo: number; contentPayload: string }): Promise<WillVersion> {
    return this.request(`/wills/${willId}/versions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addWillClauses(versionId: string, clauses: any[]): Promise<any> {
    return this.request(`/versions/${versionId}/clauses`, {
      method: 'POST',
      body: JSON.stringify({ clauses }),
    });
  }

  async getWillVersion(versionId: string): Promise<WillVersion> {
    return this.request(`/versions/${versionId}`);
  }

  async finalizeWillVersion(versionId: string, stepUpToken?: string): Promise<{ success: boolean; documentHash: string; txHash?: string }> {
    return this.request(`/versions/${versionId}/finalize`, {
      method: 'POST',
      headers: stepUpToken ? { 'x-step-up-token': stepUpToken } : {},
    });
  }

  async getBlockchainProof(versionId: string): Promise<{
    versionId: string;
    documentHashSha256: string;
    anchoredTxHash: string;
    anchoredBlockNumber: number;
    chainTimestamp: string;
    network: string;
    status: string;
  }> {
    return this.request(`/versions/${versionId}/blockchain-proof`);
  }

  // --- ATTESTATIONS ---
  async getAttestations(versionId: string): Promise<Attestation[]> {
    return this.request(`/versions/${versionId}/attestations`);
  }

  async submitAttestation(versionId: string, data: {
    attestationType: 'ADVOCATE_REVIEW' | 'WITNESS_SIGNATURE';
    statement: string;
    signatureProof?: string;
  }): Promise<Attestation> {
    return this.request(`/versions/${versionId}/attestations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- ASSETS ---
  async getAssets(estateId: string): Promise<Asset[]> {
    return this.request(`/estates/${estateId}/assets`);
  }

  async createAsset(estateId: string, data: any): Promise<Asset> {
    return this.request(`/estates/${estateId}/assets`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setAssetAllocations(assetId: string, allocations: any[]): Promise<any> {
    return this.request(`/assets/${assetId}/allocations`, {
      method: 'POST',
      body: JSON.stringify({ allocations }),
    });
  }

  // --- DOCUMENTS ---
  async uploadEstateDocument(estateId: string, data: {
    fileName: string;
    fileContentBase64: string;
    mimeType: string;
    accessScope: string;
  }): Promise<EstateDocument> {
    return this.request(`/estates/${estateId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyDocument(documentId: string): Promise<{ verified: boolean; sha256: string }> {
    return this.request(`/documents/${documentId}/verify`, { method: 'POST' });
  }

  // --- PROOF OF LIFE ---
  async getProofOfLife(estateId: string): Promise<ProofOfLifeRecord> {
    return this.request(`/estates/${estateId}/proof-of-life`);
  }

  async respondProofOfLife(estateId: string): Promise<any> {
    return this.request(`/estates/${estateId}/proof-of-life/respond`, {
      method: 'POST',
      body: JSON.stringify({ responseMethod: 'MANUAL_AUTH' }),
    });
  }

  async simulateMissedProofOfLife(estateId: string): Promise<any> {
    return this.request(`/estates/${estateId}/proof-of-life/simulate-missed`, { method: 'POST' });
  }

  // --- GOVERNANCE ---
  async getProposals(estateId: string): Promise<GovernanceProposal[]> {
    return this.request(`/estates/${estateId}/proposals`);
  }

  async createProposal(estateId: string, data: {
    title: string;
    description: string;
    quorumThreshold: number;
    votingDeadline: string;
  }): Promise<GovernanceProposal> {
    return this.request(`/estates/${estateId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async voteProposal(proposalId: string, vote: 'YES' | 'NO', stepUpToken?: string): Promise<any> {
    return this.request(`/proposals/${proposalId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
      headers: stepUpToken ? { 'x-step-up-token': stepUpToken } : {},
    });
  }

  // --- INHERITANCE & ACTIVATION ---
  async getActivationCases(estateId: string): Promise<ActivationCase[]> {
    return this.request(`/estates/${estateId}/activation-cases`);
  }

  async requestActivation(data: {
    estateId: string;
    willVersionId: string;
    notes?: string;
  }): Promise<ActivationCase> {
    return this.request('/activation-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveActivationCase(caseId: string, stepUpToken?: string): Promise<any> {
    return this.request(`/activation-cases/${caseId}/approve`, {
      method: 'POST',
      headers: stepUpToken ? { 'x-step-up-token': stepUpToken } : {},
    });
  }

  async closeActivationCase(caseId: string): Promise<any> {
    return this.request(`/activation-cases/${caseId}/close`, { method: 'POST' });
  }

  // --- NOTIFICATIONS & AUDIT ---
  async getNotifications(): Promise<SystemNotification[]> {
    return this.request('/notifications');
  }

  async getAuditTrail(estateId: string): Promise<AuditEvent[]> {
    return this.request(`/estates/${estateId}/audit`);
  }

  // --- ADMIN & OPS ---
  async getAdminHealth(): Promise<any> {
    return this.request('/admin/health');
  }

  async getSecurityEvents(): Promise<any[]> {
    return this.request('/admin/security-events');
  }

  async reconcileBlockchain(): Promise<any> {
    return this.request('/admin/blockchain/reconcile', { method: 'POST' });
  }
}

export const api = new ApiService();
