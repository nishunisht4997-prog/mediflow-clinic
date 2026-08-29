'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  CheckCheck,
  Smartphone,
  Sparkles,
  Phone,
  FileText,
  Calendar,
  Receipt,
  Repeat,
  Settings,
  ExternalLink,
  ShieldCheck,
  Key,
  Check,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { WhatsAppService } from '@/services/whatsapp.service';
import { WhatsAppInbox2Way } from '@/components/whatsapp/WhatsAppInbox2Way';

interface WhatsAppHubProps {
  logs: any[];
  onSendCustomMessage: (
    recipientName: string,
    recipientPhone: string,
    content: string,
    type: string,
    customConfig?: any
  ) => Promise<any>;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({
  logs,
  onSendCustomMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'dispatcher' | 'inbox'>('dispatcher');
  const [recipientName, setRecipientName] = useState('Rahul Das');
  const [recipientPhone, setRecipientPhone] = useState('+91 98610 11223');
  const [messageType, setMessageType] = useState('APPOINTMENT_CONFIRMED');
  const [messageContent, setMessageContent] = useState(
    'Hello Rahul, your appointment with Dr. Avishek Mohapatra is confirmed for 09:30 AM today. Token #1. Clinic: Saheed Nagar Main Branch.'
  );

  // Live Gateway Configuration State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [provider, setProvider] = useState<'meta_cloud' | 'twilio' | 'direct_link'>('meta_cloud');
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');
  const [metaBusinessAccountId, setMetaBusinessAccountId] = useState('');
  const [configSaved, setConfigSaved] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleTypeChange = (type: string) => {
    setMessageType(type);
    if (type === 'APPOINTMENT_CONFIRMED') {
      setMessageContent(
        `Hello ${recipientName}, your appointment with Dr. Avishek Mohapatra is confirmed for 09:30 AM today. Token #1. Clinic: Saheed Nagar Main Branch.`
      );
    } else if (type === 'PRESCRIPTION') {
      setMessageContent(
        `Dear ${recipientName}, your digital prescription from Dr. Avishek Mohapatra is ready. Download PDF: https://mediflow.in/rx/MF-2026-0001`
      );
    } else if (type === 'INVOICE') {
      setMessageContent(
        `Dear ${recipientName}, invoice INV-2026-0181 for ₹1,250 has been generated (Paid: ₹1,250). View bill: https://mediflow.in/bill/inv1`
      );
    } else if (type === 'FOLLOW_UP') {
      setMessageContent(
        `Hello ${recipientName}, Dr. Avishek recommended a follow-up consultation this week. Tap to book your slot: https://mediflow.in/book/dr-avishek`
      );
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !recipientPhone.trim()) return;

    setIsSending(true);
    try {
      const customConfig =
        metaAccessToken && metaPhoneNumberId
          ? {
              provider,
              accessToken: metaAccessToken,
              phoneNumberId: metaPhoneNumberId,
              businessAccountId: metaBusinessAccountId,
            }
          : undefined;

      await onSendCustomMessage(
        recipientName,
        recipientPhone,
        messageContent,
        messageType,
        customConfig
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenDirectWhatsApp = () => {
    const url = WhatsAppService.getDirectChatUrl(recipientPhone, messageContent);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <MessageCircle className="h-5 w-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">WhatsApp Business Hub & Patient Communications</h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real Meta Gateway Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            2-Way Patient Chat &bull; Meta Cloud API &bull; Verified Business Dispatcher &bull; Webhook Receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('dispatcher')}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeTab === 'dispatcher' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Broadcast Dispatcher
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`rounded-lg px-3 py-1.5 transition flex items-center gap-1 ${
                activeTab === 'inbox' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>2-Way Live Inbox</span>
            </button>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            <span>API Settings</span>
          </button>
        </div>
      </div>

      {activeTab === 'inbox' ? (
        <WhatsAppInbox2Way onSendMessage={onSendCustomMessage} />
      ) : (
        /* Dispatcher Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Dispatcher & History Logs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Message Dispatcher */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Send className="h-4 w-4 text-emerald-600" />
                  <span>Send WhatsApp Notification</span>
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Meta Cloud API / wa.me link</span>
              </div>

              {/* Template Type Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'APPOINTMENT_CONFIRMED', label: 'Appointment Confirmed' },
                  { id: 'PRESCRIPTION', label: 'Digital Rx PDF' },
                  { id: 'INVOICE', label: 'Bill / Receipt' },
                  { id: 'FOLLOW_UP', label: 'Follow-up Due' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTypeChange(t.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      messageType === t.id
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSend} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Patient Full Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-semibold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">WhatsApp Mobile Number</label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Message Content</label>
                    <span className="text-[10px] text-slate-400 font-mono">{messageContent.length} chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:border-emerald-500 focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Action Buttons: Meta Cloud API vs Direct 1-Click WhatsApp Web/App */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSending ? 'Dispatching...' : 'Send via Cloud API'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenDirectWhatsApp}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 py-2.5 font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                  >
                    <ExternalLink className="h-4 w-4 text-emerald-700" />
                    <span>Open in WhatsApp Web / App</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Delivery Logs */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Live Dispatch & Delivery Logs ({logs.length})
                </h3>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold">
                  Live Webhooks Active
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.recipientName}</span>
                        <span className="font-mono text-slate-400 font-semibold">{log.recipientPhone}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                          {log.type}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{log.content}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>{log.status || 'DELIVERED'}</span>
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.sentAt
                          ? new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Now'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 cols: Realistic Smartphone Preview Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              <span>REAL TIME PATIENT SCREEN PREVIEW:</span>
            </div>

            <div className="w-[320px] rounded-[36px] border-4 border-slate-800 bg-slate-900 p-3 shadow-2xl overflow-hidden">
              {/* Phone Notch */}
              <div className="h-4 w-28 bg-slate-800 rounded-b-xl mx-auto mb-2" />

              {/* WhatsApp App Container */}
              <div className="rounded-[24px] bg-[#efeae2] h-[520px] flex flex-col overflow-hidden text-xs">
                {/* WhatsApp Header */}
                <div className="bg-[#075e54] text-white p-3 flex items-center gap-2.5 shadow-md">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-800 font-bold text-xs">
                    Dr.A
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1">
                      <span>Dr. Avishek Clinic</span>
                      <span className="rounded-full bg-emerald-400 h-2 w-2" />
                    </div>
                    <div className="text-[10px] text-emerald-100">Official Verified Business Account</div>
                  </div>
                </div>

                {/* Chat Canvas */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  <div className="rounded-lg bg-[#ffeecd] p-2 text-[10px] text-center text-slate-700 shadow-2xs">
                    🔒 Messages are end-to-end encrypted with Meta WhatsApp Business Gateway.
                  </div>

                  {/* Received Bubble */}
                  <div className="rounded-xl rounded-tl-none bg-white p-3 text-slate-800 shadow-xs space-y-2 max-w-[90%]">
                    <p className="leading-relaxed whitespace-pre-wrap">{messageContent}</p>

                    {messageType === 'PRESCRIPTION' && (
                      <div className="pt-2 border-t border-slate-100">
                        <button className="w-full rounded-lg bg-emerald-50 text-emerald-800 font-bold py-1.5 text-center flex items-center justify-center gap-1 shadow-2xs">
                          <FileText className="h-3.5 w-3.5" />
                          <span>📄 Download Prescription PDF</span>
                        </button>
                      </div>
                    )}

                    {messageType === 'INVOICE' && (
                      <div className="pt-2 border-t border-slate-100">
                        <button className="w-full rounded-lg bg-emerald-50 text-emerald-800 font-bold py-1.5 text-center flex items-center justify-center gap-1 shadow-2xs">
                          <Receipt className="h-3.5 w-3.5" />
                          <span>🧾 View Invoice Receipt</span>
                        </button>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="h-3 w-3 text-sky-500" />
                    </div>
                  </div>
                </div>

                {/* Fake WhatsApp Input */}
                <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200">
                  <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-slate-400">
                    Type a reply...
                  </div>
                  <div className="h-7 w-7 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                    <Send className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gateway API Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Key className="h-4 w-4 text-emerald-600" />
                <span>Meta WhatsApp Cloud API Credentials</span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">API Provider Driver</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-bold focus:outline-hidden"
                >
                  <option value="meta_cloud">Meta WhatsApp Cloud API (Graph API)</option>
                  <option value="twilio">Twilio Programmable Messaging</option>
                  <option value="direct_link">Direct WhatsApp Click-to-Chat (wa.me)</option>
                </select>
              </div>

              {provider === 'meta_cloud' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-700">System User Permanent Access Token</label>
                    <input
                      type="password"
                      placeholder="EAAG..."
                      value={metaAccessToken}
                      onChange={(e) => setMetaAccessToken(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      From Meta for Developers &gt; WhatsApp &gt; API Setup
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Phone Number ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 104829482910482"
                      value={metaPhoneNumberId}
                      onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">WhatsApp Business Account ID (WABA)</label>
                    <input
                      type="text"
                      placeholder="e.g. 984210482019482"
                      value={metaBusinessAccountId}
                      onChange={(e) => setMetaBusinessAccountId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2 font-mono text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              <div className="rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Webhook Callback URL for Meta:</span>
                </div>
                <code className="block bg-white p-1.5 rounded border border-emerald-200 font-mono text-[10px] text-slate-800">
                  https://yourdomain.com/api/whatsapp/webhook
                </code>
                <div className="text-[10px] text-emerald-700">
                  Verify Token: <strong>mediflow_secure_webhook_2026</strong>
                </div>
              </div>

              {configSaved && (
                <div className="rounded-xl bg-emerald-100 p-2 text-center text-xs font-bold text-emerald-800">
                  ✓ Gateway credentials saved and active!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigSaved(true);
                    setTimeout(() => {
                      setConfigSaved(false);
                      setShowConfigModal(false);
                    }, 1200);
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
