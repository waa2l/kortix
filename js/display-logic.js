/**
 * Display Logic
 * منطق شاشة العرض
 */

let firebaseHelper = null;
let currentScreen = null;
let currentZoom = 1;
let doctorIndex = 0;
let doctors = [];

/**
 * Initialize Display Page
 * تهيئة صفحة العرض
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    firebaseHelper = new FirebaseHelper();

    // Update time
    updateTime();
    setInterval(updateTime, 1000);

    // Load screens
    await loadScreens();

    // Load clinics
    await loadClinics();

    // Load doctors
    await loadDoctors();

    // Listen to clinic changes
    firebaseHelper.onAllClinicsChange(updateClinicsDisplay);

    // Rotate doctor images
    setInterval(rotateDoctorImages, 10000);
  } catch (error) {
    console.error('Error initializing display page:', error);
  }
});

/**
 * Update Time
 * تحديث الوقت
 */
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('currentTime').textContent = timeString;
}

/**
 * Load Screens
 * تحميل الشاشات
 */
async function loadScreens() {
  try {
    const screens = await firebaseHelper.getScreens();
    const selector = document.getElementById('screenSelector');

    screens.forEach(screen => {
      const option = document.createElement('option');
      option.value = screen.id;
      option.textContent = `شاشة ${ArabicNumbers.toArabic(screen.id)}`;
      selector.appendChild(option);
    });

    // Select first screen by default
    if (screens.length > 0) {
      selector.value = screens[0].id;
      currentScreen = screens[0];
      await changeScreen();
    }
  } catch (error) {
    console.error('Error loading screens:', error);
  }
}

/**
 * Change Screen
 * تغيير الشاشة
 */
async function changeScreen() {
  try {
    const screenId = document.getElementById('screenSelector').value;
    if (screenId) {
      currentScreen = await firebaseHelper.getScreen(screenId);
      await loadClinics();
    }
  } catch (error) {
    console.error('Error changing screen:', error);
  }
}

/**
 * Load Clinics
 * تحميل العيادات
 */
async function loadClinics() {
  try {
    const clinics = await firebaseHelper.getClinics();
    updateClinicsDisplay(clinics);
  } catch (error) {
    console.error('Error loading clinics:', error);
  }
}

/**
 * Update Clinics Display
 * تحديث عرض العيادات
 */
function updateClinicsDisplay(clinics) {
  const clinicsList = document.getElementById('clinicsList');
  clinicsList.innerHTML = '';

  clinics.forEach(clinic => {
    const card = document.createElement('div');
    card.className = 'clinic-card';
    card.setAttribute('data-clinic-id', clinic.id);

    if (clinic.status === 'متوقفة') {
      card.classList.add('inactive');
    } else {
      card.classList.add('active');
    }

    const lastCallTime = clinic.lastCallTime 
      ? new Date(clinic.lastCallTime.toDate?.() || clinic.lastCallTime).toLocaleTimeString('ar-EG')
      : 'لم يتم النداء';

    card.innerHTML = `
      <div class="clinic-name">${clinic.name}</div>
      <div class="clinic-number">${ArabicNumbers.toArabic(clinic.currentNumber)}</div>
      <div class="clinic-info">
        آخر نداء: ${lastCallTime}<br>
        الحالة: ${clinic.status}
      </div>
    `;

    clinicsList.appendChild(card);
  });
}

/**
 * Load Doctors
 * تحميل الأطباء
 */
async function loadDoctors() {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('doctors').get();
    doctors = [];

    snapshot.forEach(doc => {
      doctors.push(doc.data());
    });

    if (doctors.length > 0) {
      updateDoctorImage();
    }
  } catch (error) {
    console.error('Error loading doctors:', error);
  }
}

/**
 * Rotate Doctor Images
 * تدوير صور الأطباء
 */
function rotateDoctorImages() {
  if (doctors.length > 0) {
    doctorIndex = (doctorIndex + 1) % doctors.length;
    updateDoctorImage();
  }
}

/**
 * Update Doctor Image
 * تحديث صورة الطبيب
 */
function updateDoctorImage() {
  if (doctors.length > 0) {
    const doctor = doctors[doctorIndex];
    const doctorImage = document.getElementById('doctorImage');
    
    if (doctor.image) {
      doctorImage.src = doctor.image;
    } else {
      doctorImage.src = `https://via.placeholder.com/200x200?text=${doctor.name}`;
    }
  }
}

/**
 * Toggle Fullscreen
 * تبديل ملء الشاشة
 */
function toggleFullscreen() {
  const elem = document.documentElement;

  if (!document.fullscreenElement) {
    elem.requestFullscreen?.() ||
    elem.webkitRequestFullscreen?.() ||
    elem.mozRequestFullScreen?.() ||
    elem.msRequestFullscreen?.();
  } else {
    document.exitFullscreen?.() ||
    document.webkitExitFullscreen?.() ||
    document.mozCancelFullScreen?.() ||
    document.msExitFullscreen?.();
  }
}

/**
 * Zoom In
 * تكبير
 */
function zoomIn() {
  currentZoom += 0.1;
  applyZoom();
}

/**
 * Zoom Out
 * تصغير
 */
function zoomOut() {
  if (currentZoom > 0.5) {
    currentZoom -= 0.1;
    applyZoom();
  }
}

/**
 * Apply Zoom
 * تطبيق التكبير
 */
function applyZoom() {
  document.body.style.zoom = currentZoom;
}

/**
 * Listen to Notifications
 * الاستماع إلى الإشعارات
 */
function listenToNotifications() {
  try {
    const db = firebase.firestore();
    
    db.collection('notifications')
      .where('type', '==', 'queue_call')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          const notification = doc.data();
          showNotificationBar(notification);
        });
      });
  } catch (error) {
    console.error('Error listening to notifications:', error);
  }
}

/**
 * Show Notification Bar
 * عرض شريط الإشعارات
 */
function showNotificationBar(notification) {
  const notificationManager = new NotificationManager();
  const message = `على العميل رقم ${ArabicNumbers.toArabic(notification.customerNumber)} التوجه إلى عيادة ${notification.clinicName}`;
  
  notificationManager.showQueueNotification(
    notification.customerNumber,
    notification.clinicName,
    new Date().toLocaleTimeString('ar-EG')
  );

  // Highlight clinic card
  notificationManager.highlightClinicCard(notification.clinicId);
}

// Start listening to notifications
listenToNotifications();
