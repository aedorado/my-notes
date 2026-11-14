'use client';

import React from 'react';
import { Lock, ShieldAlert, Sparkles } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

interface PrivateGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function PrivateGuard({
  children,
  title = 'Admin Authorization Required',
  description = 'This content is private (raw lecture transcript or restricted study material). Please unlock Admin Mode to view it.',
}: PrivateGuardProps) {
  const { isAdmin, openLoginModal } = useAdmin();

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-stone-200 rounded-2xl shadow-sm text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
        <Lock className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold text-stone-900 mb-2">{title}</h2>
      <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto mb-6">
        {description}
      </p>

      <button
        type="button"
        onClick={openLoginModal}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition shadow-xs"
      >
        <Lock className="w-4 h-4 text-amber-400" />
        <span>Unlock with Admin Passcode</span>
      </button>

      <p className="text-xs text-stone-400 mt-4">
        Session remains active for 10 minutes once authenticated.
      </p>
    </div>
  );
}

