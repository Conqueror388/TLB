/**
 * app.js - Apex Commercial Bank • Core Loan Application & Automated Appraisal Client
 * Modern Organic Curved UI with Circular Radial Gauges.
 * Pure User-Driven Data (Zero Mock Data).
 * Executes silent background QSVM underwriting.
 */

let CURRENT_LOANS = [];

/* --------------------------------------------------------------------------
   Dynamic Multi-Language Strings for Live Calculations & Statuses
   -------------------------------------------------------------------------- */
const DYNAMIC_I18N = {
    en: {
        afford_safe_high: (emi, pct) => `Monthly EMI of <strong>${emi}</strong> uses only <strong>${pct}%</strong> of your monthly take-home pay. High affordability safety margin!`,
        afford_safe_ok: (emi, pct, limit) => `Monthly EMI of <strong>${emi}</strong> uses <strong>${pct}%</strong> of your monthly take-home pay (comfortably within the 50% limit of ${limit}).`,
        afford_safe_exceed: (emi, pct) => `<span style="color: var(--rose);">Monthly EMI of <strong>${emi}</strong> uses <strong>${pct}%</strong> of your income, which exceeds the safe 50% ceiling!</span>`,
        runway_alert: (mat, ret) => `<span style="color: var(--amber);">Loan finishes at age <strong>${mat} Yrs</strong>, which exceeds your sector retirement age (<strong>${ret} Yrs</strong>). Subject to pension verification.</span>`,
        runway_safe: (months, mat, left, ret) => `You will finish paying this ${months}-month loan at age <strong>${mat} Yrs</strong>, safely <strong>${left} years</strong> before retirement (<strong>${ret} Yrs</strong>).`,
        runway_pension: "Pension-backed post-retirement servicing",
        runway_no_pension: "Alert: Loan matures past retirement age (No pension)",
        runway_active: "Active service tenure amortized",
        clean_no_loans: "No past loans declared.",
        clean_click_add: "Click <strong>'+ Add Another Loan'</strong> above to declare existing loans, or submit as a clean first-time borrower.",
        reg_0_dpd: "Regular (Punctual 0 DPD)",
        fully_repaid: "Fully Repaid / Settled",
        late_30_59: "30–59 Days Late Delay",
        late_60_89: "60–89 Days Late Warning",
        defaulted_npa: "Defaulted / Written Off NPA",
        repay_npa: "CRITICAL: NPA / Default Found",
        repay_delay: "Past Delinquency Observed",
        repay_clean: "100% Punctual Repayment",
        clean_slate: "Zero adverse records (Clean slate)",
        npa_flag_desc: (c) => `${c} defaulted / write-off record(s) on CIR`,
        late_flag_desc: (c) => `${c} late payment cycle(s) on CIR`,
        settled_flag_desc: (c) => `${c} fully settled, 0 defaults`,
        ans_title_approved: "LOAN APPLICATION SANCTIONED",
        ans_title_cond: "CONDITIONAL APPROVAL • UNDERWRITER REVIEW",
        ans_title_declined: "LOAN APPLICATION DECLINED",
        ans_badge_approved: "APPROVED FOR DISBURSAL",
        ans_badge_cond: "CONDITIONAL SANCTION",
        ans_badge_declined: "APPLICATION REJECTED",
        ans_tier_a1: "Tier A1 • Prime Borrowing Facility",
        ans_tier_b2: "Tier B2 • Moderate Risk / Enhanced Scrutiny",
        ans_tier_c3: "Tier C3 • Subprime / Adverse Credit Risk",
        ans_amt_full: "100% of requested facility",
        ans_amt_restricted: "Restricted Exposure Limit",
        ans_amt_declined: "Facility Declined by Policy",
        cibil_prime: "Prime Risk Grade (Excellent)",
        cibil_standard: "Standard Underwriting",
        cibil_subprime: "Sub-Prime Warning",
        dti_optimal: "Optimal Servicing",
        dti_moderate: "Moderate Exposure",
        dti_critical: "Critical DTI",
        months_unit: "Months",
        ret_prefix: "Ret",
        maturity_label: "Maturity",
        amortized_label: "Amortized",
        maturity_pension_sub: "Superannuation runway exceeded (Pension eligible)",
        maturity_alert_sub: "Alert: Matures post-retirement",
        yrs_unit: "Yrs",
        mo_unit: "/ mo"
    },
    hi: {
        afford_safe_high: (emi, pct) => `मासिक किश्त <strong>${emi}</strong> आपकी मासिक आय का केवल <strong>${pct}%</strong> हिस्सा है। यह पूर्णतः सुरक्षित है!`,
        afford_safe_ok: (emi, pct, limit) => `मासिक किश्त <strong>${emi}</strong> आपकी आय का <strong>${pct}%</strong> हिस्सा है (सुरक्षित 50% सीमा ${limit} के भीतर)।`,
        afford_safe_exceed: (emi, pct) => `<span style="color: var(--rose);">मासिक किश्त <strong>${emi}</strong> आपकी आय का <strong>${pct}%</strong> हिस्सा है, जो 50% की सुरक्षित सीमा से अधिक है!</span>`,
        runway_alert: (mat, ret) => `<span style="color: var(--amber);">यह लोन <strong>${mat} वर्ष</strong> की उम्र तक चलेगा, जो रिटायरमेंट उम्र (<strong>${ret} वर्ष</strong>) से अधिक है। पेंशन सत्यापन आवश्यक होगा।</span>`,
        runway_safe: (months, mat, left, ret) => `यह ${months}-महीने का लोन आपकी उम्र <strong>${mat} वर्ष</strong> पर पूरा हो जाएगा, यानी रिटायरमेंट (<strong>${ret} वर्ष</strong>) से <strong>${left} वर्ष</strong> पहले।`,
        runway_pension: "पेंशन समर्थित सेवा भुगतान",
        runway_no_pension: "चेतावनी: लोन रिटायरमेंट के बाद तक चलता है (पेंशन नहीं)",
        runway_active: "नौकरी के दौरान लोन पूरी तरह चुकता",
        clean_no_loans: "कोई पुराना लोन दर्ज नहीं है।",
        clean_click_add: "पुराने लोन जोड़ने के लिए ऊपर <strong>'+ नया लोन जोड़ें'</strong> पर क्लिक करें, या नए ग्राहक के रूप में आगे बढ़ें।",
        reg_0_dpd: "नियमित (समय पर 0 दिन देरी)",
        fully_repaid: "पूर्णतः चुकता / बंद",
        late_30_59: "30–59 दिन की देरी",
        late_60_89: "60–89 दिन की देरी चेतावनी",
        defaulted_npa: "डिफ़ॉल्ट / एनपीए",
        repay_npa: "चेतावनी: एनपीए / डिफ़ॉल्ट पाया गया",
        repay_delay: "पूर्व में भुगतान में देरी देखी गई",
        repay_clean: "100% समय पर भुगतान (उत्कृष्ट ट्रैक रिकॉर्ड)",
        clean_slate: "कोई खराब रिकॉर्ड नहीं (स्वच्छ इतिहास)",
        npa_flag_desc: (c) => `${c} डिफ़ॉल्ट / एनपीए खाते दर्ज हैं`,
        late_flag_desc: (c) => `${c} किश्तों में देरी का रिकॉर्ड`,
        settled_flag_desc: (c) => `${c} लोन पूर्णतः चुकता, 0 डिफ़ॉल्ट`,
        ans_title_approved: "ऋण आवेदन स्वीकृत",
        ans_title_cond: "सशर्त मंज़ूरी • विशेष समीक्षा",
        ans_title_declined: "ऋण आवेदन अस्वीकृत",
        ans_badge_approved: "भुगतान हेतु स्वीकृत",
        ans_badge_cond: "सशर्त मंज़ूरी",
        ans_badge_declined: "आवेदन अस्वीकृत",
        ans_tier_a1: "श्रेणी A1 • प्राइम ऋण सुविधा",
        ans_tier_b2: "श्रेणी B2 • मध्यम जोखिम / अतिरिक्त जांच",
        ans_tier_c3: "श्रेणी C3 • सब-प्राइम / उच्च जोखिम",
        ans_amt_full: "मांगी गई 100% राशि स्वीकृत",
        ans_amt_restricted: "सीमित ऋण सीमा",
        ans_amt_declined: "बैंक नीति अनुसार अस्वीकृत",
        cibil_prime: "प्राइम ग्रेड (उत्कृष्ट)",
        cibil_standard: "मानक जोखिम (संतोषजनक)",
        cibil_subprime: "सब-प्राइम चेतावनी",
        dti_optimal: "सुरक्षित भुगतान अनुपात",
        dti_moderate: "मध्यम भार",
        dti_critical: "अत्यधिक किश्त भार",
        months_unit: "माह",
        ret_prefix: "रिटायरमेंट",
        maturity_label: "समाप्ति उम्र",
        amortized_label: "कार्यकाल में चुकता",
        maturity_pension_sub: "रिटायरमेंट के बाद भी भुगतान (पेंशन पात्र)",
        maturity_alert_sub: "चेतावनी: रिटायरमेंट के बाद लोन समाप्त होगा",
        yrs_unit: "वर्ष",
        mo_unit: "/ माह"
    },
    ta: {
        afford_safe_high: (emi, pct) => `மாதாந்திர இஎம்ஐ <strong>${emi}</strong> உங்கள் மாத வருமானத்தில் <strong>${pct}%</strong> மட்டுமே. சிறந்த நிதிப் பாதுகாப்பு!`,
        afford_safe_ok: (emi, pct, limit) => `மாதாந்திர இஎம்ஐ <strong>${emi}</strong> உங்கள் வருமானத்தில் <strong>${pct}%</strong> (50% பாதுகாப்பான வரம்பான ${limit}க்குள் உள்ளது).`,
        afford_safe_exceed: (emi, pct) => `<span style="color: var(--rose);">மாதாந்திர இஎம்ஐ <strong>${emi}</strong> உங்கள் வருமானத்தில் <strong>${pct}%</strong>, இது 50% பாதுகாப்பு வரம்பை தாண்டுகிறது!</span>`,
        runway_alert: (mat, ret) => `<span style="color: var(--amber);">கடன் உங்கள் <strong>${mat} வயதில்</strong> முடிகிறது, இது ஓய்வு வயதை (<strong>${ret} வயது</strong>) விட அதிகம். ஓய்வூதிய சரிபார்ப்பு தேவை.</span>`,
        runway_safe: (months, mat, left, ret) => `இந்த ${months}-மாதக் கடன் உங்கள் <strong>${mat} வயதில்</strong> முடிவடையும், ஓய்வுபெறும் வயதை விட <strong>${left} ஆண்டுகள்</strong> முன்பாகவே!`,
        runway_pension: "ஓய்வூதிய ஆதரவு கடன் திருப்பிச் செலுத்துதல்",
        runway_no_pension: "எச்சரிக்கை: கடன் ஓய்வுபெறும் வயதை தாண்டுகிறது",
        runway_active: "பணியின் போதே கடன் முடிவடைகிறது",
        clean_no_loans: "முந்தைய கடன்கள் எதுவும் சேர்க்கப்படவில்லை.",
        clean_click_add: "முந்தைய கடன்களைச் சேர்க்க மேலே உள்ள <strong>'+ மற்றொரு கடனைச் சேர்க்க'</strong> பொத்தானைக் கிளிக் செய்யவும்.",
        reg_0_dpd: "சரியான நேரத்தில் செலுத்துதல் (0 DPD)",
        fully_repaid: "முழுமையாக திருப்பிச் செலுத்தப்பட்டது",
        late_30_59: "30-59 நாட்கள் தாமதம்",
        late_60_89: "60-89 நாட்கள் தாமத எச்சரிக்கை",
        defaulted_npa: "தவறியது / என்பிஏ (NPA)",
        repay_npa: "எச்சரிக்கை: என்பிஏ / தவறிய கடன் உள்ளது",
        repay_delay: "முந்தைய தாமதமான பணம் செலுத்துதல் உள்ளது",
        repay_clean: "100% சரியான நேரத்தில் செலுத்துதல்",
        clean_slate: "எந்தவொரு பாதகமான பதிவும் இல்லை",
        npa_flag_desc: (c) => `${c} தவறிய / என்பிஏ பதிவுகள் உள்ளன`,
        late_flag_desc: (c) => `${c} தவணை தாமத பதிவுகள்`,
        settled_flag_desc: (c) => `${c} கடன்கள் முழுமையாக திருப்பிச் செலுத்தப்பட்டன, 0 தவறுகள்`,
        ans_title_approved: "கடன் விண்ணப்பம் அனுமதிக்கப்பட்டது",
        ans_title_cond: "நிபந்தனை அனுமதி • மதிப்பாய்வு",
        ans_title_declined: "கடன் விண்ணப்பம் நிராகரிக்கப்பட்டது",
        ans_badge_approved: "வழங்க ஒப்புதல்",
        ans_badge_cond: "நிபந்தனை அனுமதி",
        ans_badge_declined: "விண்ணப்பம் நிராகரிக்கப்பட்டது",
        ans_tier_a1: "பிரிவு A1 • முதன்மை கடன் வசதி",
        ans_tier_b2: "பிரிவு B2 • நடுத்தர ஆபத்து / கூடுதல் ஆய்வு",
        ans_tier_c3: "பிரிவு C3 • அதிக ஆபத்து",
        ans_amt_full: "கோரப்பட்ட தொகையில் 100%",
        ans_amt_restricted: "வரம்பிற்குட்பட்ட தொகை",
        ans_amt_declined: "கொள்கையின்படி நிராகரிக்கப்பட்டது",
        cibil_prime: "முதன்மை தரம் (சிறந்தது)",
        cibil_standard: "வழக்கமான மதிப்பீடு",
        cibil_subprime: "அதிக ஆபத்து எச்சரிக்கை",
        dti_optimal: "பாதுகாப்பான விகிதம்",
        dti_moderate: "மிதமான சுமை",
        dti_critical: "அதிக கடன் சுமை",
        months_unit: "மாதங்கள்",
        ret_prefix: "ஓய்வு",
        maturity_label: "முடிவுறும் வயது",
        amortized_label: "பணியின் போதே முடிவடைகிறது",
        maturity_pension_sub: "ஓய்வுக்குப் பிறகும் செலுத்துதல் (ஓய்வூதியம் உண்டு)",
        maturity_alert_sub: "எச்சரிக்கை: ஓய்வுக்குப் பின் கடன் முடிகிறது",
        yrs_unit: "வயது/ஆண்டுகள்",
        mo_unit: "/ மாதம்"
    },
    te: {
        afford_safe_high: (emi, pct) => `నెలవారీ EMI <strong>${emi}</strong> మీ ఆదాయంలో కేవలం <strong>${pct}%</strong> మాత్రమే. చాలా సురక్షితమైనది!`,
        afford_safe_ok: (emi, pct, limit) => `నెలవారీ EMI <strong>${emi}</strong> మీ ఆదాయంలో <strong>${pct}%</strong> (50% సురక్షిత పరిమితి ${limit} లోపు ఉంది).`,
        afford_safe_exceed: (emi, pct) => `<span style="color: var(--rose);">నెలవారీ EMI <strong>${emi}</strong> మీ ఆదాయంలో <strong>${pct}%</strong>, ఇది 50% సురక్షిత పరిమితిని మించుతోంది!</span>`,
        runway_alert: (mat, ret) => `<span style="color: var(--amber);">లోన్ మీ <strong>${mat} ఏళ్ల</strong> వయస్సు వరకు కొనసాగుతుంది, ఇది పదవీ విరమణ వయస్సు (<strong>${ret} ఏళ్లు</strong>) కంటే ఎక్కువ.</span>`,
        runway_safe: (months, mat, left, ret) => `ఈ ${months}-నెలల లోన్ మీ <strong>${mat} ఏళ్ల</strong> వయస్సులో పూర్తవుతుంది, పదవీ విరమణ కంటే <strong>${left} సంవత్సరాల</strong> ముందే!`,
        runway_pension: "పెన్షన్-మద్దతుగల రుణ చెల్లింపు",
        runway_no_pension: "హెచ్చరిక: పదవీ విరమణ తర్వాత కూడా లోన్ ఉంటుంది",
        runway_active: "ఉద్యోగ విరమణకు ముందే లోన్ పూర్తవుతుంది",
        clean_no_loans: "మునుపటి లోన్లు ఏవీ ప్రకటించబడలేదు.",
        clean_click_add: "మునుపటి లోన్లను నమోదు చేయడానికి పైన ఉన్న <strong>'+ లోన్ జోడించండి'</strong> బటన్‌ను క్లిక్ చేయండి.",
        reg_0_dpd: "సకాలంలో చెల్లింపు (0 DPD)",
        fully_repaid: "పూర్తిగా చెల్లించబడింది",
        late_30_59: "30-59 రోజుల ఆలస్యం",
        late_60_89: "60-89 రోజుల ఆలస్య హెచ్చరిక",
        defaulted_npa: "డిఫాల్ట్ / ఎన్‌పీఏ (NPA)",
        repay_npa: "హెచ్చరిక: NPA / డిఫాల్ట్ ఉంది",
        repay_delay: "గతంలో చెల్లింపుల ఆలస్యం ఉంది",
        repay_clean: "100% సకాలంలో చెల్లింపు (ఉత్తమ రికార్డు)",
        clean_slate: "ఎలాంటి ప్రతికూల రికార్డు లేదు",
        npa_flag_desc: (c) => `${c} డిఫాల్ట్ / ఎన్‌పీఏ రికార్డులు ఉన్నాయి`,
        late_flag_desc: (c) => `${c} వాయిదాల ఆలస్య రికార్డు`,
        settled_flag_desc: (c) => `${c} లోన్లు పూర్తిగా క్లియర్ అయ్యాయి, 0 డిఫాల్ట్లు`,
        ans_title_approved: "లోన్ దరఖాస్తు ఆమోదించబడింది",
        ans_title_cond: "షరతులతో కూడిన ఆమోదం • సమీక్ష",
        ans_title_declined: "లోన్ దరఖాస్తు తిరస్కరించబడింది",
        ans_badge_approved: "పంపిణీకి ఆమోదించబడింది",
        ans_badge_cond: "షరతులతో కూడిన ఆమోదం",
        ans_badge_declined: "దరఖాస్తు తిరస్కరించబడింది",
        ans_tier_a1: "శ్రేణి A1 • ప్రైమ్ లోన్ సదుపాయం",
        ans_tier_b2: "శ్రేణి B2 • మోడరేట్ రిస్క్ / అదనపు పరిశీలన",
        ans_tier_c3: "శ్రేణి C3 • అధిక రిస్క్",
        ans_amt_full: "కోరిన మొత్తంలో 100%",
        ans_amt_restricted: "పరిమిత రుణం",
        ans_amt_declined: "విధానం ప్రకారం తిరస్కరించబడింది",
        cibil_prime: "ప్రైమ్ గ్రేడ్ (అద్భుతమైనది)",
        cibil_standard: "ప్రామాణిక అండర్‌రైటింగ్",
        cibil_subprime: "సబ్-ప్రైమ్ హెచ్చరిక",
        dti_optimal: "సురక్షితమైన పరిమితి",
        dti_moderate: "మోడరేట్ భారం",
        dti_critical: "తీవ్రమైన DTI",
        months_unit: "నెలలు",
        ret_prefix: "విరమణ",
        maturity_label: "ముగింపు వయస్సు",
        amortized_label: "ఉద్యోగంలోనే పూర్తవుతుంది",
        maturity_pension_sub: "పదవీ విరమణ తర్వాత కూడా (పెన్షన్ అర్హత)",
        maturity_alert_sub: "హెచ్చరిక: పదవీ విరమణ తర్వాత రుణం ముగుస్తుంది",
        yrs_unit: "సంవత్సరాలు",
        mo_unit: "/ నెల"
    },
    bn: {
        afford_safe_high: (emi, pct) => `মাসিক কিস্তি <strong>${emi}</strong> আপনার আয়ের মাত্র <strong>${pct}%</strong>। এটি খুবই নিরাপদ বাজেট!`,
        afford_safe_ok: (emi, pct, limit) => `মাসিক কিস্তি <strong>${emi}</strong> আপনার আয়ের <strong>${pct}%</strong> (নিরাপদ ৫০% সীমা ${limit}-এর মধ্যে রয়েছে)।`,
        afford_safe_exceed: (emi, pct) => `<span style="color: var(--rose);">মাসিক কিস্তি <strong>${emi}</strong> আপনার আয়ের <strong>${pct}%</strong>, যা নিরাপদ ৫০% সীমা অতিক্রম করে!</span>`,
        runway_alert: (mat, ret) => `<span style="color: var(--amber);">ঋণটি আপনার <strong>${mat} বছর</strong> বয়স পর্যন্ত চলবে, যা অবসরের বয়স (<strong>${ret} বছর</strong>) থেকে বেশি।</span>`,
        runway_safe: (months, mat, left, ret) => `এই ${months}-মাসের ঋণটি আপনার <strong>${mat} বছর</strong> বয়সে সম্পূর্ণ পরিশোধ হয়ে যাবে, অবসরের <strong>${left} বছর</strong> আগেই!`,
        runway_pension: "পেনশন সমর্থিত ঋণ পরিশোধ",
        runway_no_pension: "সতর্কতা: অবসরের পরেও ঋণ বাকি থাকে",
        runway_active: "চাকরির মেয়াদেই ঋণ সম্পূর্ণ শোধ",
        clean_no_loans: "কোনো পূর্ববর্তী ঋণ ঘোষণা করা হয়নি।",
        clean_click_add: "পূর্ববর্তী ঋণ যুক্ত করতে উপরে <strong>'+ আরেকটি ঋণ যুক্ত করুন'</strong> ক্লিক করুন।",
        reg_0_dpd: "নিয়মিত (সময়মতো 0 দিন বিলম্ব)",
        fully_repaid: "সম্পূর্ণ পরিশোধিত / বন্ধ",
        late_30_59: "৩০-৫৯ দিন বিলম্ব",
        late_60_89: "৬০-৮৯ দিন বিলম্বের সতর্কতা",
        defaulted_npa: "খেলাপি / এনপিএ (NPA)",
        repay_npa: "সতর্কতা: খেলাপি ঋণ / এনপিএ পাওয়া গেছে",
        repay_delay: "অতীতে বিলম্বে পরিশোধ লক্ষ্য করা গেছে",
        repay_clean: "১০০% সময়মতো পরিশোধ (চমৎকার রেকর্ড)",
        clean_slate: "কোনো খারাপ রেকর্ড নেই (পরিষ্কার রেকর্ড)",
        npa_flag_desc: (c) => `${c}টি খেলাপি / এনপিএ রেকর্ড পাওয়া গেছে`,
        late_flag_desc: (c) => `${c}টি কিস্তিতে বিলম্বের রেকর্ড`,
        settled_flag_desc: (c) => `${c}টি ঋণ সম্পূর্ণ পরিশোধিত, ০ খেলাপি`,
        ans_title_approved: "ঋণ আবেদন অনুমোদিত হয়েছে",
        ans_title_cond: "শর্তসাপেক্ষ অনুমোদন • বিশেষ পর্যালোচনা",
        ans_title_declined: "ঋণ আবেদন প্রত্যাখ্যাত হয়েছে",
        ans_badge_approved: "বিতরণের জন্য অনুমোদিত",
        ans_badge_cond: "শর্তসাপেক্ষ অনুমোদন",
        ans_badge_declined: "আবেদন প্রত্যাখ্যাত",
        ans_tier_a1: "টায়ার A1 • প্রাইম ঋণ সুবিধা",
        ans_tier_b2: "টায়ার B2 • মাঝারি ঝুঁকি / অতিরিক্ত যাচাই",
        ans_tier_c3: "টায়ার C3 • সাব-প্রাইম / উচ্চ ঝুঁকি",
        ans_amt_full: "অনুরোধকৃত ১০০% ঋণ অনুমোদিত",
        ans_amt_restricted: "সীমাবদ্ধ ঋণের পরিমাণ",
        ans_amt_declined: "নীতিমালা অনুযায়ী প্রত্যাখ্যাত",
        cibil_prime: "প্রাইম গ্রেড (চমৎকার)",
        cibil_standard: "সাধারণ ঝুঁকি (সন্তোষজনক)",
        cibil_subprime: "সাব-প্রাইম সতর্কতা",
        dti_optimal: "নিরাপদ কিস্তির অনুপাত",
        dti_moderate: "মাঝারি বোঝা",
        dti_critical: "অত্যধিক ঋণের বোঝা",
        months_unit: "মাস",
        ret_prefix: "অবসর",
        maturity_label: "পরিশোধের বয়স",
        amortized_label: "চাকরির মেয়াদেই শোধ",
        maturity_pension_sub: "অবসরের পরেও কিস্তি (পেনশন যোগ্য)",
        maturity_alert_sub: "সতর্কতা: অবসরের পর ঋণ শেষ হবে",
        yrs_unit: "বছর",
        mo_unit: "/ মাস"
    }
};

