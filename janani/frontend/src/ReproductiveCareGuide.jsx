import React from 'react';
import { reproductiveCareCopy } from './reproductiveCare';

const images = [
  '/images/reproductive-care/health.svg',
  '/images/reproductive-care/condom.svg',
  '/images/reproductive-care/support.svg',
];

const conditions = {
  en: [
    ['PCOS', 'PCOS can be linked with irregular periods, acne, extra facial or body hair, hair thinning, weight changes or trouble ovulating. Symptoms alone cannot confirm PCOS.'],
    ['Uterine fibroids', 'These are non-cancerous growths in the uterus. They may cause heavy or painful periods, pressure, frequent urination or back pain; some people have no symptoms.'],
    ['Endometriosis', 'Tissue similar to the lining of the uterus grows elsewhere in the body. It can cause severe period pain, bleeding between periods, bowel symptoms or difficulty becoming pregnant. Ongoing or severe pain deserves assessment.'],
    ['Fertility concerns', 'A health professional may assess difficulty becoming pregnant after 12 months of regular unprotected sex, or after 6 months if the woman is over 35. Age, smoking, alcohol, weight changes and physical or emotional stress can affect fertility.'],
    ['Planning for pregnancy', 'Before pregnancy, discuss conditions such as diabetes, blood pressure, infections and mental health. Ask about folic acid and iron, medicines, vaccines, genetic counselling and thalassemia screening.'],
    ['Your safety and choices', 'Do not take abortion medicines without guidance from a qualified health professional. Ask a trusted health worker about contraception, STI/HIV testing and pregnancy planning. You deserve respectful care and support if you experience sexual or gender-based violence.'],
  ],
  kn: [
    ['PCOS', 'PCOS ಇದ್ದರೆ ಮಾಸಿಕ ಚಕ್ರ ಅನಿಯಮಿತವಾಗಬಹುದು, ಮೊಡವೆ, ಮುಖ ಅಥವಾ ದೇಹದಲ್ಲಿ ಹೆಚ್ಚುವರಿ ಕೂದಲು, ತಲೆಕೂದಲು ತೆಳುವಾಗುವುದು, ತೂಕ ಬದಲಾವಣೆ ಅಥವಾ ಅಂಡೋತ್ಸರ್ಗದ ತೊಂದರೆ ಕಾಣಿಸಬಹುದು. ಲಕ್ಷಣಗಳಿಂದ ಮಾತ್ರ PCOS ಖಚಿತಪಡಿಸಲಾಗುವುದಿಲ್ಲ.'],
    ['ಗರ್ಭಾಶಯದ ಫೈಬ್ರಾಯ್ಡ್‌ಗಳು', 'ಇವು ಗರ್ಭಾಶಯದಲ್ಲಿ ಉಂಟಾಗುವ ಕ್ಯಾನ್ಸರ್ ಅಲ್ಲದ ಗಡ್ಡೆಗಳು. ಹೆಚ್ಚು ಅಥವಾ ನೋವಿನ ಮಾಸಿಕ, ಒತ್ತಡದ ಭಾವನೆ, ಆಗಾಗ ಮೂತ್ರ ವಿಸರ್ಜನೆ ಅಥವಾ ಬೆನ್ನುನೋವು ಉಂಟಾಗಬಹುದು; ಕೆಲವರಿಗೆ ಲಕ್ಷಣಗಳೇ ಇರುವುದಿಲ್ಲ.'],
    ['ಎಂಡೊಮೆಟ್ರಿಯೊಸಿಸ್', 'ಗರ್ಭಾಶಯದ ಒಳಪದರದಂತಿರುವ ಅಂಗಾಂಶ ದೇಹದ ಇತರ ಭಾಗಗಳಲ್ಲಿ ಬೆಳೆಯುತ್ತದೆ. ತೀವ್ರ ಮಾಸಿಕ ನೋವು, ಮಧ್ಯಂತರ ರಕ್ತಸ್ರಾವ, ಮಲವಿಸರ್ಜನೆಗೆ ಸಂಬಂಧಿಸಿದ ತೊಂದರೆ ಅಥವಾ ಗರ್ಭಧಾರಣೆಯ ತೊಂದರೆ ಉಂಟಾಗಬಹುದು. ನೋವು ನಿರಂತರವಾಗಿದ್ದರೆ ಅಥವಾ ತೀವ್ರವಾಗಿದ್ದರೆ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ.'],
    ['ಫಲವತ್ತತೆ ಸಂಬಂಧಿತ ತೊಂದರೆ', 'ನಿಯಮಿತವಾಗಿ ಗರ್ಭನಿರೋಧಕವಿಲ್ಲದೆ ಲೈಂಗಿಕ ಸಂಪರ್ಕ ಹೊಂದಿದರೂ 12 ತಿಂಗಳಲ್ಲಿ ಗರ್ಭಧಾರಣೆಯಾಗದಿದ್ದರೆ, ಅಥವಾ ಮಹಿಳೆಯ ವಯಸ್ಸು 35ಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದರೆ 6 ತಿಂಗಳ ನಂತರ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರು ಪರೀಕ್ಷೆ ಸೂಚಿಸಬಹುದು. ವಯಸ್ಸು, ಧೂಮಪಾನ, ಮದ್ಯಪಾನ, ತೂಕ ಬದಲಾವಣೆ ಮತ್ತು ದೈಹಿಕ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡ ಫಲವತ್ತತೆಯ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು.'],
    ['ಗರ್ಭಧಾರಣೆಗೆ ಸಿದ್ಧತೆ', 'ಗರ್ಭಧಾರಣೆಗೆ ಮುನ್ನ ಮಧುಮೇಹ, ರಕ್ತದೊತ್ತಡ, ಸೋಂಕುಗಳು ಮತ್ತು ಮಾನಸಿಕ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಮಾತನಾಡಿ. ಫೋಲಿಕ್ ಆಮ್ಲ ಮತ್ತು ಕಬ್ಬಿಣ, ಔಷಧಿಗಳು, ಲಸಿಕೆಗಳು, ವಂಶವಾಹಿ ಸಲಹೆ ಮತ್ತು ಥಲಸೇಮಿಯಾ ಪರೀಕ್ಷೆಯ ಬಗ್ಗೆ ಕೇಳಿ.'],
    ['ನಿಮ್ಮ ಸುರಕ್ಷತೆ ಮತ್ತು ಆಯ್ಕೆಗಳು', 'ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರ ಮಾರ್ಗದರ್ಶನವಿಲ್ಲದೆ ಗರ್ಭಪಾತದ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ. ಗರ್ಭನಿರೋಧಕ, STI/HIV ಪರೀಕ್ಷೆ ಮತ್ತು ಗರ್ಭಧಾರಣೆಯ ಯೋಜನೆ ಬಗ್ಗೆ ನಂಬಿಕೆಯ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರನ್ನು ಕೇಳಿ. ಲೈಂಗಿಕ ಅಥವಾ ಲಿಂಗ ಆಧಾರಿತ ಹಿಂಸೆ ಅನುಭವಿಸಿದರೆ ಗೌರವಯುತ ಆರೈಕೆ ಮತ್ತು ಬೆಂಬಲ ಪಡೆಯುವ ಹಕ್ಕು ನಿಮಗಿದೆ.'],
  ],
  hi: [
    ['PCOS', 'PCOS के साथ अनियमित माहवारी, मुहाँसे, चेहरे या शरीर पर अधिक बाल, सिर के बाल पतले होना, वज़न में बदलाव या अंडोत्सर्ग में कठिनाई हो सकती है। केवल लक्षणों से PCOS की पुष्टि नहीं होती।'],
    ['गर्भाशय की फाइब्रॉइड', 'ये गर्भाशय में होने वाली गैर-कैंसरकारी गाँठें हैं। इनसे भारी या दर्दनाक माहवारी, दबाव, बार-बार पेशाब या पीठ दर्द हो सकता है; कुछ लोगों में कोई लक्षण नहीं होता।'],
    ['एंडोमेट्रियोसिस', 'गर्भाशय की अंदरूनी परत जैसा ऊतक शरीर के दूसरे हिस्सों में बढ़ता है। इससे तेज़ माहवारी दर्द, बीच में रक्तस्राव, मल त्याग की समस्या या गर्भधारण में कठिनाई हो सकती है। लगातार या तेज़ दर्द की जाँच कराएँ।'],
    ['प्रजनन क्षमता की चिंता', 'नियमित असुरक्षित यौन संबंध के 12 महीने बाद, या महिला की उम्र 35 से अधिक हो तो 6 महीने बाद स्वास्थ्यकर्मी जाँच की सलाह दे सकते हैं। उम्र, धूम्रपान, शराब, वज़न में बदलाव और शारीरिक या भावनात्मक तनाव असर डाल सकते हैं।'],
    ['गर्भधारण की तैयारी', 'गर्भधारण से पहले मधुमेह, रक्तचाप, संक्रमण और मानसिक स्वास्थ्य पर चर्चा करें। फोलिक एसिड और आयरन, दवाइयों, टीकों, आनुवंशिक परामर्श और थैलेसीमिया जाँच के बारे में पूछें।'],
    ['आपकी सुरक्षा और पसंद', 'योग्य स्वास्थ्य पेशेवर के मार्गदर्शन के बिना गर्भपात की दवा न लें। गर्भनिरोध, STI/HIV जाँच और गर्भधारण की योजना के बारे में भरोसेमंद स्वास्थ्यकर्मी से पूछें। यौन या लैंगिक हिंसा की स्थिति में आपको सम्मानजनक देखभाल और सहायता पाने का अधिकार है।'],
  ],
};

