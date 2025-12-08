/**
 * Customer Logic
 * منطق صفحة العميل
 */

let firebaseHelper = null;
let notificationManager = null;
let allClinics = [];

/**
 * Initialize Customer Page
 * تهيئة صفحة العميل
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    firebaseHelper = new FirebaseHelper();
    notificationManager = new NotificationManager();

    // Load clinics
    await loadClinics();

    // Add character counter
    document.getElementById('complaintText').addEventListener('input', updateCharCount);
  } catch (error) {
    console.error('Error initializing customer page:', error);
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
    const trackingClinic = document.getElementById('trackingClinic');

    trackingClinic.innerHTML = '<option value="">-- اختر عيادة --</option>';

    allClinics.forEach(clinic => {
      const option = document.createElement('option');
      option.value = clinic.id;
      option.textContent = clinic.name;
      trackingClinic.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading clinics:', error);
    notificationManager.showError('خطأ في تحميل العيادات');
  }
}

/**
 * Update Queue Status
 * تحديث حالة الطابور
 */
async function updateQueueStatus() {
  try {
    const clinicId = document.getElementById('trackingClinic').value;
    
    if (!clinicId) {
      document.getElementById('queueStatus').style.display = 'none';
      return;
    }

    const clinic = await firebaseHelper.getClinic(clinicId);
    
    if (clinic) {
      document.getElementById('currentQueueNumber').textContent = ArabicNumbers.toArabic(clinic.currentNumber);
      
      const lastCallTime = clinic.lastCallTime 
        ? new Date(clinic.lastCallTime.toDate?.() || clinic.lastCallTime).toLocaleTimeString('ar-EG')
        : 'لم يتم النداء بعد';
      
      document.getElementById('queueInfo').textContent = `آخر نداء: ${lastCallTime}`;
      document.getElementById('queueStatus').style.display = 'block';

      // Listen to clinic changes
      firebaseHelper.onClinicChange(clinicId, (updatedClinic) => {
        document.getElementById('currentQueueNumber').textContent = ArabicNumbers.toArabic(updatedClinic.currentNumber);
      });
    }
  } catch (error) {
    console.error('Error updating queue status:', error);
    notificationManager.showError('خطأ في تحديث الحالة');
  }
}

/**
 * Register Ticket
 * تسجيل التذكرة
 */
async function registerTicket() {
  try {
    const clinicId = document.getElementById('trackingClinic').value;
    const ticketNumber = parseInt(document.getElementById('ticketNumber').value);
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;

    if (!clinicId || !ticketNumber) {
      notificationManager.showWarning('⚠️ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const clinic = allClinics.find(c => c.id === clinicId);

    // Create customer record
    const db = firebase.firestore();
    const customerRef = await db.collection('customers').add({
      clinicId,
      clinicName: clinic.name,
      ticketNumber,
      email: email || null,
      phone: phone || null,
      registeredAt: new Date(),
      notified: false
    });

    // Create notification
    await firebaseHelper.createNotification({
      userId: customerRef.id,
      type: 'ticket_registered',
      message: `تم تسجيل تذكرتك برقم ${ArabicNumbers.toArabic(ticketNumber)} في عيادة ${clinic.name}`,
      clinicId,
      clinicName: clinic.name,
      ticketNumber,
      createdAt: new Date()
    });

    notificationManager.showSuccess('✅ تم تسجيل التذكرة بنجاح');
    
    // Clear form
    document.getElementById('ticketNumber').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
  } catch (error) {
    console.error('Error registering ticket:', error);
    notificationManager.showError('❌ خطأ في تسجيل التذكرة');
  }
}

/**
 * Update Character Count
 * تحديث عدد الأحرف
 */
function updateCharCount() {
  const text = document.getElementById('complaintText').value;
  const count = text.length;
  document.getElementById('charCount').textContent = `${count} / 140`;

  if (count < 140) {
    document.getElementById('charCount').style.color = '#dc2626';
  } else {
    document.getElementById('charCount').style.color = '#16a34a';
  }
}

/**
 * Submit Complaint
 * إرسال الشكوى
 */
async function submitComplaint() {
  try {
    const name = document.getElementById('complaintName').value;
    const phone = document.getElementById('complaintPhone').value;
    const email = document.getElementById('complaintEmail').value;
    const type = document.getElementById('complaintType').value;
    const text = document.getElementById('complaintText').value;
    const notes = document.getElementById('complaintNotes').value;

    // Validation
    if (!type) {
      notificationManager.showWarning('⚠️ يرجى اختيار نوع الشكوى');
      return;
    }

    if (text.length < 140) {
      notificationManager.showWarning('⚠️ النص يجب أن يكون 140 حرف على الأقل');
      return;
    }

    // Create complaint
    const complaintId = await firebaseHelper.createComplaint({
      name: name || 'عميل مجهول',
      phone: phone || null,
      email: email || null,
      type,
      text,
      notes: notes || null,
      status: 'جديدة',
      createdAt: new Date()
    });

    // Show success message
    document.getElementById('successMessage').style.display = 'block';

    // Clear form
    document.getElementById('complaintName').value = '';
    document.getElementById('complaintPhone').value = '';
    document.getElementById('complaintEmail').value = '';
    document.getElementById('complaintType').value = '';
    document.getElementById('complaintText').value = '';
    document.getElementById('complaintNotes').value = '';
    document.getElementById('charCount').textContent = '0 / 140';

    // Hide success message after 5 seconds
    setTimeout(() => {
      document.getElementById('successMessage').style.display = 'none';
    }, 5000);

    notificationManager.showSuccess('✅ تم إرسال الشكوى بنجاح');
  } catch (error) {
    console.error('Error submitting complaint:', error);
    notificationManager.showError('❌ خطأ في إرسال الشكوى');
  }
}