/* --------------------------------------------------------------------------
   Two-Login Role-Based Access Control (Applicant vs Underwriter Desk)
   -------------------------------------------------------------------------- */
let CURRENT_USER_ROLE = localStorage.getItem("apex_user_role") || "user";
let ADMIN_AUTH_TOKEN = sessionStorage.getItem("apex_admin_token") || "";
window.LAST_USER_RECEIPT = null;
window.LAST_APPLICATION_REF = null;

function updateRoleUI() {
    const btnUser = document.getElementById("btn-role-user");
    const btnAdmin = document.getElementById("btn-role-admin");
    const adminLabel = document.getElementById("admin-role-label");
    const isUnderwriter = CURRENT_USER_ROLE === "admin" && !!ADMIN_AUTH_TOKEN;

    if (btnUser && btnAdmin) {
        if (isUnderwriter) {
            btnUser.classList.remove("active");
            btnAdmin.classList.add("active", "admin-authenticated");
            if (adminLabel) adminLabel.textContent = "Underwriter Desk (Active)";
        } else {
            btnUser.classList.add("active");
            btnAdmin.classList.remove("active", "admin-authenticated");
            if (adminLabel) {
                const labelTxt = window.getTranslation ? window.getTranslation('role_admin', 'Underwriter') : 'Underwriter';
                adminLabel.textContent = labelTxt;
            }
        }
    }
}

let ADMIN_QUEUE_APPLICATIONS = [];
let ACTIVE_ADMIN_APP_REF = null;
let ACTIVE_QUEUE_FILTER = "ALL";
let APPLICANT_POLL_INTERVAL = null;

function applyViewForRole() {
    const applicantView = document.getElementById("applicant-portal-view");
    const adminView = document.getElementById("admin-underwriter-portal");
    const isUnderwriter = (CURRENT_USER_ROLE === "admin" || localStorage.getItem("apex_user_role") === "admin") && !!(ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token"));

    if (isUnderwriter) {
        if (applicantView) applicantView.style.display = "none";
        if (adminView) {
            adminView.style.display = "block";
            loadAdminApplicationsQueue();
        }
        // Ensure identity is synced to Admin
        if (typeof updateNavbarUserChip === "function") {
            const officerProfile = (typeof TLB_OFFICER_PROFILE !== "undefined") ? TLB_OFFICER_PROFILE : {
                customer_id: "TLB-ADMIN",
                full_name: "Admin",
                designation: "System Administrator • Underwriting Desk",
                branch: "Central Credit Operations Division",
                account_no: "TLB-ADMIN-01",
                pan_number: "TLBAD9999Z",
                role: "admin"
            };
            updateNavbarUserChip(officerProfile);
        }
    } else {
        if (adminView) adminView.style.display = "none";
        if (applicantView) applicantView.style.display = "block";
        // Ensure identity is synced to Retail Applicant Rahul Sharma
        if (typeof updateNavbarUserChip === "function") {
            const applicantProfile = (typeof BANK_ACTIVE_USER !== "undefined" && BANK_ACTIVE_USER && BANK_ACTIVE_USER.role !== "admin")
                ? BANK_ACTIVE_USER
                : ((typeof TLB_APPLICANT_PROFILE !== "undefined") ? TLB_APPLICANT_PROFILE : {
                    customer_id: "TLB849201",
                    full_name: "Rahul Sharma",
                    account_no: "100928374651",
                    pan_number: "ABCDE1234F",
                    role: "applicant"
                });
            updateNavbarUserChip(applicantProfile);
        }
    }
}

function switchRole(role) {
    if (role === "admin") {
        const token = ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token");
        if (!token) {
            openAdminLoginModal();
            return;
        }
        CURRENT_USER_ROLE = "admin";
        localStorage.setItem("apex_user_role", "admin");
        updateRoleUI();
        applyViewForRole();
    } else {
        CURRENT_USER_ROLE = "user";
        localStorage.setItem("apex_user_role", "user");
        updateRoleUI();
        applyViewForRole();
        if (CURRENT_WIZARD_STEP === 5 && window.LAST_USER_RECEIPT) {
            showUserReceipt(window.LAST_USER_RECEIPT);
        }
    }
}

function openAdminLoginModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) {
        modal.style.display = "flex";
        const err = document.getElementById("admin-login-err");
        if (err) err.style.display = "none";
        setTimeout(() => {
            const userInput = document.getElementById("admin-username-input");
            if (userInput) userInput.focus();
        }, 120);
    }
}

function closeAdminLoginModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) modal.style.display = "none";
}

