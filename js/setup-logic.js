/**
 * Setup Logic
 * منطق إعداد النظام
 */

let setupProgress = 0;
let firebaseConfigured = false;
let databaseInitialized = false;
let adminCreated = false;

/**
 * Save Firebase Configuration
 * حفظ إعدادات Firebase
 */
async function saveFirebaseConfig() {
  try {
    const apiKey = document.getElementById('apiKey').value;
    const authDomain = document.getElementById('authDomain').value;
    const projectId = document.getElementById('projectId').value;
    const storageBucket = document.getElementById('storageBucket').value;
    const messagingSenderId = document.getElementById('messagingSenderId').value;
    const appId = document.getElementById('appId').value;

    if (!apiKey || !authDomain || !projectId) {
      showStatus('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    // Save to localStorage
    const config = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    };

    localStorage.setItem('firebaseConfig', JSON.stringify(config));

    // Update Firebase config
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    };

    // Reinitialize Firebase with new config
    firebase.initializeApp(firebaseConfig);

    firebaseConfigured = true;
    updateProgress(25);
    updateChecklist(0, true);

    showStatus('✅ تم حفظ إعدادات Firebase بنجاح', 'success');
  } catch (error) {
    console.error('Error saving Firebase config:', error);
    showStatus('❌ خطأ في حفظ الإعدادات: ' + error.message, 'error');
  }
}

/**
 * Initialize Database
 * تهيئة قاعدة البيانات
 */
async function initializeDatabase() {
  try {
    if (!firebaseConfigured) {
      showStatus('⚠️ يرجى حفظ إعدادات Firebase أولاً', 'error');
      return;
    }

    showStatus('⏳ جاري إنشاء قاعدة البيانات...', 'info');

    const db = firebase.firestore();
    const helper = new FirebaseHelper();

    // Initialize database
    await helper.initializeDatabase();

    databaseInitialized = true;
    updateProgress(50);
    updateChecklist(1, true);

    showStatus('✅ تم إنشاء قاعدة البيانات بنجاح', 'success');
  } catch (error) {
    console.error('Error initializing database:', error);
    showStatus('❌ خطأ في إنشاء قاعدة البيانات: ' + error.message, 'error');
  }
}

/**
 * Create Admin Account
 * إنشاء حساب المسؤول
 */
async function createAdminAccount() {
  try {
    if (!databaseInitialized) {
      showStatus('⚠️ يرجى إنشاء قاعدة البيانات أولاً', 'error');
      return;
    }

    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
      showStatus('⚠️ يرجى ملء البريد الإلكتروني وكلمة المرور', 'error');
      return;
    }

    if (password.length < 6) {
      showStatus('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
      return;
    }

    showStatus('⏳ جاري إنشاء حساب المسؤول...', 'info');

    const auth = firebase.auth();
    const db = firebase.firestore();

    // Create user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    // Save admin data to Firestore
    await db.collection('users').doc(uid).set({
      uid,
      email,
      role: 'admin',
      name: 'مسؤول النظام',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add to admin list
    const settingsDoc = await db.collection('settings').doc('admins').get();
    const adminIds = settingsDoc.data()?.adminIds || [];
    
    if (!adminIds.includes(uid)) {
      adminIds.push(uid);
      await db.collection('settings').doc('admins').update({
        adminIds
      });
    }

    adminCreated = true;
    updateProgress(75);
    updateChecklist(2, true);

    showStatus('✅ تم إنشاء حساب المسؤول بنجاح', 'success');

    // Save credentials
    localStorage.setItem('adminEmail', email);
  } catch (error) {
    console.error('Error creating admin account:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      showStatus('❌ هذا البريد الإلكتروني مستخدم بالفعل', 'error');
    } else if (error.code === 'auth/weak-password') {
      showStatus('❌ كلمة المرور ضعيفة جداً', 'error');
    } else {
      showStatus('❌ خطأ في إنشاء الحساب: ' + error.message, 'error');
    }
  }
}

/**
 * Update Progress
 * تحديث التقدم
 */
function updateProgress(percentage) {
  setupProgress = percentage;
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  progressFill.style.width = percentage + '%';
  progressText.textContent = percentage + '%';
}

/**
 * Update Checklist
 * تحديث قائمة التحقق
 */
function updateChecklist(index, completed) {
  const checkbox = document.getElementById(`check${index + 1}`);
  const status = checkbox.parentElement.querySelector('.checklist-status');
  
  if (completed) {
    checkbox.checked = true;
    status.textContent = '✅';
  } else {
    checkbox.checked = false;
    status.textContent = '⏳';
  }
}

/**
 * Show Status Message
 * عرض رسالة الحالة
 */
function showStatus(message, type = 'info') {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  
  // Auto hide after 5 seconds
  if (type !== 'error') {
    setTimeout(() => {
      statusMessage.className = 'status-message';
    }, 5000);
  }
}

/**
 * Go to Admin
 * الذهاب إلى لوحة الإدارة
 */
function goToAdmin() {
  if (adminCreated) {
    window.location.href = 'admin.html';
  } else {
    showStatus('⚠️ يرجى إكمال جميع خطوات الإعداد أولاً', 'error');
  }
}

/**
 * Go to Home
 * العودة للصفحة الرئيسية
 */
function goToHome() {
  window.location.href = '../index.html';
}

/**
 * Load Firebase Config from localStorage
 * تحميل إعدادات Firebase من localStorage
 */
function loadFirebaseConfig() {
  const config = localStorage.getItem('firebaseConfig');
  if (config) {
    const parsed = JSON.parse(config);
    document.getElementById('apiKey').value = parsed.apiKey || '';
    document.getElementById('authDomain').value = parsed.authDomain || '';
    document.getElementById('projectId').value = parsed.projectId || '';
    document.getElementById('storageBucket').value = parsed.storageBucket || '';
    document.getElementById('messagingSenderId').value = parsed.messagingSenderId || '';
    document.getElementById('appId').value = parsed.appId || '';
  }
}

/**
 * Initialize on page load
 * التهيئة عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', function() {
  loadFirebaseConfig();
  
  // Check if Firebase is already configured
  if (localStorage.getItem('firebaseConfig')) {
    firebaseConfigured = true;
    updateProgress(25);
    updateChecklist(0, true);
  }
});
