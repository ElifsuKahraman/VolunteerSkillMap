/**
 * Agent Manager Utility
 * Tüm agent'ları yöneten ve koordine eden utility
 */

const LearningAgent = require('../services/learningAgent');
const AIAssistant = require('../services/aiAssistant');
const SkillExtractor = require('../services/skillExtractor');

class AgentManager {
  constructor() {
    this.agents = {};
    this.isInitialized = false;
    this.agentStatus = {};
  }

  /**
   * Agent'ları lazy loading ile yükler
   */
  _loadAgents() {
    if (Object.keys(this.agents).length === 0) {
      try {
        this.agents = {
          learning: new LearningAgent(),
          assistant: new AIAssistant(),
          extractor: new SkillExtractor()
        };
        console.log('✅ Agent\'lar yüklendi');
      } catch (error) {
        console.error('❌ Agent yükleme hatası:', error);
        throw error;
      }
    }
  }

  /**
   * Agent Manager'ı başlatır
   */
  async initialize() {
    try {
      console.log('🤖 Agent Manager başlatılıyor...');
      
      // Agent'ları yükle
      this._loadAgents();
      
      // Her agent'ın durumunu kontrol et
      await this.checkAgentStatus();
      
      this.isInitialized = true;
      console.log('✅ Agent Manager başlatıldı');
      
    } catch (error) {
      console.error('❌ Agent Manager başlatma hatası:', error);
      throw error;
    }
  }

  /**
   * Tüm agent'ların durumunu kontrol eder
   */
  async checkAgentStatus() {
    // Agent'ları yükle (eğer yüklenmemişse)
    this._loadAgents();
    
    const status = {};
    
    // Learning Agent durumu
    status.learning = {
      name: this.agents.learning.name,
      description: this.agents.learning.description,
      status: 'active',
      lastCheck: new Date().toISOString()
    };

    // AI Assistant durumu
    status.assistant = {
      name: this.agents.assistant.name,
      description: this.agents.assistant.description,
      status: 'active',
      lastCheck: new Date().toISOString()
    };

    // Skill Extractor durumu
    try {
      const apiStatus = await this.agents.extractor.checkApiStatus();
      status.extractor = {
        name: this.agents.extractor.name,
        description: this.agents.extractor.description,
        status: apiStatus ? 'active' : 'fallback',
        apiStatus: apiStatus,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      status.extractor = {
        name: this.agents.extractor.name,
        description: this.agents.extractor.description,
        status: 'fallback',
        apiStatus: false,
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }

    this.agentStatus = status;
    return status;
  }

  /**
   * Belirli bir agent'ı getirir
   * @param {string} agentName - Agent adı
   * @returns {Object} Agent instance
   */
  getAgent(agentName) {
    this._loadAgents();
    
    if (!this.agents[agentName]) {
      throw new Error(`Agent bulunamadı: ${agentName}`);
    }
    return this.agents[agentName];
  }

  /**
   * Tüm agent'ları getirir
   * @returns {Object} Tüm agent'lar
   */
  getAllAgents() {
    this._loadAgents();
    return this.agents;
  }

  /**
   * Agent durumlarını getirir
   * @returns {Object} Agent durumları
   */
  getAgentStatus() {
    return this.agentStatus;
  }

  /**
   * Yetkinlik çıkarma işlemini yapar
   * @param {string} description - Faaliyet açıklaması
   * @param {string} activityType - Faaliyet türü
   * @returns {Promise<Array>} Çıkarılan yetkinlikler
   */
  async extractSkills(description, activityType) {
    this._loadAgents();
    return await this.agents.extractor.extractSkills(description, activityType);
  }

  /**
   * Öğrenme analizi yapar
   * @param {Array} activities - Kullanıcının faaliyetleri
   * @param {string} userId - Kullanıcı ID'si
   * @returns {Object} Analiz sonuçları
   */
  performLearningAnalysis(activities, userId) {
    this._loadAgents();
    return this.agents.learning.performFullAnalysis(activities, userId);
  }

  /**
   * AI Assistant mesajını işler
   * @param {string} message - Kullanıcı mesajı
   * @param {Object} user - Kullanıcı bilgileri
   * @returns {Object} Cevap objesi
   */
  processAssistantMessage(message, user) {
    this._loadAgents();
    return this.agents.assistant.processMessage(message, user);
  }

  /**
   * Kullanıcıya özel öneriler üretir
   * @param {Object} user - Kullanıcı bilgileri
   * @param {Array} activities - Kullanıcının faaliyetleri
   * @returns {Array} Öneriler
   */
  generatePersonalizedSuggestions(user, activities) {
    this._loadAgents();
    return this.agents.assistant.generatePersonalizedSuggestions(user, activities);
  }

  /**
   * Yetkinlik önerisi alır
   * @param {string} skill - Yetkinlik adı
   * @param {string} level - Seviye
   * @returns {string} Öneri mesajı
   */
  getSkillRecommendation(skill, level) {
    this._loadAgents();
    return this.agents.learning.getSkillRecommendation(skill, level);
  }

  /**
   * Sistem durumu raporu oluşturur
   * @returns {Object} Sistem durumu
   */
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      agents: this.agentStatus,
      totalAgents: Object.keys(this.agents).length,
      activeAgents: Object.values(this.agentStatus).filter(agent => agent.status === 'active').length,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Agent'ları yeniden başlatır
   */
  async restartAgents() {
    console.log('🔄 Agent\'lar yeniden başlatılıyor...');
    
    // Agent'ları temizle
    this.agents = {};
    
    // Yeni agent instance'ları oluştur
    this._loadAgents();
    
    // Durumları kontrol et
    await this.checkAgentStatus();
    
    console.log('✅ Agent\'lar yeniden başlatıldı');
  }

  /**
   * Belirli bir agent'ı yeniden başlatır
   * @param {string} agentName - Agent adı
   */
  async restartAgent(agentName) {
    if (!this.agents[agentName]) {
      throw new Error(`Agent bulunamadı: ${agentName}`);
    }

    console.log(`🔄 ${agentName} agent'ı yeniden başlatılıyor...`);
    
    // Agent'ı yeniden oluştur
    switch (agentName) {
      case 'learning':
        this.agents.learning = new LearningAgent();
        break;
      case 'assistant':
        this.agents.assistant = new AIAssistant();
        break;
      case 'extractor':
        this.agents.extractor = new SkillExtractor();
        break;
      default:
        throw new Error(`Bilinmeyen agent: ${agentName}`);
    }
    
    // Durumu güncelle
    await this.checkAgentStatus();
    
    console.log(`✅ ${agentName} agent'ı yeniden başlatıldı`);
  }
}

// Singleton instance
let agentManagerInstance = null;

/**
 * Agent Manager instance'ını getirir
 * @returns {AgentManager} Agent Manager instance
 */
function getAgentManager() {
  if (!agentManagerInstance) {
    agentManagerInstance = new AgentManager();
  }
  return agentManagerInstance;
}

module.exports = {
  AgentManager,
  getAgentManager
}; 