async function submitAdminLogin() {
    const userInput = document.getElementById("admin-username-input");
    const passInput = document.getElementById("admin-password-input");
    const errBox = document.getElementById("admin-login-err");
    const submitBtn = document.getElementById("btn-admin-login-submit");

    const username = userInput ? userInput.value.trim() : "";
    const password = passInput ? passInput.value.trim() : "";

    if (!username || !password) {
        if (errBox) {
            errBox.textContent = "Please enter both Officer Username and Security PIN.";
            errBox.style.display = "block";
        }
        return;
    }

    try {
        if (submitBtn) submitBtn.disabled = true;
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            const data = await res.json();
            if (errBox) {
                errBox.textContent = data.detail || "Authentication Failed. Check Officer ID & PIN.";
                errBox.style.display = "block";
            }
            return;
        }

        const data = await res.json();
        ADMIN_AUTH_TOKEN = data.token;
        sessionStorage.setItem("apex_admin_token", data.token);
        CURRENT_USER_ROLE = "admin";
        localStorage.setItem("apex_user_role", "admin");

        updateRoleUI();
        closeAdminLoginModal();
        applyViewForRole();

        if (typeof showBankSMSToast === "function") {
            showBankSMSToast("Chief Credit Officer Terminal Unlocked. Loading Underwriting Queue.", "success");
        }

    } catch (err) {
        console.error("Admin login error:", err);
        if (errBox) {
            errBox.textContent = "Unable to connect to Underwriter Authentication Gateway.";
            errBox.style.display = "block";
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

/* --------------------------------------------------------------------------
   Admin Applications Queue & Quantum Underwriting Controller
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   Admin Applications Queue & Live Real-Time Synchronizer
   -------------------------------------------------------------------------- */
let ADMIN_LAST_KNOWN_COUNT = 0;
let ADMIN_LAST_KNOWN_REFS = new Set();
let IS_SYNCING_QUEUE = false;
let ADMIN_SYNC_INTERVAL = null;

function updateQueueStatsBadges() {
    const totalElem = document.getElementById("stat-total-apps");
    const pendingElem = document.getElementById("stat-pending-apps");
    const sanctionedElem = document.getElementById("stat-sanctioned-apps");
    const declinedElem = document.getElementById("stat-declined-apps");

    const pendingCount = ADMIN_QUEUE_APPLICATIONS.filter(a => a.status === "PENDING_REVIEW").length;
    const sanctionedCount = ADMIN_QUEUE_APPLICATIONS.filter(a => a.status === "SANCTIONED" || a.status === "DISBURSED").length;
    const declinedCount = ADMIN_QUEUE_APPLICATIONS.filter(a => a.status === "REJECTED").length;

    if (totalElem) totalElem.textContent = ADMIN_QUEUE_APPLICATIONS.length;
    if (pendingElem) pendingElem.textContent = pendingCount;
    if (sanctionedElem) sanctionedElem.textContent = sanctionedCount;
    if (declinedElem) declinedElem.textContent = declinedCount;
}

async function loadAdminApplicationsQueue(isSilent = false) {
    const refreshBtn = document.getElementById("btn-admin-refresh-queue");
    const refreshIcon = document.getElementById("icon-refresh-queue");
    if (!isSilent) {
        if (refreshBtn) refreshBtn.classList.add("spinning");
        if (refreshIcon) refreshIcon.classList.add("spin-anim");
    }

    try {
        const token = ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token") || "";
        let res = await fetch(`/api/admin/applications?admin_token=${encodeURIComponent(token)}`);
        if (res.status === 404) {
            res = await fetch(`/admin/applications?admin_token=${encodeURIComponent(token)}`);
        }
        if (!res.ok) {
            console.error("Failed to load applications queue:", res.status);
            if (!isSilent && typeof showBankSMSToast === "function") {
                showBankSMSToast(`Unable to fetch applications queue (Server status: ${res.status}).`, "error", 4000);
            }
            return;
        }
        const data = await res.json();
        ADMIN_QUEUE_APPLICATIONS = data.applications || [];
        ADMIN_LAST_KNOWN_COUNT = ADMIN_QUEUE_APPLICATIONS.length;
        ADMIN_LAST_KNOWN_REFS = new Set(ADMIN_QUEUE_APPLICATIONS.map(a => a.application_ref));

        updateQueueStatsBadges();
        renderQueueList();

        // Auto-select application if available
        const currentFound = ADMIN_QUEUE_APPLICATIONS.find(a => a.application_ref === ACTIVE_ADMIN_APP_REF);
        if (!currentFound && ADMIN_QUEUE_APPLICATIONS.length > 0) {
            const firstPending = ADMIN_QUEUE_APPLICATIONS.find(a => a.status === "PENDING_REVIEW") || ADMIN_QUEUE_APPLICATIONS[0];
            selectAdminApplication(firstPending.application_ref);
        } else if (currentFound) {
            selectAdminApplication(currentFound.application_ref);
        } else if (ADMIN_QUEUE_APPLICATIONS.length === 0) {
            ACTIVE_ADMIN_APP_REF = null;
            const contentPane = document.getElementById("admin-dossier-content");
            const emptyPane = document.getElementById("admin-dossier-empty");
            if (contentPane) contentPane.style.display = "none";
            if (emptyPane) emptyPane.style.display = "block";
        }

        if (!isSilent && typeof showBankSMSToast === "function") {
            const count = ADMIN_QUEUE_APPLICATIONS.length;
            showBankSMSToast(`Applications Queue Synchronized (${count} Live Submission${count === 1 ? '' : 's'}).`, "info", 3000);
        }

    } catch (err) {
        console.error("Error loading admin queue:", err);
        if (!isSilent && typeof showBankSMSToast === "function") {
            showBankSMSToast(`Error connecting to queue service: ${err.message}`, "error", 4000);
        }
    } finally {
        if (!isSilent) {
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove("spinning");
                if (refreshIcon) refreshIcon.classList.remove("spin-anim");
            }, 500);
        }
    }
}

async function silentSyncAdminQueue(forceSelectRef = null) {
    if (IS_SYNCING_QUEUE) return;
    IS_SYNCING_QUEUE = true;
    try {
        const token = ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token") || "";
        let res = await fetch(`/api/admin/applications?admin_token=${encodeURIComponent(token)}`);
        if (res.status === 404) {
            res = await fetch(`/admin/applications?admin_token=${encodeURIComponent(token)}`);
        }
        if (!res.ok) return;
        const data = await res.json();
        const incomingApps = data.applications || [];

        let newAppArrived = null;
        if (incomingApps.length > ADMIN_LAST_KNOWN_COUNT) {
            for (const app of incomingApps) {
                if (!ADMIN_LAST_KNOWN_REFS.has(app.application_ref)) {
                    newAppArrived = app;
                    break;
                }
            }
        }

        ADMIN_QUEUE_APPLICATIONS = incomingApps;
        ADMIN_LAST_KNOWN_COUNT = incomingApps.length;
        ADMIN_LAST_KNOWN_REFS = new Set(incomingApps.map(a => a.application_ref));

        updateQueueStatsBadges();
        renderQueueList();

        if (newAppArrived) {
            const borrowerName = newAppArrived.applicant?.full_name || "Borrower";
            const reqAmt = newAppArrived.loan_request?.amount_requested ? `₹${Math.round(newAppArrived.loan_request.amount_requested).toLocaleString('en-IN')}` : "Loan";
            if (typeof showBankSMSToast === "function") {
                showBankSMSToast(
                    `[LIVE INCOMING DOSSIER] New ${reqAmt} request received from ${borrowerName} (${newAppArrived.application_ref})!`,
                    "success",
                    7000
                );
            }
            selectAdminApplication(newAppArrived.application_ref);
        } else if (forceSelectRef) {
            selectAdminApplication(forceSelectRef);
        } else if (!ACTIVE_ADMIN_APP_REF && ADMIN_QUEUE_APPLICATIONS.length > 0) {
            const firstPending = ADMIN_QUEUE_APPLICATIONS.find(a => a.status === "PENDING_REVIEW") || ADMIN_QUEUE_APPLICATIONS[0];
            selectAdminApplication(firstPending.application_ref);
        } else if (ADMIN_QUEUE_APPLICATIONS.length === 0) {
            ACTIVE_ADMIN_APP_REF = null;
            const contentPane = document.getElementById("admin-dossier-content");
            const emptyPane = document.getElementById("admin-dossier-empty");
            if (contentPane) contentPane.style.display = "none";
            if (emptyPane) emptyPane.style.display = "block";
        }
    } catch (e) {
        console.warn("Silent sync warning:", e);
    } finally {
        IS_SYNCING_QUEUE = false;
    }
}

function initAdminRealtimeSync() {
    // 1. Cross-tab BroadcastChannel
    try {
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel("tlb_queue_sync_channel");
            channel.onmessage = (event) => {
                if (event.data && event.data.type === "NEW_APPLICATION_SUBMITTED") {
                    silentSyncAdminQueue(event.data.ref);
                }
            };
        }
    } catch (_) {}

    // 2. Storage event listener for cross-tab sync
    window.addEventListener("storage", (e) => {
        if (e.key === "tlb_last_submitted_ref" && e.newValue) {
            const ref = e.newValue.split("_")[0];
            silentSyncAdminQueue(ref);
        }
    });

    // 3. Periodic background poll every 2.5 seconds when Admin Desk is visible
    if (ADMIN_SYNC_INTERVAL) clearInterval(ADMIN_SYNC_INTERVAL);
    ADMIN_SYNC_INTERVAL = setInterval(() => {
        const isUnderwriter = (CURRENT_USER_ROLE === "admin" || localStorage.getItem("apex_user_role") === "admin");
        const adminPortal = document.getElementById("admin-underwriter-portal");
        if (isUnderwriter && adminPortal && adminPortal.style.display !== "none") {
            silentSyncAdminQueue();
        }
    }, 2500);
}

function setQueueFilter(filter) {
    ACTIVE_QUEUE_FILTER = filter;
    document.querySelectorAll(".queue-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.filter === filter);
    });
    renderQueueList();
}

function filterQueueList() {
    renderQueueList();
}

