import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle, Clock, Users, LogOut, ChevronDown, Search, RefreshCw, AlertTriangle, Filter, Settings, Save, MessageSquare, Plus, Edit, Trash2, Image as ImageIcon, MapPin, Calendar, DollarSign, Activity, Eye, UserPlus, Phone, FileBadge, Upload, Send, FileText, Check, XCircle } from 'lucide-react';
import { api } from '../services/mockApi';
import { useToast } from './Toast';
import { Organizer, HikeEvent, Stats, User, Status, MessageTemplate, MessageLog } from '../types';
import EventDetails from './EventDetails';

interface OrganizerDashboardProps {
  organizer: Organizer;
  onLogout: () => void;
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ organizer, onLogout }) => {
  const { showToast } = useToast();
  
  // View State: 'dashboard' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor' | 'preview'>('dashboard');

  // Dashboard State
  const [myEvents, setMyEvents] = useState<HikeEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scan' | 'list' | 'broadcast' | 'settings'>('overview');
  
  // List State
  const [participants, setParticipants] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Scanner State
  const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [lastScannedUser, setLastScannedUser] = useState<any>(null);

  // Settings State
  const [apiKey, setApiKey] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [eventFormData, setEventFormData] = useState<Partial<HikeEvent>>({
    schedule: [],
    organizerIds: [],
    certificateTemplate: ''
  });
  
  // Organizer Collaboration State
  const [collaborators, setCollaborators] = useState<Omit<Organizer, 'password' | 'assignedEventIds'>[]>([]);
  const [newCollaboratorPhone, setNewCollaboratorPhone] = useState('');
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);

  // --- Broadcast State ---
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({ sent: 0, total: 0, failed: 0 });
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [previewUser, setPreviewUser] = useState<User | null>(null);

  // Initialize Data
  const loadEvents = async () => {
    const allEvents = await api.getHikes();
    // Filter events assigned to this organizer
    const assigned = allEvents.filter(e => organizer.assignedEventIds.includes(e.id));
    setMyEvents(assigned);
    // If we have events and none selected, select the first
    if (assigned.length > 0 && selectedEventId === 0) {
      setSelectedEventId(assigned[0].id);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [organizer]);

  // Fetch Stats & Participants & Settings when event changes or explicitly requested
  const refreshDashboardData = async () => {
    if (!selectedEventId) return;
    
    // 1. Get Stats
    const s = await api.getStats([selectedEventId]);
    setStats(s);

    // 2. Get Participants list
    const p = await api.getEventUsers([selectedEventId]);
    setParticipants(p);
    
    // 2b. Set preview user for broadcast
    if(p.length > 0) setPreviewUser(p[0]);

    // 3. Load Current API Key for this event
    const currentEvent = myEvents.find(e => e.id === selectedEventId);
    if (currentEvent) {
       setApiKey(currentEvent.whatsappConfig?.apiKey || '');
    }

    // 4. Load Broadcast Logs
    const logs = await api.getMessageLogs(selectedEventId);
    setMessageLogs(logs);

    // 5. Load Templates (once)
    if (templates.length === 0) {
        const t = await api.getTemplates();
        setTemplates(t);
    }
  };

  useEffect(() => {
    if (viewMode === 'dashboard') {
        refreshDashboardData();
    }
  }, [selectedEventId, myEvents, viewMode, activeTab]);


  // --- Event Editor Handlers ---
  const handleCreateNewEvent = async () => {
    setEventFormData({
      title: '',
      date: '',
      location: '',
      difficulty: 'Easy',
      price: '',
      description: '',
      longDescription: '',
      meetingPoint: '',
      distance: '',
      duration: '',
      image: '',
      schedule: [{ time: '', activity: '' }],
      organizerIds: [organizer.id], // Auto-select current organizer
      certificateTemplate: ''
    });
    // For new event, the only collaborator initially is self
    setCollaborators([{ id: organizer.id, name: organizer.name, username: organizer.username, phone: organizer.phone }]);
    setNewCollaboratorPhone('');
    setIsEditing(false);
    setViewMode('editor');
  };

  const handleEditCurrentEvent = async () => {
    const eventToEdit = myEvents.find(e => e.id === selectedEventId);
    if (!eventToEdit) return;
    
    setEventFormData({ 
        ...eventToEdit,
        organizerIds: eventToEdit.organizerIds || [organizer.id] 
    });

    // Fetch existing organizers details
    if (eventToEdit.organizerIds && eventToEdit.organizerIds.length > 0) {
        const details = await api.getOrganizersDetails(eventToEdit.organizerIds);
        setCollaborators(details);
    } else {
        setCollaborators([{ id: organizer.id, name: organizer.name, username: organizer.username, phone: organizer.phone }]);
    }
    
    setNewCollaboratorPhone('');
    setIsEditing(true);
    setViewMode('editor');
  };

  const handleEventFormChange = (field: keyof HikeEvent, value: any) => {
    setEventFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) { // 2MB Limit
              showToast('حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)', 'error');
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              handleEventFormChange('certificateTemplate', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleScheduleChange = (index: number, field: 'time' | 'activity', value: string) => {
    const newSchedule = [...(eventFormData.schedule || [])];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setEventFormData(prev => ({ ...prev, schedule: newSchedule }));
  };

  const addScheduleItem = () => {
    setEventFormData(prev => ({
      ...prev,
      schedule: [...(prev.schedule || []), { time: '', activity: '' }]
    }));
  };

  const removeScheduleItem = (index: number) => {
    setEventFormData(prev => ({
      ...prev,
      schedule: (prev.schedule || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleAddCollaborator = async () => {
      if (!newCollaboratorPhone) {
          showToast('يرجى إدخال رقم الهاتف', 'error');
          return;
      }
      if (newCollaboratorPhone.length < 8) {
          showToast('رقم الهاتف قصير جداً', 'error');
          return;
      }
      setIsAddingCollaborator(true);
      try {
          if (collaborators.some(c => c.phone === newCollaboratorPhone)) {
              showToast('هذا المنظم مضاف بالفعل', 'error');
              return;
          }
          const foundOrg = await api.findOrganizerByPhone(newCollaboratorPhone);
          if (foundOrg) {
              const newCollaborators = [...collaborators, foundOrg];
              setCollaborators(newCollaborators);
              setEventFormData(prev => ({
                  ...prev,
                  organizerIds: newCollaborators.map(c => c.id)
              }));
              setNewCollaboratorPhone('');
              showToast(`تم إضافة ${foundOrg.name}`, 'success');
          } else {
              showToast('لم يتم العثور على منظم بهذا الرقم', 'error');
          }
      } catch (e) {
          showToast('حدث خطأ أثناء البحث', 'error');
      } finally {
          setIsAddingCollaborator(false);
      }
  };

  const handleRemoveCollaborator = (orgId: string) => {
      if (orgId === organizer.id) {
          showToast('لا يمكنك حذف نفسك من قائمة المنظمين', 'error');
          return;
      }
      const newCollaborators = collaborators.filter(c => c.id !== orgId);
      setCollaborators(newCollaborators);
      setEventFormData(prev => ({
          ...prev,
          organizerIds: newCollaborators.map(c => c.id)
      }));
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title || !eventFormData.date) {
      showToast('يرجى تعبئة الحقول الأساسية (العنوان والتاريخ)', 'error');
      return;
    }
    setIsSavingEvent(true);
    try {
      if (isEditing && eventFormData.id) {
        await api.updateEvent(eventFormData as HikeEvent);
        showToast('تم تحديث الفعالية بنجاح', 'success');
      } else {
        const newEvent = await api.createEvent(eventFormData as Omit<HikeEvent, 'id'>, organizer.id);
        showToast('تم إنشاء الفعالية بنجاح', 'success');
        setSelectedEventId(newEvent.id);
      }
      await loadEvents();
      setViewMode('dashboard');
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setIsSavingEvent(false);
    }
  };

  // --- Dashboard Handlers ---
  const handleSimulateScan = async () => {
    const validIds = participants.map(u => u.id);
    const shouldBeValid = Math.random() > 0.2 && validIds.length > 0;
    
    let scannedId = 'unknown_id';
    if (shouldBeValid) {
        scannedId = validIds[Math.floor(Math.random() * validIds.length)];
    } else {
        scannedId = 'user_999_invalid'; 
    }

    setScanStatus('processing');
    try {
      const result = await api.scanUser(scannedId);
      if (result.user.eventId !== selectedEventId) {
         throw new Error('هذا المشارك مسجل في فعالية أخرى غير مصرح لك بإدارتها');
      }
      setLastScannedUser(result.user);
      setScanStatus('success');
      showToast(result.message, 'success');
      refreshDashboardData();
    } catch (error: any) {
      setScanStatus('error');
      showToast(error.message || 'رمز QR غير صالح', 'error');
    } finally {
      setTimeout(() => setScanStatus('idle'), 3000);
    }
  };

  const handleManualStatusChange = async (userId: string) => {
      try {
          await api.scanUser(userId);
          showToast('تم تحديث الحالة يدوياً', 'success');
          refreshDashboardData();
      } catch (e) {
          showToast('فشل التحديث', 'error');
      }
  };

  const handleSaveSettings = async () => {
     if (!selectedEventId) return;
     setIsSavingSettings(true);
     try {
       await api.updateEventConfig(selectedEventId, { apiKey: apiKey });
       showToast('تم حفظ إعدادات الواتساب بنجاح', 'success');
       await loadEvents();
     } catch (e) {
       showToast('فشل الحفظ', 'error');
     } finally {
       setIsSavingSettings(false);
     }
  };

  // --- Broadcast Logic ---
  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const tId = e.target.value;
      setSelectedTemplateId(tId);
      const template = templates.find(t => t.id === tId);
      if (template) {
          setMessageText(template.content);
      }
  };

  const formatMessageForUser = (text: string, user: User) => {
      if (!user) return text;
      let formatted = text.replace(/{اسم_المشارك}/g, user.fullName);
      formatted = formatted.replace(/{اسم_الفعالية}/g, user.eventName);
      
      const event = myEvents.find(ev => ev.id === user.eventId);
      if (event) {
          formatted = formatted.replace(/{التاريخ}/g, event.date);
          formatted = formatted.replace(/{الموقع}/g, event.location);
      }
      return formatted;
  };

  const handleSendBroadcast = async () => {
      if (!messageText.trim()) {
          showToast('لا يمكن إرسال رسالة فارغة', 'error');
          return;
      }
      if (participants.length === 0) {
          showToast('لا يوجد مشاركين لإرسال الرسالة لهم', 'error');
          return;
      }
      if (!window.confirm(`هل أنت متأكد من إرسال هذه الرسالة إلى ${participants.length} مشارك؟`)) {
          return;
      }

      setIsSendingBroadcast(true);
      setBroadcastProgress({ sent: 0, failed: 0, total: participants.length });
      
      // Sequential Sending Loop (One by One)
      for (let i = 0; i < participants.length; i++) {
          const user = participants[i];
          const personalizedMsg = formatMessageForUser(messageText, user);
          
          try {
              // Send Individual Message
              await api.sendWhatsAppMessage(selectedEventId, user, personalizedMsg);
              setBroadcastProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
              
              // Refresh logs to show real-time updates in table
              const logs = await api.getMessageLogs(selectedEventId);
              setMessageLogs(logs);

          } catch (error) {
              setBroadcastProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          }
      }

      setIsSendingBroadcast(false);
      showToast('تم الانتهاء من إرسال الرسائل', 'success');
  };

  const filteredParticipants = participants.filter(p => 
      p.fullName.includes(searchTerm) || 
      p.phone.includes(searchTerm) || 
      p.id.includes(searchTerm)
  );

  const selectedEvent = myEvents.find(e => e.id === selectedEventId);

  // --- RENDER ---
  if (viewMode === 'preview') {
      // (Preview code remains same)
      const previewEvent: HikeEvent = {
          id: eventFormData.id || 0,
          title: eventFormData.title || 'العنوان',
          date: eventFormData.date || new Date().toISOString(),
          location: eventFormData.location || 'الموقع',
          difficulty: eventFormData.difficulty || 'Easy',
          image: eventFormData.image || 'https://via.placeholder.com/800x400',
          description: eventFormData.description || '',
          longDescription: eventFormData.longDescription || '',
          distance: eventFormData.distance || '-',
          duration: eventFormData.duration || '-',
          price: eventFormData.price || '-',
          meetingPoint: eventFormData.meetingPoint || '-',
          schedule: eventFormData.schedule || [],
      };

      return (
          <div className="animate-fade-in bg-gray-100 min-h-screen -m-8 p-8">
              <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center bg-white p-4 rounded-xl shadow-lg border border-emerald-100">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-800">
                      <Eye size={24} />
                      معاينة الفعالية
                  </h2>
                  <button 
                    onClick={() => setViewMode('editor')}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                  >
                      إغلاق المعاينة والعودة للتحرير
                  </button>
              </div>
              <div className="pointer-events-none opacity-90">
                 <EventDetails event={previewEvent} onRegister={() => {}} onBack={() => {}} />
              </div>
          </div>
      );
  }

  if (viewMode === 'editor') {
    // (Editor code remains same)
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
        <div className="bg-emerald-800 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {isEditing ? <Edit size={24} /> : <Plus size={24} />}
            {isEditing ? `تعديل الفعالية: ${eventFormData.title}` : 'إضافة فعالية جديدة'}
          </h2>
          <button 
            onClick={() => setViewMode('dashboard')}
            className="text-emerald-100 hover:text-white hover:bg-emerald-700 p-2 rounded-lg transition-colors"
          >
             إلغاء
          </button>
        </div>
        
        <form onSubmit={handleSaveEvent} className="p-8 space-y-8">
            {/* ... (Existing form sections are preserved) ... */}
           {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">البيانات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الفعالية</label>
                <input required type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={eventFormData.title} onChange={(e) => handleEventFormChange('title', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الموقع (الولاية/المنطقة)</label>
                <div className="relative">
                  <input required type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none pl-10" 
                    value={eventFormData.location} onChange={(e) => handleEventFormChange('location', e.target.value)} />
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">التاريخ</label>
                <input required type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={eventFormData.date} onChange={(e) => handleEventFormChange('date', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">السعر</label>
                <div className="relative">
                  <input required type="text" placeholder="مثال: 5 ر.ع" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none pl-10" 
                    value={eventFormData.price} onChange={(e) => handleEventFormChange('price', e.target.value)} />
                  <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>
            </div>
            {/* ... (Collaborator section preserved) ... */}
             <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                 <h3 className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Users size={18} />
                    المنظمون المشاركون
                 </h3>
                 <div className="flex gap-2 mb-4">
                     <div className="relative flex-grow">
                        <input 
                            type="tel"
                            placeholder="أدخل رقم هاتف المنظم (مثال: 99000000)"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ltr"
                            value={newCollaboratorPhone}
                            onChange={(e) => setNewCollaboratorPhone(e.target.value.replace(/\D/g, ''))}
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     </div>
                     <button
                        type="button"
                        onClick={handleAddCollaborator}
                        disabled={isAddingCollaborator || !newCollaboratorPhone}
                        className="bg-emerald-600 text-white px-4 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                     >
                        {isAddingCollaborator ? <RefreshCw className="animate-spin" /> : 'إضافة'}
                     </button>
                 </div>
                 <div className="space-y-2">
                    {collaborators.map(org => (
                        <div key={org.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs">
                                    {org.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 flex items-center gap-1">
                                        {org.name}
                                        {org.id === organizer.id && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 rounded-full border border-emerald-100">أنت</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono">{org.phone || org.username}</p>
                                </div>
                            </div>
                            {org.id !== organizer.id && (
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveCollaborator(org.id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                    title="إزالة المنظم"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                 </div>
            </div>
          </div>
          {/* ... (Hike Details, Media, Schedule sections preserved) ... */}
           <div className="space-y-4">
             <h3 className="text-lg font-bold text-gray-800 border-b pb-2">تفاصيل المسار</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">مستوى الصعوبة</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                     value={eventFormData.difficulty} onChange={(e) => handleEventFormChange('difficulty', e.target.value)}>
                     <option value="Easy">سهل</option>
                     <option value="Medium">متوسط</option>
                     <option value="Hard">صعب</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المسافة</label>
                  <input type="text" placeholder="مثال: 5 كم" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={eventFormData.distance} onChange={(e) => handleEventFormChange('distance', e.target.value)} />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المدة المتوقعة</label>
                  <input type="text" placeholder="مثال: 3-4 ساعات" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={eventFormData.duration} onChange={(e) => handleEventFormChange('duration', e.target.value)} />
               </div>
               <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نقطة التجمع</label>
                  <input required type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={eventFormData.meetingPoint} onChange={(e) => handleEventFormChange('meetingPoint', e.target.value)} />
               </div>
             </div>
          </div>
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-gray-800 border-b pb-2">الوصف والصور</h3>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رابط الصورة (URL)</label>
                <div className="relative">
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none pl-10" 
                    value={eventFormData.image} onChange={(e) => handleEventFormChange('image', e.target.value)} />
                  <ImageIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
             </div>
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                 <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <FileBadge size={18} />
                    تصميم الشهادة المخصص (اختياري)
                 </label>
                 <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    يمكنك رفع صورة تصميم الشهادة (فارغة). سيقوم النظام بكتابة اسم المشارك تلقائياً في <strong>منتصف الصورة</strong>.
                    <br />
                    يفضل أن تكون الصورة بمقاس A4 عرضي (Landscape).
                 </p>
                 <div className="relative border-2 border-dashed border-yellow-300 rounded-lg p-6 bg-white hover:bg-yellow-50 transition-colors text-center cursor-pointer">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleTemplateUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {eventFormData.certificateTemplate ? (
                        <div className="relative">
                           <img src={eventFormData.certificateTemplate} alt="Template Preview" className="max-h-40 mx-auto rounded shadow-sm border" />
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="bg-black/50 text-white px-3 py-1 rounded text-xs">معاينة: اسم المشارك سيظهر هنا</span>
                           </div>
                           <button 
                             type="button" 
                             className="mt-2 text-xs text-red-500 underline z-10 relative"
                             onClick={(e) => {
                                 e.preventDefault();
                                 handleEventFormChange('certificateTemplate', '');
                             }}
                           >
                             حذف التصميم
                           </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                           <Upload size={24} />
                           <span className="text-sm font-medium">اضغط لرفع صورة الشهادة</span>
                        </div>
                    )}
                 </div>
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">وصف مختصر (يظهر في القائمة)</label>
                <textarea rows={2} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={eventFormData.description} onChange={(e) => handleEventFormChange('description', e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">وصف تفصيلي (يظهر في صفحة التفاصيل)</label>
                <textarea rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={eventFormData.longDescription} onChange={(e) => handleEventFormChange('longDescription', e.target.value)} />
             </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800">الجدول الزمني</h3>
                <button type="button" onClick={addScheduleItem} className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:bg-emerald-50 px-3 py-1 rounded">
                   <Plus size={16} /> إضافة وقت
                </button>
             </div>
             <div className="space-y-3">
                {eventFormData.schedule?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                     <div className="w-32">
                        <input type="text" placeholder="الوقت (07:00 AM)" className="w-full p-2 border border-gray-300 rounded text-sm"
                           value={item.time} onChange={(e) => handleScheduleChange(idx, 'time', e.target.value)} />
                     </div>
                     <div className="flex-grow">
                        <input type="text" placeholder="النشاط" className="w-full p-2 border border-gray-300 rounded text-sm"
                           value={item.activity} onChange={(e) => handleScheduleChange(idx, 'activity', e.target.value)} />
                     </div>
                     <button type="button" onClick={() => removeScheduleItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                        <Trash2 size={18} />
                     </button>
                  </div>
                ))}
                {eventFormData.schedule?.length === 0 && (
                   <div className="text-center text-gray-400 py-4">لا يوجد جدول زمني مضاف</div>
                )}
             </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-100">
             <button type="button" onClick={() => setViewMode('preview')} className="px-6 bg-blue-100 text-blue-800 font-bold py-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2">
                 <Eye size={20} /> معاينة
             </button>
             <button type="submit" disabled={isSavingEvent} className="flex-1 bg-emerald-800 text-white font-bold py-3 rounded-lg hover:bg-emerald-900 transition-colors flex justify-center items-center gap-2">
               {isSavingEvent ? <RefreshCw className="animate-spin" /> : <Save />} {isEditing ? 'حفظ التعديلات' : 'إنشاء الفعالية'}
             </button>
             <button type="button" onClick={() => setViewMode('dashboard')} className="px-6 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
               إلغاء
             </button>
          </div>
        </form>
      </div>
    );
  }

  // --- Normal Dashboard View ---

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* ... (Existing top bar logic) ... */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center text-white font-bold">
            {organizer.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-gray-800">أهلاً، {organizer.name}</h1>
            <p className="text-xs text-gray-500">منظم معتمد</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleCreateNewEvent} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm">
             <Plus size={18} /> فعالية جديدة
          </button>

          {myEvents.length > 0 && (
            <div className="relative flex-grow md:flex-grow-0 group">
               <select className="appearance-none w-full md:w-64 bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-emerald-500"
                 value={selectedEventId} onChange={(e) => setSelectedEventId(Number(e.target.value))}>
                 {myEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
               </select>
               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                 <ChevronDown size={16} />
               </div>
            </div>
          )}
          
          {selectedEventId > 0 && (
            <button onClick={handleEditCurrentEvent} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100" title="تعديل الفعالية الحالية">
              <Edit size={20} />
            </button>
          )}

          <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="تسجيل الخروج">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-lg shadow p-1 border border-gray-100 overflow-x-auto">
        {[
            { id: 'overview', label: 'نظرة عامة', icon: <CheckCircle size={18} /> },
            { id: 'scan', label: 'الماسح الضوئي', icon: <Camera size={18} /> },
            { id: 'list', label: 'قائمة المشاركين', icon: <Users size={18} /> },
            { id: 'broadcast', label: 'المراسلة', icon: <MessageSquare size={18} /> }, // New Tab
            { id: 'settings', label: 'إعدادات الفعالية', icon: <Settings size={18} /> },
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-bold whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id ? 'bg-emerald-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                {tab.icon}
                {tab.label}
            </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-blue-500">
                        <p className="text-gray-500 text-sm font-bold">إجمالي المسجلين</p>
                        <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats?.totalRegistered || 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-orange-500">
                        <p className="text-gray-500 text-sm font-bold">على المسار (Started)</p>
                        <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats?.totalStarted || 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-green-500">
                        <p className="text-gray-500 text-sm font-bold">أكملوا المسير</p>
                        <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats?.totalCompleted || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center">
                       تفاصيل الفعالية الحالية
                       {selectedEvent && (
                          <button onClick={handleEditCurrentEvent} className="text-xs text-blue-600 hover:underline">
                             تعديل البيانات
                          </button>
                       )}
                    </h3>
                    {selectedEvent ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                <span className="text-gray-500">اسم الفعالية:</span>
                                <span className="font-bold">{selectedEvent.title}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                <span className="text-gray-500">الموقع:</span>
                                <span className="font-bold">{selectedEvent.location}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                <span className="text-gray-500">التاريخ:</span>
                                <span className="font-bold">{selectedEvent.date}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                <span className="text-gray-500">نقطة التجمع:</span>
                                <span className="font-bold">{selectedEvent.meetingPoint}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                <span className="text-gray-500">السعر:</span>
                                <span className="font-bold">{selectedEvent.price}</span>
                            </div>
                             <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                <span className="text-gray-500">عدد المنظمين:</span>
                                <span className="font-bold">{selectedEvent.organizerIds?.length || 1}</span>
                            </div>
                        </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        لا توجد فعاليات. قم بإنشاء فعالية جديدة للبدء.
                      </div>
                    )}
                </div>
            </div>
          )}

          {/* TAB: SCANNER */}
          {activeTab === 'scan' && (
             // (Existing scanner code preserved)
             <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center">
                 <h2 className="text-xl font-bold mb-2 text-gray-800">نقطة الفرز الإلكتروني</h2>
                 <p className="text-sm text-gray-500 mb-8">يتم تسجيل الدخول والخروج تلقائياً عند مسح الكود</p>
                 <div className="relative w-full max-w-sm aspect-square bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center mb-6 ring-8 ring-gray-100">
                    {scanStatus === 'idle' && (
                    <>
                        <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-3xl animate-pulse"></div>
                        <div className="w-64 h-1 bg-red-500 shadow-[0_0_15px_red] absolute top-1/2 -translate-y-1/2 animate-scan-line"></div>
                        <Camera size={64} className="text-gray-700 mb-4" />
                        <p className="text-gray-400 font-medium">جاهز للمسح...</p>
                    </>
                    )}
                    {scanStatus === 'processing' && (
                    <div className="flex flex-col items-center text-white">
                        <RefreshCw className="animate-spin mb-4" size={48} />
                        <span className="font-bold text-lg">جاري التحقق...</span>
                    </div>
                    )}
                    {scanStatus === 'success' && (
                    <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center text-white animate-fade-in">
                        <CheckCircle size={80} className="mb-4 drop-shadow-md" />
                        <span className="text-2xl font-bold drop-shadow-md">تم بنجاح!</span>
                    </div>
                    )}
                    {scanStatus === 'error' && (
                    <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center text-white animate-fade-in">
                        <AlertTriangle size={80} className="mb-4 drop-shadow-md" />
                        <span className="text-2xl font-bold drop-shadow-md">خطأ!</span>
                    </div>
                    )}
                    <div className="absolute bottom-6 z-10">
                        <button onClick={handleSimulateScan} disabled={scanStatus !== 'idle'} className="bg-white/20 backdrop-blur-md border border-white/50 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-white/30 transition-all">
                            [ 📷 محاكاة الكاميرا ]
                        </button>
                    </div>
                 </div>
                 {lastScannedUser && (
                    <div className="w-full max-w-sm bg-emerald-50 border border-emerald-100 rounded-xl p-4 animate-slide-up text-right">
                        <div className="flex items-center gap-3 mb-3 border-b border-emerald-200 pb-3">
                            <div className="w-10 h-10 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center font-bold">
                                {lastScannedUser.fullName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{lastScannedUser.fullName}</h3>
                                <p className="text-xs text-gray-500">{lastScannedUser.id}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">الحالة الجديدة:</span>
                            <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                                lastScannedUser.status === Status.STARTED ? 'bg-blue-100 text-blue-700' : 
                                lastScannedUser.status === Status.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                            }`}>
                                {lastScannedUser.status === Status.STARTED ? 'بدأ المسير' : 'مكتمل'}
                            </span>
                        </div>
                    </div>
                 )}
            </div>
          )}

          {/* TAB: LIST */}
          {activeTab === 'list' && (
             // (Existing list code preserved)
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50">
                    <div className="relative w-full md:w-64">
                        <input type="text" placeholder="بحث بالاسم أو الهاتف..." className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Filter size={16} />
                        <span>العدد: {filteredParticipants.length}</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-100 text-gray-600 font-bold">
                            <tr>
                                <th className="p-4">الاسم</th>
                                <th className="p-4">رقم الهاتف</th>
                                <th className="p-4">الفئة</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredParticipants.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800">{user.fullName}</td>
                                    <td className="p-4 font-mono text-gray-600" dir="ltr">{user.phone}</td>
                                    <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">{user.role}</span></td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === Status.REGISTERED ? 'bg-gray-100 text-gray-600' : user.status === Status.STARTED ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{user.status === Status.REGISTERED ? 'مسجل' : user.status === Status.STARTED ? 'جاري المسير' : 'مكتمل'}</span></td>
                                    <td className="p-4 text-center">
                                        {user.status !== Status.COMPLETED ? (
                                            <button onClick={() => handleManualStatusChange(user.id)} className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 text-xs transition-colors">{user.status === Status.REGISTERED ? 'تسجيل دخول' : 'إنهاء'}</button>
                                        ) : (
                                            <span className="text-emerald-600 font-bold text-xs flex items-center justify-center gap-1"><CheckCircle size={14} /> تم</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          )}

          {/* TAB: BROADCAST (NEW) */}
          {activeTab === 'broadcast' && selectedEvent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                  {/* Left: Compose */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <MessageSquare className="text-emerald-600" size={20} />
                          إنشاء رسالة جماعية
                      </h2>

                      {/* Template Selector */}
                      <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">اختر نموذج جاهز (اختياري)</label>
                          <select 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                            value={selectedTemplateId}
                            onChange={handleTemplateSelect}
                          >
                             <option value="">-- رسالة جديدة --</option>
                             {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                          </select>
                      </div>

                      {/* Text Area */}
                      <div className="mb-4 flex-grow">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">نص الرسالة</label>
                          <textarea 
                             className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                             placeholder="اكتب رسالتك هنا... يمكنك استخدام المتغيرات مثل {اسم_المشارك}"
                             value={messageText}
                             onChange={(e) => setMessageText(e.target.value)}
                          />
                          <div className="flex gap-2 mt-2 text-xs text-emerald-600 font-mono flex-wrap">
                              <span className="bg-emerald-50 px-2 py-1 rounded cursor-pointer hover:bg-emerald-100" onClick={() => setMessageText(prev => prev + '{اسم_المشارك}')}>{`{اسم_المشارك}`}</span>
                              <span className="bg-emerald-50 px-2 py-1 rounded cursor-pointer hover:bg-emerald-100" onClick={() => setMessageText(prev => prev + '{اسم_الفعالية}')}>{`{اسم_الفعالية}`}</span>
                              <span className="bg-emerald-50 px-2 py-1 rounded cursor-pointer hover:bg-emerald-100" onClick={() => setMessageText(prev => prev + '{التاريخ}')}>{`{التاريخ}`}</span>
                              <span className="bg-emerald-50 px-2 py-1 rounded cursor-pointer hover:bg-emerald-100" onClick={() => setMessageText(prev => prev + '{الموقع}')}>{`{الموقع}`}</span>
                          </div>
                      </div>

                      {/* Send Button & Progress */}
                      <div className="mt-auto">
                          {isSendingBroadcast ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="flex justify-between text-sm font-bold text-blue-800 mb-2">
                                      <span>جاري الإرسال...</span>
                                      <span>{broadcastProgress.sent + broadcastProgress.failed} / {broadcastProgress.total}</span>
                                  </div>
                                  <div className="w-full bg-blue-200 rounded-full h-2.5">
                                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((broadcastProgress.sent + broadcastProgress.failed) / broadcastProgress.total) * 100}%` }}></div>
                                  </div>
                                  <p className="text-xs text-blue-600 mt-2 text-center">يرجى عدم إغلاق الصفحة حتى اكتمال الإرسال</p>
                              </div>
                          ) : (
                              <button 
                                onClick={handleSendBroadcast}
                                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2"
                              >
                                  <Send size={18} />
                                  إرسال إلى {participants.length} مشارك
                              </button>
                          )}
                      </div>
                  </div>

                  {/* Right: Preview & Logs */}
                  <div className="flex flex-col gap-6 h-full">
                      {/* Live Preview */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase flex items-center gap-2">
                              <Eye size={16} /> معاينة الرسالة
                          </h3>
                          <div className="bg-[#e5ddd5] p-4 rounded-lg relative min-h-[120px]">
                              <div className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-800 relative inline-block max-w-[90%]">
                                  <p className="whitespace-pre-line">
                                      {previewUser ? formatMessageForUser(messageText || '...', previewUser) : '...'}
                                  </p>
                                  <span className="text-[10px] text-gray-400 absolute bottom-1 right-2">
                                      {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                              </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 text-center">مثال للمشارك: {previewUser?.fullName || 'غير محدد'}</p>
                      </div>

                      {/* Logs Table */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 flex-grow overflow-hidden flex flex-col">
                           <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
                               <span>سجل الرسائل المرسلة</span>
                               <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{messageLogs.length}</span>
                           </div>
                           <div className="overflow-y-auto flex-grow max-h-[300px]">
                               <table className="w-full text-sm text-right">
                                   <thead className="bg-gray-50 text-gray-500 text-xs sticky top-0">
                                       <tr>
                                           <th className="p-3">المستلم</th>
                                           <th className="p-3">نص الرسالة</th>
                                           <th className="p-3">الحالة</th>
                                           <th className="p-3">الوقت</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-gray-100">
                                       {messageLogs.length === 0 ? (
                                           <tr><td colSpan={4} className="p-8 text-center text-gray-400">لا يوجد سجل رسائل لهذا الفعالية</td></tr>
                                       ) : (
                                           messageLogs.map(log => (
                                               <tr key={log.id}>
                                                   <td className="p-3 font-medium text-gray-800">
                                                       {log.recipientName}
                                                       <div className="text-xs text-gray-400 font-mono">{log.recipientPhone}</div>
                                                   </td>
                                                   <td className="p-3 text-gray-600 truncate max-w-[150px]" title={log.messageContent}>{log.messageContent}</td>
                                                   <td className="p-3">
                                                       {log.status === 'Sent' && <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><Check size={12} /> تم التسليم</span>}
                                                       {log.status === 'Failed' && <span className="flex items-center gap-1 text-red-600 text-xs font-bold"><XCircle size={12} /> فشل</span>}
                                                   </td>
                                                   <td className="p-3 text-xs text-gray-400 font-mono">
                                                       {new Date(log.timestamp).toLocaleTimeString()}
                                                   </td>
                                               </tr>
                                           ))
                                       )}
                                   </tbody>
                               </table>
                           </div>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && selectedEvent && (
             // (Existing settings code preserved)
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-fade-in">
                <div className="max-w-xl">
                   <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                     <MessageSquare className="text-emerald-600" size={24} />
                     إعدادات تكامل واتساب (Integration)
                   </h2>
                   <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800 leading-relaxed">
                     <p>يمكنك ربط هذه الفعالية بحساب <strong>TextMeBot</strong> الخاص بك لإرسال التذاكر والشهادات من رقمك الخاص.</p>
                     <p className="mt-2 font-bold opacity-80">إذا تركت الحقل فارغاً، سيتم استخدام بوابة النظام الافتراضية.</p>
                   </div>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">TextMeBot API Key</label>
                       <input type="text" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="Example: 5a2b3c4d5e6f7g8h9i0j" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                     </div>
                     <div className="pt-4">
                        <button onClick={handleSaveSettings} disabled={isSavingSettings} className="bg-emerald-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-900 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                           <Save size={20} /> حفظ الإعدادات
                        </button>
                     </div>
                   </div>
                </div>
             </div>
          )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;