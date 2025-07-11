from flask import Flask, request, jsonify

app = Flask(__name__)

KEYWORD_SKILL_MAP = {
    "takım": "Takım Çalışması",
    "ekip": "Takım Çalışması",
    "liderlik": "Liderlik",
    "organize": "Organizasyon",
    "planlama": "Planlama",
    "iletişim": "İletişim",
    "problem": "Problem Çözme",
    "çözüm": "Problem Çözme",
    "sorumluluk": "Sorumluluk",
    "yardım": "Empati",
    "destek": "Empati",
}

def extract_skills(text):
    text = text.lower()
    found_skills = set()
    for keyword, skill in KEYWORD_SKILL_MAP.items():
        if keyword in text:
            found_skills.add(skill)
    return list(found_skills)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    skills = extract_skills(text)
    return jsonify({'skills': skills})

if __name__ == '__main__':
    app.run(port=5001) 