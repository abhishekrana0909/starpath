// StarPath — static reference data. Every text is [English, Hindi].
// Index conventions: rashi 0..11 (Mesh..Meen), nakshatra 0..26 (Ashwini..Revati)

export const PLANETS = {
  Sun:     { id: 'Sun',     n: ['Sun', 'सूर्य'],        sym: '☉', color: '#ffb64a', gem: ['Ruby', 'माणिक्य'],            day: ['Sunday', 'रविवार'],     num: 1, col: ['Gold, Orange', 'सुनहरा, नारंगी'] },
  Moon:    { id: 'Moon',    n: ['Moon', 'चंद्र'],       sym: '☽', color: '#dfe8ff', gem: ['Pearl', 'मोती'],              day: ['Monday', 'सोमवार'],     num: 2, col: ['White, Silver', 'सफ़ेद, चांदी'] },
  Mars:    { id: 'Mars',    n: ['Mars', 'मंगल'],        sym: '♂', color: '#ff5a4a', gem: ['Red Coral', 'मूंगा'],         day: ['Tuesday', 'मंगलवार'],   num: 9, col: ['Red, Maroon', 'लाल, मैरून'] },
  Mercury: { id: 'Mercury', n: ['Mercury', 'बुध'],      sym: '☿', color: '#5be3a0', gem: ['Emerald', 'पन्ना'],           day: ['Wednesday', 'बुधवार'],  num: 5, col: ['Green', 'हरा'] },
  Jupiter: { id: 'Jupiter', n: ['Jupiter', 'गुरु'],     sym: '♃', color: '#ffd76a', gem: ['Yellow Sapphire', 'पुखराज'],  day: ['Thursday', 'गुरुवार'],  num: 3, col: ['Yellow, Saffron', 'पीला, केसरिया'] },
  Venus:   { id: 'Venus',   n: ['Venus', 'शुक्र'],      sym: '♀', color: '#ff9ed8', gem: ['Diamond', 'हीरा'],            day: ['Friday', 'शुक्रवार'],   num: 6, col: ['White, Pink', 'सफ़ेद, गुलाबी'] },
  Saturn:  { id: 'Saturn',  n: ['Saturn', 'शनि'],       sym: '♄', color: '#8aa4ff', gem: ['Blue Sapphire', 'नीलम'],      day: ['Saturday', 'शनिवार'],   num: 8, col: ['Dark Blue, Black', 'गहरा नीला, काला'] },
  Rahu:    { id: 'Rahu',    n: ['Rahu', 'राहु'],        sym: '☊', color: '#b48cff', gem: ['Hessonite', 'गोमेद'],         day: ['Saturday', 'शनिवार'],   num: 4, col: ['Smoky', 'धुएँ जैसा'] },
  Ketu:    { id: 'Ketu',    n: ['Ketu', 'केतु'],        sym: '☋', color: '#c9a27a', gem: ["Cat's Eye", 'लहसुनिया'],      day: ['Tuesday', 'मंगलवार'],   num: 7, col: ['Multicolour', 'चितकबरा'] },
};
export const GRAHA_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export const RASHI_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

// Dignity: exaltation sign / debilitation sign / own signs
export const EXALT = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
export const DEBIL = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
export const OWN = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };

export const ELEMENTS = [['Fire', 'अग्नि'], ['Earth', 'पृथ्वी'], ['Air', 'वायु'], ['Water', 'जल']];
export const QUALITIES = [['Movable (Chara)', 'चर'], ['Fixed (Sthira)', 'स्थिर'], ['Dual (Dwiswabhava)', 'द्विस्वभाव']];

// Western (tropical) sign start dates [month, day] — used only on the "by date" tab
export const TROPICAL_START = [[3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23], [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19]];

