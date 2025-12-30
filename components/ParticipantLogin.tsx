import React, { useState } from 'react';
import { User, Lock, Phone, ArrowLeft, Info } from 'lucide-react';
import { api } from '../services/mockApi';
import { useToast } from './Toast';
import { User as UserType } from '../types';

interface ParticipantLoginProps {
  onLoginSuccess: (records: UserType[]) => void;
}

const ParticipantLogin: React.FC<ParticipantLoginProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      showToast('يرجى إدخال رقم هاتف صحيح', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.sendOTP(phone);
      setStep('otp');
      showToast('تم إرسال رمز التحقق: 1234', 'info');
    } catch (error) {
      showToast('حدث خطأ أثناء الاتصال', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      showToast('أدخل الرمز المكون من 4 أرقام', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.verifyOTP(phone, otp);
      const records = await api.getParticipantHistory(phone);
      if (records.length === 0) {
        showToast('لم يتم العثور على أي مشاركات مسجلة بهذا الرقم', 'info');
      }
      onLoginSuccess(records);
    } catch (error: any) {
      showToast(error.message || 'رمز التحقق خاطئ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoData = () => {
    setPhone('99000000');
    showToast('تم تعبئة رقم الهاتف التجريبي', 'info');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <User className="text-emerald-600" size={36} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">دخول المشاركين</h2>
        <p className="text-gray-500 text-sm mt-2">
          استعرض تذاكرك وشهاداتك السابقة
        </p>
      </div>

      {/* Demo Hint Box */}
      <div 
        className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 relative group cursor-pointer hover:bg-blue-100 transition-colors" 
        onClick={step === 'phone' ? fillDemoData : undefined}
      >
        <div className="flex items-start gap-2">
            <Info className="flex-shrink-0 mt-0.5" size={16} />
            <div>
                <p className="font-bold mb-1">بيانات تجريبية (Demo):</p>
                <ul className="space-y-1 text-blue-700">
                    <li>رقم الهاتف: <strong className="font-mono bg-white/50 px-1 rounded">99000000</strong></li>
                    <li>رمز التحقق: <strong className="font-mono bg-white/50 px-1 rounded">1234</strong></li>
                </ul>
                {step === 'phone' && <p className="text-[10px] mt-2 opacity-70 font-bold text-blue-600">(اضغط هنا للتعبئة التلقائية)</p>}
            </div>
        </div>
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف (واتساب)</label>
            <div className="relative">
              <input
                type="tel"
                required
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-left ltr pl-12 font-medium text-lg"
                dir="ltr"
                placeholder="9xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">+968</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? 'جاري الإرسال...' : (
              <>
                إرسال رمز التحقق
                <ArrowLeft size={20} />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="text-center">
             <p className="text-sm text-gray-600 mb-4">
                أدخل الرمز المرسل إلى <span className="font-bold text-emerald-700" dir="ltr">{phone}</span>
             </p>
             <input
                type="text"
                maxLength={4}
                autoFocus
                className="w-full text-center text-4xl font-bold tracking-[0.5em] p-4 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-emerald-800"
                placeholder="0000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 shadow-md"
          >
             {isLoading ? 'جاري التحقق...' : (
              <>
                <Lock size={20} />
                دخول
              </>
            )}
          </button>
          
          <button 
             type="button" 
             onClick={() => setStep('phone')}
             className="w-full text-sm text-gray-500 hover:text-emerald-600"
          >
            تغيير رقم الهاتف
          </button>
        </form>
      )}
    </div>
  );
};

export default ParticipantLogin;