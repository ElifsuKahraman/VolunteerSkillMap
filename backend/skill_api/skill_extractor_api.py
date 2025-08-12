# Gerekli kütüphaneleri yükle
from flask import Flask, request, jsonify
import stanza
import traceback

# Flask uygulamasını oluştur
app = Flask(__name__)

# Türkçe dil işleme pipeline'ını yükle
print("Stanza Türkçe dil modeli yükleniyor...")

try:
    # Stanza pipeline'ını başlat
    print("Pipeline başlatılıyor...")
    nlp_pipeline = stanza.Pipeline('tr', processors='tokenize,mwt,pos,lemma', download_method=None)
    print("✅ Stanza pipeline başarıyla yüklendi!")
except Exception as pipeline_error:
    print(f"❌ Pipeline yüklenirken hata: {pipeline_error}")
    print("Türkçe model indiriliyor...")
    
    # Model yoksa indir
    stanza.download('tr')
    nlp_pipeline = stanza.Pipeline('tr', processors='tokenize,mwt,pos,lemma')
    print("✅ Stanza pipeline başarıyla yüklendi!")

# Yetkinlik analizi yapan fonksiyon
def analyze_text_for_skills(text):
    """
    Verilen metni analiz ederek yetkinlikleri çıkarır
    """
    try:
        # Boş metin kontrolü
        if not text or len(text.strip()) == 0:
            print("Boş metin gönderildi")
            return []
        
        print(f'Analiz edilen metin: {text[:100]}{"..." if len(text) > 100 else ""}')
        
        # Metni pipeline'a gönder
        analyzed_doc = nlp_pipeline(text.lower())
        
        # Bulunan yetkinlikler
        found_skills = set()
        
        # Her cümleyi incele
        for sentence in analyzed_doc.sentences:
            # Kelimelerin lemma (kök) hallerini al
            word_lemmas = [word.lemma for word in sentence.words]
            # Kelimelerin normal hallerini al
            word_tokens = [word.text for word in sentence.words]
            
            print(f'Kelime kökleri: {word_lemmas[:10]}')  # İlk 10 kökü göster
            print(f'Kelimeler: {word_tokens[:10]}')  # İlk 10 kelimeyi göster
            
            # Takım çalışması yetkinliği
            team_keywords = ['takım', 'ekip', 'grup', 'beraber', 'birlikte', 'işbirliği', 'koordinasyon']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in team_keywords):
                found_skills.add('Takım Çalışması')
                print("✓ Takım Çalışması yetkinliği tespit edildi")
            
            # Liderlik yetkinliği
            leadership_keywords = ['lider', 'yönet', 'koordine', 'organize', 'yönlendirme', 'rehberlik', 'sorumlu']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in leadership_keywords):
                found_skills.add('Liderlik')
                print("✓ Liderlik yetkinliği tespit edildi")
            
            # İletişim yetkinliği
            communication_keywords = ['iletişim', 'konuş', 'anlat', 'sunum', 'bilgilendirme', 'paylaş', 'aktarma']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in communication_keywords):
                found_skills.add('İletişim')
                print("✓ İletişim yetkinliği tespit edildi")
            
            # Problem çözme yetkinliği
            problem_solving_keywords = ['problem', 'çöz', 'analiz', 'araştır', 'çözüm', 'strateji', 'yaklaşım']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in problem_solving_keywords):
                found_skills.add('Problem Çözme')
                print("✓ Problem Çözme yetkinliği tespit edildi")
            
            # Empati yetkinliği
            empathy_keywords = ['empati', 'anlayış', 'yardım', 'destek', 'sevgi', 'şefkat', 'merhamet']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in empathy_keywords):
                found_skills.add('Empati')
                print("✓ Empati yetkinliği tespit edildi")
            
            # Planlama yetkinliği
            planning_keywords = ['plan', 'planlama', 'düzen', 'program', 'organizasyon', 'hazırlık', 'tasarım']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in planning_keywords):
                found_skills.add('Planlama')
                print("✓ Planlama yetkinliği tespit edildi")
            
            # Sorumluluk yetkinliği
            responsibility_keywords = ['sorumluluk', 'görev', 'yükümlülük', 'taahhüt', 'bağlılık', 'sadakat']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in responsibility_keywords):
                found_skills.add('Sorumluluk')
                print("✓ Sorumluluk yetkinliği tespit edildi")
            
            # Gönüllülük yetkinliği
            volunteering_keywords = ['gönüllü', 'volunteer', 'fedakarlık', 'özgecilik', 'katkı', 'hizmet']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in volunteering_keywords):
                found_skills.add('Gönüllülük')
                print("✓ Gönüllülük yetkinliği tespit edildi")
            
            # Teknik yetkinlik
            technical_keywords = ['teknik', 'teknoloji', 'bilgisayar', 'yazılım', 'program', 'sistem', 'dijital']
            if any(keyword in word_lemmas or keyword in word_tokens for keyword in technical_keywords):
                found_skills.add('Teknik Yetkinlik')
                print("✓ Teknik Yetkinlik tespit edildi")
        
        # Bulunan yetkinlikleri listeye çevir
        skill_list = list(found_skills)
        print(f"Toplam tespit edilen yetkinlikler: {skill_list}")
        
        return skill_list
        
    except Exception as analysis_error:
        print(f"Yetkinlik analizi hatası: {analysis_error}")
        print(f"Hata detayları: {traceback.format_exc()}")
        return []

