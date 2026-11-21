import React from 'react';

export function MainDashboard({ patientsByDate, queueSelectedDate, handleUpdateStatus, handleOpenEditQueuePatient, handleSendWhatsApp, handleRegisterPatient, ...props }) {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-black text-slate-900">কিউ ড্যাশবোর্ড</h2>
      {/* কিউ ম্যানেজমেন্ট ও রেজিস্ট্রেশন ফর্মের কোড এখানে থাকবে */}
    </div>
  );
}
