/**
 * Skill Extractor Service
 * Faaliyet açıklamalarından yetkinlik çıkaran servis
 */

const axios = require('axios');

class SkillExtractor {
  constructor() {
    this.name = 'Skill Extractor';
    this.description = 'Faaliyet açıklamalarından yetkinlik çıkarma';
    this.apiUrl = 'http://localhost:5001/analyze';
  }

  /**
   * Python NLP API'sine istek gönderir
   * @param {string} description - Faaliyet açıklaması
   * @returns {Promise<Array>} Çıkarılan yetkinlikler
   */
  async extractSkillsFromText(description) {
    try {
      console.log(`🔍 Yetkinlik çıkarılıyor: "${description.substring(0, 50)}..."`);
      
      const response = await axios.post(this.apiUrl, {
        text: description
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.skills) {
        console.log(`✅ Yetkinlikler çıkarıldı: ${response.data.skills.join(', ')}`);
        return response.data.skills;
      } else {
        console.log('⚠️ API yanıtında yetkinlik bulunamadı');
        return this.fallbackExtraction(description);
      }

    } catch (error) {
      console.error('❌ Yetkinlik çıkarma hatası:', error.message);
      console.log('🔄 Fallback yöntemi kullanılıyor...');
      return this.fallbackExtraction(description);
    }
  }

  /**
   * Fallback yetkinlik çıkarma (API çalışmazsa)
   * @param {string} description - Faaliyet açıklaması
   * @returns {Array} Çıkarılan yetkinlikler
   */
  fallbackExtraction(description) {
    const lowerDesc = description.toLowerCase();
    const extractedSkills = [];

    // Yetkinlik anahtar kelimeleri
    const skillKeywords = {
      'İletişim': ['iletişim', 'konuşma', 'anlatma', 'sunum', 'görüşme', 'mülakat'],
      'Takım Çalışması': ['takım', 'grup', 'birlikte', 'ortak', 'işbirliği', 'koordinasyon'],
      'Empati': ['empati', 'anlayış', 'duyarlılık', 'merhamet', 'şefkat', 'destek'],
      'Problem Çözme': ['problem', 'sorun', 'çözüm', 'analiz', 'strateji', 'planlama'],
      'Liderlik': ['lider', 'yönetim', 'koordinasyon', 'organizasyon', 'sorumluluk'],
      'Sorumluluk': ['sorumluluk', 'görev', 'düzen', 'planlama', 'organizasyon'],
      'Yaratıcılık': ['yaratıcı', 'inovasyon', 'tasarım', 'sanat', 'el sanatları'],
      'Organizasyon': ['organizasyon', 'planlama', 'düzenleme', 'koordinasyon', 'yönetim']
    };

    // Her yetkinlik için anahtar kelimeleri kontrol et
    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      const hasKeyword = keywords.some(keyword => lowerDesc.includes(keyword));
      if (hasKeyword) {
        extractedSkills.push(skill);
      }
    });

    // Eğer hiç yetkinlik bulunamazsa varsayılan yetkinlikler
    if (extractedSkills.length === 0) {
      extractedSkills.push('Sorumluluk');
      if (lowerDesc.includes('eğitim') || lowerDesc.includes('öğretim')) {
        extractedSkills.push('İletişim');
      }
      if (lowerDesc.includes('çevre') || lowerDesc.includes('temizlik')) {
        extractedSkills.push('Sorumluluk');
      }
    }

    console.log(`🔄 Fallback yetkinlikler: ${extractedSkills.join(', ')}`);
    return extractedSkills;
  }

  /**
   * Faaliyet türüne göre varsayılan yetkinlikler
   * @param {string} activityType - Faaliyet türü
   * @returns {Array} Varsayılan yetkinlikler
   */
  getDefaultSkillsByType(activityType) {
    const defaultSkills = {
      'Eğitim': ['İletişim', 'Sorumluluk'],
      'Çevre': ['Sorumluluk', 'Problem Çözme'],
      'Sağlık': ['Empati', 'Sorumluluk'],
      'Sosyal Yardım': ['Empati', 'İletişim'],
      'Kültür-Sanat': ['Yaratıcılık', 'İletişim'],
      'Spor': ['Takım Çalışması', 'Liderlik'],
      'Teknoloji': ['Problem Çözme', 'Yaratıcılık'],
      'Hayvan Hakları': ['Empati', 'Sorumluluk']
    };

    return defaultSkills[activityType] || ['Sorumluluk'];
  }

  /**
   * Yetkinlik çıkarma işlemini yönetir
   * @param {string} description - Faaliyet açıklaması
   * @param {string} activityType - Faaliyet türü
   * @returns {Promise<Array>} Çıkarılan yetkinlikler
   */
  async extractSkills(description, activityType = null) {
    if (!description || description.trim().length === 0) {
      console.log('⚠️ Açıklama boş, varsayılan yetkinlikler kullanılıyor');
      return activityType ? this.getDefaultSkillsByType(activityType) : ['Sorumluluk'];
    }

    // Önce NLP API'sini dene
    const nlpSkills = await this.extractSkillsFromText(description);
    
    // Eğer NLP'den yetkinlik geldiyse kullan
    if (nlpSkills && nlpSkills.length > 0) {
      return nlpSkills;
    }

    // Fallback yöntemi kullan
    const fallbackSkills = this.fallbackExtraction(description);
    
    // Faaliyet türüne göre varsayılan yetkinlikleri de ekle
    if (activityType) {
      const defaultSkills = this.getDefaultSkillsByType(activityType);
      const allSkills = [...new Set([...fallbackSkills, ...defaultSkills])];
      return allSkills;
    }

    return fallbackSkills;
  }

  /**
   * Yetkinlik skorlarını hesaplar
   * @param {Array} skills - Yetkinlikler
   * @param {string} description - Açıklama
   * @returns {Object} Yetkinlik skorları
   */
  calculateSkillScores(skills, description) {
    const scores = {};
    const lowerDesc = description.toLowerCase();

    skills.forEach(skill => {
      let score = 0.5; // Temel skor

      // Açıklamada yetkinlikle ilgili kelimeler varsa skoru artır
      const skillKeywords = {
        'İletişim': ['iletişim', 'konuşma', 'anlatma', 'sunum'],
        'Takım Çalışması': ['takım', 'grup', 'birlikte', 'ortak'],
        'Empati': ['empati', 'anlayış', 'duyarlılık', 'merhamet'],
        'Problem Çözme': ['problem', 'sorun', 'çözüm', 'analiz'],
        'Liderlik': ['lider', 'yönetim', 'koordinasyon'],
        'Sorumluluk': ['sorumluluk', 'görev', 'düzen'],
        'Yaratıcılık': ['yaratıcı', 'inovasyon', 'tasarım'],
        'Organizasyon': ['organizasyon', 'planlama', 'düzenleme']
      };

      const keywords = skillKeywords[skill] || [];
      const keywordCount = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
      
      if (keywordCount > 0) {
        score += keywordCount * 0.2;
      }

      scores[skill] = Math.min(score, 1.0); // Maksimum 1.0
    });

    return scores;
  }

  /**
   * API durumunu kontrol eder
   * @returns {Promise<boolean>} API çalışıyor mu
   */
  async checkApiStatus() {
    try {
      const response = await axios.get('http://localhost:5001/health', {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = SkillExtractor; 