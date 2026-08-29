'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ClinicWorkBoardProps {
  tasks: any[];
  staffList: any[];
  patients: any[];
  onCreateTask: (taskData: any) => Promise<void>;
  onUpdateTaskStatus: (taskId: string, newStatus: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const ClinicWorkBoard: React.FC<ClinicWorkBoardProps> = ({
  tasks,
  staffList,
  patients,
  onCreateTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState(staffList[1]?.id || '');
  const [newPatientId, setNewPatientId] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newDue, setNewDue] = useState('Today 4:00 PM');

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateTask({
      title: newTitle,
      description: newDesc,
      assignedTo: newAssignedTo,
      patientId: newPatientId || null,
      priority: newPriority,
      dueDate: newDue,
      status: 'PENDING',
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const renderTaskCard = (task: any) => {
    return (
      <div
        key={task.id}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-xs text-slate-900 leading-snug">{task.title}</h4>
          <span
            className={`shrink-0 rounded px-2 py-0.5 text-[9px] font-bold ${
              task.priority === 'URGENT'
                ? 'bg-rose-100 text-rose-800'
                : task.priority === 'HIGH'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
        )}

        {task.patient && (
          <div className="rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800 flex items-center gap-1">
            <User className="h-3 w-3 text-sky-600" />
            <span>Patient: {task.patient.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <span>Assigned: <strong className="text-slate-700">{task.assignee?.name || 'Receptionist'}</strong></span>
          <span className="font-medium text-sky-600">{task.dueDate}</span>
        </div>

        {/* Action status buttons */}
        <div className="flex items-center justify-between pt-1">
          {task.status === 'PENDING' && (
            <button
              onClick={() => onUpdateTaskStatus(task.id, 'IN_PROGRESS')}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              <span>Start Task</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}

          {task.status === 'IN_PROGRESS' && (
            <button
              onClick={() => onUpdateTaskStatus(task.id, 'COMPLETED')}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Done</span>
            </button>
          )}

          {task.status === 'COMPLETED' && (
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Done
            </span>
          )}

          <button
            onClick={() => onDeleteTask(task.id)}
            className="text-slate-300 hover:text-rose-600 transition p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <CheckSquare className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">Clinic Work Board & Task Delegations</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assign follow-ups, payment collections, lab report uploads & patient coordination to staff.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Clinic Task</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Pending Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs text-slate-700 pb-2 border-b border-slate-200">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>TODAY'S TO-DO ({pendingTasks.length})</span>
            </span>
          </div>

          <div className="space-y-3">{pendingTasks.map(renderTaskCard)}</div>
        </div>

        {/* Column 2: In Progress Tasks */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs text-sky-900 pb-2 border-b border-sky-200">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
              <span>IN PROGRESS ({inProgressTasks.length})</span>
            </span>
          </div>

          <div className="space-y-3">{inProgressTasks.map(renderTaskCard)}</div>
        </div>

        {/* Column 3: Completed Tasks */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs text-emerald-900 pb-2 border-b border-emerald-200">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>COMPLETED ({completedTasks.length})</span>
            </span>
          </div>

          <div className="space-y-3">{completedTasks.map(renderTaskCard)}</div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delegate New Clinic Task</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Call patient Rahul regarding follow-up"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium focus:border-sky-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Description / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Check if medication was purchased and if BP is under control..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Assign To</label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium focus:outline-hidden"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:outline-hidden"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Link Patient (Optional)</label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 focus:outline-hidden"
                >
                  <option value="">None / General Clinic Task</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.uhid})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Due By</label>
                <input
                  type="text"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-medium focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