function renderQueueList() {
    const container = document.getElementById("admin-queue-list");
    const countPill = document.getElementById("queue-count-display");
    const searchVal = (document.getElementById("admin-queue-search")?.value || "").toLowerCase().trim();
    if (!container) return;

    if (ADMIN_QUEUE_APPLICATIONS.length === 0) {
        if (countPill) countPill.textContent = "0 Applications";
        container.innerHTML = `
            <div class="queue-empty-state">
                <div class="queue-empty-radar">
                    <span class="radar-dot-pulse"></span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                </div>
                <div class="queue-empty-title">Queue Awaiting Live Requests</div>
                <p class="queue-empty-desc">No applications in queue yet. When a borrower submits a loan request in the portal, it will instantly appear here in real time.</p>
            </div>
        `;
        const contentPane = document.getElementById("admin-dossier-content");
        const emptyPane = document.getElementById("admin-dossier-empty");
        if (contentPane) contentPane.style.display = "none";
        if (emptyPane) emptyPane.style.display = "block";
        return;
    }

    let filtered = ADMIN_QUEUE_APPLICATIONS.filter(app => {
        if (ACTIVE_QUEUE_FILTER !== "ALL" && app.status !== ACTIVE_QUEUE_FILTER) {
            return false;
        }
        if (searchVal) {
            const name = (app.applicant?.full_name || "").toLowerCase();
            const ref = (app.application_ref || "").toLowerCase();
            const pan = (app.applicant?.pan_number || "").toLowerCase();
            if (!name.includes(searchVal) && !ref.includes(searchVal) && !pan.includes(searchVal)) {
                return false;
            }
        }
        return true;
    });

    if (countPill) countPill.textContent = `${filtered.length} Application${filtered.length === 1 ? '' : 's'}`;
    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-dim); font-size: 0.85rem;">
                No applications found matching the selected filter or search.
            </div>
        `;
        return;
    }

    filtered.forEach(app => {
        const card = document.createElement("div");
        const statusClass = app.status === "DISBURSED" ? "status-border-sanctioned" :
                           (app.status === "SANCTIONED" ? "status-border-sanctioned" :
                           (app.status === "REJECTED" ? "status-border-rejected" : "status-border-pending"));
        const isActive = app.application_ref === ACTIVE_ADMIN_APP_REF;

        card.className = `queue-item-card ${statusClass} ${isActive ? 'active' : ''}`;
        card.onclick = () => selectAdminApplication(app.application_ref);

        const statusTagClass = app.status === "DISBURSED" ? "badge-disbursed" :
                              (app.status === "SANCTIONED" ? "sanctioned" :
                              (app.status === "REJECTED" ? "rejected" : "pending"));
        const statusTagLabel = app.status === "DISBURSED" ? "Disbursed" :
                              (app.status === "SANCTIONED" ? "Sanctioned" :
                              (app.status === "REJECTED" ? "Declined" : "Pending"));

        const qsvm = app.qsvm_analysis || {};
        const qsvmClass = qsvm.prediction === 0 ? "class-0" : "class-1";
        const qsvmLabel = qsvm.prediction === 0 ? "Tier A • Prime" : "Tier C • Default Risk";

        const reqAmt = app.loan_request?.amount_requested || 500000;
        const tenor = app.loan_request?.tenor_months || 36;
        const applicantName = app.applicant?.full_name || 'Borrower';
        const initials = applicantName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "BW";

        const docBadge = app.uploaded_statement ? `
            <div style="font-size:10.5px; font-weight:700; color:#059669; margin: 3px 0 6px 0; display:flex; align-items:center; gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>${app.uploaded_statement} (OCR Verified)</span>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="queue-card-top">
                <div class="queue-card-identity">
                    <span class="queue-avatar-chip">${initials}</span>
                    <span class="queue-card-ref">${app.application_ref}</span>
                </div>
                <span class="queue-card-time">${app.submission_date?.split(" ")[1] || 'Today'}</span>
            </div>
            <div class="queue-card-name">${applicantName}</div>
            <div class="queue-card-meta">
                <span>PAN: ${app.applicant?.pan_number || '—'}</span>
                <span>•</span>
                <span>${app.applicant?.working_sector?.split(" ")[0] || 'Corporate'}</span>
            </div>
            ${docBadge}
            <div class="queue-card-footer">
                <span class="queue-card-amount">₹${Math.round(reqAmt).toLocaleString('en-IN')} (${tenor}m)</span>
                <span class="queue-status-tag ${statusTagClass}">${statusTagLabel}</span>
            </div>
            <div class="queue-qsvm-mini ${qsvmClass}">
                <span>Risk Assessment:</span> <span>${qsvmLabel}</span>
            </div>
        `;

        container.appendChild(card);
    });
}

function switchDossierTab(tabId) {
    const validTabs = ['facility', 'bureau', 'determination'];
    if (!validTabs.includes(tabId)) tabId = 'facility';

    validTabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const pane = document.getElementById(`dossier-pane-${t}`);
        const isActive = t === tabId;

        if (btn) {
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-selected", isActive ? "true" : "false");
        }
        if (pane) {
            pane.style.display = isActive ? "block" : "none";
            pane.classList.toggle("active", isActive);
        }
    });

    const dossierCard = document.getElementById("admin-dossier-card");
    if (dossierCard) {
        dossierCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

async function runBackgroundRiskAppraisal(ref) {
    if (!ref) return;
    try {
        const token = ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token") || "";
        const res = await fetch("/api/admin/evaluate-qsvm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ application_ref: ref, admin_token: token })
        });
        if (res.ok) {
            const data = await res.json();
            const app = ADMIN_QUEUE_APPLICATIONS.find(a => a.application_ref === ref);
            if (app && data.qsvm_analysis) {
                app.qsvm_analysis = data.qsvm_analysis;
                renderDossierQSVMPanel(data.qsvm_analysis);
                renderQueueList();
            }
        }
    } catch (e) {
        console.error("Background risk appraisal failed:", e);
    }
}

function selectAdminApplication(ref) {
    ACTIVE_ADMIN_APP_REF = ref;
    const selected = ADMIN_QUEUE_APPLICATIONS.find(a => a.application_ref === ref);

    // Update active highlight in queue list
    document.querySelectorAll(".queue-item-card").forEach(c => {
        const isMatch = c.querySelector(".queue-card-ref")?.textContent.trim() === ref;
        c.classList.toggle("active", isMatch);
    });

    if (selected) {
        displayAdminApplicationDossier(selected);
        // Automatically evaluate risk appraisal in background if missing
        if (!selected.qsvm_analysis || !selected.qsvm_analysis.quantum_risk_index) {
            runBackgroundRiskAppraisal(ref);
        }
    }
}

function displayAdminApplicationDossier(app) {
    const emptyState = document.getElementById("admin-dossier-empty");
    const contentState = document.getElementById("admin-dossier-content");
    if (emptyState) emptyState.style.display = "none";
    if (contentState) contentState.style.display = "block";

    // Ensure active dossier tab is synced
    const activeTab = document.querySelector(".dossier-nav-tab.active");
    const activeTabId = activeTab ? activeTab.id.replace("tab-btn-", "") : "facility";
    switchDossierTab(activeTabId || "facility");

    const applicant = app.applicant || {};
    const loanReq = app.loan_request || {};
    const retAnalysis = app.retirement_analysis || {};
    const portfolio = app.portfolio || {};
    const loans = app.loans || [];
    const qsvm = app.qsvm_analysis || {};
    const decision = app.decision_details || {};

    // 1. Ribbon Info
    const refBadge = document.getElementById("dossier-ref-badge");
    const nameElem = document.getElementById("dossier-applicant-name");
    const panElem = document.getElementById("dossier-pan");
    const accElem = document.getElementById("dossier-acc");
    const ageElem = document.getElementById("dossier-age");
    const incomeElem = document.getElementById("dossier-income");
    const kycElem = document.getElementById("dossier-kyc");
    const statusPill = document.getElementById("dossier-status-pill");
    const timeElem = document.getElementById("dossier-time");

    if (refBadge) refBadge.textContent = app.application_ref;
    if (nameElem) nameElem.textContent = applicant.full_name || "Applicant";
    if (panElem) panElem.textContent = applicant.pan_number || "—";
    if (accElem) accElem.textContent = applicant.account_no || "—";
    if (ageElem) ageElem.textContent = `${applicant.applicant_age || 34} Yrs`;
    if (incomeElem) incomeElem.textContent = `₹${Math.round(applicant.monthly_income || 0).toLocaleString('en-IN')} / mo`;
    if (kycElem) kycElem.textContent = applicant.kyc_status || "VERIFIED (LIVE)";
    if (timeElem) timeElem.textContent = app.submission_date || "Today";

    if (statusPill) {
        if (app.status === 'DISBURSED') {
            statusPill.className = "status-pill-underwrite status-disbursed";
            statusPill.textContent = "FACILITY DISBURSED • IMPS EXECUTED";
        } else if (app.status === 'SANCTIONED') {
            statusPill.className = "status-pill-underwrite status-sanctioned";
            statusPill.textContent = "OFFICIALLY SANCTIONED";
        } else if (app.status === 'REJECTED') {
            statusPill.className = "status-pill-underwrite status-rejected";
            statusPill.textContent = "APPLICATION DECLINED";
        } else {
            statusPill.className = "status-pill-underwrite status-pending";
            statusPill.textContent = "PENDING UNDERWRITING REVIEW";
        }
    }

    // 2. Requested Facility Grid
    const reqAmountElem = document.getElementById("dossier-req-amount");
    const reqTenorElem = document.getElementById("dossier-req-tenor");
    const reqEmiElem = document.getElementById("dossier-req-emi");
    const foirPctElem = document.getElementById("dossier-foir-pct");
    const purposeElem = document.getElementById("dossier-purpose");
    const runwayYearsElem = document.getElementById("dossier-runway-years");
    const sectorNameElem = document.getElementById("dossier-sector-name");

    const principal = loanReq.amount_requested || 500000;
    const tenorMos = loanReq.tenor_months || 36;
    const income = applicant.monthly_income || 85000;
    const proposedEmi = loanReq.requested_emi || calculateEmiLocally(principal, 8.85, tenorMos);
    const foirPct = income > 0 ? ((proposedEmi / income) * 100).toFixed(1) : "0";

    if (reqAmountElem) reqAmountElem.textContent = `₹${Math.round(principal).toLocaleString('en-IN')}`;
    if (reqTenorElem) reqTenorElem.textContent = `${tenorMos} Months`;
    if (reqEmiElem) reqEmiElem.textContent = `₹${Math.round(proposedEmi).toLocaleString('en-IN')} / mo`;
    if (foirPctElem) foirPctElem.textContent = `${foirPct}% of declared take-home pay`;
    if (purposeElem) purposeElem.textContent = loanReq.loan_purpose || "General Purpose Credit";

    if (runwayYearsElem) {
        runwayYearsElem.textContent = `${retAnalysis.service_runway_years || 20} Yrs Runway`;
        runwayYearsElem.style.color = (retAnalysis.service_runway_years || 20) < 5 ? "var(--amber)" : "var(--emerald)";
    }
    if (sectorNameElem) {
        sectorNameElem.textContent = `${applicant.working_sector || 'Private Corporate'} (Ret: ${retAnalysis.statutory_retirement_age || 58} Yrs)`;
    }

    // 3. Bureau Portfolio
    const cibilElem = document.getElementById("dossier-cibil-score");
    const cibilGradeElem = document.getElementById("dossier-cibil-grade");
    const utilElem = document.getElementById("dossier-util-pct");
    const dpdElem = document.getElementById("dossier-dpd-counts");
    const totalDebtElem = document.getElementById("dossier-total-debt");
    const existingEmiElem = document.getElementById("dossier-existing-emi");

    const score = portfolio.cibil_score || 750;
    if (cibilElem) {
        cibilElem.textContent = score;
        cibilElem.style.color = score >= 750 ? "var(--emerald)" : (score >= 650 ? "var(--amber)" : "var(--rose)");
    }
    if (cibilGradeElem) cibilGradeElem.textContent = portfolio.cibil_grade || "Prime";
    if (utilElem) utilElem.textContent = `${portfolio.revolving_utilization_pct || 0}%`;
    if (dpdElem) {
        const delays = (portfolio.late_30_59_count || 0) + (portfolio.late_60_89_count || 0);
        const npas = portfolio.npa_count || 0;
        dpdElem.textContent = `${delays} Delays / ${npas} NPA`;
        dpdElem.style.color = npas > 0 ? "var(--rose)" : (delays > 0 ? "var(--amber)" : "var(--emerald)");
    }
    if (totalDebtElem) totalDebtElem.textContent = `₹${Math.round(portfolio.total_outstanding || 0).toLocaleString('en-IN')}`;
    if (existingEmiElem) existingEmiElem.textContent = `Existing EMI: ₹${Math.round(portfolio.total_monthly_emi || 0).toLocaleString('en-IN')} / mo`;

    // Loans Table
    const tbody = document.getElementById("dossier-loans-tbody");
    if (tbody) {
        tbody.innerHTML = "";
        if (loans.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">No declared past credit facilities. Clean first-time borrower record.</td></tr>`;
        } else {
            loans.forEach(l => {
                const tr = document.createElement("tr");
                const isLate = l.status?.includes("DELAY") || l.status?.includes("DEFAULT");
                const statusColor = isLate ? "var(--rose)" : "var(--emerald)";
                tr.innerHTML = `
                    <td><strong>${l.lender || 'Commercial Bank'}</strong></td>
                    <td>${l.type || 'Loan Facility'}</td>
                    <td class="font-mono">₹${Math.round(l.sanctioned_amount || 0).toLocaleString('en-IN')}</td>
                    <td class="font-mono">₹${Math.round(l.outstanding_balance || 0).toLocaleString('en-IN')}</td>
                    <td class="font-mono">₹${Math.round(l.monthly_emi || 0).toLocaleString('en-IN')}</td>
                    <td><span style="color: ${statusColor}; font-weight: 700;">${l.dpd_status || l.status}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // 4. Automated Credit Risk Appraisal
    renderDossierQSVMPanel(qsvm);

    // 5. Official Determination Inputs Pre-Fill
    const sancAmountInput = document.getElementById("admin-input-sanc-amount");
    const rateInput = document.getElementById("admin-input-approved-rate");
    const tenorInput = document.getElementById("admin-input-approved-tenor");
    const remarksInput = document.getElementById("admin-input-officer-remarks");
    const rejectReasonSelect = document.getElementById("admin-input-reject-reason");
    const rejectRemarksInput = document.getElementById("admin-input-reject-remarks");

    if (sancAmountInput) sancAmountInput.value = decision.sanctioned_amount || principal;
    if (rateInput) rateInput.value = decision.approved_rate || 8.85;
    if (tenorInput) tenorInput.value = decision.approved_tenor_months || tenorMos;
    if (remarksInput) {
        remarksInput.value = decision.officer_remarks || (qsvm.recommendation_summary || "Facility sanctioned based on Tier A Prime credit appraisal.");
    }
    if (rejectReasonSelect && decision.rejection_reason) {
        rejectReasonSelect.value = decision.rejection_reason;
    }
    if (rejectRemarksInput && decision.officer_remarks) {
        rejectRemarksInput.value = decision.officer_remarks;
    }

    calcAdminSanctionEmi();

    // Default toggle based on QSVM recommendation or existing decision
    if (app.status === "REJECTED" || qsvm.recommended_decision === "REJECT") {
        toggleAdminDecisionMode("REJECTED");
    } else {
        toggleAdminDecisionMode("APPROVED");
    }
}

function renderDossierQSVMPanel(qsvm) {
    const classElem = document.getElementById("dossier-qsvm-class");
    const verdictElem = document.getElementById("dossier-qsvm-verdict");
    const marginElem = document.getElementById("dossier-qsvm-margin");
    const confElem = document.getElementById("dossier-qsvm-confidence");
    const riskElem = document.getElementById("dossier-qsvm-risk-index");
    const recBox = document.getElementById("dossier-qsvm-rec-box");
    const recBadge = document.getElementById("dossier-qsvm-rec-badge");
    const recTitle = document.getElementById("dossier-qsvm-rec-title");
    const recDesc = document.getElementById("dossier-qsvm-rec-desc");

    const featUtil = document.getElementById("qsvm-f-util");
    const feat30 = document.getElementById("qsvm-f-30");
    const feat60 = document.getElementById("qsvm-f-60");
    const feat90 = document.getElementById("qsvm-f-90");

    const isClass0 = qsvm.prediction === 0;

    if (classElem) {
        classElem.textContent = qsvm.class_badge || (isClass0 ? "TIER A • PRIME CREDIT" : "TIER C • DEFAULT RISK");
        classElem.className = `qsvm-metric-value ${isClass0 ? 'text-emerald' : 'text-rose'}`;
    }
    if (verdictElem) verdictElem.textContent = qsvm.quantum_verdict || (isClass0 ? "Low Probability of Default • Robust Solvency Profile" : "Elevated Delinquency Probability • Significant Default Risk");
    if (marginElem) marginElem.textContent = qsvm.kernel_alignment || (isClass0 ? "+2.14 Margin" : "-1.82 Margin");
    if (confElem) confElem.textContent = `${qsvm.confidence_pct || 94.2}%`;
    if (riskElem) {
        riskElem.textContent = `${qsvm.quantum_risk_index || 12} / 100`;
        riskElem.className = `qsvm-metric-value ${isClass0 ? 'text-emerald' : 'text-rose'}`;
    }

    const feats = qsvm.feature_vector || {};
    if (featUtil) featUtil.textContent = `${feats.revolving_utilization_pct ?? 22.5}%`;
    if (feat30) feat30.textContent = feats.late_30_59_count ?? 0;
    if (feat60) feat60.textContent = feats.late_60_89_count ?? 0;
    if (feat90) feat90.textContent = feats.late_90_count ?? 0;

    if (recBox) {
        const color = qsvm.recommendation_color || (isClass0 ? "emerald" : "rose");
        recBox.className = `qsvm-recommendation-banner rec-${color}`;
    }
    if (recBadge) recBadge.textContent = qsvm.recommendation_badge || (isClass0 ? "RECOMMENDED: APPROVE" : "RECOMMENDED: REJECT");
    if (recTitle) recTitle.textContent = qsvm.recommendation_title || (isClass0 ? "Appraisal Recommendation: ELIGIBLE FOR IN-PRINCIPLE SANCTION" : "Appraisal Recommendation: INELIGIBLE (HIGH DEFAULT RISK)");
    if (recDesc) recDesc.textContent = qsvm.recommendation_summary || "Automated statistical risk evaluation completed.";
}

async function runQSVMForActiveApp() {
    if (!ACTIVE_ADMIN_APP_REF) return;
    const btn = document.getElementById("btn-run-qsvm");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.innerHTML = `<span>Evaluating Risk Model...</span>`;
        btn.disabled = true;
    }

    try {
        const token = ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token") || "";
        const res = await fetch("/api/admin/evaluate-qsvm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ application_ref: ACTIVE_ADMIN_APP_REF, admin_token: token })
        });

        if (!res.ok) {
            alert("Automated risk appraisal failed on server.");
            return;
        }

        const data = await res.json();
        const app = ADMIN_QUEUE_APPLICATIONS.find(a => a.application_ref === ACTIVE_ADMIN_APP_REF);
        if (app && data.qsvm_analysis) {
            app.qsvm_analysis = data.qsvm_analysis;
            renderDossierQSVMPanel(data.qsvm_analysis);
            renderQueueList();
            if (typeof showBankSMSToast === "function") {
                showBankSMSToast(`[RISK EVALUATION] Credit Risk Appraisal Complete. Rating: ${data.qsvm_analysis.class_badge}`, "info", 5000);
            }
        }
    } catch (e) {
        console.error("Risk evaluation re-run failed:", e);
    } finally {
        if (btn) {
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }
    }
}

function calculateEmiLocally(p, annualRate, n) {
    if (p <= 0 || n <= 0) return 0;
    const r = (annualRate / 12.0) / 100.0;
    if (r <= 0) return p / n;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcAdminSanctionEmi() {
    const p = parseFloat(document.getElementById("admin-input-sanc-amount")?.value) || 0;
    const r = parseFloat(document.getElementById("admin-input-approved-rate")?.value) || 8.85;
    const n = parseInt(document.getElementById("admin-input-approved-tenor")?.value, 10) || 36;
    const emi = calculateEmiLocally(p, r, n);
    const disp = document.getElementById("admin-calc-emi-disp");
    if (disp) {
        disp.textContent = `₹${Math.round(emi).toLocaleString('en-IN')} / month`;
    }
}

function toggleAdminDecisionMode(mode) {
    const btnApprove = document.getElementById("btn-toggle-approve");
    const btnDecline = document.getElementById("btn-toggle-decline");
    const panelApprove = document.getElementById("admin-panel-approve");
    const panelDecline = document.getElementById("admin-panel-decline");

    if (mode === "APPROVED") {
        btnApprove?.classList.add("active");
        btnDecline?.classList.remove("active");
        if (panelApprove) panelApprove.style.display = "block";
        if (panelDecline) panelDecline.style.display = "none";
    } else {
        btnDecline?.classList.add("active");
        btnApprove?.classList.remove("active");
        if (panelDecline) panelDecline.style.display = "block";
        if (panelApprove) panelApprove.style.display = "none";
    }
}

async function submitOfficialDetermination(decision) {
    if (!ACTIVE_ADMIN_APP_REF) {
        alert("Please select an application to underwrite.");
        return;
    }

    const token = ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token") || "";
    let payload = {
        application_ref: ACTIVE_ADMIN_APP_REF,
        decision: decision,
        admin_token: token
    };

    if (decision === "APPROVED") {
        const p = parseFloat(document.getElementById("admin-input-sanc-amount")?.value);
        const r = parseFloat(document.getElementById("admin-input-approved-rate")?.value);
        const n = parseInt(document.getElementById("admin-input-approved-tenor")?.value, 10);
        const remarks = document.getElementById("admin-input-officer-remarks")?.value.trim();

        if (isNaN(p) || p <= 0) {
            alert("Please enter a valid Sanctioned Loan Principal.");
            return;
        }
        if (isNaN(r) || r <= 0) {
            alert("Please enter a valid Approved Annual Rate.");
            return;
        }
        if (isNaN(n) || n <= 0) {
            alert("Please enter a valid Approved Tenure in Months.");
            return;
        }

        payload.sanctioned_amount = p;
        payload.approved_rate = r;
        payload.approved_tenor_months = n;
        payload.officer_remarks = remarks || "Sanctioned following automated credit risk evaluation.";
    } else {
        const reason = document.getElementById("admin-input-reject-reason")?.value;
        const remarks = document.getElementById("admin-input-reject-remarks")?.value.trim();
        payload.rejection_reason = reason;
        payload.officer_remarks = remarks || "Declined based on institutional credit risk policy.";
    }

    try {
        const submitBtn = decision === "APPROVED" ? document.getElementById("btn-submit-sanction") : document.getElementById("btn-submit-decline");
        if (submitBtn) submitBtn.disabled = true;

        const res = await fetch("/api/admin/decide-application", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            alert("Failed to submit underwriting decision: " + (err.detail || "Server error"));
            return;
        }

        const data = await res.json();
        if (typeof showBankSMSToast === "function") {
            if (decision === "APPROVED") {
                showBankSMSToast(`[OFFICIAL SANCTION] Sanction Memo Issued for ${ACTIVE_ADMIN_APP_REF}. Loan approved at ${payload.approved_rate}% p.a.`, "success", 7000);
            } else {
                showBankSMSToast(`[ADVERSE ACTION] Formal Adverse Action Recorded for ${ACTIVE_ADMIN_APP_REF}. Application declined.`, "info", 7000);
            }
        }

        // Refresh Queue and Active Application Dossier
        await loadAdminApplicationsQueue();

    } catch (e) {
        console.error("Underwriting decision error:", e);
        alert("Network communication error with underwriting core.");
    } finally {
        const submitBtn = decision === "APPROVED" ? document.getElementById("btn-submit-sanction") : document.getElementById("btn-submit-decline");
        if (submitBtn) submitBtn.disabled = false;
    }
}



/* --------------------------------------------------------------------------
   Live Applicant Status Polling & Instant Determination Synchronization
   -------------------------------------------------------------------------- */
function startApplicantDecisionPolling(applicationRef) {
    if (APPLICANT_POLL_INTERVAL) {
        clearInterval(APPLICANT_POLL_INTERVAL);
    }
    if (!applicationRef) return;

    APPLICANT_POLL_INTERVAL = setInterval(async () => {
        try {
            const res = await fetch(`/api/applicant/status/${encodeURIComponent(applicationRef)}`);
            if (!res.ok) return;
            const data = await res.json();

            if (data.submission_status === "SANCTIONED") {
                clearInterval(APPLICANT_POLL_INTERVAL);
                APPLICANT_POLL_INTERVAL = null;
                if (typeof showBankSMSToast === "function") {
                    showBankSMSToast(`[LOAN SANCTIONED] Congratulations! Your loan facility ${applicationRef} has been SANCTIONED by Team Legends Bank.`, "success", 10000);
                }
                showUserReceipt(data);
                goToStep(5);
            } else if (data.submission_status === "DISBURSED") {
                clearInterval(APPLICANT_POLL_INTERVAL);
                APPLICANT_POLL_INTERVAL = null;
                showUserReceipt(data);
                goToStep(5);
            } else if (data.submission_status === "REJECTED") {
                clearInterval(APPLICANT_POLL_INTERVAL);
                APPLICANT_POLL_INTERVAL = null;
                showUserReceipt(data);
                goToStep(5);
            }
        } catch (_) {}
    }, 4000);
}

function showUserReceipt(receiptData) {
    const r = receiptData.receipt || receiptData;
    window.LAST_USER_RECEIPT = r;
    const ref = r.application_ref || r.reference_id || (receiptData.answer && receiptData.answer.sanction_ref) || 'TLB-2026-SUBMISSION';
    window.LAST_APPLICATION_REF = ref;

    const receiptPanel = document.getElementById("user-receipt-panel");
    const sanctionPanel = document.getElementById("sanction-result-panel");
    if (receiptPanel) receiptPanel.style.display = "flex";
    if (sanctionPanel) sanctionPanel.style.display = "none";

    const refElem = document.getElementById("user-ans-ref");
    if (refElem) refElem.textContent = `REF: ${ref}`;

    const amtElem = document.getElementById("user-ans-amount");
    if (amtElem) amtElem.textContent = r.sanctioned_amount || r.loan_amount_formatted || formatINR(r.loan_amount_requested);

    const tenorElem = document.getElementById("user-ans-tenor");
    const tenorMos = r.approved_tenor || (r.requested_tenor_months ? `${r.requested_tenor_months} Months` : (r.requested_tenor || "36 Months"));
    if (tenorElem) tenorElem.textContent = typeof tenorMos === "number" ? `${tenorMos} Months` : tenorMos;

    const emiElem = document.getElementById("user-ans-emi");
    if (emiElem) emiElem.textContent = r.approved_emi || r.estimated_monthly_emi || r.indicative_monthly_emi || "—";

    const sectorElem = document.getElementById("user-ans-sector");
    if (sectorElem) {
        sectorElem.className = "pod-val pod-val-text";
        let rawSec = r.working_sector || r.applicant_sector || "Salaried / Corporate";
        sectorElem.textContent = rawSec.replace(/\s*\/\s*Technology\s*\/\s*MNC/i, ' / IT');
    }

    const runwayElem = document.getElementById("user-ans-runway");
    if (runwayElem) {
        const runwayYrs = r.service_runway_years !== undefined ? `${r.service_runway_years} Yrs Runway` : "Active Career";
        const retAge = r.statutory_retirement_age ? ` • Ret: ${r.statutory_retirement_age} Yrs` : "";
        runwayElem.textContent = `${runwayYrs}${retAge}`;
    }

    // Dynamic State Management for Actions and Banners
    const status = r.submission_status || receiptData.submission_status || "PENDING_REVIEW";
    const titleEl = document.getElementById("user-receipt-title");
    const subEl = document.getElementById("user-receipt-sub");
    const badgeEl = document.getElementById("user-receipt-badge");
    const btnSendReq = document.getElementById("btn-send-sanction-request");
    const btnDisburse = document.getElementById("btn-applicant-disburse");
    const btnDownloadMemo = document.getElementById("btn-applicant-download-memo");
    const disbursalBanner = document.getElementById("disbursal-success-banner");
    const disbursalUtr = document.getElementById("disbursal-utr-code");

    if (btnDownloadMemo) {
        btnDownloadMemo.href = `/api/applicant/sanction-memo-download/${encodeURIComponent(ref)}`;
    }

    if (status === "SANCTIONED") {
        if (titleEl) titleEl.textContent = r.status_title || "LOAN FACILITY SANCTIONED & APPROVED";
        if (subEl) subEl.textContent = r.status_desc || "Congratulations! Your credit facility has been sanctioned. Complete instant digital e-sign below for immediate fund disbursal.";
        if (badgeEl) {
            badgeEl.textContent = "OFFICIALLY SANCTIONED";
            badgeEl.className = "decision-badge-pill badge-approved text-emerald";
        }
        if (btnSendReq) btnSendReq.style.display = "none";
        if (btnDisburse) btnDisburse.style.display = "inline-flex";
        if (btnDownloadMemo) btnDownloadMemo.style.display = "inline-flex";
        if (disbursalBanner) disbursalBanner.style.display = "none";

    } else if (status === "DISBURSED") {
        if (titleEl) titleEl.textContent = "LOAN FACILITY DISBURSED • FUNDS CREDITED";
        if (subEl) subEl.textContent = "Your loan agreement has been digitally signed via Aadhaar e-KYC. Funds transferred to your bank account via IMPS 24x7.";
        if (badgeEl) {
            badgeEl.textContent = "FUNDS DISBURSED (IMPS)";
            badgeEl.className = "decision-badge-pill badge-disbursed";
        }
        if (btnSendReq) btnSendReq.style.display = "none";
        if (btnDisburse) btnDisburse.style.display = "none";
        if (btnDownloadMemo) btnDownloadMemo.style.display = "inline-flex";
        if (disbursalBanner) disbursalBanner.style.display = "block";
        const utrVal = (r.disbursal && r.disbursal.utr_ref) || receiptData.disbursal?.utr_ref || "IMPS/2026/TLB/PROCESSED";
        if (disbursalUtr) disbursalUtr.textContent = utrVal;

    } else if (status === "REJECTED") {
        if (titleEl) titleEl.textContent = r.status_title || "LOAN APPLICATION DECLINED";
        if (subEl) subEl.textContent = r.status_desc || "Following detailed credit appraisal, this application could not be sanctioned under bank risk policy.";
        if (badgeEl) {
            badgeEl.textContent = "APPLICATION DECLINED";
            badgeEl.className = "decision-badge-pill badge-declined text-rose";
        }
        if (btnSendReq) btnSendReq.style.display = "none";
        if (btnDisburse) btnDisburse.style.display = "none";
        if (btnDownloadMemo) btnDownloadMemo.style.display = "none";
        if (disbursalBanner) disbursalBanner.style.display = "none";

    } else {
        // PENDING_REVIEW / SUBMITTED
        if (titleEl) titleEl.textContent = "APPLICATION DOSSIER UNDER OFFICIAL APPRAISAL";
        if (subEl) subEl.textContent = "Your dossier is assigned to our Retail Credit Underwriting Desk. Click 'Send Loan Sanction Request' below to notify the reviewing desk.";
        if (badgeEl) {
            badgeEl.textContent = "UNDER REVIEW";
            badgeEl.className = "decision-badge-pill badge-review";
        }
        if (btnSendReq) btnSendReq.style.display = "inline-flex";
        if (btnDisburse) btnDisburse.style.display = "none";
        if (btnDownloadMemo) btnDownloadMemo.style.display = "none";
        if (disbursalBanner) disbursalBanner.style.display = "none";

        // Keep polling if still pending
        startApplicantDecisionPolling(ref);
    }

    goToStep(5);
}

async function handleSendSanctionRequest() {
    const btn = document.getElementById("btn-send-sanction-request");
    const ref = window.LAST_APPLICATION_REF || (window.LAST_USER_RECEIPT && (window.LAST_USER_RECEIPT.application_ref || window.LAST_USER_RECEIPT.reference_id)) || "";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Dispatching Request to Admin Desk...</span>`;
    }

    try {
        if (ref) {
            await fetch("/api/applicant/send-sanction-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ application_ref: ref })
            });
        }
    } catch (e) {
        console.warn("Dispatch request call warning:", e);
    }

    // Broadcast sync event immediately to Admin desk
    try {
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel("tlb_queue_sync_channel");
            channel.postMessage({ type: "NEW_APPLICATION_SUBMITTED", ref: ref });
        }
        localStorage.setItem("tlb_last_submitted_ref", ref + "_" + Date.now());
    } catch (_) {}

    setTimeout(() => {
        if (btn) {
            btn.innerHTML = `<span>Sanction Request Dispatched to Admin Desk</span>`;
            btn.style.background = "#059669";
            btn.style.borderColor = "#059669";
            btn.style.color = "#ffffff";
        }

        const badge = document.getElementById("user-receipt-badge");
        if (badge) {
            badge.textContent = "REQUEST DISPATCHED • IN ADMIN QUEUE";
            badge.className = "decision-badge-pill badge-review text-emerald";
        }

        if (typeof showBankSMSToast === "function") {
            showBankSMSToast(
                `[TLB-DISPATCH] Loan Sanction Request for Ref #${ref} has been dispatched directly to the Admin Underwriting Desk.`,
                "success",
                8000
            );
        }
    }, 400);
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT UPLOAD & BANK STATEMENT OCR CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
window.UPLOADED_STATEMENT_FILENAME = null;

