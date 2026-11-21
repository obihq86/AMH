import React from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, Edit2, MessageCircle, CheckCircle, PhoneForwarded, UserX, XCircle } from 'lucide-react';
import { formatDateToDDMMYYYY, toBengaliDigits, toLatinDigits } from '../lib/format';

export const AmhQueueView = ({
  queueView,
  absentQueuePatients,
  cancelledQueuePatients,
  deletedQueueRecords,
  completedQueuePatients,
  queueTokenInfo,
  handleUpdateStatus,
  handleRestoreDeletedRecord,
  handleOpenEditQueuePatient,
  handleSendWhatsApp,
  themeStyles
}) => {
  const emptyBox = (msg, tone) => (
    <div className={`p-8 text-center rounded-2xl border border-dashed ${tone}`}>
      <p className="text-sm font-bold text-slate-600">{msg}</p>
    </div>
  );

  const renderPatientRow = (patient, type, tone, actionBtn) => (
    <div key={patient.id} className={`rounded-2xl border ${tone} p-2.5 sm:p-3 flex items-center justify-between gap-2.5`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${patient.status === 'COMPLETED' ? 'bg-emerald-700' : 'bg-rose-600'} text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm`}>
          <span className="text-[9px] uppercase leading-none opacity-80">Token</span>
          <span className="text-sm leading-none mt-0.5">{toLatinDigits(queueTokenInfo.tokenLabelById.get(patient.id) || `#${patient.serialNumber}`)}</span>
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black text-slate-900 truncate">{patient.name}</h4>
          <div className="text-[11px] font-semibold text-slate-600 flex flex-wrap gap-x-2">
            <span>{toBengaliDigits(patient.ageYears)}y {toBengaliDigits(patient.ageMonths)}m {toBengaliDigits(patient.ageDays || 0)}d</span>
            {patient.phoneNumber ? <span className="font-mono">{patient.phoneNumber}</span> : null}
          </div>
        </div>
      </div>
      {actionBtn}
    </div>
  );

  if (queueView === 'absent') {
    if (absentQueuePatients.length === 0) return emptyBox('এই তারিখে কোনো অনুপস্থিত রোগী নেই', 'border-rose-300 bg-rose-50/50');
    return absentQueuePatients.map(p => renderPatientRow(p, 'absent', 'border-rose-300 bg-rose-50/70', 
      <button onClick={() => handleUpdateStatus(p.id, 'WAITING')} className="h-8 px-2.5 flex items-center gap-1 bg-cyan-100 rounded-lg text-[11px] font-black"><RotateCcw className="w-4 h-4" /> ফেরত</button>
    ));
  }

  // Add remaining view logic similarly...
  return <div>Queue View Loaded</div>;
};
