import React, { useState, useEffect } from 'react';
import { User as UserType, Status, HikeEvent } from '../types';
import { QrCode, Download, CheckCircle, Calendar, MapPin, Clock, LogOut, Ticket, Award, X, Mountain } from 'lucide-react';
import { api } from '../services/mockApi';

interface ParticipantDashboardProps {
  records: UserType[];
  onLogout: () => void;
}

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({ records, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'history'>('tickets');
  const [showCertificate, setShowCertificate] = useState<UserType | null>(null);
  const [events, setEvents] = useState<HikeEvent[]>([]);

  // Fetch events to access templates
  useEffect(() => {
    api.getHikes().then(setEvents);
  }, []);
  
  // Logic to separate records
  const activeTickets = records.filter(r => r.status === Status.REGISTERED || r.status === Status.STARTED);
  const completedHikes = records.filter(r => r.status === Status.COMPLETED);
  
  // Use the name from the most recent record
  const userName = records.length > 0 ? records[0].fullName : 'المشارك';

  // Helper to find the event details for a record
  const getEventDetails = (eventId: number) => {
    return events.find(e => e.id === eventId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
           <div className={`bg-white rounded-xl shadow-2xl overflow-hidden relative ${
               getEventDetails(showCertificate.eventId)?.certificateTemplate 
               ? 'max-w-4xl w-full' 
               : 'max-w-2xl w-full border-8 border-double border-emerald-900'
           }`}>
              <button 
                 onClick={() => setShowCertificate(null)}
                 className="absolute top-4 right-4 z-10 text-gray-500 hover:text-red-500 bg-white rounded-full p-2 shadow-md"
              >
                <X size={24} />
              </button>

              {/* RENDER LOGIC: Custom vs Default */}
              {getEventDetails(showCertificate.eventId)?.certificateTemplate ? (
                  // Custom Template Render
                  <div className="relative w-full">
                      <img 
                        src={getEventDetails(showCertificate.eventId)?.certificateTemplate} 
                        alt="Certificate" 
                        className="w-full h-auto block"
                      />
                      {/* Name Overlay - Centered */}
                      <div className="absolute inset-0 flex items-center justify-center">
                          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center drop-shadow-md" style={{ fontFamily: 'serif' }}>
                              {showCertificate.fullName}
                          </h2>
                      </div>
                  </div>
              ) : (
                  // Default Template Render
                  <>
                    <div className="p-8 md:p-12 text-center bg-[#fffcf5]">
                        <div className="w-20 h-20 bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
                            <Mountain size={40} className="text-emerald-100" />
                        </div>
                        
                        <h2 className="text-4xl font-bold text-emerald-900 mb-2 font-serif tracking-wide">شهادة مشاركة</h2>
                        <p className="text-emerald-700 font-medium mb-8 text-sm uppercase tracking-widest">Certificate of Completion</p>
                        
                        <div className="space-y-6">
                            <p className="text-gray-600">يشرفنا أن نشهد بأن</p>
                            <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-dashed border-gray-300 pb-2 inline-block px-12">
                                {showCertificate.fullName}
                            </h3>
                            <p className="text-gray-600">قد أكمل بنجاح مسير</p>
                            <h4 className="text-xl font-bold text-emerald-800">
                                "{showCertificate.eventName}"
                            </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mt-12 border-t border-gray-200 pt-8">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">التاريخ</p>
                                <p className="font-bold text-gray-700 font-mono">
                                    {showCertificate.checkOutTime ? new Date(showCertificate.checkOutTime).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">التوقيع</p>
                                <div className="h-8 flex items-center justify-center">
                                    <span className="font-serif italic text-lg text-emerald-900 opacity-70">Oman Hiking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-emerald-900 text-white text-center py-3 text-xs">
                        تم إصدار هذه الشهادة إلكترونياً عبر نظام مسيرات عمان
                    </div>
                  </>
              )}
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">أهلاً بك، {userName}</h1>
           <p className="text-gray-500 text-sm">لديك <span className="font-bold text-emerald-600">{activeTickets.length}</span> فعاليات قادمة و <span className="font-bold text-emerald-600">{completedHikes.length}</span> مشاركات مكتملة.</p>
        </div>
        <button 
           onClick={onLogout}
           className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <LogOut size={16} />
          تسجيل خروج
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-100">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tickets' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Ticket size={18} />
          التذاكر النشطة
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CheckCircle size={18} />
          الأرشيف والشهادات
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
         {activeTab === 'tickets' && (
            <>
               {activeTickets.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400">
                    <Ticket className="mx-auto mb-3 opacity-20" size={48} />
                    <p>لا توجد تذاكر نشطة حالياً</p>
                  </div>
               ) : (
                  activeTickets.map(record => (
                     <div key={record.id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col md:flex-row">
                        {/* QR Section */}
                        <div className="bg-emerald-800 p-6 flex flex-col items-center justify-center text-white min-w-[200px]">
                           <div className="bg-white p-3 rounded-lg mb-3">
                             <QrCode size={100} className="text-black" />
                           </div>
                           <span className="text-xs opacity-75 font-mono tracking-wider">{record.id}</span>
                           <span className="bg-emerald-700 px-3 py-1 rounded-full text-xs font-bold mt-2">
                             {record.status === Status.STARTED ? 'بدأ المسير' : 'مسجل'}
                           </span>
                        </div>
                        
                        {/* Info Section */}
                        <div className="p-6 flex-grow flex flex-col justify-center">
                           <h3 className="text-xl font-bold text-gray-800 mb-2">{record.eventName}</h3>
                           <div className="space-y-2 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-emerald-500" />
                                <span>{record.governorate} - {record.wilayat}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-emerald-500" />
                                <span>الوصول قبل 30 دقيقة من الانطلاق</span>
                              </div>
                           </div>
                           <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                              يرجى إبراز رمز QR للمنظمين عند نقطة البداية والنهاية.
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </>
         )}

         {activeTab === 'history' && (
            <>
               {completedHikes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400">
                    <CheckCircle className="mx-auto mb-3 opacity-20" size={48} />
                    <p>لم تكمل أي مسير بعد</p>
                  </div>
               ) : (
                  completedHikes.map(record => (
                     <div key={record.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                              <CheckCircle size={24} />
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-800 text-lg">{record.eventName}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                 <span className="flex items-center gap-1"><Calendar size={14} /> {record.checkOutTime ? new Date(record.checkOutTime).toLocaleDateString('ar-EG') : '-'}</span>
                                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                 <span className="text-green-600 font-medium">مكتمل</span>
                              </div>
                           </div>
                        </div>
                        
                        <button 
                           onClick={() => setShowCertificate(record)}
                           className="w-full sm:w-auto px-6 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                        >
                           <Award size={18} />
                           عرض الشهادة
                        </button>
                     </div>
                  ))
               )}
            </>
         )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;