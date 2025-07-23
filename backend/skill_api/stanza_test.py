import stanza


stanza.download('tr')


nlp = stanza.Pipeline('tr', processors='tokenize,mwt,pos,lemma')

def extract_skills_stanza(text):
    doc = nlp(text.lower())
    skills = set()
    for sent in doc.sentences:
        lemmas = [word.lemma for word in sent.words]
        tokens = [word.text for word in sent.words]
        print('Lemmas:', lemmas)
        print('Tokens:', tokens)
        # Takım Çalışması
        if ("çalışmak" in lemmas or "çalıştı" in lemmas or "çalışma" in lemmas or "çalıştım" in lemmas or "çalış" in lemmas or "çalışıyor" in lemmas or "çalışıyoruz" in lemmas) and ("ekip" in lemmas or "takım" in lemmas or "ekip" in tokens or "takım" in tokens):
            skills.add("Takım Çalışması")
        # Liderlik
        if "yönetmek" in lemmas or "liderlik" in lemmas or "yönet" in lemmas or "lider" in lemmas or "yönettim" in lemmas or "liderlik" in tokens or "lider" in tokens:
            skills.add("Liderlik")
        # Teknik Yetkinlik
        if "geliştirmek" in lemmas or "tasarlamak" in lemmas or "geliştir" in lemmas or "tasarla" in lemmas or "geliştirdim" in lemmas or "tasarladım" in lemmas or "geliştirme" in lemmas or "tasarım" in lemmas or "geliştirme" in tokens or "tasarım" in tokens:
            skills.add("Teknik Yetkinlik")
        # Empati
        if "yardım" in lemmas or "destek" in lemmas or "yardım" in tokens or "destek" in tokens:
            skills.add("Empati")
             # İletişim
        if "iletişim" in lemmas or "konuşmak" in lemmas or "anlatmak" in lemmas or "paylaşmak" in lemmas or "dinlemek" in lemmas or "iletişim" in tokens:
            skills.add("İletişim")
        # Problem Çözme
        if "problem" in lemmas or "çözmek" in lemmas or "sorun" in lemmas or "çözüm" in lemmas or "problem" in tokens or "sorun" in tokens:
            skills.add("Problem Çözme")
        # Planlama
        if "planlamak" in lemmas or "plan" in lemmas or "düzenlemek" in lemmas or "organize" in lemmas or "plan" in tokens or "düzenleme" in tokens:
            skills.add("Planlama")
        # Sorumluluk
        if "sorumluluk" in lemmas or "üstlenmek" in lemmas or "sorumlu" in lemmas or "görev" in lemmas or "sorumluluk" in tokens or "görev" in tokens:
            skills.add("Sorumluluk")
        # Gönüllülük
        if "gönüllü" in lemmas or "gönüllülük" in lemmas or "katılmak" in lemmas or "desteklemek" in lemmas or "gönüllü" in tokens or "gönüllülük" in tokens:
            skills.add("Gönüllülük")
    return list(skills)


texts = [
    "Proje süresince ekip arkadaşlarımla uyum içinde çalıştım",
    "Bir mobil uygulama geliştirdim ve ekip olarak çalıştım.",
    "Bir yardım organizasyonunda görev aldım.",
    "Takımı yönettim ve liderlik yaptım."
]

for text in texts:
    print(f"\nCümle: {text}")
    skills = extract_skills_stanza(text)
    print("Çıkarılan yetkinlikler:", skills) 