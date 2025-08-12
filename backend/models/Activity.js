// MongoDB için mongoose kütüphanesini yükle
const mongoose = require("mongoose");

// Faaliyet şemasını oluştur
const activitySchema = new mongoose.Schema({
  // Faaliyet başlığı
  title: {
    type: String,
    required: true // Zorunlu alan
  },
  
  // Faaliyet açıklaması
  description: {
    type: String,
    required: true // Zorunlu alan
  },
  
  // Faaliyet tarihi
  date: {
    type: Date,
    required: true // Zorunlu alan
  },
  
  // Faaliyet türü (eğitim, sağlık, çevre vs.)
  type: {
    type: String,
    required: true // Zorunlu alan
    // enum kısıtlaması kaldırıldı - frontend'de kontrol edilecek
  },
  
  // Faaliyet süresi (dakika cinsinden)
  duration: {
    type: Number,
    required: true, // Zorunlu alan
    min: 1 // En az 1 dakika olmalı
  },
  
  // Faaliyetten çıkarılan yetkinlikler
  skills: [{
    type: String // String dizisi
  }],
  
  // Bu faaliyeti ekleyen kullanıcı
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // User koleksiyonuna bağlantı
    required: true // Zorunlu alan
  },
  
  // Kayıt tarihi
  createdAt: {
    type: Date,
    default: Date.now // Şu anki tarih
  }
});

// Modeli dışa aktar
module.exports = mongoose.model("Activity", activitySchema);
