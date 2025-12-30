import React, { useState, useMemo, useEffect } from 'react';
import { UserPlus, Users, User as UserIcon, Plus, Trash2, CheckCircle, QrCode, FileText, HeartPulse, MapPin, Flag, ChevronDown, Upload, Image as ImageIcon, Calendar, X, Lock } from 'lucide-react';
import { api, UPCOMING_HIKES } from '../services/mockApi';
import { useToast } from './Toast';
import { HikeEvent } from '../types';

// Data Dictionary for Oman Locations
const OMAN_LOCATIONS: Record<string, Record<string, string[]>> = {
  'مسقط': {
    'السيب': ['الموالح', 'الحيل', 'الخوض', 'المعبيلة', 'سور آل حديد'],
    'بوشر': ['الغبرة', 'العذيبة', 'الخوير', 'مدينة الإعلام', 'القرم'],
    'مطرح': ['مطرح', 'روي', 'الوادي الكبير', 'دارسيت'],
    'العامرات': ['العامرات', 'الحاجر', 'جحلوت', 'مدينة النهضة'],
    'قريات': ['قريات', 'حي الظاهر', 'الشهباري'],
    'مسقط': ['مسقط القديمة', 'سداب', 'البستان']
  },
  'ظفار': {
    'صلالة': ['صلالة الوسطى', 'صلالة الغربية', 'صلالة الشرقية', 'الحافة', 'الدهاريز'],
    'طاقة': ['طاقة', 'مدينة الحق'],
    'مرباط': ['مرباط', 'طوي أعتير'],
    'ثمريت': ['ثمريت'],
    'سدح': ['سدح', 'حاسك']
  },
  'الداخلية': {
    'نزوى': ['نزوى', 'بركة الموز', 'فرق', 'حي التراث', 'تنوف'],
    'بهلاء': ['بهلاء', 'جبرين', 'بسياء', 'المعمورة'],
    'منح': ['منح', 'البلاد', 'المعري'],
    'الحمراء': ['الحمراء', 'مسفاة العبريين', 'جبل شمس'],
    'أدم': ['أدم', 'البشائر'],
    'إزكي': ['إزكي', 'القارط', 'قلعة العوامر'],
    'سمائل': ['سمائل', 'الخوبار', 'لزغ'],
    'بدبد': ['بدبد', 'فنجاء']
  },
  'شمال الباطنة': {
    'صحار': ['الهمبار', 'الوقيبة', 'الطريف', 'الصويحرة', 'مجيس'],
    'شناص': ['شناص', 'العقر', 'أبو بقرة'],
    'لوى': ['لوى', 'نبر', 'الزاهية'],
    'صحم': ['صحم', 'الحويل', 'ديل آل عبد السلام'],
    'الخابورة': ['الخابورة', 'القصف'],
    'السويق': ['السويق', 'البطحاء', 'الخضراء']
  },
  'جنوب الباطنة': {
    'الرستاق': ['الرستاق', 'العراقي', 'الحزم'],
    'العوابي': ['العوابي'],
    'نخل': ['نخل', 'الحسنات'],
    'وادي المعاول': ['أفي', 'حبراء'],
    'بركاء': ['بركاء', 'المريصي', 'الصومحان'],
    'المصنعة': ['المصنعة', 'المحارة', 'الشعيبة']
  },
  'جنوب الشرقية': {
    'صور': ['صور', 'العيجة', 'بلاد صور', 'رأس الحد'],
    'الكامل والوافي': ['الكامل', 'الوافي'],
    'جعلون بني بوحسن': ['جعلون'],
    'جعلون بني بوعلي': ['جعلون', 'الأشخرة'],
    'مصيرة': ['مصيرة']
  },
  'شمال الشرقية': {
    'إبراء': ['إبراء', 'اليحمدي', 'الثابتي'],
    'المضيبي': ['المضيبي', 'سناوي', 'سمد الشأن'],
    'بدية': ['بدية', 'المنترب'],
    'القابل': ['القابل', 'الدريز'],
    'وادي بني خالد': ['وادي بني خالد'],
    'دماء والطائيين': ['دماء', 'الطائيين']
  },
  'الظاهرة': {
    'عبري': ['عبري', 'العراقي', 'المرتفع', 'الدريز'],
    'ينقل': ['ينقل'],
    'ضنك': ['ضنك']
  },
  'البريمي': {
    'البريمي': ['البريمي', 'صعراء', 'الخضراء'],
    'محضة': ['محضة'],
    'السنينة': ['السنينة']
  },
  'مسندم': {
    'خصب': ['خصب', 'كمزار'],
    'بخاء': ['بخاء'],
    'دبا': ['دبا'],
    'مدحاء': ['مدحاء']
  },
  'الوسطى': {
    'هيماء': ['هيماء'],
    'محوت': ['محوت'],
    'الدقم': ['الدقم', 'رأس مدركة'],
    'الجازر': ['الجازر']
  }
};