export default function ReproductiveCareGuide({ language = 'en' }) {
  const copy = reproductiveCareCopy[language] || reproductiveCareCopy.en;
  return <div className="reproductive-guide" lang={language}>
    <h2>{copy.title}</h2><p>{copy.intro}</p>
    <div className="reproductive-visuals">{images.map((src, i) => <img key={src} src={src} alt={copy.imageAlt[i]} loading="lazy" />)}</div>
    <section className="period-education"><span className="section-kicker">{copy.overviewTitle}</span><p>{copy.overview}</p></section>
    <section className="reproductive-stat"><h3>{copy.statsTitle}</h3><p>{copy.stats}</p></section>
    <section className="period-education"><span className="section-kicker">{copy.condomsTitle}</span><p>{copy.condoms}</p>
      <h3>{copy.stepsTitle}</h3><ol className="reproductive-list">{copy.steps.map((item) => <li key={item}>{item}</li>)}</ol>
      <h3>{copy.cautionsTitle}</h3><ul className="reproductive-list">{copy.cautions.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
    <section className="period-education"><span className="section-kicker">{copy.methodsTitle}</span><p>{copy.methodsIntro}</p>
      <div className="reproductive-table-wrap"><table className="reproductive-table"><thead><tr>{copy.methodHeaders.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{copy.methods.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>
    </section>
    <section className="period-education"><span className="section-kicker">{copy.testingTitle}</span><p>{copy.testing}</p></section>
    <section className="period-education"><span className="section-kicker">{copy.emergencyTitle}</span><p>{copy.emergency}</p></section>
    <section className="period-education"><span className="section-kicker">{copy.remindersTitle}</span><ul className="reproductive-list">{copy.reminders.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="period-education"><span className="section-kicker">{language === 'kn' ? 'ಸಾಮಾನ್ಯ ಸಂತಾನೋತ್ಪತ್ತಿ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು' : language === 'hi' ? 'प्रजनन स्वास्थ्य से जुड़ी आम स्थितियाँ' : 'Common reproductive health topics'}</span><div className="period-education-grid">{(conditions[language] || conditions.en).map(([title, text]) => <article className="education-card" key={title}><h4>{title}</h4><p>{text}</p></article>)}</div></section>
    <p className="education-note reproductive-sources">{language === 'kn' ? 'ಮಾಹಿತಿ ಮೂಲಗಳು: ' : language === 'hi' ? 'जानकारी के स्रोत: ' : 'Information sources: '}<a href="https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception" target="_blank" rel="noreferrer">WHO</a> · <a href="https://www.cdc.gov/contraception/about/" target="_blank" rel="noreferrer">CDC contraception information</a> · <a href="https://www.cdc.gov/condom-use/" target="_blank" rel="noreferrer">CDC condom guidance</a></p>
  </div>;
}
