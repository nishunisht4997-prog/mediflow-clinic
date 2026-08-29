'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { announceTokenNumber } from '@/lib/speech';

interface VoiceTokenCallerProps {
  tokenNumber: number;
  patientName: string;
  doctorCabin?: string;
  compact?: boolean;
}

export const VoiceTokenCaller: React.FC<VoiceTokenCallerProps> = ({
  tokenNumber,
  patientName,
  doctorCabin = 'Doctor Consultation Cabin',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAnnounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    announceTokenNumber(tokenNumber, patientName, doctorCabin);
    setTimeout(() => setIsPlaying(false), 2500);
  };

  if (compact) {
    return (
      <button
        onClick={handleAnnounce}
        title="Announce Token on Clinic Speaker"
        className={`p-1.5 rounded-lg border transition ${
          isPlaying
            ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300'
        }`}
      >
        <Volume2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleAnnounce}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs ${
        isPlaying
          ? 'bg-amber-500 text-white animate-pulse'
          : 'bg-white border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300'
      }`}
    >
      <Volume2 className="h-3.5 w-3.5 text-sky-600" />
      <span>{isPlaying ? 'Announcing...' : 'Announce Token #' + tokenNumber}</span>
    </button>
  );
};