// name = [en, hi, sanskrit-ish transliteration]
export const RASHI = [
  { key: 'mesh', sym: '♈', n: ['Aries', 'मेष', 'Mesha'], el: 0, q: 0,
    nak: ['Ashwini', 'Bharani', 'Krittika (1)'],
    letters: ['चू चे चो ला ली लू ले लो अ', 'Chu Che Cho La Li Lu Le Lo A'],
    traits: [['Courageous', 'साहसी'], ['Energetic', 'ऊर्जावान'], ['Leader', 'नेतृत्वकर्ता'], ['Honest', 'स्पष्टवादी']],
    flaws: [['Impatient', 'अधीर'], ['Short-tempered', 'जल्दी गुस्सा']],
    about: ['Mesh is the first rashi, ruled by Mars. Natives are bold, direct and always ready to start something new. They hate waiting and love a challenge.',
            'मेष राशि का स्वामी मंगल है। इस राशि के लोग निडर, सीधे और हर नई शुरुआत के लिए तैयार रहते हैं। इन्हें इंतज़ार पसंद नहीं और चुनौती इन्हें भाती है।'],
    career: ['Best in leadership, defence, sports, engineering, business and anything fast-paced.', 'नेतृत्व, रक्षा क्षेत्र, खेल, इंजीनियरिंग और व्यवसाय जैसे तेज़ रफ़्तार काम में सफल।'],
    love: ['Passionate and loyal, but needs space and honesty. Slow down and listen.', 'जुनूनी और वफ़ादार, पर स्पष्टता और आज़ादी चाहते हैं। थोड़ा रुककर सुनना सीखें।'],
    health: ['Head, face and blood pressure need care. Avoid overworking and anger.', 'सिर, चेहरा और रक्तचाप का ध्यान रखें। अधिक काम और गुस्सा न करें।'] },
  { key: 'vrishabh', sym: '♉', n: ['Taurus', 'वृषभ', 'Vrishabha'], el: 1, q: 1,
    nak: ['Krittika (2-4)', 'Rohini', 'Mrigashira (1-2)'],
    letters: ['इ उ ए ओ वा वी वू वे वो', 'I U E O Va Vi Vu Ve Vo'],
    traits: [['Patient', 'धैर्यवान'], ['Reliable', 'भरोसेमंद'], ['Artistic', 'कलाप्रेमी'], ['Determined', 'दृढ़']],
    flaws: [['Stubborn', 'ज़िद्दी'], ['Possessive', 'अधिकार जताने वाले']],
    about: ['Vrishabh is ruled by Venus. Natives love comfort, beauty, good food and stable relationships. Once they decide, nothing moves them.',
            'वृषभ राशि का स्वामी शुक्र है। ये लोग आराम, सुंदरता, अच्छे भोजन और स्थिर रिश्तों को पसंद करते हैं। एक बार निर्णय ले लें तो कोई हिला नहीं सकता।'],
    career: ['Finance, banking, art, music, fashion, food, real estate and luxury goods.', 'वित्त, बैंकिंग, कला, संगीत, फ़ैशन, खान-पान, प्रॉपर्टी और लग्ज़री वस्तुएँ।'],
    love: ['Deeply loyal and sensual. They build slowly but love for life.', 'बेहद वफ़ादार और भावुक। रिश्ता धीरे बनाते हैं पर उम्र भर निभाते हैं।'],
    health: ['Throat, neck and weight need attention. Keep a routine and eat light.', 'गला, गर्दन और वज़न का ध्यान रखें। दिनचर्या नियमित रखें और हल्का खाएँ।'] },
  { key: 'mithun', sym: '♊', n: ['Gemini', 'मिथुन', 'Mithuna'], el: 2, q: 2,
    nak: ['Mrigashira (3-4)', 'Ardra', 'Punarvasu (1-3)'],
    letters: ['का की कू घ ङ छ के को हा', 'Ka Ki Ku Gha Ng Chha Ke Ko Ha'],
    traits: [['Witty', 'हाज़िरजवाब'], ['Curious', 'जिज्ञासु'], ['Adaptable', 'अनुकूल'], ['Communicative', 'बातूनी']],
    flaws: [['Restless', 'चंचल'], ['Indecisive', 'दुविधा में रहने वाले']],
    about: ['Mithun is ruled by Mercury. Natives are quick-minded, talkative and love learning. They get bored easily and need variety.',
            'मिथुन राशि का स्वामी बुध है। ये तेज़ दिमाग़, बातूनी और सीखने के शौकीन होते हैं। जल्दी ऊब जाते हैं और विविधता चाहते हैं।'],
    career: ['Writing, media, teaching, sales, marketing, trading, IT and travel.', 'लेखन, मीडिया, शिक्षण, सेल्स, मार्केटिंग, ट्रेडिंग, आईटी और यात्रा।'],
    love: ['Playful and intellectual. A partner who can talk and grow with them wins their heart.', 'चंचल और बौद्धिक। जो साथी बात कर सके और साथ बढ़े, वही दिल जीतता है।'],
    health: ['Lungs, hands and nerves. Avoid overthinking; breathing exercise helps.', 'फेफड़े, हाथ और नसें। ज़्यादा सोचने से बचें, प्राणायाम लाभ देगा।'] },
  { key: 'kark', sym: '♋', n: ['Cancer', 'कर्क', 'Karka'], el: 3, q: 0,
    nak: ['Punarvasu (4)', 'Pushya', 'Ashlesha'],
    letters: ['ही हू हे हो डा डी डू डे डो', 'Hi Hu He Ho Da Di Du De Do'],
    traits: [['Caring', 'देखभाल करने वाले'], ['Emotional', 'भावुक'], ['Intuitive', 'अंतर्ज्ञानी'], ['Protective', 'रक्षक']],
    flaws: [['Moody', 'मूडी'], ['Clingy', 'अत्यधिक जुड़ने वाले']],
    about: ['Kark is ruled by the Moon. Natives are deeply attached to family and home, with strong intuition. Their mood follows the mind like tides.',
            'कर्क राशि का स्वामी चंद्रमा है। ये परिवार और घर से गहरे जुड़े होते हैं और इनका अंतर्ज्ञान प्रबल होता है। मन की लहरों की तरह मूड बदलता रहता है।'],
    career: ['Healthcare, hospitality, teaching, counselling, real estate, food and water-related work.', 'स्वास्थ्य सेवा, होटल, शिक्षण, परामर्श, प्रॉपर्टी, खान-पान और जल से जुड़े काम।'],
    love: ['Tender and devoted. Needs emotional safety and a warm home.', 'कोमल और समर्पित। भावनात्मक सुरक्षा और स्नेह भरा घर चाहिए।'],
    health: ['Chest, stomach and digestion are sensitive to stress. Keep the mind calm.', 'छाती, पेट और पाचन तनाव से प्रभावित होते हैं। मन शांत रखें।'] },
  { key: 'simha', sym: '♌', n: ['Leo', 'सिंह', 'Simha'], el: 0, q: 1,
    nak: ['Magha', 'Purva Phalguni', 'Uttara Phalguni (1)'],
    letters: ['मा मी मू मे मो टा टी टू टे', 'Ma Mi Mu Me Mo Ta Ti Tu Te'],
    traits: [['Confident', 'आत्मविश्वासी'], ['Generous', 'उदार'], ['Royal', 'राजसी'], ['Loyal', 'वफ़ादार']],
    flaws: [['Proud', 'अभिमानी'], ['Dominating', 'हावी होने वाले']],
    about: ['Simha is ruled by the Sun. Natives carry natural authority and warmth. They love to lead and to be appreciated.',
            'सिंह राशि का स्वामी सूर्य है। इनमें स्वाभाविक रौब और गर्मजोशी होती है। नेतृत्व करना और सराहना पाना इन्हें पसंद है।'],
    career: ['Politics, administration, management, entertainment, government service and leadership roles.', 'राजनीति, प्रशासन, प्रबंधन, मनोरंजन, सरकारी सेवा और नेतृत्व के पद।'],
    love: ['Warm, romantic and generous. Needs respect more than anything.', 'गर्मजोशी भरे, रोमांटिक और उदार। इन्हें सबसे ज़्यादा सम्मान चाहिए।'],
    health: ['Heart, spine and back. Keep pride aside and take rest.', 'हृदय, रीढ़ और पीठ। अहंकार छोड़कर आराम करें।'] },
  { key: 'kanya', sym: '♍', n: ['Virgo', 'कन्या', 'Kanya'], el: 1, q: 2,
    nak: ['Uttara Phalguni (2-4)', 'Hasta', 'Chitra (1-2)'],
    letters: ['टो पा पी पू ष ण ठ पे पो', 'To Pa Pi Pu Sha Na Tha Pe Po'],
    traits: [['Analytical', 'विश्लेषणात्मक'], ['Practical', 'व्यावहारिक'], ['Helpful', 'मददगार'], ['Organised', 'व्यवस्थित']],
    flaws: [['Over-critical', 'आलोचक'], ['Worrier', 'चिंता करने वाले']],
    about: ['Kanya is ruled by Mercury. Natives notice every detail, love order and are always ready to help. They are perfectionists.',
            'कन्या राशि का स्वामी बुध है। ये हर बारीकी देखते हैं, व्यवस्था पसंद करते हैं और मदद को तैयार रहते हैं। ये पूर्णतावादी होते हैं।'],
    career: ['Medicine, accounts, research, editing, analytics, teaching and service work.', 'चिकित्सा, लेखा, शोध, संपादन, डेटा विश्लेषण, शिक्षण और सेवा क्षेत्र।'],
    love: ['Shy at first, then deeply caring. Show love through small acts.', 'शुरू में संकोची, फिर बेहद परवाह करने वाले। छोटी-छोटी बातों से प्यार जताते हैं।'],
    health: ['Digestion and nerves. Worry is the real enemy; keep a diet and sleep routine.', 'पाचन और नसें। चिंता सबसे बड़ी दुश्मन है; खान-पान और नींद नियमित रखें।'] },
  { key: 'tula', sym: '♎', n: ['Libra', 'तुला', 'Tula'], el: 2, q: 0,
    nak: ['Chitra (3-4)', 'Swati', 'Vishakha (1-3)'],
    letters: ['रा री रू रे रो ता ती तू ते', 'Ra Ri Ru Re Ro Ta Ti Tu Te'],
    traits: [['Balanced', 'संतुलित'], ['Charming', 'आकर्षक'], ['Fair', 'न्यायप्रिय'], ['Diplomatic', 'कूटनीतिज्ञ']],
    flaws: [['Indecisive', 'अनिर्णायक'], ['Avoids conflict', 'टकराव से बचने वाले']],
    about: ['Tula is ruled by Venus. Natives love harmony, beauty and fairness. They weigh every side before choosing, sometimes too long.',
            'तुला राशि का स्वामी शुक्र है। ये सामंजस्य, सुंदरता और न्याय पसंद करते हैं। हर पक्ष तौलकर चुनते हैं, कभी-कभी बहुत देर तक।'],
    career: ['Law, design, diplomacy, fashion, beauty, art, HR and partnerships.', 'कानून, डिज़ाइन, कूटनीति, फ़ैशन, सौंदर्य, कला, एचआर और साझेदारी।'],
    love: ['Romantic and partner-focused. Needs a peaceful and balanced bond.', 'रोमांटिक और साथी को महत्व देने वाले। शांत और संतुलित रिश्ता चाहिए।'],
    health: ['Kidneys, lower back and skin. Drink water and avoid sugar overload.', 'गुर्दे, कमर और त्वचा। पानी पिएँ और ज़्यादा मीठे से बचें।'] },
  { key: 'vrishchik', sym: '♏', n: ['Scorpio', 'वृश्चिक', 'Vrishchika'], el: 3, q: 1,
    nak: ['Vishakha (4)', 'Anuradha', 'Jyeshtha'],
    letters: ['तो ना नी नू ने नो या यी यू', 'To Na Ni Nu Ne No Ya Yi Yu'],
    traits: [['Intense', 'गहरे'], ['Determined', 'संकल्पी'], ['Secretive', 'रहस्यमयी'], ['Loyal', 'वफ़ादार']],
    flaws: [['Jealous', 'ईर्ष्यालु'], ['Vengeful', 'बदला याद रखने वाले']],
    about: ['Vrishchik is ruled by Mars. Natives feel deeply, hide a lot and never give up. They have strong willpower and research ability.',
            'वृश्चिक राशि का स्वामी मंगल है। ये गहराई से महसूस करते हैं, बहुत कुछ छुपाते हैं और हार नहीं मानते। इनकी इच्छाशक्ति और शोध क्षमता प्रबल होती है।'],
    career: ['Research, investigation, surgery, psychology, occult, police and finance.', 'शोध, जाँच, शल्य चिकित्सा, मनोविज्ञान, गूढ़ विद्या, पुलिस और वित्त।'],
    love: ['All-in or nothing. Deep trust is everything for them.', 'या पूरा या कुछ नहीं। इनके लिए गहरा विश्वास सबसे ज़रूरी है।'],
    health: ['Reproductive system, bladder and blood. Release suppressed emotions.', 'प्रजनन तंत्र, मूत्राशय और रक्त। दबी भावनाओं को बाहर निकालें।'] },
  { key: 'dhanu', sym: '♐', n: ['Sagittarius', 'धनु', 'Dhanu'], el: 0, q: 2,
    nak: ['Mula', 'Purva Ashadha', 'Uttara Ashadha (1)'],
    letters: ['ये यो भा भी भू धा फा ढा भे', 'Ye Yo Bha Bhi Bhu Dha Pha Dha Bhe'],
    traits: [['Optimistic', 'आशावादी'], ['Adventurous', 'साहसिक'], ['Philosophical', 'दार्शनिक'], ['Honest', 'ईमानदार']],
    flaws: [['Blunt', 'रूखे बोलने वाले'], ['Careless', 'लापरवाह']],
    about: ['Dhanu is ruled by Jupiter. Natives seek truth, freedom and wisdom. They love travel, teaching and big ideas.',
            'धनु राशि का स्वामी गुरु है। ये सत्य, स्वतंत्रता और ज्ञान की खोज में रहते हैं। यात्रा, शिक्षा और बड़े विचार इन्हें पसंद हैं।'],
    career: ['Teaching, law, philosophy, travel, publishing, sports and spiritual guidance.', 'शिक्षण, कानून, दर्शन, यात्रा, प्रकाशन, खेल और आध्यात्मिक मार्गदर्शन।'],
    love: ['Free-spirited and honest. Needs a partner who gives space and shares dreams.', 'स्वतंत्र और ईमानदार। ऐसा साथी चाहिए जो जगह दे और सपने साझा करे।'],
    health: ['Thighs, hips and liver. Stay active and avoid excess.', 'जाँघें, कूल्हे और यकृत। सक्रिय रहें और अति से बचें।'] },
  { key: 'makar', sym: '♑', n: ['Capricorn', 'मकर', 'Makara'], el: 1, q: 0,
    nak: ['Uttara Ashadha (2-4)', 'Shravana', 'Dhanishta (1-2)'],
    letters: ['भो जा जी खी खू खे खो गा गी', 'Bho Ja Ji Khi Khu Khe Kho Ga Gi'],
    traits: [['Disciplined', 'अनुशासित'], ['Ambitious', 'महत्वाकांक्षी'], ['Patient', 'धैर्यवान'], ['Responsible', 'ज़िम्मेदार']],
    flaws: [['Rigid', 'कठोर'], ['Pessimistic', 'निराशावादी']],
    about: ['Makar is ruled by Saturn. Natives work hard, plan long-term and rise slowly but surely. Success comes late but lasts.',
            'मकर राशि का स्वामी शनि है। ये कड़ी मेहनत करते हैं, लंबी योजना बनाते हैं और धीरे पर पक्के कदमों से ऊपर उठते हैं। सफलता देर से आती है पर टिकती है।'],
    career: ['Administration, engineering, construction, politics, mining and corporate leadership.', 'प्रशासन, इंजीनियरिंग, निर्माण, राजनीति, खनन और कॉर्पोरेट नेतृत्व।'],
    love: ['Serious and loyal. Slow to open, but a rock for the partner.', 'गंभीर और वफ़ादार। खुलने में समय लेते हैं पर साथी का सहारा बनते हैं।'],
    health: ['Bones, knees and joints. Do not ignore rest and calcium.', 'हड्डियाँ, घुटने और जोड़। आराम और कैल्शियम की अनदेखी न करें।'] },
  { key: 'kumbh', sym: '♒', n: ['Aquarius', 'कुंभ', 'Kumbha'], el: 2, q: 1,
    nak: ['Dhanishta (3-4)', 'Shatabhisha', 'Purva Bhadrapada (1-3)'],
    letters: ['गू गे गो सा सी सू से सो दा', 'Gu Ge Go Sa Si Su Se So Da'],
    traits: [['Original', 'मौलिक'], ['Humanitarian', 'परोपकारी'], ['Independent', 'स्वतंत्र'], ['Visionary', 'दूरदर्शी']],
    flaws: [['Detached', 'अलग-थलग'], ['Unpredictable', 'अप्रत्याशित']],
    about: ['Kumbh is ruled by Saturn. Natives think differently, value freedom and care for society. They are friendly yet emotionally distant at times.',
            'कुंभ राशि का स्वामी शनि है। ये अलग सोचते हैं, स्वतंत्रता को महत्व देते हैं और समाज की परवाह करते हैं। मिलनसार होते हुए भी कभी-कभी भावनात्मक दूरी रखते हैं।'],
    career: ['Technology, science, social work, astrology, aviation, innovation and NGOs.', 'तकनीक, विज्ञान, समाजसेवा, ज्योतिष, विमानन, नवाचार और एनजीओ।'],
    love: ['Friendship comes first. They need a partner who respects their space.', 'पहले दोस्ती। ऐसा साथी चाहिए जो उनकी आज़ादी का सम्मान करे।'],
    health: ['Circulation, ankles and nerves. Move daily and sleep on time.', 'रक्त संचार, टखने और नसें। रोज़ चलें-फिरें और समय पर सोएँ।'] },
  { key: 'meen', sym: '♓', n: ['Pisces', 'मीन', 'Meena'], el: 3, q: 2,
    nak: ['Purva Bhadrapada (4)', 'Uttara Bhadrapada', 'Revati'],
    letters: ['दी दू थ झ ञ दे दो चा ची', 'Di Du Th Jha Yna De Do Cha Chi'],
    traits: [['Compassionate', 'दयालु'], ['Imaginative', 'कल्पनाशील'], ['Spiritual', 'आध्यात्मिक'], ['Gentle', 'कोमल']],
    flaws: [['Escapist', 'हक़ीक़त से भागने वाले'], ['Over-sensitive', 'अति संवेदनशील']],
    about: ['Meen is ruled by Jupiter. Natives are dreamy, kind and spiritual. They feel the pain of others and love art, music and devotion.',
            'मीन राशि का स्वामी गुरु है। ये स्वप्नशील, दयालु और आध्यात्मिक होते हैं। दूसरों का दुख महसूस करते हैं और कला, संगीत व भक्ति से जुड़े रहते हैं।'],
    career: ['Arts, music, healing, spirituality, film, charity, nursing and marine work.', 'कला, संगीत, उपचार, अध्यात्म, फ़िल्म, दान-सेवा, नर्सिंग और समुद्र से जुड़े काम।'],
    love: ['Selfless and romantic. Choose partners who value their softness.', 'निस्वार्थ और रोमांटिक। ऐसे साथी चुनें जो उनकी कोमलता की क़द्र करें।'],
    health: ['Feet, immunity and sleep. Avoid escapist habits and keep faith.', 'पैर, रोग प्रतिरोधक क्षमता और नींद। पलायन की आदतों से बचें।'] },
];

