/**
 * Booking Logic
 * منطق صفحة حجز الموعد
 */

let firebaseHelper = null;
let notificationManager = null;
let allClinics = [];

/**
 * Initialize Booking Page
 * تهيئة صفحة حجز الموعد
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    firebaseHelper = new FirebaseHelper();
    notificationManager = new NotificationManager();

    // Load clinics
    await loadClinics();

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
  } catch (error) {
    console.error('Error initializing booking page:', error);
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
    const clinicSelect = document.getElementById('clinic');

    clinicSelect.innerHTML = '<option value="">-- اختر عيادة --</option>';

    allClinics.forEach(clinic => {
      const option = document.createElement('option');
      option.value = clinic.id;
      option.textContent = clinic.name;
      clinicSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading clinics:', error);
    notificationManager.showError('خطأ في تحميل العيادات');
  }
}

/**
 * Submit Booking
 * إرسال الحجز
 */
async function submitBooking(event) {
  event.preventDefault();

  try {
    const fullName = document.getElementById('fullName').value;
    const nationalId = document.getElementById('nationalId').value;
    const phone = document.getElementById('phone').value;
    const clinicId = document.getElementById('clinic').value;
    const bookingDate = document.getElementById('bookingDate').value;
    const shift = document.getElementById('shift').value;
    const visitReason = document.getElementById('visitReason').value;

    // Validation
    if (!fullName || !nationalId || !phone || !clinicId || !bookingDate || !shift || !visitReason) {
      notificationManager.showWarning('⚠️ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (nationalId.length !== 14) {
      notificationManager.showWarning('⚠️ الرقم القومي يجب أن يكون 14 رقم');
      return;
    }

    if (phone.length !== 11) {
      notificationManager.showWarning('⚠️ رقم الهاتف يجب أن يكون 11 رقم');
      return;
    }

    const clinic = allClinics.find(c => c.id === clinicId);

    // Create booking
    const bookingId = await firebaseHelper.createBooking({
      fullName,
      nationalId,
      phone,
      clinicId,
      clinicName: clinic.name,
      bookingDate,
      shift,
      visitReason,
      status: 'مؤكدة',
      createdAt: new Date()
    });

    notificationManager.showSuccess('✅ تم حجز الموعد بنجاح');

    // Show confirmation details
    const shiftText = shift === 'morning' ? 'صباحي (8 ص - 2 م)' : 'مسائي (2 م - 8 م)';
    const bookingDate_formatted = new Date(bookingDate).toLocaleDateString('ar-EG');
    
    notificationManager.showModal(
      'تأكيد الحجز',
      `
        <div style="text-align: right;">
          <p><strong>الاسم:</strong> ${fullName}</p>
          <p><strong>العيادة:</strong> ${clinic.name}</p>
          <p><strong>التاريخ:</strong> ${bookingDate_formatted}</p>
          <p><strong>الشيفت:</strong> ${shiftText}</p>
          <p><strong>سبب الزيارة:</strong> ${visitReason}</p>
          <p style="color: #0284c7; margin-top: 1rem;">
            <strong>رقم الحجز:</strong> ${bookingId}
          </p>
        </div>
      `,
      [
        { text: 'حسناً', type: 'primary', onclick: 'closeModal()' }
      ]
    );

    // Clear form
    document.getElementById('fullName').value = '';
    document.getElementById('nationalId').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('clinic').value = '';
    document.getElementById('bookingDate').value = '';
    document.getElementById('shift').value = '';
    document.getElementById('visitReason').value = '';
  } catch (error) {
    console.error('Error submitting booking:', error);
    notificationManager.showError('❌ خطأ في حجز الموعد');
  }
}

/**
 * Close Modal
 * إغلاق النافذة المشروطة
 */
function closeModal() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => modal.remove());
}
