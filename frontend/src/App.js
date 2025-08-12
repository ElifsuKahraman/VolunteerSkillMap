import React, { useState, useEffect } from "react";
import "./App.css";

// Backend API adresi
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/users";

function App() {
  // Kullanıcı bilgileri
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  
  // Sayfa durumları
  const [screen, setScreen] = useState("login"); // login, register, main
  const [page, setPage] = useState("home"); // home, profile, add, analysis, learning
  
  // Giriş formu
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  // Kayıt formu
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  
  // Hata ve başarı mesajları
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Faaliyet listesi
  const [activities, setActivities] = useState([]);
  
  // Yeni faaliyet formu
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityType, setActivityType] = useState("");
  const [activityDuration, setActivityDuration] = useState("");
  const [addMessage, setAddMessage] = useState("");
  
  // Analiz sonuçları
  const [analysis, setAnalysis] = useState(null);
  
  // Agent öğrenme analizi
  const [learningAnalysis, setLearningAnalysis] = useState(null);
  const [learningLoading, setLearningLoading] = useState(false);
  
  // Admin verileri
  const [adminData, setAdminData] = useState(null);

  // Kullanıcı faaliyetlerini yükle
  useEffect(() => {
    if (user && token && user.role === 'user') {
      loadUserActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, addMessage]);

  // Analiz verilerini yükle
  useEffect(() => {
    if (user && token && page === "analysis" && user.role === 'user') {
      loadAnalysisData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, page]);

  // Agent öğrenme analizi verilerini yükle
  useEffect(() => {
    if (user && token && page === "learning" && user.role === 'user') {
      loadLearningAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, page]);

  // Admin verilerini yükle
  useEffect(() => {
    if (user && token && user.role === 'admin' && page === "dashboard") {
      loadAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, page]);

  // Kullanıcı faaliyetlerini getir
  function loadUserActivities() {
    fetch(`${API_URL}/${user.id}/activities`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => {
        if (data.activities) {
          setActivities(data.activities);
        }
      })
      .catch(error => {
        console.log("Faaliyetler yüklenirken hata:", error);
      });
  }

  // Analiz verilerini getir
  function loadAnalysisData() {
    fetch(`${API_URL}/${user.id}/skill-analysis`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => setAnalysis(data))
      .catch(error => {
        console.log("Analiz yüklenirken hata:", error);
      });
  }

  // Agent öğrenme analizi verilerini getir
  function loadLearningAnalysis() {
    console.log("🔄 Öğrenme analizi başlatılıyor...");
    console.log("User ID:", user.id);
    console.log("Token:", token ? "var" : "yok");
    
    setLearningLoading(true);
    
    fetch(`${process.env.REACT_APP_API_URL?.replace('/api/users', '') || 'http://localhost:5000'}/api/agents/learning-analysis/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        console.log("📡 API Response Status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("📊 Agent analiz verisi:", data);
        if (data.analysis) {
          setLearningAnalysis(data.analysis);
          console.log("✅ Analiz verileri state'e kaydedildi");
        } else {
          console.log("⚠️ API'den analiz verisi gelmedi:", data);
        }
      })
      .catch(error => {
        console.error("❌ Agent öğrenme analizi hatası:", error);
        // Fallback: Basit analiz endpoint'ini dene
        console.log("🔄 Fallback olarak basit analiz deneniyor...");
        
        fetch(`${API_URL}/${user.id}/skill-analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => response.json())
          .then(fallbackData => {
            console.log("📊 Fallback analiz verisi:", fallbackData);
            // Basit veriyi agent formatına dönüştür
            const mockAnalysis = {
              totalActivities: activities.length || 0,
              totalSkills: fallbackData.all_skill_counts ? Object.keys(fallbackData.all_skill_counts).length : 0,
              progressPercentage: Math.min((activities.length || 0) * 20, 100),
              motivationMessage: "Harika gidiyorsun! Gönüllülük yolculuğunda her adım değerli. 🌟",
              skillCounts: fallbackData.all_skill_counts || {},
              skillLevels: {},
              recommendations: fallbackData.suggestions ? fallbackData.suggestions.map(s => ({
                skill: "Genel",
                message: s,
                type: "geliştir",
                priority: "orta"
              })) : [],
              milestones: [
                { name: "İlk Faaliyet", achieved: (activities.length || 0) >= 1, target: 1, current: activities.length || 0 },
                { name: "5 Faaliyet", achieved: (activities.length || 0) >= 5, target: 5, current: activities.length || 0 },
                { name: "10 Faaliyet", achieved: (activities.length || 0) >= 10, target: 10, current: activities.length || 0 }
              ],
              missingSkills: ["İletişim", "Takım Çalışması", "Liderlik", "Problem Çözme"],
              lastUpdated: new Date().toISOString()
            };
            setLearningAnalysis(mockAnalysis);
            console.log("✅ Fallback analiz verileri kullanıldı");
          })
          .catch(fallbackError => {
            console.error("❌ Fallback analiz de başarısız:", fallbackError);
          });
      })
      .finally(() => {
        setLearningLoading(false);
      });
  }

  // Admin verilerini getir
  function loadAdminData() {
    fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(data => setAdminData(data))
      .catch(error => {
        console.log("Admin verileri yüklenirken hata:", error);
      });
  }

  // Giriş yap fonksiyonu
  function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");
    
    const loginUrl = isAdminLogin ? `${API_URL}/admin/login` : `${API_URL}/login`;
    
    fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          setUser(data.user);
          setToken(data.token);
          setScreen("main");
          
          // Admin ise dashboard'a, normal kullanıcı ise home'a git
          if (data.user.role === 'admin') {
            setPage("dashboard");
          } else {
            setPage("home");
          }
          
          // Formu temizle
          setLoginEmail("");
          setLoginPassword("");
        } else {
          setErrorMessage(data.error || "Giriş yapılamadı");
        }
      })
      .catch(error => {
        setErrorMessage("Giriş sırasında hata oluştu");
      });
  }

  // Kayıt ol fonksiyonu
  function handleRegister(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          setSuccessMessage("Kayıt başarılı! Giriş sayfasına yönlendiriliyor...");
          
          // Formu temizle
          setRegisterName("");
          setRegisterEmail("");
          setRegisterPassword("");
          
          // 2 saniye sonra giriş sayfasına git
          setTimeout(() => {
            setScreen("login");
            setSuccessMessage("");
          }, 2000);
        } else {
          setErrorMessage(data.error || "Kayıt yapılamadı");
        }
      })
      .catch(error => {
        setErrorMessage("Kayıt sırasında hata oluştu");
      });
  }

  // Çıkış yap fonksiyonu
  function handleLogout() {
    setUser(null);
    setToken("");
    setScreen("login");
    setPage("home");
    setActivities([]);
    setAnalysis(null);
    setAdminData(null);
    setIsAdminLogin(false);
    
    // Tüm formları temizle
    setLoginEmail("");
    setLoginPassword("");
    setErrorMessage("");
  }

  // Yeni faaliyet ekle
  function handleAddActivity(e) {
    e.preventDefault();
    setAddMessage("");
    
    if (!user || !token) {
      setAddMessage("Giriş yapmalısınız");
      return;
    }
    
    fetch(`${API_URL}/${user.id}/add-activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: activityTitle,
        description: activityDescription,
        date: activityDate,
        type: activityType,
        duration: parseInt(activityDuration)
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          let message = "✅ Faaliyet başarıyla eklendi!";
          
          if (data.skills && data.skills.length > 0) {
            message += "\n\nKazanılan yetkinlikler: ";
            data.skills.forEach(skill => {
              message += getSkillIcon(skill) + " " + skill + " ";
            });
          } else {
            message += "\n\nHenüz yetkinlik tespit edilmedi.";
          }
          
          setAddMessage(message);
          
          // Formu temizle
          setActivityTitle("");
          setActivityDescription("");
          setActivityDate("");
          setActivityType("");
          setActivityDuration("");
        } else {
          setAddMessage(data.error || "Faaliyet eklenirken hata oluştu");
        }
      })
      .catch(error => {
        setAddMessage("Faaliyet eklenirken hata oluştu");
      });
  }

  // Yetkinlik ikonu getir
  function getSkillIcon(skill) {
    if (skill === "Teknik Yetkinlik") return "💻";
    if (skill === "Takım Çalışması") return "🤝";
    if (skill === "Empati") return "💖";
    if (skill === "Sorumluluk") return "📝";
    if (skill === "İletişim") return "🗣️";
    if (skill === "Liderlik") return "👑";
    if (skill === "Problem Çözme") return "🧩";
    if (skill === "Planlama") return "📅";
    if (skill === "Gönüllülük") return "❤️";
    return "⭐";
  }

  // Karakter sayısını kontrol et
  function handleDescriptionChange(e) {
    if (e.target.value.length <= 500) {
      setActivityDescription(e.target.value);
    }
  }

  // Giriş sayfası
  if (screen === "login") {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{isAdminLogin ? "🔐 Admin Girişi" : "🌟 Giriş Yap"}</h2>
            <p className="auth-subtitle">
              {isAdminLogin ? "Yönetici paneline erişin" : "Gönüllülük yolculuğuna devam et"}
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="auth-form">
            <input 
              type="email" 
              placeholder="E-posta" 
              value={loginEmail} 
              onChange={e => setLoginEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              value={loginPassword} 
              onChange={e => setLoginPassword(e.target.value)} 
              required 
            />
            <button type="submit">
              {isAdminLogin ? "Admin Girişi" : "Giriş Yap"}
            </button>
          </form>
          
          {errorMessage && <p className="auth-error">{errorMessage}</p>}
          
          <div className="auth-switches">
            {!isAdminLogin && (
              <p className="auth-switch">
                Hesabın yok mu? 
                <span onClick={() => {
                  setScreen("register");
                  setErrorMessage("");
                }}>
                  Üye Ol
                </span>
              </p>
            )}
            
            <p className="auth-switch">
              <span onClick={() => {
                setIsAdminLogin(!isAdminLogin);
                setErrorMessage("");
                setLoginEmail("");
                setLoginPassword("");
              }}>
                {isAdminLogin ? "Kullanıcı girişine geç" : "Admin girişi"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Kayıt sayfası
  if (screen === "register") {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-header">
            <h2>🌟 Üye Ol</h2>
            <p className="auth-subtitle">Gönüllülük serüvenine başla</p>
          </div>
          
          <form onSubmit={handleRegister} className="auth-form">
            <input 
              type="text" 
              placeholder="Ad Soyad" 
              value={registerName} 
              onChange={e => setRegisterName(e.target.value)} 
              required 
            />
            <input 
              type="email" 
              placeholder="E-posta" 
              value={registerEmail} 
              onChange={e => setRegisterEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              value={registerPassword} 
              onChange={e => setRegisterPassword(e.target.value)} 
              required 
            />
            <button type="submit">Üye Ol</button>
          </form>
          
          {successMessage && <p className="auth-success">{successMessage}</p>}
          {errorMessage && <p className="auth-error">{errorMessage}</p>}
          
          <p className="auth-switch">
            Zaten hesabın var mı? 
            <span onClick={() => {
              setScreen("login");
              setErrorMessage("");
            }}>
              Giriş Yap
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Ana uygulama
  return (
    <div className="app-bg">
      <Banner user={user} />
      
      {user && user.role === 'admin' ? (
        <AdminNavbar 
          page={page} 
          setPage={setPage} 
          handleLogout={handleLogout} 
        />
      ) : (
        <Navbar 
          page={page} 
          setPage={setPage} 
          handleLogout={handleLogout} 
        />
      )}
      
      <div className="main-content">
        {user && user.role === 'admin' ? (
          <div>
            {page === "dashboard" && <AdminDashboard adminData={adminData} />}
            {page === "users" && <AdminUsers token={token} />}
            {page === "activities" && <AdminActivities token={token} />}
          </div>
        ) : (
          <div>
            {page === "home" && <Home />}
            {page === "profile" && <Profile user={user} activities={activities} />}
            {page === "add" && (
              <AddActivity 
                activityTitle={activityTitle}
                setActivityTitle={setActivityTitle}
                activityDescription={activityDescription}
                setActivityDescription={setActivityDescription}
                activityDate={activityDate}
                setActivityDate={setActivityDate}
                activityType={activityType}
                setActivityType={setActivityType}
                activityDuration={activityDuration}
                setActivityDuration={setActivityDuration}
                handleAddActivity={handleAddActivity}
                handleDescriptionChange={handleDescriptionChange}
                addMessage={addMessage}
              />
            )}
            {page === "analysis" && <AnalysisPage analysis={analysis} />}
            {page === "learning" && (
              <LearningPage 
                learningAnalysis={learningAnalysis} 
                learningLoading={learningLoading}
                loadLearningAnalysis={loadLearningAnalysis}
              />
            )}
            {page === "assistant" && <AIAssistant user={user} token={token} />}
          </div>
        )}
      </div>
    </div>
  );
}

// Banner bileşeni
function Banner({ user }) {
  return (
    <div className="banner">
      <h1>
        {user && user.role === 'admin' ? '🔐 Yönetici Paneli' : '🌟 Volunteer Skill Map'}
      </h1>
      <p>
        {user && user.role === 'admin' 
          ? `Hoş geldin ${user.name}! Sistem yönetimi` 
          : 'Gönüllülükle Yüksel!'
        }
      </p>
    </div>
  );
}

// Normal kullanıcı menüsü
function Navbar({ page, setPage, handleLogout }) {
  return (
    <nav className="navbar">
      <button 
        className={page === "home" ? "nav-link active" : "nav-link"} 
        onClick={() => setPage("home")}
      >
        🏠 Ana Sayfa
      </button>
      <button 
        className={page === "profile" ? "nav-link active" : "nav-link"} 
        onClick={() => setPage("profile")}
      >
        👤 Profilim
      </button>
             <button 
         className={page === "add" ? "nav-link active" : "nav-link"} 
         onClick={() => setPage("add")}
       >
         ➕ Etkinlik Ekle
       </button>
       <button 
         className={page === "analysis" ? "nav-link active" : "nav-link"} 
         onClick={() => setPage("analysis")}
       >
         📊 Profil Analizi
       </button>
       <button 
         className={page === "learning" ? "nav-link active" : "nav-link"} 
         onClick={() => setPage("learning")}
       >
         🎯 Öğrenme Rehberi
       </button>
       <button 
         className={page === "assistant" ? "nav-link active" : "nav-link"} 
         onClick={() => setPage("assistant")}
       >
         🤖 AI Asistan
       </button>
      <button className="nav-link logout-btn" onClick={handleLogout}>
        🚪 Çıkış Yap
      </button>
    </nav>
  );
}

// Admin menüsü
function AdminNavbar({ page, setPage, handleLogout }) {
  return (
    <nav className="navbar admin-navbar">
      <button 
        className={page === "dashboard" ? "nav-link active" : "nav-link"} 
        onClick={() => setPage("dashboard")}
      >
        📊 Dashboard
      </button>
      <button 
        className={page === "users" ? "nav-link active" : "nav-link"} 
        onClick={() => setPage("users")}
      >
        👥 Kullanıcılar
      </button>
      <button 
        className={page === "activities" ? "nav-link active" : "nav-link"} 
        onClick={() => setPage("activities")}
      >
        📋 Faaliyetler
      </button>
      <button className="nav-link logout-btn" onClick={handleLogout}>
        🚪 Çıkış Yap
      </button>
    </nav>
  );
}

// Admin dashboard sayfası
function AdminDashboard({ adminData }) {
  // Veri yükleniyorsa loading göster
  if (!adminData || !adminData.users || !adminData.activities || !adminData.skills) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>📊 Sistem Dashboard</h2>
        <p>Gönüllülük platformu genel istatistikleri</p>
      </div>

      {/* Sayı kartları */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>{adminData.users.total || 0}</h3>
            <p>Toplam Kullanıcı</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <h3>{adminData.activities.total || 0}</h3>
            <p>Toplam Faaliyet</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⭐</div>
          <div className="metric-content">
            <h3>{adminData.skills.topSkills ? adminData.skills.topSkills.length : 0}</h3>
            <p>Farklı Yetkinlik</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🔐</div>
          <div className="metric-content">
            <h3>{adminData.users.admins || 0}</h3>
            <p>Admin Kullanıcı</p>
          </div>
        </div>
      </div>

      {/* Faaliyet türleri grafiği */}
      {adminData.activities.byType && adminData.activities.byType.length > 0 && (
        <div className="dashboard-section">
          <h3>📊 Popüler Faaliyet Türleri</h3>
          <div className="activity-types-chart">
            {adminData.activities.byType.map((type, index) => {
              // En yüksek değeri bul
              const maxCount = Math.max(...adminData.activities.byType.map(t => t.count || 1));
              const percentage = (type.count / maxCount) * 100;
              
              return (
                <div key={type._id || index} className="chart-bar">
                  <div className="bar-label">{type._id || 'Bilinmeyen'}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <span className="bar-value">{type.count || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popüler yetkinlikler */}
      {adminData.skills.topSkills && adminData.skills.topSkills.length > 0 && (
        <div className="dashboard-section">
          <h3>🌟 En Popüler Yetkinlikler</h3>
          <div className="skills-grid">
            {adminData.skills.topSkills.slice(0, 8).map((skill, index) => (
              <div key={skill._id || index} className="skill-card">
                <span className="skill-icon">{getSkillIcon(skill._id)}</span>
                <span className="skill-name">{skill._id || 'Bilinmeyen'}</span>
                <span className="skill-count">{skill.count || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yeni kullanıcılar */}
      {adminData.users.recent && adminData.users.recent.length > 0 && (
        <div className="dashboard-section">
          <h3>👋 Son Katılan Kullanıcılar</h3>
          <div className="recent-users">
            {adminData.users.recent.map(user => (
              <div key={user._id} className="user-item">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="user-info">
                  <h4>{user.name || 'İsimsiz'}</h4>
                  <p>{user.email || 'Email yok'}</p>
                  <small>
                    Katılım: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmeyen'}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Son faaliyetler */}
      {adminData.activities.recent && adminData.activities.recent.length > 0 && (
        <div className="dashboard-section">
          <h3>📈 Son Eklenen Faaliyetler</h3>
          <div className="recent-activities">
            {adminData.activities.recent.map(activity => (
              <div key={activity._id} className="activity-item">
                <div className="activity-type">{activity.type || 'Bilinmeyen'}</div>
                <div className="activity-info">
                  <h4>{activity.title || 'Başlıksız'}</h4>
                  <p>
                    {activity.userId && activity.userId.name 
                      ? `${activity.userId.name} tarafından eklendi` 
                      : 'Kullanıcı bilinmiyor'
                    }
                  </p>
                  <small>
                    {activity.createdAt 
                      ? new Date(activity.createdAt).toLocaleDateString('tr-TR') 
                      : 'Tarih bilinmiyor'
                    }
                  </small>
                </div>
                <div className="activity-skills">
                  {activity.skills && activity.skills.map(skill => (
                    <span key={skill} className="skill-badge">
                      {getSkillIcon(skill)} {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Veri yoksa mesaj göster */}
      {(!adminData.activities.recent || adminData.activities.recent.length === 0) &&
       (!adminData.users.recent || adminData.users.recent.length === 0) &&
       (!adminData.skills.topSkills || adminData.skills.topSkills.length === 0) && (
        <div className="dashboard-section">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <h3>📊 Henüz veri yok</h3>
            <p>Kullanıcılar faaliyet eklemeye başladığında burada istatistikler görünecek.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Yetkinlik ikonu getir (AdminDashboard için)
function getSkillIcon(skill) {
  if (skill === "Teknik Yetkinlik") return "💻";
  if (skill === "Takım Çalışması") return "🤝";
  if (skill === "Empati") return "💖";
  if (skill === "Sorumluluk") return "📝";
  if (skill === "İletişim") return "🗣️";
  if (skill === "Liderlik") return "👑";
  if (skill === "Problem Çözme") return "🧩";
  if (skill === "Planlama") return "📅";
  if (skill === "Gönüllülük") return "❤️";
  return "⭐";
}

// Admin kullanıcı sayfası
function AdminUsers({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  // Sayfa yüklendiğinde kullanıcıları getir
  useEffect(() => {
    getUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Kullanıcı listesini getir
  function getUserList(page = 1) {
    fetch(`${API_URL}/admin/users?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        setUsers(data.users || []);
        setPagination(data.pagination || {});
        setLoading(false);
      })
      .catch(error => {
        console.log("Kullanıcılar yüklenirken hata:", error);
        setLoading(false);
      });
  }

  // Kullanıcı sil
  function deleteUser(userId, userName) {
    const confirmDelete = window.confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz?`);
    
    if (!confirmDelete) {
      return;
    }

    fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert('Kullanıcı başarıyla silindi.');
          getUserList(); // Listeyi yenile
        } else {
          alert('Kullanıcı silinirken hata oluştu.');
        }
      })
      .catch(error => {
        console.log("Kullanıcı silinirken hata:", error);
        alert('Kullanıcı silinirken hata oluştu.');
      });
  }

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>👥 Kullanıcı Yönetimi</h2>
        <p>Toplam {pagination.totalUsers || 0} kullanıcı</p>
      </div>

      <div className="users-grid">
        {users.map(user => (
          <div key={user._id} className="user-card">
            <div className="user-header">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="user-info">
                <h3>{user.name || 'İsimsiz'}</h3>
                <p>{user.email || 'Email yok'}</p>
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat">
                <span className="stat-label">Faaliyetler:</span>
                <span className="stat-value">{user.activities ? user.activities.length : 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Katılım:</span>
                <span className="stat-value">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmeyen'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Son Giriş:</span>
                <span className="stat-value">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : 'Bilinmeyen'}
                </span>
              </div>
            </div>

            <div className="user-actions">
              <button 
                className="delete-btn"
                onClick={() => deleteUser(user._id, user.name)}
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sayfa numaraları */}
      {pagination.total > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.total }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              className={pageNum === pagination.current ? "page-btn active" : "page-btn"}
              onClick={() => getUserList(pageNum)}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin faaliyet sayfası
function AdminActivities({ token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde faaliyetleri getir
  useEffect(() => {
    getActivitiesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Faaliyet listesini getir
  function getActivitiesList() {
    console.log("Admin faaliyetleri getiriliyor...");
    
    fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Dashboard verisi geldi:", data);
        
        // Güvenli şekilde faaliyetleri al
        const recentActivities = data && data.activities && data.activities.recent 
          ? data.activities.recent 
          : [];
        
        setActivities(recentActivities);
        setLoading(false);
      })
      .catch(error => {
        console.log("Faaliyetler yüklenirken hata:", error);
        setActivities([]);
        setLoading(false);
      });
  }

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Faaliyetler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>📋 Faaliyet Yönetimi</h2>
        <p>Son eklenen faaliyetler ({activities.length})</p>
      </div>

      <div className="activities-list">
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <h3>📋 Henüz faaliyet yok</h3>
            <p>Kullanıcılar faaliyet eklemeye başladığında burada görünecek.</p>
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity._id} className="activity-card">
              <div className="activity-header">
                <h3>{activity.title || 'Başlıksız Faaliyet'}</h3>
                <span className="activity-type-badge">{activity.type || 'Bilinmeyen'}</span>
              </div>
              
              <div className="activity-meta">
                <p>
                  <strong>Kullanıcı:</strong> {
                    activity.userId && activity.userId.name 
                      ? activity.userId.name 
                      : 'Bilinmeyen kullanıcı'
                  }
                </p>
                <p>
                  <strong>Ekleme Tarihi:</strong> {
                    activity.createdAt 
                      ? new Date(activity.createdAt).toLocaleDateString('tr-TR') 
                      : 'Tarih bilinmiyor'
                  }
                </p>
                {activity.date && (
                  <p>
                    <strong>Faaliyet Tarihi:</strong> {new Date(activity.date).toLocaleDateString('tr-TR')}
                  </p>
                )}
                {activity.duration && (
                  <p><strong>Süre:</strong> {activity.duration} dakika</p>
                )}
              </div>

              {activity.description && (
                <div className="activity-description">
                  <p><strong>Açıklama:</strong> {activity.description}</p>
                </div>
              )}

              <div className="activity-skills">
                <strong>Yetkinlikler:</strong>
                {activity.skills && activity.skills.length > 0 ? (
                  activity.skills.map(skill => (
                    <span key={skill} className="skill-badge">
                      {getSkillIcon(skill)} {skill}
                    </span>
                  ))
                ) : (
                  <span className="no-skills">Henüz yetkinlik tespit edilmedi</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Ana sayfa
function Home() {
  return (
    <div className="home home-explain">
      <h2>Gönüllülük Nedir?</h2>
      <p>
        Gönüllülük, bir bireyin topluma, çevresine veya bir amaca karşılıksız katkı sağlamak için 
        kendi isteğiyle yaptığı çalışmalardır. Gönüllülük, hem topluma hem de kişisel gelişime büyük katkı sağlar.
      </p>
      
      <h3>Gönüllülüğün Katkıları</h3>
      <ul className="home-list">
        <li>Yeni yetkinlikler ve deneyimler kazanırsın.</li>
        <li>Takım çalışması, liderlik, iletişim gibi becerilerin gelişir.</li>
        <li>Topluma fayda sağlarken kendini daha iyi tanırsın.</li>
        <li>Empati, sorumluluk ve problem çözme gibi değerler kazanırsın.</li>
        <li>CV'ni güçlendirir, yeni insanlarla tanışırsın.</li>
      </ul>
      
      <p className="home-motto">Sen de gönüllülükle yolunu çiz, gelişimini takip et!</p>
    </div>
  );
}

// Profil sayfası
function Profile({ user, activities }) {
  // Yetkinlikleri say
  const skillCounts = {};
  
  activities.forEach((activity) => {
    if (activity.skills) {
      activity.skills.forEach((skill) => {
        if (skillCounts[skill]) {
          skillCounts[skill] = skillCounts[skill] + 1;
        } else {
          skillCounts[skill] = 1;
        }
      });
    }
  });

  return (
    <div className="profile profile-full">
      <div className="profile-header-full">
        <div>
          <h2>{user ? user.name : 'Kullanıcı'}</h2>
          <p className="profile-bio">Genç gönüllü, yeni deneyimlere açık!</p>
        </div>
      </div>
      
      <div className="profile-section">
        <h3>Yetkinliklerim</h3>
        <div className="profile-skills-list">
          {Object.keys(skillCounts).length === 0 && <p>Henüz yetkinlik yok.</p>}
          {Object.entries(skillCounts).map(([skill, count]) => (
            <span className="badge" key={skill}>
              {getSkillIcon(skill)} {skill} <b>({count})</b>
            </span>
          ))}
        </div>
      </div>
      
      <div className="profile-section">
        <h3>Geçmiş Etkinliklerim</h3>
        <div className="profile-activity-list">
          {activities.length === 0 && <p>Henüz etkinlik eklemedin.</p>}
          {[...activities]
            .sort((a, b) => {
              const dateA = new Date(a.date || a.createdAt);
              const dateB = new Date(b.date || b.createdAt);
              return dateB - dateA; // Yeniden eskiye sırala
            })
            .map((event, idx) => (
              <EventCard key={idx} event={event} />
            ))}
        </div>
      </div>
    </div>
  );
}

// Etkinlik kartı
function EventCard({ event }) {
  return (
    <div className="event-card event-card-large">
      <div className="event-card-header">
        <h4>
          {event.title || (
            event.description.length > 24 
              ? event.description.slice(0, 24) + "..." 
              : event.description
          )}
        </h4>
        <span className="event-date">
          {event.date ? new Date(event.date).toLocaleDateString('tr-TR') : ""}
          {event.duration && ` • ${event.duration} dakika`}
        </span>
      </div>
      
      <div className="event-type-badge">
        <span className="type-badge">{event.type}</span>
      </div>
      
      <p>{event.description}</p>
      
      <div className="badges">
        {event.skills && event.skills.length > 0 && event.skills.map((skill, i) => (
          <span className="badge" key={i}>
            {getSkillIcon(skill)} {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

// Faaliyet ekleme sayfası
function AddActivity({ 
  activityTitle, 
  setActivityTitle,
  activityDescription, 
  setActivityDescription,
  activityDate, 
  setActivityDate,
  activityType, 
  setActivityType,
  activityDuration, 
  setActivityDuration,
  handleAddActivity,
  handleDescriptionChange,
  addMessage 
}) {
  
  // Formu temizle
  function clearForm() {
    setActivityTitle("");
    setActivityDescription("");
    setActivityDate("");
    setActivityType("");
    setActivityDuration("");
  }

  return (
    <div className="add-activity">
      <div className="add-activity-header">
        <h2>🌟 Yeni Gönüllü Faaliyeti Ekle</h2>
        <p className="add-activity-subtitle">Yaptığın gönüllü çalışmayı kaydet ve yetkinliklerini takip et</p>
      </div>
      
      <form className="activity-form" onSubmit={handleAddActivity}>
        {/* Başlık */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            <span className="label-icon">📝</span>
            Faaliyet Başlığı
            <span className="required">*</span>
          </label>
          <input 
            id="title"
            type="text" 
            placeholder="Örnek: Çevre temizliği, Yaşlı bakım ziyareti..." 
            value={activityTitle} 
            onChange={e => setActivityTitle(e.target.value)} 
            required 
            className="form-input"
          />
        </div>

        {/* Açıklama */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            <span className="label-icon">📋</span>
            Faaliyet Açıklaması
            <span className="required">*</span>
          </label>
          <textarea 
            id="description"
            placeholder="Yaptığın gönüllü faaliyeti detaylı olarak açıkla. Hangi görevleri üstlendin, kimlerle çalıştın, nasıl katkı sağladın..." 
            value={activityDescription} 
            onChange={handleDescriptionChange}
            rows={4} 
            required 
            className="form-textarea"
          />
          <div className="char-count">{activityDescription.length}/500 karakter</div>
        </div>

        {/* Tarih ve Süre */}
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="date" className="form-label">
              <span className="label-icon">📅</span>
              Faaliyet Tarihi
              <span className="required">*</span>
            </label>
            <input 
              id="date"
              type="date" 
              value={activityDate} 
              onChange={e => setActivityDate(e.target.value)} 
              required 
              className="form-input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group half-width">
            <label htmlFor="duration" className="form-label">
              <span className="label-icon">⏱️</span>
              Süre (Dakika)
              <span className="required">*</span>
            </label>
            <input 
              id="duration"
              type="number" 
              placeholder="60" 
              value={activityDuration} 
              onChange={e => setActivityDuration(e.target.value)} 
              min="15"
              max="1440"
              step="15"
              required 
              className="form-input"
            />
            <div className="duration-helper">
              {activityDuration && parseInt(activityDuration) > 0 && (
                <span className="duration-display">
                  ≈ {Math.floor(parseInt(activityDuration) / 60)} saat {parseInt(activityDuration) % 60} dakika
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Faaliyet türü */}
        <div className="form-group">
          <label htmlFor="type" className="form-label">
            <span className="label-icon">🏷️</span>
            Faaliyet Türü
            <span className="required">*</span>
          </label>
          <select 
            id="type"
            value={activityType} 
            onChange={e => setActivityType(e.target.value)}
            required
            className="form-select"
          >
            <option value="" disabled>Faaliyet türünü seçin</option>
            <option value="eğitim">📚 Eğitim & Öğretim</option>
            <option value="sağlık">🏥 Sağlık & Bakım</option>
            <option value="çevre">🌱 Çevre & Doğa</option>
            <option value="sosyal">🤝 Sosyal Yardım</option>
            <option value="kültür">🎭 Kültür & Sanat</option>
            <option value="spor">⚽ Spor & Rekreasyon</option>
            <option value="teknoloji">💻 Teknoloji & Dijital</option>
            <option value="afet">🚨 Afet & Acil Durum</option>
            <option value="hayvan">🐾 Hayvan Hakları</option>
            <option value="proje">🚀 Proje Yönetimi</option>
            <option value="etkinlik">🎉 Etkinlik Organizasyon</option>
            <option value="diğer">📦 Diğer</option>
          </select>
        </div>

        {/* Butonlar */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            <span className="btn-icon">💾</span>
            Faaliyeti Kaydet
          </button>
          <button 
            type="button" 
            className="clear-btn"
            onClick={clearForm}
          >
            <span className="btn-icon">🗑️</span>
            Temizle
          </button>
        </div>
      </form>
      
      {/* Sonuç mesajı */}
      {addMessage && (
        <div className="form-message">
          <div className="message-content">
            {addMessage}
          </div>
        </div>
      )}
    </div>
  );
}



// Analiz sayfası
function AnalysisPage({ analysis }) {
  // Yetkinlik ikonu getir
  function getSkillIcon(skill) {
    if (skill === "Teknik Yetkinlik") return "💻";
    if (skill === "Takım Çalışması") return "🤝";
    if (skill === "Empati") return "💖";
    if (skill === "Sorumluluk") return "📝";
    if (skill === "İletişim") return "🗣️";
    if (skill === "Liderlik") return "👑";
    if (skill === "Problem Çözme") return "🧩";
    if (skill === "Planlama") return "📅";
    if (skill === "Gönüllülük") return "❤️";
    return "⭐";
  }

  return (
    <div className="analysis-page">
      <h2>📊 Profil Analizi</h2>
      
      {!analysis && <p>Analiz yükleniyor...</p>}
      
      {analysis && (
        <div>
          {/* Yetkinlik Barları (Eski Yol Haritam) */}
          {analysis.all_skill_counts && Object.keys(analysis.all_skill_counts).length > 0 && (
            <div className="skill-map-section">
              <h3>🗺️ Yetkinlik Haritam</h3>
              <div className="skill-bars">
                {Object.entries(analysis.all_skill_counts).map(([skill, count]) => (
                  <div className="skill-bar-row" key={skill}>
                    <span className="skill-bar-label">{getSkillIcon(skill)} {skill}</span>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: `${count * 60}px` }}>
                        {count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3>💪 Güçlü Yönlerin</h3>
          <ul className="analysis-list">
            {analysis.top_skills && analysis.top_skills.map(skill => (
              <li key={skill} className="analysis-strong">
                {getSkillIcon(skill)} {skill}
              </li>
            ))}
          </ul>
          
          <h3>📈 Gelişime Açık Yönlerin</h3>
          <ul className="analysis-list">
            {analysis.weak_skills && analysis.weak_skills.map(skill => (
              <li key={skill} className="analysis-weak">
                {getSkillIcon(skill)} {skill}
              </li>
            ))}
          </ul>
          
          <h3>💡 Öneriler</h3>
          <ul className="analysis-list">
            {analysis.suggestions && analysis.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Agent öğrenme analizi sayfası
function LearningPage({ learningAnalysis, learningLoading, loadLearningAnalysis }) {
  // Yetkinlik ikonu getir
  function getSkillIcon(skill) {
    if (skill === "Teknik Yetkinlik") return "💻";
    if (skill === "Takım Çalışması") return "🤝";
    if (skill === "Empati") return "💖";
    if (skill === "Sorumluluk") return "📝";
    if (skill === "İletişim") return "🗣️";
    if (skill === "Liderlik") return "👑";
    if (skill === "Problem Çözme") return "🧩";
    if (skill === "Planlama") return "📅";
    if (skill === "Gönüllülük") return "❤️";
    return "⭐";
  }

  return (
    <div className="learning-page">
      <div className="learning-header">
        <h2>🎯 Kişisel Öğrenme Rehberin</h2>
        <p className="learning-subtitle">
          AI tabanlı analiz ile gelişim yolculuğunu takip et
        </p>
        
        <button 
          className="learning-refresh-btn"
          onClick={loadLearningAnalysis}
          disabled={learningLoading}
        >
          {learningLoading ? "🔄 Analiz Hazırlanıyor..." : "🚀 Öğrenme Analizini Başlat"}
        </button>
      </div>

      {learningLoading && (
        <div className="learning-loading">
          <div className="spinner"></div>
          <p>Agent sistemi faaliyetlerini analiz ediyor...</p>
        </div>
      )}

      {learningAnalysis && !learningLoading && (
        <div className="learning-content">
          {/* Motivasyon Mesajı */}
          <div className="motivation-card">
            <h3>💪 Motivasyon</h3>
            <p className="motivation-text">{learningAnalysis.motivationMessage}</p>
          </div>

          {/* İstatistikler */}
          <div className="learning-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h4>Toplam Faaliyet</h4>
                <span className="stat-value">{learningAnalysis.totalActivities}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h4>Toplam Yetkinlik</h4>
                <span className="stat-value">{learningAnalysis.totalSkills}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h4>İlerleme</h4>
                <span className="stat-value">%{learningAnalysis.progressPercentage}</span>
              </div>
            </div>
          </div>

          {/* Yetkinlik Seviyeleri */}
          {learningAnalysis.skillLevels && Object.keys(learningAnalysis.skillLevels).length > 0 && (
            <div className="learning-section">
              <h3>🎖️ Yetkinlik Seviyelerin</h3>
              <div className="skill-levels">
                {Object.entries(learningAnalysis.skillLevels).map(([skill, level]) => (
                  <div key={skill} className="skill-level-card">
                    <span className="skill-icon">{getSkillIcon(skill)}</span>
                    <div className="skill-info">
                      <h4>{skill}</h4>
                      <span className={`level-badge level-${level.toLowerCase().replace(' ', '-')}`}>
                        {level}
                      </span>
                    </div>
                    <div className="skill-count">
                      {learningAnalysis.skillCounts[skill] || 0}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kilometre Taşları */}
          {learningAnalysis.milestones && learningAnalysis.milestones.length > 0 && (
            <div className="learning-section">
              <h3>🏆 Kilometre Taşların</h3>
              <div className="milestones">
                {learningAnalysis.milestones.map((milestone, index) => (
                  <div key={index} className={`milestone ${milestone.achieved ? 'achieved' : 'pending'}`}>
                    <div className="milestone-icon">
                      {milestone.achieved ? '✅' : '⏳'}
                    </div>
                    <div className="milestone-info">
                      <h4>{milestone.name}</h4>
                      <div className="milestone-progress">
                        {milestone.current} / {milestone.target}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Öneriler */}
          {learningAnalysis.recommendations && learningAnalysis.recommendations.length > 0 && (
            <div className="learning-section">
              <h3>💡 Kişiselleştirilmiş Öneriler</h3>
              <div className="recommendations">
                {learningAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className={`recommendation ${rec.priority}`}>
                    <div className="rec-type">
                      {rec.type === 'geliştir' ? '📈' : '🆕'}
                    </div>
                    <div className="rec-content">
                      <h4>{rec.skill}</h4>
                      <p>{rec.message}</p>
                      <span className="rec-priority">{rec.priority} öncelik</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eksik Yetkinlikler */}
          {learningAnalysis.missingSkills && learningAnalysis.missingSkills.length > 0 && (
            <div className="learning-section">
              <h3>🎯 Keşfetmeye Değer Yetkinlikler</h3>
              <div className="missing-skills">
                {learningAnalysis.missingSkills.slice(0, 6).map(skill => (
                  <div key={skill} className="missing-skill">
                    <span className="skill-icon">{getSkillIcon(skill)}</span>
                    <span className="skill-name">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Son Güncelleme */}
          <div className="learning-footer">
            <p className="last-updated">
              Son güncelleme: {new Date(learningAnalysis.lastUpdated).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      )}

      {!learningAnalysis && !learningLoading && (
        <div className="learning-empty">
          <h3>🌱 Öğrenme Yolculuğuna Başla</h3>
          <p>
            Faaliyetlerini analiz etmek için yukarıdaki butona tıkla. 
            AI agent'ı senin için kişiselleştirilmiş öneriler hazırlayacak!
          </p>
        </div>
      )}
    </div>
  );
}

// AI Asistan sayfası
function AIAssistant({ user, token }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Başlangıç mesajı
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          type: "assistant",
          message: "Merhaba! Ben senin gönüllülük asistanın. Nasıl yardımcı olabilirim? 😊\n\nBana şunları sorabilirsin:\n• Faaliyet önerileri\n• Yetkinlik geliştirme tavsiyeleri\n• Gönüllülük hakkında sorular\n• Motivasyon desteği",
          timestamp: new Date()
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mesaj gönder
  function sendMessage() {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = currentMessage.trim();
    
    // Kullanıcı mesajını ekle
    const newUserMessage = {
      type: "user",
      message: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // AI'ya gönder
    fetch(`${API_URL}/${user.id}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: userMessage }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.assistantResponse) {
          const assistantMessage = {
            type: "assistant",
            message: data.assistantResponse,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, assistantMessage]);
        } else {
          const errorMessage = {
            type: "assistant",
            message: "Üzgünüm, şu anda bir sorun yaşıyorum. Tekrar dener misin? 😔",
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, errorMessage]);
        }
      })
      .catch(error => {
        console.error("AI Asistan hatası:", error);
        const errorMessage = {
          type: "assistant",
          message: "Bağlantı problemi yaşıyorum. Lütfen tekrar dener misin? 🔄",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // Enter tuşu ile mesaj gönder
  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="ai-assistant">
      <div className="assistant-header">
        <h2>🤖 AI Gönüllülük Asistanı</h2>
        <p className="assistant-subtitle">
          Gönüllülük yolculuğunda sana yardımcı olmak için buradayım!
        </p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-avatar">
                {msg.type === "user" ? "👤" : "🤖"}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.message}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <div className="chat-suggestions">
            <button 
              className="suggestion-btn"
              onClick={() => setCurrentMessage("Hangi faaliyetleri önerirsin?")}
            >
              💡 Faaliyet Öner
            </button>
            <button 
              className="suggestion-btn"
              onClick={() => setCurrentMessage("Yetkinliklerimi nasıl geliştirebilirim?")}
            >
              📈 Yetkinlik Geliştir
            </button>
            <button 
              className="suggestion-btn"
              onClick={() => setCurrentMessage("Motivasyona ihtiyacım var")}
            >
              💪 Motivasyon
            </button>
            <button 
              className="suggestion-btn"
              onClick={() => setCurrentMessage("Yetkinliklerimi analiz et")}
            >
              🔍 Analiz
            </button>
          </div>
          
          <div className="chat-input">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mesajını buraya yaz... (Enter ile gönder)"
              disabled={isLoading}
              rows={2}
            />
            <button 
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? "⏳" : "🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

