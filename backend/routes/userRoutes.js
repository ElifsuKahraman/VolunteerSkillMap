// Gerekli kütüphaneleri yükle
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Model dosyalarını yükle
const User = require("../models/User");
const Activity = require("../models/Activity");

// AI Asistan yükle
const aiAssistant = require("../ai-assistant");

// Router oluştur
const router = express.Router();

// JWT için gizli anahtar
const JWT_SECRET = process.env.JWT_SECRET || "gizli_jwt_anahtari";

// Python API adresi
const PYTHON_API_URL = "http://localhost:5001/analyze";

// ===== YARDIMCI FONKSİYONLAR =====

// Token kontrolü yapan fonksiyon (normal kullanıcı için)
function checkUserToken(req, res, next) {
  // Header'dan token'ı al
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Giriş yapmalısınız." });
  }
  
  // Bearer kısmını çıkar, sadece token'ı al
  const token = authHeader.split(" ")[1];
  
  try {
    // Token'ı doğrula
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.user = decodedToken; // Kullanıcı bilgilerini req'e ekle
    next(); // Bir sonraki middleware'e geç
  } catch (error) {
    return res.status(401).json({ error: "Geçersiz token." });
  }
}

// Admin token kontrolü yapan fonksiyon
function checkAdminToken(req, res, next) {
  // Header'dan token'ı al
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Admin girişi yapmalısınız." });
  }
  
  // Bearer kısmını çıkar, sadece token'ı al
  const token = authHeader.split(" ")[1];
  
  try {
    // Token'ı doğrula
    const decodedToken = jwt.verify(token, JWT_SECRET);
    
    // Admin kontrolü yap
    if (decodedToken.role !== 'admin') {
      return res.status(403).json({ error: "Bu işlem için admin yetkisi gereklidir." });
    }
    
    req.user = decodedToken; // Admin bilgilerini req'e ekle
    next(); // Bir sonraki middleware'e geç
  } catch (error) {
    return res.status(401).json({ error: "Geçersiz admin token." });
  }
}

// Yetkinlik analizi yapan fonksiyon
async function analyzeSkills(description) {
  const skills = [];
  const text = description.toLowerCase();
  
  // Basit anahtar kelime tabanlı analiz
  if (text.includes('takım') || text.includes('ekip') || text.includes('grup')) {
    skills.push('Takım Çalışması');
  }
  if (text.includes('yönet') || text.includes('lider') || text.includes('koordine')) {
    skills.push('Liderlik');
  }
  if (text.includes('yardım') || text.includes('destek') || text.includes('empati')) {
    skills.push('Empati');
  }
  if (text.includes('iletişim') || text.includes('konuş') || text.includes('anlat')) {
    skills.push('İletişim');
  }
  if (text.includes('problem') || text.includes('çöz') || text.includes('analiz')) {
    skills.push('Problem Çözme');
  }
  if (text.includes('plan') || text.includes('düzen') || text.includes('program')) {
    skills.push('Planlama');
  }
  if (text.includes('sorumluluk') || text.includes('görev') || text.includes('sorumlu')) {
    skills.push('Sorumluluk');
  }
  if (text.includes('gönüllü') || text.includes('volunteer')) {
    skills.push('Gönüllülük');
  }
  
  return skills;
}

// ===== KULLANICI İŞLEMLERİ =====

// Kullanıcı kayıt
router.post("/register", async (req, res) => {
  try {
    console.log("Yeni kullanıcı kaydı:", req.body);
    
    // Form verilerini al
    const { name, email, password } = req.body;
    
    // Aynı email ile kullanıcı var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta ile zaten bir kullanıcı var." });
    }
    
    // Şifreyi hashle (güvenlik için)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Yeni kullanıcı oluştur
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    // Veritabanına kaydet
    await newUser.save();
    
    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email, 
        role: newUser.role 
      }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    console.log("Kullanıcı başarıyla kaydedildi:", newUser.email);
    
    res.status(201).json({ 
      message: "Kayıt başarılı!", 
      token, 
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role 
      } 
    });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    res.status(500).json({ error: "Kayıt sırasında bir hata oluştu." });
  }
});

