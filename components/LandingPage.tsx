import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Zap, Award, Shield, Eye } from 'lucide-react';
import { api } from '../services/mockApi';
import { HikeEvent } from '../types';

interface LandingPageProps {
  onRegisterClick: (event?: HikeEvent) => void;
  onViewDetails: (event: HikeEvent) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onRegisterClick, onViewDetails }) => {
  const [hikes, setHikes] = useState<HikeEvent[]>([]);

  useEffect(() => {
    api.getHikes().then(setHikes);
  }, []);

  return (
    <div className="space-y-16 pb-12 animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Hiking in Oman" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-6 md:px-16 text-white max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            اكتشف جمال <span className="text-emerald-400">طبيعة عُمان</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl leading-relaxed">
            انضم إلينا في مغامرات استثنائية لاستكشاف الجبال والأودية. سجل الآن واحصل على تذكرتك الفورية وشهادة المشاركة عبر الواتساب.
          </p>
          <button 
            onClick={() => onViewDetails(hikes[0])}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg w-fit flex items-center gap-3"
          >
            سجل في المسير القادم
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 border-r-4 border-emerald-600 pr-4">
            المسارات القادمة
          </h2>
          <button onClick={() => {}} className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
            عرض الجدول الكامل <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hikes.map(hike => (
            <div key={hike.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100">
              <div className="h-48 overflow-hidden relative cursor-pointer" onClick={() => onViewDetails(hike)}>
                <img 
                  src={hike.image} 
                  alt={hike.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                  hike.difficulty === 'Easy' ? 'bg-green-100/90 text-green-800' : 
                  hike.difficulty === 'Medium' ? 'bg-yellow-100/90 text-yellow-800' : 
                  'bg-red-100/90 text-red-800'
                }`}>
                  {hike.difficulty === 'Easy' ? 'سهل' : hike.difficulty === 'Medium' ? 'متوسط' : 'صعب'}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <Calendar size={16} className="text-emerald-500" />
                  <span>{hike.date}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <MapPin size={16} className="text-emerald-500" />
                  <span>{hike.location}</span>
                </div>
                
                <h3 
                  className="text-xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-emerald-700 transition-colors"
                  onClick={() => onViewDetails(hike)}
                >
                  {hike.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-grow">
                  {hike.description}
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => onViewDetails(hike)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-1"
                  >
                    <Eye size={18} />
                    التفاصيل
                  </button>
                  <button 
                    onClick={() => onRegisterClick(hike)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-colors shadow-sm"
                  >
                    سجل الآن
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-emerald-900 rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
        
        <h2 className="text-3xl font-bold mb-12 relative z-10">لماذا تشارك معنا؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="w-16 h-16 bg-emerald-700/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Zap className="text-yellow-400" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">تسجيل فوري</h3>
            <p className="text-emerald-100 text-sm leading-relaxed">
              احصل على تذكرة QR Code مباشرة عبر الواتساب فور إتمام عملية التسجيل.
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="w-16 h-16 bg-emerald-700/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Award className="text-orange-400" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">شهادات تلقائية</h3>
            <p className="text-emerald-100 text-sm leading-relaxed">
              يتم إصدار شهادة مشاركة وإرسالها لك تلقائياً بمجرد الوصول لنقطة النهاية.
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="w-16 h-16 bg-emerald-700/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Shield className="text-blue-400" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">تنظيم احترافي</h3>
            <p className="text-emerald-100 text-sm leading-relaxed">
              فريق متكامل لإدارة الحشود وضمان سلامة الجميع أثناء المسير.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;