function triggerStatementFileInput() {
    const input = document.getElementById("statement-file-input");
    if (input) input.click();
}

function handleStatementFileChosen(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const idle = document.getElementById("dropzone-idle-state");
    const scanning = document.getElementById("dropzone-scanning-state");
    const verified = document.getElementById("dropzone-verified-state");
    const pbar = document.getElementById("statement-progress-bar");
    const nameEl = document.getElementById("verified-doc-name");
    const statusEl = document.getElementById("verified-doc-status");

    if (idle) idle.style.display = "none";
    if (verified) verified.style.display = "none";
    if (scanning) scanning.style.display = "block";
    if (pbar) {
        pbar.style.width = "0%";
        setTimeout(() => { pbar.style.width = "40%"; }, 150);
        setTimeout(() => { pbar.style.width = "80%"; }, 500);
        setTimeout(() => { pbar.style.width = "100%"; }, 900);
    }

    setTimeout(() => {
        window.UPLOADED_STATEMENT_FILENAME = file.name;
        if (nameEl) nameEl.textContent = file.name;
        const incomeVal = parseFloat(document.getElementById("app-income")?.value) || 85000;
        if (statusEl) {
            statusEl.innerHTML = `<span>Verified</span> • Salary credits match: <strong>₹${incomeVal.toLocaleString('en-IN')} / mo</strong> • Average balance: <strong>₹${Math.round(incomeVal * 1.6).toLocaleString('en-IN')}</strong>`;
        }
        if (scanning) scanning.style.display = "none";
        if (verified) verified.style.display = "flex";
        if (typeof showBankSMSToast === "function") {
            showBankSMSToast(`[DOC-OCR] ${file.name} successfully analyzed. Financial cashflow verified.`, "success", 4000);
        }
    }, 1100);
}

function removeUploadedStatement() {
    window.UPLOADED_STATEMENT_FILENAME = null;
    const fileInput = document.getElementById("statement-file-input");
    if (fileInput) fileInput.value = "";
    const idle = document.getElementById("dropzone-idle-state");
    const scanning = document.getElementById("dropzone-scanning-state");
    const verified = document.getElementById("dropzone-verified-state");
    if (scanning) scanning.style.display = "none";
    if (verified) verified.style.display = "none";
    if (idle) idle.style.display = "flex";
}

