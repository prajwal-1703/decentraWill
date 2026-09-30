export type RoleType = 'TESTATOR' | 'ADVOCATE' | 'WITNESS' | 'EXECUTOR' | 'BENEFICIARY' | 'ADMIN';

export type WillStatus = 
  | 'DRAFT' 
  | 'VERIFICATION_PENDING' 
  | 'READY_TO_FINALIZE' 
  | 'FINALIZED' 
  | 'ACTIVE' 
  | 'SUPERSEDED' 
  | 'REVOKED'
  | 'ACTIVATION_PENDING'
  | 'RELEASED'
  | 'CLOSED';

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type DocumentStatus = 'UPLOADING' | 'SCANNING' | 'VERIFIED' | 'QUARANTINED' | 'FAILED' | 'ARCHIVED';

export type AssetType = 
  | 'REAL_ESTATE' 
  | 'BANK_ACCOUNT' 
  | 'INVESTMENT' 
  | 'INSURANCE' 
  | 'VEHICLE' 
  | 'JEWELLERY' 
  | 'BUSINESS' 
  | 'CRYPTO' 
  | 'NFT' 
  | 'DOMAIN' 
  | 'OTHER';

export type ProofOfLifeStatus = 
  | 'ACTIVE' 
  | 'DUE_SOON' 
  | 'ACTION_REQUIRED' 
  | 'REMINDER_SENT' 
  | 'ESCALATED' 
  | 'UNDER_VERIFICATION';

export type ProposalStatus = 'PENDING' | 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED' | 'EXECUTED';

export type ActivationCaseStatus = 
  | 'REQUESTED' 
  | 'EVIDENCE_SUBMITTED' 
  | 'VERIFYING' 
  | 'GRACE_PERIOD' 
  | 'CHALLENGE_WINDOW' 
  | 'GOVERNANCE_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'RELEASED' 
  | 'CLOSED';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  roles: RoleType[];
  kycStatus: KycStatus;
  kycReference?: string;
  walletAddress?: string;
}

export interface Estate {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'IN_SETTLEMENT' | 'CLOSED';
  createdAt: string;
  memberships?: EstateMember[];
}

export interface EstateMember {
  id: string;
  estateId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: RoleType;
  status: 'INVITED' | 'ACTIVE' | 'REJECTED';
}

export interface WillClause {
  id: string;
  clauseNumber: number;
  title: string;
  content: string;
  category: string;
}

export interface WillVersion {
  id: string;
  willId: string;
  versionNo: number;
  status: WillStatus;
  contentPayload: string;
  documentHashSha256?: string;
  anchoredTxHash?: string;
  anchoredBlockNumber?: number;
  chainTimestamp?: string;
  createdById: string;
  createdAt: string;
  clauses?: WillClause[];
  attestations?: Attestation[];
  documents?: EstateDocument[];
}

export interface Will {
  id: string;
  estateId: string;
  title: string;
  description?: string;
  status: WillStatus;
  currentVersionNo: number;
  versions?: WillVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface EstateDocument {
  id: string;
  estateId: string;
  willVersionId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256Hash: string;
  status: DocumentStatus;
  quarantineReason?: string;
  accessScope: 'OWNER_ONLY' | 'ADVOCATES_AND_TESTATOR' | 'ALL_PARTICIPANTS' | 'RELEASE_CONTROLLED';
  uploadedById: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface AssetAllocation {
  id?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  percentage: number;
  conditions?: string;
}

export interface Asset {
  id: string;
  estateId: string;
  name: string;
  assetType: AssetType;
  estimatedValueUsd: number;
  currency: string;
  custodianOrInstitution?: string;
  identifierOrAccountRef?: string;
  isBlockchainNative: boolean;
  network?: string;
  contractAddress?: string;
  tokenId?: string;
  transferStatus: 'PENDING' | 'IN_ESCROW' | 'READY_FOR_RELEASE' | 'TRANSFERRED' | 'MANUAL_COORDINATION';
  allocations: AssetAllocation[];
  createdAt: string;
}

export interface Attestation {
  id: string;
  willVersionId: string;
  attesterId: string;
  attesterName: string;
  attesterRole: RoleType;
  documentHash: string;
  attestationType: 'ADVOCATE_REVIEW' | 'WITNESS_SIGNATURE';
  statement: string;
  signatureProof: string;
  createdAt: string;
}

export interface ProofOfLifeRecord {
  id: string;
  estateId: string;
  status: ProofOfLifeStatus;
  lastHeartbeatAt: string;
  intervalDays: number;
  nextCheckDueAt: string;
  reminderCount: number;
  escalationTriggered: boolean;
}

export interface GovernanceProposal {
  id: string;
  estateId: string;
  title: string;
  description: string;
  proposerId: string;
  proposerName: string;
  status: ProposalStatus;
  quorumThreshold: number;
  yesVotes: number;
  noVotes: number;
  totalEligibleVotes: number;
  hasVoted?: boolean;
  userVote?: 'YES' | 'NO';
  votingDeadline: string;
  createdAt: string;
}

export interface ActivationCase {
  id: string;
  estateId: string;
  estateName: string;
  requestedById: string;
  requesterName: string;
  willVersionId: string;
  status: ActivationCaseStatus;
  evidenceDocumentName?: string;
  gracePeriodEndsAt?: string;
  challengeWindowEndsAt?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  estateId?: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  sha256Hash: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  category: 'SECURITY' | 'WILL' | 'VERIFICATION' | 'WITNESS' | 'GOVERNANCE' | 'PROOF_OF_LIFE' | 'INHERITANCE';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  link?: string;
}
