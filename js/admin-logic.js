/**
 * Admin Logic
 * منطق لوحة الإدارة
 */

let currentUser = null;
let firebaseHelper = null;
let notificationManager = null;
let audioManager = null;

/**
 * Initialize Admin Page
 * تهيئة صفحة الإدارة
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Initialize managers
    firebaseHelper = new FirebaseHelper();
    notificationManager = new NotificationManager();
    audioManager = new AudioManager();

    // Check authentication
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        document.getElementById('userName').textContent = user.email;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userAvatar').textContent = user.email.charAt(0).toUpperCase();
        
        // Load data
        await loadDashboard();
        await loadClinics();
        await loadScreens();
        await loadDoctors();
        await loadUsers();
      } else {
        window.location.href = 'login.html';
      }
    });
  } catch (error) {
    console.error('Error initializing admin page:', error);
    notificationManager.showError('خطأ في تحميل الصفحة');
  }
});

/**
 * Show Section
 * عرض قسم معين
 */
function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.admin-content');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Remove active class from all menu links
  const menuLinks = document.querySelectorAll('.menu-link');
  menuLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Show selected section
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }

  // Add active class to clicked menu link
  event.target.classList.add('active');
}

/**
 * Load Dashboard
 * تحميل لوحة التحكم
 */
async function loadDashboard() {
  try {
    const db = firebase.firestore();

    // Get clinics count
    const clinicsSnapshot = await db.collection('clinics').get();
    document.getElementById('clinicsCount').textContent = clinicsSnapshot.size;

    // Get doctors count
    const doctorsSnapshot = await db.collection('doctors').get();
    document.getElementById('doctorsCount').textContent = doctorsSnapshot.size;

    // Get screens count
    const screensSnapshot = await db.collection('screens').get();
    document.getElementById('screensCount').textContent = screensSnapshot.size;

    // Get bookings count
    const bookingsSnapshot = await db.collection('bookings').get();
    document.getElementById('bookingsCount').textContent = bookingsSnapshot.size;
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

/**
 * Load Clinics
 * تحميل العيادات
 */
async function loadClinics() {
  try {
    const clinics = await firebaseHelper.getClinics();
    const tbody = document.getElementById('clinicsTableBody');
    const callClinicSelect = document.getElementById('callClinic');
    const emergencyClinicSelect = document.getElementById('emergencyClinic');
    const resetClinicSelect = document.getElementById('resetClinic');

    tbody.innerHTML = '';
    callClinicSelect.innerHTML = '<option value="">-- اختر عيادة --</option>';
    emergencyClinicSelect.innerHTML = '<option value="">-- اختر عيادة --</option>';
    resetClinicSelect.innerHTML = '<option value="">-- جميع العيادات --</option>';

    clinics.forEach(clinic => {
      // Add to table
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ArabicNumbers.toArabic(clinic.id)}</td>
        <td>${clinic.name}</td>
        <td>${ArabicNumbers.toArabic(clinic.currentNumber)}</td>
        <td>${clinic.status}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="editClinic('${clinic.id}')">تعديل</button>
            <button class="action-btn action-btn-delete" onclick="deleteClinic('${clinic.id}')">حذف</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);

      // Add to selects
      const option = document.createElement('option');
      option.value = clinic.id;
      option.textContent = clinic.name;
      callClinicSelect.appendChild(option.cloneNode(true));
      emergencyClinicSelect.appendChild(option.cloneNode(true));
      resetClinicSelect.appendChild(option.cloneNode(true));
    });
  } catch (error) {
    console.error('Error loading clinics:', error);
    notificationManager.showError('خطأ في تحميل العيادات');
  }
}

/**
 * Load Screens
 * تحميل الشاشات
 */
