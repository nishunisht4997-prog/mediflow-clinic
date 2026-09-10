'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCheck,
  User,
  Phone,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';

interface WhatsAppInbox2WayProps {
  onSendMessage: (recipientName: string, recipientPhone: string, content: string, type: string) => Promise<any>;
}

export const WhatsAppInbox2Way: React.FC<WhatsAppInbox2WayProps> = ({ onSendMessage }) => {
  const [conversations, setConversations] = useState<any[]>([
    {
      id: 'c1',
      patientName: 'Rahul Das',
      phone: '+91 98610 11223',
      uhid: 'MF-2026-0001',
      unread: 1,
      lastTime: '10:45 AM',
      messages: [
        { sender: 'CLINIC', text: 'Hello Rahul, your appointment is confirmed for 09:30 AM today. Token #1.', time: '08:30 AM' },
        { sender: 'PATIENT', text: 'Thank you doctor. I have collected my blood test reports. Reaching clinic in 10 mins.', time: '09:15 AM' },
        { sender: 'CLINIC', text: 'Dear Rahul, your digital prescription is ready. Download Rx: https://mediflow.in/rx/MF-2026-0001', time: '10:05 AM' },
        { sender: 'PATIENT', text: 'Doctor, my morning BP is 126/82. Should I continue Telmisartan 40mg daily?', time: '10:45 AM' },
      ],
    },
    {
      id: 'c2',
      patientName: 'Priya Sharma',
      phone: '+91 97780 44556',
      uhid: 'MF-2026-0002',
      unread: 0,
      lastTime: '09:50 AM',
      messages: [
        { sender: 'CLINIC', text: 'Reminder: Your follow-up appointment with Dr. Priyabarta is scheduled today at 10:00 AM. Token #2.', time: '08:45 AM' },
        { sender: 'PATIENT', text: 'I am at the front desk reception.', time: '09:50 AM' },
      ],
    },
    {
      id: 'c3',
      patientName: 'Amit Kumar Jena',
      phone: '+91 94370 77889',
      uhid: 'MF-2026-0003',
      unread: 0,
      lastTime: 'Yesterday',
      messages: [
        { sender: 'CLINIC', text: 'Dear Amit, invoice INV-2026-0182 for ₹3,750 generated. Balance due: ₹1,750.', time: 'Yesterday' },
        { sender: 'PATIENT', text: 'I will clear the ultrasound balance during my review tomorrow.', time: 'Yesterday' },
      ],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState('c1');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const quickReplies = [
    'Yes, continue the same dosage for 30 days.',
    'Your reports look normal. No changes needed.',
    'Please visit clinic for a physical checkup.',
    'Drink plenty of fluids and maintain daily BP log.',
  ];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(activeConv.patientName, activeConv.phone, replyText, 'CHAT_REPLY');

      // Update local conversation thread
      const newMsg = {
        sender: 'CLINIC',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, messages: [...c.messages, newMsg], unread: 0, lastTime: 'Just now' }
            : c
        )
      );

      setReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[560px]">
      {/* Left 4 cols: Conversations List */}
      <div className="md:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span>2-Way Patient Chat Inbox</span>
            </h3>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
              Meta Webhook Live
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`p-3.5 cursor-pointer transition flex items-start justify-between gap-2 ${
                  isSelected ? 'bg-emerald-50/90 border-l-4 border-emerald-600' : 'hover:bg-slate-100/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{conv.patientName}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{conv.uhid}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">
                    {conv.messages[conv.messages.length - 1]?.text}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">{conv.lastTime}</span>
                  {conv.unread > 0 && (
                    <span className="block mt-1 h-4 w-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold text-center leading-4 ml-auto">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right 7 cols: Active Chat Canvas */}
      <div className="md:col-span-7 flex flex-col bg-[#efeae2]">
        {/* Chat Header */}
        <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              {activeConv.patientName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">{activeConv.patientName}</div>
              <div className="text-[10px] font-mono text-slate-500 font-semibold">{activeConv.phone}</div>
            </div>
          </div>

          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
            WhatsApp Verified
          </span>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {activeConv.messages.map((m: any, i: number) => {
            const isClinic = m.sender === 'CLINIC';
            return (
              <div key={i} className={`flex ${isClinic ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] text-xs shadow-2xs space-y-1 ${
                    isClinic
                      ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                      : 'bg-white text-slate-900 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                    <span>{m.time}</span>
                    {isClinic && <CheckCheck className="h-3 w-3 text-sky-500" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Reply Chips */}
        <div className="p-2 bg-white/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px]">
          <span className="font-bold text-slate-400 shrink-0">Quick Reply:</span>
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setReplyText(qr)}
              className="shrink-0 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2 py-1 text-slate-700 font-medium transition"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type WhatsApp reply to patient..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={isSending}
            className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
