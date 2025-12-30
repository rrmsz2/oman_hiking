import { User, RegistrationPayload, Role, Status, Stats, HikeEvent, Organizer, WhatsAppConfig, MessageTemplate, MessageLog } from '../types';

// Default System API (Fallback)
const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  apiKey: 'SYSTEM_DEFAULT_KEY_123',
  baseUrl: 'http://api.textmebot.com/send.php'
};

// ... (Existing UPCOMING_HIKES, MOCK_ORGANIZERS, users arrays remain the same)
export const UPCOMING_HIKES: HikeEvent[] = [
  {
    id: 1,
    title: 'مسار وادي شاب',
    date: '2023-11-15',
    location: 'صور، جنوب الشرقية',
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1598605272254-16f0c0ecdfa5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    description: 'استمتع بالمشي بين برك المياه العذبة والشلالات الخلابة في أحد أجمل أودية عمان.',
    longDescription: 'يعتبر وادي شاب من أجمل الوجهات السياحية في سلطنة عمان، حيث يجمع بين المياه العذبة الفيروزية والمنحدرات الصخرية الشاهقة. يتضمن المسار المشي والسباحة للوصول إلى الكهف المخفي والشلال الداخلي. هذه المغامرة مثالية لمحبي الطبيعة والسباحة.',
    distance: '5 كم (ذهاب وعودة)',
    duration: '3-4 ساعات',
    price: '5 ر.ع',
    meetingPoint: 'مواقف وادي شاب العامة',
    schedule: [
      { time: '07:00 AM', activity: 'التجمع في نقطة البداية' },
      { time: '07:30 AM', activity: 'بدء المسير وعبور القوارب' },
      { time: '09:00 AM', activity: 'الوصول لمنطقة السباحة والكهف' },
      { time: '10:30 AM', activity: 'العودة لنقطة البداية' },
      { time: '11:30 AM', activity: 'نهاية الفعالية وتوزيع الشهادات' }
    ],
    whatsappConfig: {
      apiKey: 'CUSTOM_WADI_SHAB_KEY_999'
    },
    organizerIds: ['org_1', 'org_3'] // Example: Managed by Saeed & Super Admin
  },
  {
    id: 2,
    title: 'قمة جبل شمس',
    date: '2023-12-01',
    location: 'الحمراء، الداخلية',
    difficulty: 'Hard',
    image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    description: 'تحدي الوصول إلى أعلى قمة في عمان والاستمتاع بإطلالة الشرفة المذهلة.',
    longDescription: 'جبل شمس هو أعلى قمة جبلية في عمان، ويعرف بـ "جراند كانيون" العرب. المسار يمتد على طول حافة الوادي السحيق ويوفر مناظر خلابة لا مثيل لها. يتطلب هذا المسار لياقة بدنية عالية واستعداداً جيداً للتغيرات في درجات الحرارة.',
    distance: '9 كم',
    duration: '5-6 ساعات',
    price: '10 ر.ع',
    meetingPoint: 'منتجع جبل شمس',
    schedule: [
      { time: '06:00 AM', activity: 'التجمع والتسجيل' },
      { time: '06:30 AM', activity: 'انطلاق المسير (مسار الشرفة)' },
      { time: '09:30 AM', activity: 'الوصول لنقطة القرية المهجورة (الراحة)' },
      { time: '12:30 PM', activity: 'العودة لنقطة البداية' },
      { time: '01:00 PM', activity: 'الغداء الجماعي (اختياري)' }
    ],
    organizerIds: ['org_2', 'org_3']
  },
  {
    id: 3,
    title: 'ممشى ريام الساحلي',
    date: '2023-11-20',
    location: 'مطرح، مسقط',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1590418606746-018840f9cd0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    description: 'مسار خفيف وممتع يطل على بحر عمان مع مناظر تاريخية لمدينة مطرح.',
    longDescription: 'مسار تاريخي يربط بين منطقة ريام ومطرح القديمة، يوفر إطلالات بانورامية على البحر والميناء وسوق مطرح. المسار ممهد جزئياً ومناسب للعائلات والمبتدئين. فرصة رائعة لالتقاط الصور والتعرف على تاريخ المنطقة.',
    distance: '3 كم',
    duration: '1.5 ساعة',
    price: 'مجاناً',
    meetingPoint: 'حديقة ريام',
    schedule: [
      { time: '04:00 PM', activity: 'التجمع في حديقة ريام' },
      { time: '04:15 PM', activity: 'بداية المشي' },
      { time: '05:00 PM', activity: 'الوصول لمطل مطرح ومشاهدة الغروب' },
      { time: '05:45 PM', activity: 'النزول باتجاه الكورنيش' }
    ],
    organizerIds: ['org_3']
  }
];