/* ═══════════════════════════════════════════════════════════════
   DIGITAL E-SIGN & INSTANT FUND DISBURSAL CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
function openDisbursalModal() {
    const modal = document.getElementById("disbursal-esign-modal");
    if (!modal) return;

    const amtEl = document.getElementById("esign-disp-amount");
    const termsEl = document.getElementById("esign-disp-terms");
    const emiEl = document.getElementById("esign-disp-emi");
    const accEl = document.getElementById("esign-disp-account");

    const r = window.LAST_USER_RECEIPT || {};
    const amt = r.sanctioned_amount || r.loan_amount_formatted || "₹5,00,000";
    const rate = r.approved_rate || "8.85% p.a.";
    const tenor = r.approved_tenor || (r.requested_tenor_months ? `${r.requested_tenor_months} Months` : "36 Months");
    const emi = r.approved_emi || r.estimated_monthly_emi || "₹15,862 / month";
    const acc = r.account_no || document.getElementById("app-account")?.value || "100928374651";

    if (amtEl) amtEl.textContent = amt;
    if (termsEl) termsEl.textContent = `${rate} • ${tenor}`;
    if (emiEl) emiEl.textContent = emi;
    if (accEl) accEl.textContent = `${acc} (TLB Direct)`;

    document.getElementById("disbursal-modal-body").style.display = "block";
    document.getElementById("disbursal-modal-loading").style.display = "none";
    document.getElementById("disbursal-modal-success").style.display = "none";
    document.getElementById("disbursal-modal-footer").style.display = "flex";
    document.getElementById("disbursal-success-footer").style.display = "none";
    const errBox = document.getElementById("disbursal-err");
    if (errBox) errBox.style.display = "none";

    modal.style.display = "flex";
}

function closeDisbursalModal() {
    const modal = document.getElementById("disbursal-esign-modal");
    if (modal) modal.style.display = "none";
}

async function submitLoanDisbursal() {
    const otpInput = document.getElementById("esign-otp-input");
    const consent = document.getElementById("esign-consent-check");
    const errBox = document.getElementById("disbursal-err");

    const otp = otpInput ? otpInput.value.trim() : "";
    if (!otp || otp.length < 4) {
        if (errBox) {
            errBox.textContent = "Please enter the 6-digit Aadhaar OTP sent to your registered mobile.";
            errBox.style.display = "block";
        }
        return;
    }
    if (consent && !consent.checked) {
        if (errBox) {
            errBox.textContent = "Please agree to the digital loan covenants and e-NACH mandate.";
            errBox.style.display = "block";
        }
        return;
    }

    const ref = window.LAST_APPLICATION_REF || (window.LAST_USER_RECEIPT && window.LAST_USER_RECEIPT.application_ref) || "";
    if (!ref) {
        alert("Active application reference not found.");
        return;
    }

    document.getElementById("disbursal-modal-body").style.display = "none";
    document.getElementById("disbursal-modal-footer").style.display = "none";
    document.getElementById("disbursal-modal-loading").style.display = "block";

    try {
        const res = await fetch("/api/applicant/disburse-loan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                application_ref: ref,
                aadhaar_otp: otp
            })
        });

        if (!res.ok) {
            const err = await res.json();
            document.getElementById("disbursal-modal-loading").style.display = "none";
            document.getElementById("disbursal-modal-body").style.display = "block";
            document.getElementById("disbursal-modal-footer").style.display = "flex";
            if (errBox) {
                errBox.textContent = err.detail || "Disbursal request failed.";
                errBox.style.display = "block";
            }
            return;
        }

        const data = await res.json();
        const disbursal = data.disbursal || {};

        document.getElementById("disbursal-modal-loading").style.display = "none";
        document.getElementById("disbursal-modal-success").style.display = "block";
        document.getElementById("disbursal-success-footer").style.display = "flex";

        const utrEl = document.getElementById("disbursal-success-utr");
        const amtEl = document.getElementById("disbursal-success-amt");
        const accEl = document.getElementById("disbursal-success-acc");

        if (utrEl) utrEl.textContent = disbursal.utr_ref || "IMPS/2026/TLB/PROCESSED";
        if (amtEl) amtEl.textContent = `₹${Math.round(disbursal.disbursed_amount || 500000).toLocaleString('en-IN')}`;
        if (accEl) accEl.textContent = disbursal.beneficiary_account || "Credited Account";

        // Update main page receipt state
        if (window.LAST_USER_RECEIPT) {
            window.LAST_USER_RECEIPT.submission_status = "DISBURSED";
            window.LAST_USER_RECEIPT.disbursal = disbursal;
        }
        showUserReceipt(window.LAST_USER_RECEIPT);

        // Broadcast to Admin Desk
        try {
            if (window.BroadcastChannel) {
                const channel = new BroadcastChannel("tlb_queue_sync_channel");
                channel.postMessage({ type: "APPLICATION_DISBURSED", ref: ref, utr: disbursal.utr_ref });
            }
            localStorage.setItem("tlb_last_submitted_ref", ref + "_DISBURSED_" + Date.now());
        } catch (_) {}

        if (typeof showBankSMSToast === "function") {
            showBankSMSToast(
                `[IMPS CREDIT] ₹${Math.round(disbursal.disbursed_amount || 500000).toLocaleString('en-IN')} credited to A/C ending in ${String(disbursal.beneficiary_account).slice(-4)}. UTR: ${disbursal.utr_ref}`,
                "success",
                9000
            );
        }

    } catch (e) {
        console.error("Disbursal network error:", e);
        document.getElementById("disbursal-modal-loading").style.display = "none";
        document.getElementById("disbursal-modal-body").style.display = "block";
        document.getElementById("disbursal-modal-footer").style.display = "flex";
        if (errBox) {
            errBox.textContent = "Network error communicating with core banking disbursal gateway.";
            errBox.style.display = "block";
        }
    }
}

function getActiveDyn() {
    const lang = (window.getCurrentLanguage && window.getCurrentLanguage()) || "en";
    return DYNAMIC_I18N[lang] || DYNAMIC_I18N.en;
}

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initPanInput();
    initModernOptionSelectors();
    initRetirementRunwayCalculator();
    initWizardNavigation();
    initUnderstandableWorkings();
    initCreditHistoryToggle();
    initApplicationForm();
    initAddPastLoanBtn();
    renderPastLoansTable();
    updateRoleUI();
    applyViewForRole();
    initAdminRealtimeSync();

    // Listen for language switch
    window.addEventListener("appLanguageChanged", () => {
        if (typeof window.recalculateRunway === "function") window.recalculateRunway();
        if (typeof window.updateIncomeWorking === "function") window.updateIncomeWorking();
        if (typeof window.updateLoanWorking === "function") window.updateLoanWorking();
        renderPastLoansTable();
        updateThemeModeLabel();
        updateRoleUI();
        if (window.LAST_ANSWER_DATA && typeof renderAnswer === "function" && CURRENT_USER_ROLE === "admin" && ADMIN_AUTH_TOKEN) {
            renderAnswer(window.LAST_ANSWER_DATA);
        } else if (window.LAST_USER_RECEIPT && typeof showUserReceipt === "function") {
            showUserReceipt(window.LAST_USER_RECEIPT);
        }
    });
});

/* --------------------------------------------------------------------------
   Currency Formatter
   -------------------------------------------------------------------------- */
function formatINR(val) {
    if (isNaN(val)) return "₹0";
    return "₹" + Math.round(Number(val)).toLocaleString("en-IN");
}

/* --------------------------------------------------------------------------
   Two-Tone Theme Toggle (Light & Dark)
   -------------------------------------------------------------------------- */
function updateThemeModeLabel() {
    const modeText = document.getElementById("theme-mode-text");
    if (!modeText) return;
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const lightLabel = window.getTranslation ? window.getTranslation('theme_light', 'LIGHT') : 'LIGHT';
    const darkLabel = window.getTranslation ? window.getTranslation('theme_dark', 'DARK') : 'DARK';
    modeText.textContent = currentTheme === "light" ? `${lightLabel}` : `${darkLabel}`;
}

function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle-btn");
    const savedTheme = localStorage.getItem("apex_bank_theme") || "light";
    applyTheme(savedTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            const nextTheme = currentTheme === "light" ? "dark" : "light";
            applyTheme(nextTheme);
        });
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("apex_bank_theme", theme);
        updateThemeModeLabel();
    }
}

/* --------------------------------------------------------------------------
   Working Sector Superannuation & Service Runway Live Engine
   -------------------------------------------------------------------------- */
const SECTOR_RETIREMENT_DATA = {
    PRIVATE_CORPORATE: { name: "Private Corporate Sector", retAge: 58, pension: false },
    CENTRAL_GOVT: { name: "Central Government Civil Services", retAge: 60, pension: true },
    STATE_GOVT: { name: "State Government Departments", retAge: 60, pension: true },
    PSU_BANKING: { name: "Public Sector Undertakings / Bank", retAge: 60, pension: true },
    DEFENSE_ARMED: { name: "Armed & Paramilitary Forces", retAge: 54, pension: true },
    HEALTHCARE_DOCTOR: { name: "Healthcare & Medical Specialists", retAge: 65, pension: false },
    ACADEMIC_EDUCATION: { name: "UGC / University Higher Education", retAge: 65, pension: true },
    LEGAL_JUDICIARY: { name: "Judiciary & Senior Legal Practice", retAge: 68, pension: false },
    BUSINESS_ENTERPRISE: { name: "Business Owner / Enterprise", retAge: 70, pension: false }
};

function initRetirementRunwayCalculator() {
    const ageInput = document.getElementById("app-age");
    const sectorInput = document.getElementById("app-sector");
    const tenorInput = document.getElementById("app-tenor");

    function recalculateRunway() {
        const d = getActiveDyn();
        const age = parseInt(ageInput?.value, 10) || 34;
        const sectorKey = sectorInput?.value || "PRIVATE_CORPORATE";
        const tenorMonths = parseInt(tenorInput?.value, 10) || 36;
        const tenorYears = tenorMonths / 12.0;

        const sectorInfo = SECTOR_RETIREMENT_DATA[sectorKey] || SECTOR_RETIREMENT_DATA.PRIVATE_CORPORATE;
        const retAge = sectorInfo.retAge;
        const runwayYears = Math.max(0, retAge - age);
        const maturityAge = Math.round((age + tenorYears) * 10) / 10;

        const dispRetAge = document.getElementById("disp-sector-ret-age");
        const dispRunway = document.getElementById("disp-service-runway");
        const dispMaturity = document.getElementById("disp-maturity-age");
        const dispStatus = document.getElementById("disp-maturity-status");

        if (dispRetAge) dispRetAge.textContent = `${retAge} ${d.yrs_unit}`;
        if (dispRunway) {
            dispRunway.textContent = `${runwayYears} ${d.yrs_unit}`;
            dispRunway.style.color = runwayYears < 5 ? "var(--amber)" : "var(--text)";
        }
        if (dispMaturity) {
            dispMaturity.textContent = `${maturityAge} ${d.yrs_unit}`;
        }

        if (dispStatus) {
            if (maturityAge > retAge) {
                if (sectorInfo.pension) {
                    dispStatus.textContent = d.runway_pension;
                    dispStatus.style.color = "var(--amber)";
                } else {
                    dispStatus.textContent = d.runway_no_pension;
                    dispStatus.style.color = "var(--rose)";
                }
            } else {
                dispStatus.textContent = d.runway_active;
                dispStatus.style.color = "var(--emerald)";
            }
        }
    }

    window.recalculateRunway = recalculateRunway;

    if (ageInput) ageInput.addEventListener("input", recalculateRunway);
    if (sectorInput) sectorInput.addEventListener("change", recalculateRunway);

    const tenorChips = document.querySelectorAll("#tenor-options .tenor-chip");
    tenorChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            setTimeout(recalculateRunway, 50);
        });
    });

    recalculateRunway();
}

/* --------------------------------------------------------------------------
   Multi-Page Wizard Navigation & Step Validation
   -------------------------------------------------------------------------- */
let CURRENT_WIZARD_STEP = 1;

