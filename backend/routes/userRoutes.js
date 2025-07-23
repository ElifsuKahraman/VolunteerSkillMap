const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Activity = require("../models/Activity");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "gizli_jwt_anahtari";


function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Yetkisiz. Giriş yapmalısınız." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Geçersiz token." });
  }
}

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.status(201).json({ message: "Kullanıcı kaydedildi", user });
  } catch (error) {
    res.status(500).json({ error: "Kullanıcı kaydedilemedi" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta ile zaten bir kullanıcı var." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ message: "Kayıt başarılı!", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Kayıt sırasında bir hata oluştu." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Kullanıcı bulunamadı." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Şifre yanlış." });
    }
   
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Giriş başarılı!", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu." });
  }
});


router.post("/:userId/add-activity", auth, async (req, res) => {
  try {
    const { description } = req.body;
    
    const skillRes = await axios.post("http://localhost:5001/analyze", { text: description });
    const skills = skillRes.data.skills || [];
  
    const faaliyet = new Activity({ description, skills });
    await faaliyet.save();
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    user.activities.push(faaliyet._id);
    await user.save();
    res.status(201).json({
      message: "Faaliyet kullanıcıya başarıyla eklendi",
      user,
      activity: faaliyet,
      skills,
    });
  } catch (err) {
    res.status(500).json({ error: "İşlem sırasında bir hata oluştu" });
  }
});


router.post("/analyze-skill", async (req, res) => {
  const { text } = req.body;
  try {
    const response = await axios.post("http://localhost:5001/analyze", { text });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Skill analysis failed" });
  }
});


router.get("/:userId/activities", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("activities");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    res.json({ activities: user.activities });
  } catch (err) {
    res.status(500).json({ error: "Faaliyetler alınamadı" });
  }
});


router.get("/:userId/skill-analysis", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("activities");
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  
    const skillCounts = {};
    user.activities.forEach(act => {
      (act.skills || []).forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    
    const sortedSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]);
    const top_skills = sortedSkills.slice(0, 2).map(([skill]) => skill);
    const weak_skills = sortedSkills.slice(-2).map(([skill]) => skill);

    
    const suggestions = weak_skills.map(skill => `${skill} yetkinliğini geliştirmek için ilgili faaliyetler ekleyebilirsiniz.`);

    res.json({
      top_skills,
      weak_skills,
      all_skill_counts: skillCounts,
      suggestions
    });
  } catch (err) {
    res.status(500).json({ error: "Analiz sırasında hata oluştu" });
  }
});



module.exports = router;