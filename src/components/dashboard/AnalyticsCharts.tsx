'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Activity, IndianRupee } from 'lucide-react';

interface AnalyticsChartsProps {
  analyticsData?: {
    weeklyRevenue?: any[];
    paymentMix?: any[];
    departmentMix?: any[];
  };
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  analyticsData,
}) => {
  const weeklyData = analyticsData?.weeklyRevenue || [
    { day: 'Mon', revenue: 24500, patients: 20 },
    { day: 'Tue', revenue: 31000, patients: 26 },
    { day: 'Wed', revenue: 28500, patients: 24 },
    { day: 'Thu', revenue: 34200, patients: 28 },
    { day: 'Fri', revenue: 29800, patients: 25 },
    { day: 'Sat', revenue: 42000, patients: 35 },
    { day: 'Sun', revenue: 16500, patients: 14 },
  ];

  const paymentData = analyticsData?.paymentMix || [
    { name: 'UPI (GPay/PhonePe)', value: 19950, color: '#0284c7' },
    { name: 'Cash Counter', value: 8550, color: '#10b981' },
    { name: 'Card / NetBanking', value: 4750, color: '#8b5cf6' },
  ];

  const departmentData = analyticsData?.departmentMix || [
    { name: 'General Medicine', count: 14 },
    { name: 'Urology & Stone Care', count: 8 },
    { name: 'Hypertension Clinic', count: 6 },
    { name: 'Diabetic Review', count: 4 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Weekly Revenue & Patient Flow Trend (8 Cols) */}
      <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky-600" />
              <span>Weekly OPD Revenue & Patient Volume Trend</span>
            </h3>
            <p className="text-xs text-slate-400">Total 7-day collection: ₹2,06,500 across 172 consultations</p>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
            +18.4% WoW Growth
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : `${value} Patients`,
                  name === 'revenue' ? 'Revenue' : 'OPD Footfall',
                ]}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#revenueColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Payment Modes Donut Split (4 Cols) */}
      <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-teal-600" />
            <span>Payment Collection Mix</span>
          </h3>
          <p className="text-xs text-slate-400">Digital vs Cash Reconciliations</p>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentData}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 text-xs">
          {paymentData.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-600 font-medium">{p.name}</span>
              </div>
              <span className="font-bold text-slate-900">₹{p.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