// Good matches (traditional)
export const RASHI_FRIENDS = [
  [4, 8, 2, 10], [5, 9, 3, 11], [6, 10, 0, 4], [7, 11, 1, 5], [0, 8, 2, 6], [1, 9, 3, 7],
  [2, 10, 4, 8], [3, 11, 5, 9], [0, 4, 6, 10], [1, 5, 7, 11], [2, 6, 0, 8], [3, 7, 1, 9],
];

export const NAKSHATRA = [
  ['Ashwini', 'अश्विनी'], ['Bharani', 'भरणी'], ['Krittika', 'कृत्तिका'], ['Rohini', 'रोहिणी'], ['Mrigashira', 'मृगशिरा'],
  ['Ardra', 'आर्द्रा'], ['Punarvasu', 'पुनर्वसु'], ['Pushya', 'पुष्य'], ['Ashlesha', 'आश्लेषा'], ['Magha', 'मघा'],
  ['Purva Phalguni', 'पूर्व फाल्गुनी'], ['Uttara Phalguni', 'उत्तर फाल्गुनी'], ['Hasta', 'हस्त'], ['Chitra', 'चित्रा'], ['Swati', 'स्वाति'],
  ['Vishakha', 'विशाखा'], ['Anuradha', 'अनुराधा'], ['Jyeshtha', 'ज्येष्ठा'], ['Mula', 'मूल'], ['Purva Ashadha', 'पूर्वाषाढ़ा'],
  ['Uttara Ashadha', 'उत्तराषाढ़ा'], ['Shravana', 'श्रवण'], ['Dhanishta', 'धनिष्ठा'], ['Shatabhisha', 'शतभिषा'],
  ['Purva Bhadrapada', 'पूर्व भाद्रपद'], ['Uttara Bhadrapada', 'उत्तर भाद्रपद'], ['Revati', 'रेवती'],
];

