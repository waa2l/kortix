/**
 * Audio Manager
 * إدارة الملفات الصوتية والنطق
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.currentAudio = null;
    this.audioCache = new Map();
    this.cacheEnabled = CONSTANTS.CACHE_ENABLED;
    this.cacheDuration = CONSTANTS.CACHE_DURATION;
  }

  /**
   * Initialize audio context
   * تهيئة سياق الصوت
   */
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Play audio file
   * تشغيل ملف صوتي
   */
  async playAudio(audioPath) {
    try {
      // Check cache first
      if (this.cacheEnabled && this.audioCache.has(audioPath)) {
        const cachedAudio = this.audioCache.get(audioPath);
        if (Date.now() - cachedAudio.timestamp < this.cacheDuration) {
          return this.playAudioElement(cachedAudio.audio);
        }
      }

      // Fetch audio file
      const response = await fetch(audioPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${audioPath}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio
      if (this.cacheEnabled) {
        this.audioCache.set(audioPath, {
          audio: audioUrl,
          timestamp: Date.now()
        });
      }

      return this.playAudioElement(audioUrl);
    } catch (error) {
      console.error('Error playing audio:', error);
      // Fallback to TTS
      return this.useTTS(audioPath);
    }
  }

  /**
   * Play audio element
   * تشغيل عنصر صوتي
   */
  playAudioElement(audioUrl) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        resolve();
      };
      
      audio.onerror = () => {
        reject(new Error('Error playing audio'));
      };
      
      audio.play().catch(reject);
      this.currentAudio = audio;
    });
  }

  /**
   * Play queue announcement
   * تشغيل إعلان الطابور
   */
  async playQueueAnnouncement(customerNumber, clinicId) {
    try {
      const audioSequence = [];
      
      // Add ding sound
      audioSequence.push(CONSTANTS.AUDIO_PATHS.ding);
      
      // Add customer number
      const numberPath = `${CONSTANTS.AUDIO_PATHS.numbers}${customerNumber}.mp3`;
      audioSequence.push(numberPath);
      
      // Add clinic name
      const clinicPath = `${CONSTANTS.AUDIO_PATHS.clinics}clinic${clinicId}.mp3`;
      audioSequence.push(clinicPath);
      
      // Play sequence
      for (const audioPath of audioSequence) {
        await this.playAudio(audioPath);
      }
      
      return true;
    } catch (error) {
      console.error('Error playing queue announcement:', error);
      // Fallback to TTS
      const clinic = await this.getClinicName(clinicId);
      return this.speakText(ArabicNumbers.getQueueAnnouncement(customerNumber, clinic));
    }
  }

  /**
   * Play instant announcement
   * تشغيل إعلان فوري
   */
  async playInstantAnnouncement(instantId) {
    try {
      const audioPath = `${CONSTANTS.AUDIO_PATHS.instant}instant${instantId}.mp3`;
      return this.playAudio(audioPath);
    } catch (error) {
      console.error('Error playing instant announcement:', error);
      throw error;
    }
  }

  /**
   * Speak text using Web Speech API
   * نطق النص باستخدام Web Speech API
   */
  speakText(text, language = CONSTANTS.TTS_LANGUAGE) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = CONSTANTS.TTS_RATE;
      utterance.pitch = CONSTANTS.TTS_PITCH;
      
      utterance.onend = () => {
        resolve();
      };
      
      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Record audio from microphone
   * تسجيل صوت من الميكروفون
   */
  async recordAudio(duration = 10000) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.start();

      return new Promise((resolve) => {
        setTimeout(() => {
          mediaRecorder.stop();
          
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            resolve(audioUrl);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
          };
        }, duration);
      });
    } catch (error) {
      console.error('Error recording audio:', error);
      throw error;
    }
  }

  /**
   * Stop current audio
   * إيقاف الصوت الحالي
   */
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Also stop speech synthesis
    window.speechSynthesis.cancel();
  }

  /**
   * Clear audio cache
   * مسح ذاكرة التخزين المؤقت للصوت
   */
  clearCache() {
    this.audioCache.forEach((value) => {
      URL.revokeObjectURL(value.audio);
    });
    this.audioCache.clear();
  }

  /**
   * Get clinic name (helper method)
   * الحصول على اسم العيادة (دالة مساعدة)
   */
  async getClinicName(clinicId) {
    const clinic = CONSTANTS.DEFAULT_CLINICS.find(c => c.id === clinicId);
    return clinic ? clinic.name : `عيادة ${clinicId}`;
  }

  /**
   * Use TTS as fallback
   * استخدام TTS كبديل
   */
  useTTS(audioPath) {
    // Extract information from path and use TTS
    console.warn(`Audio file not found: ${audioPath}. Using TTS as fallback.`);
    return Promise.resolve();
  }

  /**
   * Preload audio files
   * تحميل ملفات صوتية مسبقاً
   */
  async preloadAudioFiles(paths) {
    try {
      for (const path of paths) {
        if (!this.audioCache.has(path)) {
          const response = await fetch(path);
          if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            this.audioCache.set(path, {
              audio: audioUrl,
              timestamp: Date.now()
            });
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Error preloading audio files:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * الحصول على إحصائيات الذاكرة المؤقتة
   */
  getCacheStats() {
    return {
      cacheSize: this.audioCache.size,
      cacheEnabled: this.cacheEnabled,
      cacheDuration: this.cacheDuration
    };
  }
}

// Export for use in other modules
window.AudioManager = AudioManager;
