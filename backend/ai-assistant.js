
class SimpleAIAssistant {
  constructor() {
    this.name = "Gönüllü Asistanı";
    this.greetings = [
      "Merhaba! Ben senin gönüllülük asistanın. Nasıl yardımcı olabilirim? 😊",
      "Selam! Gönüllülük yolculuğunda sana rehberlik etmek için buradayım! 🌟",
      "Hey! Hangi konuda yardıma ihtiyacın var? 💫"
    ];
  }

  // Kullanıcı mesajını analiz et ve cevap ver
  processMessage(userMessage, userSkills = [], userActivities = []) {
    const message = userMessage.toLowerCase().trim();
    
    console.log(`AI Asistan: Mesaj alındı - "${message}"`);
    
  
    if (!message) {
      return this.getRandomResponse([
        "Bir şey söylemedin, ne hakkında konuşmak istiyorsun? 🤔",
        "Dinliyorum, neler düşünüyorsun? 👂",
        "Hangi konuda sohbet etmek istiyorsun? 💬"
      ]);
    }

  
    if (this.isGreeting(message)) {
      return this.getRandomResponse(this.greetings);
    }

    
    if (this.isAskingForActivitySuggestion(message)) {
      return this.suggestActivity(userSkills);
    }

    
    if (this.isAskingForSkillAdvice(message)) {
      return this.giveSkillAdvice(userSkills);
    }

    
    if (this.isAskingAboutVolunteering(message)) {
      return this.explainVolunteering();
    }

    
    if (this.needsMotivation(message)) {
      return this.giveMotivation();
    }

   
    if (this.isAskingAboutSkills(message)) {
      return this.analyzeUserSkills(userSkills, userActivities);
    }

    
    return this.getDefaultResponse(message);
  }

  // Selamlama kontrolü
  isGreeting(message) {
    const greetingWords = [
      'merhaba', 'selam', 'hey', 'sa', 'naber', 'nasılsın', 
      'günaydın', 'iyi akşamlar', 'iyi günler', 'hoş geldin'
    ];
    return greetingWords.some(word => message.includes(word));
  }

  // Faaliyet önerisi isteği kontrolü
  isAskingForActivitySuggestion(message) {
    const suggestionKeywords = [
      'faaliyet öner', 'ne yapabilirim', 'hangi faaliyet', 'öneri',
      'gönüllü ol', 'katılabilirim', 'nasıl başlarım', 'ne yapmayı'
    ];
    return suggestionKeywords.some(keyword => message.includes(keyword));
  }

  // Yetkinlik tavsiyesi isteği kontrolü
  isAskingForSkillAdvice(message) {
    const skillKeywords = [
      'yetkinlik', 'beceri', 'gelişim', 'nasıl geliştirim', 
      'nasıl öğrenebilirim', 'tavsiyen', 'hangi beceri'
    ];
    return skillKeywords.some(keyword => message.includes(keyword));
  }


  isAskingAboutVolunteering(message) {
    const volunteeringKeywords = [
      'gönüllülük nedir', 'neden gönüllü', 'faydası', 'nasıl faydalı',
      'ne işe yarar', 'amacı nedir', 'gönüllü olmak'
    ];
    return volunteeringKeywords.some(keyword => message.includes(keyword));
  }


  needsMotivation(message) {
    const motivationKeywords = [
      'moralim bozuk', 'motivasyon', 'cesaretlendir', 'üzgün',
      'yorgunum', 'devam edeyim mi', 'vazgeçmek', 'zorlanıyorum'
    ];
    return motivationKeywords.some(keyword => message.includes(keyword));
  }


