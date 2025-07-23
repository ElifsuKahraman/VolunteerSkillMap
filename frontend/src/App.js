import React, { useState, useEffect } from "react";
import "./App.css";
import profilePlaceholder from "./profile_placeholder.png";


const API_URL = "http://localhost:5000/api/users";

function App() {
 
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  
  const [screen, setScreen] = useState("login"); 
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  
  const [page, setPage] = useState("home");
  
  const [activities, setActivities] = useState([]);
  
  const [addForm, setAddForm] = useState({ title: "", description: "", date: "" });
  const [addMessage, setAddMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);

  
  useEffect(() => {
    if (user && token) {
      fetch(`${API_URL}/${user.id}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setActivities(data.activities || []));
    }
  }, [user, token, addMessage]);

  useEffect(() => {
    if (user && token && page === "analysis") {
      fetch(`${API_URL}/${user.id}/skill-analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setAnalysis(data));
    }
  }, [user, token, page]);

 
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setUser(data.user);
        setToken(data.token);
        setScreen("main");
        setLoginData({ email: "", password: "" });
      } else {
        setAuthError(data.error || "Giriş sırasında hata oluştu.");
      }
    } catch (err) {
      setAuthError("Giriş sırasında hata oluştu.");
    }
  };

 
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setRegisterSuccess("");
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setRegisterSuccess("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setRegisterData({ name: "", email: "", password: "" });
        setTimeout(() => setScreen("login"), 1200);
      } else {
        setAuthError(data.error || "Kayıt sırasında hata oluştu.");
      }
    } catch (err) {
      setAuthError("Kayıt sırasında hata oluştu.");
    }
  };

 
  const handleLogout = () => {
    setUser(null);
    setToken("");
    setScreen("login");
    setPage("home");
    setActivities([]);
    setAnalysis(null);
  };

  
  const handleAddActivity = async (e) => {
    e.preventDefault();
    setAddMessage("");
    if (!user || !token) return;
    const response = await fetch(`${API_URL}/${user.id}/add-activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description: addForm.description }),
    });
    const data = await response.json();
    if (response.ok) {
      setAddMessage("Etkinlik başarıyla eklendi!");
      setAddForm({ title: "", description: "", date: "" });
    } else {
      setAddMessage(data.error || "Kayıt sırasında hata oluştu.");
    }
  };


  if (screen === "login") {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <h2>Giriş Yap</h2>
          <form onSubmit={handleLogin} className="auth-form">
            <input type="email" placeholder="E-posta" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
            <input type="password" placeholder="Şifre" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
            <button type="submit">Giriş Yap</button>
          </form>
          {authError && <p className="auth-error">{authError}</p>}
          <p className="auth-switch">Hesabın yok mu? <span onClick={() => { setScreen("register"); setAuthError(""); }}>Üye Ol</span></p>
        </div>
      </div>
    );
  }
  if (screen === "register") {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <h2>Üye Ol</h2>
          <form onSubmit={handleRegister} className="auth-form">
            <input type="text" placeholder="Ad Soyad" value={registerData.name} onChange={e => setRegisterData({ ...registerData, name: e.target.value })} required />
            <input type="email" placeholder="E-posta" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} required />
            <input type="password" placeholder="Şifre" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} required />
            <button type="submit">Üye Ol</button>
          </form>
          {registerSuccess && <p className="auth-success">{registerSuccess}</p>}
          {authError && <p className="auth-error">{authError}</p>}
          <p className="auth-switch">Zaten hesabın var mı? <span onClick={() => { setScreen("login"); setAuthError(""); }}>Giriş Yap</span></p>
        </div>
      </div>
    );
  }

  
  return (
    <div className="app-bg">
      <Banner />
      <Navbar page={page} setPage={setPage} handleLogout={handleLogout} />
      <div className="main-content">
        {page === "home" && <Home />}
        {page === "profile" && <Profile user={user} activities={activities} />}
        {page === "add" && <AddActivity addForm={addForm} setAddForm={setAddForm} handleAddActivity={handleAddActivity} addMessage={addMessage} />}
        {page === "map" && <SkillMap activities={activities} />}
        {page === "analysis" && <AnalysisPage analysis={analysis} />}
      </div>
    </div>
  );
}

function Banner() {
  return (
    <div className="banner">
      <h1>Yetkinlik Haritam</h1>
      <p>Gönüllülükle Yüksel!</p>
    </div>
  );
}

function Navbar({ page, setPage, handleLogout }) {
  return (
    <nav className="navbar">
      <button className={`nav-link${page === "home" ? " active" : ""}`} onClick={() => setPage("home")}>Ana Sayfa</button>
      <button className={`nav-link${page === "profile" ? " active" : ""}`} onClick={() => setPage("profile")}>Profilim</button>
      <button className={`nav-link${page === "add" ? " active" : ""}`} onClick={() => setPage("add")}>Etkinlik Ekle</button>
      <button className={`nav-link${page === "map" ? " active" : ""}`} onClick={() => setPage("map")}>Yol Haritam</button>
      <button className={`nav-link${page === "analysis" ? " active" : ""}`} onClick={() => setPage("analysis")}>Profil Analizi</button>
      <button className="nav-link logout-btn" onClick={handleLogout}>Çıkış Yap</button>
    </nav>
  );
}

function Home() {
  return (
    <div className="home home-explain">
      <h2>Gönüllülük Nedir?</h2>
      <p>Gönüllülük, bir bireyin topluma, çevresine veya bir amaca karşılıksız katkı sağlamak için kendi isteğiyle yaptığı çalışmalardır. Gönüllülük, hem topluma hem de kişisel gelişime büyük katkı sağlar.</p>
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

function Profile({ user, activities }) {
 
  const skillCounts = {};
  activities.forEach((act) =>
    (act.skills || []).forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    })
  );
  return (
    <div className="profile profile-full">
      <div className="profile-header-full">
        <img src={profilePlaceholder} alt="Profil" className="profile-photo-full" />
        <div>
          <h2>{user.name}</h2>
          <p className="profile-bio">Genç gönüllü, yeni deneyimlere açık!</p>
        </div>
      </div>
      <div className="profile-section">
        <h3>Yetkinliklerim</h3>
        <div className="profile-skills-list">
          {Object.keys(skillCounts).length === 0 && <p>Henüz yetkinlik yok.</p>}
          {Object.entries(skillCounts).map(([skill, count]) => (
            <span className={`badge badge-${skill.toLowerCase().replace(/ /g, "-")}`} key={skill}>
              {getSkillIcon(skill)} {skill} <b>({count})</b>
            </span>
          ))}
        </div>
      </div>
      <div className="profile-section">
        <h3>Geçmiş Etkinliklerim</h3>
        <div className="profile-activity-list">
          {activities.length === 0 && <p>Henüz etkinlik eklemedin.</p>}
          {activities.map((event, idx) => (
            <EventCard key={idx} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <div className="event-card event-card-large">
      <div className="event-card-header">
        <h4>{event.title || event.description.slice(0, 24) + (event.description.length > 24 ? "..." : "")}</h4>
        <span className="event-date">{event.date ? event.date.slice(0, 10) : ""}</span>
      </div>
      <p>{event.description}</p>
      <div className="badges">
        {event.skills && event.skills.length > 0 && event.skills.map((skill, i) => (
          <span className={`badge badge-${skill.toLowerCase().replace(/ /g, "-")}`} key={i}>
            {getSkillIcon(skill)} {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function AddActivity({ addForm, setAddForm, handleAddActivity, addMessage }) {
  return (
    <div className="add-activity">
      <h2>Yeni Etkinlik Ekle</h2>
      <form className="activity-form" onSubmit={handleAddActivity}>
        <textarea placeholder="Yaptığın gönüllü faaliyeti yazınız..." value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} rows={3} required />
        <button type="submit">Kaydet</button>
      </form>
      {addMessage && <p className="form-info">{addMessage}</p>}
    </div>
  );
}

function SkillMap({ activities }) {
  // Basit çubuk grafik demo
  const skillCounts = {};
  activities.forEach((act) =>
    (act.skills || []).forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    })
  );
  return (
    <div className="skill-map">
      <h2>Yol Haritam</h2>
      <div className="skill-bars">
        {Object.keys(skillCounts).length === 0 && <p>Henüz yetkinlik yok.</p>}
        {Object.entries(skillCounts).map(([skill, count]) => (
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
  );
}

function AnalysisPage({ analysis }) {
  return (
    <div className="analysis-page">
      <h2>Profil Analizi</h2>
      {!analysis && <p>Analiz yükleniyor...</p>}
      {analysis && (
        <div>
          <h3>Güçlü Yönlerin</h3>
          <ul className="analysis-list">
            {analysis.top_skills.map(skill => <li key={skill} className="analysis-strong">{getSkillIcon(skill)} {skill}</li>)}
          </ul>
          <h3>Gelişime Açık Yönlerin</h3>
          <ul className="analysis-list">
            {analysis.weak_skills.map(skill => <li key={skill} className="analysis-weak">{getSkillIcon(skill)} {skill}</li>)}
          </ul>
          <h3>Öneriler</h3>
          <ul className="analysis-list">
            {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <h4>Tüm Yetkinlikler</h4>
          <ul className="analysis-list">
            {Object.entries(analysis.all_skill_counts).map(([skill, count]) => (
              <li key={skill}>{getSkillIcon(skill)} {skill}: {count}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


function getSkillIcon(skill) {
  switch (skill) {
    case "Teknik Yetkinlik":
      return "💻";
    case "Takım Çalışması":
      return "🤝";
    case "Empati":
      return "💖";
    case "Sorumluluk":
      return "📝";
    case "İletişim":
      return "🗣️";
    default:
      return "⭐";
  }
}

export default App;

