/**
 * Arabic Numbers Utility
 * تحويل الأرقام الإنجليزية إلى العربية والعكس
 */

class ArabicNumbers {
  // Arabic digits
  static arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  static englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  /**
   * Convert English numbers to Arabic
   * تحويل الأرقام الإنجليزية إلى العربية
   */
  static toArabic(number) {
    if (number === null || number === undefined) return '';
    
    const str = String(number);
    let result = '';
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const index = this.englishDigits.indexOf(char);
      
      if (index !== -1) {
        result += this.arabicDigits[index];
      } else {
        result += char;
      }
    }
    
    return result;
  }

  /**
   * Convert Arabic numbers to English
   * تحويل الأرقام العربية إلى الإنجليزية
   */
  static toEnglish(number) {
    if (number === null || number === undefined) return '';
    
    const str = String(number);
    let result = '';
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const index = this.arabicDigits.indexOf(char);
      
      if (index !== -1) {
        result += this.englishDigits[index];
      } else {
        result += char;
      }
    }
    
    return result;
  }

  /**
   * Format number with Arabic digits
   * تنسيق الرقم بالأرقام العربية
   */
  static format(number, padLength = 0) {
    let str = String(number);
    
    if (padLength > 0) {
      str = str.padStart(padLength, '0');
    }
    
    return this.toArabic(str);
  }

  /**
   * Convert number to Arabic text
   * تحويل الرقم إلى نص عربي
   */
  static toArabicText(number) {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const teens = ['عشرة', 'احدى عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    const thousands = ['', 'ألف', 'مليون', 'مليار', 'تريليون'];

    if (number === 0) return 'صفر';

    let result = '';
    let groupIndex = 0;

    while (number > 0) {
      const group = number % 1000;
      
      if (group !== 0) {
        let groupText = '';
        
        // Hundreds
        const hundred = Math.floor(group / 100);
        if (hundred > 0) {
          groupText = hundreds[hundred];
        }
        
        // Tens and ones
        const remainder = group % 100;
        if (remainder >= 10 && remainder < 20) {
          if (groupText) groupText += ' و';
          groupText += teens[remainder - 10];
        } else {
          const ten = Math.floor(remainder / 10);
          const one = remainder % 10;
          
          if (one > 0) {
            if (groupText) groupText += ' و';
            groupText += ones[one];
          }
          
          if (ten > 0) {
            if (groupText) groupText += ' و';
            groupText += tens[ten];
          }
        }
        
        // Add thousands, millions, etc.
        if (groupIndex > 0) {
          groupText += ' ' + thousands[groupIndex];
        }
        
        if (result) {
          result = groupText + ' و' + result;
        } else {
          result = groupText;
        }
      }
      
      number = Math.floor(number / 1000);
      groupIndex++;
    }

    return result;
  }

  /**
   * Get Arabic text for queue announcement
   * الحصول على نص عربي لإعلان الطابور
   */
  static getQueueAnnouncement(customerNumber, clinicName) {
    const arabicNumber = this.toArabicText(customerNumber);
    return `على العميل رقم ${arabicNumber} التوجه إلى عيادة ${clinicName}`;
  }
}

// Export for use in other modules
window.ArabicNumbers = ArabicNumbers;
