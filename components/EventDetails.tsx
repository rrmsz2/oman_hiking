import React from 'react';
import { 
  Calendar, MapPin, Clock, DollarSign, Activity, Share2, 
  ArrowLeft, CheckCircle, Navigation, Info 
} from 'lucide-react';
import { HikeEvent } from '../types';
import { useToast } from './Toast';

interface EventDetailsProps {
  event: HikeEvent;
  onRegister: () => void;
  onBack: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onRegister, onBack }) => {
  const { showToast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `انضم إلينا في ${event.title} - ${event.date}`,
          url: window.location.href, // In a real app, append ?event=id
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(`${event.title}\n${event.date}\n${event.location}`);
      showToast('تم نسخ تفاصيل الفعالية للحافظة', 'success');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-24">
      {/* Navigation & Header Image */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl group">
        <button 
          onClick={onBack}
          className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors text-gray-800"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={handleShare}
          className="absolute top-4 left-4 z-10 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors text-emerald-700"
        >
          <Share2 size={24} />
        </button>
        
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 right-0 p-6 md:p-8 text-white w-full">
          <div className="flex flex-wrap gap-3 mb-3">
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                event.difficulty === 'Easy' ? 'bg-green-500/90' : 
                event.difficulty === 'Medium' ? 'bg-yellow-500/90' : 'bg-red-500/90'
             }`}>
                {event.difficulty === 'Easy' ? 'مسار سهل' : event.difficulty === 'Medium' ? 'متوسط الصعوبة' : 'صعب'}
             </span>
             <span className="bg-emerald-600/90 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
               <DollarSign size={12} />
               {event.price}
             </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
           <Calendar className="text-emerald-500 mb-2" size={24} />
           <span className="text-xs text-gray-400 font-bold uppercase">التاريخ</span>
           <span className="font-bold text-gray-800">{event.date}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
           <Clock className="text-emerald-500 mb-2" size={24} />
           <span className="text-xs text-gray-400 font-bold uppercase">المدة</span>
           <span className="font-bold text-gray-800">{event.duration}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
           <Activity className="text-emerald-500 mb-2" size={24} />
           <span className="text-xs text-gray-400 font-bold uppercase">المسافة</span>
           <span className="font-bold text-gray-800">{event.distance}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
           <MapPin className="text-emerald-500 mb-2" size={24} />
           <span className="text-xs text-gray-400 font-bold uppercase">الموقع</span>
           <span className="font-bold text-gray-800 text-xs truncate w-full">{event.location}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="text-emerald-600" size={20} />
              عن المسير
            </h2>
            <p className="text-gray-600 leading-relaxed text-justify">
              {event.longDescription}
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100 flex items-start gap-2">
              <Navigation className="flex-shrink-0 mt-1" size={16} />
              <div>
                <span className="font-bold block mb-1">نقطة التجمع:</span>
                {event.meetingPoint}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-emerald-600" size={20} />
              الجدول الزمني
            </h2>
            <div className="space-y-4">
              {event.schedule.map((item, index) => (
                <div key={index} className="flex gap-4 relative">
                  {/* Timeline Line */}
                  {index !== event.schedule.length - 1 && (
                    <div className="absolute right-[11px] top-8 bottom-[-16px] w-[2px] bg-gray-100"></div>
                  )}
                  
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-500 flex-shrink-0 z-10"></div>
                  <div className="flex-grow pb-1">
                    <span className="text-emerald-700 font-bold text-sm block">{item.time}</span>
                    <span className="text-gray-700">{item.activity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left Column: Register CTA */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
             <h3 className="text-lg font-bold text-gray-800 mb-4">احجز مقعدك الآن</h3>
             <ul className="space-y-3 mb-6">
               <li className="flex items-center gap-2 text-sm text-gray-600">
                 <CheckCircle size={16} className="text-green-500" />
                 <span>تذكرة دخول فورية</span>
               </li>
               <li className="flex items-center gap-2 text-sm text-gray-600">
                 <CheckCircle size={16} className="text-green-500" />
                 <span>شهادة مشاركة معتمدة</span>
               </li>
               <li className="flex items-center gap-2 text-sm text-gray-600">
                 <CheckCircle size={16} className="text-green-500" />
                 <span>مشروبات وضيافة خفيفة</span>
               </li>
             </ul>
             
             <button
               onClick={onRegister}
               className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
             >
               تسجيل في المسير
               <ArrowLeft size={18} />
             </button>

             <button
               onClick={handleShare}
               className="w-full mt-3 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-2"
             >
               <Share2 size={18} />
               مشاركة مع صديق
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex gap-3">
         <button
           onClick={handleShare}
           className="bg-gray-100 text-gray-700 p-3 rounded-xl"
         >
           <Share2 size={24} />
         </button>
         <button
           onClick={onRegister}
           className="flex-grow bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex justify-center items-center gap-2"
         >
           تسجيل الآن
           <ArrowLeft size={18} />
         </button>
      </div>
    </div>
  );
};

export default EventDetails;