// MongoDB için mongoose kütüphanesini yükle
const mongoose = require('mongoose');

// Kullanıcı şemasını oluştur
const userSchema = new mongoose.Schema({
  // Kullanıcı adı (zorunlu)
  name: {
    type: String,
    required: true
  },
  
  // E-posta adresi (zorunlu ve benzersiz)
  email: {
    type: String,
    required: true,
    unique: true
  },
  
  // Şifre (zorunlu)
  password: {
    type: String,
    required: true
  },
  
  // Kullanıcı rolü (normal kullanıcı veya admin)
  role: {
    type: String,
    enum: ['user', 'admin'], // Sadece bu iki değer olabilir
    default: 'user' // Varsayılan olarak normal kullanıcı
  },
  
  // Kullanıcının faaliyetleri (diğer koleksiyona referans)
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity' // Activity koleksiyonuna bağlantı
  }],
  
  // Kayıt tarihi
  createdAt: {
    type: Date,
    default: Date.now // Şu anki tarih
  },
  
  // Son giriş tarihi
  lastLogin: {
    type: Date,
    default: Date.now // Şu anki tarih
  }
});

// Modeli dışa aktar
module.exports = mongoose.model('User', userSchema);
