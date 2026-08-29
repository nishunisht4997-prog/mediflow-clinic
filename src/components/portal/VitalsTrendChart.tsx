'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HeartPulse } from 'lucide-react';

interface VitalsTrendChartProps {
  vitals?: any[];
}

export const VitalsTrendChart: React.FC<VitalsTrendChartProps> = ({ vitals }) => {
  // If actual recorded vitals exist, map them dynamically
  const chartData =
    vitals && vitals.length > 0
      ? vitals
          .slice()
          .reverse()
          .map((v: any) => ({
            date: v.recordedAt
              ? new Date(v.recordedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : 'Recent',
            systolic: v.bpSystolic || 120,
            diastolic: v.bpDiastolic || 80,
            pulse: v.pulse || 74,
          }))
      : [
          { date: '15 May', systolic: 148, diastolic: 92, pulse: 82 },
          { date: '10 Jun', systolic: 140, diastolic: 88, pulse: 78 },
          { date: '22 Jul', systolic: 132, diastolic: 84, pulse: 76 },
          { date: '15 Aug', systolic: 126, diastolic: 82, pulse: 74 },
          { date: '28 Aug', systolic: 122, diastolic: 80, pulse: 72 },
        ];

  const latest = chartData[chartData.length - 1];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <HeartPulse className="h-4 w-4 text-rose-600" />
            <span>Blood Pressure & Pulse History Trajectory</span>
          </h4>
          <p className="text-[11px] text-slate-400">
            Latest Reading: <strong>{latest?.systolic}/{latest?.diastolic} mmHg</strong> &bull; Pulse: <strong>{latest?.pulse} bpm</strong>
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
          Target Healthy Zone
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis domain={[55, 170]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(val: any, name: any) => [
                `${val} ${name === 'pulse' ? 'bpm' : 'mmHg'}`,
                name === 'systolic' ? 'Systolic (Top)' : name === 'diastolic' ? 'Diastolic (Bottom)' : 'Pulse Rate',
              ]}
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="pulse" name="Pulse Rate" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
