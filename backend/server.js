const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Express uygulamasını oluştur
const app = express();

// Sunucu portu
const PORT = process.env.PORT || 5000;

// Middleware'ları ekle
// CORS ayarları - Frontend'e erişim izni
app.use(cors({
  origin: [
    "http://localhost:3000", // Local development
    "https://cosmic-tartufo-dc129b.netlify.app" // Netlify production
  ],
  credentials: true
}));
app.use(express.json()); // JSON verilerini okuyabilmek için

// MongoDB'ye bağlan (orijinal cloud bağlantısı)
mongoose
  .connect("mongodb+srv://admin:123456Ek@cluster0.tv70e1e.mongodb.net/gonulluDB?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB bağlantısı başarılı!"))
  .catch((error) => console.log("❌ MongoDB bağlantı hatası:", error));

// API rotalarını ekle
const userRoutes = require("./routes/userRoutes");
const agentRoutes = require("./api/agentRoutes");

app.use("/api/users", userRoutes);
app.use("/api/agents", agentRoutes);

// Ana sayfa
app.get("/", (req, res) => {
  res.json({ 
    message: "Volunteer Skill Map API çalışıyor!",
    version: "2.0.0",
    features: {
      userManagement: "Kullanıcı yönetimi ve faaliyet takibi",
      agentSystem: "AI Agent sistemi (Learning, Assistant, Extractor)",
      skillAnalysis: "Otomatik yetkinlik analizi ve öneriler"
    },
    endpoints: {
      users: [
        "POST /api/users/register - Kullanıcı kayıt",
        "POST /api/users/login - Kullanıcı giriş",
        "POST /api/users/admin/login - Admin giriş",
        "GET /api/users/admin/dashboard - Admin dashboard",
        "POST /api/users/:userId/add-activity - Faaliyet ekle",
        "GET /api/users/:userId/learning-analysis - Öğrenme analizi"
      ],
      agents: [
        "GET /api/agents/status - Agent sistemi durumu",
        "GET /api/agents/health - Sağlık kontrolü",
        "POST /api/agents/assistant/chat - AI Assistant sohbet",
        "POST /api/agents/extract-skills - Yetkinlik çıkarma",
        "GET /api/agents/skill-recommendation/:skill/:level - Yetkinlik önerisi",
        "GET /api/agents/personalized-suggestions/:userId - Kişiselleştirilmiş öneriler"
      ]
    }
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
  console.log(`📡 API adresi: http://localhost:${PORT}`);
  console.log(`🤖 Agent sistemi: http://localhost:${PORT}/api/agents/status`);
  console.log(`📊 Admin: http://localhost:3000 (Admin girişi ile)`);
});