const HEALTH_STATUS_OPTIONS = [
  'لائق صحياً',
  'أعاني من بعض الصعوبات الصحية',
  'أخرى'
];

interface MemberData {
  fullName: string;
  phone: string;
  birthDate: string;
  gender: 'Male' | 'Female';
  healthStatus: string;
}

interface RegistrationFormProps {
  selectedEvent?: HikeEvent;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ selectedEvent: initialEvent }) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regType, setRegType] = useState<'individual' | 'group'>('individual');
  
  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(initialEvent?.id);
  const [allHikes, setAllHikes] = useState<HikeEvent[]>(UPCOMING_HIKES);

  useEffect(() => {
    // Refresh hikes list just in case
    api.getHikes().then(setAllHikes);
  }, []);
  
  // Team Data (Only for Group)
  const [teamData, setTeamData] = useState({
    name: '',
    logo: '' as string // Base64
  });

  // Leader / Individual State
  const [leaderData, setLeaderData] = useState({
    fullName: '', // 1
    governorate: '', // 2
    wilayat: '', // 2
    village: '', // 2
    birthDate: '', // 3 (Age calculated)
    gender: 'Male' as 'Male' | 'Female', // 4
    phone: '', // 5
    // Team Name removed from here
    healthStatus: 'لائق صحياً', // 7
    agreedToTerms: false, // 8
    notes: '' // 9
  });

  // Members State
  const [members, setMembers] = useState<MemberData[]>([]);

  // Helpers
  const calculateAge = (dateString: string) => {
    if (!dateString) return '';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamData({ ...teamData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helpers for cascading dropdowns
  const availableWilayats = useMemo(() => {
    if (!leaderData.governorate || !OMAN_LOCATIONS[leaderData.governorate]) return [];
    return Object.keys(OMAN_LOCATIONS[leaderData.governorate]);
  }, [leaderData.governorate]);

  const availableVillages = useMemo(() => {
    if (!leaderData.governorate || !leaderData.wilayat) return [];
    const villages = OMAN_LOCATIONS[leaderData.governorate][leaderData.wilayat];
    return villages && villages.length > 0 ? villages : ['مركز الولاية', 'أخرى'];
  }, [leaderData.governorate, leaderData.wilayat]);

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLeaderData({
      ...leaderData,
      governorate: e.target.value,
      wilayat: '', // Reset dependant fields
      village: ''
    });
  };

  const handleWilayatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLeaderData({
      ...leaderData,
      wilayat: e.target.value,
      village: '' // Reset dependant field
    });
  };

  const handleAddMember = () => {
    setMembers([...members, { 
      fullName: '', 
      phone: '', 
      birthDate: '', 
      gender: 'Male',
      healthStatus: 'لائق صحياً' 
    }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof MemberData, value: string) => {
    const newMembers = [...members];
    // @ts-ignore
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Event Selection
    if (!selectedEventId) {
      showToast('يرجى اختيار المسير الذي تود التسجيل فيه', 'error');
      return;
    }

    const event = allHikes.find(h => h.id == selectedEventId);
    if (!event) return;

    // Basic Validation
    if (!leaderData.fullName || !leaderData.phone || !leaderData.birthDate || 
        !leaderData.governorate || !leaderData.wilayat || !leaderData.village) {
      showToast('يرجى تعبئة جميع الحقول الإلزامية بما في ذلك بيانات العنوان', 'error');
      return;
    }

    if (!leaderData.agreedToTerms) {
      showToast('يجب الموافقة على شروط المشاركة', 'error');
      return;
    }

    if (regType === 'group') {
       if(!teamData.name) {
         showToast('يرجى كتابة اسم الفريق', 'error');
         return;
       }
       if (members.length === 0) {
         showToast('يجب إضافة عضو واحد على الأقل للفريق', 'error');
         return;
       }
       // Validate members
       for (const member of members) {
        if (!member.fullName || !member.birthDate) {
          showToast('يرجى استكمال بيانات جميع الأعضاء (الاسم وتاريخ الميلاد)', 'error');
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // Step 1: Request OTP (Pass eventId to use custom gateway)
      await api.sendOTP(leaderData.phone, selectedEventId);
      setIsSubmitting(false);
      setShowOtpModal(true); // Open Modal
    } catch (error) {
      showToast('فشل في إرسال رمز التحقق. حاول مرة أخرى.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otpCode || otpCode.length < 4) {
      showToast('يرجى إدخال رمز التحقق بشكل صحيح', 'error');
      return;
    }

    setIsVerifyingOtp(true);
    const event = allHikes.find(h => h.id == selectedEventId);
    if (!event) return;

    try {
      // Step 2: Verify OTP
      await api.verifyOTP(leaderData.phone, otpCode);
      
      // Step 3: Proceed with Registration
      await api.register({
        type: regType,
        eventId: event.id,
        eventName: event.title,
        leader: leaderData,
        teamDetails: regType === 'group' ? teamData : undefined,
        members: regType === 'group' ? members : []
      });
      
      setShowOtpModal(false);
      setIsSuccess(true);
      showToast('تم التسجيل بنجاح! تم إرسال التذاكر عبر الواتساب.', 'success');
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء التحقق. تأكد من الرمز.', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const currentEvent = allHikes.find(e => e.id == selectedEventId);

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">تم التسجيل بنجاح!</h2>
        <p className="text-gray-600 mb-6">
          أهلاً بك في {currentEvent?.title || 'المسير'}. لقد قمنا بإرسال تذكرة الدخول (QR Code) إلى رقم الواتساب المسجل:
          <br />
          <span className="font-bold text-emerald-600" dir="ltr">{leaderData.phone}</span>
        </p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <QrCode size={16} />
            <span>تم توليد الرموز وإرسالها</span>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 w-full"
        >
          تسجيل مشارك آخر
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">التحقق من رقم الهاتف</h3>
              <p className="text-sm text-gray-500 mb-6">
                أدخل رمز التحقق (OTP) الذي تم إرساله إلى الرقم <br />
                <span className="font-bold text-gray-800" dir="ltr">{leaderData.phone}</span>
              </p>
              
              <div className="mb-6">
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-48 text-center text-3xl font-bold tracking-[0.5em] p-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="0000"
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyAndRegister}
                disabled={isVerifyingOtp}
                className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-all mb-3 flex justify-center items-center gap-2"
              >
                {isVerifyingOtp ? (
                  <>
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     جاري التحقق...
                  </>
                ) : (
                  'تأكيد التسجيل'
                )}
              </button>
              
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                إلغاء
              </button>
            </div>
            <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t border-gray-100">
               لم يصلك الرمز؟ <button className="text-emerald-600 font-bold hover:underline" onClick={() => showToast('تم إعادة الإرسال', 'info')}>إعادة الإرسال</button>
            </div>
          </div>
        </div>
      )}

      {/* Event Selection Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الفعالية</h2>
          
          {initialEvent ? (
            <div className="flex gap-4 items-start">
              <img src={initialEvent.image} alt={initialEvent.title} className="w-24 h-24 rounded-lg object-cover hidden sm:block" />
              <div>
                <h3 className="text-lg font-bold text-emerald-800">{initialEvent.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {initialEvent.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {initialEvent.location}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">{initialEvent.description}</div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اختر المسير الذي تود التسجيل فيه <span className="text-red-500">*</span></label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
              >
                <option value="">-- اختر الفعالية --</option>
                {allHikes.map(hike => (
                  <option key={hike.id} value={hike.id}>
                    {hike.title} - {hike.date} ({hike.location})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 bg-emerald-800 text-white">
          <h2 className="text-2xl font-bold mb-2">استمارة التسجيل</h2>
          <p className="opacity-90 text-sm">يرجى تعبئة البيانات بدقة لضمان إصدار الشهادة وتصريح الدخول</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Registration Type Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRegType('individual')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                regType === 'individual'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-md'
                  : 'border-gray-200 text-gray-500 hover:border-emerald-200 hover:bg-gray-50'
              }`}
            >
              <UserIcon size={28} className="mb-2" />
              <span className="font-bold">تسجيل فردي</span>
            </button>
            <button
              type="button"
              onClick={() => setRegType('group')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                regType === 'group'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-md'
                  : 'border-gray-200 text-gray-500 hover:border-emerald-200 hover:bg-gray-50'
              }`}
            >
              <Users size={28} className="mb-2" />
              <span className="font-bold">فريق / عائلة</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Group Details Section (Only if Group) */}
            {regType === 'group' && (
              <div className="space-y-6 bg-emerald-50 p-6 rounded-xl border border-emerald-100 animate-fade-in">
                <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-800 border-b pb-3 border-emerald-200">
                  <Flag size={20} />
                  بيانات الفريق
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الفريق <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required={regType === 'group'}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="اكتب اسم الفريق"
                      value={teamData.name}
                      onChange={(e) => setTeamData({...teamData, name: e.target.value})}
                    />
                   </div>
                   
                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">شعار الفريق (اختياري)</label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-400 transition-colors bg-white">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        {teamData.logo ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-medium">
                            <ImageIcon size={20} />
                            <span>تم اختيار الصورة</span>
                            <img src={teamData.logo} alt="Preview" className="w-8 h-8 rounded-full object-cover ml-2 border border-emerald-200" />
                          </div>
                        ) : (
                          <>
                            <Upload size={20} />
                            <span>اختر صورة الشعار</span>
                          </>
                        )}
                      </div>
                    </div>
                   </div>
                </div>
              </div>
            )}

            {/* 1. Leader / Individual Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800 border-b pb-3 border-gray-200">
                <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700">
                   <UserIcon size={20} />
                </div>
                {regType === 'group' ? 'بيانات قائد الفريق' : 'البيانات الشخصية'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Full Name */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">1. الاسم الثلاثي والقبيلة <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                    placeholder="مثال: محمد بن سعيد بن علي العامري"
                    value={leaderData.fullName}
                    onChange={(e) => setLeaderData({...leaderData, fullName: e.target.value})}
                  />
                </div>

                {/* 2. Address Cascading Dropdowns */}
                <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                      <MapPin size={16} className="text-gray-400" />
                      2. العنوان <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Governorate */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">المحافظة</label>
                        <div className="relative">
                          <select
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white appearance-none"
                            value={leaderData.governorate}
                            onChange={handleGovernorateChange}
                          >
                            <option value="">اختر المحافظة...</option>
                            {Object.keys(OMAN_LOCATIONS).map(gov => <option key={gov} value={gov}>{gov}</option>)}
                          </select>
                          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>

                      {/* Wilayat */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">الولاية</label>
                        <div className="relative">
                          <select
                            required
                            disabled={!leaderData.governorate}
                            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white appearance-none ${!leaderData.governorate ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={leaderData.wilayat}
                            onChange={handleWilayatChange}
                          >
                            <option value="">اختر الولاية...</option>
                            {availableWilayats.map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>

                      {/* Village */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">القرية</label>
                         <div className="relative">
                          <select
                            required
                            disabled={!leaderData.wilayat}
                            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white appearance-none ${!leaderData.wilayat ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={leaderData.village}
                            onChange={(e) => setLeaderData({...leaderData, village: e.target.value})}
                          >
                            <option value="">اختر القرية...</option>
                            {availableVillages.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                    </div>
                </div>

                {/* 5. Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">5. رقم الهاتف (واتساب) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-left ltr"
                      dir="ltr"
                      placeholder="9xxxxxxx"
                      value={leaderData.phone}
                      onChange={(e) => setLeaderData({...leaderData, phone: e.target.value})}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">+968</span>
                  </div>
                </div>

                {/* 3. Date of Birth & 4. Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
                      <span>3. تاريخ الميلاد <span className="text-red-500">*</span></span>
                      {leaderData.birthDate && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 rounded-full flex items-center">
                          العمر: {calculateAge(leaderData.birthDate)}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={leaderData.birthDate}
                        onChange={(e) => setLeaderData({...leaderData, birthDate: e.target.value})}
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">4. الجنس <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 h-[50px]">
                      <button
                        type="button"
                        onClick={() => setLeaderData({...leaderData, gender: 'Male'})}
                        className={`flex-1 rounded-lg border text-sm font-medium transition-colors ${
                          leaderData.gender === 'Male' 
                          ? 'bg-blue-50 border-blue-500 text-blue-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        ذكر
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaderData({...leaderData, gender: 'Female'})}
                        className={`flex-1 rounded-lg border text-sm font-medium transition-colors ${
                          leaderData.gender === 'Female' 
                          ? 'bg-pink-50 border-pink-500 text-pink-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        أنثى
                      </button>
                    </div>
                  </div>
                </div>

                {/* 7. Health Status */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <HeartPulse size={16} className="text-gray-400" />
                    7. اللياقة الصحية <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {HEALTH_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setLeaderData({...leaderData, healthStatus: status})}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          leaderData.healthStatus === status
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                            : 'border-gray-300 text-gray-600 hover:border-emerald-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 9. Additional Notes */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <FileText size={16} className="text-gray-400" />
                    9. ملاحظات إضافية <span className="text-gray-400 font-normal text-xs">(اختياري)</span>
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="هل لديك أي حساسية؟ هل تحتاج لمساعدة خاصة؟"
                    value={leaderData.notes}
                    onChange={(e) => setLeaderData({...leaderData, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Members Section (Only if Group) */}
            {regType === 'group' && (
              <div className="space-y-4 pt-4 border-t border-dashed border-gray-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700">
                      <Users size={20} />
                    </div>
                    بيانات أعضاء الفريق ({members.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="flex items-center gap-1 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm"
                  >
                    <Plus size={16} />
                    إضافة عضو
                  </button>
                </div>

                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-xl border border-gray-200 relative animate-fade-in hover:border-emerald-200 transition-colors">
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="absolute top-4 left-4 text-gray-400 hover:text-red-500 bg-white p-1 rounded-full shadow-sm border border-gray-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">عضو #{index + 1}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          placeholder="الاسم الثلاثي"
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                          value={member.fullName}
                          onChange={(e) => handleMemberChange(index, 'fullName', e.target.value)}
                        />
                         <input
                          type="tel"
                          placeholder="الهاتف (اختياري)"
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm text-left focus:ring-1 focus:ring-emerald-500 outline-none"
                          dir="ltr"
                          value={member.phone}
                          onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                           <div className="relative">
                              <input
                                type="date"
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                value={member.birthDate}
                                onChange={(e) => handleMemberChange(index, 'birthDate', e.target.value)}
                              />
                              {member.birthDate && (
                                <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-emerald-600 border border-emerald-100 rounded">
                                  {calculateAge(member.birthDate)} سنة
                                </span>
                              )}
                           </div>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                value={member.gender}
                                onChange={(e) => handleMemberChange(index, 'gender', e.target.value)}
                            >
                                <option value="Male">ذكر</option>
                                <option value="Female">أنثى</option>
                            </select>
                        </div>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                            value={member.healthStatus}
                            onChange={(e) => handleMemberChange(index, 'healthStatus', e.target.value)}
                        >
                            {HEALTH_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  {members.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      <Users className="mx-auto mb-2 opacity-50" size={32} />
                      <p>لم يتم إضافة أعضاء للفريق بعد</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. Declaration */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
               <label className="flex items-start gap-3 cursor-pointer">
                 <input 
                   type="checkbox" 
                   required
                   className="mt-1.5 w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                   checked={leaderData.agreedToTerms}
                   onChange={(e) => setLeaderData({...leaderData, agreedToTerms: e.target.checked})}
                 />
                 <div className="text-sm text-gray-800">
                   <span className="font-bold block mb-1">8. الإقرار والتعهد</span>
                   أقر بأنني اطلعت على شروط المشاركة وأوافق عليها، وأن جميع البيانات المدخلة صحيحة، وأتحمل المسؤولية الكاملة عن حالتي الصحية وقدرتي البدنية للمشاركة في هذا المسير.
                 </div>
               </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-800 text-white font-bold py-4 px-6 rounded-xl hover:bg-emerald-900 focus:ring-4 focus:ring-emerald-200 transition-all shadow-lg flex justify-center items-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري إرسال رمز التحقق...
                  </>
                ) : (
                  <>
                    <UserPlus size={24} />
                    تأكيد التسجيل وإرسال رمز التحقق
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;