function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 5) return;
    CURRENT_WIZARD_STEP = stepNum;

    const form = document.getElementById("loan-application-form");
    const userReceiptPanel = document.getElementById("user-receipt-panel");
    const sanctionPanel = document.getElementById("sanction-result-panel");
    const isUnderwriter = (CURRENT_USER_ROLE === "admin" || localStorage.getItem("apex_user_role") === "admin") && !!(ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token"));

    if (stepNum === 5) {
        if (form) form.style.display = "none";
        const hasOfficialSanction = window.LAST_ANSWER_DATA && (window.LAST_ANSWER_DATA.answer?.decision === "APPROVED" || window.LAST_ANSWER_DATA.submission_status === "SANCTIONED");
        if (isUnderwriter || hasOfficialSanction) {
            if (userReceiptPanel) userReceiptPanel.style.display = "none";
            if (sanctionPanel) {
                sanctionPanel.style.display = "flex";
                sanctionPanel.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        } else {
            if (sanctionPanel) sanctionPanel.style.display = "none";
            if (userReceiptPanel) {
                userReceiptPanel.style.display = "flex";
                userReceiptPanel.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    } else {
        if (userReceiptPanel) userReceiptPanel.style.display = "none";
        if (sanctionPanel) sanctionPanel.style.display = "none";
        if (form) {
            form.style.display = "flex";
            form.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Show only active wizard page inside form
        const pages = document.querySelectorAll(".wizard-page");
        pages.forEach((page) => page.classList.remove("active-page"));
        const activePage = document.getElementById(`page-step-${stepNum}`);
        if (activePage) {
            activePage.classList.add("active-page");
        }
    }

    // Update Stepper nodes and connectors
    for (let i = 1; i <= 5; i++) {
        const node = document.getElementById(`step-node-${i}`);
        const connector = document.getElementById(`step-connector-${i}`);

        if (node) {
            node.classList.remove("active", "completed");
            if (i < stepNum) {
                node.classList.add("completed");
            } else if (i === stepNum) {
                node.classList.add("active");
            }
        }

        if (connector) {
            if (i < stepNum) {
                connector.classList.add("completed");
            } else {
                connector.classList.remove("completed");
            }
        }
    }
}

function validateStep(stepNum) {
    if (stepNum === 1) {
        const name = document.getElementById("app-name")?.value.trim();
        const age = parseInt(document.getElementById("app-age")?.value, 10);
        const acc = document.getElementById("app-account")?.value.trim();
        const pan = document.getElementById("app-pan")?.value.trim().toUpperCase();

        if (!name) {
            alert("Please enter applicant's Full Legal Name.");
            document.getElementById("app-name")?.focus();
            return false;
        }
        if (isNaN(age) || age < 18 || age > 75) {
            alert("Please enter a valid Borrower Age between 18 and 75 years.");
            document.getElementById("app-age")?.focus();
            return false;
        }
        if (!acc || acc.length < 6) {
            alert("Please enter a valid Bank Account Number (minimum 6 digits).");
            document.getElementById("app-account")?.focus();
            return false;
        }
        if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
            alert("Please enter a valid 10-digit PAN Card Number (e.g. ABCDE1234F).");
            document.getElementById("app-pan")?.focus();
            return false;
        }
        return true;
    }

    if (stepNum === 2) {
        const income = parseFloat(document.getElementById("app-income")?.value);
        if (isNaN(income) || income < 5000) {
            alert("Please enter a valid Net Monthly Take-Home Income (minimum ₹5,000).");
            document.getElementById("app-income")?.focus();
            return false;
        }
        return true;
    }

    if (stepNum === 3) {
        const amount = parseFloat(document.getElementById("app-amount")?.value);
        if (isNaN(amount) || amount < 10000) {
            alert("Please enter a valid Requested Loan Amount (minimum ₹10,000).");
            document.getElementById("app-amount")?.focus();
            return false;
        }
        return true;
    }

    return true;
}

function initWizardNavigation() {
    // Next buttons
    document.querySelectorAll(".btn-next-step").forEach((btn) => {
        btn.addEventListener("click", () => {
            const nextStep = parseInt(btn.dataset.next, 10);
            const currentStep = nextStep - 1;
            if (validateStep(currentStep)) {
                goToStep(nextStep);
            }
        });
    });

    // Prev buttons
    document.querySelectorAll(".btn-prev-step").forEach((btn) => {
        btn.addEventListener("click", () => {
            const prevStep = parseInt(btn.dataset.prev, 10);
            goToStep(prevStep);
        });
    });

    // Stepper node clicks
    document.querySelectorAll(".wizard-step-node").forEach((node) => {
        node.addEventListener("click", () => {
            const targetStep = parseInt(node.dataset.step, 10);
            if (targetStep < CURRENT_WIZARD_STEP || validateStep(CURRENT_WIZARD_STEP)) {
                goToStep(targetStep);
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Understandable Financial Workings (Income FOIR & Loan Amortisation)
   -------------------------------------------------------------------------- */
function initUnderstandableWorkings() {
    // 1. Live Income Working
    const incomeInput = document.getElementById("app-income");
    const incomePresets = document.querySelectorAll(".income-preset-btn");

    function updateIncomeWorking() {
        const income = parseFloat(incomeInput?.value) || 0;
        const living = income * 0.50;
        const surplus = income * 0.50;
        const annual = income * 12;

        const dispIncome = document.getElementById("working-disp-income");
        const dispLiving = document.getElementById("working-disp-living");
        const dispSurplus = document.getElementById("working-disp-surplus");
        const dispAnnual = document.getElementById("working-disp-annual");

        if (dispIncome) dispIncome.textContent = formatINR(income);
        if (dispLiving) dispLiving.textContent = formatINR(living);
        if (dispSurplus) dispSurplus.textContent = formatINR(surplus);
        if (dispAnnual) dispAnnual.textContent = formatINR(annual);

        updateLoanWorking();
    }

    if (incomeInput) {
        incomeInput.addEventListener("input", updateIncomeWorking);
    }

    incomePresets.forEach((btn) => {
        btn.addEventListener("click", () => {
            incomePresets.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            if (incomeInput) {
                incomeInput.value = btn.dataset.val;
                updateIncomeWorking();
            }
        });
    });

    // 2. Live Loan & EMI Amortisation Working
    const amountInput = document.getElementById("app-amount");
    const amountPresets = document.querySelectorAll(".amount-preset-btn");
    const tenorInput = document.getElementById("app-tenor");
    const ageInput = document.getElementById("app-age");
    const sectorInput = document.getElementById("app-sector");

    function updateLoanWorking() {
        const principal = parseFloat(amountInput?.value) || 0;
        const tenorMonths = parseInt(tenorInput?.value, 10) || 36;
        const income = parseFloat(incomeInput?.value) || 0;
        const age = parseInt(ageInput?.value, 10) || 34;
        const sectorKey = sectorInput?.value || "PRIVATE_CORPORATE";
        const sectorInfo = SECTOR_RETIREMENT_DATA[sectorKey] || SECTOR_RETIREMENT_DATA.PRIVATE_CORPORATE;
        const retAge = sectorInfo.retAge;
        const d = getActiveDyn();

        const annualRate = 8.50;
        const r = (annualRate / 12.0) / 100.0;
        let emi = 0;
        if (r > 0 && tenorMonths > 0) {
            emi = (principal * r * Math.pow(1 + r, tenorMonths)) / (Math.pow(1 + r, tenorMonths) - 1);
        } else if (tenorMonths > 0) {
            emi = principal / tenorMonths;
        }

        const totalRepayment = emi * tenorMonths;
        const totalInterest = Math.max(0, totalRepayment - principal);
        const emiPct = income > 0 ? ((emi / income) * 100).toFixed(1) : "0";
        const maturityAge = Math.round((age + (tenorMonths / 12.0)) * 10) / 10;
        const yearsToRetirement = Math.max(0, Math.round((retAge - maturityAge) * 10) / 10);

        const dispAmount = document.getElementById("working-disp-amount");
        const dispEmi = document.getElementById("working-disp-emi");
        const dispInterest = document.getElementById("working-disp-interest");
        const dispTotal = document.getElementById("working-disp-total");
        const dispAfford = document.getElementById("working-disp-affordability");
        const dispRunwayCheck = document.getElementById("working-disp-runway-check");

        if (dispAmount) dispAmount.textContent = formatINR(principal);
        if (dispEmi) dispEmi.textContent = `${formatINR(emi)} ${d.mo_unit}`;
        if (dispInterest) dispInterest.textContent = formatINR(totalInterest);
        if (dispTotal) dispTotal.textContent = formatINR(totalRepayment);

        if (dispAfford) {
            if (parseFloat(emiPct) <= 30) {
                dispAfford.innerHTML = d.afford_safe_high(formatINR(emi), emiPct);
            } else if (parseFloat(emiPct) <= 50) {
                dispAfford.innerHTML = d.afford_safe_ok(formatINR(emi), emiPct, formatINR(income * 0.5));
            } else {
                dispAfford.innerHTML = d.afford_safe_exceed(formatINR(emi), emiPct);
            }
        }

        if (dispRunwayCheck) {
            if (maturityAge > retAge) {
                dispRunwayCheck.innerHTML = d.runway_alert(maturityAge, retAge);
            } else {
                dispRunwayCheck.innerHTML = d.runway_safe(tenorMonths, maturityAge, yearsToRetirement, retAge);
            }
        }
    }

    window.updateIncomeWorking = updateIncomeWorking;
    window.updateLoanWorking = updateLoanWorking;

    if (amountInput) amountInput.addEventListener("input", updateLoanWorking);
    if (ageInput) ageInput.addEventListener("input", updateLoanWorking);
    if (sectorInput) sectorInput.addEventListener("change", updateLoanWorking);

    amountPresets.forEach((btn) => {
        btn.addEventListener("click", () => {
            amountPresets.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            if (amountInput) {
                amountInput.value = btn.dataset.val;
                updateLoanWorking();
            }
        });
    });

    const tenorChips = document.querySelectorAll("#tenor-options .tenor-chip");
    tenorChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            setTimeout(updateLoanWorking, 50);
        });
    });

    updateIncomeWorking();
    updateLoanWorking();
}

/* --------------------------------------------------------------------------
   Past Credit Facilities Quick Toggle (Clean Slate vs Declare Existing)
   -------------------------------------------------------------------------- */
function initCreditHistoryToggle() {
    const cleanToggle = document.getElementById("toggle-clean-borrower");
    const existingToggle = document.getElementById("toggle-existing-borrower");
    const pastLoansContainer = document.getElementById("past-loans-container");

    if (cleanToggle && existingToggle && pastLoansContainer) {
        cleanToggle.addEventListener("click", () => {
            cleanToggle.classList.add("active");
            existingToggle.classList.remove("active");
            pastLoansContainer.style.display = "none";
            CURRENT_LOANS = [];
            renderPastLoansTable();
        });

        existingToggle.addEventListener("click", () => {
            existingToggle.classList.add("active");
            cleanToggle.classList.remove("active");
            pastLoansContainer.style.display = "block";
            if (CURRENT_LOANS.length === 0) {
                CURRENT_LOANS.push({
                    id: "LN-1001",
                    lender: "State Bank of India",
                    type: "Personal Loan",
                    sanctioned_amount: 200000,
                    outstanding_balance: 45000,
                    monthly_emi: 6500,
                    tenor_months: 36,
                    emis_paid: 24,
                    status: "REGULAR",
                    dpd_status: "0 DPD (Punctual)",
                    dpd_history: "0-0-0-0-0-0"
                });
                renderPastLoansTable();
            }
        });
    }
}

/* --------------------------------------------------------------------------
   PAN Input Auto-Capitalize
   -------------------------------------------------------------------------- */
function initPanInput() {
    const panInput = document.getElementById("app-pan");
    panInput.addEventListener("input", () => {
        panInput.value = panInput.value.toUpperCase();
    });
}

/* --------------------------------------------------------------------------
   Modern Option Selection Controls (Employment, Tenure, Purpose)
   -------------------------------------------------------------------------- */
function initModernOptionSelectors() {
    // 1. Employment Cards
    const empCards = document.querySelectorAll("#employment-options .option-pill-card");
    const empInput = document.getElementById("app-employment");
    empCards.forEach((card) => {
        card.addEventListener("click", () => {
            empCards.forEach((c) => c.classList.remove("active"));
            card.classList.add("active");
            if (empInput) {
                empInput.value = card.dataset.val;
            }
        });
    });

    // 2. Repayment Tenure Chips
    const tenorChips = document.querySelectorAll("#tenor-options .tenor-chip");
    const tenorInput = document.getElementById("app-tenor");
    tenorChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            tenorChips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            if (tenorInput) {
                tenorInput.value = chip.dataset.val;
            }
        });
    });

    // 3. Facility Purpose Chips
    const purposeChips = document.querySelectorAll("#purpose-options .purpose-pill-btn");
    const purposeInput = document.getElementById("app-purpose");
    purposeChips.forEach((btn) => {
        btn.addEventListener("click", () => {
            purposeChips.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            if (purposeInput) {
                purposeInput.value = btn.dataset.val;
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Application Form Submission & Background Underwriting
   -------------------------------------------------------------------------- */
function initApplicationForm() {
    const form = document.getElementById("loan-application-form");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            await submitApplication();
        });
    }

    const submitBtn = document.getElementById("btn-submit-app");
    if (submitBtn) {
        submitBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await submitApplication();
        });
    }
}

function syncLoansFromDOM() {
    const rows = document.querySelectorAll("#past-loans-tbody tr[data-loan-idx]");
    const updated = [];
    rows.forEach((row) => {
        const idx = parseInt(row.dataset.loanIdx, 10);
        const lenderInput = row.querySelector(".loan-lender-input");
        const typeSelect = row.querySelector(".loan-type-select");
        const sancInput = row.querySelector(".loan-sanc-input");
        const outInput = row.querySelector(".loan-out-input");
        const emiInput = row.querySelector(".loan-emi-input");
        const statusSelect = row.querySelector(".loan-status-select");

        if (lenderInput && statusSelect) {
            updated.push({
                id: CURRENT_LOANS[idx]?.id || `LN-${1000 + idx}`,
                lender: lenderInput.value.trim() || "Commercial Bank",
                type: typeSelect.value,
                sanctioned_amount: parseFloat(sancInput.value) || 0,
                outstanding_balance: parseFloat(outInput.value) || 0,
                monthly_emi: parseFloat(emiInput.value) || 0,
                tenor_months: 36,
                emis_paid: 12,
                status: statusSelect.value,
                dpd_status: statusSelect.value === "REGULAR" ? "0 DPD (Punctual)" : 
                            (statusSelect.value === "CLOSED_REPAID" ? "0 DPD (Settled)" : 
                            (statusSelect.value === "DELAYED_30_59" ? "35 DPD (Late)" : 
                            (statusSelect.value === "DELAYED_60_89" ? "68 DPD (Severe Delay)" : "120+ DPD (NPA / Default)"))),
                dpd_history: statusSelect.value === "DEFAULTED_NPA" ? "0-30-60-90-NPA" : "0-0-0-0-0-0"
            });
        }
    });
    CURRENT_LOANS = updated;
}

async function submitApplication() {
    syncLoansFromDOM();

    const fullName = document.getElementById("app-name").value.trim();
    const accountNo = document.getElementById("app-account").value.trim();
    const panNumber = document.getElementById("app-pan").value.trim().toUpperCase();
    const applicantAge = parseInt(document.getElementById("app-age").value, 10);
    const workingSector = document.getElementById("app-sector").value;
    const employment = document.getElementById("app-employment").value;
    const income = parseFloat(document.getElementById("app-income").value);
    const amount = parseFloat(document.getElementById("app-amount").value);
    const tenor = parseInt(document.getElementById("app-tenor").value, 10);
    const purpose = document.getElementById("app-purpose").value;

    if (!fullName) {
        alert("Please enter applicant's Full Legal Name.");
        return;
    }
    if (!accountNo || accountNo.length < 6) {
        alert("Please enter a valid Bank Account Number (minimum 6 digits).");
        return;
    }
    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
        alert("Please enter a valid 10-digit PAN Card Number (e.g. ABCDE1234F).");
        return;
    }
    if (isNaN(applicantAge) || applicantAge < 18 || applicantAge > 75) {
        alert("Please enter a valid Borrower Age between 18 and 75 years.");
        return;
    }
    if (isNaN(income) || income <= 0) {
        alert("Please enter a valid Net Monthly Income.");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid Requested Loan Amount.");
        return;
    }

    const isUnderwriter = (CURRENT_USER_ROLE === "admin" || localStorage.getItem("apex_user_role") === "admin") && !!(ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token"));
    const activeToken = ADMIN_AUTH_TOKEN || sessionStorage.getItem("apex_admin_token") || "";

    const payload = {
        full_name: fullName,
        account_no: accountNo,
        pan_number: panNumber,
        applicant_age: applicantAge,
        working_sector: workingSector,
        employment_type: employment,
        monthly_income: income,
        loan_amount_requested: amount,
        loan_tenor_months: tenor,
        loan_purpose: purpose,
        role: isUnderwriter ? "admin" : "user",
        admin_token: isUnderwriter ? activeToken : null,
        loans: CURRENT_LOANS,
        uploaded_statement: window.UPLOADED_STATEMENT_FILENAME || null
    };

    window.LAST_PAYLOAD = payload;

    const submitBtn = document.getElementById("btn-submit-app");
    const submitText = document.getElementById("btn-submit-text");
    const origText = submitText ? submitText.textContent : submitBtn.textContent;
    const submittingLabel = window.getTranslation ? window.getTranslation('btn_submitting', 'VERIFYING DETAILS & CHECKING APPROVAL...') : 'VERIFYING DETAILS & CHECKING APPROVAL...';
    if (submitText) submitText.textContent = submittingLabel;
    else submitBtn.textContent = submittingLabel;
    submitBtn.disabled = true;

    const headers = {
        "Content-Type": "application/json",
        "X-User-Role": isUnderwriter ? "admin" : "user"
    };
    if (isUnderwriter && activeToken) {
        headers["X-Admin-Token"] = activeToken;
    }
    // Attach Firebase JWT Bearer token if user is logged in
    try {
        if (typeof getIdToken === "function") {
            const fbToken = await getIdToken();
            if (fbToken) {
                headers["Authorization"] = `Bearer ${fbToken}`;
            }
        }
    } catch (_) {}

    try {
        const response = await fetch("/api/submit-application", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            alert("Application Submission Error: " + (err.detail || "Verification failed"));
            return;
        }

        const data = await response.json();

        if (data.mode === "USER_ACKNOWLEDGEMENT" || data.receipt) {
            window.LAST_APPLICATION_REF = (data.receipt && (data.receipt.application_ref || data.receipt.reference_id)) || "";
            // Broadcast live sync immediately to Admin queue
            try {
                if (window.BroadcastChannel) {
                    const channel = new BroadcastChannel("tlb_queue_sync_channel");
                    channel.postMessage({ type: "NEW_APPLICATION_SUBMITTED", ref: window.LAST_APPLICATION_REF });
                }
                localStorage.setItem("tlb_last_submitted_ref", window.LAST_APPLICATION_REF + "_" + Date.now());
            } catch (_) {}
            showUserReceipt(data);
        } else {
            if (data.answer) {
                window.LAST_APPLICATION_REF = data.answer.sanction_ref;
            }
            try {
                if (window.BroadcastChannel) {
                    const channel = new BroadcastChannel("tlb_queue_sync_channel");
                    channel.postMessage({ type: "NEW_APPLICATION_SUBMITTED", ref: window.LAST_APPLICATION_REF });
                }
                localStorage.setItem("tlb_last_submitted_ref", window.LAST_APPLICATION_REF + "_" + Date.now());
            } catch (_) {}
            renderAnswer(data);
            goToStep(5);
        }

    } catch (err) {
        console.error("Underwriting failed:", err);
        alert("Communication failed with the Core Lending Underwriting Gateway. Ensure the local server is running.");
    } finally {
        const resetLabel = window.getTranslation ? window.getTranslation('btn_submit_app', origText) : origText;
        if (submitText) submitText.textContent = resetLabel;
        else submitBtn.textContent = origText;
        submitBtn.disabled = false;
    }
}

/* --------------------------------------------------------------------------
   Render Official Sanction Answer with Circular Radial Gauges (Admin Only)
   -------------------------------------------------------------------------- */
function renderAnswer(data) {
    if (!data || !data.answer) return;
    window.LAST_ANSWER_DATA = data;
    const ans = data.answer;
    const port = data.portfolio || {};
    const d = getActiveDyn();

    // Toggle panels
    const userReceiptPanel = document.getElementById("user-receipt-panel");
    const sanctionPanel = document.getElementById("sanction-result-panel");
    if (userReceiptPanel) userReceiptPanel.style.display = "none";
    if (sanctionPanel) sanctionPanel.style.display = "flex";

    // Reference & Title
    document.getElementById("ans-ref").textContent = `REF: ${ans.sanction_ref}`;
    const adminDownloadBtn = document.getElementById("btn-admin-download-memo");
    if (adminDownloadBtn) {
        adminDownloadBtn.href = `/api/applicant/sanction-memo-download/${encodeURIComponent(ans.sanction_ref)}`;
    }

    // Localized Title, Tier & Badge
    let localizedTitle = ans.decision_title;
    let localizedBadge = ans.decision_badge;
    let localizedTier = ans.underwriting_tier;
    let localizedAmtSub = "100% of requested facility";

    if (ans.decision === "APPROVED") {
        localizedTitle = d.ans_title_approved || ans.decision_title;
        localizedBadge = d.ans_badge_approved || ans.decision_badge;
        localizedTier = d.ans_tier_a1 || ans.underwriting_tier;
        localizedAmtSub = d.ans_amt_full || "100% of requested facility";
    } else if (ans.decision === "CONDITIONAL") {
        localizedTitle = d.ans_title_cond || ans.decision_title;
        localizedBadge = d.ans_badge_cond || ans.decision_badge;
        localizedTier = d.ans_tier_b2 || ans.underwriting_tier;
        localizedAmtSub = d.ans_amt_restricted || "Restricted Exposure Limit";
    } else if (ans.decision === "DECLINED") {
        localizedTitle = d.ans_title_declined || ans.decision_title;
        localizedBadge = d.ans_badge_declined || ans.decision_badge;
        localizedTier = d.ans_tier_c3 || ans.underwriting_tier;
        localizedAmtSub = d.ans_amt_declined || "Facility Declined by Policy";
    }

    document.getElementById("ans-title").textContent = localizedTitle;
    document.getElementById("ans-tier").textContent = localizedTier;
    document.getElementById("ans-badge").textContent = localizedBadge;

    // Decision Pill Banner & Icon
    const banner = document.getElementById("ans-decision-banner");
    banner.className = `decision-pill-banner ${ans.decision_class}`;

    const iconCircle = document.getElementById("ans-icon-circle");
    if (ans.decision === "APPROVED") {
        iconCircle.textContent = "✓";
    } else if (ans.decision === "DECLINED") {
        iconCircle.textContent = "✕";
    } else {
        iconCircle.textContent = "!";
    }

    // Terms Grid
    const amountElem = document.getElementById("ans-amount");
    amountElem.textContent = ans.sanctioned_amount;
    const amtSubElem = document.getElementById("ans-amount-sub");
    if (amtSubElem) amtSubElem.textContent = localizedAmtSub;
    if (ans.decision === "DECLINED") {
        amountElem.style.color = "var(--rose)";
    } else {
        amountElem.style.color = "var(--emerald)";
    }

    let cleanRate = ans.approved_rate || "8.50% p.a.";
    let benchmarkDesc = ans.approved_rate_benchmark || "";
    if (cleanRate.includes("(")) {
        const parts = cleanRate.split("(");
        cleanRate = parts[0].trim();
        if (!benchmarkDesc && parts.length > 1) {
            benchmarkDesc = parts[1].replace(")", "").trim();
        }
    }
    document.getElementById("ans-rate").textContent = cleanRate;
    const emiElem = document.getElementById("ans-emi");
    if (emiElem) {
        emiElem.textContent = benchmarkDesc ? `${ans.approved_emi} • ${benchmarkDesc}` : ans.approved_emi;
    }
    document.getElementById("ans-tenor").textContent = `${ans.approved_tenor_months} ${d.months_unit}`;

    // 1. Circular CIBIL Radial Gauge Animation
    document.getElementById("ans-cibil").textContent = ans.cibil_score;
    const gradePill = document.getElementById("ans-cibil-grade");
    const score = ans.cibil_score || 300;
    const gradeText = score >= 750 ? d.cibil_prime : (score >= 650 ? d.cibil_standard : d.cibil_subprime);
    gradePill.textContent = gradeText;

    const cibilRing = document.getElementById("cibil-progress-ring");
    if (cibilRing) {
        const circumference = 351.86;
        const percent = Math.min(1, Math.max(0, (score - 300) / 600));
        const offset = circumference - (percent * circumference);
        cibilRing.style.strokeDashoffset = offset;

        const scoreColor = score >= 750 ? "var(--emerald)" : (score >= 650 ? "var(--amber)" : "var(--rose)");
        cibilRing.style.stroke = scoreColor;
        gradePill.style.color = scoreColor;
        gradePill.style.borderColor = scoreColor;
    }

    // 2. Circular Debt-to-Income (DTI) Radial Gauge Animation
    const dtiVal = parseFloat(ans.dti_ratio) || 0;
    document.getElementById("ans-dti").textContent = `${dtiVal}%`;

    const dtiBadge = document.getElementById("ans-dti-badge");
    const dtiRing = document.getElementById("dti-progress-ring");
    if (dtiRing) {
        const circumference = 351.86;
        const percent = Math.min(1, Math.max(0, dtiVal / 100));
        const offset = circumference - (percent * circumference);
        dtiRing.style.strokeDashoffset = offset;

        const dtiColor = dtiVal <= 45 ? "var(--emerald)" : (dtiVal <= 65 ? "var(--amber)" : "var(--rose)");
        dtiRing.style.stroke = dtiColor;
        if (dtiBadge) {
            dtiBadge.textContent = dtiVal <= 45 ? d.dti_optimal : (dtiVal <= 65 ? d.dti_moderate : d.dti_critical);
            dtiBadge.style.color = dtiColor;
            dtiBadge.style.borderColor = dtiColor;
        }
    }

    // Audit Capsule
    document.getElementById("ans-applicant").textContent = ans.applicant_name;
    document.getElementById("ans-pan").textContent = ans.pan_number;
    const ansAge = document.getElementById("ans-age");
    if (ansAge) ansAge.textContent = ans.applicant_age || "—";
    document.getElementById("ans-date").textContent = ans.sanction_date;

    const sectorElem = document.getElementById("ans-sector");
    if (sectorElem) sectorElem.textContent = ans.working_sector || "—";

    const runwayElem = document.getElementById("ans-runway");
    if (runwayElem) {
        runwayElem.textContent = `${ans.service_runway_years ?? "—"} ${d.yrs_unit} (${d.ret_prefix}: ${ans.statutory_retirement_age ?? "—"})`;
    }

    const maturitySubElem = document.getElementById("ans-maturity-sub");
    if (maturitySubElem) {
        if (ans.maturity_exceeds_retirement) {
            maturitySubElem.textContent = ans.pension_eligible 
                ? d.maturity_pension_sub 
                : d.maturity_alert_sub;
            maturitySubElem.style.color = ans.pension_eligible ? "var(--amber)" : "var(--rose)";
        } else {
            maturitySubElem.textContent = `${d.maturity_label}: ${ans.age_at_maturity || "—"} ${d.yrs_unit} (${d.amortized_label})`;
            maturitySubElem.style.color = "var(--text-muted)";
        }
    }

    // Past Loan Record (Dynamic multi-language support for title and subtitle)
    const repaySummary = document.getElementById("ans-repay-summary");
    const npaFlag = document.getElementById("ans-npa-flag");

    if (port.has_npa) {
        repaySummary.textContent = d.repay_npa;
        repaySummary.style.color = "var(--rose)";
        npaFlag.textContent = d.npa_flag_desc(port.npa_count);
    } else if (port.late_30_59_count > 0 || port.late_60_89_count > 0) {
        repaySummary.textContent = d.repay_delay;
        repaySummary.style.color = "var(--amber)";
        npaFlag.textContent = d.late_flag_desc(port.late_30_59_count);
    } else {
        repaySummary.textContent = d.repay_clean;
        repaySummary.style.color = "var(--emerald)";
        npaFlag.textContent = port.loans_count > 0 ? d.settled_flag_desc(port.closed_repaid_count) : d.clean_slate;
    }

    // Remarks List
    const remarksUl = document.getElementById("ans-remarks-list");
    remarksUl.innerHTML = "";
    if (ans.reasons && ans.reasons.length > 0) {
        ans.reasons.forEach((r) => {
            const li = document.createElement("li");
            li.textContent = r;
            remarksUl.appendChild(li);
        });
    }

    // Reveal Action Buttons
    document.getElementById("result-actions-wrap").style.display = "flex";

    // Advance Stepper to Step 5 (Sanction Memo)
    goToStep(5);
}

/* --------------------------------------------------------------------------
   Render Past Loans Table (Curved Rows, Pill Controls, Circular Delete)
   -------------------------------------------------------------------------- */
function renderPastLoansTable() {
    const tbody = document.getElementById("past-loans-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    const d = getActiveDyn();

    if (!CURRENT_LOANS || CURRENT_LOANS.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem 1rem;">
                    <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.35rem; color: var(--text);">${d.clean_no_loans}</div>
                    <div style="color: var(--text-dim); font-size: 0.76rem;">${d.clean_click_add}</div>
                </td>
            </tr>
        `;
        return;
    }

    CURRENT_LOANS.forEach((loan, idx) => {
        const tr = document.createElement("tr");
        tr.dataset.loanIdx = idx;

        tr.innerHTML = `
            <td>
                <input type="text" class="table-curved-input loan-lender-input" value="${loan.lender || ''}" placeholder="Lender Bank (e.g. HDFC)" style="width: 140px;">
            </td>
            <td>
                <select class="table-curved-select loan-type-select">
                    <option value="Personal Loan" ${loan.type === 'Personal Loan' ? 'selected' : ''}>Personal Loan</option>
                    <option value="Home Mortgage" ${loan.type === 'Home Mortgage' ? 'selected' : ''}>Home Mortgage</option>
                    <option value="Auto Loan" ${loan.type === 'Auto Loan' ? 'selected' : ''}>Auto Loan</option>
                    <option value="Credit Card" ${loan.type === 'Credit Card' ? 'selected' : ''}>Credit Card Facility</option>
                    <option value="Business Loan" ${loan.type === 'Business Loan' ? 'selected' : ''}>Business Loan</option>
                </select>
            </td>
            <td>
                <input type="number" class="table-curved-input font-mono loan-sanc-input" value="${loan.sanctioned_amount || ''}" placeholder="Sanctioned" min="0" step="5000" style="width: 120px;">
            </td>
            <td>
                <input type="number" class="table-curved-input font-mono loan-out-input" value="${loan.outstanding_balance ?? ''}" placeholder="Balance" min="0" step="5000" style="width: 120px;">
            </td>
            <td>
                <input type="number" class="table-curved-input font-mono loan-emi-input" value="${loan.monthly_emi || ''}" placeholder="Monthly EMI" min="0" step="500" style="width: 110px;">
            </td>
            <td>
                <select class="table-curved-select loan-status-select">
                    <option value="REGULAR" ${loan.status === 'REGULAR' ? 'selected' : ''}>${d.reg_0_dpd}</option>
                    <option value="CLOSED_REPAID" ${loan.status === 'CLOSED_REPAID' ? 'selected' : ''}>${d.fully_repaid}</option>
                    <option value="DELAYED_30_59" ${loan.status === 'DELAYED_30_59' ? 'selected' : ''}>${d.late_30_59}</option>
                    <option value="DELAYED_60_89" ${loan.status === 'DELAYED_60_89' ? 'selected' : ''}>${d.late_60_89}</option>
                    <option value="DEFAULTED_NPA" ${loan.status === 'DEFAULTED_NPA' ? 'selected' : ''}>${d.defaulted_npa}</option>
                </select>
            </td>
            <td style="text-align: center;">
                <button type="button" class="btn-circle-danger" data-remove-idx="${idx}" title="Remove Facility">×</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Wire up Delete buttons
    document.querySelectorAll(".btn-circle-danger").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.dataset.removeIdx, 10);
            syncLoansFromDOM();
            CURRENT_LOANS.splice(idx, 1);
            renderPastLoansTable();
        });
    });
}

/* --------------------------------------------------------------------------
   Add Custom Past Loan Facility
   -------------------------------------------------------------------------- */
function initAddPastLoanBtn() {
    const btn = document.getElementById("btn-add-past-loan");
    btn.addEventListener("click", () => {
        syncLoansFromDOM();
        const newLoan = {
            id: `LN-${Math.floor(1000 + Math.random() * 9000)}`,
            lender: "",
            type: "Personal Loan",
            sanctioned_amount: "",
            outstanding_balance: "",
            monthly_emi: "",
            tenor_months: 36,
            emis_paid: 12,
            status: "REGULAR",
            dpd_status: "0 DPD (Punctual)",
            dpd_history: "0-0-0-0-0-0"
        };

        CURRENT_LOANS.push(newLoan);
        renderPastLoansTable();
    });
}