// Vimshottari order of nakshatra lords, repeated 3 times across 27 nakshatras
export const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
export const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };

// Naming syllables for each nakshatra pada (4 per nakshatra, 108 total) — Roman
export const NAK_SYLLABLES = [
  ['chu', 'che', 'cho', 'la'], ['li', 'lu', 'le', 'lo'], ['a', 'i', 'u', 'e'], ['o', 'va', 'vi', 'vu'], ['ve', 'vo', 'ka', 'ki'],
  ['ku', 'gha', 'ng', 'chha'], ['ke', 'ko', 'ha', 'hi'], ['hu', 'he', 'ho', 'da'], ['di', 'du', 'de', 'do'], ['ma', 'mi', 'mu', 'me'],
  ['mo', 'ta', 'ti', 'tu'], ['te', 'to', 'pa', 'pi'], ['pu', 'sha', 'na', 'tha'], ['pe', 'po', 'ra', 'ri'], ['ru', 're', 'ro', 'ta'],
  ['ti', 'tu', 'te', 'to'], ['na', 'ni', 'nu', 'ne'], ['no', 'ya', 'yi', 'yu'], ['ye', 'yo', 'bha', 'bhi'], ['bhu', 'dha', 'pha', 'dha'],
  ['bhe', 'bho', 'ja', 'ji'], ['khi', 'khu', 'khe', 'kho'], ['ga', 'gi', 'gu', 'ge'], ['go', 'sa', 'si', 'su'],
  ['se', 'so', 'da', 'di'], ['du', 'th', 'jha', 'yna'], ['de', 'do', 'cha', 'chi'],
];