# Ana API endpoint'i
@app.route('/analyze', methods=['POST'])
def analyze_skills():
    """
    POST /analyze
    Metin analizi yaparak yetkinlikleri döndürür
    """
    try:
        print("🔄 POST isteği alındı: /analyze")
        
        # JSON verisini al
        request_data = request.get_json()
        
        if not request_data:
            print("❌ JSON veri bulunamadı")
            return jsonify({
                'error': 'JSON veri gönderilmedi', 
                'skills': []
            }), 400
        
        # Metni çıkar
        text_to_analyze = request_data.get('text', '')
        print(f"📝 Analiz edilecek metin: {text_to_analyze[:100]}{'...' if len(text_to_analyze) > 100 else ''}")
        
        if not text_to_analyze:
            print("❌ Boş metin gönderildi")
            return jsonify({'skills': []})
        
        # Yetkinlik analizi yap
        detected_skills = analyze_text_for_skills(text_to_analyze)
        
        # Cevabı hazırla
        response_data = {'skills': detected_skills}
        print(f"✅ Analiz tamamlandı. Cevap gönderiliyor: {response_data}")
        
        return jsonify(response_data)
        
    except Exception as api_error:
        print(f"❌ API hatası: {api_error}")
        print(f"Hata detayları: {traceback.format_exc()}")
        
        return jsonify({
            'error': str(api_error), 
            'skills': []
        }), 500

# Sağlık kontrolü endpoint'i
@app.route('/health', methods=['GET'])
def health_check():
    """
    GET /health
    API'nin çalışıp çalışmadığını kontrol eder
    """
    print("💚 Sağlık kontrolü yapıldı")
    return jsonify({
        'status': 'healthy', 
        'message': 'Yetkinlik Analizi API çalışıyor',
        'version': '1.0.0'
    })

# Ana sayfa
@app.route('/', methods=['GET'])
def home_page():
    """
    GET /
    API bilgilerini gösterir
    """
    return jsonify({
        'name': 'Volunteer Skill Map - Yetkinlik Analizi API',
        'version': '1.0.0',
        'description': 'Türkçe metinlerden yetkinlik çıkarma API\'si',
        'endpoints': {
            'POST /analyze': 'Metin analizi yaparak yetkinlik çıkarır',
            'GET /health': 'API sağlık durumunu kontrol eder',
            'GET /': 'Bu bilgi sayfası'
        },
        'example_usage': {
            'url': '/analyze',
            'method': 'POST',
            'body': {
                'text': 'Takımımla birlikte çevre temizliği yaptık ve problemleri çözdük.'
            },
            'response': {
                'skills': ['Takım Çalışması', 'Problem Çözme']
            }
        }
    })

# Ana program
if __name__ == '__main__':
    print("🚀 Yetkinlik Analizi API başlatılıyor...")
    print("🌐 Port: 5001")
    print("📡 Adres: http://localhost:5001")
    print("📋 Endpoint'ler:")
    print("   POST /analyze - Yetkinlik analizi")
    print("   GET /health - Sağlık kontrolü")
    print("   GET / - API bilgileri")
    print("=" * 50)
    
    # Flask uygulamasını başlat
    app.run(
        host='0.0.0.0',  # Tüm IP'lerden erişime izin ver
        port=5001,       # 5001 portunu kullan
        debug=True       # Debug modunu aç (geliştirme için)
    ) 