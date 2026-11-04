/**
 * Mukta Child Health Hub - Multi-Language Translation Engine
 * Supports English (en - default), Hindi (hi), and Marathi (mr)
 */

const TRANSLATIONS = {
  en: {
    // Navigation & Global
    "brand_title": "Mukta Child Health Hub",
    "brand_subtitle": "A Digital Health Companion",
    "back_to_hub": "← Back to Health Hub",
    "select_child": "Select Child",
    "add_child": "+ Add Child",
    "language": "Language",
    "home": "Home",
    "hospital_name": "Mukta Children Hospital · Amravati",
    "hospital_tagline": "Established 1991 · Dr. Nitin Seth",
    "footer_copy": "© 2026 Mukta Children Hospital, Amravati. All rights reserved.",
    "footer_sub": "Pediatric Healthcare & Comprehensive Child Development",

    // Hero Section
    "hero_badge": "A Digital Health Companion for Parents & Children",
    "hero_title_1": "Mukta Child",
    "hero_title_2": "Health Hub",
    "hero_tagline": "🌱 Little Steps, Healthy Futures!",
    "hero_desc": "Your child's health journey deserves special care. Track growth, manage vaccinations, explore milestones and discover trusted healthcare guidance – all in one happy place.",
    "explore_tools_btn": "🌟 Explore Health Tools",
    "manage_child_btn": "👶 Manage My Child's Health",
    "stat_years": "30+ Years Care",
    "stat_iap": "100% IAP Aligned",
    "stat_families": "15,000+ Happy Families",

    // Profile & Digital Card
    "profile_section_tag": "👶 Little One's Space",
    "profile_section_title": "Let's Get to Know Your Little One!",
    "profile_section_desc": "Add your children to begin their personalized health tracking. Every measurement and vaccine is safely linked to their unique profile.",
    "no_child_selected": "No Child Selected",
    "add_child_prompt": "Please add or select a child profile to get started.",
    "digital_health_card_title": "Official Digital Child Health Card",
    "uhid_label": "UHID / Registration ID",
    "dob_label": "Date of Birth",
    "age_label": "Age",
    "gender_label": "Gender",
    "blood_group_label": "Blood Group",
    "pediatrician_label": "Primary Pediatrician",
    "doctor_name": "Dr. Nitin Seth (MD, DCH)",

    // Features Section
    "tools_suite_tag": "🌟 Pediatric Tools Suite",
    "tools_suite_title": "Explore Dedicated Health Tools",
    "tools_suite_desc": "Click any tool below to open its dedicated page with focused, clutter-free tracking.",
    "card_growth_title": "Growth & BMI Calculator",
    "card_growth_desc": "Log height, weight, and head circumference. View interactive WHO growth percentiles, delta change comparisons, and progression trends.",
    "card_growth_btn": "Open Growth Calculator →",
    "card_vaccine_title": "Vaccination Tracker",
    "card_vaccine_desc": "Personalized schedule following official Indian Academy of Pediatrics (IAP) recommendations. Mark completed doses and view overdue alerts.",
    "card_vaccine_btn": "Open Vaccine Tracker →",
    "card_milestones_title": "Development Milestones",
    "card_milestones_desc": "Track 40+ motor, cognitive, speech, and social milestones from birth to 5 years with evidence-based pediatric guidance.",
    "card_milestones_btn": "Explore Milestones →",
    "card_history_title": "Health Records & History",
    "card_history_desc": "Complete timeline of all visits, prescriptions, growth charts, and immunization receipts in one secure digital record.",
    "card_history_btn": "View Health History →",
    "card_knowledge_title": "Parenting Knowledge Centre",
    "card_knowledge_desc": "Curated doctor-approved articles on newborn care, weaning nutrition, sleep routines, childhood safety, and fever protocols.",
    "card_knowledge_btn": "Read Parenting Articles →",
    "card_admin_title": "Doctor & Hospital Portal",
    "card_admin_desc": "Clinical dashboard for pediatricians to monitor registered child patients, prescribe vaccine reminders, and inspect logs.",
    "card_admin_btn": "Open Doctor Portal →",

    // Vaccination Tracker Page
    "vaccine_page_tag": "💉 Immunization Schedule",
    "vaccine_page_title": "Vaccination Tracker",
    "vaccine_page_desc": "Stay on top of your child's vaccinations with a personalized schedule aligned with the latest Indian Academy of Pediatrics (IAP) recommendations.",
    "filter_status_label": "Filter Status:",
    "filter_all": "All Doses",
    "filter_upcoming": "⏰ Upcoming",
    "filter_completed": "✅ Completed",
    "filter_overdue": "⚠️ Overdue",
    "export_csv_btn": "📥 Export Schedule (CSV)",
    "stat_total_doses": "Total IAP Doses",
    "stat_completed_doses": "Completed ✅",
    "stat_upcoming_doses": "Upcoming ⏰",
    "stat_overdue_doses": "Overdue ⚠️",
    "col_given": "Given?",
    "col_milestone": "Age / Milestone",
    "col_vaccines": "Vaccines Recommended",
    "col_diseases": "Diseases Protected Against",
    "col_status": "Status",
    "status_given": "✅ Given",
    "status_pending": "⏰ Pending",

    // Growth Calculator Page
    "growth_page_tag": "📈 Growth & Nutrition",
    "growth_page_title": "Growth & BMI Calculator",
    "growth_page_desc": "Monitor height, weight, and head circumference percentiles mapped against World Health Organization (WHO) standards.",
    "log_growth_heading": "Log New Measurement",
    "measurement_date": "Measurement Date",
    "height_cm": "Height (cm)",
    "weight_kg": "Weight (kg)",
    "head_circ_cm": "Head Circumference (cm)",
    "save_measurement_btn": "Save Measurement",
    "growth_history_heading": "Measurement History & WHO Percentiles",
    "bmi_title": "BMI Category",
    "delta_title": "Delta from Last Visit",

    // Milestones Page
    "milestones_page_tag": "🌱 Growth Journey",
    "milestones_page_title": "Development Milestones",
    "milestones_page_desc": "Discover and celebrate your child's developmental milestones across motor, speech, cognitive, and social domains.",
    "milestone_achieved": "Achieved",
    "milestone_pending": "Pending",

    // Health History Page
    "history_page_tag": "📋 Clinical Records",
    "history_page_title": "Health Records & History",
    "history_page_desc": "Comprehensive chronological record of growth measurements, vaccinations, and pediatric consultations.",
    "download_report_btn": "📄 Download / Print Report",
    "export_json_btn": "📥 Export Data (JSON)",

    // Knowledge Centre Page
    "knowledge_page_tag": "📚 Doctor's Library",
    "knowledge_page_title": "Parenting Knowledge Centre",
    "knowledge_page_desc": "Trusted, medically-verified guidance written by Dr. Nitin Seth and Mukta Children Hospital pediatric specialists.",

    // Doctor Admin Page
    "admin_page_tag": "🩺 Clinical Portal",
    "admin_page_title": "Doctor & Hospital Staff Portal",
    "admin_page_desc": "Secure portal for pediatrician clinical access, vaccine management, and patient record review.",
    "admin_login_title": "Doctor Verification",
    "admin_login_prompt": "Please enter clinical security password to unlock patient records:",
    "admin_unlock_btn": "Unlock Dashboard",
    "admin_search_placeholder": "🔍 Search child name or UHID...",

    // Modal & Form Labels
    "modal_add_child_title": "Register Child Profile",
    "form_child_name": "Full Name of Child *",
    "form_dob": "Date of Birth *",
    "form_gender": "Gender *",
    "form_gender_male": "👦 Boy",
    "form_gender_female": "👧 Girl",
    "form_blood_group": "Blood Group",
    "form_save_btn": "Save Child Profile",
    "form_cancel_btn": "Cancel"
  },

  hi: {
    // Navigation & Global
    "brand_title": "मुक्ता बाल स्वास्थ्य केंद्र",
    "brand_subtitle": "एक डिजिटल बाल स्वास्थ्य साथी",
    "back_to_hub": "← मुख्य केंद्र पर वापस जाएं",
    "select_child": "बच्चा चुनें",
    "add_child": "+ बच्चा जोड़ें",
    "language": "भाषा",
    "home": "होम",
    "hospital_name": "मुक्ता चिल्ड्रन्स हॉस्पिटल · अमरावती",
    "hospital_tagline": "स्थापना 1991 · डॉ. नितिन सेठ",
    "footer_copy": "© 2026 मुक्ता चिल्ड्रन्स हॉस्पिटल, अमरावती. सर्वाधिकार सुरक्षित।",
    "footer_sub": "शिशु रोग विशेषज्ञ देखभाल और संपूर्ण बाल विकास",

    // Hero Section
    "hero_badge": "माता-पिता और बच्चों के लिए एक डिजिटल स्वास्थ्य साथी",
    "hero_title_1": "मुक्ता बाल",
    "hero_title_2": "स्वास्थ्य केंद्र",
    "hero_tagline": "🌱 नन्हें कदम, स्वस्थ भविष्य!",
    "hero_desc": "आपके बच्चे की स्वास्थ्य यात्रा विशेष देखभाल की हकदार है। विकास ट्रैक करें, टीकाकरण प्रबंधित करें, मील के पत्थर देखें और विश्वसनीय बाल चिकित्सा सलाह पाएं - सब एक ही स्थान पर।",
    "explore_tools_btn": "🌟 स्वास्थ्य उपकरण देखें",
    "manage_child_btn": "👶 बच्चे का स्वास्थ्य प्रबंधित करें",
    "stat_years": "30+ वर्षों की सेवा",
    "stat_iap": "100% IAP अनुमोदित",
    "stat_families": "15,000+ खुशहाल परिवार",

    // Profile & Digital Card
    "profile_section_tag": "👶 नन्हें बच्चे का स्थान",
    "profile_section_title": "आइए आपके बच्चे को जानें!",
    "profile_section_desc": "व्यक्तिगत स्वास्थ्य ट्रैकिंग शुरू करने के लिए अपने बच्चे को जोड़ें। हर माप और टीका उनकी विशिष्ट प्रोफ़ाइल से सुरक्षित रूप से जुड़ा है।",
    "no_child_selected": "कोई बच्चा नहीं चुना गया",
    "add_child_prompt": "शुरू करने के लिए कृपया बच्चे की प्रोफ़ाइल जोड़ें या चुनें।",
    "digital_health_card_title": "आधिकारिक डिजिटल बाल स्वास्थ्य कार्ड",
    "uhid_label": "यूएचआईडी / पंजीकरण संख्या",
    "dob_label": "जन्म तिथि",
    "age_label": "आयु",
    "gender_label": "लिंग",
    "blood_group_label": "रक्त समूह",
    "pediatrician_label": "मुख्य बाल रोग विशेषज्ञ",
    "doctor_name": "डॉ. नितिन सेठ (एमडी, डीसीएच)",

    // Features Section
    "tools_suite_tag": "🌟 बाल स्वास्थ्य उपकरण",
    "tools_suite_title": "समर्पित स्वास्थ्य उपकरण देखें",
    "tools_suite_desc": "विशिष्ट और स्पष्ट ट्रैकिंग के लिए नीचे दिए गए किसी भी उपकरण पर क्लिक करें।",
    "card_growth_title": "विकास और बीएमआई कैलकुलेटर",
    "card_growth_desc": "ऊंचाई, वजन और सिर की परिधि दर्ज करें। डब्ल्यूएचओ मानक और वृद्धि रुझान देखें।",
    "card_growth_btn": "विकास कैलकुलेटर खोलें →",
    "card_vaccine_title": "टीकाकरण ट्रैकर",
    "card_vaccine_desc": "इंडियन एकेडमी ऑफ पीडियाट्रिक्स (IAP) के अनुसार व्यक्तिगत टीकाकरण समय सारिणी।",
    "card_vaccine_btn": "टीकाकरण ट्रैकर खोलें →",
    "card_milestones_title": "विकास के मील के पत्थर",
    "card_milestones_desc": "जन्म से 5 वर्ष तक शारीरिक, मानसिक और भाषा विकास के 40+ मील के पत्थर ट्रैक करें।",
    "card_milestones_btn": "मील के पत्थर देखें →",
    "card_history_title": "स्वास्थ्य रिकॉर्ड और इतिहास",
    "card_history_desc": "सभी विज़िट, पर्चे, विकास चार्ट और टीकाकरण पर्चियों का संपूर्ण डिजिटल रिकॉर्ड।",
    "card_history_btn": "स्वास्थ्य इतिहास देखें →",
    "card_knowledge_title": "अभिभावक ज्ञान केंद्र",
    "card_knowledge_desc": "नवजात शिशु देखभाल, पोषण, नींद और बुखार संबंधी डॉक्टर द्वारा अनुमोदित लेख।",
    "card_knowledge_btn": "ज्ञानवर्धक लेख पढ़ें →",
    "card_admin_title": "डॉक्टर और अस्पताल पोर्टल",
    "card_admin_desc": "बाल रोग विशेषज्ञों के लिए पंजीकृत बच्चों की निगरानी और रिकॉर्ड जांच का पोर्टल।",
    "card_admin_btn": "डॉक्टर पोर्टल खोलें →",

    // Vaccination Tracker Page
    "vaccine_page_tag": "💉 टीकाकरण अनुसूची",
    "vaccine_page_title": "टीकाकरण ट्रैकर",
    "vaccine_page_desc": "भारतीय बाल चिकित्सा अकादमी (IAP) की सिफारिशों के अनुरूप टीकाकरण कार्यक्रम से अपडेट रहें।",
    "filter_status_label": "स्थिति फ़िल्टर:",
    "filter_all": "सभी खुराक",
    "filter_upcoming": "⏰ आगामी",
    "filter_completed": "✅ पूर्ण",
    "filter_overdue": "⚠️ अतिदेय",
    "export_csv_btn": "📥 अनुसूची डाउनलोड करें (CSV)",
    "stat_total_doses": "कुल IAP खुराक",
    "stat_completed_doses": "पूर्ण ✅",
    "stat_upcoming_doses": "आगामी ⏰",
    "stat_overdue_doses": "अतिदेय ⚠️",
    "col_given": "दिया गया?",
    "col_milestone": "आयु / मील का पत्थर",
    "col_vaccines": "अनुशंसित टीके",
    "col_diseases": "किन बीमारियों से सुरक्षा",
    "col_status": "स्थिति",
    "status_given": "✅ दिया गया",
    "status_pending": "⏰ लंबित",

    // Growth Calculator Page
    "growth_page_tag": "📈 विकास और पोषण",
    "growth_page_title": "विकास और बीएमआई कैलकुलेटर",
    "growth_page_desc": "विश्व स्वास्थ्य संगठन (WHO) मानकों के अनुसार ऊंचाई, वजन और बीएमआई की निगरानी करें।",
    "log_growth_heading": "नया माप दर्ज करें",
    "measurement_date": "माप की तारीख",
    "height_cm": "ऊंचाई (सेमी)",
    "weight_kg": "वजन (किलो)",
    "head_circ_cm": "सिर की परिधि (सेमी)",
    "save_measurement_btn": "माप सहेजें",
    "growth_history_heading": "माप इतिहास और डब्ल्यूएचओ प्रतिशतक",
    "bmi_title": "बीएमआई श्रेणी",
    "delta_title": "पिछली विज़िट से अंतर",

    // Milestones Page
    "milestones_page_tag": "🌱 विकास यात्रा",
    "milestones_page_title": "विकास के मील के पत्थर",
    "milestones_page_desc": "अपने बच्चे के शारीरिक, संवाद और सामाजिक विकास के मील के पत्थरों को ट्रैक करें।",
    "milestone_achieved": "प्राप्त",
    "milestone_pending": "लंबित",

    // Health History Page
    "history_page_tag": "📋 नैदानिक रिकॉर्ड",
    "history_page_title": "स्वास्थ्य रिकॉर्ड और इतिहास",
    "history_page_desc": "विकास माप, टीकाकरण और बाल रोग विशेषज्ञ परामर्श का व्यापक कालानुक्रमिक रिकॉर्ड।",
    "download_report_btn": "📄 रिपोर्ट प्रिंट / डाउनलोड करें",
    "export_json_btn": "📥 डेटा निर्यात करें (JSON)",

    // Knowledge Centre Page
    "knowledge_page_tag": "📚 डॉक्टर की लाइब्रेरी",
    "knowledge_page_title": "अभिभावक ज्ञान केंद्र",
    "knowledge_page_desc": "डॉ. नितिन सेठ और मुक्ता चिल्ड्रन्स हॉस्पिटल के बाल रोग विशेषज्ञों द्वारा लिखित सलाह।",

    // Doctor Admin Page
    "admin_page_tag": "🩺 क्लिनिकल पोर्टल",
    "admin_page_title": "डॉक्टर और स्टाफ पोर्टल",
    "admin_page_desc": "बाल रोग विशेषज्ञों के लिए रोगी रिकॉर्ड और टीकाकरण प्रबंधन का सुरक्षित पोर्टल।",
    "admin_login_title": "डॉक्टर सत्यापन",
    "admin_login_prompt": "रोगी रिकॉर्ड अनलॉक करने के लिए कृपया सुरक्षा पासवर्ड दर्ज करें:",
    "admin_unlock_btn": "डैशबोर्ड अनलॉक करें",
    "admin_search_placeholder": "🔍 बच्चे का नाम या यूएचआईडी खोजें...",

    // Modal & Form Labels
    "modal_add_child_title": "बच्चे की प्रोफ़ाइल पंजीकृत करें",
    "form_child_name": "बच्चे का पूरा नाम *",
    "form_dob": "जन्म तिथि *",
    "form_gender": "लिंग *",
    "form_gender_male": "👦 लड़का",
    "form_gender_female": "👧 लड़की",
    "form_blood_group": "रक्त समूह",
    "form_save_btn": "प्रोफ़ाइल सहेजें",
    "form_cancel_btn": "रद्द करें"
  },

  mr: {
    // Navigation & Global
    "brand_title": "मुक्ता बाल आरोग्य केंद्र",
    "brand_subtitle": "एक डिजिटल बाल आरोग्य साथी",
    "back_to_hub": "← मुख्य केंद्रावर परत जा",
    "select_child": "मूल निवडा",
    "add_child": "+ मूल जोडा",
    "language": "भाषा",
    "home": "मुख्यपृष्ठ",
    "hospital_name": "मुक्ता चिल्ड्रन्स हॉस्पिटल · अमरावती",
    "hospital_tagline": "स्थापना 1991 · डॉ. नितीन सेठ",
    "footer_copy": "© 2026 मुक्ता चिल्ड्रन्स हॉस्पिटल, अमरावती. सर्व हक्क राखीव.",
    "footer_sub": "बालरोगतज्ज्ञ काळजी आणि सर्वांगीण बाल विकास",

    // Hero Section
    "hero_badge": "पालक आणि मुलांसाठी एक डिजिटल आरोग्य साथी",
    "hero_title_1": "मुक्ता बाल",
    "hero_title_2": "आरोग्य केंद्र",
    "hero_tagline": "🌱 लहान पावले, निरोगी भविष्य!",
    "hero_desc": "तुमच्या बाळाचा आरोग्य प्रवास विशेष काळजीस पात्र आहे. बाळाची वाढ नोंदवा, लसीकरण व्यवस्थापित करा, विकासाचे टप्पे जाणून घ्या आणि विश्वासार्ह बालरोग सल्ला मिळवा - सर्व एकाच ठिकाणी.",
    "explore_tools_btn": "🌟 आरोग्य साधने पहा",
    "manage_child_btn": "👶 बाळाचे आरोग्य व्यवस्थापित करा",
    "stat_years": "30+ वर्षांची सेवा",
    "stat_iap": "100% IAP मान्यताप्राप्त",
    "stat_families": "15,000+ समाधानी कुटुंबे",

    // Profile & Digital Card
    "profile_section_tag": "👶 बाळाची जागा",
    "profile_section_title": "चला तुमच्या बाळाला जाणून घेऊया!",
    "profile_section_desc": "वैयक्तिक आरोग्य ट्रॅकिंग सुरू करण्यासाठी आपल्या बाळाची माहिती जोडा. प्रत्येक मोजमाप आणि लस त्यांच्या डिजिटल प्रोफाइलशी सुरक्षित जोडली जाईल.",
    "no_child_selected": "कोणतेही मूल निवडलेले नाही",
    "add_child_prompt": "सुरू करण्यासाठी कृपया बाळाची माहिती जोडा किंवा निवडा.",
    "digital_health_card_title": "अधिकृत डिजिटल बाल आरोग्य कार्ड",
    "uhid_label": "UHID / नोंदणी क्रमांक",
    "dob_label": "जन्मतारीख",
    "age_label": "वय",
    "gender_label": "लिंग",
    "blood_group_label": "रक्तगट",
    "pediatrician_label": "प्रमुख बालरोगतज्ज्ञ",
    "doctor_name": "डॉ. नितीन सेठ (एमडी, डीसीएच)",

    // Features Section
    "tools_suite_tag": "🌟 बाल आरोग्य साधने",
    "tools_suite_title": "समर्पित आरोग्य साधने एक्सप्लोर करा",
    "tools_suite_desc": "सुलभ आणि अचूक ट्रॅकिंगसाठी खालीलपैकी कोणत्याही साधनावर क्लिक करा.",
    "card_growth_title": "वाढ आणि बीएमआय कॅल्क्युलेटर",
    "card_growth_desc": "उंची, वजन आणि डोक्याचा घेर नोंदवा. WHO मानके आणि विकासाचे आलेख पहा.",
    "card_growth_btn": "वाढ कॅल्क्युलेटर उघडा →",
    "card_vaccine_title": "लसीकरण ट्रॅकर",
    "card_vaccine_desc": "इंडियन अकॅडमी ऑफ पेडियाट्रिक्स (IAP) च्या शिफारशींनुसार वैयक्तिक लसीकरण वेळापत्रक.",
    "card_vaccine_btn": "लसीकरण ट्रॅकर उघडा →",
    "card_milestones_title": "विकासाचे टप्पे (माईलस्टोन्स)",
    "card_milestones_desc": "जन्मापासून ५ वर्षांपर्यंत शारीरिक, बौद्धिक आणि भाषिक विकासाचे ४०+ टप्पे ट्रॅक करा.",
    "card_milestones_btn": "विकासाचे टप्पे पहा →",
    "card_history_title": "आरोग्य नोंदी आणि इतिहास",
    "card_history_desc": "सर्व भेटी, औषधे, वाढीचे आलेख आणि लसीकरण नोंदींचा सुरक्षित डिजिटल इतिहास.",
    "card_history_btn": "आरोग्य इतिहास पहा →",
    "card_knowledge_title": "पालकत्व ज्ञान केंद्र",
    "card_knowledge_desc": "नवजात बाळाची काळजी, आहार, झोप आणि तापावरील डॉक्टरांनी प्रमाणित केलेले मार्गदर्शन.",
    "card_knowledge_btn": "मार्गदर्शन लेख वाचा →",
    "card_admin_title": "डॉक्टर आणि रुग्णालय पोर्टल",
    "card_admin_desc": "बालरोगतज्ज्ञांसाठी नोंदणीकृत बाल रुग्णांचे निरीक्षण आणि नोंदी तपासण्याचे पोर्टल.",
    "card_admin_btn": "डॉक्टर पोर्टल उघडा →",

    // Vaccination Tracker Page
    "vaccine_page_tag": "💉 लसीकरण वेळापत्रक",
    "vaccine_page_title": "लसीकरण ट्रॅकर",
    "vaccine_page_desc": "इंडियन अकॅडमी ऑफ पेडियाट्रिक्स (IAP) च्या शिफारशींनुसार बाळाच्या लसीकरणाची अद्ययावत माहिती ठेवा.",
    "filter_status_label": "स्थिती फिल्टर:",
    "filter_all": "सर्व डोस",
    "filter_upcoming": "⏰ आगामी",
    "filter_completed": "✅ पूर्ण झाले",
    "filter_overdue": "⚠️ उशीर झालेले",
    "export_csv_btn": "📥 वेळापत्रक डाउनलोड करा (CSV)",
    "stat_total_doses": "एकूण IAP डोस",
    "stat_completed_doses": "पूर्ण झाले ✅",
    "stat_upcoming_doses": "आगामी ⏰",
    "stat_overdue_doses": "उशीर झालेले ⚠️",
    "col_given": "दिली का?",
    "col_milestone": "वय / टप्पा",
    "col_vaccines": "शिफारस केलेल्या लसी",
    "col_diseases": "कोणत्या आजारांपासून संरक्षण",
    "col_status": "स्थिती",
    "status_given": "✅ दिली आहे",
    "status_pending": "⏰ बाकी आहे",

    // Growth Calculator Page
    "growth_page_tag": "📈 वाढ आणि पोषण",
    "growth_page_title": "वाढ आणि बीएमआय कॅल्क्युलेटर",
    "growth_page_desc": "जागतिक आरोग्य संघटना (WHO) मानकांनुसार उंची, वजन आणि बीएमआयचे निरीक्षण करा.",
    "log_growth_heading": "नवीन मोजमाप नोंदवा",
    "measurement_date": "मोजमाप तारीख",
    "height_cm": "उंची (सेंटीमीटर)",
    "weight_kg": "वजन (किलोग्रॅम)",
    "head_circ_cm": "डोक्याचा घेर (सेंटीमीटर)",
    "save_measurement_btn": "मोजमाप जतन करा",
    "growth_history_heading": "मोजमाप इतिहास आणि WHO आलेख",
    "bmi_title": "बीएमआय श्रेणी",
    "delta_title": "मागील भेटीपासूनचा फरक",

    // Milestones Page
    "milestones_page_tag": "🌱 विकास प्रवास",
    "milestones_page_title": "विकासाचे टप्पे (माईलस्टोन्स)",
    "milestones_page_desc": "आपल्या बाळाच्या शारीरिक, भाषिक आणि सामाजिक विकासाच्या टप्प्यांचा मागोवा घ्या.",
    "milestone_achieved": "पूर्ण झाले",
    "milestone_pending": "बाकी आहे",

    // Health History Page
    "history_page_tag": "📋 वैद्यकीय नोंदी",
    "history_page_title": "आरोग्य नोंदी आणि इतिहास",
    "history_page_desc": "वाढीची मोजमापे, लसीकरण आणि बालरोग सल्लामसलतीचा संपूर्ण डिजिटल इतिहास.",
    "download_report_btn": "📄 अहवाल प्रिंट / डाउनलोड करा",
    "export_json_btn": "📥 डेटा डाउनलोड करा (JSON)",

    // Knowledge Centre Page
    "knowledge_page_tag": "📚 डॉक्टरांची लायब्ररी",
    "knowledge_page_title": "पालकत्व ज्ञान केंद्र",
    "knowledge_page_desc": "डॉ. नितीन सेठ आणि मुक्ता चिल्ड्रन्स हॉस्पिटलच्या तज्ज्ञ डॉक्टरांनी तयार केलेले मार्गदर्शन.",

    // Doctor Admin Page
    "admin_page_tag": "🩺 क्लिनिकल पोर्टल",
    "admin_page_title": "डॉक्टर आणि स्टाफ पोर्टल",
    "admin_page_desc": "बालरोगतज्ज्ञांसाठी बाल रुग्णांचे रेकॉर्ड आणि लसीकरण व्यवस्थापनाचे सुरक्षित पोर्टल.",
    "admin_login_title": "डॉक्टर पडताळणी",
    "admin_login_prompt": "रुग्ण रेकॉर्ड उघडण्यासाठी कृपया सुरक्षा पासवर्ड प्रविष्ट करा:",
    "admin_unlock_btn": "डॅशबोर्ड उघडा",
    "admin_search_placeholder": "🔍 बाळाचे नाव किंवा UHID शोधा...",

    // Modal & Form Labels
    "modal_add_child_title": "बाळाची माहिती नोंदवा",
    "form_child_name": "बाळाचे पूर्ण नाव *",
    "form_dob": "जन्मतारीख *",
    "form_gender": "लिंग *",
    "form_gender_male": "👦 मुलगा",
    "form_gender_female": "👧 मुलगी",
    "form_blood_group": "रक्तगट",
    "form_save_btn": "माहिती जतन करा",
    "form_cancel_btn": "रद्द करा"
  }
};

