import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { EstateDocument } from '../../../types';
import {
  FolderLock,
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Eye,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { DocumentStatusBadge } from '../../common/Badges';

export const DocumentVault: React.FC = () => {
  const { currentEstate, requestStepUp } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const initialDocs: EstateDocument[] = [
    {
      id: 'doc-1',
      estateId: 'estate-1',
      fileName: 'Title_Deed_Pendelton_Manor_2024.pdf',
      fileSize: 4280120,
      mimeType: 'application/pdf',
      sha256Hash: '4a8b72c9103e845f1b2c7e9a03b54d6e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
      status: 'VERIFIED',
      accessScope: 'OWNER_ONLY',
      uploadedById: 'user-testator',
      uploadedByName: 'Arthur Pendelton',
      createdAt: '2026-09-18, 10:20 AM',
    },
    {
      id: 'doc-2',
      estateId: 'estate-1',
      fileName: 'Barclays_Private_Trust_Authorization_Letter.pdf',
      fileSize: 1840290,
      mimeType: 'application/pdf',
      sha256Hash: '7f9c2d1b7e4a503612849e7b23c561a09d3e845f1b2c7e9a03b54d6e8f1a2b3c',
      status: 'VERIFIED',
      accessScope: 'ADVOCATES_AND_TESTATOR',
      uploadedById: 'user-advocate',
      uploadedByName: 'Claire Sterling, Esq.',
      createdAt: '2026-09-21, 3:45 PM',
    },
    {
      id: 'doc-3',
      estateId: 'estate-1',
      fileName: 'Encrypted_Multisig_Key_Custodian_Instructions.gpg',
      fileSize: 52410,
      mimeType: 'application/octet-stream',
      sha256Hash: '1b2c7e9a03b54d6e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
      status: 'VERIFIED',
      accessScope: 'RELEASE_CONTROLLED',
      uploadedById: 'user-testator',
      uploadedByName: 'Arthur Pendelton',
      createdAt: '2026-09-24, 11:15 AM',
    },
  ];

  const [documents, setDocuments] = useState<EstateDocument[]>(initialDocs);

  const handleUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: EstateDocument = {
        id: `doc-${Date.now()}`,
        estateId: currentEstate?.id || 'estate-1',
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/pdf',
        sha256Hash: '9d3e845f1b2c7e9a03b54d6e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
        status: 'VERIFIED',
        accessScope: 'ADVOCATES_AND_TESTATOR',
        uploadedById: 'user-current',
        uploadedByName: 'Arthur Pendelton',
        createdAt: new Date().toLocaleString(),
      };
      setDocuments([newDoc, ...documents]);
      setIsUploading(false);
    }, 1200);
  };

  const handleSecureDownload = async (doc: EstateDocument) => {
    setDownloadingDocId(doc.id);
    try {
      if (doc.accessScope === 'RELEASE_CONTROLLED' || doc.accessScope === 'OWNER_ONLY') {
        await requestStepUp(`Download restricted document: ${doc.fileName}`);
      }
      // Create mock file download
      const blob = new Blob([`DecentraWill Encrypted Document Content for ${doc.fileName}\nSHA-256: ${doc.sha256Hash}`], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Download cancelled or failed', e);
    } finally {
      setDownloadingDocId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#15181F] border border-[#232936]">
        <div>
          <h2 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-emerald-400" />
            Encrypted Document Vault
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Tamper-proof storage with automated malware sandboxing, SHA-256 validation, and role-scoped cryptographic policies.
          </p>
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white text-xs font-semibold rounded-lg shadow-md transition">
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning Sandbox...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            disabled={isUploading}
            onChange={handleUploadSimulate}
          />
        </label>
      </div>

      {/* Security Scanning Banner */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-zinc-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-semibold text-white">Automated ClamAV &amp; SHA-256 Pipeline Active:</span> Every uploaded file is scanned in an isolated sandbox, hashed, and tagged before storage persistence.
          </div>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-700/60">
          Zero-Trust Scoped
        </span>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4.5 rounded-xl bg-[#15181F] border border-[#232936] hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800 text-emerald-400 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-sm font-semibold text-white">{doc.fileName}</h4>
                  <DocumentStatusBadge status={doc.status} />
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                    Scope: {doc.accessScope}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-4 flex-wrap">
                  <span>Uploaded by: <strong className="text-zinc-200">{doc.uploadedByName}</strong></span>
                  <span>Size: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  <span>Timestamp: {doc.createdAt}</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 truncate max-w-xl">
                  SHA-256: <span className="text-zinc-400">{doc.sha256Hash}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => handleSecureDownload(doc)}
                disabled={downloadingDocId === doc.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0D11] hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white transition disabled:opacity-50"
              >
                {downloadingDocId === doc.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Secure Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