// Kullanıcı giriş
router.post("/login", async (req, res) => {
  try {
    console.log("Kullanıcı giriş denemesi:", req.body.email);
    
    // Form verilerini al
    const { email, password } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Kullanıcı bulunamadı." });
    }
    
    // Şifreyi kontrol et
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Şifre yanlış." });
    }
    
    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save();
    
    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    console.log("Giriş başarılı:", user.email);
    
    res.json({ 
      message: "Giriş başarılı!", 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu." });
  }
});

// ===== ADMIN İŞLEMLERİ =====

// Admin giriş
router.post("/admin/login", async (req, res) => {
  try {
    console.log("Admin giriş denemesi:", req.body.email);
    
    // Form verilerini al
    const { email, password } = req.body;
    
    // Admin kullanıcıyı bul
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(400).json({ error: "Admin kullanıcı bulunamadı." });
    }
    
    // Şifreyi kontrol et
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Şifre yanlış." });
    }
    
    // Son giriş tarihini güncelle
    admin.lastLogin = new Date();
    await admin.save();
    
    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: admin._id, 
        email: admin.email, 
        role: admin.role 
      }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    console.log("Admin girişi başarılı:", admin.email);
    
    res.json({ 
      message: "Admin girişi başarılı!", 
      token, 
      user: { 
        id: admin._id, 
        name: admin.name, 
        email: admin.email, 
        role: admin.role 
      } 
    });
  } catch (error) {
    console.error("Admin giriş hatası:", error);
    res.status(500).json({ error: "Admin girişi sırasında bir hata oluştu." });
  }
});

// İlk admin kullanıcı oluştur (sadece geliştirme için)
router.post("/admin/create-first", async (req, res) => {
  try {
    // Zaten admin var mı kontrol et
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin kullanıcı zaten mevcut." });
    }
    
    // Form verilerini al
    const { name, email, password } = req.body;
    
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Admin kullanıcı oluştur
    const admin = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'admin' 
    });
    
    // Veritabanına kaydet
    await admin.save();
    
    console.log("İlk admin kullanıcı oluşturuldu:", admin.email);
    
    res.status(201).json({ 
      message: "İlk admin kullanıcı oluşturuldu!", 
      admin: { 
        id: admin._id, 
        name: admin.name, 
        email: admin.email, 
        role: admin.role 
      } 
    });
  } catch (error) {
    console.error("Admin oluşturma hatası:", error);
    res.status(500).json({ error: "Admin oluşturma sırasında bir hata oluştu." });
  }
});

