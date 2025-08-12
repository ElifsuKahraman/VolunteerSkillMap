/**
 * Agent API Routes
 * Agent sistemi için API endpoint'leri
 */

const express = require('express');
const router = express.Router();
const { getAgentManager } = require('../utils/agentManager');
const User = require('../models/User');

// Middleware: Agent Manager'ı başlat
router.use(async (req, res, next) => {
  try {
    const agentManager = getAgentManager();
    if (!agentManager.isInitialized) {
      await agentManager.initialize();
    }
    req.agentManager = agentManager;
    next();
  } catch (error) {
    console.error('Agent Manager başlatma hatası:', error);
    res.status(500).json({ error: 'Agent sistemi başlatılamadı' });
  }
});

// GET /api/agents/status - Tüm agent'ların durumunu getir
router.get('/status', async (req, res) => {
  try {
    const status = req.agentManager.getSystemStatus();
    res.json({
      message: 'Agent sistemi durumu',
      status: status
    });
  } catch (error) {
    console.error('Agent durumu hatası:', error);
    res.status(500).json({ error: 'Agent durumu alınamadı' });
  }
});

// GET /api/agents/learning-analysis/:userId - Öğrenme analizi
router.get('/learning-analysis/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kullanıcıyı ve faaliyetlerini getir
    const user = await User.findById(userId).populate('activities');
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Öğrenme analizi yap
    const analysis = req.agentManager.performLearningAnalysis(user.activities, userId);

    res.json({
      message: 'Öğrenme analizi hazır',
      analysis: analysis
    });
  } catch (error) {
    console.error('Öğrenme analizi hatası:', error);
    res.status(500).json({ error: 'Öğrenme analizi sırasında hata oluştu' });
  }
});

// POST /api/agents/assistant/chat - AI Assistant mesajı
router.post('/assistant/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mesaj gerekli' });
    }

    // Kullanıcı bilgilerini getir (opsiyonel)
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    // Mesajı işle
    const response = req.agentManager.processAssistantMessage(message, user);

    res.json({
      message: 'AI Assistant cevabı',
      response: response
    });
  } catch (error) {
    console.error('AI Assistant hatası:', error);
    res.status(500).json({ error: 'AI Assistant mesajı işlenemedi' });
  }
});

// POST /api/agents/extract-skills - Yetkinlik çıkarma
router.post('/extract-skills', async (req, res) => {
  try {
    const { description, activityType } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Açıklama gerekli' });
    }

    // Yetkinlikleri çıkar
    const skills = await req.agentManager.extractSkills(description, activityType);

    res.json({
      message: 'Yetkinlikler çıkarıldı',
      skills: skills,
      count: skills.length
    });
  } catch (error) {
    console.error('Yetkinlik çıkarma hatası:', error);
    res.status(500).json({ error: 'Yetkinlikler çıkarılamadı' });
  }
});

// GET /api/agents/skill-recommendation/:skill/:level - Yetkinlik önerisi
router.get('/skill-recommendation/:skill/:level', async (req, res) => {
  try {
    const { skill, level } = req.params;

    // Yetkinlik önerisi al
    const recommendation = req.agentManager.getSkillRecommendation(skill, level);

    res.json({
      message: 'Yetkinlik önerisi',
      skill: skill,
      level: level,
      recommendation: recommendation
    });
  } catch (error) {
    console.error('Yetkinlik önerisi hatası:', error);
    res.status(500).json({ error: 'Yetkinlik önerisi alınamadı' });
  }
});

// GET /api/agents/personalized-suggestions/:userId - Kişiselleştirilmiş öneriler
router.get('/personalized-suggestions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kullanıcıyı ve faaliyetlerini getir
    const user = await User.findById(userId).populate('activities');
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Kişiselleştirilmiş öneriler üret
    const suggestions = req.agentManager.generatePersonalizedSuggestions(user, user.activities);

    res.json({
      message: 'Kişiselleştirilmiş öneriler',
      suggestions: suggestions,
      count: suggestions.length
    });
  } catch (error) {
    console.error('Kişiselleştirilmiş öneriler hatası:', error);
    res.status(500).json({ error: 'Öneriler üretilemedi' });
  }
});

// POST /api/agents/restart - Tüm agent'ları yeniden başlat
router.post('/restart', async (req, res) => {
  try {
    await req.agentManager.restartAgents();

    res.json({
      message: 'Agent\'lar yeniden başlatıldı',
      status: req.agentManager.getSystemStatus()
    });
  } catch (error) {
    console.error('Agent yeniden başlatma hatası:', error);
    res.status(500).json({ error: 'Agent\'lar yeniden başlatılamadı' });
  }
});

// POST /api/agents/restart/:agentName - Belirli agent'ı yeniden başlat
router.post('/restart/:agentName', async (req, res) => {
  try {
    const agentName = req.params.agentName;
    await req.agentManager.restartAgent(agentName);

    res.json({
      message: `${agentName} agent'ı yeniden başlatıldı`,
      status: req.agentManager.getAgentStatus()[agentName]
    });
  } catch (error) {
    console.error('Agent yeniden başlatma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/health - Sağlık kontrolü
router.get('/health', async (req, res) => {
  try {
    const status = req.agentManager.getSystemStatus();
    const isHealthy = status.initialized && status.activeAgents > 0;

    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      message: isHealthy ? 'Agent sistemi sağlıklı' : 'Agent sistemi sorunlu',
      details: status
    });
  } catch (error) {
    console.error('Sağlık kontrolü hatası:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Agent sistemi erişilemez',
      error: error.message
    });
  }
});

module.exports = router; 