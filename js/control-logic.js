/**
 * Control Logic
 * منطق لوحة التحكم
 */

let firebaseHelper = null;
let audioManager = null;
let notificationManager = null;
let currentClinic = null;
let allClinics = [];

/**
 * Initialize Control Page
 * تهيئة صفحة التحكم
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    firebaseHelper = new FirebaseHelper();
    audioManager = new AudioManager();
    notificationManager = new NotificationManager();

    // Load clinics
    await loadClinics();
  } catch (error) {
    console.error('Error initializing control page:', error);
    notificationManager.showError('خطأ في تحميل الصفحة');
  }
});

/**
 * Load Clinics
 * تحميل العيادات
 */
async function loadClinics() {
  try {
    allClinics = await firebaseHelper.getClinics();
    const clinicSelect = document.getElementById('clinicSelect');
    const transferClinic = document.getElementById('transferClinic');

    clinicSelect.innerHTML = '<option value="">-- اختر عيادة --</option>';
    transferClinic.innerHTML = '<option value="">-- اختر عيادة --</option>';

    allClinics.forEach(clinic => {
      const option = document.createElement('option');
      option.value = clinic.id;
      option.textContent = clinic.name;
      clinicSelect.appendChild(option.cloneNode(true));
      transferClinic.appendChild(option.cloneNode(true));
    });
  } catch (error) {
    console.error('Error loading clinics:', error);
    notificationManager.showError('خطأ في تحميل العيادات');
  }
}

/**
 * Select Clinic
 * اختيار عيادة
 */
function selectClinic() {
  const clinicId = document.getElementById('clinicSelect').value;
  if (clinicId) {
    currentClinic = allClinics.find(c => c.id === clinicId);
  }
}

/**
 * Authenticate Clinic
 * مصادقة العيادة
 */
async function authenticateClinic() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    const password = document.getElementById('clinicPassword').value;
    if (!password) {
      notificationManager.showWarning('⚠️ يرجى إدخال كلمة السر');
      return;
    }

    if (password !== currentClinic.password) {
      notificationManager.showError('❌ كلمة السر غير صحيحة');
      return;
    }

    // Show status section
    document.getElementById('statusSection').style.display = 'block';
    updateClinicStatus();

    // Listen to clinic changes
    firebaseHelper.onClinicChange(currentClinic.id, updateClinicStatus);

    notificationManager.showSuccess('✅ تم الدخول بنجاح');
  } catch (error) {
    console.error('Error authenticating clinic:', error);
    notificationManager.showError('❌ خطأ في المصادقة');
  }
}

/**
 * Update Clinic Status
 * تحديث حالة العيادة
 */
function updateClinicStatus(clinic = currentClinic) {
  if (!clinic) return;

  document.getElementById('currentClinicName').textContent = clinic.name;
  document.getElementById('currentNumber').textContent = ArabicNumbers.toArabic(clinic.currentNumber);
  
  const lastCallTime = clinic.lastCallTime 
    ? new Date(clinic.lastCallTime.toDate?.() || clinic.lastCallTime).toLocaleTimeString('ar-EG')
    : 'لم يتم النداء';
  
  document.getElementById('lastCallTime').textContent = lastCallTime;
}

/**
 * Next Customer
 * العميل التالي
 */
async function nextCustomer() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    const nextNumber = currentClinic.currentNumber + 1;
    await firebaseHelper.updateClinicQueue(currentClinic.id, nextNumber);
    await audioManager.playQueueAnnouncement(nextNumber, currentClinic.id);

    notificationManager.showSuccess('✅ تم النداء بنجاح');
  } catch (error) {
    console.error('Error calling next customer:', error);
    notificationManager.showError('❌ خطأ في النداء');
  }
}

/**
 * Previous Customer
 * العميل السابق
 */
async function previousCustomer() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    if (currentClinic.currentNumber > 0) {
      const previousNumber = currentClinic.currentNumber - 1;
      await firebaseHelper.updateClinicQueue(currentClinic.id, previousNumber);
      await audioManager.playQueueAnnouncement(previousNumber, currentClinic.id);

      notificationManager.showSuccess('✅ تم النداء بنجاح');
    } else {
      notificationManager.showWarning('⚠️ لا يوجد عميل سابق');
    }
  } catch (error) {
    console.error('Error calling previous customer:', error);
    notificationManager.showError('❌ خطأ في النداء');
  }
}

/**
 * Repeat Call
 * تكرار النداء
 */
async function repeatCall() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    if (currentClinic.currentNumber > 0) {
      await audioManager.playQueueAnnouncement(currentClinic.currentNumber, currentClinic.id);
      notificationManager.showSuccess('✅ تم تكرار النداء');
    } else {
      notificationManager.showWarning('⚠️ لم يتم نداء أي عميل بعد');
    }
  } catch (error) {
    console.error('Error repeating call:', error);
    notificationManager.showError('❌ خطأ في تكرار النداء');
  }
}

/**
 * Reset Clinic
 * تصفير العيادة
 */
