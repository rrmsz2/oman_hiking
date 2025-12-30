import React, { useState } from 'react';
import { Lock, User, KeyRound, ArrowLeft, Info, BadgeCheck } from 'lucide-react';
import { api } from '../services/mockApi';
import { useToast } from './Toast';
import { Organizer } from '../types';

interface OrganizerLoginProps {
  onLoginSuccess: (organizer: Organizer) => void;
}

const OrganizerLogin: React.FC<OrganizerLoginProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('يرجى تعبئة جميع الحقول', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const organizer = await api.loginOrganizer(username, password);
      showToast(`مرحباً بك، ${organizer.name}`, 'success');
      onLoginSuccess(organizer);
    } catch (error: any) {
      showToast(error.message || 'خطأ في تسجيل الدخول', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoData = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100 shadow-sm">
          <BadgeCheck className="text-emerald-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">بوابة المنظمين</h2>
        <p className="text-gray-500 text-sm mt-2">
          إدارة الفعاليات والمشاركين
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المستخدم</label>
          <div className="relative">
            <input
              type="text"
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none pl-12"
              placeholder="Username"
              dir="ltr"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
          <div className="relative">
            <input
              type="password"
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none pl-12 font-mono"
              placeholder="••••••"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-900 text-white font-bold py-4 rounded-xl hover:bg-emerald-800 transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
        >
          {isLoading ? 'جاري التحقق...' : (
            <>
              <Lock size={20} />
              تسجيل الدخول
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Hint */}
      <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <Info size={16} />
          <span className="font-bold">بيانات تجريبية:</span>
        </div>
        
        <div className="space-y-2">
          <button 
             type="button"
             onClick={() => fillDemoData('admin_wadi', '123')}
             className="w-full text-right p-3 bg-gray-50 hover:bg-emerald-50 rounded-lg text-xs transition-colors flex justify-between items-center group"
          >
             <div>
                <span className="font-bold text-gray-800 block">مدير وادي شاب</span>
                <span className="text-gray-500">User: admin_wadi | Pass: 123</span>
             </div>
             <ArrowLeft size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
          </button>

          <button 
             type="button"
             onClick={() => fillDemoData('super_admin', '123')}
             className="w-full text-right p-3 bg-gray-50 hover:bg-emerald-50 rounded-lg text-xs transition-colors flex justify-between items-center group"
          >
             <div>
                <span className="font-bold text-gray-800 block">المدير العام (الكل)</span>
                <span className="text-gray-500">User: super_admin | Pass: 123</span>
             </div>
             <ArrowLeft size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizerLogin;