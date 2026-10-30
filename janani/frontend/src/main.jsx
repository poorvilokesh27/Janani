import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ArrowRight, Baby, Bell, CalendarDays, Check, ChevronRight, CircleUserRound, ClipboardPlus, Droplets, HeartPulse, Leaf, MapPin, Menu, MessageCircle, Mic, Phone, ShieldCheck, Sparkles, Stethoscope, Utensils, Volume2, X, LogOut } from 'lucide-react';
import './styles.css';
import './layered.css';
import './motion.css';
import { apiRequest, getCycleLogs, requestOtp, resendOtp, saveCycleLog, savePregnancyMonth, saveProfileMobile, signInWithPassword, verifyOtp } from './api';
import ReproductiveCareGuide from './ReproductiveCareGuide';
import PopulationHealthGuide from './PopulationHealthGuide';
const SchemesSupport = React.lazy(() => import('./SchemesSupport'));

const authCopy = {
  en: { signIn: 'Sign in', signUp: 'Sign up', mobile: 'Mobile number', name: 'Your name', send: 'Send verification code', verify: 'Verify and enter JANANI', code: 'One-time password', password: 'Password', welcome: 'Your care space starts here.', intro: 'Private, gentle support for pregnancy and reproductive health.', sent: 'Enter the 6-digit code sent to your mobile.', resend: 'Resend code', different: 'Use a different number', language: 'Language', methodMobile: 'Mobile number', methodEmail: 'Email address', mobileHint: 'Simple and accessible', emailHint: 'Use your email inbox', welcomeLabel: 'Welcome to JANANI', brandTag: 'Care • knowledge • confidence', guidance: 'Gentle guidance', careClarity: 'Care / clarity', privateNote: 'Mobile verification is available for every sign-in and sign-up. Email sign-in uses your password.' },
  kn: { signIn: 'ಸೈನ್ ಇನ್', signUp: 'ಸೈನ್ ಅಪ್', mobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', name: 'ನಿಮ್ಮ ಹೆಸರು', send: 'ಪರಿಶೀಲನಾ ಕೋಡ್ ಕಳುಹಿಸಿ', verify: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು JANANI ಪ್ರವೇಶಿಸಿ', code: 'ಒಮ್ಮೆ ಬಳಕೆಯ ಪಾಸ್‌ವರ್ಡ್', password: 'ಪಾಸ್‌ವರ್ಡ್', welcome: 'ನಿಮ್ಮ ಆರೈಕೆ ಸ್ಥಳ ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.', intro: 'ಗರ್ಭಧಾರಣೆ ಮತ್ತು ಸಂತಾನೋತ್ಪತ್ತಿ ಆರೋಗ್ಯಕ್ಕಾಗಿ ಖಾಸಗಿ, ಸೌಮ್ಯ ಬೆಂಬಲ.', sent: 'ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ಕಳುಹಿಸಿದ 6 ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ.', resend: 'ಕೋಡ್ ಮತ್ತೆ ಕಳುಹಿಸಿ', different: 'ಬೇರೆ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ', language: 'ಭಾಷೆ', methodMobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', methodEmail: 'ಇಮೇಲ್ ವಿಳಾಸ', mobileHint: 'ಸರಳ ಮತ್ತು ಸುಲಭ', emailHint: 'ನಿಮ್ಮ ಇಮೇಲ್ ಬಳಸಿ', welcomeLabel: 'JANANI ಗೆ ಸ್ವಾಗತ', brandTag: 'ಆರೈಕೆ • ಜ್ಞಾನ • ಆತ್ಮವಿಶ್ವಾಸ', guidance: 'ಸೌಮ್ಯ ಮಾರ್ಗದರ್ಶನ', careClarity: 'ಆರೈಕೆ / ಸ್ಪಷ್ಟತೆ', privateNote: 'ಪ್ರತಿ ಸೈನ್ ಇನ್ ಮತ್ತು ಸೈನ್ ಅಪ್‌ಗೆ ಮೊಬೈಲ್ ಪರಿಶೀಲನೆ ಲಭ್ಯವಿದೆ. ಇಮೇಲ್ ಸೈನ್ ಇನ್‌ಗೆ ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಬಳಸಿ.' },
  hi: { signIn: 'साइन इन', signUp: 'साइन अप', mobile: 'मोबाइल नंबर', name: 'आपका नाम', send: 'सत्यापन कोड भेजें', verify: 'सत्यापित करें और JANANI खोलें', code: 'वन-टाइम पासवर्ड', password: 'पासवर्ड', welcome: 'आपका देखभाल स्थान यहां से शुरू होता है।', intro: 'गर्भावस्था और प्रजनन स्वास्थ्य के लिए निजी, सहज सहायता।', sent: 'अपने मोबाइल पर भेजा गया 6 अंकों का कोड दर्ज करें।', resend: 'कोड फिर भेजें', different: 'दूसरा नंबर इस्तेमाल करें', language: 'भाषा', methodMobile: 'मोबाइल नंबर', methodEmail: 'ईमेल पता', mobileHint: 'सरल और आसान', emailHint: 'अपने ईमेल इनबॉक्स का उपयोग करें', welcomeLabel: 'JANANI में आपका स्वागत है', brandTag: 'देखभाल • ज्ञान • आत्मविश्वास', guidance: 'सहज मार्गदर्शन', careClarity: 'देखभाल / स्पष्टता', privateNote: 'हर साइन इन और साइन अप के लिए मोबाइल सत्यापन उपलब्ध है। ईमेल साइन इन के लिए अपना पासवर्ड इस्तेमाल करें।' },
};

const dashboardCopy = {
  en: { member: 'JANANI member', overview: 'Overview', tracker: 'Pregnancy tracker', appointments: 'Appointments', reminders: 'Reminders', wellness: 'Food & hygiene after birth', pregnancyCare: 'Food & hygiene during pregnancy', periods: 'Menstrual health', schemes: 'Schemes & support', emergency: 'Emergency contacts', location: 'Nearby Anganwadis', profile: 'My profile', support: 'Need support?', resources: 'Browse trusted resources', greeting: 'Good morning', weeks: 'weeks', open: 'Open tracker', remindersTitle: 'Next care reminders', injections: 'Vaccination and check-up reminders', postpartum: 'After childbirth: food and hygiene', findCenters: 'Find nearby Anganwadis', useLocation: 'Use my current location', locationHint: 'Allow location access to see nearby centres and their contact numbers.', emergencyTitle: 'Emergency contacts', emergencyText: 'Call your local Anganwadi worker or emergency services when you need immediate help.', call: 'Call', saved: 'Saved', chat: 'Ask JANANI', profileTitle: 'Your profile', language: 'Language', appearance: 'Colour theme', logout: 'Log out', light: 'Light', dark: 'Dark', system: 'System', account: 'Account details', email: 'Email', mobile: 'Mobile number' },
  kn: { member: 'JANANI ಸದಸ್ಯರು', overview: 'ಮುಖ್ಯಾಂಶ', tracker: 'ಗರ್ಭಧಾರಣೆ ಟ್ರ್ಯಾಕರ್', appointments: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', reminders: 'ಜ್ಞಾಪನೆಗಳು', wellness: 'ಹೆರಿಗೆಯ ನಂತರ ಆಹಾರ ಮತ್ತು ಸ್ವಚ್ಛತೆ', pregnancyCare: 'ಗರ್ಭಾವಸ್ಥೆಯ ಆಹಾರ ಮತ್ತು ಸ್ವಚ್ಛತೆ', periods: 'ಮಾಸಿಕ ಆರೋಗ್ಯ', schemes: 'ಯೋಜನೆಗಳು ಮತ್ತು ಸಹಾಯ', emergency: 'ತುರ್ತು ಸಂಪರ್ಕಗಳು', location: 'ಹತ್ತಿರದ ಅಂಗನವಾಡಿಗಳು', profile: 'ನನ್ನ ಪ್ರೊಫೈಲ್', support: 'ಸಹಾಯ ಬೇಕೇ?', resources: 'ವಿಶ್ವಾಸಾರ್ಹ ಸಂಪನ್ಮೂಲಗಳನ್ನು ನೋಡಿ', greeting: 'ಶುಭೋದಯ', journey: 'ನಿಮ್ಮ ಗರ್ಭಧಾರಣೆಯ ಪ್ರಯಾಣ', weeks: 'ವಾರಗಳು', open: 'ಟ್ರ್ಯಾಕರ್ ತೆರೆಯಿರಿ', remindersTitle: 'ಮುಂದಿನ ಆರೈಕೆ ಜ್ಞಾಪನೆಗಳು', injections: 'ಲಸಿಕೆ ಮತ್ತು ತಪಾಸಣೆ ಜ್ಞಾಪನೆಗಳು', postpartum: 'ಹೆರಿಗೆಯ ನಂತರ: ಆಹಾರ ಮತ್ತು ಸ್ವಚ್ಛತೆ', findCenters: 'ಹತ್ತಿರದ ಅಂಗನವಾಡಿಗಳನ್ನು ಹುಡುಕಿ', useLocation: 'ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ', locationHint: 'ಹತ್ತಿರದ ಕೇಂದ್ರಗಳು ಮತ್ತು ಸಂಪರ್ಕ ಸಂಖ್ಯೆಗಳನ್ನು ನೋಡಲು ಸ್ಥಳ ಅನುಮತಿಸಿ.', emergencyTitle: 'ತುರ್ತು ಸಂಪರ್ಕಗಳು', emergencyText: 'ತಕ್ಷಣದ ಸಹಾಯ ಬೇಕಾದಾಗ ನಿಮ್ಮ ಅಂಗನವಾಡಿ ಕಾರ್ಯಕರ್ತೆ ಅಥವಾ ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಕರೆ ಮಾಡಿ.', call: 'ಕರೆ ಮಾಡಿ', saved: 'ಉಳಿಸಲಾಗಿದೆ', chat: 'JANANI ಕೇಳಿ', profileTitle: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್', language: 'ಭಾಷೆ', appearance: 'ಬಣ್ಣದ ಥೀಮ್', logout: 'ಲಾಗ್ ಔಟ್', light: 'ಲೈಟ್', dark: 'ಡಾರ್ಕ್', system: 'ಸಿಸ್ಟಮ್', account: 'ಖಾತೆ ವಿವರಗಳು', email: 'ಇಮೇಲ್', mobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' },
  hi: { member: 'JANANI सदस्य', overview: 'अवलोकन', tracker: 'गर्भावस्था ट्रैकर', appointments: 'अपॉइंटमेंट', reminders: 'रिमाइंडर', wellness: 'प्रसव के बाद भोजन और स्वच्छता', pregnancyCare: 'गर्भावस्था में भोजन और स्वच्छता', periods: 'मासिक स्वास्थ्य', schemes: 'योजनाएं और सहायता', emergency: 'आपातकालीन संपर्क', location: 'पास के आंगनवाड़ी केंद्र', profile: 'मेरी प्रोफ़ाइल', support: 'सहायता चाहिए?', resources: 'विश्वसनीय संसाधन देखें', greeting: 'सुप्रभात', journey: 'आपकी गर्भावस्था यात्रा', weeks: 'सप्ताह', open: 'ट्रैकर खोलें', remindersTitle: 'अगली देखभाल रिमाइंडर', injections: 'टीका और जांच रिमाइंडर', postpartum: 'प्रसव के बाद: भोजन और स्वच्छता', findCenters: 'पास के आंगनवाड़ी केंद्र खोजें', useLocation: 'मेरा वर्तमान स्थान उपयोग करें', locationHint: 'पास के केंद्र और उनके फोन नंबर देखने के लिए स्थान की अनुमति दें।', emergencyTitle: 'आपातकालीन संपर्क', emergencyText: 'तुरंत सहायता की जरूरत हो तो अपने आंगनवाड़ी कार्यकर्ता या आपातकालीन सेवा को कॉल करें।', call: 'कॉल करें', saved: 'सहेजा गया', chat: 'JANANI से पूछें', profileTitle: 'आपकी प्रोफ़ाइल', language: 'भाषा', appearance: 'रंग थीम', logout: 'लॉग आउट', light: 'लाइट', dark: 'डार्क', system: 'सिस्टम', account: 'खाते की जानकारी', email: 'ईमेल', mobile: 'मोबाइल नंबर' },
};

const landingCopy = {
  en: { about: 'About', resources: 'Resources', community: 'Community support', open: 'Open care space', begin: 'Begin your journey', explore: 'Explore resources', eyebrow: 'Support for every chapter', titleA: 'Care, knowledge,', titleB: 'confidence.', intro: 'JANANI brings trusted, easy-to-understand maternal and reproductive health support into one private space.', designed: 'Designed with women, for women', ready: 'A little more ready', onePlace: 'One thoughtful place to feel supported.', introText: 'Whether you are preparing for pregnancy, navigating a new trimester, caring for a baby, or learning about your cycle, JANANI meets you where you are.', toolkit: 'Your everyday toolkit', fitLife: 'Support that fits your life.', allFeatures: 'View all features', pregnancy: 'For the pregnancy journey', next: 'Understand what’s next, without the overwhelm.', pregnancyText: 'See your current week, gentle educational guidance, upcoming appointments and personal notes in one uncluttered view.', tracker: 'See the tracker', questions: 'Questions are welcome here.', askText: 'Ask JANANI for general educational information, whenever you need a starting point.', companion: 'Meet your companion', footer: 'A kinder way to stay informed.' },
  kn: { about: 'ನಮ್ಮ ಬಗ್ಗೆ', resources: 'ಸಂಪನ್ಮೂಲಗಳು', community: 'ಸಮುದಾಯ ಸಹಾಯ', open: 'ಆರೈಕೆ ಸ್ಥಳ ತೆರೆಯಿರಿ', begin: 'ನಿಮ್ಮ ಪ್ರಯಾಣ ಆರಂಭಿಸಿ', explore: 'ಸಂಪನ್ಮೂಲಗಳನ್ನು ನೋಡಿ', eyebrow: 'ಪ್ರತಿ ಹಂತಕ್ಕೂ ಬೆಂಬಲ', titleA: 'ಆರೈಕೆ, ಜ್ಞಾನ,', titleB: 'ಆತ್ಮವಿಶ್ವಾಸ.', intro: 'JANANI ತಾಯಂದಿರು ಮತ್ತು ಮಹಿಳೆಯರ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಮಾಹಿತಿಯನ್ನು ಒಂದೇ ಖಾಸಗಿ ಸ್ಥಳದಲ್ಲಿ ನೀಡುತ್ತದೆ.', designed: 'ಮಹಿಳೆಯರೊಂದಿಗೆ, ಮಹಿಳೆಯರಿಗಾಗಿ', ready: 'ಇನ್ನಷ್ಟು ಸಿದ್ಧರಾಗಿರಿ', onePlace: 'ಬೆಂಬಲ ನೀಡುವ ಒಂದು ಆರೈಕೆಯ ಸ್ಥಳ.', introText: 'ಗರ್ಭಧಾರಣೆಗೆ ಸಿದ್ಧರಾಗುತ್ತಿರಲಿ, ಮಗುವನ್ನು ನೋಡಿಕೊಳ್ಳುತ್ತಿರಲಿ ಅಥವಾ ಮಾಸಿಕ ಚಕ್ರವನ್ನು ತಿಳಿಯುತ್ತಿರಲಿ, JANANI ನಿಮ್ಮ ಜೊತೆಗಿದೆ.', toolkit: 'ನಿಮ್ಮ ದೈನಂದಿನ ಆರೈಕೆ', fitLife: 'ನಿಮ್ಮ ಜೀವನಕ್ಕೆ ಹೊಂದುವ ಬೆಂಬಲ.', allFeatures: 'ಎಲ್ಲಾ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ನೋಡಿ', pregnancy: 'ಗರ್ಭಧಾರಣೆಯ ಪ್ರಯಾಣಕ್ಕೆ', next: 'ಮುಂದೇನು ಎಂದು ಸರಳವಾಗಿ ತಿಳಿಯಿರಿ.', pregnancyText: 'ನಿಮ್ಮ ವಾರ, ಸರಳ ಮಾಹಿತಿ, ಮುಂದಿನ ಭೇಟಿಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ನೋಡಿ.', tracker: 'ಟ್ರ್ಯಾಕರ್ ನೋಡಿ', questions: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸ್ವಾಗತ.', askText: 'ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿಗಾಗಿ JANANI ಅನ್ನು ಕೇಳಿ.', companion: 'ನಿಮ್ಮ ಸಹಾಯಕಿಯನ್ನು ಭೇಟಿ ಮಾಡಿ', footer: 'ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಸುಲಭವಾಗಿ ತಿಳಿಯಿರಿ.' },
  hi: { about: 'परिचय', resources: 'संसाधन', community: 'सामुदायिक सहायता', open: 'देखभाल केंद्र खोलें', begin: 'अपनी यात्रा शुरू करें', explore: 'संसाधन देखें', eyebrow: 'हर पड़ाव पर साथ', titleA: 'देखभाल, जानकारी,', titleB: 'आत्मविश्वास।', intro: 'JANANI मातृत्व और प्रजनन स्वास्थ्य की भरोसेमंद, सरल जानकारी एक निजी जगह पर देता है।', designed: 'महिलाओं के साथ, महिलाओं के लिए', ready: 'थोड़ा और तैयार', onePlace: 'सहारे के लिए एक भरोसेमंद जगह।', introText: 'गर्भावस्था की तैयारी हो, शिशु की देखभाल हो या मासिक चक्र की जानकारी, JANANI आपके साथ है।', toolkit: 'आपकी रोज़मर्रा की देखभाल', fitLife: 'आपकी ज़िंदगी के अनुरूप सहायता।', allFeatures: 'सभी सुविधाएँ देखें', pregnancy: 'गर्भावस्था की यात्रा के लिए', next: 'आगे क्या है, सरलता से जानें।', pregnancyText: 'अपना सप्ताह, सामान्य जानकारी, अगली मुलाक़ातें और निजी नोट एक जगह देखें।', tracker: 'ट्रैकर देखें', questions: 'आपके सवालों का स्वागत है।', askText: 'सामान्य स्वास्थ्य जानकारी के लिए JANANI से पूछें।', companion: 'अपने सहायक से मिलें', footer: 'स्वास्थ्य जानकारी अब आसान।' },
};

const modules = [
  { icon: Baby, title: 'Pregnancy tracker', text: 'A calm view of your week, due date and what to expect next.', tone: 'peach', page: 'tracker' },
  { icon: CalendarDays, title: 'Appointments', text: 'Keep check-ups and important moments in one clear place.', tone: 'mint', page: 'appointments' },
  { icon: Leaf, title: 'Nutrition & wellness', text: 'Practical, general guidance for everyday nourishment.', tone: 'lemon', page: 'wellness' },
  { icon: Droplets, title: 'Menstrual health', text: 'Understand your cycle with simple, private tracking.', tone: 'lilac', page: 'periods' },
  { icon: ShieldCheck, title: 'Government schemes', text: 'Explore sample resources and learn what to verify.', tone: 'blue', page: 'schemes' },
  { icon: MessageCircle, title: 'Ask JANANI', text: 'A gentle educational companion for everyday questions.', tone: 'rose', page: 'chat' },
];

function App() {
  const [view, setView] = useState(() => window.localStorage.getItem('janani_token') ? 'home' : 'auth');
  const [language, setLanguage] = useState(() => window.localStorage.getItem('janani_language') || 'en');
  const [theme, setTheme] = useState(() => window.localStorage.getItem('janani_theme') || 'light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const go = (next) => { setView(next); setMobileOpen(false); window.scrollTo(0, 0); };
  React.useEffect(() => {
    const handleAuthExpired = () => go('auth');
    window.addEventListener('janani-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('janani-auth-expired', handleAuthExpired);
  }, []);
  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    event.currentTarget.style.setProperty('--pointer-x', `${x * 18}px`);
    event.currentTarget.style.setProperty('--pointer-y', `${y * 18}px`);
    event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - rect.top}px`);
  };
  React.useEffect(() => { document.documentElement.dataset.theme = theme; window.localStorage.setItem('janani_theme', theme); }, [theme]);
  return <div className="app-shell" onPointerMove={handlePointerMove}>
    <div className="cursor-glow" aria-hidden="true"></div><div className="floating-doodles" aria-hidden="true"><span className="floating-doodle doodle-baby"><Baby size={23}/></span><span className="floating-doodle doodle-heart"><HeartPulse size={20}/></span><span className="floating-doodle doodle-leaf"><Leaf size={21}/></span><span className="floating-doodle doodle-sparkle"><Sparkles size={18}/></span></div>
    <div className="ambient-orb orb-one" aria-hidden="true"></div>
    <div className="ambient-orb orb-two" aria-hidden="true"></div>
    {view === 'auth' ? <AuthGate language={language} setLanguage={setLanguage} onVerified={() => go('home')} /> : view === 'home' ? <Landing go={go} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} /> : <Dashboard view={view} go={go} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} onLogout={() => { window.localStorage.removeItem('janani_token'); window.localStorage.removeItem('janani_user'); go('auth'); }} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}
  </div>;
}

function AuthGate({ language, setLanguage, onVerified }) {
  const [mode, setMode] = useState('signIn');
  const [method, setMethod] = useState('mobile');
  const [step, setStep] = useState('identifier');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const text = authCopy[language];
  const changeLanguage = (value) => {
    setLanguage(value);
    window.localStorage.setItem('janani_language', value);
  };
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const identifier = method === 'mobile' ? mobile : email;
      if (method === 'email' && mode === 'signIn') {
        const result = await signInWithPassword(email, password);
        window.localStorage.setItem('janani_token', result.token);
        window.localStorage.setItem('janani_user', JSON.stringify(result.user));
        onVerified();
      } else if (step === 'identifier') {
        await requestOtp(identifier, method, mode === 'signUp' ? 'signup' : 'signin', password, mobile);
        setStep('otp');
      } else {
        const result = await verifyOtp(identifier, code, name, method, password, mobile);
        window.localStorage.setItem('janani_token', result.token);
        window.localStorage.setItem('janani_user', JSON.stringify(result.user));
        onVerified();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };
  const resend = async () => {
    setError('');
    try { await resendOtp(method === 'mobile' ? mobile : email, method, password, mobile); } catch (requestError) { setError(requestError.message); }
  };
  return <main className="auth-gate">
    <div className="auth-language"><span>{text.language}</span><select value={language} onChange={(event) => changeLanguage(event.target.value)} aria-label={text.language}><option value="en">English</option><option value="kn">ಕನ್ನಡ</option><option value="hi">हिन्दी</option></select></div>
    <section className="auth-visual" aria-label="JANANI maternal care illustration"><div className="auth-brand-lockup"><span className="auth-brand-mark">J</span><span className="auth-brand-name">JANANI</span><small>{text.brandTag}</small></div><div className="auth-sun"></div><div className="auth-orbit"></div><div className="auth-mother"><div className="auth-head"></div><div className="auth-hair"></div><div className="auth-body"></div><div className="auth-bump"></div><div className="auth-arm"></div></div><div className="auth-floating-note"><HeartPulse size={16}/><span>{text.guidance}</span></div><span className="auth-floating-pill">{text.careClarity}</span></section>
    <section className="auth-panel"><div className="login-mark">J</div><span className="section-kicker">{text.welcomeLabel}</span><h1>{text.welcome}</h1><p>{text.intro}</p><div className="auth-tabs"><button type="button" className={mode === 'signIn' ? 'active' : ''} onClick={() => { setMode('signIn'); setStep('identifier'); }}>{text.signIn}</button><button type="button" className={mode === 'signUp' ? 'active' : ''} onClick={() => { setMode('signUp'); setStep('identifier'); }}>{text.signUp}</button></div>{step === 'identifier' && <div className="auth-methods"><button type="button" className={method === 'mobile' ? 'selected' : ''} onClick={() => { setMethod('mobile'); setError(''); }}><span className="method-icon">◉</span><span><strong>{text.methodMobile}</strong><small>{text.mobileHint}</small></span><span className="method-check">✓</span></button><button type="button" className={method === 'email' ? 'selected' : ''} onClick={() => { setMethod('email'); setError(''); }}><span className="method-icon">@</span><span><strong>{text.methodEmail}</strong><small>{text.emailHint}</small></span><span className="method-check">✓</span></button></div>}<form onSubmit={submit}>{mode === 'signUp' && step === 'identifier' && <label>{text.name}<input value={name} onChange={(event) => setName(event.target.value)} placeholder={text.name} required /></label>}{method === 'email' && mode === 'signUp' && step === 'identifier' && <label>{text.mobile}<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="+91 98765 43210" autoComplete="tel" pattern="\\+?[0-9 ()-]{10,20}" required /></label>}{step === 'identifier' ? <label>{method === 'mobile' ? text.mobile : text.methodEmail}<input type={method === 'mobile' ? 'tel' : 'email'} value={method === 'mobile' ? mobile : email} onChange={(event) => method === 'mobile' ? setMobile(event.target.value) : setEmail(event.target.value)} placeholder={method === 'mobile' ? '+91 9876543210' : 'you@example.com'} pattern={method === 'mobile' ? '\\+?[0-9 ()-]{10,20}' : undefined} required /></label> : <label>{text.code}<input type="text" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" inputMode="numeric" pattern="[0-9]{6}" required /></label>}{method === 'email' && <label>{text.password}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} required /></label>}{step === 'otp' && <p className="auth-otp-hint">{text.sent}</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button full auth-submit" disabled={loading}>{loading ? '...' : method === 'email' && mode === 'signIn' ? text.signIn : step === 'identifier' ? text.send : text.verify}<ArrowRight size={17}/></button></form>{step === 'otp' && <><button type="button" className="quiet-button auth-secondary" onClick={resend}>{text.resend}</button><button type="button" className="quiet-button auth-secondary" onClick={() => { setStep('identifier'); setCode(''); }}>{text.different}</button></>}<small className="login-note">{text.privateNote}</small></section>
  </main>;
}

function Topbar({ go, onMenu, language, setLanguage, theme, setTheme }) {
  const user = JSON.parse(window.localStorage.getItem('janani_user') || '{}');
  const ownerName = user.name || user.mobile || user.email || 'JANANI member';
  const text = landingCopy[language] || landingCopy.en;
  return <header className="topbar"><button className="brand" onClick={() => go('home')}><span className="brand-mark">J</span><span>JANANI</span></button><nav className="desktop-nav"><button onClick={() => go('home')}>{text.about}</button><button onClick={() => go('tracker')}>{text.resources}</button><button onClick={() => go('emergency')}>{text.community}</button></nav><div className="top-actions"><select className="dashboard-language" value={language} onChange={(event) => { setLanguage(event.target.value); window.localStorage.setItem('janani_language', event.target.value); }} aria-label="Language"><option value="en">English</option><option value="kn">ಕನ್ನಡ</option><option value="hi">हिन्दी</option></select><select className="dashboard-language" value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Colour theme"><option value="light">Light</option><option value="dark">Dark</option></select>{window.localStorage.getItem('janani_token') && <><button type="button" className="signed-in-owner" onClick={() => go('profile')} aria-label="Open my profile" title="My profile"><CircleUserRound size={16}/> {ownerName}</button><button className="primary-button small" onClick={() => go('dashboard')}>{text.open} <ArrowRight size={16}/></button></>}<button className="mobile-menu" onClick={onMenu}><Menu size={21}/></button></div></header>;
}

function Landing({ go, language, setLanguage, theme, setTheme }) {
  const text = landingCopy[language] || landingCopy.en;
  return <>
    <Topbar go={go} onMenu={() => {}} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} />
    <main>
      <section className="hero container"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> {text.eyebrow}</div><h1>{text.titleA}<br/><em>{text.titleB}</em></h1><p className="hero-text">{text.intro}</p><div className="hero-actions"><button className="primary-button" onClick={() => go('dashboard')}>{text.begin} <ArrowRight size={18}/></button><button className="quiet-button" onClick={() => go('dashboard')}>{text.explore} <ChevronRight size={17}/></button></div><div className="trust-row"><div className="avatar-stack"><span>R</span><span>A</span><span>M</span></div><span>{text.designed}</span></div></div><div className="hero-art"><div className="hero-grid"></div><div className="sun-disc" data-depth="soft"></div><div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div><div className="figure" data-depth="deep"><div className="figure-head"></div><div className="figure-hair"></div><div className="figure-body"></div><div className="figure-bump"></div><div className="figure-arm"></div></div><div className="art-note note-top" data-depth="soft"><HeartPulse size={16}/><span>{text.eyebrow}</span></div><div className="art-note note-bottom"><span className="dot"></span><span>JANANI</span></div><span className="orbit-label label-one">24 weeks</span><span className="orbit-label label-two">care / clarity</span></div></section>
      <section className="intro-band"><div className="container intro-grid"><div><span className="section-kicker">{text.ready}</span><h2>{text.onePlace}</h2></div><p>{text.introText}</p></div></section>
      <section className="container module-section"><div className="section-heading"><div><span className="section-kicker">{text.toolkit}</span><h2>{text.fitLife}</h2></div><button className="quiet-button" onClick={() => go('dashboard')}>{text.allFeatures} <ArrowRight size={17}/></button></div><div className="module-grid">{modules.map((item) => <ModuleCard key={item.title} item={item} go={go} language={language}/>)}</div></section>
      <section className="split-feature container"><div className="feature-visual"><div className="check-card"><div className="check-icon"><Check size={18}/></div><div><strong>Week 24</strong><small>{text.next}</small></div><span className="check-date">Today</span></div><div className="leaf-shape"></div><div className="feature-quote">Small steps,<br/><em>held gently.</em></div></div><div className="split-copy"><span className="section-kicker">{text.pregnancy}</span><h2>{text.next}</h2><p>{text.pregnancyText}</p><button className="outline-button" onClick={() => go('tracker')}>{text.tracker} <ArrowRight size={17}/></button></div></section>
      <section className="cta-band"><div className="container cta-content"><div><span className="section-kicker">{text.toolkit}</span><h2>{text.questions}</h2><p>{text.askText}</p></div><button className="light-button" onClick={() => go('dashboard')}>{text.companion} <ArrowRight size={17}/></button></div></section>
    </main><Footer go={go}/>
  </>;
}

function ModuleCard({ item, go, language = 'en' }) { const Icon = item.icon; const localized = language === 'hi' ? [['\u0917\u0930\u094d\u092d\u093e\u0935\u0938\u094d\u0925\u093e \u091f\u094d\u0930\u0948\u0915\u0930', '\u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f', '\u092a\u094b\u0937\u0923 \u0914\u0930 \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f', '\u092e\u093e\u0938\u093f\u0915 \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f', '\u0938\u0930\u0915\u093e\u0930\u0940 \u092f\u094b\u091c\u0928\u093e\u090f\u0901', 'JANANI \u0938\u0947 \u092a\u0942\u091b\u0947\u0902'], ['\u0939\u092b\u093c\u094d\u0924\u0947 \u0914\u0930 \u0906\u0928\u0947 \u0935\u093e\u0932\u0940 \u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940', '\u091c\u093e\u0902\u091a \u0914\u0930 \u0924\u093e\u0930\u0940\u0916\u0947\u0902 \u090f\u0915 \u091c\u0917\u0939 \u0930\u0916\u0947\u0902', '\u0930\u094b\u091c\u093c\u092e\u0930\u094d\u0930\u093e \u0915\u0947 \u092a\u094b\u0937\u0923 \u0915\u0940 \u0938\u093e\u092e\u093e\u0928\u094d\u092f \u091c\u093e\u0928\u0915\u093e\u0930\u0940', '\u0905\u092a\u0928\u0947 \u091a\u0915\u094d\u0930 \u0915\u094b \u0928\u093f\u091c\u0940 \u0930\u0942\u092a \u0938\u0947 \u091c\u093e\u0928\u0947\u0902', '\u092e\u093e\u0901 \u0914\u0930 \u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u0939\u093e\u092f\u0924\u093e \u0926\u0947\u0916\u0947\u0902', '\u0938\u093e\u092e\u093e\u0928\u094d\u092f \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0915\u0947 \u0932\u093f\u090f \u092a\u0942\u091b\u0947\u0902']] : language === 'kn' ? [['\u0c97\u0cb0\u0ccd\u0cad\u0ca7\u0cbe\u0cb0\u0ca3\u0cc6 \u0c9f\u0ccd\u0cb0\u0ccd\u0caf\u0cbe\u0c95\u0cb0\u0ccd', '\u0c85\u0caa\u0cbe\u0caf\u0cbf\u0c82\u0c9f\u0ccd\u0cae\u0cc6\u0c82\u0c9f\u0ccd\u0c97\u0cb3\u0cc1', '\u0caa\u0ccb\u0cb7\u0ca3\u0cc6 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0c95\u0ccd\u0cb7\u0cc7\u0cae', '\u0cae\u0cbe\u0cb8\u0cbf\u0c95 \u0c86\u0cb0\u0ccb\u0c97\u0ccd\u0caf', '\u0cb8\u0cb0\u0ccd\u0c95\u0cbe\u0cb0\u0cbf \u0caf\u0ccb\u0c9c\u0ca8\u0cc6\u0c97\u0cb3\u0cc1', 'JANANI \u0c95\u0cc7\u0cb3\u0cbf'], ['\u0cb5\u0cbe\u0cb0 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0cae\u0cc1\u0c82\u0ca6\u0cbf\u0ca8 \u0c86\u0cb0\u0cc8\u0c95\u0cc6\u0caf \u0cae\u0cbe\u0cb9\u0cbf\u0ca4\u0cbf', '\u0ca4\u0caa\u0cbe\u0cb8\u0ca3\u0cc6 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0cae\u0cc1\u0c96\u0ccd\u0caf \u0ca6\u0cbf\u0ca8\u0cbe\u0c82\u0c95\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0c92\u0c82\u0ca6\u0cc7\u0ca1\u0cc6 \u0c87\u0ca1\u0cbf', '\u0ca6\u0cbf\u0ca8\u0ca6\u0cbf\u0ca8\u0ca6 \u0caa\u0ccb\u0cb7\u0ca3\u0cc6\u0caf \u0cae\u0cae\u0cbe\u0ca8\u0ccd\u0caf \u0cae\u0cbe\u0cb9\u0cbf\u0ca4\u0cbf', '\u0ca8\u0cbf\u0cae\u0ccd\u0cae \u0c9a\u0c95\u0ccd\u0cb0\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 \u0c96\u0cbe\u0cb8\u0c97\u0cbf\u0caf\u0cbe\u0c97\u0cbf \u0ca4\u0cbf\u0cb3\u0cbf\u0caf\u0cbf\u0cb0\u0cbf', '\u0ca4\u0cbe\u0caf\u0cbf \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0cae\u0c97\u0cc1\u0cb5\u0cbf\u0ca8 \u0cb8\u0cb9\u0cbe\u0caf \u0ca8\u0ccb\u0ca1\u0cbf', '\u0cb8\u0cbe\u0cae\u0cbe\u0ca8\u0ccd\u0caf \u0cae\u0cbe\u0cb9\u0cbf\u0ca4\u0cbf\u0c97\u0cbe\u0c97\u0cbf \u0c95\u0cc7\u0cb3\u0cbf']] : [modules.map((module) => module.title), modules.map((module) => module.text)]; const index = modules.indexOf(item); return <button className="module-card" onClick={() => go(item.page)}><div className={`module-icon ${item.tone}`}><Icon size={21}/></div><div className="module-card-text"><h3>{localized[0][index]}</h3><p>{localized[1][index]}</p></div><ChevronRight className="card-arrow" size={18}/></button>; }
function Footer({ go }) { return <footer><div className="container footer-inner"><div><button className="brand footer-brand" onClick={() => go('home')}><span className="brand-mark">J</span><span>JANANI</span></button><p>{landingCopy[window.localStorage.getItem('janani_language') || 'en']?.footer || landingCopy.en.footer}</p></div><div className="footer-links"><span>Privacy</span><span>Terms</span><span>Contact</span></div><small>© 2026 JANANI</small></div></footer>; }

function Dashboard({ view, go, language, setLanguage, theme, setTheme, onLogout, mobileOpen, setMobileOpen }) {
  const [completed, setCompleted] = useState(false);
  const user = JSON.parse(window.localStorage.getItem('janani_user') || '{}');
  const copy = dashboardCopy[language];
  const ownerName = user.name || user.mobile || user.email || copy.member;
  const todayLabel = new Intl.DateTimeFormat(({ en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' })[language] || 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const title = view === 'dashboard' ? `${copy.greeting}, ${ownerName}` : ({ tracker: copy.tracker, appointments: copy.appointments, wellness: copy.wellness, 'pregnancy-care': copy.pregnancyCare, periods: copy.periods, 'reproductive-care': language === 'kn' ? 'ಸಂತಾನೋತ್ಪತ್ತಿ ಆರೋಗ್ಯದ ಆರೈಕೆ' : language === 'hi' ? 'प्रजनन स्वास्थ्य देखभाल' : 'Reproductive care', population: language === 'kn' ? 'ಜನಸಂಖ್ಯೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ' : language === 'hi' ? 'जनसंख्या और सार्वजनिक स्वास्थ्य' : 'Population & public health', schemes: copy.schemes, emergency: copy.emergency, location: copy.location, chat: copy.chat, profile: copy.profile, login: copy.overview }[view] || copy.overview);
  const reproductiveNavLabel = language === 'kn' ? 'ಸಂತಾನೋತ್ಪತ್ತಿ ಆರೈಕೆ' : language === 'hi' ? 'प्रजनन स्वास्थ्य देखभाल' : 'Reproductive care';
  const populationNavLabel = language === 'kn' ? 'ಜನಸಂಖ್ಯೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ' : language === 'hi' ? 'जनसंख्या और सार्वजनिक स्वास्थ्य' : 'Population & public health';
  return <div className="dashboard-layout"><aside className={`sidebar ${mobileOpen ? 'open' : ''}`}><div className="side-top"><button className="brand" onClick={() => go('home')}><span className="brand-mark">J</span><span>JANANI</span></button><button className="close-side" onClick={() => setMobileOpen(false)}><X size={20}/></button></div><div className="profile-mini"><div className="profile-avatar">{ownerName.slice(0, 1).toUpperCase()}</div><div><strong>{ownerName}</strong><small>{copy.member}</small></div></div><nav className="side-nav"><span className="nav-label">{copy.journey}</span><SideLink icon={HeartPulse} label={copy.overview} active={view === 'dashboard'} onClick={() => go('dashboard')}/><SideLink icon={Baby} label={copy.tracker} active={view === 'tracker'} onClick={() => go('tracker')}/><SideLink icon={CalendarDays} label={copy.appointments} active={view === 'appointments'} onClick={() => go('appointments')}/><SideLink icon={Bell} label={copy.reminders} active={view === 'reminders'} onClick={() => go('reminders')}/><span className="nav-label second">{copy.resources}</span><SideLink icon={Utensils} label={copy.pregnancyCare} active={view === 'pregnancy-care'} onClick={() => go('pregnancy-care')}/><SideLink icon={ShieldCheck} label={copy.wellness} active={view === 'wellness'} onClick={() => go('wellness')}/>  <SideLink icon={Droplets} label={copy.periods} active={view === 'periods'} onClick={() => go('periods')}/><SideLink icon={HeartPulse} label={reproductiveNavLabel} active={view === 'reproductive-care'} onClick={() => go('reproductive-care')}/><SideLink icon={Baby} label={populationNavLabel} active={view === 'population'} onClick={() => go('population')}/><SideLink icon={ShieldCheck} label={copy.schemes} active={view === 'schemes'} onClick={() => go('schemes')}/><SideLink icon={MapPin} label={copy.location} active={view === 'location'} onClick={() => go('location')}/><SideLink icon={MessageCircle} label={copy.chat} active={view === 'chat'} onClick={() => go('chat')}/><SideLink icon={Phone} label={copy.emergency} active={view === 'emergency'} onClick={() => go('emergency')}/></nav><div className="side-bottom"><SideLink icon={CircleUserRound} label={copy.profile} active={view === 'profile'} onClick={() => go('profile')}/><button className="side-link logout-link" onClick={onLogout}><LogOut size={18}/><span>{copy.logout}</span></button><button className="help-link"><span>{copy.support}</span><small>{copy.resources}</small></button></div></aside><div className="dashboard-main"><header className="dash-header"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div><span className="date-label">{todayLabel}</span><h1>{title}</h1></div><div className="dash-actions"><select className="dashboard-language" value={language} onChange={(event) => { setLanguage(event.target.value); window.localStorage.setItem('janani_language', event.target.value); }} aria-label="Language"><option value="en">English</option><option value="kn">ಕನ್ನಡ</option><option value="hi">हिन्दी</option></select><select className="dashboard-language" value={theme} onChange={(event) => { setTheme(event.target.value); window.localStorage.setItem('janani_theme', event.target.value); }} aria-label={copy.appearance}><option value="light">{copy.light}</option><option value="dark">{copy.dark}</option></select><button className="icon-button"><Bell size={19}/><i></i></button><div className="dash-user">{ownerName.slice(0, 2).toUpperCase()}</div></div></header><div className="dash-content">{view === 'dashboard' && <Overview go={go} copy={copy}/>} {view === 'login' && <Login go={go}/>} {view === 'profile' && <Profile copy={copy} user={user} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} onLogout={onLogout}/>} {view !== 'dashboard' && view !== 'login' && view !== 'profile' && <ModuleView view={view} go={go} copy={copy} language={language}/>}</div></div></div>;
}
function Profile({ copy, user, language, setLanguage, theme, setTheme, onLogout }) {
  const [mobile, setMobile] = useState(user.mobile || '');
  const [mobileError, setMobileError] = useState('');
  const [mobileSaved, setMobileSaved] = useState(false);
  const saveMobile = async (event) => {
    event.preventDefault(); setMobileError(''); setMobileSaved(false);
    try {
      const result = await saveProfileMobile(mobile);
      const updatedUser = { ...user, mobile: result.mobile };
      window.localStorage.setItem('janani_user', JSON.stringify(updatedUser));
      setMobile(result.mobile); setMobileSaved(true);
    } catch (error) { setMobileError(error.message); }
  };
  return <section className="profile-panel"><span className="section-kicker">{copy.account}</span><h2>{copy.profileTitle}</h2><div className="profile-details"><div><small>{copy.member}</small><strong>{user.name || 'JANANI member'}</strong></div><div><small>{copy.email}</small><strong>{user.email || 'Not added'}</strong></div></div><form className="profile-mobile-form" onSubmit={saveMobile}><label>{copy.mobile}<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="+91 98765 43210" autoComplete="tel" pattern="\\+?[0-9 ()-]{10,20}" required /></label>{mobileError && <p className="form-error" role="alert">{mobileError}</p>}{mobileSaved && <p className="tracker-success" role="status">Mobile number saved.</p>}<button className="primary-button" type="submit">Save mobile number</button></form><label>{copy.language}<select value={language} onChange={(event) => { setLanguage(event.target.value); window.localStorage.setItem('janani_language', event.target.value); }}><option value="en">English</option><option value="hi">Hindi</option><option value="kn">Kannada</option></select></label><label>{copy.appearance}<select value={theme} onChange={(event) => { setTheme(event.target.value); window.localStorage.setItem('janani_theme', event.target.value); }}><option value="light">{copy.light}</option><option value="dark">{copy.dark}</option></select></label><button className="primary-button" onClick={onLogout}><LogOut size={17}/>{copy.logout}</button></section>;
}
function SideLink({ icon: Icon, label, active, onClick }) { return <button className={`side-link ${active ? 'active' : ''}`} onClick={onClick}><Icon size={18}/><span>{label}</span>{label === 'Reminders' && <b>2</b>}</button>; }
function Overview({ go, copy }) { return <><section className="welcome-panel"><div><span className="panel-kicker">{copy.journey}</span><h2>{copy.remindersTitle}<br/><em>{copy.weeks}</em></h2><p>{copy.injections}</p><button className="primary-button" onClick={() => go('tracker')}>{copy.open} <ArrowRight size={17}/></button></div><div className="week-ring"><div><strong>9</strong><span>{copy.weeks}</span></div></div></section><div className="content-row"><div className="main-column"><div className="block-heading"><div><span className="section-kicker">{copy.remindersTitle}</span><h2>{copy.injections}</h2></div><button className="text-link" onClick={() => go('reminders')}>{copy.reminders} <ArrowRight size={15}/></button></div><div className="appointment-card"><div className="appointment-date"><strong>9</strong><span>MONTH</span></div><div className="appointment-info"><span className="tag mint-tag">{copy.reminders}</span><h3>{copy.injections}</h3><p><Stethoscope size={14}/> Antenatal check-up and vaccination reminder</p></div><ChevronRight size={18}/></div><div className="block-heading guidance-heading"><div><span className="section-kicker">{copy.wellness}</span><h2>{copy.postpartum}</h2></div><button className="text-link" onClick={() => go('wellness')}>{copy.wellness} <ArrowRight size={15}/></button></div><div className="guidance-card"><div className="guidance-art"><div className="tiny-sun"></div><div className="tiny-leaf"></div></div><div><span className="tag peach-tag">{copy.wellness}</span><h3>{copy.postpartum}</h3><p>Choose clean water, nourishing food, handwashing and clean surroundings after birth.</p></div></div></div><aside className="right-column"><div className="small-heading"><span className="section-kicker">{copy.emergencyTitle}</span><h2>{copy.findCenters}</h2></div><button className="quick-action" onClick={() => go('location')}><span className="qa-icon mint"><MapPin size={18}/></span><span><strong>{copy.location}</strong><small>{copy.locationHint}</small></span><ArrowRight size={16}/></button><button className="quick-action" onClick={() => go('emergency')}><span className="qa-icon rose"><Phone size={18}/></span><span><strong>{copy.emergency}</strong><small>{copy.emergencyText}</small></span><ArrowRight size={16}/></button></aside></div></>; }

function ModuleView({ view, go, copy, language }) {
  const [month, setMonth] = useState('');
  const [location, setLocation] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [cycleDate, setCycleDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [cycleNotes, setCycleNotes] = useState('');
  const [cycleLogs, setCycleLogs] = useState([]);
  const [cycleBusy, setCycleBusy] = useState(false);
  const [cycleError, setCycleError] = useState('');
  const [cycleSaved, setCycleSaved] = useState(false);
  const [postpartumMonth, setPostpartumMonth] = useState(1);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const listeningTimerRef = useRef(null);
  const speechLanguage = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
  useEffect(() => () => {
    shouldListenRef.current = false;
    window.clearTimeout(listeningTimerRef.current);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);
  const speakReply = (text) => {
    if (!window.speechSynthesis) {
      setVoiceError('Speaker playback is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLanguage;
    utterance.rate = 0.95;
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith(speechLanguage.slice(0, 2)));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };
  const toggleListening = () => {
    setVoiceError('');
    if (listening) {
      shouldListenRef.current = false;
      window.clearTimeout(listeningTimerRef.current);
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. Try Google Chrome or Microsoft Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = speechLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    shouldListenRef.current = true;
    let finalTranscript = '';
    recognition.onstart = () => {
      setListening(true);
      setVoiceError('');
    };
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalTranscript += `${result[0].transcript} `;
        else interimTranscript += result[0].transcript;
      }
      setChatInput(`${finalTranscript}${interimTranscript}`.trim().slice(0, 1000));
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false;
        setListening(false);
        setVoiceError('Allow microphone access to use voice input.');
      } else if (event.error !== 'no-speech') {
        setVoiceError('The microphone stopped listening. Please try again.');
      }
    };
    recognition.onend = () => {
      if (shouldListenRef.current) {
        window.setTimeout(() => {
          try {
            recognition.start();
          } catch {}
        }, 300);
      } else {
        setListening(false);
        recognitionRef.current = null;
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      listeningTimerRef.current = window.setTimeout(() => {
        shouldListenRef.current = false;
        recognition.stop();
        setListening(false);
        setVoiceError('Voice input stopped after 60 seconds. Press the microphone to start again.');
      }, 60_000);
    } catch {
      shouldListenRef.current = false;
      setVoiceError('Could not start the microphone. Check browser microphone permission.');
    }
  };
  const trackerLabels = language === 'hi' ? { intro: 'अपना वर्तमान गर्भावस्था महीना चुनें।', label: 'गर्भावस्था का वर्तमान महीना', select: 'महीना चुनें', month: 'महीना', save: 'महीना सहेजें' } : language === 'kn' ? { intro: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಗರ್ಭಾವಸ್ಥೆಯ ತಿಂಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.', label: 'ಪ್ರಸ್ತುತ ಗರ್ಭಾವಸ್ಥೆಯ ತಿಂಗಳು', select: 'ತಿಂಗಳು ಆಯ್ಕೆಮಾಡಿ', month: 'ತಿಂಗಳು', save: 'ತಿಂಗಳು ಉಳಿಸಿ' } : { intro: 'Choose your current pregnancy month.', label: 'Current pregnancy month', select: 'Select month', month: 'Month', save: 'Save month' };
  const saveMonth = async (event) => { event.preventDefault(); setError(''); setSaved(false); try { await savePregnancyMonth(month); setSaved(true); } catch (requestError) { setError(requestError.message); } };
  useEffect(() => {
    if (view !== 'periods') return;
    getCycleLogs().then((result) => setCycleLogs(result.cycles || [])).catch((requestError) => setCycleError(requestError.message));
  }, [view]);
  const saveCycle = async (event) => {
    event.preventDefault();
    setCycleBusy(true); setCycleError(''); setCycleSaved(false);
    try {
      const result = await saveCycleLog(cycleDate, cycleLength, cycleNotes);
      setCycleLogs((items) => [result.cycle, ...items].slice(0, 24));
      setCycleDate(''); setCycleNotes(''); setCycleSaved(true);
    } catch (requestError) {
      setCycleError(requestError.message);
    } finally {
      setCycleBusy(false);
    }
  };
  const periodEducationSource = [
    {
      title: 'How the menstrual cycle works',
      text: 'Day 1 is the first day of menstrual bleeding. During the follicular phase, an egg develops and the uterine lining begins to thicken. Ovulation is when an egg is released, often around the middle of a cycle, but timing varies. During the luteal phase, the body prepares for a possible pregnancy. If pregnancy does not occur, hormone levels fall and the next period begins.',
    },
    {
      title: 'What can be normal',
      text: 'Cycles can vary between people and from month to month. Many cycles are around 21–35 days in adults, and bleeding commonly lasts about 2–7 days. Cramps, breast tenderness, bloating, acne, tiredness, and mood changes can occur. A personal pattern is more useful than comparing your cycle with someone else’s.',
    },
    {
      title: 'What are PCOS and PCOD?',
      text: 'PCOS means polycystic ovary syndrome. It is a common hormonal and metabolic condition that can involve irregular ovulation, higher androgen levels, acne or excess facial/body hair, and difficulty with weight or blood sugar regulation. “PCOD” is a term used in some settings, but it is not a separate diagnosis in every medical guideline. Not everyone with PCOS has ovarian cysts, and an ultrasound alone cannot diagnose PCOS.',
    },
    {
      title: 'Possible PCOS-related signs',
      text: 'Signs may include widely spaced or missed periods, very irregular bleeding, acne, increased facial or body hair, scalp hair thinning, darkened skin folds, or challenges with fertility. These signs can also have other causes. A clinician may review your history, examine you, and order selected blood tests or an ultrasound; do not self-diagnose from one symptom.',
    },
    {
      title: 'Supportive everyday habits',
      text: 'Regular meals with varied foods, movement that feels safe and sustainable, enough sleep, stress support, and keeping health appointments can support wellbeing. There is no single “PCOS diet” or cure that works for everyone. Avoid unverified supplements or stopping prescribed treatment without speaking with a clinician.',
    },
    {
      title: 'When to get medical help',
      text: 'Speak with a qualified health worker for new or persistent irregular periods, bleeding between periods or after sex, severe pain, symptoms of anaemia, or concerns about fertility. Seek urgent care for very heavy bleeding with dizziness or fainting, severe sudden pain, pregnancy with bleeding or pain, or any symptoms that feel like an emergency.',
    },
  ];
  const postpartumByMonthSource = [
    { month: 1, food: 'Focus on warm, nourishing meals that are easy to digest. Include dal, eggs, beans, leafy vegetables, fruit, whole grains and safe fluids. Include iron-rich foods and follow any clinician advice after delivery.', hygiene: 'Wash hands before touching the baby or preparing food. Change sanitary pads regularly, keep stitches or a caesarean wound clean and dry, and follow discharge instructions. Rest and accept help.' },
    { month: 2, food: 'Continue varied meals with protein, iron, calcium and fibre. Add curd or other calcium-rich foods if suitable, and drink water regularly, especially while breastfeeding.', hygiene: 'Continue handwashing, clean clothes and clean bedding. Attend the postpartum check-up and ask about wound healing, bleeding, contraception and breastfeeding concerns.' },
    { month: 3, food: 'Build a regular meal routine with pulses, vegetables, fruit, grains, nuts or seeds and protein foods. Do not skip meals because of childcare or tiredness.', hygiene: 'Keep feeding areas clean and wash hands before feeds. Seek support for nipple pain, breast redness, fever or difficulty with attachment.' },
    { month: 4, food: 'Choose affordable local foods from different groups rather than relying on special products. Keep safe water nearby and continue iron-rich foods if advised.', hygiene: 'Maintain daily bathing or body cleaning, oral hygiene and clean sanitary practices. Gentle movement may be helpful when approved by a health worker.' },
    { month: 5, food: 'Include colourful vegetables and fruits, whole grains and protein at regular meals. Limit excessive sugary drinks and choose safe, clean food.', hygiene: 'Keep the baby’s sleeping and feeding area clean. Wash hands after toilet use, changing pads or cleaning the baby.' },
    { month: 6, food: 'Continue nourishing meals and fluids. Around six months, ask the baby’s health worker about starting appropriate complementary foods while continuing breastfeeding as advised.', hygiene: 'Keep hands, utensils and food-preparation surfaces clean when complementary feeding begins. Follow immunisation and growth-monitoring visits.' },
    { month: 7, food: 'Continue balanced meals and enough fluids. If breastfeeding, keep eating regularly; if you have diabetes, anaemia or another condition, follow your clinician’s advice.', hygiene: 'Clean feeding utensils safely and wash hands before preparing or giving food. Keep floors and small objects clean as the baby becomes more mobile.' },
    { month: 8, food: 'Offer yourself regular meals even on busy days. Simple choices such as dal, rice, vegetables, eggs, fruit, curd or local grains can support energy and recovery.', hygiene: 'Continue handwashing and safe food storage. Seek help if you have ongoing pain, urinary or bowel problems, heavy bleeding or persistent low mood.' },
    { month: 9, food: 'Maintain variety and hydration. Include protein and iron-rich foods, and discuss ongoing tiredness or dizziness with a health worker rather than self-medicating.', hygiene: 'Keep routine personal and household hygiene. Make time for dental care, sleep and a health review if recovery has not progressed as expected.' },
    { month: 10, food: 'Choose foods that support steady energy: pulses, vegetables, fruit, whole grains, nuts or seeds and suitable protein foods. Avoid unverified postpartum supplements.', hygiene: 'Continue clean hands before baby care and safe food handling. Ask for support if stress, anxiety or sadness is affecting daily life.' },
    { month: 11, food: 'Continue a normal varied diet that fits your culture, budget and health needs. Safe water and regular meals remain important for energy and breastfeeding if applicable.', hygiene: 'Keep the home, feeding items and personal items clean. Continue routine healthcare and family-planning conversations as needed.' },
    { month: 12, food: 'At one year, continue balanced family foods and regular fluids. Review any ongoing anaemia, weight, thyroid, menstrual or breastfeeding concerns with a qualified health worker.', hygiene: 'Maintain handwashing, safe food preparation and personal hygiene. Seek care for persistent symptoms rather than assuming they are part of postpartum recovery.' },
  ];
  const postpartumExtrasSource = [
    { nutrition: 'Iron and protein for recovery', sources: 'Dal, beans, eggs, leafy greens, sesame and iron-fortified foods', yoga: 'Breathing and ankle movements', exercise: 'Only gentle bed or chair movements if comfortable and cleared after delivery', book: 'The first weeks after birth: rest, support and recovery basics' },
    { nutrition: 'Protein, calcium and fluids', sources: 'Curd, milk if suitable, ragi, sesame, dal, eggs and safe water', yoga: 'Gentle neck and shoulder stretches', exercise: 'Short, easy walks; stop if pain, dizziness or bleeding increases', book: 'Understanding postpartum body changes and check-ups' },
    { nutrition: 'Fibre and steady energy', sources: 'Oats, whole grains, vegetables, fruit, pulses and nuts', yoga: 'Seated side stretch and relaxed breathing', exercise: 'Gradually increase comfortable walking; ask about pelvic-floor exercises', book: 'Breastfeeding, feeding support and caring for yourself' },
    { nutrition: 'Iron, folate and vitamin C', sources: 'Leafy greens with lemon, lentils, citrus fruit, guava and beans', yoga: 'Cat-cow only if comfortable and cleared', exercise: 'Low-impact walking and gentle mobility, without straining the abdomen', book: 'A practical guide to safe postpartum movement' },
    { nutrition: 'Balanced meals for energy', sources: 'Rice or chapati, dal, vegetables, fruit, eggs, fish or other suitable protein', yoga: 'Supported child’s pose and breathing', exercise: 'Comfortable walks and gentle stretching; build slowly', book: 'Sleep, stress and emotional wellbeing after birth' },
    { nutrition: 'Protein, calcium and baby-feeding support', sources: 'Pulses, eggs, curd, ragi, leafy vegetables and seasonal fruit', yoga: 'Gentle standing stretch near a wall', exercise: 'Ask a health worker before progressing to strengthening exercises', book: 'Starting complementary feeding safely around six months' },
    { nutrition: 'Fibre, fluids and micronutrients', sources: 'Vegetables, fruit, whole grains, beans, nuts and safe water', yoga: 'Supported bridge or pelvic-floor relaxation only if cleared', exercise: 'Moderate walking as tolerated; avoid pain and breath-holding', book: 'Building a sustainable family wellness routine' },
    { nutrition: 'Regular meals for busy days', sources: 'Simple dal, rice, vegetables, eggs, fruit, curd and local grains', yoga: 'Mindful breathing and standing side stretch', exercise: 'Break movement into short walks if childcare makes long walks difficult', book: 'Practical self-care for mothers and caregivers' },
    { nutrition: 'Iron and protein if tired or dizzy', sources: 'Beans, lentils, eggs, leafy greens, meat if eaten and fortified foods', yoga: 'Gentle relaxation; avoid inversions', exercise: 'Discuss ongoing fatigue or dizziness before increasing activity', book: 'When to seek help during postpartum recovery' },
    { nutrition: 'Variety and healthy fats', sources: 'Nuts, seeds, pulses, vegetables, fruit and suitable cooking oils', yoga: 'Gentle sun-breathing preparation without forceful poses', exercise: 'Gradual strengthening only after professional clearance', book: 'Mental health, support networks and recovery' },
    { nutrition: 'Steady energy and hydration', sources: 'Whole grains, vegetables, fruit, pulses, eggs and safe fluids', yoga: 'Gentle balance practice near support', exercise: 'Choose enjoyable low-impact movement and rest when needed', book: 'Returning to everyday activity safely' },
    { nutrition: 'Long-term balanced nutrition', sources: 'A varied family diet with protein, iron, calcium, fibre and fluids', yoga: 'A gentle personal routine based on comfort', exercise: 'Review any ongoing pain, leakage or weakness with a clinician before exercise', book: 'Continuing health checks and family wellbeing' },
  ];
  const pregnancyByMonth = [
    { month: 1, nutrition: 'Folate, protein and hydration', foods: 'Leafy greens, beans, lentils, citrus fruit, eggs and fortified grains', hygiene: 'Wash hands before food and meals, use safe drinking water, wash fruits and vegetables, and avoid alcohol, tobacco and unpasteurised or unsafe foods.' },
    { month: 2, nutrition: 'Folate, iron and vitamin B12', foods: 'Dal, beans, leafy greens, eggs, meat or fish if eaten, and iron-fortified foods', hygiene: 'Handle raw food separately, cook eggs and meat thoroughly, refrigerate food safely and ask a health worker about prenatal supplements.' },
    { month: 3, nutrition: 'Protein, iron, calcium and fluids', foods: 'Curd or pasteurised milk, ragi, sesame, pulses, eggs, vegetables and safe water', hygiene: 'Brush teeth twice daily, keep food preparation areas clean, and seek care for repeated vomiting or inability to keep fluids down.' },
    { month: 4, nutrition: 'Iron, protein and fibre', foods: 'Lentils, chickpeas, beans, leafy greens, whole grains, fruit and suitable protein foods', hygiene: 'Continue safe food storage and handwashing. Attend antenatal check-ups and follow vaccination advice from your health worker.' },
    { month: 5, nutrition: 'Calcium, protein and healthy energy', foods: 'Ragi, curd, pasteurised milk, sesame, beans, eggs, vegetables and fruit', hygiene: 'Drink safe water, wash hands after toilet use and before eating, and avoid self-medicating for heartburn, pain or infections.' },
    { month: 6, nutrition: 'Iron, protein, calcium and omega-3 sources', foods: 'Pulses, eggs, leafy greens, nuts, seeds, low-mercury fish if eaten and whole grains', hygiene: 'Keep appointments, practise dental hygiene and discuss swelling, headache, vision changes or reduced fetal movement promptly.' },
    { month: 7, nutrition: 'Protein, iron, fibre and fluids', foods: 'Dal, beans, eggs, vegetables, fruit, whole grains and safe fluids', hygiene: 'Rest safely, keep the home and toilet areas clean, and ask about warning signs such as bleeding, leaking fluid or regular painful contractions.' },
    { month: 8, nutrition: 'Protein, iron and nutrient-dense meals', foods: 'Pulses, eggs, leafy greens, fruit, vegetables, whole grains and suitable protein foods', hygiene: 'Prepare clean birth and baby-care items, continue handwashing and attend scheduled check-ups. Do not use unverified herbal products.' },
    { month: 9, nutrition: 'Balanced meals, iron, protein and hydration', foods: 'Continue varied local foods such as dal, vegetables, fruit, eggs, grains and safe fluids', hygiene: 'Keep important health-worker contacts ready, maintain clean hands and surroundings, and seek urgent care for heavy bleeding, severe pain, trouble breathing or reduced fetal movement.' },
  ];
  const pregnancyExtras = [
    { exercise: 'Gentle walking and relaxed breathing if you feel well', book: 'Ramayana for families: a short, child-friendly story edition' },
    { exercise: 'Short walks and gentle shoulder or ankle movements', book: 'Panchatantra: simple animal stories with life lessons' },
    { exercise: 'Comfortable walking and gentle stretching without strain', book: 'Jataka tales: kindness, courage and wise choices' },
    { exercise: 'Regular low-impact movement as tolerated', book: 'The Arabian Nights: selected gentle fairy tales' },
    { exercise: 'Walking, pelvic-floor awareness and rest breaks', book: 'Aesop’s Fables: short stories and reflections' },
    { exercise: 'Moderate walking and gentle mobility; avoid overheating', book: 'Stories from the Ramayana: courage, family and compassion' },
    { exercise: 'Short walks and gentle breathing; avoid activities with fall risk', book: 'Grimm’s Fairy Tales: choose a child-friendly, non-scary edition' },
    { exercise: 'Gentle walking and relaxation only as comfortable', book: 'Indian folk tales: stories from different regions and traditions' },
    { exercise: 'Slow walking and breathing; keep emergency contacts ready', book: 'A gentle collection of bedtime fairy tales for family reading' },
  ];
  const pregnancyDisplay = language === 'kn'
    ? pregnancyByMonth.map((item, index) => ({
      nutrition: ['ಫೋಲೇಟ್, ಕಬ್ಬಿಣ ಮತ್ತು ವಿಟಮಿನ್ B12', 'ಫೋಲೇಟ್, ಕಬ್ಬಿಣ ಮತ್ತು ವಿಟಮಿನ್ B12', 'ಪ್ರೋಟೀನ್, ಕಬ್ಬಿಣ, ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು ನೀರು', 'ಕಬ್ಬಿಣ, ಫೋಲೇಟ್ ಮತ್ತು ನಾರಿನಾಂಶ', 'ಕ್ಯಾಲ್ಸಿಯಂ, ಪ್ರೋಟೀನ್ ಮತ್ತು ಆರೋಗ್ಯಕರ ಶಕ್ತಿ', 'ಕಬ್ಬಿಣ, ಪ್ರೋಟೀನ್, ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು ಓಮೆಗಾ-3', 'ಪ್ರೋಟೀನ್, ಕಬ್ಬಿಣ, ನಾರಿನಾಂಶ ಮತ್ತು ನೀರು', 'ಪ್ರೋಟೀನ್ ಮತ್ತು ಪೋಷಕಾಂಶಗಳಿರುವ ಆಹಾರ', 'ಸಮತೋಲನ ಆಹಾರ, ಕಬ್ಬಿಣ, ಪ್ರೋಟೀನ್ ಮತ್ತು ನೀರು'][index],
      foods: ['ಬೇಳೆ, ಕಾಳುಗಳು, ಸೊಪ್ಪು, ಮೊಟ್ಟೆ, ಮಾಂಸ ಅಥವಾ ಮೀನು ಮತ್ತು ಕಬ್ಬಿಣ ಸೇರಿಸಿದ ಆಹಾರಗಳು', 'ಬೇಳೆ, ಕಾಳುಗಳು, ಸೊಪ್ಪು, ಮೊಟ್ಟೆ ಮತ್ತು ಕಬ್ಬಿಣ ಸೇರಿಸಿದ ಆಹಾರಗಳು', 'ಮೊಸರು, ಪಾಸ್ಚರೈಸ್ ಮಾಡಿದ ಹಾಲು, ರಾಗಿ, ಎಳ್ಳು, ಬೇಳೆ, ಮೊಟ್ಟೆ ಮತ್ತು ತರಕಾರಿಗಳು', 'ಸೊಪ್ಪು, ಬೇಳೆ, ಕಿತ್ತಳೆ, ಪೇರಳೆ, ಕಾಳುಗಳು ಮತ್ತು ಸಂಪೂರ್ಣ ಧಾನ್ಯಗಳು', 'ರಾಗಿ, ಮೊಸರು, ಪಾಸ್ಚರೈಸ್ ಮಾಡಿದ ಹಾಲು, ಎಳ್ಳು, ಬೇಳೆ, ಮೊಟ್ಟೆ ಮತ್ತು ಹಣ್ಣುಗಳು', 'ಬೇಳೆ, ಮೊಟ್ಟೆ, ಸೊಪ್ಪು, ಬೀಜಗಳು ಮತ್ತು ಕಡಿಮೆ ಪಾರದ ಮೀನು', 'ಬೇಳೆ, ಕಾಳುಗಳು, ಮೊಟ್ಟೆ, ತರಕಾರಿಗಳು, ಹಣ್ಣುಗಳು ಮತ್ತು ಸಂಪೂರ್ಣ ಧಾನ್ಯಗಳು', 'ಬೇಳೆ, ಮೊಟ್ಟೆ, ಸೊಪ್ಪು, ಹಣ್ಣುಗಳು, ತರಕಾರಿಗಳು ಮತ್ತು ಸಂಪೂರ್ಣ ಧಾನ್ಯಗಳು', 'ಬೇಳೆ, ತರಕಾರಿಗಳು, ಹಣ್ಣುಗಳು, ಮೊಟ್ಟೆ, ಧಾನ್ಯಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ದ್ರವಗಳು'][index],
      hygiene: 'ಹಸಿ ಆಹಾರವನ್ನು ಬೇರೆ ಇಡಿ, ಆಹಾರವನ್ನು ಚೆನ್ನಾಗಿ ಬೇಯಿಸಿ, ಸುರಕ್ಷಿತ ನೀರು ಬಳಸಿ ಮತ್ತು ಆಹಾರ ತಯಾರಿಸುವ ಮೊದಲು ಕೈ ತೊಳೆಯಿರಿ. ನಿಯಮಿತ ಗರ್ಭಪೂರ್ವ ತಪಾಸಣೆಗೆ ಹೋಗಿ.',
      exercise: ['ಸ್ವಲ್ಪ ನಡೆದು ಭುಜ ಮತ್ತು ಕಾಲುಗಳ ಸೌಮ್ಯ ಚಲನೆ ಮಾಡಿ.', 'ಸ್ವಲ್ಪ ನಡೆದು ಭುಜ ಮತ್ತು ಕಾಲುಗಳನ್ನು ನಿಧಾನವಾಗಿ ಚಲಿಸಿ.', 'ಆರಾಮವಾಗಿ ನಡೆದು, ಒತ್ತಡವಿಲ್ಲದೆ ಸೌಮ್ಯವಾಗಿ ಚಾಚಿಕೊಳ್ಳಿ.', 'ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯ ಸಲಹೆಯೊಂದಿಗೆ ಕಡಿಮೆ ಒತ್ತಡದ ಚಲನೆ ಮಾಡಿ.', 'ನಡೆದು ವಿಶ್ರಾಂತಿ ವಿರಾಮಗಳನ್ನು ಪಡೆಯಿರಿ.', 'ಮಿತವಾಗಿ ನಡೆದು ಸೌಮ್ಯ ಚಲನೆಯನ್ನು ಮಾಡಿ.', 'ಸ್ವಲ್ಪ ನಡೆದು ಉಸಿರಾಟ ಮಾಡಿ; ಬೀಳುವ ಅಪಾಯದ ಚಟುವಟಿಕೆ ತಪ್ಪಿಸಿ.', 'ಆರಾಮವಾಗಿದ್ದರೆ ಸೌಮ್ಯವಾಗಿ ನಡೆದು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.', 'ನಿಧಾನವಾಗಿ ನಡೆದು ಉಸಿರಾಟದ ವ್ಯಾಯಾಮ ಮಾಡಿ.'][index],
      book: ['ಮಕ್ಕಳಿಗಾಗಿ ರಾಮಾಯಣದ ಸರಳ ಕಥೆಗಳ ಆವೃತ್ತಿ', 'ಪಂಚತಂತ್ರದ ಸರಳ ಪ್ರಾಣಿಗಳ ಕಥೆಗಳು', 'ಜಾತಕ ಕಥೆಗಳು: ದಯೆ ಮತ್ತು ಜಾಣ್ಮೆಯ ಕಥೆಗಳು', 'ಅರೇಬಿಯನ್ ನೈಟ್ಸ್‌ನ ಆಯ್ದ ಸೌಮ್ಯ ಕಥೆಗಳು', 'ಈಸಪ್ ಕಥೆಗಳು: ಚಿಕ್ಕ ಕಥೆಗಳು ಮತ್ತು ಜೀವನ ಪಾಠಗಳು', 'ರಾಮಾಯಣದ ಕಥೆಗಳು: ಧೈರ್ಯ, ಕುಟುಂಬ ಮತ್ತು ಕರುಣೆ', 'ಮಕ್ಕಳಿಗೆ ಸೂಕ್ತವಾದ ಗ್ರಿಮ್ ಕಥೆಗಳ ಸೌಮ್ಯ ಆವೃತ್ತಿ', 'ಭಾರತದ ವಿವಿಧ ಪ್ರದೇಶಗಳ ಜನಪದ ಕಥೆಗಳು', 'ಮಲಗುವ ಮುನ್ನ ಓದಲು ಸೌಮ್ಯ ಪರಿಕಥೆಗಳ ಸಂಕಲನ'][index],
    }))
    : language === 'hi'
      ? pregnancyByMonth.map((item, index) => ({
        nutrition: ['फोलेट, आयरन और विटामिन B12', 'फोलेट, आयरन और विटामिन B12', 'प्रोटीन, आयरन, कैल्शियम और पानी', 'आयरन, फोलेट और फाइबर', 'कैल्शियम, प्रोटीन और स्वस्थ ऊर्जा', 'आयरन, प्रोटीन, कैल्शियम और ओमेगा-3', 'प्रोटीन, आयरन, फाइबर और पानी', 'प्रोटीन और पोषक भोजन', 'संतुलित भोजन, आयरन, प्रोटीन और पानी'][index],
        foods: ['दाल, फलियाँ, हरी सब्ज़ियाँ, अंडे, मांस या मछली और आयरन से भरपूर खाद्य पदार्थ', 'दाल, फलियाँ, हरी सब्ज़ियाँ, अंडे और आयरन से भरपूर खाद्य पदार्थ', 'दही, पाश्चराइज़्ड दूध, रागी, तिल, दाल, अंडे और सब्ज़ियाँ', 'हरी सब्ज़ियाँ, दाल, संतरा, अमरूद, फलियाँ और साबुत अनाज', 'रागी, दही, पाश्चराइज़्ड दूध, तिल, दाल, अंडे और फल', 'दाल, अंडे, हरी सब्ज़ियाँ, मेवे, बीज और कम पारे वाली मछली', 'दाल, फलियाँ, अंडे, सब्ज़ियाँ, फल और साबुत अनाज', 'दाल, अंडे, हरी सब्ज़ियाँ, फल, सब्ज़ियाँ और साबुत अनाज', 'दाल, सब्ज़ियाँ, फल, अंडे, अनाज और सुरक्षित पेय'][index],
        hygiene: 'कच्चे भोजन को अलग रखें, भोजन अच्छी तरह पकाएँ, सुरक्षित पानी इस्तेमाल करें और भोजन बनाने से पहले हाथ धोएँ। नियमित प्रसवपूर्व जाँच कराएँ।',
        exercise: ['हल्का चलें और कंधों व टखनों की कोमल गतिविधियाँ करें।', 'थोड़ा चलें और कंधों व टखनों को धीरे-धीरे चलाएँ।', 'आराम से चलें और बिना ज़ोर लगाए हल्का स्ट्रेच करें।', 'स्वास्थ्यकर्मी की सलाह से हल्की गतिविधि करें।', 'चलें और आराम के लिए छोटे विराम लें।', 'सीमित रूप से चलें और हल्की गतिविधि करें।', 'थोड़ा चलें और साँसों पर ध्यान दें; गिरने वाले व्यायाम से बचें।', 'आराम होने पर हल्का चलें और विश्राम करें।', 'धीरे चलें और साँसों के व्यायाम करें।'][index],
        book: ['बच्चों के लिए रामायण की सरल कहानी-पुस्तक', 'पंचतंत्र की सरल पशु-कथाएँ', 'जातक कथाएँ: दया और समझदारी की कहानियाँ', 'अरेबियन नाइट्स की चुनिंदा सौम्य परीकथाएँ', 'ईसप की कथाएँ: छोटी कहानियाँ और सीख', 'रामायण की कहानियाँ: साहस, परिवार और करुणा', 'बच्चों के लिए ग्रिम की सौम्य परीकथाएँ', 'भारत के अलग-अलग क्षेत्रों की लोककथाएँ', 'सोने से पहले पढ़ने के लिए सौम्य परीकथाओं का संग्रह'][index],
      }))
      : pregnancyByMonth;
  const pregnancyExtraDisplay = language === 'kn'
    ? { exercise: 'ವ್ಯಾಯಾಮ ಮತ್ತು ಯೋಗ ಪೋಸ್ಟರ್', reading: 'ಓದಲು ಶಿಫಾರಸು', stop: 'ನೋವು, ರಕ್ತಸ್ರಾವ, ತಲೆಸುತ್ತು, ಎದೆನೋವು, ನೀರು ಸೋರಿಕೆ, ಸಂಕೋಚನ ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದ್ದರೆ ನಿಲ್ಲಿಸಿ. ತೊಂದರೆಗಳಿದ್ದರೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯ ಸಲಹೆ ಪಡೆಯಿರಿ.', select: 'ಗರ್ಭಾವಸ್ಥೆಯ ತಿಂಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ', intro: 'ತಿಂಗಳು 1 ಗರ್ಭಾವಸ್ಥೆಯ ಮೊದಲ ತಿಂಗಳು ಮತ್ತು ತಿಂಗಳು 9 ಕೊನೆಯ ತಿಂಗಳು. ಇದು ಸಾಮಾನ್ಯ ಮಾಹಿತಿ; ನಿಮ್ಮ ಗರ್ಭಪೂರ್ವ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯ ಸಲಹೆಯನ್ನು ಅನುಸರಿಸಿ.', urgent: 'ಅತಿಯಾದ ರಕ್ತಸ್ರಾವ, ತೀವ್ರ ನೋವು, ಉಸಿರಾಟದ ತೊಂದರೆ, ತೀವ್ರ ತಲೆನೋವು ಅಥವಾ ದೃಷ್ಟಿ ಬದಲಾವಣೆ, ಅಥವಾ ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾದರೆ ತಕ್ಷಣ ಸಹಾಯ ಪಡೆಯಿರಿ.', guidance: 'ಆಹಾರ, ಸ್ವಚ್ಛತೆ ಮತ್ತು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ', nutrition: 'ಪೋಷಣೆಯ ಗಮನ ಮತ್ತು ಆಹಾರದ ಮೂಲಗಳು', hygiene: 'ಆಹಾರ ಸುರಕ್ಷತೆ ಮತ್ತು ಸ್ವಚ್ಛತೆ', foodSources: 'ಆಹಾರದ ಮೂಲಗಳು', month: 'ತಿಂಗಳು', monthHeading: 'ಗರ್ಭಾವಸ್ಥೆಯ ತಿಂಗಳು', choose: 'ಮೇಲಿನ ತಿಂಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ', chooseText: 'ಆ ಹಂತದ ಪೋಷಣೆ, ಸ್ವಚ್ಛತೆ, ವ್ಯಾಯಾಮ ಮತ್ತು ಓದುವ ಮಾರ್ಗದರ್ಶನವನ್ನು ನೋಡಬಹುದು.', safety: 'ಪ್ರಮುಖ ಸುರಕ್ಷತಾ ಸೂಚನೆ', safetyText: 'ವೈದ್ಯಕೀಯ ಸಲಹೆಯಿಲ್ಲದೆ ಔಷಧಿ, ಪೂರಕಗಳು ಅಥವಾ ಗಿಡಮೂಲಿಕೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.' }
    : language === 'hi'
      ? { exercise: 'व्यायाम और योग पोस्टर', reading: 'पढ़ने की सलाह', stop: 'दर्द, रक्तस्राव, चक्कर, सीने में दर्द, पानी आने, संकुचन या सांस फूलने पर रुकें। जटिलता हो तो स्वास्थ्यकर्मी की सलाह लें।', select: 'गर्भावस्था का महीना चुनें', intro: 'महीना 1 गर्भावस्था का पहला महीना और महीना 9 आखिरी महीना है। यह सामान्य जानकारी है; अपने प्रसवपूर्व स्वास्थ्यकर्मी की सलाह मानें।', urgent: 'बहुत अधिक रक्तस्राव, तेज दर्द, सांस लेने में परेशानी, तेज सिरदर्द या दृष्टि में बदलाव, या बच्चे की हलचल कम होने पर तुरंत मदद लें।', guidance: 'भोजन, स्वच्छता और स्वास्थ्य मार्गदर्शन', nutrition: 'पोषण और खाद्य स्रोत', hygiene: 'भोजन सुरक्षा और स्वच्छता', foodSources: 'खाद्य स्रोत', month: 'महीना', monthHeading: 'गर्भावस्था का महीना', choose: 'ऊपर एक महीना चुनें', chooseText: 'उस चरण के पोषण, स्वच्छता, व्यायाम और पढ़ने की जानकारी दिखाई जाएगी।', safety: 'महत्वपूर्ण सुरक्षा सूचना', safetyText: 'चिकित्सकीय सलाह के बिना दवा, सप्लीमेंट या जड़ी-बूटी न लें।' }
      : { exercise: 'Exercise and yoga poster', reading: 'Recommended reading', stop: 'Stop for pain, bleeding, dizziness, chest pain, leaking fluid, contractions or breathlessness. Ask your health worker before starting if you have complications.', select: 'Select pregnancy month', intro: 'Month 1 is the first month of pregnancy and Month 9 is the final month. This is general education; follow your antenatal health worker’s advice.', urgent: 'Seek urgent help for heavy bleeding, severe pain, trouble breathing, severe headache or vision changes, or reduced fetal movement.', guidance: 'Food, hygiene and wellbeing guidance', nutrition: 'Nutrition focus and food sources', hygiene: 'Food safety and hygiene', foodSources: 'Food sources', month: 'Month', monthHeading: 'Pregnancy month', choose: 'Choose a month above', chooseText: 'You will see nutrition, hygiene, exercise and reading guidance for that stage of pregnancy.', safety: 'Important safety note', safetyText: 'Do not take medicines, supplements or herbal products without professional advice.' };
  const pregnancyYogaByLanguage = language === 'kn'
    ? [
      'ಆರಾಮವಾಗಿದ್ದರೆ ಗೋಡೆಯ ಬೆಂಬಲದೊಂದಿಗೆ ನಿಧಾನವಾಗಿ ನಡೆದು, ಕುಳಿತು ಉಸಿರಾಟ ಮಾಡಿ.',
      'ಕುರ್ಚಿಯಲ್ಲಿ ಕುಳಿತು ಭುಜ ಮತ್ತು ಕುತ್ತಿಗೆಯನ್ನು ಸೌಮ್ಯವಾಗಿ ಚಲಿಸಿ.',
      'ಬೆಂಬಲದೊಂದಿಗೆ ಸೌಮ್ಯ ಬದಿಗೆ ಚಾಚಿಕೊಳ್ಳಿ; ಉಸಿರನ್ನು ಹಿಡಿಯಬೇಡಿ.',
      'ಗೋಡೆಯ ಹತ್ತಿರ ನಿಂತು ಕಾಲು ಮತ್ತು ಬೆನ್ನು ಸೌಮ್ಯವಾಗಿ ಚಲಿಸಿ.',
      'ಕುಳಿತು ನಿಧಾನವಾಗಿ ಉಸಿರಾಟ ಮಾಡಿ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.',
      'ಆರಾಮವಾಗಿದ್ದರೆ ಬೆಂಬಲದೊಂದಿಗೆ ಸೌಮ್ಯವಾಗಿ ನಡೆದು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.',
      'ಕುರ್ಚಿ ಅಥವಾ ಗೋಡೆಯ ಬೆಂಬಲದೊಂದಿಗೆ ಸೌಮ್ಯ ಚಲನೆಯನ್ನು ಮಾಡಿ.',
      'ಕುಳಿತು ಉಸಿರಾಟ ಮತ್ತು ಸೌಮ್ಯ ವಿಶ್ರಾಂತಿ ಅಭ್ಯಾಸ ಮಾಡಿ.',
      'ಆರಾಮದಾಯಕ ಭಂಗಿಯಲ್ಲಿ ನಿಧಾನವಾದ ಉಸಿರಾಟ ಮಾಡಿ; ಬೀಳುವ ಅಪಾಯದ ಭಂಗಿಗಳನ್ನು ತಪ್ಪಿಸಿ.',
    ]
    : language === 'hi'
      ? [
        'आराम हो तो दीवार के सहारे धीरे चलें और बैठकर साँस पर ध्यान दें।',
        'कुर्सी पर बैठकर कंधों और गर्दन की हल्की गतिविधि करें।',
        'सहारे के साथ हल्का साइड स्ट्रेच करें; साँस न रोकें।',
        'दीवार के पास खड़े होकर पैरों और पीठ की हल्की गतिविधि करें।',
        'बैठकर धीमी साँस लें और शरीर को आराम दें।',
        'आराम हो तो सहारे के साथ धीरे चलें और बीच में विश्राम करें।',
        'कुर्सी या दीवार के सहारे हल्की गतिविधि करें।',
        'बैठकर साँस लेने और आराम करने का हल्का अभ्यास करें।',
        'आरामदायक स्थिति में धीमी साँस लें; गिरने वाली मुद्राओं से बचें।',
      ]
      : [
        'If comfortable, walk slowly with wall support and practise seated breathing.',
        'Sit on a chair and gently move your shoulders and neck.',
        'Try a supported side stretch without holding your breath.',
        'Stand near a wall for gentle leg and back movements.',
        'Practise slow seated breathing and allow your body to rest.',
        'If comfortable, take a supported walk with rest breaks.',
        'Use a chair or wall for gentle, steady movement.',
        'Practise seated breathing and a short relaxation pause.',
        'Breathe slowly in a comfortable position; avoid fall-risk poses.',
      ];
  const pregnancyReadingByLanguage = language === 'kn'
    ? [
      ['Our Three — Yang Jiang', 'ಶಾಂತ ಮತ್ತು ಆತ್ಮೀಯ ಬರವಣಿಗೆಯ ಕಾದಂಬರಿ.'],
      ['Little Women — Louisa May Alcott', 'ಕುಟುಂಬ, ಸ್ನೇಹ ಮತ್ತು ಧೈರ್ಯದ ಕಥೆ.'],
      ['The Little Prince — Antoine de Saint-Exupéry', 'ಸರಳ ಭಾಷೆಯಲ್ಲಿರುವ ಮೃದುವಾದ ರೂಪಕ ಕಥೆ.'],
      ['The Kite Runner — Khaled Hosseini', 'ಭಾವನಾತ್ಮಕ ವಿಷಯಗಳಿರುವ ಕಾದಂಬರಿ; ಮನಸ್ಸಿಗೆ ಭಾರವಾಗಬಹುದು.'],
      ['The Miracles of the Namiya General Store — Keigo Higashino', 'ಭರವಸೆ ಮತ್ತು ಮಾನವೀಯತೆಯ ಕಥೆ.'],
      ['The Storied Life of A.J. Fikry — Gabrielle Zevin', 'ಪುಸ್ತಕಗಳು, ಸಂಬಂಧಗಳು ಮತ್ತು ಹೊಸ ಆರಂಭಗಳ ಕಥೆ.'],
      ['This Is Water — E.B. White', 'ಸುಂದರ ಭಾಷೆಯ ಚಿಕ್ಕ ಮತ್ತು ಚಿಂತನಾತ್ಮಕ ಬರಹ.'],
      ['Nightingale and the Rose — Oscar Wilde', 'ಸುಂದರ ಭಾಷೆಯ ಪರಿಕಥೆ; ಭಾವನಾತ್ಮಕ ಅಂತ್ಯವಿದೆ.'],
      ['The Little Prince — Antoine de Saint-Exupéry', 'ಕುಟುಂಬದೊಂದಿಗೆ ನಿಧಾನವಾಗಿ ಓದಬಹುದಾದ ಸೌಮ್ಯ ಕಥೆ.'],
    ]
    : language === 'hi'
      ? [
        ['Our Three — Yang Jiang', 'शांत और आत्मीय लेखन वाला उपन्यास।'],
        ['Little Women — Louisa May Alcott', 'परिवार, दोस्ती और साहस की कहानी।'],
        ['The Little Prince — Antoine de Saint-Exupéry', 'सरल भाषा में लिखी कोमल रूपक-कथा।'],
        ['The Kite Runner — Khaled Hosseini', 'भावनात्मक विषयों वाला उपन्यास; मन भारी लग सकता है।'],
        ['The Miracles of the Namiya General Store — Keigo Higashino', 'उम्मीद और इंसानियत की कहानी।'],
        ['The Storied Life of A.J. Fikry — Gabrielle Zevin', 'किताबों, रिश्तों और नई शुरुआत की कहानी।'],
        ['This Is Water — E.B. White', 'सुंदर भाषा में लिखा छोटा, विचारपूर्ण लेख।'],
        ['Nightingale and the Rose — Oscar Wilde', 'सुंदर भाषा वाली परीकथा; अंत भावनात्मक है।'],
        ['The Little Prince — Antoine de Saint-Exupéry', 'परिवार के साथ धीरे-धीरे पढ़ी जा सकने वाली कोमल कहानी।'],
      ]
      : [
        ['Our Three — Yang Jiang', 'A calm, warm novel shared by many pregnant mothers.'],
        ['Little Women — Louisa May Alcott', 'A story about family, friendship and courage.'],
        ['The Little Prince — Antoine de Saint-Exupéry', 'A gentle, beautifully written fable.'],
        ['The Kite Runner — Khaled Hosseini', 'An emotional novel; pause if the themes feel heavy.'],
        ['The Miracles of the Namiya General Store — Keigo Higashino', 'A hopeful story about kindness and human connection.'],
        ['The Storied Life of A.J. Fikry — Gabrielle Zevin', 'A story about books, relationships and new beginnings.'],
        ['This Is Water — E.B. White', 'A short, thoughtful piece with beautiful language.'],
        ['Nightingale and the Rose — Oscar Wilde', 'A fairy tale with beautiful language and an emotional ending.'],
        ['The Little Prince — Antoine de Saint-Exupéry', 'A gentle story to read slowly with family.'],
      ];
  const pregnancyReadingNote = language === 'kn'
    ? 'ಓದು ಮನಸ್ಸಿಗೆ ಆರಾಮಕ್ಕಾಗಿ ಮಾತ್ರ. ಇದು ವೈದ್ಯಕೀಯ ಸಲಹೆಯಲ್ಲ; ನಿಮಗೆ ಇಷ್ಟವಾದ ಪುಸ್ತಕವನ್ನು ಮಾತ್ರ ಓದಿ ಮತ್ತು ಮನಸ್ಸಿಗೆ ಭಾರವಾದರೆ ನಿಲ್ಲಿಸಿ.'
    : language === 'hi'
      ? 'पढ़ना केवल मन की शांति के लिए है। यह चिकित्सकीय सलाह नहीं है; अपनी पसंद की किताब पढ़ें और मन भारी लगे तो रुक जाएँ।'
      : 'Reading is for comfort and enjoyment only. It is not medical advice; choose what feels right and stop if a book feels emotionally heavy.';
  const pregnancyPosterAlt = language === 'kn' ? 'ಸೌಮ್ಯ ಗರ್ಭಾವಸ್ಥೆಯ ಯೋಗ ಮತ್ತು ಉಸಿರಾಟದ ಪೋಸ್ಟರ್' : language === 'hi' ? 'हल्के गर्भावस्था योग और साँस का पोस्टर' : 'Gentle pregnancy yoga and breathing poster';
  const wellnessLabels = language === 'kn'
    ? { intro: 'ಹೆರಿಗೆಯ ನಂತರದ ತಿಂಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಹೆರಿಗೆ ದಿನದಿಂದ ತಿಂಗಳುಗಳನ್ನು ಎಣಿಸಿ.', disclaimer: 'ಇದು ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿ ಮಾತ್ರ; ನಿಮ್ಮ ವೈದ್ಯರು ಅಥವಾ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯ ಸಲಹೆಗೆ ಇದು ಪರ್ಯಾಯವಲ್ಲ.', month: 'ತಿಂಗಳು', heading: 'ಆಹಾರ, ಸ್ವಚ್ಛತೆ ಮತ್ತು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ', food: 'ಆಹಾರ ಮತ್ತು ಪಾನೀಯಗಳು', hygiene: 'ಸ್ವಚ್ಛತೆ ಮತ್ತು ದೈನಂದಿನ ಆರೈಕೆ', nutrition: 'ಪೋಷಣೆಯ ಗಮನ ಮತ್ತು ಆಹಾರದ ಮೂಲಗಳು', sources: 'ಆಹಾರದ ಮೂಲಗಳು', exercise: 'ಚಲನೆ ಮತ್ತು ಯೋಗ ಪೋಸ್ಟರ್', reading: 'ಓದಲು ಶಿಫಾರಸು', warning: 'ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಬೇಕಾದ ಸೂಚನೆಗಳು', warningText: 'ಒಂದು ಗಂಟೆಯಲ್ಲಿ ಒಂದು ಪ್ಯಾಡ್ ಸಂಪೂರ್ಣ ನೆನೆಸುವಷ್ಟು ರಕ್ತಸ್ರಾವ, ದುರ್ವಾಸನೆಯ ಲೋಚಿಯಾ, ಏಕಾಏಕಿ ಹೆಚ್ಚಾಗುವ ರಕ್ತಸ್ರಾವ ಅಥವಾ ದೊಡ್ಡ ರಕ್ತದ ಗಡ್ಡೆಗಳು, ಹೊಟ್ಟೆ ಮುಟ್ಟಿದಾಗ ನೋವು, ತಲೆಸುತ್ತು, ಹೃದಯ ಬಡಿತ ಹೆಚ್ಚಾಗುವುದು, ಜ್ವರ ಅಥವಾ ನಡುಕ ಇದ್ದರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ. ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಭಾರತದಲ್ಲಿ 112ಕ್ಕೆ ಕರೆ ಮಾಡಿ.' }
    : language === 'hi'
      ? { intro: 'प्रसव के बाद का महीना चुनें। महीनों की गिनती प्रसव के दिन से करें।', disclaimer: 'यह केवल सामान्य स्वास्थ्य जानकारी है; यह आपके डॉक्टर या स्वास्थ्यकर्मी की सलाह का विकल्प नहीं है।', month: 'महीना', heading: 'भोजन, स्वच्छता और स्वास्थ्य मार्गदर्शन', food: 'भोजन और पेय', hygiene: 'स्वच्छता और दैनिक देखभाल', nutrition: 'पोषण और खाद्य स्रोत', sources: 'खाद्य स्रोत', exercise: 'गतिविधि और योग पोस्टर', reading: 'पढ़ने की सलाह', warning: 'तुरंत चिकित्सा सहायता लेने के संकेत', warningText: 'एक घंटे में एक पैड पूरी तरह भीग जाना, दुर्गंध वाला लोशिया, अचानक बढ़ता रक्तस्राव या बड़े रक्त के थक्के, पेट छूने पर दर्द, चक्कर, तेज़ धड़कन, बुखार या ठंड लगना हो तो तुरंत डॉक्टर से संपर्क करें। आपातकाल में भारत में 112 पर कॉल करें।' }
      : { intro: 'Choose a postpartum month. Count months from the day of childbirth.', disclaimer: 'This is general health information only; it does not replace advice from your doctor or qualified health worker.', month: 'Month', heading: 'Food, hygiene and wellbeing guidance', food: 'Food and drinks', hygiene: 'Hygiene and daily care', nutrition: 'Nutrition focus and food sources', sources: 'Food sources', exercise: 'Movement and yoga poster', reading: 'Recommended reading', warning: 'Warning signs: seek medical help promptly', warningText: 'Contact a doctor promptly if you soak a pad within one hour, have foul-smelling lochia, a sudden increase in bleeding or large clots, abdominal tenderness, dizziness, palpitations, fever or chills. Call 112 in India for an emergency.' };
  const localizedPeriodEducation = language === 'kn'
    ? [{ title: 'ಮಾಸಿಕ ಚಕ್ರ ಹೇಗೆ ನಡೆಯುತ್ತದೆ', text: 'ಮಾಸಿಕದ ಮೊದಲ ದಿನವೇ ದಿನ 1. ಅಂಡಾಣು ಬೆಳೆಯುತ್ತದೆ, ಅಂಡೋತ್ಸರ್ಗವಾಗುತ್ತದೆ ಮತ್ತು ಗರ್ಭಾಶಯದ ಒಳಪದರ ಬದಲಾಗುತ್ತದೆ. ಪ್ರತಿಯೊಬ್ಬರ ಚಕ್ರದ ಸಮಯ ಬೇರೆ ಇರಬಹುದು.' }, { title: 'ಸಾಮಾನ್ಯವಾಗಿ ಕಾಣಬಹುದಾದ ಬದಲಾವಣೆಗಳು', text: 'ಚಕ್ರದ ಉದ್ದ ಮತ್ತು ರಕ್ತಸ್ರಾವದ ದಿನಗಳು ವ್ಯಕ್ತಿಯಿಂದ ವ್ಯಕ್ತಿಗೆ ಬದಲಾಗುತ್ತವೆ. ನೋವು, ಉಬ್ಬರ, ಮೊಡವೆ ಮತ್ತು ಮನಸ್ಥಿತಿ ಬದಲಾವಣೆಗಳು ಇರಬಹುದು.' }, { title: 'PCOS ಮತ್ತು PCOD ಎಂದರೇನು?', text: 'PCOS ಒಂದು ಹಾರ್ಮೋನ್ ಮತ್ತು ಮೆಟಾಬಾಲಿಕ್ ಸ್ಥಿತಿ. PCOD ಎಂಬ ಪದವನ್ನು ಕೆಲವು ಕಡೆ ಬಳಸುತ್ತಾರೆ. ಲಕ್ಷಣಗಳು ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಮಾತ್ರದಿಂದ ಸ್ವಯಂ ನಿರ್ಣಯ ಮಾಡಬೇಡಿ.' }, { title: 'PCOS ನ ಸಾಧ್ಯ ಲಕ್ಷಣಗಳು', text: 'ಅನಿಯಮಿತ ಮಾಸಿಕ, ಮೊಡವೆ, ಹೆಚ್ಚಿದ ಕೂದಲು ಅಥವಾ ತಲೆಯ ಕೂದಲು ತೆಳುವಾಗುವುದು ಕಾಣಬಹುದು. ಇತರ ಕಾರಣಗಳೂ ಇರಬಹುದು; ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.' }, { title: 'ದೈನಂದಿನ ಬೆಂಬಲ', text: 'ಸಮತೋಲನ ಆಹಾರ, ಸುರಕ್ಷಿತ ಚಲನೆ, ನಿದ್ರೆ, ಒತ್ತಡ ನಿರ್ವಹಣೆ ಮತ್ತು ನಿಯಮಿತ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಸಹಾಯಕವಾಗಬಹುದು. ಪರಿಶೀಲಿಸದ ಪೂರಕಗಳನ್ನು ತಪ್ಪಿಸಿ.' }, { title: 'ಯಾವಾಗ ಸಹಾಯ ಪಡೆಯಬೇಕು', text: 'ತೀವ್ರ ನೋವು, ಅತಿಯಾದ ರಕ್ತಸ್ರಾವ, ಮಾಸಿಕಗಳ ನಡುವೆ ರಕ್ತಸ್ರಾವ ಅಥವಾ ನಿರಂತರ ಅಸಮರ್ಪಕ ಚಕ್ರವಿದ್ದರೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.' }]
    : language === 'hi'
      ? [{ title: 'मासिक चक्र कैसे काम करता है', text: 'मासिक रक्तस्राव का पहला दिन दिन 1 होता है। अंडाणु विकसित होता है, ओव्यूलेशन होता है और गर्भाशय की परत बदलती है। हर व्यक्ति का चक्र अलग हो सकता है।' }, { title: 'क्या सामान्य हो सकता है', text: 'चक्र और रक्तस्राव के दिन व्यक्ति-व्यक्ति में अलग होते हैं। ऐंठन, सूजन, मुंहासे और मूड में बदलाव हो सकते हैं।' }, { title: 'PCOS और PCOD क्या हैं?', text: 'PCOS हार्मोन और मेटाबॉलिज्म से जुड़ी स्थिति है। PCOD शब्द कुछ जगहों पर इस्तेमाल होता है। लक्षण या अल्ट्रासाउंड से खुद निदान न करें।' }, { title: 'PCOS के संभावित संकेत', text: 'अनियमित मासिक, मुंहासे, अधिक बाल या सिर के बाल पतले होना हो सकता है। अन्य कारण भी हो सकते हैं; स्वास्थ्यकर्मी से मिलें।' }, { title: 'दैनिक सहायता', text: 'संतुलित भोजन, सुरक्षित गतिविधि, नींद, तनाव प्रबंधन और नियमित स्वास्थ्य जाँच मदद कर सकती है। बिना सलाह के सप्लीमेंट न लें।' }, { title: 'कब मदद लें', text: 'तेज़ दर्द, बहुत अधिक रक्तस्राव, मासिक के बीच रक्तस्राव या लगातार अनियमित चक्र में स्वास्थ्यकर्मी से बात करें।' }]
      : periodEducationSource;
  const periodEducation = localizedPeriodEducation;
  const menstrualCare = [
    { title: 'Painful periods (dysmenorrhea)', text: 'Period pain is common. It may be caused by natural uterine contractions; new, severe or worsening pain can also be linked with endometriosis, fibroids or adenomyosis and should be assessed.' },
    { title: 'Heavy menstrual bleeding', text: 'Very heavy bleeding can cause iron-deficiency anaemia and tiredness. Hormone changes, fibroids and bleeding disorders are possible causes.' },
    { title: 'Irregular periods', text: 'Adult cycles are often about 24–38 days, but patterns vary. PCOS, stress, weight changes and thyroid problems can affect timing.' },
    { title: 'Absent periods (amenorrhea)', text: 'Several missed periods can happen with pregnancy, breastfeeding, PCOS, stress, eating difficulties, weight changes or very intense exercise. A health worker can help find the cause.' },
    { title: 'PMS and PMDD', text: 'Bloating, headache and mood changes may happen before a period. Severe symptoms that disrupt daily life may be PMDD and deserve medical support.' },
    { title: 'Menstrual product care', text: 'Change pads every few hours. Change tampons every 4–8 hours and never wear one for more than 8 hours. Clean menstrual cups daily and boil them for 1–2 minutes after each cycle. Wash hands before and after changing products.' },
    { title: 'Gentle hygiene', text: 'Wash the vulva (external area) daily with clean water. The vagina cleans itself; avoid scented products, harsh chemicals and internal washing. Wipe front to back and choose breathable cotton underwear.' },
    { title: 'When to seek care', text: 'See a doctor for unusual odour, severe or unusual pain, a major increase in bleeding, prolonged periods, dizziness or symptoms of anaemia. Track your cycle to share a clear history.' },
  ];
  const reproductiveCare = [
    { title: 'PCOS', text: 'PCOS can involve irregular periods, acne, excess hair, hair thinning, weight changes and difficulty with ovulation. Causes are complex and can include genetic and environmental factors; symptoms alone cannot confirm it.' },
    { title: 'Uterine fibroids', text: 'Fibroids are non-cancerous growths in the uterine wall. They may cause heavy or painful periods, pressure, frequent urination or lower-back pain, but some people have no symptoms.' },
    { title: 'Endometriosis', text: 'Endometriosis can cause period pain, bleeding between periods, digestive symptoms and fertility difficulties. Persistent or severe pain deserves a clinical assessment.' },
    { title: 'Infertility', text: 'A clinician may assess infertility after 12 months of regular unprotected sex, or after 6 months when the woman is over 35. Age, smoking, alcohol, weight changes and physical or emotional stress can affect fertility.' },
    { title: 'Preconception care', text: 'Before pregnancy, review conditions such as diabetes, blood pressure, infections and mental health. Ask about folic acid and iron, medicines, vaccinations, genetic counselling and thalassemia screening.' },
    { title: 'Reproductive safety', text: 'Do not use abortion medicines without medical supervision. Discuss contraception, STI/HIV testing and pregnancy planning with a qualified health worker. Correcting myths early can prevent delayed care.' },
  ];
  const reproductiveCareGuide = [
    { title: 'Care for your whole reproductive health', text: 'Reproductive care can include birth control and pregnancy planning, testing and treatment for sexually transmitted infections (STIs), care during and after pregnancy, help with fertility, safe abortion care, and support after sexual violence. You can ask a qualified health worker about any of these.' },
    { title: 'Condoms help lower both risks', text: 'Use a new condom every time, from start to finish, for vaginal, anal or oral sex. Condoms lower the chance of pregnancy and many STIs, including HIV, when used correctly. They do not remove all risk, especially for infections that can spread through uncovered skin, such as herpes, HPV or syphilis. Use water- or silicone-based lubricant with latex condoms; oils can damage them. Never use an external and internal condom together.' },
    { title: 'Other birth control choices', text: 'Pills, injections, implants and IUDs can help prevent pregnancy, but they do not protect against STIs. The best option depends on your health and needs. A health worker can explain benefits, possible side effects, how long each method lasts and how to get it. Cycle tracking and withdrawal are less reliable for preventing pregnancy.' },
    { title: 'Testing, vaccines and talking together', text: 'Some STIs have no signs, so testing may be useful even when you feel well. Talk with your partner about testing and condom use. HPV and hepatitis B vaccines help prevent some infections. You can ask a clinic which tests and vaccines are recommended for you.' },
    { title: 'If a condom breaks or slips', text: 'Stop and replace it with a new one. If pregnancy is possible, ask a pharmacist or health worker about emergency contraception as soon as you can; available options have different time limits. If you may have been exposed to an STI, contact a clinic promptly to ask about testing and next steps. Do not take medicines or use abortion pills without qualified medical advice.' },
  ];
  const populationRates = [
    { label: 'Central African Republic', birth: 44.7, death: null },
    { label: 'Chad', birth: 42.2, death: null },
    { label: 'Somalia', birth: 41.2, death: null },
    { label: 'Niger', birth: 40.2, death: null },
    { label: 'DR Congo', birth: 39.8, death: null },
    { label: 'Monaco', birth: null, death: 20.1 },
    { label: 'Bulgaria', birth: null, death: 15.6 },
    { label: 'Serbia', birth: null, death: 14.9 },
    { label: 'Latvia', birth: null, death: 13.8 },
    { label: 'Japan', birth: null, death: 13.3 },
  ];
  const selectedPostpartumText = language === 'kn'
    ? {
      food: 'ಹೆರಿಗೆಯ ನಂತರ ದೇಹವು ರಕ್ತ ನಷ್ಟ ಮತ್ತು ಹೆರಿಗೆಯ ಶ್ರಮದಿಂದ ಚೇತರಿಸಿಕೊಳ್ಳಬೇಕು. ಹಾಲುಣಿಸುವಾಗ ಪೋಷಕಾಂಶಗಳ ಅಗತ್ಯವೂ ಹೆಚ್ಚುತ್ತದೆ. ದಿನಕ್ಕೆ 3–6 ಬಾರಿ ಸ್ವಲ್ಪಸ್ವಲ್ಪವಾಗಿ, ಸುಲಭವಾಗಿ ಜೀರ್ಣವಾಗುವ ಆಹಾರ ಸೇವಿಸಿ. ಕಬ್ಬಿಣಕ್ಕಾಗಿ ಮಾಂಸ, ಮೊಟ್ಟೆಯ ಹಳದಿ ಭಾಗ, ಸೊಪ್ಪು, ಬೇಳೆ, ತೋಫು ಮತ್ತು ಒಣಹಣ್ಣುಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ; ಕಿತ್ತಳೆ ಅಥವಾ ಪೇರಳೆಯಂತಹ ವಿಟಮಿನ್ C ಆಹಾರದೊಂದಿಗೆ ಸೇವಿಸಿದರೆ ಕಬ್ಬಿಣ ಹೀರಿಕೊಳ್ಳಲು ಸಹಾಯವಾಗುತ್ತದೆ. ಕ್ಯಾಲ್ಸಿಯಂಗೆ ಹಾಲು, ಮೊಸರು, ಪನೀರ್, ರಾಗಿ, ಬಾದಾಮಿ, ತೋಫು ಮತ್ತು ಸಣ್ಣ ಮೀನುಗಳನ್ನು ಆರಿಸಿ. ಪ್ರೋಟೀನ್‌ಗೆ ಮೊಟ್ಟೆ, ಬೇಳೆ, ಮಾಂಸ, ಮೀನು, ಹಾಲಿನ ಪದಾರ್ಥಗಳು ಮತ್ತು ಸೋಯಾ ಸೇರಿಸಿ. DHA/ಒಮೆಗಾ-3ಗೆ ಕಡಿಮೆ ಪಾರದ ಮೀನು, ಸಾರ್ಡಿನ್ ಅಥವಾ DHA ಸೇರಿಸಿದ ಮೊಟ್ಟೆಗಳನ್ನು ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯ ಸಲಹೆಯಂತೆ ಸೇವಿಸಿ. ಐಯೋಡಿನ್ ಉಪ್ಪು, ಮೊಟ್ಟೆ, ಹಾಲು ಮತ್ತು ಸಮುದ್ರ ಆಹಾರ; ವಿಟಮಿನ್ Cಗೆ ಮೆಣಸಿನಕಾಯಿ, ಕಿತ್ತಳೆ, ಕಿವಿ ಮತ್ತು ಬ್ರೊಕೊಲಿ; ಕೋಲಿನ್‌ಗೆ ಮೊಟ್ಟೆ, ಬೇಳೆ ಮತ್ತು ಬ್ರೊಕೊಲಿ ಸಹಾಯಕ. ನೀರು, ಹಾಲು, ಸೂಪ್ ಮತ್ತು ಸಕ್ಕರೆ ಸೇರಿಸದ ಪಾನೀಯಗಳಿಂದ ಸಾಕಷ್ಟು ದ್ರವ ಸೇವಿಸಿ. ಚಹಾ ಅಥವಾ ಕಾಫಿಯನ್ನು ಕಬ್ಬಿಣ ಇರುವ ಊಟದ ಜೊತೆ ಕುಡಿಯಬೇಡಿ. ನಿಮ್ಮ ವೈದ್ಯರು ನೀಡಿದ ಕಬ್ಬಿಣ ಅಥವಾ ಇತರ ಪೂರಕಗಳನ್ನು ಮಾತ್ರ ತೆಗೆದುಕೊಳ್ಳಿ.',
      hygiene: 'ಹೆರಿಗೆಯ ನಂತರದ ಸ್ರಾವ (ಲೋಚಿಯಾ) ಸಾಮಾನ್ಯವಾಗಿ 4–6 ವಾರಗಳವರೆಗೆ ಇರಬಹುದು. ಶೌಚಾಲಯದ ನಂತರ ಬೆಚ್ಚಗಿನ ನೀರಿನಿಂದ ಹೊರಗಿನ ಜನನಾಂಗದ ಭಾಗವನ್ನು ತೊಳೆಯಿರಿ, ಮುಂದೆಿನಿಂದ ಹಿಂದೆಕ್ಕೆ ಒರೆಸಿ ಮತ್ತು ನಿಧಾನವಾಗಿ ಒಣಗಿಸಿ. ಪ್ಯಾಡ್ ಅನ್ನು ಕನಿಷ್ಠ 3–4 ಗಂಟೆಗೆ ಒಮ್ಮೆ ಬದಲಿಸಿ; ಟ್ಯಾಂಪಾನ್ ಬಳಸಬೇಡಿ. ಊತ ಅಥವಾ ನೋವಿದ್ದರೆ ತುಂಬಾ ಬಿಸಿ ಅಲ್ಲದ ಬೆಚ್ಚಗಿನ ನೀರಿನಲ್ಲಿ ಸುಮಾರು 10 ನಿಮಿಷ ಕುಳಿತುಕೊಳ್ಳಬಹುದು. ಸಿಸೇರಿಯನ್ ಗಾಯವನ್ನು ಸ್ವಚ್ಛವಾಗಿಟ್ಟು, ಸ್ನಾನ ಮಾಡಿದ ನಂತರ ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ; ಗಾಯವನ್ನು ಒರೆಸುವ ಬಟ್ಟೆ ತೊಡಬೇಡಿ. ದುರ್ವಾಸನೆ, ಅಸಹಜ ಸ್ರಾವ, ಹೆಚ್ಚುತ್ತಿರುವ ನೋವು, ಜ್ವರ ಅಥವಾ ನಡುಕ ಕಂಡರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ. ಶೌಚಾಲಯದ ನಂತರ, ಪ್ಯಾಡ್ ಬದಲಿಸಿದ ನಂತರ ಮತ್ತು ಮಗುವಿನ ಡೈಪರ್ ಬದಲಿಸಿದ ನಂತರ ಸಾಬೂನಿನಿಂದ ಕೈ ತೊಳೆಯಿರಿ.',
      nutrition: 'ಕಬ್ಬಿಣ, ಕ್ಯಾಲ್ಸಿಯಂ, ಪ್ರೋಟೀನ್, DHA, ಐಯೋಡಿನ್, ವಿಟಮಿನ್ C, ಕೋಲಿನ್ ಮತ್ತು ದ್ರವಗಳು ಮುಖ್ಯ. ಹಾಲುಣಿಸುವ ತಾಯಂದಿರಿಗೆ ಗರ್ಭಧಾರಣೆಗೆ ಮುಂಚಿನ ಆಹಾರಕ್ಕಿಂತ ದಿನಕ್ಕೆ ಸುಮಾರು 500 ಹೆಚ್ಚುವರಿ ಕ್ಯಾಲೊರಿಗಳು ಬೇಕಾಗಬಹುದು; ನಿಮ್ಮ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯ ಸಲಹೆ ಪಡೆಯಿರಿ.',
      exercise: 'ವೈದ್ಯರು ಅನುಮತಿಸಿದ ನಂತರ ಮಾತ್ರ ನಿಧಾನವಾದ ನಡೆ ಮತ್ತು ಸೌಮ್ಯ ಉಸಿರಾಟ ಮಾಡಿ. ನೋವು, ತಲೆಸುತ್ತು, ಹೆಚ್ಚು ರಕ್ತಸ್ರಾವ ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದ್ದರೆ ನಿಲ್ಲಿಸಿ.',
      book: 'ಮಕ್ಕಳಿಗಾಗಿ ರಾಮಾಯಣ, ಪಂಚತಂತ್ರ, ಜಾತಕ ಕಥೆಗಳು ಅಥವಾ ಸೌಮ್ಯ ಜನಪದ ಕಥೆಗಳ ಆವೃತ್ತಿಯನ್ನು ಓದಿ.',
    }
    : language === 'hi'
      ? {
        food: 'प्रसव के बाद शरीर को रक्त की कमी और प्रसव की थकान से उबरना होता है। स्तनपान के दौरान पोषक तत्वों की जरूरत भी बढ़ती है। दिन में 3–6 बार थोड़ा-थोड़ा, आसानी से पचने वाला भोजन लें। आयरन के लिए मांस, अंडे की जर्दी, हरी सब्ज़ियाँ, दाल, टोफू और सूखे फल लें; संतरा या अमरूद जैसे विटामिन C वाले भोजन के साथ लेने से आयरन का अवशोषण बेहतर होता है। कैल्शियम के लिए दूध, दही, पनीर, रागी, बादाम, टोफू और छोटी मछली चुनें। प्रोटीन के लिए अंडे, दाल, मांस, मछली, दूध से बने पदार्थ और सोया लें। DHA/ओमेगा-3 के लिए कम पारे वाली मछली, सार्डिन या DHA युक्त अंडे स्वास्थ्यकर्मी की सलाह के अनुसार लें। आयोडीन युक्त नमक, अंडे, दूध और समुद्री भोजन; विटामिन C के लिए शिमला मिर्च, संतरा, कीवी और ब्रोकोली; और कोलीन के लिए अंडे, दाल और ब्रोकोली उपयोगी हैं। पानी, दूध, सूप और बिना चीनी वाले पेय से पर्याप्त तरल लें। आयरन वाले भोजन के साथ चाय या कॉफी न लें। केवल डॉक्टर या स्वास्थ्यकर्मी द्वारा बताए गए आयरन और अन्य सप्लीमेंट लें।',
        hygiene: 'प्रसव के बाद का रक्तस्राव (लोशिया) लगभग 4–6 सप्ताह तक रह सकता है। शौचालय के बाद गुनगुने पानी से बाहरी जननांग क्षेत्र धोएँ, आगे से पीछे की ओर पोंछें और धीरे से सुखाएँ। पैड हर 3–4 घंटे में बदलें; टैम्पॉन का उपयोग न करें। सूजन या दर्द हो तो बहुत गर्म नहीं, गुनगुने पानी में लगभग 10 मिनट बैठ सकते हैं। सीज़ेरियन के घाव को साफ रखें और नहाने के बाद अच्छी तरह सुखाएँ; घाव पर रगड़ने वाले कपड़े न पहनें। दुर्गंध, असामान्य स्राव, बढ़ता दर्द, बुखार या ठंड लगने पर तुरंत डॉक्टर से संपर्क करें। शौचालय के बाद, पैड बदलने के बाद और बच्चे का डायपर बदलने के बाद साबुन से हाथ धोएँ।',
        nutrition: 'आयरन, कैल्शियम, प्रोटीन, DHA, आयोडीन, विटामिन C, कोलीन और तरल पदार्थ महत्वपूर्ण हैं। स्तनपान कराने वाली माँ को गर्भावस्था से पहले के भोजन की तुलना में रोज़ लगभग 500 अतिरिक्त कैलोरी की जरूरत हो सकती है; अपने स्वास्थ्यकर्मी से सलाह लें।',
        exercise: 'डॉक्टर की अनुमति के बाद ही धीरे चलें और हल्की साँस का अभ्यास करें। दर्द, चक्कर, अधिक रक्तस्राव या सांस फूलने पर रुकें।',
        book: 'बच्चों के लिए रामायण, पंचतंत्र, जातक कथाएँ या सौम्य लोककथाओं का संस्करण पढ़ें।',
      }
      : {
        food: 'After childbirth, the body needs to recover from blood loss and the physical work of delivery. Breastfeeding also increases the need for nutrients. Eat small, easy-to-digest meals 3–6 times a day. For iron, choose lean meat, egg yolks, leafy greens, beans, tofu and dried fruit; pair iron-rich foods with vitamin C foods such as oranges or guava. For calcium, choose milk, yogurt, cheese, ragi, almonds, tofu and small fish eaten with bones. For protein, include eggs, pulses, meat, fish, dairy and soy. For DHA/omega-3, choose low-mercury fish, sardines or DHA-fortified eggs according to local health advice. Iodized salt, eggs, dairy and seafood provide iodine; peppers, oranges, kiwi and broccoli provide vitamin C; eggs, beans and lentils provide choline. Drink water, milk, soup and unsweetened drinks regularly. Avoid tea or coffee with iron-rich meals. Take iron or other supplements only if advised by your clinician.',
        hygiene: 'Postpartum bleeding (lochia) may last about 4–6 weeks. After using the toilet, rinse the outer genital area with warm water, wipe from front to back and gently pat dry. Change pads at least every 3–4 hours and do not use tampons. If there is swelling or pain, a sitz bath in comfortably warm, not hot, water for about 10 minutes may help. Keep a C-section incision clean and dry it carefully after bathing; avoid clothing that rubs the wound. Contact a doctor or midwife promptly for foul smell, unusual discharge, increasing pain, fever or chills. Wash hands with soap after using the toilet, changing a pad and changing the baby’s diaper.',
        nutrition: 'Iron, calcium, protein, DHA, iodine, vitamin C, choline and fluids are important after birth. Breastfeeding mothers may need about 500 extra calories daily compared with pre-pregnancy intake; ask a health worker about your individual needs.',
        exercise: 'Only after a clinician says it is safe, try gentle walking and relaxed breathing. Stop for pain, dizziness, heavy bleeding or breathlessness.',
        book: 'Read a child-friendly Ramayana, Panchatantra, Jataka tales or gentle folk-tale collection.',
      };
  const postpartumMonthTranslations = language === 'kn'
    ? {
      food: ['ಕಬ್ಬಿಣ, ಪ್ರೋಟೀನ್, ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು ಸಾಕಷ್ಟು ದ್ರವಗಳಿರುವ ಮೃದುವಾದ ಆಹಾರ ಸೇವಿಸಿ. ವಿಟಮಿನ್ C ಇರುವ ಕಿತ್ತಳೆ ಅಥವಾ ಪೇರಳೆಯೊಂದಿಗೆ ಕಬ್ಬಿಣದ ಆಹಾರ ಸೇವಿಸಿ.', 'ಹಾಲುಣಿಸುವಾಗ ಮೊಟ್ಟೆ, ಬೇಳೆ, ಸೊಪ್ಪು, ರಾಗಿ, ಮೊಸರು ಮತ್ತು ಸುರಕ್ಷಿತ ನೀರನ್ನು ನಿಯಮಿತವಾಗಿ ತೆಗೆದುಕೊಳ್ಳಿ.', 'ಸಣ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ 3–6 ಬಾರಿ ಊಟ ಮಾಡಿ; ಹಣ್ಣು, ತರಕಾರಿ, ಧಾನ್ಯ, ಬೀಜ ಮತ್ತು ಪ್ರೋಟೀನ್ ಸೇರಿಸಿ.', 'ಸ್ಥಳೀಯವಾಗಿ ಲಭ್ಯವಿರುವ ಅಗ್ಗದ ಆಹಾರಗಳನ್ನು ಆರಿಸಿ. ಚಹಾ ಅಥವಾ ಕಾಫಿಯನ್ನು ಕಬ್ಬಿಣದ ಊಟದ ಜೊತೆ ಕುಡಿಯಬೇಡಿ.', 'ಪ್ರೋಟೀನ್, ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು ಕಬ್ಬಿಣಕ್ಕಾಗಿ ಮೊಟ್ಟೆ, ಬೇಳೆ, ಸೊಪ್ಪು, ಹಾಲಿನ ಪದಾರ್ಥ ಮತ್ತು ರಾಗಿ ಸೇರಿಸಿ.', 'ಪೋಷಕ ಆಹಾರ ಮತ್ತು ದ್ರವ ಮುಂದುವರಿಸಿ. ಮಗುವಿನ ಪೂರಕ ಆಹಾರ ಆರಂಭಿಸುವ ಬಗ್ಗೆ ಮಗುವಿನ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯನ್ನು ಕೇಳಿ.', 'ನಿಯಮಿತ ಊಟ ಮತ್ತು ದ್ರವ ಸೇವಿಸಿ. ಮಧುಮೇಹ ಅಥವಾ ರಕ್ತಹೀನತೆ ಇದ್ದರೆ ವೈದ್ಯರ ಸಲಹೆ ಅನುಸರಿಸಿ.', 'ದಣಿದ ದಿನಗಳಲ್ಲೂ ಬೇಳೆ, ಅನ್ನ, ತರಕಾರಿ, ಮೊಟ್ಟೆ, ಹಣ್ಣು ಅಥವಾ ಮೊಸರಿನಂತಹ ಸರಳ ಆಹಾರ ಸೇವಿಸಿ.', 'ದಣಿವು ಅಥವಾ ತಲೆಸುತ್ತು ಇದ್ದರೆ ಕಬ್ಬಿಣ ಮತ್ತು ಪ್ರೋಟೀನ್ ಆಹಾರ ಹೆಚ್ಚಿಸಿ; ಸ್ವಯಂ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.', 'ಬೀಜ, ಬೇಳೆ, ತರಕಾರಿ, ಹಣ್ಣು ಮತ್ತು ಆರೋಗ್ಯಕರ ಕೊಬ್ಬುಗಳನ್ನು ಸೇರಿಸಿ. ಪರಿಶೀಲಿಸದ ಪೂರಕಗಳನ್ನು ತಪ್ಪಿಸಿ.', 'ನಿಯಮಿತ ಊಟ, ಸುರಕ್ಷಿತ ನೀರು ಮತ್ತು ವೈವಿಧ್ಯಮಯ ಕುಟುಂಬದ ಆಹಾರ ಮುಂದುವರಿಸಿ.', 'ಒಂದು ವರ್ಷದ ನಂತರವೂ ಸಮತೋಲನ ಆಹಾರ ಮುಂದುವರಿಸಿ; ರಕ್ತಹೀನತೆ ಅಥವಾ ಹಾಲುಣಿಸುವ ಸಮಸ್ಯೆ ಇದ್ದರೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'],
      hygiene: ['ಸ್ರಾವ 4–6 ವಾರ ಇರಬಹುದು. ಮುಂದೆಿನಿಂದ ಹಿಂದೆಕ್ಕೆ ತೊಳೆಯಿರಿ, ಪ್ಯಾಡ್ 3–4 ಗಂಟೆಗೆ ಬದಲಿಸಿ, ಗಾಯವನ್ನು ಸ್ವಚ್ಛವಾಗಿ ಒಣಗಿಸಿ ಮತ್ತು ಕೈ ತೊಳೆಯಿರಿ.', 'ಕೈ ತೊಳೆಯುವುದು, ಸ್ವಚ್ಛ ಬಟ್ಟೆ ಮತ್ತು ಸ್ವಚ್ಛ ಹಾಸಿಗೆ ಮುಂದುವರಿಸಿ. ಗಾಯ, ರಕ್ತಸ್ರಾವ ಮತ್ತು ಹಾಲುಣಿಸುವ ತಪಾಸಣೆಗೆ ಹೋಗಿ.', 'ಮಗುವಿಗೆ ಹಾಲುಣಿಸುವ ಮೊದಲು ಕೈ ತೊಳೆಯಿರಿ. ಮೊಲೆ ನೋವು, ಕೆಂಪಾಗುವುದು ಅಥವಾ ಜ್ವರ ಇದ್ದರೆ ಸಹಾಯ ಪಡೆಯಿರಿ.', 'ಸ್ನಾನ, ಬಾಯಿ ಸ್ವಚ್ಛತೆ ಮತ್ತು ಪ್ಯಾಡ್ ಬದಲಿಸುವ ಅಭ್ಯಾಸ ಮುಂದುವರಿಸಿ. ಗಾಯವನ್ನು ಒರೆಸುವ ಬಟ್ಟೆ ತಪ್ಪಿಸಿ.', 'ಮಗುವಿನ ಮಲಗುವ ಮತ್ತು ಹಾಲುಣಿಸುವ ಸ್ಥಳವನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ. ಶೌಚಾಲಯದ ನಂತರ ಕೈ ತೊಳೆಯಿರಿ.', 'ಪೂರಕ ಆಹಾರ ಆರಂಭಿಸಿದಾಗ ಕೈ, ಪಾತ್ರೆ ಮತ್ತು ಆಹಾರ ತಯಾರಿಸುವ ಸ್ಥಳವನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ.', 'ಆಹಾರ ಪಾತ್ರೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ತೊಳೆಯಿರಿ. ಮಗು ಚಲಿಸಲು ಆರಂಭಿಸಿದಾಗ ನೆಲ ಮತ್ತು ಸಣ್ಣ ವಸ್ತುಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ.', 'ಕೈ ತೊಳೆಯುವುದು ಮತ್ತು ಸುರಕ್ಷಿತ ಆಹಾರ ಸಂಗ್ರಹ ಮುಂದುವರಿಸಿ. ನೋವು, ಹೆಚ್ಚು ರಕ್ತಸ್ರಾವ ಅಥವಾ ಮನಸ್ಸು ಕುಗ್ಗಿದ್ದರೆ ಸಹಾಯ ಪಡೆಯಿರಿ.', 'ವೈಯಕ್ತಿಕ ಮತ್ತು ಮನೆಯ ಸ್ವಚ್ಛತೆ ಮುಂದುವರಿಸಿ; ಹಲ್ಲು, ನಿದ್ರೆ ಮತ್ತು ಆರೋಗ್ಯ ತಪಾಸಣೆಗೆ ಗಮನ ಕೊಡಿ.', 'ಮಗುವಿನ ಆರೈಕೆಗೆ ಮೊದಲು ಕೈ ತೊಳೆಯಿರಿ. ಒತ್ತಡ, ಆತಂಕ ಅಥವಾ ದುಃಖ ದೈನಂದಿನ ಜೀವನಕ್ಕೆ ತೊಂದರೆ ನೀಡಿದರೆ ಸಹಾಯ ಪಡೆಯಿರಿ.', 'ಮನೆ, ಹಾಲುಣಿಸುವ ಪಾತ್ರೆಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ ವಸ್ತುಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ. ಕುಟುಂಬ ಯೋಜನೆ ಕುರಿತು ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯೊಂದಿಗೆ ಮಾತನಾಡಿ.', 'ಕೈ ತೊಳೆಯುವುದು, ಸುರಕ್ಷಿತ ಆಹಾರ ತಯಾರಿ ಮತ್ತು ವೈಯಕ್ತಿಕ ಸ್ವಚ್ಛತೆ ಮುಂದುವರಿಸಿ. ನಿರಂತರ ಲಕ್ಷಣಗಳನ್ನು ನಿರ್ಲಕ್ಷಿಸಬೇಡಿ.'],
    }
    : language === 'hi'
      ? {
        food: ['आयरन, प्रोटीन, कैल्शियम और पर्याप्त तरल वाला नरम भोजन लें। संतरा या अमरूद जैसे विटामिन C वाले भोजन के साथ आयरन लें।', 'स्तनपान के दौरान अंडे, दाल, हरी सब्ज़ियाँ, रागी, दही और सुरक्षित पानी नियमित लें।', 'दिन में 3–6 बार थोड़ा-थोड़ा खाएँ; फल, सब्ज़ी, अनाज, बीज और प्रोटीन शामिल करें।', 'स्थानीय और किफायती भोजन चुनें। आयरन वाले भोजन के साथ चाय या कॉफी न लें।', 'प्रोटीन, कैल्शियम और आयरन के लिए अंडे, दाल, हरी सब्ज़ियाँ, दूध से बने पदार्थ और रागी लें।', 'पौष्टिक भोजन और तरल जारी रखें। बच्चे का पूरक आहार शुरू करने के बारे में स्वास्थ्यकर्मी से पूछें।', 'नियमित भोजन और तरल लें। मधुमेह या एनीमिया हो तो डॉक्टर की सलाह मानें।', 'व्यस्त दिनों में भी दाल, चावल, सब्ज़ी, अंडे, फल या दही जैसे सरल भोजन लें।', 'थकान या चक्कर हों तो आयरन और प्रोटीन वाले भोजन लें; खुद से दवा न लें।', 'बीज, दाल, सब्ज़ियाँ, फल और स्वस्थ वसा शामिल करें। बिना सलाह के सप्लीमेंट न लें।', 'नियमित भोजन, सुरक्षित पानी और विविध घरेलू भोजन जारी रखें।', 'एक साल बाद भी संतुलित भोजन लें; एनीमिया या स्तनपान की चिंता हो तो स्वास्थ्यकर्मी से मिलें।'],
        hygiene: ['लोशिया 4–6 सप्ताह रह सकता है। आगे से पीछे की ओर धोएँ, पैड 3–4 घंटे में बदलें, घाव साफ-सूखा रखें और हाथ धोएँ।', 'हाथ धोना, साफ कपड़े और साफ बिस्तर जारी रखें। घाव, रक्तस्राव और स्तनपान की जाँच कराएँ।', 'बच्चे को दूध पिलाने से पहले हाथ धोएँ। निप्पल में दर्द, लालिमा या बुखार हो तो मदद लें।', 'नहाना, मुँह की सफाई और पैड बदलने की आदत जारी रखें। घाव पर रगड़ने वाले कपड़े न पहनें।', 'बच्चे के सोने और दूध पिलाने की जगह साफ रखें। शौचालय के बाद हाथ धोएँ।', 'पूरक आहार शुरू होने पर हाथ, बर्तन और भोजन बनाने की जगह साफ रखें।', 'खाने के बर्तनों को सुरक्षित तरीके से धोएँ। बच्चा चलने लगे तो फर्श और छोटी चीज़ें साफ रखें।', 'हाथ धोना और सुरक्षित भोजन रखना जारी रखें। दर्द, अधिक रक्तस्राव या मन उदास रहने पर मदद लें।', 'व्यक्तिगत और घर की सफाई जारी रखें; दाँत, नींद और स्वास्थ्य जाँच पर ध्यान दें।', 'बच्चे की देखभाल से पहले हाथ धोएँ। तनाव, चिंता या उदासी रोज़मर्रा के जीवन को प्रभावित करे तो मदद लें।', 'घर, दूध पिलाने के बर्तन और निजी सामान साफ रखें। परिवार नियोजन पर स्वास्थ्यकर्मी से बात करें।', 'हाथ धोना, सुरक्षित भोजन बनाना और व्यक्तिगत स्वच्छता जारी रखें। लगातार लक्षणों को नज़रअंदाज़ न करें।'],
      }
      : {
        food: [selectedPostpartumText.food, ...postpartumByMonthSource.slice(1).map((item) => item.food)],
        hygiene: [selectedPostpartumText.hygiene, ...postpartumByMonthSource.slice(1).map((item) => item.hygiene)],
      };
  const postpartumByMonth = postpartumByMonthSource.map((item, index) => ({
    ...item,
    food: postpartumMonthTranslations.food[index],
    hygiene: postpartumMonthTranslations.hygiene[index],
  }));
  const postpartumExtras = postpartumExtrasSource.map((item) => ({ ...item, nutrition: selectedPostpartumText.nutrition, sources: '', exercise: '', book: selectedPostpartumText.book }));
  const sendChat = async (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatBusy) return;
    setChatMessages((items) => [...items, { from: 'you', text: message }]);
    setChatInput(''); setChatBusy(true);
    try {
      const history = chatMessages.slice(-10).map((item) => ({ role: item.from === 'you' ? 'user' : 'model', text: item.text }));
      const response = await apiRequest('/chat', { method: 'POST', body: JSON.stringify({ message, language, history }) });
      setChatMessages((items) => [...items, { from: 'janani', text: response.reply }]);
    } catch (chatError) {
      setChatMessages((items) => [...items, { from: 'janani', text: chatError.message }]);
    } finally { setChatBusy(false); }
  };
  const findLocation = () => navigator.geolocation?.getCurrentPosition((position) => setLocation(position.coords), () => setLocation({ latitude: 13.1007, longitude: 77.5963 }));
  const content = {
    tracker: <><h2>{copy.tracker}</h2><p>{trackerLabels.intro}</p><form className="pregnancy-month-form" onSubmit={saveMonth}><label>{trackerLabels.label}<select value={month} onChange={(event) => setMonth(event.target.value)} required><option value="">{trackerLabels.select}</option>{Array.from({ length: 9 }, (_, index) => <option key={index + 1} value={index + 1}>{trackerLabels.month} {index + 1}</option>)}</select></label>{error && <p className="form-error" role="alert">{error}</p>}{saved && <p className="tracker-success" role="status">{copy.saved}</p>}<button className="primary-button" type="submit">{saved ? copy.saved : trackerLabels.save} <ArrowRight size={17}/></button></form></>,
    appointments: <><h2>{copy.appointments}</h2><p>{copy.injections}</p><div className="care-list"><div><Bell size={18}/><strong>Month 9 vaccination reminder</strong><small>Keep your antenatal check-up and injection dates here.</small></div><div><CalendarDays size={18}/><strong>Next check-up</strong><small>Add the date shared by your health worker.</small></div></div></>,
    reminders: <><h2>{copy.remindersTitle}</h2><p>{copy.injections}</p><div className="care-list"><div><Stethoscope size={18}/><strong>Vaccination and check-up</strong><small>JANANI will show upcoming care dates.</small></div><div><Bell size={18}/><strong>{copy.postpartum}</strong><small>Food, clean water, handwashing and hygiene guidance after birth.</small></div></div></>,
    'pregnancy-care': <><h2>{copy.pregnancyCare}</h2><p>{pregnancyExtraDisplay.select}. {pregnancyExtraDisplay.intro}</p><div className="postpartum-month-picker pregnancy-month-picker" role="group" aria-label={pregnancyExtraDisplay.select}>{pregnancyDisplay.map((item, index) => <button type="button" key={index + 1} className={month === String(index + 1) ? 'active' : ''} onClick={() => setMonth(String(index + 1))}>{pregnancyExtraDisplay.month} {index + 1}</button>)}</div>{month ? <><div className="postpartum-month-heading"><span className="section-kicker">{pregnancyExtraDisplay.monthHeading} {month}</span><h3>{pregnancyExtraDisplay.guidance}</h3></div><section className="postpartum-guides"><article className="postpartum-guide"><div className="care-image food-image" role="img" aria-label="Nutritious pregnancy foods">🥗</div><div><h3>{pregnancyExtraDisplay.nutrition}</h3><p><strong>{pregnancyDisplay[Number(month) - 1].nutrition}.</strong> {pregnancyExtraDisplay.foodSources}: {pregnancyDisplay[Number(month) - 1].foods}.</p></div></article><article className="postpartum-guide"><div className="care-image hygiene-image" role="img" aria-label="Pregnancy hygiene">🧼</div><div><h3>{pregnancyExtraDisplay.hygiene}</h3><p>{pregnancyDisplay[Number(month) - 1].hygiene}</p></div></article><article className="postpartum-guide"><img className="yoga-poster-image" src={language === 'en' ? '/images/pregnancy/gentle-yoga-poster.svg' : `/images/pregnancy/gentle-yoga-poster-${language}.svg`} alt={pregnancyPosterAlt} /><div><h3>{pregnancyExtraDisplay.exercise}</h3><p>{pregnancyYogaByLanguage[Number(month) - 1]}</p><small>{pregnancyExtraDisplay.stop}</small></div></article><article className="postpartum-guide"><div className="care-image book-image" role="img" aria-label="Pregnancy reading suggestion">📖</div><div><h3>{pregnancyExtraDisplay.reading}</h3><p><strong>{pregnancyReadingByLanguage[Number(month) - 1][0]}</strong><br />{pregnancyReadingByLanguage[Number(month) - 1][1]}</p><small>{pregnancyReadingNote}</small></div></article></section></> : <div className="care-list"><div><Utensils size={18}/><strong>{pregnancyExtraDisplay.choose}</strong><small>{pregnancyExtraDisplay.chooseText}</small></div></div>}<div className="care-list"><div><ShieldCheck size={18}/><strong>{pregnancyExtraDisplay.safety}</strong><small>{pregnancyExtraDisplay.safetyText} {pregnancyExtraDisplay.urgent}</small></div></div></>,
    wellness: <><h2>{copy.postpartum}</h2><p>{wellnessLabels.intro} {wellnessLabels.disclaimer}</p><div className="postpartum-month-picker" role="group" aria-label={wellnessLabels.intro}>{postpartumByMonth.map((item) => <button type="button" key={item.month} className={postpartumMonth === item.month ? 'active' : ''} onClick={() => setPostpartumMonth(item.month)}>{wellnessLabels.month} {item.month}</button>)}</div><div className="postpartum-month-heading"><span className="section-kicker">{wellnessLabels.month} {postpartumMonth}</span><h3>{wellnessLabels.heading}</h3></div><section className="postpartum-guides"><article className="postpartum-guide"><div className="care-image food-image" role="img" aria-label={wellnessLabels.food}>🥗</div><div><h3>{wellnessLabels.food}</h3><p>{postpartumByMonth[postpartumMonth - 1].food}</p></div></article><article className="postpartum-guide"><div className="care-image hygiene-image" role="img" aria-label={wellnessLabels.hygiene}>🧼</div><div><h3>{wellnessLabels.hygiene}</h3><p>{postpartumByMonth[postpartumMonth - 1].hygiene}</p></div></article><article className="postpartum-guide"><div className="care-image nutrition-image" role="img" aria-label={wellnessLabels.nutrition}>🍲</div><div><h3>{wellnessLabels.nutrition}</h3><p>{postpartumExtras[postpartumMonth - 1].nutrition}</p></div></article><article className="postpartum-guide"><div className="care-image book-image" role="img" aria-label={wellnessLabels.reading}>📖</div><div><h3>{wellnessLabels.reading}</h3><p>{postpartumExtras[postpartumMonth - 1].book}.</p></div></article></section><div className="care-list"><div><HeartPulse size={18}/><strong>{wellnessLabels.warning}</strong><small>{wellnessLabels.warningText}</small></div></div></>,
    periods: <><h2>{copy.periods}</h2><p>Record the first day of each period to understand your cycle. Estimates are for general wellness only, not contraception, fertility decisions, or diagnosis.</p><form className="cycle-form" onSubmit={saveCycle}><label>First day of your latest period<input type="date" value={cycleDate} onChange={(event) => setCycleDate(event.target.value)} required /></label><label>Your usual cycle length (days)<input type="number" min="15" max="60" value={cycleLength} onChange={(event) => setCycleLength(event.target.value)} required /><small>Count from the first day of one period to the first day of the next. If you are unsure, 28 days is only a starting estimate.</small></label><label>Optional notes<textarea value={cycleNotes} onChange={(event) => setCycleNotes(event.target.value)} maxLength={500} placeholder="Flow, cramps, or questions for your health worker" /></label>{cycleError && <p className="form-error" role="alert">{cycleError}</p>}{cycleSaved && <p className="tracker-success" role="status">Cycle entry saved.</p>}<button className="primary-button" type="submit" disabled={cycleBusy}>{cycleBusy ? 'Saving...' : 'Save cycle entry'} <ArrowRight size={17}/></button></form><div className="care-list"><div><Droplets size={18}/><strong>Saved cycle entries</strong><small>{cycleLogs.length ? cycleLogs.map((cycle) => `${new Date(cycle.cycleDate).toLocaleDateString()} • ${cycle.payload?.cycleLength || 28} days`).join(' | ') : 'Your saved entries will appear here.'}</small></div></div><section className="period-education"><span className="section-kicker">Learn about menstrual health</span><h3>Understand your cycle and PCOS/PCOD</h3><p className="education-note">This information is general education. PCOS/PCOD cannot be confirmed from symptoms or an app; speak with a qualified health worker for assessment.</p><div className="period-education-grid">{periodEducation.map((item) => <article className="education-card" key={item.title}><h4>{item.title}</h4><p>{item.text}</p></article>)}</div></section><div className="menstrual-columns"><section className="menstrual-column"><span className="section-kicker">Reproductive care</span><h3>Common reproductive health issues</h3><p className="education-note">These are educational summaries, not diagnoses. A qualified health worker can assess symptoms and recommend appropriate tests.</p><div className="education-card-grid">{menstrualCare.map((item) => <article className="education-card" key={`period-${item.title}`}><h4>{item.title}</h4><p>{item.text}</p></article>)}{reproductiveCare.map((item) => <article className="education-card" key={`repro-${item.title}`}><h4>{item.title}</h4><p>{item.text}</p></article>)}</div></section><section className="menstrual-column population-column"><span className="section-kicker">Population & public health</span><h3>Birth and death rates</h3><p className="education-note">Illustrative 2026 crude rates from the supplied notes, measured per 1,000 people. These are rates, not total births or deaths, and values can differ by source.</p><div className="population-chart" role="img" aria-label="Bar chart comparing selected 2026 birth and death rates per 1000 people">{populationRates.map((item) => <div className="population-row" key={item.label}><span className="population-label">{item.label}</span><div className="population-bars"><span className="population-bar birth-bar" style={{ width: `${Math.min((item.birth || 0) * 2, 100)}%` }} title={item.birth ? `Birth rate ${item.birth} per 1,000` : ''}>{item.birth ? `${item.birth} birth` : ''}</span><span className="population-bar death-bar" style={{ width: `${Math.min((item.death || 0) * 2, 100)}%` }} title={item.death ? `Death rate ${item.death} per 1,000` : ''}>{item.death ? `${item.death} death` : ''}</span></div></div>)}</div><div className="population-legend"><span><i className="legend-dot birth-dot" /> Birth rate</span><span><i className="legend-dot death-dot" /> Death rate</span></div><div className="education-card"><h4>Population context</h4><p>India is listed as the most populous country in the supplied 2026 data, followed by China, the United States, Indonesia and Pakistan. The supplied notes do not provide verified global totals for population, births or deaths; consult the latest UN World Population Prospects for aggregate figures.</p></div></section></div></>,
    'reproductive-care': <ReproductiveCareGuide language={language} />,
    population: <PopulationHealthGuide language={language} />,
    schemes: null,
    chat: <><h2>Ask JANANI</h2><p>Ask general questions or get educational information about pregnancy, infant care, nutrition, and JANANI features. Health answers are not a diagnosis or a substitute for a health worker.</p><div className="chat-panel"><div className="chat-messages" aria-live="polite">{chatMessages.length === 0 && <p className="chat-empty">Start with a question. For urgent help, contact local emergency services or a qualified health worker.</p>}{chatMessages.map((item, index) => <div className={`chat-message ${item.from === 'you' ? 'from-user' : 'from-janani'}`} key={`${index}-${item.from}`}><small>{item.from === 'you' ? 'You' : 'JANANI'}</small><p>{item.text}</p>{item.from === 'janani' && <button type="button" className="chat-speak" onClick={() => speakReply(item.text)} aria-label="Read JANANI response aloud" title="Read aloud"><Volume2 size={15}/></button>}</div>)}</div>{voiceError && <p className="chat-voice-error" role="alert">{voiceError}</p>}<form className="chat-form" onSubmit={sendChat}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Type or speak your question..." maxLength={1000} aria-label="Message JANANI"/><button type="button" className={`chat-voice-button ${listening ? 'active' : ''}`} onClick={toggleListening} aria-label={listening ? 'Stop listening' : 'Speak your question'} title={listening ? 'Stop listening' : 'Speak your question'}><Mic size={17}/></button><button className="primary-button" disabled={chatBusy || !chatInput.trim()}>{chatBusy ? '...' : 'Send'} <ArrowRight size={16}/></button></form><small className="chat-language-hint">Voice language: {language === 'kn' ? 'Kannada' : language === 'hi' ? 'Hindi' : 'English'}</small></div></>,
    emergency: <><h2>{copy.emergencyTitle}</h2><p>{copy.emergencyText}</p><div className="care-list"><div><Phone size={18}/><strong>Anganwadi worker — Lakshmi</strong><small>Yelahanka centre • 9876543210</small><button className="outline-button" onClick={() => window.location.href = 'tel:9876543210'}>{copy.call}</button></div><div><Phone size={18}/><strong>Emergency services</strong><small>For immediate danger, call 112.</small><button className="outline-button" onClick={() => window.location.href = 'tel:112'}>{copy.call}</button></div></div></>,
    location: <><h2>{copy.findCenters}</h2><p>{copy.locationHint}</p><button className="primary-button" onClick={findLocation}><MapPin size={17}/> {copy.useLocation}</button>{location && <div className="care-list"><div><MapPin size={18}/><strong>Yelahanka Anganwadi Centre</strong><small>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} • 1.8 km away • 9876543210</small><button className="outline-button" onClick={() => window.location.href = 'tel:9876543210'}>{copy.call}</button></div></div>}</>,
  }[view] || <><h2>{copy.overview}</h2><p>Choose a section from the care menu to get started.</p></>;
  if (view === 'schemes') return <div className="module-view scheme-module"><button className="back-link" onClick={() => go('dashboard')}>← {copy.overview}</button><React.Suspense fallback={<p role="status">Loading scheme information…</p>}><SchemesSupport language={language}/></React.Suspense></div>;
  return <div className="module-view"><button className="back-link" onClick={() => go('dashboard')}>← {copy.overview}</button><div className={`module-hero ${view === 'periods' ? 'module-hero-wide' : ''}`}><div><span className="section-kicker">{copy.journey}</span>{content}</div><div className="module-hero-icon"><Sparkles size={48}/></div></div></div>;
}

function LegacyModuleView({ view, go }) {
  const data = { tracker: { kicker: 'Your pregnancy journey', title: 'Your pregnancy timeline', text: 'Enter your current pregnancy month to personalize your tracker.', action: 'Save pregnancy month', icon: Baby }, appointments: { kicker: 'Your calendar', title: 'Keep important moments close.', text: 'Add check-ups and personal reminders so they are easier to find when you need them.', action: 'Add an appointment', icon: CalendarDays }, wellness: { kicker: 'Learn & nourish', title: 'Small choices, meaningful care.', text: 'Explore general articles about nutrition, rest, movement and everyday wellbeing.', action: 'Browse articles', icon: Leaf }, periods: { kicker: 'Understand your cycle', title: 'Your body has a rhythm.', text: 'Track cycle start dates and learn more about common menstrual-health experiences. Estimates are not predictions or diagnoses.', action: 'Log a cycle', icon: Droplets }, schemes: { kicker: 'Community support', title: 'Find the support you can verify.', text: 'Explore demo scheme cards and always confirm current eligibility and application details through official sources.', action: 'Browse schemes', icon: ShieldCheck }, chat: { kicker: 'A gentle starting point', title: 'What would you like to know?', text: 'Ask for general information about pregnancy, cycles, nutrition or postpartum care.', action: 'Start a conversation', icon: MessageCircle } }[view];
  const Icon = data.icon;
  const [month, setMonth] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const saveMonth = async (event) => {
    event.preventDefault();
    setError('');
    try { await savePregnancyMonth(month); setSaved(true); } catch (requestError) { setError(requestError.message); }
  };
  return <div className="module-view"><button className="back-link" onClick={() => go('dashboard')}>← Back to overview</button><div className="module-hero"><div><span className="section-kicker">{data.kicker}</span><h2>{data.title}</h2><p>{data.text}</p>{view === 'tracker' ? <form className="pregnancy-month-form" onSubmit={saveMonth}><label>Current pregnancy month<select value={month} onChange={(event) => setMonth(event.target.value)} required><option value="">Select month</option>{Array.from({ length: 9 }, (_, index) => <option key={index + 1} value={index + 1}>Month {index + 1}</option>)}</select></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">{saved ? 'Saved' : data.action} <ArrowRight size={17}/></button></form> : <button className="primary-button">{data.action} <ArrowRight size={17}/></button>}</div><div className="module-hero-icon"><Icon size={48}/></div></div><div className="empty-content"><Sparkles size={18}/><span>Personalised content will appear here as you build your care space.</span></div></div>;
}
function Login({ go }) {
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('mobile');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (step === 'mobile') {
        await requestOtp(mobile);
        setStep('otp');
      } else {
        const result = await verifyOtp(mobile, code);
        window.localStorage.setItem('janani_token', result.token);
        window.localStorage.setItem('janani_user', JSON.stringify(result.user));
        go('dashboard');
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };
  const resend = async () => {
    setError('');
    try {
      await resendOtp(mobile);
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  return <form className="login-card" onSubmit={submit}><div className="login-mark">J</div><span className="section-kicker">Your private care space</span><h2>{step === 'mobile' ? 'Welcome back.' : 'Check your phone.'}</h2><p>{step === 'mobile' ? 'Sign in securely with a one-time password sent to your mobile.' : `Enter the 6-digit code sent to ${mobile}.`}</p>{step === 'mobile' ? <label>Mobile number<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="+91 9876543210" autoComplete="tel" pattern="\\+?[0-9 ()-]{10,20}" required /></label> : <label>One-time password<input type="text" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required /></label>}{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button full" type="submit" disabled={loading}>{loading ? 'Please wait…' : step === 'mobile' ? 'Send verification code' : 'Verify and continue'} {!loading && <ArrowRight size={17}/>}</button>{step === 'otp' && <button className="quiet-button" type="button" onClick={resend}>Resend code</button>}{step === 'otp' && <button className="quiet-button" type="button" onClick={() => { setStep('mobile'); setCode(''); setError(''); }}>Use a different number</button>}<p className="login-note">Your mobile number is verified securely by the JANANI server. In development, the OTP is printed in the backend console.</p></form>;
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
