import express, { type Router } from 'express';
import { requireAuth } from '../../middleware/auth';

const refusal = {
  en: "I can't help with medicines, doses, or diagnosis. Please ask your doctor or ASHA worker.",
  kn: 'ಔಷಧಿ, ಪ್ರಮಾಣ ಅಥವಾ ರೋಗನಿರ್ಣಯದ ಬಗ್ಗೆ ನಾನು ಸಲಹೆ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ವೈದ್ಯರು ಅಥವಾ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  hi: 'मैं दवा, खुराक या निदान के बारे में सलाह नहीं दे सकता। कृपया डॉक्टर या आशा कार्यकर्ता से पूछें।',
};

const emergency = {
  en: 'If this may be an emergency, call 112 or go to the nearest hospital now. Contact your ASHA worker if available.',
  kn: 'ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು ಎಂದು ಅನಿಸಿದರೆ, ಈಗಲೇ 112ಕ್ಕೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ. ಸಾಧ್ಯವಾದರೆ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  hi: 'यदि यह आपात स्थिति हो सकती है, तो अभी 112 पर कॉल करें या नज़दीकी अस्पताल जाएँ। उपलब्ध हों तो आशा कार्यकर्ता से संपर्क करें।',
};

const general = {
  en: 'I can share general information about pregnancy care, food and hygiene, appointments, and JANANI features. For personal health questions, please speak with a qualified health worker.',
  kn: 'ಗರ್ಭಧಾರಣೆಯ ಆರೈಕೆ, ಆಹಾರ ಮತ್ತು ಸ್ವಚ್ಛತೆ, ಭೇಟಿಗಳು ಹಾಗೂ JANANI ವೈಶಿಷ್ಟ್ಯಗಳ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ನೀಡಬಹುದು. ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  hi: 'मैं गर्भावस्था की देखभाल, भोजन और स्वच्छता, मुलाक़ातों और JANANI की सुविधाओं पर सामान्य जानकारी दे सकता हूँ। निजी स्वास्थ्य प्रश्नों के लिए स्वास्थ्यकर्मी से बात करें।',
};

export function createChatRouter(): Router {
  const router = express.Router();
  router.post('/', requireAuth, (req, res) => {
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    const language = ['en', 'kn', 'hi'].includes(req.body.language) ? req.body.language as 'en' | 'kn' | 'hi' : 'en';
    if (!message || message.length > 1000) {
      res.status(400).json({ message: 'Enter a message of up to 1000 characters' });
      return;
    }
    const normalized = message.toLowerCase();
    const medicalQuestion = /\b(medicine|medicines|tablet|tablets|drug|dose|dosage|prescription|which medicine|diagnose|diagnosis|do i have|am i diabetic|pcos|pcod)\b/.test(normalized)
      || /ಔಷಧ|ಮಾತ್ರೆ|ಡೋಸ್|ರೋಗನಿರ್ಣಯ|दवा|गोली|खुराक|निदान/.test(normalized);
    const emergencyQuestion = /\b(bleed|bleeding|severe pain|unconscious|water broke|labour|labor|baby not moving|not moving)\b/.test(normalized)
      || /ರಕ್ತಸ್ರಾವ|ತೀವ್ರ ನೋವು|ಪ್ರಜ್ಞೆ ಇಲ್ಲ|ನೀರು ಒಡೆ|ಮಗು ಚಲಿಸುತ್ತಿಲ್ಲ|खून बह|तेज़ दर्द|बेहोश|पानी टूट|बच्चा नहीं हिल/.test(normalized);
    const reply = medicalQuestion ? refusal[language] : emergencyQuestion ? emergency[language] : general[language];
    res.json({ reply, language, mode: 'safe-rules' });
  });
  return router;
}
