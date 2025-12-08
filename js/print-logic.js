/**
 * Print Logic
 * منطق صفحة الطباعة
 */

let firebaseHelper = null;
let notificationManager = null;
let allClinics = [];

/**
 * Initialize Print Page
 * تهيئة صفحة الطباعة
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    firebaseHelper = new FirebaseHelper();
    notificationManager = new NotificationManager();

    // Load clinics
    await loadClinics();
  } catch (error) {
    console.error('Error initializing print page:', error);
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
 * Generate Tickets
 * إنشاء التذاكر
 */
function generateTickets() {
  try {
    const clinicId = document.getElementById('clinic').value;
    const fromNumber = parseInt(document.getElementById('fromNumber').value);
    const toNumber = parseInt(document.getElementById('toNumber').value);

    if (!clinicId) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    if (!fromNumber || !toNumber || fromNumber > toNumber) {
      notificationManager.showWarning('⚠️ يرجى إدخال أرقام صحيحة');
      return;
    }

    const clinic = allClinics.find(c => c.id === clinicId);
    const ticketGrid = document.getElementById('ticketGrid');
    ticketGrid.innerHTML = '';

    const today = new Date().toLocaleDateString('ar-EG');

    for (let i = fromNumber; i <= toNumber; i++) {
      const ticket = document.createElement('div');
      ticket.className = 'ticket';
      ticket.innerHTML = `
        <div class="ticket-center">${clinic.name}</div>
        <div class="ticket-number">${ArabicNumbers.toArabic(i)}</div>
        <div class="ticket-date">${today}</div>
      `;
      ticketGrid.appendChild(ticket);
    }

    notificationManager.showSuccess('✅ تم إنشاء التذاكر بنجاح');
  } catch (error) {
    console.error('Error generating tickets:', error);
    notificationManager.showError('❌ خطأ في إنشاء التذاكر');
  }
}
