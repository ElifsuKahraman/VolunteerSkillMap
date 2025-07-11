import React, { useState, useEffect } from "react";

function App() {
  
  const [screen, setScreen] = useState("register"); 
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [authError, setAuthError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  
  const [activePage, setActivePage] = useState("add");

  
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [lastSkills, setLastSkills] = useState([]); 

  
  const [activities, setActivities] = useState([]);
  const [skillCounts, setSkillCounts] = useState({}); 

  
  useEffect(() => {
    if (user && token) {
      fetch(`http://localhost:5000/api/users/${user.id}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setActivities(data.activities || []);
          
          const counts = {};
          (data.activities || []).forEach(act => {
            (act.skills || []).forEach(skill => {
              counts[skill] = (counts[skill] || 0) + 1;
            });
          });
          setSkillCounts(counts);
        });
    }
  }, [user, token, message]); 


  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setRegisterSuccess("");
    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setRegisterSuccess("Kayıt başarılı! Şimdi faaliyet ekleyebilirsiniz.");
        setRegisterData({ name: "", email: "", password: "" });
        setTimeout(() => setScreen("main"), 1500); 
        setUser({ name: data.user.name, id: data.user.id, email: data.user.email });
        setToken(data.token);
      } else {
        setAuthError(data.error || "Kayıt sırasında hata oluştu.");
      }
    } catch (err) {
      setAuthError("Kayıt sırasında hata oluştu.");
    }
  };

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setUser(data.user);
        setToken(data.token);
        setLoginData({ email: "", password: "" });
        setScreen("main");
      } else {
        setAuthError(data.error || "Giriş sırasında hata oluştu.");
      }
    } catch (err) {
      setAuthError("Giriş sırasında hata oluştu.");
    }
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setMessage("Lütfen önce giriş yapın.");
      return;
    }
    const response = await fetch(`http://localhost:5000/api/users/${user.id}/add-activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description }),
    });
    const data = await response.json();
    setMessage(data.message || "Kayıt başarılı!");
    setDescription("");
    setLastSkills(data.skills || []);
  };

 
  function Menu() {
    return (
      <div style={styles.menu}>
        <button style={activePage === "add" ? styles.activeMenuButton : styles.menuButton} onClick={() => setActivePage("add")}>Faaliyet Ekle</button>
        <button style={activePage === "history" ? styles.activeMenuButton : styles.menuButton} onClick={() => setActivePage("history")}>Geçmiş Faaliyetler</button>
        <button style={activePage === "chart" ? styles.activeMenuButton : styles.menuButton} onClick={() => setActivePage("chart")}>Yetkinlik Haritası</button>
        <button style={{ ...styles.menuButton, float: "right", background: "#888" }} onClick={() => { setUser(null); setToken(""); setScreen("login"); }}>Çıkış Yap</button>
      </div>
    );
  }

  
  function AddActivityPage() {
    return (
      <div>
        <h2 style={styles.title}>Gönüllülük Faaliyeti Ekle</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            rows="6"
            cols="60"
            placeholder="Yaptığınız gönüllü faaliyeti yazınız..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Kaydet</button>
        </form>
        {message && <p style={{ color: "green" }}>{message}</p>}
        {lastSkills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <b>Bu faaliyetten çıkan yetkinlikler:</b>
            <ul>
              {lastSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

 
  function HistoryPage() {
    return (
      <div>
        <h2 style={styles.title}>Geçmiş Faaliyetlerim</h2>
        <ul>
          {activities.map((act, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              <b>{act.description}</b>
              {act.skills && act.skills.length > 0 && (
                <span> → {act.skills.join(", ")}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

 
  function SkillChartPage() {
    
    return (
      <div>
        <h2 style={styles.title}>Yetkinlik Haritam (Çubuk Grafik)</h2>
        <div style={{ margin: "20px 0" }}>
          {Object.keys(skillCounts).length === 0 && <p>Henüz yetkinlik yok.</p>}
          {Object.entries(skillCounts).map(([skill, count]) => (
            <div key={skill} style={{ marginBottom: 8 }}>
              <span style={{ display: "inline-block", width: 120 }}>{skill}:</span>
              <span style={{ display: "inline-block", background: "#4caf50", height: 20, width: count * 40, color: "white", borderRadius: 5, textAlign: "center", lineHeight: "20px" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

 
  if (screen === "register") {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Kayıt Ol</h1>
        <form onSubmit={handleRegister} style={styles.form}>
          <input type="text" placeholder="Ad Soyad" value={registerData.name} onChange={e => setRegisterData({ ...registerData, name: e.target.value })} style={styles.input} required />
          <input type="email" placeholder="E-posta" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} style={styles.input} required />
          <input type="password" placeholder="Şifre" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} style={styles.input} required />
          <button type="submit" style={styles.button}>Kayıt Ol</button>
        </form>
        {registerSuccess && <p style={{ color: "green" }}>{registerSuccess}</p>}
        {authError && <p style={{ color: "red" }}>{authError}</p>}
        <p style={{ marginTop: 20 }}>
          Zaten hesabın var mı?{' '}
          <span style={styles.link} onClick={() => { setScreen("login"); setAuthError(""); }}>Giriş Yap</span>
        </p>
      </div>
    );
  }

  
  if (screen === "login") {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Giriş Yap</h1>
        <form onSubmit={handleLogin} style={styles.form}>
          <input type="email" placeholder="E-posta" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} style={styles.input} required />
          <input type="password" placeholder="Şifre" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} style={styles.input} required />
          <button type="submit" style={styles.button}>Giriş Yap</button>
        </form>
        {authError && <p style={{ color: "red" }}>{authError}</p>}
        <p style={{ marginTop: 20 }}>
          Hesabın yok mu?{' '}
          <span style={styles.link} onClick={() => { setScreen("register"); setAuthError(""); }}>Kayıt Ol</span>
        </p>
      </div>
    );
  }

 
  if (screen === "main" && user) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Gönüllülük Temelli Yetkinlik Haritası</h1>
        <Menu />
        <div style={{ marginTop: 30 }}>
          {activePage === "add" && <AddActivityPage />}
          {activePage === "history" && <HistoryPage />}
          {activePage === "chart" && <SkillChartPage />}
        </div>
      </div>
    );
  }

  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lütfen giriş yapın</h1>
      <button style={styles.button} onClick={() => setScreen("login")}>Giriş Yap</button>
    </div>
  );
}


const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "30px",
    border: "1px solid #ccc",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    backgroundColor: "#f9f9f9",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #bbb",
    resize: "none",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4caf50",
    color: "white",
    cursor: "pointer",
  },
  link: {
    color: "#1976d2",
    textDecoration: "underline",
    cursor: "pointer",
  },
  menu: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px",
    background: "#f1f1f1",
    borderRadius: "8px",
  },
  menuButton: {
    padding: "10px 18px",
    fontSize: "15px",
    border: "none",
    borderRadius: "8px",
    background: "#e0e0e0",
    color: "#333",
    cursor: "pointer",
  },
  activeMenuButton: {
    padding: "10px 18px",
    fontSize: "15px",
    border: "none",
    borderRadius: "8px",
    background: "#4caf50",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;