async function loadScreens() {
  try {
    const screens = await firebaseHelper.getScreens();
    const tbody = document.getElementById('screensTableBody');

    tbody.innerHTML = '';

    screens.forEach(screen => {
      const row = document.createElement('tr');
      const clinicsText = screen.assignedClinics?.length > 0 
        ? screen.assignedClinics.join(', ') 
        : 'لا توجد عيادات';
      
      row.innerHTML = `
        <td>${ArabicNumbers.toArabic(screen.id)}</td>
        <td>${screen.name}</td>
        <td>${clinicsText}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="editScreen('${screen.id}')">تعديل</button>
            <button class="action-btn action-btn-delete" onclick="deleteScreen('${screen.id}')">حذف</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading screens:', error);
    notificationManager.showError('خطأ في تحميل الشاشات');
  }
}

/**
 * Load Doctors
 * تحميل الأطباء
 */
async function loadDoctors() {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('doctors').get();
    const tbody = document.getElementById('doctorsTableBody');

    tbody.innerHTML = '';

    snapshot.forEach(doc => {
      const doctor = doc.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ArabicNumbers.toArabic(doctor.id)}</td>
        <td>${doctor.name}</td>
        <td>${doctor.specialty}</td>
        <td>${doctor.clinic}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="editDoctor('${doc.id}')">تعديل</button>
            <button class="action-btn action-btn-delete" onclick="deleteDoctor('${doc.id}')">حذف</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading doctors:', error);
    notificationManager.showError('خطأ في تحميل الأطباء');
  }
}

/**
 * Load Users
 * تحميل المستخدمين
 */
async function loadUsers() {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('users').get();
    const tbody = document.getElementById('usersTableBody');

    tbody.innerHTML = '';

    snapshot.forEach(doc => {
      const user = doc.data();
      const row = document.createElement('tr');
      const createdDate = user.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || 'N/A';
      
      row.innerHTML = `
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${createdDate}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-delete" onclick="deleteUser('${doc.id}')">حذف</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading users:', error);
    notificationManager.showError('خطأ في تحميل المستخدمين');
  }
}

/**
 * Save General Settings
 * حفظ الإعدادات العامة
 */
async function saveGeneralSettings() {
  try {
    const centerName = document.getElementById('centerName').value;
    const totalClinics = parseInt(document.getElementById('totalClinics').value);
    const totalScreens = parseInt(document.getElementById('totalScreens').value);

    await firebaseHelper.updateSettings({
      centerName,
      totalClinics,
      totalScreens
    });

    notificationManager.showSuccess('✅ تم حفظ الإعدادات بنجاح');
  } catch (error) {
    console.error('Error saving general settings:', error);
    notificationManager.showError('❌ خطأ في حفظ الإعدادات');
  }
}

/**
 * Save Announcement Settings
 * حفظ إعدادات الإعلانات
 */
async function saveAnnouncementSettings() {
  try {
    const announcementSpeed = parseInt(document.getElementById('announcementSpeed').value);
    const notificationDuration = parseInt(document.getElementById('notificationDuration').value);
    const ttsSpeed = parseFloat(document.getElementById('ttsSpeed').value);

    await firebaseHelper.updateSettings({
      announcementSpeed,
      notificationDuration,
      ttsSpeed
    });

    notificationManager.showSuccess('✅ تم حفظ الإعدادات بنجاح');
  } catch (error) {
    console.error('Error saving announcement settings:', error);
    notificationManager.showError('❌ خطأ في حفظ الإعدادات');
  }
}

/**
 * Save Storage Settings
 * حفظ إعدادات التخزين
 */
async function saveStorageSettings() {
  try {
    const audioPath = document.getElementById('audioPath').value;
    const mediaPath = document.getElementById('mediaPath').value;
    const cacheEnabled = document.getElementById('cacheEnabled').value === 'true';

    await firebaseHelper.updateSettings({
      audioPath,
      mediaPath,
      cacheEnabled
    });

    notificationManager.showSuccess('✅ تم حفظ الإعدادات بنجاح');
  } catch (error) {
    console.error('Error saving storage settings:', error);
    notificationManager.showError('❌ خطأ في حفظ الإعدادات');
  }
}

/**
 * Call Customer
 * نداء عميل
 */
async function callCustomer() {
  try {
    const clinicId = document.getElementById('callClinic').value;
    const customerNumber = parseInt(document.getElementById('callCustomerNumber').value);

    if (!clinicId || !customerNumber) {
      notificationManager.showWarning('⚠️ يرجى ملء جميع الحقول');
      return;
    }

    // Update clinic queue
    await firebaseHelper.updateClinicQueue(clinicId, customerNumber);

    // Play announcement
    await audioManager.playQueueAnnouncement(customerNumber, clinicId);

    notificationManager.showSuccess('✅ تم النداء بنجاح');
  } catch (error) {
    console.error('Error calling customer:', error);
    notificationManager.showError('❌ خطأ في النداء');
  }
}

/**
 * Emergency Alert
 * تنبيه طوارئ
 */
async function emergencyAlert() {
  try {
    const clinicId = document.getElementById('emergencyClinic').value;

    if (!clinicId) {
      notificationManager.showWarning('⚠️ يرجى اختيار عيادة');
      return;
    }

    // Play emergency sound
    await audioManager.speakText('تنبيه طوارئ في عيادة ' + clinicId);

    notificationManager.showEmergencyNotification('🚨 تنبيه طوارئ في العيادة ' + clinicId);
  } catch (error) {
    console.error('Error emergency alert:', error);
    notificationManager.showError('❌ خطأ في التنبيه');
  }
}

/**
 * Reset Clinics
 * تصفير العيادات
 */
async function resetClinics() {
  try {
    const clinicId = document.getElementById('resetClinic').value;

    if (clinicId) {
      // Reset specific clinic
      await firebaseHelper.updateClinicQueue(clinicId, 0);
      notificationManager.showSuccess('✅ تم تصفير العيادة بنجاح');
    } else {
      // Reset all clinics
      const clinics = await firebaseHelper.getClinics();
      for (const clinic of clinics) {
        await firebaseHelper.updateClinicQueue(clinic.id, 0);
      }
      notificationManager.showSuccess('✅ تم تصفير جميع العيادات بنجاح');
    }

    await loadClinics();
  } catch (error) {
    console.error('Error resetting clinics:', error);
    notificationManager.showError('❌ خطأ في التصفير');
  }
}

/**
 * Show Add Clinic Form
 * عرض نموذج إضافة عيادة
 */
function showAddClinicForm() {
  notificationManager.showModal(
    'إضافة عيادة جديدة',
    `
      <div class="form-group">
        <label>اسم العيادة</label>
        <input type="text" id="newClinicName" placeholder="اسم العيادة">
      </div>
      <div class="form-group">
        <label>كلمة السر</label>
        <input type="password" id="newClinicPassword" placeholder="كلمة السر">
      </div>
    `,
    [
      { text: 'إضافة', type: 'primary', onclick: 'addClinic()' },
      { text: 'إلغاء', type: 'default', onclick: 'closeModal()' }
    ]
  );
}

/**
 * Add Clinic
 * إضافة عيادة
 */
async function addClinic() {
  try {
    const name = document.getElementById('newClinicName').value;
    const password = document.getElementById('newClinicPassword').value;

    if (!name || !password) {
      notificationManager.showWarning('⚠️ يرجى ملء جميع الحقول');
      return;
    }

    const db = firebase.firestore();
    const clinicsSnapshot = await db.collection('clinics').get();
    const newId = clinicsSnapshot.size + 1;

    await db.collection('clinics').doc(String(newId)).set({
      id: newId,
      name,
      password,
      currentNumber: 0,
      status: 'نشطة',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    notificationManager.showSuccess('✅ تم إضافة العيادة بنجاح');
    await loadClinics();
    closeModal();
  } catch (error) {
    console.error('Error adding clinic:', error);
    notificationManager.showError('❌ خطأ في إضافة العيادة');
  }
}

/**
 * Show Add Screen Form
 * عرض نموذج إضافة شاشة
 */
function showAddScreenForm() {
  notificationManager.showModal(
    'إضافة شاشة جديدة',
    `
      <div class="form-group">
        <label>اسم الشاشة</label>
        <input type="text" id="newScreenName" placeholder="اسم الشاشة">
      </div>
      <div class="form-group">
        <label>كلمة السر</label>
        <input type="password" id="newScreenPassword" placeholder="كلمة السر">
      </div>
    `,
    [
      { text: 'إضافة', type: 'primary', onclick: 'addScreen()' },
      { text: 'إلغاء', type: 'default', onclick: 'closeModal()' }
    ]
  );
}

/**
 * Add Screen
 * إضافة شاشة
 */
async function addScreen() {
  try {
    const name = document.getElementById('newScreenName').value;
    const password = document.getElementById('newScreenPassword').value;

    if (!name || !password) {
      notificationManager.showWarning('⚠️ يرجى ملء جميع الحقول');
      return;
    }

    const db = firebase.firestore();
    const screensSnapshot = await db.collection('screens').get();
    const newId = screensSnapshot.size + 1;

    await db.collection('screens').doc(String(newId)).set({
      id: newId,
      name,
      password,
      assignedClinics: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    notificationManager.showSuccess('✅ تم إضافة الشاشة بنجاح');
    await loadScreens();
    closeModal();
  } catch (error) {
    console.error('Error adding screen:', error);
    notificationManager.showError('❌ خطأ في إضافة الشاشة');
  }
}

/**
 * Show Add Doctor Form
 * عرض نموذج إضافة طبيب
 */
function showAddDoctorForm() {
  notificationManager.showModal(
    'إضافة طبيب جديد',
    `
      <div class="form-group">
        <label>اسم الطبيب</label>
        <input type="text" id="newDoctorName" placeholder="اسم الطبيب">
      </div>
      <div class="form-group">
        <label>التخصص</label>
        <input type="text" id="newDoctorSpecialty" placeholder="التخصص">
      </div>
      <div class="form-group">
        <label>العيادة</label>
        <input type="text" id="newDoctorClinic" placeholder="العيادة">
      </div>
    `,
    [
      { text: 'إضافة', type: 'primary', onclick: 'addDoctor()' },
      { text: 'إلغاء', type: 'default', onclick: 'closeModal()' }
    ]
  );
}

/**
 * Add Doctor
 * إضافة طبيب
 */
async function addDoctor() {
  try {
    const name = document.getElementById('newDoctorName').value;
    const specialty = document.getElementById('newDoctorSpecialty').value;
    const clinic = document.getElementById('newDoctorClinic').value;

    if (!name || !specialty || !clinic) {
      notificationManager.showWarning('⚠️ يرجى ملء جميع الحقول');
      return;
    }

    const db = firebase.firestore();
    const doctorsSnapshot = await db.collection('doctors').get();
    const newId = doctorsSnapshot.size + 1;

    await db.collection('doctors').doc(String(newId)).set({
      id: newId,
      name,
      specialty,
      clinic,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    notificationManager.showSuccess('✅ تم إضافة الطبيب بنجاح');
    await loadDoctors();
    closeModal();
  } catch (error) {
    console.error('Error adding doctor:', error);
    notificationManager.showError('❌ خطأ في إضافة الطبيب');
  }
}

/**
 * Show Add User Form
 * عرض نموذج إضافة مستخدم
 */
function showAddUserForm() {
  notificationManager.showModal(
    'إضافة مستخدم جديد',
    `
      <div class="form-group">
        <label>البريد الإلكتروني</label>
        <input type="email" id="newUserEmail" placeholder="البريد الإلكتروني">
      </div>
      <div class="form-group">
        <label>كلمة المرور</label>
        <input type="password" id="newUserPassword" placeholder="كلمة المرور">
      </div>
      <div class="form-group">
        <label>الدور</label>
        <select id="newUserRole">
          <option value="admin">مسؤول</option>
          <option value="doctor">طبيب</option>
          <option value="staff">موظف</option>
        </select>
      </div>
    `,
    [
      { text: 'إضافة', type: 'primary', onclick: 'addUser()' },
      { text: 'إلغاء', type: 'default', onclick: 'closeModal()' }
    ]
  );
}

/**
 * Add User
 * إضافة مستخدم
 */
async function addUser() {
  try {
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!email || !password || !role) {
      notificationManager.showWarning('⚠️ يرجى ملء جميع الحقول');
      return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    await db.collection('users').doc(uid).set({
      uid,
      email,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    notificationManager.showSuccess('✅ تم إضافة المستخدم بنجاح');
    await loadUsers();
    closeModal();
  } catch (error) {
    console.error('Error adding user:', error);
    notificationManager.showError('❌ خطأ في إضافة المستخدم: ' + error.message);
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

/**
 * Delete Clinic
 * حذف عيادة
 */
async function deleteClinic(clinicId) {
  if (confirm('هل أنت متأكد من حذف هذه العيادة؟')) {
    try {
      const db = firebase.firestore();
      await db.collection('clinics').doc(clinicId).delete();
      notificationManager.showSuccess('✅ تم حذف العيادة بنجاح');
      await loadClinics();
    } catch (error) {
      console.error('Error deleting clinic:', error);
      notificationManager.showError('❌ خطأ في حذف العيادة');
    }
  }
}

/**
 * Delete Screen
 * حذف شاشة
 */
async function deleteScreen(screenId) {
  if (confirm('هل أنت متأكد من حذف هذه الشاشة؟')) {
    try {
      const db = firebase.firestore();
      await db.collection('screens').doc(screenId).delete();
      notificationManager.showSuccess('✅ تم حذف الشاشة بنجاح');
      await loadScreens();
    } catch (error) {
      console.error('Error deleting screen:', error);
      notificationManager.showError('❌ خطأ في حذف الشاشة');
    }
  }
}

/**
 * Delete Doctor
 * حذف طبيب
 */
async function deleteDoctor(doctorId) {
  if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
    try {
      const db = firebase.firestore();
      await db.collection('doctors').doc(doctorId).delete();
      notificationManager.showSuccess('✅ تم حذف الطبيب بنجاح');
      await loadDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      notificationManager.showError('❌ خطأ في حذف الطبيب');
    }
  }
}

/**
 * Delete User
 * حذف مستخدم
 */
async function deleteUser(userId) {
  if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
    try {
      const db = firebase.firestore();
      await db.collection('users').doc(userId).delete();
      notificationManager.showSuccess('✅ تم حذف المستخدم بنجاح');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      notificationManager.showError('❌ خطأ في حذف المستخدم');
    }
  }
}

/**
 * Logout
 * تسجيل الخروج
 */
async function logout() {
  try {
    await firebase.auth().signOut();
    window.location.href = '../index.html';
  } catch (error) {
    console.error('Error logging out:', error);
    notificationManager.showError('❌ خطأ في تسجيل الخروج');
  }
}
