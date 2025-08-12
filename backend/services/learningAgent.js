/**
 * Learning Agent Service
 * Kullanıcının öğrenme analizini yapan ve kişiselleştirilmiş öneriler sunan agent
 */

class LearningAgent {
  constructor() {
    this.name = 'Learning Agent';
    this.description = 'Kullanıcı öğrenme analizi ve kişiselleştirilmiş öneriler';
  }

  /**
   * Kullanıcının faaliyetlerini analiz eder
   * @param {Array} activities - Kullanıcının faaliyetleri
   * @returns {Object} Analiz sonuçları
   */
  analyzeUserActivities(activities) {
    const skillCounts = {};
    const allSkills = [];
    
    // Yetkinlik sayılarını hesapla
    activities.forEach(activity => {
      if (activity.skills) {
        activity.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          if (!allSkills.includes(skill)) {
            allSkills.push(skill);
          }
        });
      }
    });

    return {
      skillCounts,
      allSkills,
      totalSkills: Object.keys(skillCounts).length,
      totalActivities: activities.length
    };
  }

  /**
   * Yetkinlik seviyelerini belirler
   * @param {Object} skillCounts - Yetkinlik sayıları
   * @returns {Object} Yetkinlik seviyeleri
   */
  calculateSkillLevels(skillCounts) {
    const skillLevels = {};
    
    Object.keys(skillCounts).forEach(skill => {
      const count = skillCounts[skill];
      if (count >= 5) skillLevels[skill] = "Uzman";
      else if (count >= 3) skillLevels[skill] = "İleri";
      else if (count >= 1) skillLevels[skill] = "Başlangıç";
      else skillLevels[skill] = "Yeni";
    });

    return skillLevels;
  }

  /**
   * Eksik yetkinlikleri belirler
   * @param {Array} userSkills - Kullanıcının mevcut yetkinlikleri
   * @returns {Array} Eksik yetkinlikler
   */
  identifyMissingSkills(userSkills) {
    const popularSkills = [
      "İletişim", 
      "Takım Çalışması", 
      "Empati", 
      "Problem Çözme", 
      "Liderlik", 
      "Sorumluluk",
      "Organizasyon",
      "Yaratıcılık"
    ];
    
    return popularSkills.filter(skill => !userSkills.includes(skill));
  }

  /**
   * Kişiselleştirilmiş öneriler oluşturur
   * @param {Object} skillCounts - Yetkinlik sayıları
   * @param {Array} missingSkills - Eksik yetkinlikler
   * @returns {Array} Öneriler
   */
  generateRecommendations(skillCounts, missingSkills) {
    const recommendations = [];
    
    // Mevcut yetkinlikler için geliştirme önerileri
    Object.keys(skillCounts).forEach(skill => {
      const count = skillCounts[skill];
      if (count < 3) {
        recommendations.push({
          skill: skill,
          type: "geliştir",
          message: `${skill} yetkinliğini geliştirmek için daha fazla faaliyet yap`,
          priority: "yüksek"
        });
      }
    });
    
    // Eksik yetkinlikler için yeni öneriler
    missingSkills.slice(0, 3).forEach(skill => {
      recommendations.push({
        skill: skill,
        type: "yeni",
        message: `${skill} yetkinliğini kazanmak için yeni faaliyetler dene`,
        priority: "orta"
      });
    });

    return recommendations;
  }

  /**
   * Kilometre taşlarını hesaplar
   * @param {number} totalActivities - Toplam faaliyet sayısı
   * @param {number} totalSkills - Toplam yetkinlik sayısı
   * @returns {Array} Kilometre taşları
   */
  calculateMilestones(totalActivities, totalSkills) {
    return [
      { 
        name: "İlk Faaliyet", 
        achieved: totalActivities >= 1, 
        target: 1, 
        current: totalActivities 
      },
      { 
        name: "5 Faaliyet", 
        achieved: totalActivities >= 5, 
        target: 5, 
        current: totalActivities 
      },
      { 
        name: "10 Faaliyet", 
        achieved: totalActivities >= 10, 
        target: 10, 
        current: totalActivities 
      },
      { 
        name: "3 Yetkinlik", 
        achieved: totalSkills >= 3, 
        target: 3, 
        current: totalSkills 
      },
      { 
        name: "5 Yetkinlik", 
        achieved: totalSkills >= 5, 
        target: 5, 
        current: totalSkills 
      }
    ];
  }

  /**
   * Motivasyon mesajı oluşturur
   * @param {number} totalActivities - Toplam faaliyet sayısı
   * @returns {string} Motivasyon mesajı
   */
  generateMotivationMessage(totalActivities) {
    if (totalActivities === 0) {
      return "🎯 İlk adımı at! Gönüllülük yolculuğuna başlamak için bir faaliyet ekle.";
    } else if (totalActivities < 3) {
      return "🚀 Harika başladın! Devam et ve daha fazla deneyim kazan.";
    } else if (totalActivities < 10) {
      return "💪 Deneyimli bir gönüllüsün! Topluma katkın artıyor.";
    } else {
      return "🏆 Uzman gönüllü! Sen gerçek bir değişim yaratıyorsun.";
    }
  }

  /**
   * Tam öğrenme analizi yapar
   * @param {Array} activities - Kullanıcının faaliyetleri
   * @param {string} userId - Kullanıcı ID'si
   * @returns {Object} Tam analiz sonuçları
   */
  performFullAnalysis(activities, userId) {
    // Temel analiz
    const { skillCounts, allSkills, totalSkills, totalActivities } = this.analyzeUserActivities(activities);
    
    // Seviye hesaplamaları
    const skillLevels = this.calculateSkillLevels(skillCounts);
    const missingSkills = this.identifyMissingSkills(allSkills);
    
    // Öneriler ve kilometre taşları
    const recommendations = this.generateRecommendations(skillCounts, missingSkills);
    const milestones = this.calculateMilestones(totalActivities, totalSkills);
    
    // Başarı yüzdesi
    const achievedMilestones = milestones.filter(m => m.achieved).length;
    const progressPercentage = Math.round((achievedMilestones / milestones.length) * 100);
    
    // Motivasyon mesajı
    const motivationMessage = this.generateMotivationMessage(totalActivities);

    return {
      userId,
      totalActivities,
      totalSkills,
      skillCounts,
      skillLevels,
      missingSkills,
      recommendations,
      milestones,
      progressPercentage,
      motivationMessage,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Seviyeye göre öneri mesajı oluşturur
   * @param {string} skill - Yetkinlik adı
   * @param {string} level - Seviye
   * @returns {string} Öneri mesajı
   */
  getSkillRecommendation(skill, level) {
    const recommendations = {
      'İletişim': {
        'Yeni': 'İletişim yetkinliğini geliştirmek için insanlarla konuşma fırsatları yaratın',
        'Başlangıç': 'Farklı yaş gruplarıyla çalışarak iletişim becerilerinizi geliştirin',
        'İleri': 'Liderlik pozisyonlarında iletişim becerilerinizi pekiştirin',
        'Uzman': 'Başkalarına iletişim becerileri konusunda mentorluk yapın'
      },
      'Takım Çalışması': {
        'Yeni': 'Takım çalışması için grup aktivitelerine katılın',
        'Başlangıç': 'Büyük projelerde yer alarak takım deneyimi kazanın',
        'İleri': 'Takım lideri olarak projeler yönetin',
        'Uzman': 'Karmaşık takım projelerinde koordinasyon yapın'
      },
      'Empati': {
        'Yeni': 'Farklı insanlarla tanışarak empati yetkinliğinizi geliştirin',
        'Başlangıç': 'Farklı hayat hikayelerini dinleyerek anlayış kapasitenizi artırın',
        'İleri': 'Zor durumdaki insanlara destek olun',
        'Uzman': 'Empati konusunda eğitimler verin'
      },
      'Problem Çözme': {
        'Yeni': 'Basit problemleri çözerek deneyim kazanın',
        'Başlangıç': 'Gerçek sosyal problemlerde çözüm üreterek deneyim kazanın',
        'İleri': 'Karmaşık projelerde stratejik çözümler geliştirin',
        'Uzman': 'Sistem seviyesinde problem çözme yaklaşımları geliştirin'
      }
    };

    const skillRecommendations = recommendations[skill] || {
      'Yeni': 'Bu yetkinliği geliştirmek için yeni faaliyetler deneyin',
      'Başlangıç': 'Bu yetkinlik için daha fazla faaliyet yapın',
      'İleri': 'Bu yetkinliği pekiştirmek için liderlik fırsatları arayın',
      'Uzman': 'Bu yetkinlikte uzmanlaştınız, başkalarına mentorluk yapabilirsiniz'
    };

    return skillRecommendations[level] || 'Bu yetkinlik için daha fazla faaliyet yapın';
  }
}

module.exports = LearningAgent; 