// Admin dashboard verileri
router.get("/admin/dashboard", checkAdminToken, async (req, res) => {
  try {
    console.log("Admin dashboard verisi isteniyor...");
    
    // Kullanıcı sayıları
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 }) // En yeniler önce
      .limit(5) // Sadece 5 tane
      .select('name email createdAt lastLogin'); // Sadece bu alanları getir
    
    console.log(`Kullanıcı sayıları - Normal: ${totalUsers}, Admin: ${totalAdmins}`);
    
    // Faaliyet sayıları
    const totalActivities = await Activity.countDocuments();
    
    // Faaliyet türlerine göre grupla
    const activitiesByType = await Activity.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }, // Türe göre grupla ve say
      { $sort: { count: -1 } } // Sayıya göre sırala (çoktan aza)
    ]);
    
    console.log(`Toplam faaliyet: ${totalActivities}`);
    
    // En popüler yetkinlikler
    const topSkills = await Activity.aggregate([
      { $unwind: "$skills" }, // Skills dizisini aç
      { $group: { _id: "$skills", count: { $sum: 1 } } }, // Yetkinliğe göre grupla
      { $sort: { count: -1 } }, // Sayıya göre sırala
      { $limit: 10 } // İlk 10 tanesini al
    ]);
    
    console.log(`En popüler yetkinlikler:`, topSkills);
    
    // Son eklenen faaliyetler
    const recentActivities = await Activity.find()
      .populate('userId', 'name email') // Kullanıcı bilgilerini de getir
      .sort({ createdAt: -1 }) // En yeniler önce
      .limit(10) // Sadece 10 tane
      .select('title type createdAt userId skills'); // Sadece bu alanları getir
    
    console.log(`Son faaliyetler: ${recentActivities.length} adet`);
    
    // Son 6 ayın faaliyet trendi
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyActivities = await Activity.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } }, // Son 6 ayı filtrele
      { 
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } } // Tarihe göre sırala
    ]);
    
    // Kullanıcı faaliyet dağılımı
    const userActivityCounts = await Activity.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } }, // Kullanıcıya göre grupla
      { $group: { _id: "$count", users: { $sum: 1 } } }, // Sayıya göre grupla
      { $sort: { _id: 1 } } // Sayıya göre sırala
    ]);
    
    // Verileri birleştir ve gönder
    const dashboardData = {
      users: {
        total: totalUsers || 0,
        admins: totalAdmins || 0,
        recent: recentUsers || []
      },
      activities: {
        total: totalActivities || 0,
        byType: activitiesByType || [],
        recent: recentActivities || [],
        monthlyTrend: monthlyActivities || [],
        userDistribution: userActivityCounts || []
      },
      skills: {
        topSkills: topSkills || []
      }
    };
    
    console.log("Dashboard verisi hazırlandı");
    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard hatası:", error);
    res.status(500).json({ error: "Dashboard verisi alınırken hata oluştu: " + error.message });
  }
});

// Kullanıcı listesi (admin için)
router.get("/admin/users", checkAdminToken, async (req, res) => {
  try {
    console.log("Admin kullanıcı listesi isteniyor...");
    
    // Sayfa numarası ve limit
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Kullanıcıları getir
    const users = await User.find({ role: 'user' }) // Sadece normal kullanıcılar
      .populate('activities') // Faaliyet bilgilerini de getir
      .sort({ createdAt: -1 }) // En yeniler önce
      .skip(skip) // Sayfalama için atla
      .limit(limit) // Limit uygula
      .select('-password'); // Şifreyi döndürme
    
    // Toplam kullanıcı sayısı
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Sayfa bilgileri
    const paginationInfo = {
      current: page,
      total: Math.ceil(totalUsers / limit),
      count: users.length,
      totalUsers: totalUsers
    };
    
    console.log(`${users.length} kullanıcı gönderildi (Sayfa: ${page})`);
    
    res.json({
      users,
      pagination: paginationInfo
    });
  } catch (error) {
    console.error("Kullanıcı listesi hatası:", error);
    res.status(500).json({ error: "Kullanıcı listesi alınırken hata oluştu." });
  }
});

// Kullanıcı detayları (admin için)
router.get("/admin/users/:userId", checkAdminToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Kullanıcı detayları isteniyor: ${userId}`);
    
    // Kullanıcıyı bul
    const user = await User.findById(userId)
      .populate('activities') // Faaliyet bilgilerini de getir
      .select('-password'); // Şifreyi döndürme
    
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    
    console.log(`Kullanıcı detayları gönderildi: ${user.email}`);
    res.json({ user });
  } catch (error) {
    console.error("Kullanıcı detay hatası:", error);
    res.status(500).json({ error: "Kullanıcı detayı alınırken hata oluştu." });
  }
});

// Kullanıcı sil (admin için)
router.delete("/admin/users/:userId", checkAdminToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Kullanıcı siliniyor: ${userId}`);
    
    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    
    // Kullanıcının faaliyetlerini sil
    await Activity.deleteMany({ userId: userId });
    console.log(`Kullanıcının faaliyetleri silindi: ${userId}`);
    
    // Kullanıcıyı sil
    await User.findByIdAndDelete(userId);
    console.log(`Kullanıcı silindi: ${user.email}`);
    
    res.json({ message: "Kullanıcı ve tüm faaliyetleri başarıyla silindi." });
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error);
    res.status(500).json({ error: "Kullanıcı silinirken hata oluştu." });
  }
});