const MOCK_ORGANIZERS: Organizer[] = [
  {
    id: 'org_1',
    name: 'سعيد العامري',
    phone: '99000001',
    username: 'admin_wadi',
    password: '123',
    assignedEventIds: [1]
  },
  {
    id: 'org_2',
    name: 'فريق التحدي',
    phone: '99000002',
    username: 'admin_shams',
    password: '123',
    assignedEventIds: [2]
  },
  {
    id: 'org_3',
    name: 'المدير العام',
    phone: '99000003',
    username: 'super_admin',
    password: '123',
    assignedEventIds: [1, 2, 3]
  }
];

// ... (calculateAge, users array remain same)
const calculateAge = (birthDate: string): string => {
  if (!birthDate) return '';
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age.toString();
};

let users: User[] = [
  {
    id: 'user_1',
    eventId: 1,
    eventName: 'مسار وادي شاب',
    fullName: 'أحمد الحارثي',
    phone: '96899000000',
    role: Role.INDIVIDUAL,
    status: Status.REGISTERED,
    governorate: 'مسقط',
    wilayat: 'السيب',
    village: 'الموالح',
    birthDate: '1998-01-01',
    age: '25',
    gender: 'Male',
    healthStatus: 'لائق صحياً'
  },
  {
    id: 'user_3_history',
    eventId: 3,
    eventName: 'ممشى ريام الساحلي',
    fullName: 'أحمد الحارثي',
    phone: '96899000000',
    role: Role.INDIVIDUAL,
    status: Status.COMPLETED,
    checkInTime: '2023-11-20T16:00:00',
    checkOutTime: '2023-11-20T17:45:00',
    governorate: 'مسقط',
    wilayat: 'السيب',
    village: 'الموالح',
    birthDate: '1998-01-01',
    age: '25',
    gender: 'Male',
    healthStatus: 'لائق صحياً'
  },
  {
    id: 'user_2',
    eventId: 2,
    eventName: 'قمة جبل شمس',
    fullName: 'سالم المعمري',
    phone: '96899111111',
    role: Role.LEADER,
    status: Status.STARTED,
    checkInTime: new Date().toISOString(),
    groupId: 'group_1',
    governorate: 'شمال الباطنة',
    wilayat: 'صحار',
    village: 'الهمبار',
    birthDate: '1993-05-15',
    age: '30',
    gender: 'Male',
    healthStatus: 'لائق صحياً',
    teamName: 'فريق التحدي'
  }
];

// --- Broadcast Data ---
const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: 't1',
    title: 'تذكير بالموعد',
    content: 'الفاضل {اسم_المشارك}،\nنذكركم بأن موعد {اسم_الفعالية} سيكون بتاريخ {التاريخ} في {الموقع}.\nنرجو التواجد قبل الموعد بنصف ساعة.\nنتمنى لكم تجربة ممتعة!'
  },
  {
    id: 't2',
    title: 'تعليمات السلامة',
    content: 'عزيزي {اسم_المشارك}،\nلضمان سلامتكم في {اسم_الفعالية}، يرجى الالتزام بالتعليمات التالية:\n1. ارتداء حذاء مناسب.\n2. إحضار كمية كافية من الماء.\n3. اتباع تعليمات المنظمين.\nشكراً لتعاونكم.'
  },
  {
    id: 't3',
    title: 'شكر وتقدير',
    content: 'شكراً لك {اسم_المشارك} على مشاركتك معنا في {اسم_الفعالية}.\nلقد سررنا بتواجدك ونتمنى أن نراك في مغامرات قادمة.\nتحياتنا، فريق مسيرات عمان.'
  }
];

let messageLogs: MessageLog[] = [];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Get API Config for an Event
const getWhatsAppConfig = (eventId?: number): WhatsAppConfig => {
  if (!eventId) return DEFAULT_WHATSAPP_CONFIG;
  const event = UPCOMING_HIKES.find(e => e.id === eventId);
  return event?.whatsappConfig || DEFAULT_WHATSAPP_CONFIG;
};

// ... (formatPhone remains same)
function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, ''); 
  if (p.startsWith('968')) return p;
  if (p.length === 8) return '968' + p;
  return p;
}

