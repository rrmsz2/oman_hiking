import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle, Clock, MapPin, AlertTriangle, RefreshCw, BarChart2, Users } from 'lucide-react';
import { api } from '../services/mockApi';
import { useToast } from './Toast';
import { Stats, Status } from '../types';

const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'scan' | 'stats'>('scan');
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedUser, setLastScannedUser] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const fetchStats = async () => {
    const data = await api.getStats();
    setStats(data);
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const handleSimulateScan = async () => {
    // In a real app, this would be triggered by a QR library like react-qr-reader
    // For this demo, we simulate scanning a random user (or the one we just created)
    // Let's assume we scan "user_1" or "user_2" randomly for demo purposes
    const demoIds = ['user_1', 'user_2']; 
    // Add a random ID sometimes to simulate error
    if (Math.random() > 0.8) demoIds.push('invalid_id');
    
    const randomId = demoIds[Math.floor(Math.random() * demoIds.length)];

    setScanStatus('processing');
    try {
      const result = await api.scanUser(randomId);
      setLastScannedUser(result.user);
      setScanStatus('success');
      showToast(result.message, 'success');
      if (activeTab === 'stats') fetchStats(); // Refresh stats if visible
    } catch (error: any) {
      setScanStatus('error');
      showToast(error.message || 'QR Code غير صالح', 'error');
    } finally {
      // Reset scanner after delay
      setTimeout(() => {
        setScanStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex bg-white rounded-lg shadow p-1">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'scan' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Camera size={18} />
          الماسح الضوئي (Scanner)
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'stats' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart2 size={18} />
          الإحصائيات
        </button>
      </div>

      {activeTab === 'scan' ? (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-6 text-gray-800">مسح تذكرة المشارك</h2>
          
          {/* Scanner Viewport Simulation */}
          <div className="relative w-full max-w-sm aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center mb-6">
            {scanStatus === 'idle' && (
              <>
                <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-2xl animate-pulse"></div>
                <div className="w-64 h-1 bg-red-500 shadow-[0_0_10px_red] absolute top-1/2 -translate-y-1/2 animate-scan-line"></div>
                <Camera size={48} className="text-gray-600 mb-2" />
                <p className="text-gray-400 text-sm">وجّه الكاميرا نحو الرمز</p>
              </>
            )}

            {scanStatus === 'processing' && (
              <div className="flex flex-col items-center text-white">
                <RefreshCw className="animate-spin mb-2" size={32} />
                <span>جاري التحقق...</span>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center text-white animate-fade-in">
                <CheckCircle size={64} className="mb-2" />
                <span className="text-xl font-bold">تم بنجاح!</span>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center text-white animate-fade-in">
                <AlertTriangle size={64} className="mb-2" />
                <span className="text-xl font-bold">خطأ!</span>
              </div>
            )}
            
            {/* Simulation Button Overlay */}
            <div className="absolute bottom-4 z-10">
               <button 
                onClick={handleSimulateScan}
                disabled={scanStatus !== 'idle'}
                className="bg-white/20 backdrop-blur-md border border-white/50 text-white px-4 py-2 rounded-full text-xs hover:bg-white/30"
               >
                 [محاكاة مسح الكاميرا]
               </button>
            </div>
          </div>

          {/* Last Scanned Result Info */}
          {lastScannedUser && (
            <div className="w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg p-4 animate-slide-up">
              <h3 className="font-bold text-gray-700 border-b pb-2 mb-2">بيانات المشارك</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">الاسم:</span>
                  <span className="font-bold">{lastScannedUser.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الحالة الجديدة:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                    lastScannedUser.status === Status.STARTED ? 'bg-blue-100 text-blue-700' : 
                    lastScannedUser.status === Status.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                  }`}>
                    {lastScannedUser.status === Status.STARTED ? 'بدأ المسير' : 'أنهى المسير'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الوقت:</span>
                  <span className="dir-ltr">{new Date().toLocaleTimeString('en-US')}</span>
                </div>
                 {lastScannedUser.status === Status.COMPLETED && (
                  <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200 flex items-center gap-2">
                    <CheckCircle size={12} />
                    تم إنشاء الشهادة وإرسالها للواتساب
                  </div>
                 )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl shadow border-r-4 border-blue-500">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-gray-500 text-sm font-bold">المسجلين</p>
                 <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalRegistered || 0}</h3>
               </div>
               <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                 <Users size={24} />
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow border-r-4 border-orange-500">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-gray-500 text-sm font-bold">على المسار (Started)</p>
                 <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalStarted || 0}</h3>
               </div>
               <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                 <Clock size={24} />
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow border-r-4 border-green-500">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-gray-500 text-sm font-bold">أكملوا المسير</p>
                 <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalCompleted || 0}</h3>
               </div>
               <div className="bg-green-100 p-2 rounded-lg text-green-600">
                 <CheckCircle size={24} />
               </div>
             </div>
           </div>

           <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl shadow mt-4">
             <h3 className="font-bold text-gray-700 mb-4">تعليمات المنظمين</h3>
             <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
               <li>قم بمسح الكود عند <strong>نقطة البداية</strong> لتسجيل وقت الانطلاق.</li>
               <li>قم بمسح الكود مرة أخرى عند <strong>نقطة النهاية</strong> لتسجيل الإكمال وإصدار الشهادة.</li>
               <li>النظام سيقوم تلقائياً بإرسال الشهادة PDF عبر الواتساب فور المسح الثاني.</li>
               <li>في حال ظهور خطأ، تأكد من نظافة عدسة الكاميرا ووضوح رمز الـ QR.</li>
             </ul>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;