// ===== FAASLİYET İŞLEMLERİ =====

// Yeni faaliyet ekle
router.post("/:userId/add-activity", checkUserToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, description, date, type, duration } = req.body;
    
    console.log(`Faaliyet ekleniyor - Kullanıcı: ${userId}`);
    console.log("Faaliyet verileri:", { title, description, date, type, duration });
    
    // Geçerli faaliyet türleri (frontend ile uyumlu)
    const validTypes = [
      'eğitim', 'sağlık', 'çevre', 'sosyal', 'kültür', 
      'spor', 'teknoloji', 'afet', 'hayvan', 'proje', 
      'etkinlik', 'diğer'
    ];
    
    // Faaliyet türü kontrolü
    if (!validTypes.includes(type)) {
      console.log(`Geçersiz faaliyet türü: ${type}`);
      return res.status(400).json({ 
        error: `Geçersiz faaliyet türü. Geçerli türler: ${validTypes.join(', ')}` 
      });
    }
    
    let detectedSkills = [];
    
    // Python API'sından yetkinlik analizi iste
    try {
      console.log("Python API'si ile yetkinlik analizi yapılıyor...");
      
      const skillResponse = await axios.post(PYTHON_API_URL, 
        { text: description },
        { 
          timeout: 10000, // 10 saniye timeout
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      detectedSkills = skillResponse.data.skills || [];
      console.log("Python API'sinden gelen yetkinlikler:", detectedSkills);
    } catch (skillError) {
      console.log("Python API hatası:", skillError.message);
      console.log("Fallback yetkinlik analizi kullanılıyor...");
      
      // Python API çalışmıyorsa basit analiz yap
      detectedSkills = await analyzeSkills(description);
      console.log("Fallback yetkinlikler:", detectedSkills);
    }
    
    // Yeni faaliyet oluştur
    const newActivity = new Activity({ 
      title, 
      description, 
      date: new Date(date), 
      type, 
      duration: parseInt(duration), 
      skills: detectedSkills,
      userId: userId
    });
    
    console.log("Faaliyet kaydediliyor:", newActivity);
    
    // Faaliyeti kaydet
    await newActivity.save();
    
    // Kullanıcının faaliyet listesine ekle
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    user.activities.push(newActivity._id);
    await user.save();
    
    console.log("Faaliyet başarıyla eklendi. Yetkinlikler:", detectedSkills);
    
    res.status(201).json({
      message: "Faaliyet kullanıcıya başarıyla eklendi",
      user,
      activity: newActivity,
      skills: detectedSkills,
    });
  } catch (error) {
    console.error("Faaliyet ekleme hatası:", error);
    res.status(500).json({ error: "İşlem sırasında bir hata oluştu: " + error.message });
  }
});

