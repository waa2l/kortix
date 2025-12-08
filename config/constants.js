/**
 * Global Constants and Configuration
 * الثوابت والإعدادات العامة
 */

const CONSTANTS = {
  // Center Information
  CENTER_NAME: 'غرب المطار',
  CENTER_NAME_EN: 'West Airport',
  
  // Clinic Configuration
  TOTAL_CLINICS: 10,
  TOTAL_SCREENS: 5,
  DEFAULT_CLINICS: [
    { id: 1, name: 'طب الأسرة', nameEn: 'Family Medicine' },
    { id: 2, name: 'الأطفال', nameEn: 'Pediatrics' },
    { id: 3, name: 'النساء والتوليد', nameEn: 'Obstetrics & Gynecology' },
    { id: 4, name: 'الجراحة', nameEn: 'Surgery' },
    { id: 5, name: 'الأسنان', nameEn: 'Dentistry' },
    { id: 6, name: 'العيون', nameEn: 'Ophthalmology' },
    { id: 7, name: 'الأنف والأذن والحنجرة', nameEn: 'ENT' },
    { id: 8, name: 'الجلدية', nameEn: 'Dermatology' },
    { id: 9, name: 'القلب', nameEn: 'Cardiology' },
    { id: 10, name: 'الأعصاب', nameEn: 'Neurology' }
  ],
  
  // Audio Configuration
  AUDIO_PATHS: {
    ding: 'audio/ding.mp3',
    numbers: 'audio/numbers/',
    clinics: 'audio/clinics/',
    instant: 'audio/instant/'
  },
  
  // Media Configuration
  MEDIA_PATHS: {
    videos: 'media/videos/',
    images: 'media/images/'
  },
  
  // Notification Settings
  NOTIFICATION_DURATION: 5000, // milliseconds
  NOTIFICATION_SOUND_DURATION: 10000, // milliseconds
  
  // Announcement Settings
  ANNOUNCEMENT_SPEED: 50, // pixels per second
  ANNOUNCEMENT_DURATION: 10000, // milliseconds
  
  // TTS Settings
  TTS_LANGUAGE: 'ar-SA',
  TTS_RATE: 1.0,
  TTS_PITCH: 1.0,
  
  // Booking Settings
  MORNING_SHIFT_START: 8, // 8 AM
  MORNING_SHIFT_END: 14, // 2 PM
  EVENING_SHIFT_START: 14, // 2 PM
  EVENING_SHIFT_END: 20, // 8 PM
  
  // Doctor Request Types
  REQUEST_TYPES: [
    { id: 1, name: 'إجازة اعتيادية', nameEn: 'Annual Leave' },
    { id: 2, name: 'إجازة عارضة', nameEn: 'Emergency Leave' },
    { id: 3, name: 'بدل راحة', nameEn: 'Rest Compensation' },
    { id: 4, name: 'مأمورية', nameEn: 'Official Mission' },
    { id: 5, name: 'إذن صباحي', nameEn: 'Morning Permission' },
    { id: 6, name: 'إذن مسائي', nameEn: 'Evening Permission' },
    { id: 7, name: 'مأمورية تدريب', nameEn: 'Training Mission' },
    { id: 8, name: 'إجازة مرضى', nameEn: 'Sick Leave' },
    { id: 9, name: 'تأمين صحي', nameEn: 'Health Insurance' },
    { id: 10, name: 'خط سير', nameEn: 'Travel Authorization' },
    { id: 11, name: 'أخرى', nameEn: 'Other' }
  ],
  
  // Chronic Diseases
  CHRONIC_DISEASES: [
    { id: 1, name: 'سكر', nameEn: 'Diabetes' },
    { id: 2, name: 'ضغط', nameEn: 'Hypertension' },
    { id: 3, name: 'أورام', nameEn: 'Cancer' },
    { id: 4, name: 'كبد', nameEn: 'Liver Disease' },
    { id: 5, name: 'كلى', nameEn: 'Kidney Disease' },
    { id: 6, name: 'أخرى', nameEn: 'Other' }
  ],
  
  // Gender Types
  GENDER_TYPES: [
    { id: 1, name: 'ذكر', nameEn: 'Male' },
    { id: 2, name: 'أنثى', nameEn: 'Female' },
    { id: 3, name: 'طفل', nameEn: 'Child' }
  ],
  
  // Complaint Types
  COMPLAINT_TYPES: [
    { id: 1, name: 'شكوى', nameEn: 'Complaint' },
    { id: 2, name: 'اقتراح', nameEn: 'Suggestion' }
  ],
  
  // Consultation Status
  CONSULTATION_STATUS: [
    { id: 1, name: 'مفتوحة', nameEn: 'Open' },
    { id: 2, name: 'مغلقة', nameEn: 'Closed' },
    { id: 3, name: 'قيد الانتظار', nameEn: 'Pending' }
  ],
  
  // Booking Status
  BOOKING_STATUS: [
    { id: 1, name: 'مؤكدة', nameEn: 'Confirmed' },
    { id: 2, name: 'قيد الانتظار', nameEn: 'Pending' },
    { id: 3, name: 'ملغاة', nameEn: 'Cancelled' },
    { id: 4, name: 'مكتملة', nameEn: 'Completed' }
  ],
  
  // Request Status
  REQUEST_STATUS: [
    { id: 1, name: 'قيد الانتظار', nameEn: 'Pending' },
    { id: 2, name: 'موافق عليها', nameEn: 'Approved' },
    { id: 3, name: 'مرفوضة', nameEn: 'Rejected' }
  ],
  
  // Clinic Status
  CLINIC_STATUS: [
    { id: 1, name: 'نشطة', nameEn: 'Active' },
    { id: 2, name: 'متوقفة', nameEn: 'Inactive' }
  ],
  
  // Colors for UI
  COLORS: {
    primary: '#1e40af',
    secondary: '#64748b',
    success: '#16a34a',
    warning: '#ea580c',
    danger: '#dc2626',
    info: '#0284c7',
    light: '#f1f5f9',
    dark: '#0f172a'
  },
  
  // Cache Settings
  CACHE_DURATION: 3600000, // 1 hour in milliseconds
  CACHE_ENABLED: true,
  
  // Version
  VERSION: '1.0.0',
  RELEASE_DATE: '2024-01-01'
};

// Export for use in other modules
window.CONSTANTS = CONSTANTS;