export const TITHI = [
  ['Pratipada', 'प्रतिपदा'], ['Dwitiya', 'द्वितीया'], ['Tritiya', 'तृतीया'], ['Chaturthi', 'चतुर्थी'], ['Panchami', 'पंचमी'],
  ['Shashthi', 'षष्ठी'], ['Saptami', 'सप्तमी'], ['Ashtami', 'अष्टमी'], ['Navami', 'नवमी'], ['Dashami', 'दशमी'],
  ['Ekadashi', 'एकादशी'], ['Dwadashi', 'द्वादशी'], ['Trayodashi', 'त्रयोदशी'], ['Chaturdashi', 'चतुर्दशी'], ['Purnima', 'पूर्णिमा'],
];
export const AMAVASYA = ['Amavasya', 'अमावस्या'];
export const YOGA = [
  ['Vishkambha', 'विष्कम्भ'], ['Priti', 'प्रीति'], ['Ayushman', 'आयुष्मान'], ['Saubhagya', 'सौभाग्य'], ['Shobhana', 'शोभन'],
  ['Atiganda', 'अतिगण्ड'], ['Sukarma', 'सुकर्मा'], ['Dhriti', 'धृति'], ['Shula', 'शूल'], ['Ganda', 'गण्ड'],
  ['Vriddhi', 'वृद्धि'], ['Dhruva', 'ध्रुव'], ['Vyaghata', 'व्याघात'], ['Harshana', 'हर्षण'], ['Vajra', 'वज्र'],
  ['Siddhi', 'सिद्धि'], ['Vyatipata', 'व्यतीपात'], ['Variyana', 'वरीयान'], ['Parigha', 'परिघ'], ['Shiva', 'शिव'],
  ['Siddha', 'सिद्ध'], ['Sadhya', 'साध्य'], ['Shubha', 'शुभ'], ['Shukla', 'शुक्ल'], ['Brahma', 'ब्रह्म'],
  ['Indra', 'इन्द्र'], ['Vaidhriti', 'वैधृति'],
];
export const KARANA_REPEAT = [['Bava', 'बव'], ['Balava', 'बालव'], ['Kaulava', 'कौलव'], ['Taitila', 'तैतिल'], ['Gara', 'गर'], ['Vanija', 'वणिज'], ['Vishti (Bhadra)', 'विष्टि (भद्रा)']];
export const KARANA_FIXED = { 0: ['Kimstughna', 'किंस्तुघ्न'], 57: ['Shakuni', 'शकुनि'], 58: ['Chatushpada', 'चतुष्पद'], 59: ['Naga', 'नाग'] };
export const WEEKDAY = [['Sunday', 'रविवार'], ['Monday', 'सोमवार'], ['Tuesday', 'मंगलवार'], ['Wednesday', 'बुधवार'], ['Thursday', 'गुरुवार'], ['Friday', 'शुक्रवार'], ['Saturday', 'शनिवार']];
export const WEEKDAY_LORD = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Force text (not emoji) presentation for zodiac and planet glyphs
RASHI.forEach((r) => { r.sym += '︎'; });
Object.values(PLANETS).forEach((p) => { p.sym += '︎'; });
