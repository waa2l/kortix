/**
 * Firebase Helper Functions
 * دوال مساعدة للتعامل مع Firebase
 */

class FirebaseHelper {
  constructor() {
    this.db = window.firebaseServices?.db;
    this.auth = window.firebaseServices?.auth;
    this.realtimeDb = window.firebaseServices?.realtimeDb;
  }

  /**
   * Initialize Firebase collections and default data
   * تهيئة مجموعات Firebase والبيانات الافتراضية
   */
  async initializeDatabase() {
    try {
      // Check if settings already exist
      const settingsDoc = await this.db.collection('settings').doc('general').get();
      
      if (!settingsDoc.exists) {
        // Create default settings
        await this.createDefaultSettings();
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Create default settings
   * إنشاء الإعدادات الافتراضية
   */
  async createDefaultSettings() {
    const defaultSettings = {
      centerName: CONSTANTS.CENTER_NAME,
      centerNameEn: CONSTANTS.CENTER_NAME_EN,
      totalClinics: CONSTANTS.TOTAL_CLINICS,
      totalScreens: CONSTANTS.TOTAL_SCREENS,
      announcementSpeed: CONSTANTS.ANNOUNCEMENT_SPEED,
      notificationDuration: CONSTANTS.NOTIFICATION_DURATION,
      ttsSpeed: CONSTANTS.TTS_RATE,
      audioPath: CONSTANTS.AUDIO_PATHS.numbers,
      mediaPath: CONSTANTS.MEDIA_PATHS.videos,
      instantAudioPath: CONSTANTS.AUDIO_PATHS.instant,
      cacheEnabled: CONSTANTS.CACHE_ENABLED,
      cacheDuration: CONSTANTS.CACHE_DURATION,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: CONSTANTS.VERSION,
      releaseDate: CONSTANTS.RELEASE_DATE
    };

    await this.db.collection('settings').doc('general').set(defaultSettings);
    
    // Create admin list
    await this.db.collection('settings').doc('admins').set({
      adminIds: [],
      createdAt: new Date()
    });

    // Create default clinics
    for (const clinic of CONSTANTS.DEFAULT_CLINICS) {
      await this.db.collection('clinics').doc(String(clinic.id)).set({
        id: clinic.id,
        name: clinic.name,
        nameEn: clinic.nameEn,
        currentNumber: 0,
        status: 'نشطة',
        statusEn: 'Active',
        screenIds: [],
        password: '',
        lastCallTime: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create queue subcollection
      await this.db.collection('clinics').doc(String(clinic.id)).collection('queue').doc('current').set({
        number: 0,
        lastUpdated: new Date()
      });
    }

    // Create default screens
    for (let i = 1; i <= CONSTANTS.TOTAL_SCREENS; i++) {
      await this.db.collection('screens').doc(String(i)).set({
        id: i,
        name: `شاشة ${i}`,
        nameEn: `Screen ${i}`,
        password: '',
        assignedClinics: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return true;
  }

  /**
   * Get all clinics
   * الحصول على جميع العيادات
   */
  async getClinics() {
    try {
      const snapshot = await this.db.collection('clinics').orderBy('id').get();
      const clinics = [];
      
      snapshot.forEach(doc => {
        clinics.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return clinics;
    } catch (error) {
      console.error('Error getting clinics:', error);
      throw error;
    }
  }

  /**
   * Get clinic by ID
   * الحصول على عيادة بواسطة المعرف
   */
  async getClinic(clinicId) {
    try {
      const doc = await this.db.collection('clinics').doc(String(clinicId)).get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting clinic:', error);
      throw error;
    }
  }

  /**
   * Update clinic queue number
   * تحديث رقم الطابور للعيادة
   */
  async updateClinicQueue(clinicId, newNumber) {
    try {
      await this.db.collection('clinics').doc(String(clinicId)).update({
        currentNumber: newNumber,
        lastCallTime: new Date(),
        updatedAt: new Date()
      });

      // Update queue subcollection
      await this.db.collection('clinics').doc(String(clinicId)).collection('queue').doc('current').set({
        number: newNumber,
        lastUpdated: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error updating clinic queue:', error);
      throw error;
    }
  }

  /**
   * Get all screens
   * الحصول على جميع الشاشات
   */
  async getScreens() {
    try {
      const snapshot = await this.db.collection('screens').orderBy('id').get();
      const screens = [];
      
      snapshot.forEach(doc => {
        screens.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return screens;
    } catch (error) {
      console.error('Error getting screens:', error);
      throw error;
    }
  }

  /**
   * Get screen by ID
   * الحصول على شاشة بواسطة المعرف
   */
  async getScreen(screenId) {
    try {
      const doc = await this.db.collection('screens').doc(String(screenId)).get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting screen:', error);
      throw error;
    }
  }

  /**
   * Create booking
   * إنشاء حجز موعد
   */
  async createBooking(bookingData) {
    try {
      const bookingRef = await this.db.collection('bookings').add({
        ...bookingData,
        status: 'قيد الانتظار',
        statusEn: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return bookingRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Create complaint
   * إنشاء شكوى أو اقتراح
   */
  async createComplaint(complaintData) {
    try {
      const complaintRef = await this.db.collection('complaints').add({
        ...complaintData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return complaintRef.id;
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  }

  /**
   * Create consultation
   * إنشاء استشارة
   */
  async createConsultation(consultationData) {
    try {
      const consultationRef = await this.db.collection('consultations').add({
        ...consultationData,
        status: 'مفتوحة',
        statusEn: 'Open',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return consultationRef.id;
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  }

  /**
   * Get settings
   * الحصول على الإعدادات
   */
  async getSettings() {
    try {
      const doc = await this.db.collection('settings').doc('general').get();
      
      if (doc.exists) {
        return doc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  /**
   * Update settings
   * تحديث الإعدادات
   */
  async updateSettings(settingsData) {
    try {
      await this.db.collection('settings').doc('general').update({
        ...settingsData,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  /**
   * Listen to clinic changes in real-time
   * الاستماع إلى تغييرات العيادة في الوقت الفعلي
   */
  onClinicChange(clinicId, callback) {
    try {
      return this.db.collection('clinics').doc(String(clinicId)).onSnapshot(doc => {
        if (doc.exists) {
          callback({
            id: doc.id,
            ...doc.data()
          });
        }
      });
    } catch (error) {
      console.error('Error listening to clinic changes:', error);
      throw error;
    }
  }

  /**
   * Listen to all clinics changes in real-time
   * الاستماع إلى تغييرات جميع العيادات في الوقت الفعلي
   */
  onAllClinicsChange(callback) {
    try {
      return this.db.collection('clinics').orderBy('id').onSnapshot(snapshot => {
        const clinics = [];
        snapshot.forEach(doc => {
          clinics.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(clinics);
      });
    } catch (error) {
      console.error('Error listening to all clinics changes:', error);
      throw error;
    }
  }

  /**
   * Create notification
   * إنشاء إشعار
   */
  async createNotification(notificationData) {
    try {
      const notificationRef = await this.db.collection('notifications').add({
        ...notificationData,
        createdAt: new Date(),
        read: false
      });

      return notificationRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get user role
   * الحصول على دور المستخدم
   */
  async getUserRole(uid) {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      
      if (doc.exists) {
        return doc.data().role;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
  }
}

// Export for use in other modules
window.FirebaseHelper = FirebaseHelper;