export const api = {
  getHikes: async (): Promise<HikeEvent[]> => {
    return UPCOMING_HIKES;
  },

  getAllOrganizers: async (): Promise<Omit<Organizer, 'password' | 'assignedEventIds'>[]> => {
    await delay(500);
    return MOCK_ORGANIZERS.map(({ id, name, username, phone }) => ({ id, name, username, phone }));
  },

  findOrganizerByPhone: async (phone: string): Promise<Omit<Organizer, 'password' | 'assignedEventIds'> | null> => {
    await delay(600);
    const org = MOCK_ORGANIZERS.find(o => o.phone === phone);
    if (org) {
        return { id: org.id, name: org.name, username: org.username, phone: org.phone };
    }
    return null;
  },

  getOrganizersDetails: async (ids: string[]): Promise<Omit<Organizer, 'password' | 'assignedEventIds'>[]> => {
    await delay(400);
    return MOCK_ORGANIZERS
        .filter(o => ids.includes(o.id))
        .map(({ id, name, username, phone }) => ({ id, name, username, phone }));
  },

  loginOrganizer: async (username: string, password: string): Promise<Organizer> => {
    await delay(800);
    const org = MOCK_ORGANIZERS.find(o => o.username === username && o.password === password);
    if (!org) throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    return org;
  },

  updateEventConfig: async (eventId: number, config: WhatsAppConfig): Promise<void> => {
    await delay(500);
    const eventIndex = UPCOMING_HIKES.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      UPCOMING_HIKES[eventIndex].whatsappConfig = config;
      console.log(`[System] Updated API Config for Event ${eventId}:`, config);
    }
  },

  createEvent: async (eventData: Omit<HikeEvent, 'id'>, currentOrganizerId: string): Promise<HikeEvent> => {
    await delay(1000);
    const newId = Math.max(...UPCOMING_HIKES.map(e => e.id), 0) + 1;
    const orgIds = new Set(eventData.organizerIds || []);
    orgIds.add(currentOrganizerId);
    const newEvent: HikeEvent = { ...eventData, id: newId, organizerIds: Array.from(orgIds) };
    UPCOMING_HIKES.push(newEvent);
    MOCK_ORGANIZERS.forEach(org => {
        if (newEvent.organizerIds?.includes(org.id)) {
            if (!org.assignedEventIds.includes(newId)) {
                org.assignedEventIds.push(newId);
            }
        }
    });
    return newEvent;
  },

  updateEvent: async (event: HikeEvent): Promise<HikeEvent> => {
    await delay(1000);
    const index = UPCOMING_HIKES.findIndex(e => e.id === event.id);
    if (index === -1) throw new Error('الفعالية غير موجودة');
    UPCOMING_HIKES[index] = event;
    MOCK_ORGANIZERS.forEach(org => {
        org.assignedEventIds = org.assignedEventIds.filter(id => id !== event.id);
    });
    if (event.organizerIds && event.organizerIds.length > 0) {
        MOCK_ORGANIZERS.forEach(org => {
            if (event.organizerIds?.includes(org.id)) {
                org.assignedEventIds.push(event.id);
            }
        });
    }
    return event;
  },

  sendOTP: async (phone: string, eventId?: number): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    const config = getWhatsAppConfig(eventId);
    console.log(`[TextMeBot] Using Key: [${config.apiKey}] -> Sending OTP to ${phone}: 1234`);
    return { success: true, message: 'تم إرسال رمز التحقق بنجاح' };
  },

  verifyOTP: async (phone: string, otp: string): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    if (otp === '1234') {
      return { success: true, message: 'تم التحقق بنجاح' };
    }
    throw new Error('رمز التحقق غير صحيح');
  },

  getParticipantHistory: async (phone: string): Promise<User[]> => {
    await delay(1000);
    const formattedPhone = formatPhone(phone);
    return users.filter(u => u.phone === formattedPhone).reverse();
  },

  getEventUsers: async (eventIds: number[]): Promise<User[]> => {
     await delay(500);
     return users.filter(u => eventIds.includes(u.eventId));
  },

  register: async (payload: RegistrationPayload): Promise<{ success: boolean; qrCodes: string[] }> => {
    await delay(1500); 
    const config = getWhatsAppConfig(payload.eventId);
    const isGroup = payload.type === 'group';
    const leaderId = `user_${Date.now()}`;
    const groupId = isGroup ? `group_${Date.now()}` : undefined;
    const teamName = isGroup ? payload.teamDetails?.name : undefined;
    const teamLogo = isGroup ? payload.teamDetails?.logo : undefined;

    const leaderUser: User = {
      id: leaderId,
      eventId: payload.eventId,
      eventName: payload.eventName,
      fullName: payload.leader.fullName,
      phone: formatPhone(payload.leader.phone),
      role: isGroup ? Role.LEADER : Role.INDIVIDUAL,
      status: Status.REGISTERED,
      groupId,
      governorate: payload.leader.governorate,
      wilayat: payload.leader.wilayat,
      village: payload.leader.village,
      birthDate: payload.leader.birthDate,
      age: calculateAge(payload.leader.birthDate),
      gender: payload.leader.gender,
      healthStatus: payload.leader.healthStatus,
      teamName: teamName,
      teamLogo: teamLogo,
      notes: payload.leader.notes
    };
    users.push(leaderUser);
    const generatedQRCodes = [leaderId];
    if (isGroup && payload.members.length > 0) {
      payload.members.forEach((member, index) => {
        const memberId = `user_${Date.now()}_${index}`;
        users.push({
          id: memberId,
          eventId: payload.eventId,
          eventName: payload.eventName,
          fullName: member.fullName,
          phone: member.phone ? formatPhone(member.phone) : leaderUser.phone, 
          role: Role.MEMBER,
          status: Status.REGISTERED,
          groupId,
          governorate: leaderUser.governorate, 
          wilayat: leaderUser.wilayat,
          village: leaderUser.village,
          birthDate: member.birthDate,
          age: calculateAge(member.birthDate),
          gender: member.gender,
          healthStatus: member.healthStatus,
          teamName: teamName,
          teamLogo: teamLogo
        });
        generatedQRCodes.push(memberId);
      });
    }
    console.log(`[TextMeBot] Using Key: [${config.apiKey}] -> Sending Welcome & QR to ${leaderUser.phone} for event: ${payload.eventName}`);
    return { success: true, qrCodes: generatedQRCodes };
  },

  scanUser: async (userId: string): Promise<{ success: boolean; user: User; message: string }> => {
    await delay(800);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    const user = users[userIndex];
    const config = getWhatsAppConfig(user.eventId);
    let message = '';
    let updatedUser = { ...user };

    if (user.status === Status.REGISTERED) {
      updatedUser.status = Status.STARTED;
      updatedUser.checkInTime = new Date().toISOString();
      message = `تم تسجيل دخول: ${user.fullName} (${user.eventName})`;
    } else if (user.status === Status.STARTED) {
      updatedUser.status = Status.COMPLETED;
      updatedUser.checkOutTime = new Date().toISOString();
      message = `تم تسجيل خروج وإكمال المسار: ${user.fullName}`;
      console.log(`[System] Generating Certificate for ${user.fullName}...`);
      console.log(`[TextMeBot] Using Key: [${config.apiKey}] -> Sending Certificate to ${user.phone}`);
    } else {
      throw new Error(`هذا المستخدم أكمل المسار مسبقاً (${user.fullName})`);
    }
    users[userIndex] = updatedUser;
    return { success: true, user: updatedUser, message };
  },

  getStats: async (eventIds?: number[]): Promise<Stats> => {
    await delay(500);
    const targetUsers = eventIds 
      ? users.filter(u => eventIds.includes(u.eventId))
      : users;
    return {
      totalRegistered: targetUsers.length,
      totalStarted: targetUsers.filter(u => u.status === Status.STARTED || u.status === Status.COMPLETED).length,
      totalCompleted: targetUsers.filter(u => u.status === Status.COMPLETED).length
    };
  },

  // --- Broadcast Methods ---
  getTemplates: async (): Promise<MessageTemplate[]> => {
    return MOCK_TEMPLATES;
  },

  // Simulates sending ONE message (used in the loop on frontend)
  sendWhatsAppMessage: async (eventId: number, recipient: User, message: string): Promise<MessageLog> => {
     // Simulate variable delay (0.5s to 1.5s)
     const randomDelay = Math.floor(Math.random() * 1000) + 500;
     await delay(randomDelay);

     const config = getWhatsAppConfig(eventId);
     const success = Math.random() > 0.1; // 10% simulated failure rate

     console.log(`[TextMeBot Broadcast] Key:[${config.apiKey}] To:${recipient.phone} Msg:"${message.substring(0, 20)}..." Success:${success}`);

     const logEntry: MessageLog = {
         id: `msg_${Date.now()}_${Math.random()}`,
         eventId,
         recipientName: recipient.fullName,
         recipientPhone: recipient.phone,
         messageContent: message,
         status: success ? 'Sent' : 'Failed',
         timestamp: new Date().toISOString()
     };
     
     // Store in memory
     messageLogs.unshift(logEntry);
     return logEntry;
  },

  getMessageLogs: async (eventId: number): Promise<MessageLog[]> => {
     await delay(300);
     return messageLogs.filter(m => m.eventId === eventId);
  }
};