async function resetClinic() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    if (confirm('هل أنت متأكد من تصفير العيادة؟')) {
      await firebaseHelper.updateClinicQueue(currentClinic.id, 0);
      notificationManager.showSuccess('✅ تم تصفير العيادة');
    }
  } catch (error) {
    console.error('Error resetting clinic:', error);
    notificationManager.showError('❌ خطأ في التصفير');
  }
}

/**
 * Show Call Specific
 * عرض نموذج نداء معين
 */
function showCallSpecific() {
  document.getElementById('callSpecificSection').style.display = 'block';
}

/**
 * Hide Call Specific
 * إخفاء نموذج نداء معين
 */
function hideCallSpecific() {
  document.getElementById('callSpecificSection').style.display = 'none';
}

/**
 * Call Specific Customer
 * نداء عميل معين
 */
async function callSpecificCustomer() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    const customerNumber = parseInt(document.getElementById('specificCustomerNumber').value);
    if (!customerNumber || customerNumber < 1) {
      notificationManager.showWarning('⚠️ يرجى إدخال رقم صحيح');
      return;
    }

    await firebaseHelper.updateClinicQueue(currentClinic.id, customerNumber);
    await audioManager.playQueueAnnouncement(customerNumber, currentClinic.id);

    notificationManager.showSuccess('✅ تم النداء بنجاح');
    hideCallSpecific();
    document.getElementById('specificCustomerNumber').value = '';
  } catch (error) {
    console.error('Error calling specific customer:', error);
    notificationManager.showError('❌ خطأ في النداء');
  }
}

/**
 * Show Emergency
 * عرض نموذج الطوارئ
 */
function showEmergency() {
  document.getElementById('emergencySection').style.display = 'block';
}

/**
 * Hide Emergency
 * إخفاء نموذج الطوارئ
 */
function hideEmergency() {
  document.getElementById('emergencySection').style.display = 'none';
}

/**
 * Send Emergency
 * إرسال تنبيه طوارئ
 */
async function sendEmergency() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    // Play emergency sound
    await audioManager.speakText('تنبيه طوارئ في عيادة ' + currentClinic.name);

    // Show emergency notification
    notificationManager.showEmergencyNotification('🚨 تنبيه طوارئ في عيادة ' + currentClinic.name);

    // Create notification in database
    await firebaseHelper.createNotification({
      type: 'emergency',
      clinicId: currentClinic.id,
      clinicName: currentClinic.name,
      message: 'تنبيه طوارئ',
      createdAt: new Date()
    });

    notificationManager.showSuccess('✅ تم إرسال تنبيه الطوارئ');
    hideEmergency();
  } catch (error) {
    console.error('Error sending emergency:', error);
    notificationManager.showError('❌ خطأ في إرسال التنبيه');
  }
}

/**
 * Transfer Customer
 * تحويل عميل
 */
async function transferCustomer() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    const customerNumber = parseInt(document.getElementById('transferCustomerNumber').value);
    const targetClinicId = document.getElementById('transferClinic').value;

    if (!customerNumber || !targetClinicId) {
      notificationManager.showWarning('⚠️ يرجى ملء جميع الحقول');
      return;
    }

    const targetClinic = allClinics.find(c => c.id === targetClinicId);
    if (!targetClinic) {
      notificationManager.showWarning('⚠️ العيادة المقصودة غير موجودة');
      return;
    }

    // Update target clinic queue
    const nextNumber = targetClinic.currentNumber + 1;
    await firebaseHelper.updateClinicQueue(targetClinicId, nextNumber);

    // Play announcement
    await audioManager.playQueueAnnouncement(nextNumber, targetClinicId);

    notificationManager.showSuccess('✅ تم تحويل العميل بنجاح');
    document.getElementById('transferCustomerNumber').value = '';
    document.getElementById('transferClinic').value = '';
  } catch (error) {
    console.error('Error transferring customer:', error);
    notificationManager.showError('❌ خطأ في التحويل');
  }
}

/**
 * Pause Clinic
 * إيقاف العيادة
 */
async function pauseClinic() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    const db = firebase.firestore();
    await db.collection('clinics').doc(currentClinic.id).update({
      status: 'متوقفة',
      updatedAt: new Date()
    });

    notificationManager.showSuccess('✅ تم إيقاف العيادة');
  } catch (error) {
    console.error('Error pausing clinic:', error);
    notificationManager.showError('❌ خطأ في الإيقاف');
  }
}

/**
 * Resume Clinic
 * استئناف العيادة
 */
async function resumeClinic() {
  try {
    if (!currentClinic) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    const db = firebase.firestore();
    await db.collection('clinics').doc(currentClinic.id).update({
      status: 'نشطة',
      updatedAt: new Date()
    });

    notificationManager.showSuccess('✅ تم استئناف العيادة');
  } catch (error) {
    console.error('Error resuming clinic:', error);
    notificationManager.showError('❌ خطأ في الاستئناف');
  }
}

/**
 * Logout
 * تسجيل الخروج
 */
function logout() {
  document.getElementById('statusSection').style.display = 'none';
  document.getElementById('clinicSelect').value = '';
  document.getElementById('clinicPassword').value = '';
  currentClinic = null;
  notificationManager.showSuccess('✅ تم تسجيل الخروج');
}