// Current language - default to English
let currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('mukta_language')) ? localStorage.getItem('mukta_language') : 'en';

// Helper to get translated string
function t(key, fallback = '') {
  if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) {
    return TRANSLATIONS[currentLang][key];
  }
  if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
    return TRANSLATIONS['en'][key];
  }
  return fallback || key;
}

// Function to switch language
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = 'en';
  currentLang = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mukta_language', lang);
  }
  applyTranslations();
  
  if (typeof document !== 'undefined') {
    // Update all language selector buttons/dropdowns on the page
    document.querySelectorAll('.lang-select-btn').forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const langSelect = document.getElementById('mukta-lang-dropdown');
    if (langSelect) langSelect.value = lang;
  }

  // Dispatch custom event for dynamic modules (vaccines, growth, etc.)
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }
}

// Apply translations to all DOM elements with data-i18n
function applyTranslations() {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (translation) {
      el.textContent = translation;
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const translation = t(key);
    if (translation) {
      el.innerHTML = translation;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (translation) {
      el.setAttribute('placeholder', translation);
    }
  });

  // Update html lang attribute
  if (document.documentElement) {
    document.documentElement.lang = currentLang;
  }
}

// Initialize on DOMContentLoaded if in browser
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    
    document.querySelectorAll('.lang-select-btn').forEach(btn => {
      if (btn.dataset.lang === currentLang) {
        btn.classList.add('active');
      }
    });

    const langSelect = document.getElementById('mukta-lang-dropdown');
    if (langSelect) langSelect.value = currentLang;
  });
}

// Expose globally
if (typeof window !== 'undefined') {
  window.t = t;
  window.setLanguage = setLanguage;
  window.currentLang = currentLang;
  window.applyTranslations = applyTranslations;
}

// Node environment export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRANSLATIONS, t, setLanguage, applyTranslations };
}