  isAskingAboutSkills(message) {
    const analysisKeywords = [
      'yetkinliklerim', 'becerilerim', 'hangi konularda iyiyim',
      'güçlü yönlerim', 'analiz et', 'değerlendir'
    ];
    return analysisKeywords.some(keyword => message.includes(keyword));
  }

  
  suggestActivity(userSkills) {
    const activities = {
      'Takım Çalışması': [
        "🤝 Çevre temizliği etkinliklerinde takım halinde çalış",
        "👥 Yaşlılar için grup aktiviteleri organize et",
        "🎭 Tiyatro topluluklarında gönüllü ol"
      ],
      'Liderlik': [
        "👑 Gönüllü projelerinde koordinatör ol",
        "🎯 Etkinlik organizasyonlarında liderlik yap",
        "📢 Sosyal sorumluluk kampanyalarını yönet"
      ],
      'İletişim': [
        "📞 Yardım hatlarında gönüllü danışman ol",
        "📝 Blog yazıları yazarak farkındalık oluştur",
        "🎤 Okullarda sunum yap"
      ],
      'Empati': [
        "💙 Çocuk evlerinde zaman geçir",
        "🤗 Yaşlı bakım evlerinde sohbet et",
        "🐾 Hayvan barınaklarında yardım et"
      ],
      'default': [
        "🌱 Çevre koruma projelerine katıl",
        "📚 Eğitim gönüllülüğü yap",
        "🎨 Sanat atölyelerinde asistan ol",
        "🏥 Hastane gönüllülüğü yap"
      ]
    };

    let suggestions = [];
    
    // Kullanıcının yetkinliklerine göre öneri
    if (userSkills.length > 0) {
      userSkills.forEach(skill => {
        if (activities[skill]) {
          suggestions = suggestions.concat(activities[skill]);
        }
      });
    }
    
    // Yetkinlik yoksa genel öneriler
    if (suggestions.length === 0) {
      suggestions = activities.default;
    }

    const randomSuggestions = this.getRandomItems(suggestions, 2);
    
    return `🎯 Sana uygun faaliyet önerileri:\n\n${randomSuggestions.join('\n')}\n\nBu faaliyetler senin yeteneklerini geliştirmene yardımcı olacak! Hangisi ilgini çekiyor? 😊`;
  }

  
  giveSkillAdvice(userSkills) {
    const skillAdvice = {
      'Takım Çalışması': "Grup projelerine katılarak işbirliği becerilerini geliştirebilirsin. Farklı görüşleri dinlemeyi öğren! 🤝",
      'Liderlik': "Küçük projelerde sorumluluk alarak liderlik deneyimi kazan. İnsanları motive etmeyi öğren! 👑",
      'İletişim': "Sunum yapma fırsatlarını değerlendir. Aktif dinleme becerini geliştir! 🗣️",
      'Empati': "Farklı yaş gruplarıyla vakit geçirerek anlayış kapasiteni artır! 💖",
      'Problem Çözme': "Günlük sorunlara yaratıcı çözümler bulmaya çalış. Analitik düşünce geliştir! 🧩",
      'Planlama': "Kişisel projeler planlayarak organizasyon becerini güçlendir! 📅"
    };

    if (userSkills.length > 0) {
      const skill = userSkills[Math.floor(Math.random() * userSkills.length)];
      const advice = skillAdvice[skill] || "Her gün yeni şeyler öğrenmeye devam et! 🌟";
      
      return `💡 ${skill} yetkinliğin için tavsiyem:\n\n${advice}\n\nSürekli pratik yaparak kendini geliştirebilirsin! 💪`;
    }

    return `🌱 Genel gelişim tavsiyem:\n\nYeni deneyimlere açık ol, farklı gönüllülük alanlarını keşfet. Her faaliyet sana yeni beceriler kazandıracak! Sabırlı ol ve kendine güven! ✨`;
  }

  
  explainVolunteering() {
    const explanations = [
      `🌟 Gönüllülük, başkalarına yardım etme arzusundan doğan güzel bir eylem!

      ✨ Faydaları:
      • Topluma katkı sağlarsın
      • Yeni insanlarla tanışırsın  
      • Becerilerini geliştirirsin
      • Kendini iyi hissedersin
      • CV'ni güçlendirirsin

      Küçük adımlarla başla, büyük değişiklikler yarat! 💫`,

      `❤️ Gönüllülük kalbinden gelmelidir!

      Neden önemli?
      🤝 İnsanlara dokunursun
      🌱 Toplumu değiştirirsin
      💪 Kendini geliştirirsin
      😊 Mutlu olursun

      Sen de bu güzel yolculuğun parçası olabilirsin! 🚀`
    ];

    return this.getRandomResponse(explanations);
  }