// Kullanıcının faaliyetlerini getir
router.get("/:userId/activities", checkUserToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Kullanıcı faaliyetleri isteniyor: ${userId}`);
    
    // Kullanıcıyı ve faaliyetlerini getir
    const user = await User.findById(userId).populate("activities");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    console.log(`${user.activities.length} faaliyet gönderildi`);
    res.json({ activities: user.activities });
  } catch (error) {
    console.error("Faaliyet listeleme hatası:", error);
    res.status(500).json({ error: "Faaliyetler alınamadı" });
  }
});

// Kullanıcı yetkinlik analizi
router.get("/:userId/skill-analysis", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Yetkinlik analizi isteniyor: ${userId}`);
    
    // Kullanıcıyı ve faaliyetlerini getir
    const user = await User.findById(userId).populate("activities");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // Yetkinlikleri say
    const skillCounts = {};
    user.activities.forEach(activity => {
      if (activity.skills) {
        activity.skills.forEach(skill => {
          if (skillCounts[skill]) {
            skillCounts[skill] = skillCounts[skill] + 1;
          } else {
            skillCounts[skill] = 1;
          }
        });
      }
    });
    
    // Yetkinlikleri sırala (en yüksekten en düşüğe)
    const sortedSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]);
    
    // En güçlü 2 yetkinlik
    const topSkills = sortedSkills.slice(0, 2).map(([skill]) => skill);
    
    // En zayıf 2 yetkinlik
    const weakSkills = sortedSkills.slice(-2).map(([skill]) => skill);
    
    // Öneriler oluştur
    const suggestions = weakSkills.map(skill => 
      `${skill} yetkinliğini geliştirmek için ilgili faaliyetler ekleyebilirsiniz.`
    );
    
    console.log("Yetkinlik analizi tamamlandı");
    
    res.json({
      top_skills: topSkills,
      weak_skills: weakSkills,
      all_skill_counts: skillCounts,
      suggestions
    });
  } catch (error) {
    console.error("Yetkinlik analizi hatası:", error);
    res.status(500).json({ error: "Analiz sırasında hata oluştu" });
  }
});

// ===== AI ASİSTAN İŞLEMLERİ =====

// AI Asistan ile sohbet
router.post("/:userId/chat", checkUserToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { message } = req.body;
    
    console.log(`AI Asistan sohbet - Kullanıcı: ${userId}, Mesaj: "${message}"`);
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: "Mesaj boş olamaz" });
    }
    
    // Kullanıcının yetkinliklerini ve faaliyetlerini getir
    const user = await User.findById(userId).populate("activities");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    // Kullanıcının yetkinliklerini topla
    const userSkills = [];
    const userActivities = user.activities || [];
    
    user.activities.forEach(activity => {
      if (activity.skills) {
        activity.skills.forEach(skill => {
          if (!userSkills.includes(skill)) {
            userSkills.push(skill);
          }
        });
      }
    });
    
    // AI Asistan'dan cevap al
    const assistantResponse = aiAssistant.processMessage(message, userSkills, userActivities);
    
    console.log(`AI Asistan cevabı: "${assistantResponse.substring(0, 50)}..."`);
    
    res.json({
      message: "AI Asistan cevabı hazır",
      userMessage: message,
      assistantResponse: assistantResponse,
      userSkills: userSkills,
      totalActivities: userActivities.length
    });
    
  } catch (error) {
    console.error("AI Asistan sohbet hatası:", error);
    res.status(500).json({ error: "AI Asistan ile iletişimde hata oluştu: " + error.message });
  }
});

// ===== DİĞER İŞLEMLER =====

// Python API'sine yetkinlik analizi gönder (test için)
router.post("/analyze-skill", async (req, res) => {
  try {
    const { text } = req.body;
    console.log("Yetkinlik analizi isteniyor:", text.substring(0, 50) + "...");
    
    const response = await axios.post(PYTHON_API_URL, { text });
    console.log("Python API'si cevap verdi:", response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error("Yetkinlik analizi hatası:", error);
    res.status(500).json({ error: "Skill analysis failed" });
  }
});

// Basit kullanıcı oluşturma (eski endpoint)
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log("Basit kullanıcı oluşturuluyor:", { name, email });
    
    const user = new User({ name, email });
    await user.save();
    
    console.log("Basit kullanıcı oluşturuldu");
    res.status(201).json({ message: "Kullanıcı kaydedildi", user });
  } catch (error) {
    console.error("Basit kullanıcı oluşturma hatası:", error);
    res.status(500).json({ error: "Kullanıcı kaydedilemedi" });
  }
});

// Router'ı dışa aktar
module.exports = router;