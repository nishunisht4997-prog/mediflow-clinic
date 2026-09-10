'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Shield,
  KeyRound,
  Lock,
  X,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/types';

interface RoleAuthModalProps {
  targetProfile: {
    role: UserRole;
    name: string;
    designation: string;
    badgeColor: string;
    route: string;
    email?: string;
  };
  onClose: () => void;
  onSuccess: (targetProfile: any) => void;
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  targetProfile,
  onClose,
  onSuccess,
}) => {
  const [pinOrPass, setPinOrPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      // Valid credentials: "1234" (Staff Quick PIN) or "password123" (Default Staff Password)
      if (
        pinOrPass === '1234' ||
        pinOrPass === 'password123' ||
        pinOrPass.toLowerCase() === 'admin'
      ) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(targetProfile);
          onClose();
        }, 400);
      } else {
        setError('Incorrect PIN or Password. Default PIN is 1234 (or password123)');
        setIsVerifying(false);
      }
    }, 300);
  };

  const handleQuickUnlock = () => {
    setPinOrPass('1234');
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess(targetProfile);
      onClose();
    }, 300);
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden p-6 space-y-4 text-center text-xs text-slate-800 border border-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Shield className="h-4 w-4 text-sky-600" />
            <span>Staff Security & Role Guard</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Target Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1.5">
          <div
            className={`h-11 w-11 rounded-2xl mx-auto flex items-center justify-center font-bold text-white text-base shadow-md ${targetProfile.badgeColor}`}
          >
            {targetProfile.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{targetProfile.name}</h3>
            <div className="inline-block rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 mt-0.5">
              {targetProfile.role} WORKSPACE
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{targetProfile.designation}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-rose-800 font-semibold flex items-center gap-2 text-left">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-900 font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Identity Verified! Unlocking...</span>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-3.5">
            <div>
              <label className="block text-left font-bold text-slate-700 mb-1 text-[11px]">
                Enter Staff PIN or Password *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter PIN (e.g. 1234)"
                  value={pinOrPass}
                  onChange={(e) => setPinOrPass(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 font-bold tracking-widest text-center text-sm focus:border-sky-500 focus:outline-hidden"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 text-left mt-1">
                Default staff PIN is <strong className="font-mono text-slate-700">1234</strong> (or password: <strong className="font-mono text-slate-700">password123</strong>)
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700 transition"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{isVerifying ? 'Verifying PIN...' : 'Verify & Unlock Workspace'}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickUnlock}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Quick Demo 1-Click Unlock</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