  // Motivasyon ver
  giveMotivation() {
    const motivationalMessages = [
      "💪 Sen harikasın! Her gönüllü aktiviten dünyayı biraz daha güzel yapıyor. Devam et! ✨",
      "🌟 Zorlandığın zamanlar büyüdüğün zamanlardır. Gönüllülük yolculuğunda sen çok değerlisin! 💖",
      "🚀 Küçük adımlar büyük değişimlere yol açar. Senin katkın çok önemli, vazgeçme! 🌈",
      "💫 Her gün yeni bir fırsat! Gönüllülükteki enerjin herkese ilham veriyor. Gurur duyabilirsin! 🎯",
      "🔥 Sen bir değişim yaratıcısısın! Zorluklara rağmen yoluna devam etmen seni güçlü yapıyor! 💎"
    ];

    return this.getRandomResponse(motivationalMessages);
  }

  // Kullanıcı yetkinliklerini analiz et
  analyzeUserSkills(userSkills, userActivities) {
    if (!userSkills || userSkills.length === 0) {
      return `🔍 Henüz yetkinlik analizin yok! 

      Faaliyet eklemeye başla, böylece:
      • Güçlü yönlerini keşfedeceksin
      • Gelişim alanlarını göreceksin  
      • Kişisel yol haritanı çıkaracaksın

      İlk faaliyetini eklemeye hazır mısın? 🌱`;
    }

    const topSkill = userSkills[0];
    const totalActivities = userActivities.length || 0;

    return `📊 Yetkinlik analizin:

    🏆 En güçlü yönün: ${topSkill}
    📈 Toplam faaliyet: ${totalActivities}
    💯 Genel durum: ${this.getSkillLevelComment(userSkills.length)}

    ${this.getPersonalizedAdvice(topSkill)}

    Devam et, gelişimin harika! 🚀`;
  }

  // Yetkinlik seviyesi yorumu
  getSkillLevelComment(skillCount) {
    if (skillCount >= 5) return "Çok deneyimli! 🌟";
    if (skillCount >= 3) return "İyi seviyede! 💪";
    if (skillCount >= 1) return "Gelişme halinde! 🌱";
    return "Yeni başlayan! 🌱";
  }

  // Kişiselleştirilmiş tavsiye
  getPersonalizedAdvice(topSkill) {
    const advice = {
      'Takım Çalışması': "Grup projelerinde liderlik rolü almayı dene! 👥",
      'Liderlik': "Mentorluk yapmayı düşünebilirsin! 👑",
      'İletişim': "Eğitim alanında gönüllülük seni geliştirecek! 🗣️",
      'Empati': "Danışmanlık alanlarını keşfedebilirsin! 💖",
      'Problem Çözme': "Sosyal sorunlara odaklanmayı dene! 🧩"
    };

    return advice[topSkill] || "Yeni alanlara açık olmaya devam et! 🌟";
  }

  // Varsayılan cevap
  getDefaultResponse(message) {
    const responses = [
      "🤔 İlginç bir soru! Gönüllülük hakkında daha spesifik ne öğrenmek istiyorsun?",
      "💭 Bu konuda düşünmek güzel! Sana nasıl yardımcı olabilirim?",
      "🌟 Harika! Bu konuda sana faaliyet önerebilirim, ister misin?",
      "💫 Merak ettiğin konuyu biraz daha açabilir misin? Böylece sana daha iyi yardım edebilirim!",
      "🎯 Gönüllülük, yetkinlik geliştirme veya faaliyet önerileri hakkında sorularını bekliyorum!"
    ];

    return this.getRandomResponse(responses);
  }

  // Rastgele cevap seç
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Rastgele öğeler seç
  getRandomItems(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// AI Asistan örneği oluştur
const aiAssistant = new SimpleAIAssistant();

module.exports = aiAssistant; 