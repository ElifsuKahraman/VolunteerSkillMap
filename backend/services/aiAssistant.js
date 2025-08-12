/**
 * AI Assistant Service
 * Kullanıcı sorularına akıllı cevaplar veren ve pattern matching kullanan agent
 */

class AIAssistant {
  constructor() {
    this.name = 'AI Assistant';
    this.description = 'Kullanıcı sorularına akıllı cevaplar ve rehberlik';
    this.conversationHistory = [];
  }

  /**
   * Pattern matching ile cevap üretir
   * @param {string} message - Kullanıcı mesajı
   * @returns {string} Cevap
   */
  generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Gönüllülük hakkında sorular
    if (lowerMessage.includes('gönüllülük') || lowerMessage.includes('volunteer')) {
      if (lowerMessage.includes('nasıl') || lowerMessage.includes('başla')) {
        return "🎯 Gönüllülüğe başlamak için önce kendi ilgi alanlarını belirle. Hangi konularda yardım etmek istiyorsun? Eğitim, çevre, sağlık, sosyal yardım gibi alanlarda faaliyetler bulabilirsin.";
      }
      if (lowerMessage.includes('fayda') || lowerMessage.includes('yarar')) {
        return "💪 Gönüllülük hem topluma hem sana fayda sağlar: Yeni yetkinlikler kazanırsın, sosyal ağını genişletirsin, deneyim kazanırsın ve topluma katkıda bulunursun.";
      }
      return "🤝 Gönüllülük, topluma karşılıksız hizmet etme isteğidir. Hem kişisel gelişim hem de toplumsal fayda sağlar.";
    }

    // Yetkinlik hakkında sorular
    if (lowerMessage.includes('yetkinlik') || lowerMessage.includes('skill')) {
      if (lowerMessage.includes('geliştir') || lowerMessage.includes('artır')) {
        return "🚀 Yetkinliklerini geliştirmek için: Farklı türde faaliyetler yap, liderlik fırsatları ara, sürekli öğrenmeye odaklan ve deneyimlerini paylaş.";
      }
      if (lowerMessage.includes('hangi') || lowerMessage.includes('tür')) {
        return "📋 Popüler gönüllülük yetkinlikleri: İletişim, Takım Çalışması, Empati, Problem Çözme, Liderlik, Sorumluluk, Organizasyon, Yaratıcılık.";
      }
      return "🎯 Yetkinlikler, gönüllülük faaliyetlerinde kazandığın becerilerdir. Her faaliyet farklı yetkinlikler geliştirmene yardımcı olur.";
    }

    // Faaliyet hakkında sorular
    if (lowerMessage.includes('faaliyet') || lowerMessage.includes('activity')) {
      if (lowerMessage.includes('ekle') || lowerMessage.includes('nasıl')) {
        return "📝 Faaliyet eklemek için: Başlık, açıklama, tarih, tür ve süre bilgilerini gir. Sistem otomatik olarak yetkinlikleri çıkaracak.";
      }
      if (lowerMessage.includes('tür') || lowerMessage.includes('çeşit')) {
        return "🏷️ Faaliyet türleri: Eğitim, Çevre, Sağlık, Sosyal Yardım, Kültür-Sanat, Spor, Teknoloji, Hayvan Hakları.";
      }
      return "📊 Faaliyetler, gönüllülük deneyimlerini kaydetmenin yoludur. Her faaliyet yetkinlik haritanda görünür ve gelişimini takip edebilirsin.";
    }

    // Motivasyon mesajları
    if (lowerMessage.includes('motivasyon') || lowerMessage.includes('cesaret')) {
      return "💪 Her büyük değişim küçük adımlarla başlar. Sen de topluma katkıda bulunuyorsun! Devam et, her faaliyet seni daha güçlü yapıyor.";
    }

    if (lowerMessage.includes('yorgun') || lowerMessage.includes('bıktım')) {
      return "😌 Ara vermek normal! Gönüllülük sürdürülebilir olmalı. Kendini dinle, ihtiyacın olduğunda geri dönebilirsin. Sen zaten harika işler yapıyorsun!";
    }

    // Genel yardım
    if (lowerMessage.includes('yardım') || lowerMessage.includes('help')) {
      return "🤖 Size nasıl yardımcı olabilirim? Gönüllülük, yetkinlikler, faaliyetler veya motivasyon hakkında sorular sorabilirsiniz.";
    }

    // Teşekkür mesajları
    if (lowerMessage.includes('teşekkür') || lowerMessage.includes('sağol') || lowerMessage.includes('thanks')) {
      return "😊 Rica ederim! Senin gönüllülük yolculuğunda yanındayım. Başka soruların varsa sormaktan çekinme!";
    }

    // Varsayılan cevap
    return "🤔 Anlıyorum! Gönüllülük yolculuğunda sana daha iyi yardımcı olabilmem için sorunu biraz daha açabilir misin? Yetkinlikler, faaliyetler veya motivasyon hakkında konuşabiliriz.";
  }

  /**
   * Mesajı işler ve cevap üretir
   * @param {string} message - Kullanıcı mesajı
   * @param {Object} user - Kullanıcı bilgileri
   * @returns {Object} Cevap objesi
   */
  processMessage(message, user = null) {
    const timestamp = new Date().toISOString();
    const response = this.generateResponse(message);
    
    // Konuşma geçmişine ekle
    this.conversationHistory.push({
      message,
      response,
      timestamp,
      userId: user?.id
    });

    // Geçmişi 50 mesajla sınırla
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }

    return {
      message,
      response,
      timestamp,
      userId: user?.id
    };
  }

  /**
   * Kullanıcıya özel öneriler üretir
   * @param {Object} user - Kullanıcı bilgileri
   * @param {Array} activities - Kullanıcının faaliyetleri
   * @returns {Array} Öneriler
   */
  generatePersonalizedSuggestions(user, activities) {
    const suggestions = [];
    
    if (!activities || activities.length === 0) {
      suggestions.push("🎯 İlk faaliyetini ekleyerek gönüllülük yolculuğuna başla!");
      suggestions.push("🤔 Hangi alanda gönüllü olmak istiyorsun?");
      suggestions.push("📚 Gönüllülük türleri hakkında bilgi al");
    } else if (activities.length < 3) {
      suggestions.push("🚀 Harika başladın! Daha fazla faaliyet ekleyerek yetkinliklerini geliştir");
      suggestions.push("💡 Farklı türde faaliyetler dene");
      suggestions.push("📊 Yetkinlik haritanı kontrol et");
    } else {
      suggestions.push("💪 Deneyimli bir gönüllüsün! Liderlik fırsatları ara");
      suggestions.push("🏆 Başarılarını paylaş ve başkalarına ilham ver");
      suggestions.push("📈 Öğrenme rehberini kontrol et");
    }

    return suggestions;
  }

  /**
   * Konuşma geçmişini getirir
   * @param {string} userId - Kullanıcı ID'si
   * @returns {Array} Konuşma geçmişi
   */
  getConversationHistory(userId = null) {
    if (userId) {
      return this.conversationHistory.filter(conv => conv.userId === userId);
    }
    return this.conversationHistory;
  }

  /**
   * Konuşma geçmişini temizler
   * @param {string} userId - Kullanıcı ID'si (opsiyonel)
   */
  clearHistory(userId = null) {
    if (userId) {
      this.conversationHistory = this.conversationHistory.filter(conv => conv.userId !== userId);
    } else {
      this.conversationHistory = [];
    }
  }
}

module.exports = AIAssistant; 