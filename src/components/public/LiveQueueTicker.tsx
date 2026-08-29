'use client';

import React from 'react';
import { Clock, Users, CheckCircle2, Play } from 'lucide-react';

interface LiveQueueTickerProps {
  currentToken?: number;
  waitingCount?: number;
  estimatedWaitMins?: number;
}

export const LiveQueueTicker: React.FC<LiveQueueTickerProps> = ({
  currentToken = 3,
  waitingCount = 4,
  estimatedWaitMins = 12,
}) => {
  return (
    <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-md shadow-emerald-600/30 animate-pulse">
            #{currentToken}
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE OPD CABIN QUEUE STATUS</span>
            </div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              Now Serving Token #{currentToken} in Cabin
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="rounded-xl bg-white/80 border border-emerald-200 px-3 py-1.5 text-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Waiting in Lobby</span>
            <strong className="text-amber-700 font-black text-sm">{waitingCount} Patients</strong>
          </div>

          <div className="rounded-xl bg-white/80 border border-emerald-200 px-3 py-1.5 text-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Wait</span>
            <strong className="text-emerald-800 font-black text-sm">~{estimatedWaitMins} mins</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
