/**
 * Notification Manager
 * إدارة الإشعارات والتنبيهات
 */

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.notificationDuration = CONSTANTS.NOTIFICATION_DURATION;
    this.soundDuration = CONSTANTS.NOTIFICATION_SOUND_DURATION;
  }

  /**
   * Show notification
   * عرض إشعار
   */
  showNotification(message, type = 'info', duration = null) {
    const notificationId = `notification-${Date.now()}`;
    const notificationDuration = duration || this.notificationDuration;

    // Create notification element
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="document.getElementById('${notificationId}').remove()">×</button>
      </div>
    `;

    // Add to page
    const container = document.getElementById('notification-container') || this.createNotificationContainer();
    container.appendChild(notification);

    // Add to tracking
    this.notifications.push({
      id: notificationId,
      message,
      type,
      createdAt: new Date()
    });

    // Auto remove after duration
    setTimeout(() => {
      const element = document.getElementById(notificationId);
      if (element) {
        element.classList.add('notification-fade-out');
        setTimeout(() => element.remove(), 300);
      }
    }, notificationDuration);

    return notificationId;
  }

  /**
   * Show queue announcement notification
   * عرض إشعار إعلان الطابور
   */
  showQueueNotification(customerNumber, clinicName, time) {
    const arabicNumber = ArabicNumbers.toArabic(customerNumber);
    const message = `على العميل رقم ${arabicNumber} التوجه إلى عيادة ${clinicName} (${time})`;
    
    return this.showNotification(message, 'queue', this.soundDuration);
  }

  /**
   * Show emergency notification
   * عرض إشعار طوارئ
   */
  showEmergencyNotification(message) {
    return this.showNotification(message, 'emergency', this.soundDuration);
  }

  /**
   * Show success notification
   * عرض إشعار نجاح
   */
  showSuccess(message, duration = null) {
    return this.showNotification(message, 'success', duration);
  }

  /**
   * Show error notification
   * عرض إشعار خطأ
   */
  showError(message, duration = null) {
    return this.showNotification(message, 'error', duration);
  }

  /**
   * Show warning notification
   * عرض إشعار تحذير
   */
  showWarning(message, duration = null) {
    return this.showNotification(message, 'warning', duration);
  }

  /**
   * Show info notification
   * عرض إشعار معلومات
   */
  showInfo(message, duration = null) {
    return this.showNotification(message, 'info', duration);
  }

  /**
   * Create notification container
   * إنشاء حاوية الإشعارات
   */
  createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
  }

  /**
   * Show toast notification
   * عرض إشعار Toast
   */
  showToast(message, type = 'info', duration = 3000) {
    const toastId = `toast-${Date.now()}`;
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const container = document.getElementById('toast-container') || this.createToastContainer();
    container.appendChild(toast);

    setTimeout(() => {
      const element = document.getElementById(toastId);
      if (element) {
        element.classList.add('toast-fade-out');
        setTimeout(() => element.remove(), 300);
      }
    }, duration);

    return toastId;
  }

  /**
   * Create toast container
   * إنشاء حاوية Toast
   */
  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  /**
   * Show modal notification
   * عرض إشعار مشروط
   */
  showModal(title, message, buttons = []) {
    const modalId = `modal-${Date.now()}`;
    
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-overlay';
    
    let buttonsHTML = '';
    buttons.forEach((button, index) => {
      buttonsHTML += `
        <button class="modal-button modal-button-${button.type || 'default'}" 
                onclick="${button.onclick || `document.getElementById('${modalId}').remove()`}">
          ${button.text}
        </button>
      `;
    });

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">×</button>
        </div>
        <div class="modal-body">
          ${message}
        </div>
        <div class="modal-footer">
          ${buttonsHTML}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modalId;
  }

  /**
   * Show loading notification
   * عرض إشعار التحميل
   */
  showLoading(message = 'جاري التحميل...') {
    const loadingId = `loading-${Date.now()}`;
    
    const loading = document.createElement('div');
    loading.id = loadingId;
    loading.className = 'loading-overlay';
    loading.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>${message}</p>
      </div>
    `;

    document.body.appendChild(loading);
    return loadingId;
  }

  /**
   * Hide loading notification
   * إخفاء إشعار التحميل
   */
  hideLoading(loadingId) {
    const element = document.getElementById(loadingId);
    if (element) {
      element.classList.add('loading-fade-out');
      setTimeout(() => element.remove(), 300);
    }
  }

  /**
   * Clear all notifications
   * مسح جميع الإشعارات
   */
  clearAll() {
    const container = document.getElementById('notification-container');
    if (container) {
      container.innerHTML = '';
    }
    this.notifications = [];
  }

  /**
   * Get notification history
   * الحصول على سجل الإشعارات
   */
  getHistory() {
    return this.notifications;
  }

  /**
   * Highlight clinic card
   * تمييز بطاقة العيادة
   */
  highlightClinicCard(clinicId) {
    const card = document.querySelector(`[data-clinic-id="${clinicId}"]`);
    if (card) {
      card.classList.add('clinic-card-highlight');
      
      // Blink effect
      let blinkCount = 0;
      const blinkInterval = setInterval(() => {
        card.classList.toggle('clinic-card-blink');
        blinkCount++;
        
        if (blinkCount >= 6) {
          clearInterval(blinkInterval);
          card.classList.remove('clinic-card-highlight', 'clinic-card-blink');
        }
      }, 300);
    }
  }

  /**
   * Show announcement bar
   * عرض شريط الإعلانات
   */
  showAnnouncementBar(text, duration = CONSTANTS.ANNOUNCEMENT_DURATION) {
    const announcementId = `announcement-${Date.now()}`;
    
    const announcement = document.createElement('div');
    announcement.id = announcementId;
    announcement.className = 'announcement-bar';
    announcement.innerHTML = `
      <div class="announcement-text">${text}</div>
    `;

    const container = document.getElementById('announcement-container') || this.createAnnouncementContainer();
    container.appendChild(announcement);

    // Animate text
    const textElement = announcement.querySelector('.announcement-text');
    const textWidth = textElement.offsetWidth;
    const containerWidth = container.offsetWidth;
    
    textElement.style.animation = `scroll-left ${duration / 1000}s linear`;

    setTimeout(() => {
      announcement.remove();
    }, duration);

    return announcementId;
  }

  /**
   * Create announcement container
   * إنشاء حاوية الإعلانات
   */
  createAnnouncementContainer() {
    const container = document.createElement('div');
    container.id = 'announcement-container';
    container.className = 'announcement-container';
    document.body.appendChild(container);
    return container;
  }
}

// Export for use in other modules
window.NotificationManager = NotificationManager;
