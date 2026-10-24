import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.reminderTemplate.createMany({
    data: [
      { title: 'Antenatal check-up', description: 'Schedule your routine antenatal visit.', weeks: 12 },
      { title: 'Antenatal check-up', description: 'Schedule your routine antenatal visit.', weeks: 20 },
      { title: 'Antenatal check-up', description: 'Schedule your routine antenatal visit.', weeks: 28 },
    ],
  });

  const wellnessItems = [
    {
      slug: 'pregnancy-health-hygiene-en',
      category: 'health-hygiene',
      language: 'en' as const,
      title: 'Pregnancy health and hygiene',
      summary: 'Simple daily habits for a safer, more comfortable pregnancy.',
      content: 'Wash hands regularly, drink safe water, keep food covered, rest when tired, and attend scheduled antenatal check-ups. Seek a health professional promptly for bleeding, severe pain, fever, breathing difficulty, severe headache, or reduced baby movement.',
      safetyNote: 'This guidance does not replace an antenatal visit or emergency care.',
    },
    {
      slug: 'pregnancy-health-hygiene-kn',
      category: 'health-hygiene',
      language: 'kn' as const,
      title: 'ಗರ್ಭಾವಸ್ಥೆಯ ಆರೋಗ್ಯ ಮತ್ತು ಸ್ವಚ್ಛತೆ',
      summary: 'ಸುರಕ್ಷಿತ ಮತ್ತು ಆರಾಮದಾಯಕ ಗರ್ಭಾವಸ್ಥೆಗೆ ಸರಳ ದೈನಂದಿನ ಅಭ್ಯಾಸಗಳು.',
      content: 'ಕೈಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ತೊಳೆಯಿರಿ, ಸುರಕ್ಷಿತ ನೀರು ಕುಡಿಯಿರಿ, ಆಹಾರವನ್ನು ಮುಚ್ಚಿಡಿ, ದಣಿದಾಗ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ನಿಗದಿತ ಗರ್ಭಪೂರ್ವ ತಪಾಸಣೆಗಳಿಗೆ ಹಾಜರಾಗಿರಿ. ರಕ್ತಸ್ರಾವ, ತೀವ್ರ ನೋವು, ಜ್ವರ, ಉಸಿರಾಟದ ತೊಂದರೆ, ತೀವ್ರ ತಲೆನೋವು ಅಥವಾ ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾದರೆ ತಕ್ಷಣ ಆರೋಗ್ಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      safetyNote: 'ಈ ಮಾಹಿತಿಯು ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಅಥವಾ ತುರ್ತು ಆರೈಕೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.',
    },
    {
      slug: 'pregnancy-health-hygiene-hi',
      category: 'health-hygiene',
      language: 'hi' as const,
      title: 'गर्भावस्था स्वास्थ्य और स्वच्छता',
      summary: 'सुरक्षित और आरामदायक गर्भावस्था के लिए सरल दैनिक आदतें।',
      content: 'हाथ नियमित रूप से धोएँ, सुरक्षित पानी पिएँ, भोजन ढककर रखें, थकान होने पर आराम करें और तय प्रसवपूर्व जाँच पर जाएँ। रक्तस्राव, तेज दर्द, बुखार, साँस लेने में परेशानी, तेज सिरदर्द या बच्चे की हलचल कम होने पर तुरंत स्वास्थ्यकर्मी से संपर्क करें।',
      safetyNote: 'यह जानकारी चिकित्सकीय जाँच या आपातकालीन देखभाल का विकल्प नहीं है।',
    },
    ...([
      ['articles', 'en', 'Healthy pregnancy reading', 'A short reading guide for families', 'Choose trusted public-health books and articles about antenatal visits, nutrition, hygiene, birth preparedness, and newborn care. Discuss questions with an ASHA worker or qualified clinician.'],
      ['yoga', 'en', 'Gentle prenatal yoga', 'Breathing and gentle movement for comfort', 'Try slow breathing, supported seated stretches, ankle movements, and relaxation. Stop if there is pain, dizziness, bleeding, fluid leakage, or breathlessness, and ask a clinician before starting.'],
      ['exercise', 'en', 'Safe pregnancy movement', 'Low-impact movement to support wellbeing', 'If a clinician says activity is safe, consider easy walking and gentle mobility for short periods. Avoid overheating, falling risks, contact sports, and any activity that causes discomfort.'],
      ['articles', 'kn', 'ಆರೋಗ್ಯಕರ ಗರ್ಭಾವಸ್ಥೆಯ ಓದು', 'ಕುಟುಂಬಗಳಿಗಾಗಿ ಸಣ್ಣ ಓದು ಮಾರ್ಗದರ್ಶಿ', 'ಗರ್ಭಪೂರ್ವ ತಪಾಸಣೆ, ಪೋಷಣೆ, ಸ್ವಚ್ಛತೆ, ಹೆರಿಗೆ ಸಿದ್ಧತೆ ಮತ್ತು ನವಜಾತ ಶಿಶು ಆರೈಕೆಯ ಬಗ್ಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಪುಸ್ತಕಗಳು ಮತ್ತು ಲೇಖನಗಳನ್ನು ಓದಿ. ಪ್ರಶ್ನೆಗಳನ್ನು ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಅಥವಾ ಅರ್ಹ ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಿ.'],
      ['yoga', 'kn', 'ಸೌಮ್ಯ ಗರ್ಭಪೂರ್ವ ಯೋಗ', 'ಆರಾಮಕ್ಕಾಗಿ ಉಸಿರಾಟ ಮತ್ತು ಸೌಮ್ಯ ಚಲನೆ', 'ನಿಧಾನವಾದ ಉಸಿರಾಟ, ಬೆಂಬಲದೊಂದಿಗೆ ಕುಳಿತು ಮಾಡುವ ಸ್ಟ್ರೆಚ್‌ಗಳು, ಕಾಲುಮೂಳೆ ಚಲನೆಗಳು ಮತ್ತು ವಿಶ್ರಾಂತಿಯನ್ನು ಪ್ರಯತ್ನಿಸಿ. ನೋವು, ತಲೆಸುತ್ತು, ರಕ್ತಸ್ರಾವ, ನೀರು ಸೋರಿಕೆ ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಕಂಡುಬಂದರೆ ನಿಲ್ಲಿಸಿ ಮತ್ತು ಆರಂಭಿಸುವ ಮೊದಲು ವೈದ್ಯರನ್ನು ಕೇಳಿ.'],
      ['exercise', 'kn', 'ಗರ್ಭಾವಸ್ಥೆಯ ಸುರಕ್ಷಿತ ಚಲನೆ', 'ಆರೋಗ್ಯಕ್ಕೆ ಸಹಾಯ ಮಾಡುವ ಕಡಿಮೆ ಒತ್ತಡದ ಚಲನೆ', 'ವೈದ್ಯರು ಸುರಕ್ಷಿತವೆಂದು ಹೇಳಿದರೆ ಸ್ವಲ್ಪ ಸಮಯ ನಿಧಾನವಾಗಿ ನಡೆಯುವುದು ಮತ್ತು ಸೌಮ್ಯ ಚಲನೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಬಹುದು. ಹೆಚ್ಚು ಬಿಸಿಯಾಗುವುದು, ಬೀಳುವ ಅಪಾಯ, ಸಂಪರ್ಕ ಕ್ರೀಡೆಗಳು ಮತ್ತು ಅಸೌಕರ್ಯ ಉಂಟುಮಾಡುವ ಚಟುವಟಿಕೆಗಳನ್ನು ತಪ್ಪಿಸಿ.'],
      ['articles', 'hi', 'स्वस्थ गर्भावस्था पढ़ें', 'परिवारों के लिए छोटी पढ़ने की मार्गदर्शिका', 'प्रसवपूर्व जाँच, पोषण, स्वच्छता, प्रसव की तैयारी और नवजात शिशु की देखभाल पर भरोसेमंद स्वास्थ्य पुस्तकें और लेख पढ़ें। अपने प्रश्न आशा कार्यकर्ता या योग्य चिकित्सक से पूछें।'],
      ['yoga', 'hi', 'हल्का प्रसवपूर्व योग', 'आराम के लिए साँस और हल्की गतिविधि', 'धीमी साँस, सहारे के साथ बैठकर स्ट्रेच, टखनों की हल्की गतिविधि और विश्राम करें। दर्द, चक्कर, रक्तस्राव, पानी आना या साँस फूलना हो तो रुकें और शुरू करने से पहले चिकित्सक से पूछें।'],
      ['exercise', 'hi', 'गर्भावस्था में सुरक्षित गतिविधि', 'स्वास्थ्य के लिए कम प्रभाव वाली गतिविधि', 'चिकित्सक की अनुमति हो तो थोड़ी देर धीरे चलना और हल्की गतिविधि करें। अधिक गर्मी, गिरने के जोखिम, संपर्क खेल और असुविधा देने वाली गतिविधियों से बचें।'],
    ] as const).map(([category, language, title, summary, content]) => ({
      slug: `${category}-${language}`,
      category,
      language,
      title,
      summary,
      content,
      safetyNote: language === 'en'
        ? 'Ask your antenatal care provider before starting a new activity. Stop and seek care if warning signs appear.'
        : language === 'kn'
          ? 'ಹೊಸ ಚಟುವಟಿಕೆ ಆರಂಭಿಸುವ ಮೊದಲು ಗರ್ಭಪೂರ್ವ ಆರೈಕೆ ತಜ್ಞರನ್ನು ಕೇಳಿ. ಅಪಾಯದ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ ನಿಲ್ಲಿಸಿ ಆರೈಕೆ ಪಡೆಯಿರಿ.'
          : 'नई गतिविधि शुरू करने से पहले प्रसवपूर्व देखभाल प्रदाता से पूछें। चेतावनी के संकेत दिखाई दें तो रुकें और चिकित्सा सहायता लें।',
    })),
  ];

  for (const item of wellnessItems) {
    await prisma.wellnessContent.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
}

main().finally(() => prisma.$disconnect());
