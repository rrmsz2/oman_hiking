import React, { useState } from 'react';
import { Menu, X, Mountain, Users, LayoutDashboard, Home, Facebook, Twitter, Instagram, Mail, UserCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'الرئيسية', icon: <Home size={20} /> },
    { id: 'register', label: 'التسجيل', icon: <Users size={20} /> },
    { id: 'login', label: 'دخول المشاركين', icon: <UserCircle size={20} /> },
    { id: 'organizer-login', label: 'بوابة المنظمين', icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('landing')}>
            <div className="bg-white p-1.5 rounded-full text-emerald-800 group-hover:bg-emerald-100 transition-colors">
              <Mountain size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">مسيرات عمان</h1>
              <p className="text-[10px] text-emerald-200 opacity-80 uppercase tracking-widest">Oman Hiking</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-medium ${
                  currentPage === item.id || (item.id === 'organizer-login' && currentPage === 'organizer-dashboard') || (item.id === 'login' && currentPage === 'participant-dashboard')
                    ? 'bg-white text-emerald-800 shadow-lg translate-y-0.5'
                    : 'text-emerald-50 hover:bg-emerald-700/50 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-emerald-50 hover:bg-emerald-700 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-emerald-900 border-t border-emerald-700 animate-fade-in-down origin-top">
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-right transition-all ${
                    currentPage === item.id || (item.id === 'organizer-login' && currentPage === 'organizer-dashboard') || (item.id === 'login' && currentPage === 'participant-dashboard')
                      ? 'bg-emerald-800 text-white border-r-4 border-emerald-400'
                      : 'text-emerald-100 hover:bg-emerald-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-auto border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-white">
                <Mountain size={24} />
                <h3 className="text-lg font-bold">مسيرات عمان</h3>
              </div>
              <p className="text-sm leading-relaxed">
                منصة متكاملة لإدارة وتنظيم الفعاليات الرياضية والمسيرات الجبلية في سلطنة عمان. نهدف إلى تعزيز السياحة الداخلية وتشجيع نمط الحياة الصحي.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('landing')} className="hover:text-emerald-400 transition-colors">الرئيسية</button></li>
                <li><button onClick={() => onNavigate('register')} className="hover:text-emerald-400 transition-colors">التسجيل في الفعاليات</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">عن المبادرة</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">اتصل بنا</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-emerald-500" />
                  <span>info@omanhiking.com</span>
                </div>
                <div className="flex gap-4 mt-4">
                  <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><Facebook size={18} /></a>
                  <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><Twitter size={18} /></a>
                  <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><Instagram size={18} /></a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            <p>© {new Date().getFullYear()} نظام أتمتة المسيرات السياحية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;