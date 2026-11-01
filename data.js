/**
 * Mukta Child Health Hub - Medical & Clinical References
 * Aligned with Indian Academy of Pediatrics (IAP) & World Health Organization (WHO) Guidelines
 */

// IAP Advisory Committee on Vaccines and Immunization Practices (ACVIP) Schedule
const IAP_VACCINE_SCHEDULE = [
  {
    id: "bcg",
    name: "BCG",
    disease: "Tuberculosis (TB)",
    recommendedAgeDays: 0,
    ageLabel: "At Birth",
    category: "Essential",
    dose: "Single Dose (0.05 ml intradermal)",
    description: "Protects infants against severe forms of childhood tuberculosis, including tuberculous meningitis.",
    sideEffects: "Small red papule appearing after 2-3 weeks, healing with a tiny scar."
  },
  {
    id: "opv-0",
    name: "OPV 0",
    disease: "Polio",
    recommendedAgeDays: 0,
    ageLabel: "At Birth",
    category: "Essential",
    dose: "Birth dose (2 drops oral)",
    description: "Oral polio vaccine given at birth to provide gut mucosal immunity in polio-endemic regions.",
    sideEffects: "Very safe, occasionally mild spit-up."
  },
  {
    id: "hepb-1",
    name: "Hepatitis B - 1",
    disease: "Hepatitis B Virus",
    recommendedAgeDays: 0,
    ageLabel: "At Birth (within 24h)",
    category: "Essential",
    dose: "0.5 ml IM (anterolateral thigh)",
    description: "Crucial birth dose given within 24 hours of birth to prevent perinatal mother-to-child transmission.",
    sideEffects: "Mild tenderness at injection site."
  },
  {
    id: "hexavalent-1",
    name: "DTwP/DTaP + IPV + Hib + HepB - 1",
    disease: "Diphtheria, Tetanus, Pertussis, Polio, Hib & Hep B",
    recommendedAgeDays: 42, // 6 weeks
    ageLabel: "6 Weeks",
    category: "Essential",
    dose: "Dose 1 (Combined injection)",
    description: "Primary protection against whooping cough, lockjaw, diphtheria, injectable polio, Haemophilus influenzae b and hepatitis B.",
    sideEffects: "Low-grade fever, irritability, redness at injection site for 24-48 hours."
  },
  {
    id: "pcv-1",
    name: "Pneumococcal Conjugate (PCV) - 1",
    disease: "Pneumococcal Pneumonia & Meningitis",
    recommendedAgeDays: 42,
    ageLabel: "6 Weeks",
    category: "Essential",
    dose: "Dose 1 (0.5 ml IM)",
    description: "Protects against Streptococcus pneumoniae causing severe pneumonia, bacteremia, and meningitis.",
    sideEffects: "Mild fever, temporary swelling."
  },
  {
    id: "rotavirus-1",
    name: "Rotavirus Vaccine - 1",
    disease: "Rotaviral Diarrhea & Dehydration",
    recommendedAgeDays: 42,
    ageLabel: "6 Weeks",
    category: "Essential",
    dose: "Dose 1 (Oral drops)",
    description: "Prevents severe dehydrating watery diarrhea and vomiting caused by Rotavirus.",
    sideEffects: "Mild temporary fussiness, mild loose stools."
  },
  {
    id: "hexavalent-2",
    name: "DTwP/DTaP + IPV + Hib + HepB - 2",
    disease: "Diphtheria, Tetanus, Pertussis, Polio, Hib & Hep B",
    recommendedAgeDays: 70, // 10 weeks
    ageLabel: "10 Weeks",
    category: "Essential",
    dose: "Dose 2 (Combined injection)",
    description: "Second primary dose to boost circulating antibody titers.",
    sideEffects: "Fever, localized soreness."
  },
  {
    id: "pcv-2",
    name: "Pneumococcal Conjugate (PCV) - 2",
    disease: "Pneumococcal Diseases",
    recommendedAgeDays: 70,
    ageLabel: "10 Weeks",
    category: "Essential",
    dose: "Dose 2 (0.5 ml IM)",
    description: "Second dose of pneumococcal conjugate vaccine.",
    sideEffects: "Mild fever, injection site warmth."
  },
  {
    id: "rotavirus-2",
    name: "Rotavirus Vaccine - 2",
    disease: "Rotaviral Diarrhea",
    recommendedAgeDays: 70,
    ageLabel: "10 Weeks",
    category: "Essential",
    dose: "Dose 2 (Oral drops)",
    description: "Second oral dose for rotavirus protection.",
    sideEffects: "Mild irritability."
  },
  {
    id: "hexavalent-3",
    name: "DTwP/DTaP + IPV + Hib + HepB - 3",
    disease: "Diphtheria, Tetanus, Pertussis, Polio, Hib & Hep B",
    recommendedAgeDays: 98, // 14 weeks
    ageLabel: "14 Weeks",
    category: "Essential",
    dose: "Dose 3 (Combined injection)",
    description: "Completes the primary infant immunization series for 6 core pathogens.",
    sideEffects: "Mild fever, local soreness."
  },
  {
    id: "pcv-3",
    name: "Pneumococcal Conjugate (PCV) - 3",
    disease: "Pneumococcal Diseases",
    recommendedAgeDays: 98,
    ageLabel: "14 Weeks",
    category: "Essential",
    dose: "Dose 3 (0.5 ml IM)",
    description: "Third primary dose for complete infant pneumococcal protection.",
    sideEffects: "Mild fever."
  },
  {
    id: "rotavirus-3",
    name: "Rotavirus Vaccine - 3",
    disease: "Rotaviral Diarrhea",
    recommendedAgeDays: 98,
    ageLabel: "14 Weeks",
    category: "Essential",
    dose: "Dose 3 (Oral drops - if 3-dose brand)",
    description: "Final dose of the primary rotavirus immunization series.",
    sideEffects: "Mild irritability."
  },
  {
    id: "influenza-1",
    name: "Influenza (Flu) - Dose 1",
    disease: "Seasonal Influenza (H1N1 / Flu)",
    recommendedAgeDays: 180, // 6 months
    ageLabel: "6 Months",
    category: "Recommended",
    dose: "Dose 1 (0.5 ml IM quadrivalent)",
    description: "Protects against seasonal circulating influenza strains A and B in pediatric age groups.",
    sideEffects: "Slight ache at injection site, mild fever."
  },
  {
    id: "influenza-2",
    name: "Influenza (Flu) - Dose 2",
    disease: "Seasonal Influenza (Flu)",
    recommendedAgeDays: 210, // 7 months
    ageLabel: "7 Months",
    category: "Recommended",
    dose: "Dose 2 (4 weeks after dose 1)",
    description: "Required 4 weeks after the first dose in infants under 9 years receiving flu vaccine for the first time.",
    sideEffects: "Slight soreness."
  },
  {
    id: "mmr-1",
    name: "MMR - 1",
    disease: "Measles, Mumps & Rubella",
    recommendedAgeDays: 270, // 9 months
    ageLabel: "9 Months",
    category: "Essential",
    dose: "Dose 1 (0.5 ml Subcutaneous)",
    description: "Guards against measles (which can cause pneumonia/encephalitis), mumps, and congenital rubella syndrome.",
    sideEffects: "Mild fever or light rash 7-10 days post injection."
  },
  {
    id: "typhoid-tcv",
    name: "Typhoid Conjugate (TCV)",
    disease: "Typhoid Fever (Salmonella enterica)",
    recommendedAgeDays: 270,
    ageLabel: "9 Months",
    category: "Essential",
    dose: "Single Dose (0.5 ml IM)",
    description: "Provides long-lasting protection against enteric typhoid fever in South Asian children.",
    sideEffects: "Mild tenderness at injection site."
  },
  {
    id: "hepa-1",
    name: "Hepatitis A - Dose 1",
    disease: "Hepatitis A (Jaundice)",
    recommendedAgeDays: 365, // 12 months
    ageLabel: "12 Months",
    category: "Recommended",
    dose: "Dose 1 (Live or Inactivated)",
    description: "Protects against waterborne and foodborne Hepatitis A liver infection.",
    sideEffects: "Mild local tenderness."
  },
  {
    id: "pcv-booster",
    name: "Pneumococcal Booster",
    disease: "Pneumococcal Diseases",
    recommendedAgeDays: 450, // 15 months
    ageLabel: "15 Months",
    category: "Essential",
    dose: "Booster (0.5 ml IM)",
    description: "Crucial toddler booster ensuring durable immunity through early school years.",
    sideEffects: "Mild fever, transient fretfulness."
  },
  {
    id: "mmr-2",
    name: "MMR - 2",
    disease: "Measles, Mumps & Rubella",
    recommendedAgeDays: 450,
    ageLabel: "15 Months",
    category: "Essential",
    dose: "Dose 2 (0.5 ml Subcutaneous)",
    description: "Second dose to eliminate primary non-responders and ensure lifelong protection.",
    sideEffects: "Mild transient rash."
  },
  {
    id: "varicella-1",
    name: "Varicella (Chickenpox) - 1",
    disease: "Varicella Zoster (Chickenpox)",
    recommendedAgeDays: 450,
    ageLabel: "15 Months",
    category: "Recommended",
    dose: "Dose 1 (0.5 ml Subcutaneous)",
    description: "Prevents high fever, itchy blister lesions, and secondary bacterial skin infections.",
    sideEffects: "Occasional mild chickenpox-like bumps 1-2 weeks later."
  },
  {
    id: "dtwp-booster-1",
    name: "DTwP / DTaP Booster - 1",
    disease: "Diphtheria, Tetanus, Pertussis",
    recommendedAgeDays: 480, // 16-18 months
    ageLabel: "16 - 18 Months",
    category: "Essential",
    dose: "First Booster (0.5 ml IM)",
    description: "First toddler booster to maintain protective antibody titers against whooping cough.",
    sideEffects: "Fever, local swelling."
  },
  {
    id: "ipv-booster",
    name: "IPV Booster",
    disease: "Poliomyelitis",
    recommendedAgeDays: 480,
    ageLabel: "16 - 18 Months",
    category: "Essential",
    dose: "Booster (0.5 ml IM)",
    description: "Inactivated injectable polio booster dose.",
    sideEffects: "Mild localized discomfort."
  },
  {
    id: "hepa-2",
    name: "Hepatitis A - Dose 2",
    disease: "Hepatitis A",
    recommendedAgeDays: 540, // 18 months
    ageLabel: "18 Months",
    category: "Recommended",
    dose: "Dose 2 (Inactivated series)",
    description: "Required for inactivated Hep A vaccine to grant 20+ years of clinical protection.",
    sideEffects: "Mild soreness."
  },
  {
    id: "varicella-2",
    name: "Varicella (Chickenpox) - 2",
    disease: "Chickenpox Booster",
    recommendedAgeDays: 730, // 2 years
    ageLabel: "2 Years",
    category: "Recommended",
    dose: "Dose 2 (At least 3 months after dose 1)",
    description: "Guarantees high protection against breakthrough varicella.",
    sideEffects: "Mild tenderness."
  },
  {
    id: "dtwp-booster-2",
    name: "DTwP / DTaP Booster - 2",
    disease: "Diphtheria, Tetanus & Pertussis",
    recommendedAgeDays: 1640, // 4.5 - 5 years
    ageLabel: "4 - 5 Years",
    category: "Essential",
    dose: "School-Entry Booster (0.5 ml IM)",
    description: "Crucial preschool booster to shield children in school and play environments.",
    sideEffects: "Local arm redness, mild fever."
  },
  {
    id: "mmr-3",
    name: "MMR - 3",
    disease: "Measles, Mumps & Rubella",
    recommendedAgeDays: 1640,
    ageLabel: "4 - 5 Years",
    category: "Essential",
    dose: "School-Entry Booster",
    description: "Final booster recommended before starting kindergarten.",
    sideEffects: "Mild arm tenderness."
  },
  {
    id: "hpv",
    name: "HPV Vaccine (2 Doses)",
    disease: "Human Papillomavirus / Cervical Cancer",
    recommendedAgeDays: 3285, // 9 - 14 years
    ageLabel: "9 - 14 Years",
    category: "Special",
    dose: "2 Doses at 0 and 6 months interval",
    description: "Prevents oncogenic HPV infections linked to cervical and anogenital cancers.",
    sideEffects: "Mild arm soreness, dizziness briefly post-injection."
  }
];

// WHO Child Growth Standards & Reference Percentile Data (Median, 5th, 85th, 95th Percentiles)
// Based on WHO Multicentre Growth Reference Study (MGRS)
const WHO_GROWTH_STANDARDS = {
  boys: {
    // Age in months: { height: [5th, 50th, 95th], weight: [5th, 50th, 95th], bmi: [5th, 50th, 85th, 95th] }
    0:  { height: [46.3, 49.9, 53.4], weight: [2.5, 3.3, 4.3], bmi: [11.2, 13.4, 15.0, 16.3] },
    3:  { height: [57.6, 61.4, 65.3], weight: [5.1, 6.4, 7.9], bmi: [14.4, 16.8, 18.5, 19.8] },
    6:  { height: [63.6, 67.6, 71.6], weight: [6.7, 7.9, 9.7], bmi: [14.6, 17.2, 18.9, 20.2] },
    9:  { height: [68.0, 72.0, 76.2], weight: [7.6, 8.9, 10.9], bmi: [14.4, 16.9, 18.6, 19.8] },
    12: { height: [71.3, 75.7, 80.2], weight: [8.4, 9.6, 11.8], bmi: [14.1, 16.5, 18.2, 19.4] },
    18: { height: [76.9, 82.3, 87.7], weight: [9.5, 10.9, 13.5], bmi: [13.7, 16.0, 17.7, 18.9] },
    24: { height: [81.7, 87.8, 93.9], weight: [10.5, 12.2, 15.3], bmi: [13.5, 15.7, 17.4, 18.5] },
    36: { height: [89.9, 96.1, 102.7], weight: [12.3, 14.3, 18.1], bmi: [13.3, 15.3, 16.9, 18.0] },
    48: { height: [96.7, 103.3, 110.7], weight: [14.0, 16.3, 21.2], bmi: [13.1, 15.1, 16.8, 17.9] },
    60: { height: [102.3, 110.0, 117.8], weight: [15.6, 18.3, 24.2], bmi: [13.0, 15.2, 17.0, 18.3] },
    72: { height: [108.5, 116.0, 124.5], weight: [17.5, 20.5, 27.5], bmi: [13.1, 15.3, 17.3, 18.9] },
    96: { height: [119.0, 128.0, 137.5], weight: [21.0, 25.4, 35.0], bmi: [13.4, 15.8, 18.3, 20.5] },
    120:{ height: [129.0, 138.4, 148.5], weight: [25.0, 31.2, 45.0], bmi: [13.8, 16.6, 19.8, 22.5] }
  },
  girls: {
    0:  { height: [45.6, 49.1, 52.7], weight: [2.4, 3.2, 4.2], bmi: [11.0, 13.2, 14.8, 16.0] },
    3:  { height: [56.1, 59.8, 63.8], weight: [4.6, 5.8, 7.5], bmi: [13.8, 16.2, 18.0, 19.3] },
    6:  { height: [61.8, 65.7, 69.8], weight: [6.1, 7.3, 9.3], bmi: [14.0, 16.6, 18.4, 19.7] },
    9:  { height: [66.1, 70.1, 74.5], weight: [7.0, 8.2, 10.5], bmi: [13.8, 16.3, 18.1, 19.4] },
    12: { height: [69.2, 74.0, 78.9], weight: [7.7, 8.9, 11.5], bmi: [13.5, 15.9, 17.7, 19.0] },
    18: { height: [74.9, 80.7, 86.5], weight: [8.8, 10.2, 13.2], bmi: [13.2, 15.4, 17.2, 18.5] },
    24: { height: [80.3, 86.4, 92.9], weight: [9.8, 11.5, 14.8], bmi: [13.0, 15.2, 17.0, 18.3] },
    36: { height: [88.4, 95.1, 101.8], weight: [11.7, 13.9, 18.0], bmi: [12.8, 15.0, 16.7, 18.0] },
    48: { height: [95.4, 102.7, 109.8], weight: [13.3, 16.1, 21.2], bmi: [12.7, 14.9, 16.8, 18.2] },
    60: { height: [101.5, 109.4, 117.1], weight: [15.0, 18.2, 24.5], bmi: [12.7, 15.1, 17.2, 18.8] },
    72: { height: [107.0, 115.5, 123.8], weight: [16.8, 20.2, 27.8], bmi: [12.9, 15.3, 17.6, 19.4] },
    96: { height: [118.0, 127.5, 137.0], weight: [20.5, 25.0, 35.5], bmi: [13.2, 16.0, 18.8, 21.2] },
    120:{ height: [128.5, 138.6, 149.0], weight: [24.5, 31.9, 46.5], bmi: [13.7, 16.8, 20.3, 23.4] }
  }
};

// Pediatric Symptom Checker Knowledge Base (Doctor-Reviewed Educational Guides)
const SYMPTOM_DATABASE = [
  {
    id: "fever",
    name: "Fever / Elevated Temperature",
    icon: "thermometer",
    category: "General",
    color: "#FFE5EC",
    accent: "#E63946",
    overview: "Fever is the body's natural immunological response to infections like viruses or bacteria. Normal oral temperature is 36.5°C–37.5°C (97.7°F–99.5°F).",
    durationOptions: [
      { id: "d1", label: "Less than 24 hours" },
      { id: "d2", label: "1 to 3 days" },
      { id: "d3", label: "More than 3 days" }
    ],
    severityOptions: [
      { id: "s1", label: "Mild (99°F - 100.4°F / 37.2°C - 38°C)" },
      { id: "s2", label: "Moderate (100.5°F - 102.5°F / 38.1°C - 39.2°C)" },
      { id: "s3", label: "High (Above 103°F / 39.4°C)" }
    ],
    redFlags: [
      "Infant under 3 months of age with temperature ≥ 38°C (100.4°F) - Requires IMMEDIATE emergency evaluation",
      "Stiff neck, extreme photophobia, or purple purpuric skin rash",
      "Child is uncharacteristically lethargic, weak, or difficult to awaken",
      "Persistent rapid breathing, grunting, or chest retractions",
      "Fever lasting more than 72 hours without a clear focus"
    ],
    homeCare: [
      "Keep child well hydrated with small, frequent sips of water, ORS, coconut water, or breastmilk.",
      "Dress in light, breathable cotton clothing; avoid heavy blankets.",
      "Lukewarm water sponging (NOT cold water or alcohol rubs) on the forehead and torso.",
      "Never give aspirin to children due to risk of Reye's syndrome. Use paracetamol only as prescribed by your pediatrician."
    ]
  },
  {
    id: "cough_cold",
    name: "Cough & Cold / Congestion",
    icon: "wind",
    category: "Respiratory",
    color: "#DFF2FF",
    accent: "#0077B6",
    overview: "Coughing is a protective reflex that clears airway secretions and irritants. Viral upper respiratory tract infections are the most frequent cause in children.",
    durationOptions: [
      { id: "d1", label: "1 to 4 days" },
      { id: "d2", label: "5 to 14 days" },
      { id: "d3", label: "Over 2 weeks (Chronic cough)" }
    ],
    severityOptions: [
      { id: "s1", label: "Mild sniffles, soft occasional cough" },
      { id: "s2", label: "Wet loose cough, nasal blockage, disturbs sleep" },
      { id: "s3", label: "Barking seal-like cough, wheezing, or difficulty catching breath" }
    ],
    redFlags: [
      "Fast breathing rate (Age 2-11m: >50/min; Age 1-5y: >40/min)",
      "Chest in-drawing / sucking in of ribs or neck during breathing",
      "Bluish discoloration around lips, mouth, or fingernails (Cyanosis)",
      "High pitched whistling / stridor sound while breathing in at rest",
      "Child unable to drink fluids or breastfeed due to breathlessness"
    ],
    homeCare: [
      "Use sterile saline nasal drops before feedings and bedtime to clear nasal passages naturally.",
      "Cool mist humidifier in the child's bedroom to keep mucus loose.",
      "Warm liquids or honey (ONLY for children above 1 year of age) to soothe ticklish throats.",
      "Keep the child's head slightly elevated during sleep."
    ]
  },
  {
    id: "vomiting_diarrhea",
    name: "Vomiting & Loose Stools / Diarrhea",
    icon: "droplet",
    category: "Digestive",
    color: "#DFF7E8",
    accent: "#2A9D8F",
    overview: "Gastroenteritis is typically caused by viral pathogens (rotavirus, norovirus) leading to intestinal inflammation and fluid loss.",
    durationOptions: [
      { id: "d1", label: "Started today (<12 hours)" },
      { id: "d2", label: "1 to 2 days" },
      { id: "d3", label: "More than 3 days" }
    ],
    severityOptions: [
      { id: "s1", label: "1-2 vomits or 2-3 watery stools, active child" },
      { id: "s2", label: "Frequent vomiting, multiple watery stools, tired child" },
      { id: "s3", label: "Inability to keep any liquids down, bloody stools, sunken eyes" }
    ],
    redFlags: [
      "Signs of dehydration: dry mouth/tongue, no wet diapers/urine for >6 hours, no tears when crying, sunken eyes or soft spot (fontanelle)",
      "Greenish/bilious or coffee-ground vomit",
      "Blood or black tarry stools",
      "Severe abdominal tenderness or child writhing in intense colic pain",
      "Extreme drowsiness or unresponsiveness"
    ],
    homeCare: [
      "Frequent small sips (5-10 ml every 5 minutes) of WHO-standard Oral Rehydration Solution (ORS).",
      "Continue breastfeeding frequently; breastmilk has protective antibodies and electrolytes.",
      "Gradually introduce soft bland foods (curd rice, bananas, boiled potatoes, khichdi) as nausea subsides.",
      "Do NOT administer over-the-counter anti-diarrheal or anti-motility drugs to children."
    ]
  },
  {
    id: "stomach_pain",
    name: "Abdominal / Stomach Pain",
    icon: "activity",
    category: "Digestive",
    color: "#FFF4CC",
    accent: "#E76F51",
    overview: "Common causes range from constipation, gas, mesenteric adenitis (viral belly ache) to appendicitis or urinary tract infections.",
    durationOptions: [
      { id: "d1", label: "Sudden onset within past few hours" },
      { id: "d2", label: "Intermittent cramping for 1-2 days" },
      { id: "d3", label: "Recurring on and off for weeks" }
    ],
    severityOptions: [
      { id: "s1", label: "Mild discomfort, distracted easily by playing" },
      { id: "s2", label: "Moderate pain, crying intermittently, curling legs" },
      { id: "s3", label: "Severe acute pain, crying when belly is touched, cannot walk straight" }
    ],
    redFlags: [
      "Pain localized to the right lower abdomen (possible appendicitis)",
      "Abdomen feels rigid, distended, or child cries acutely when touched",
      "Accompanied by persistent bilious vomiting or high fever",
      "Swelling or pain in the groin or scrotum in boys (inguinal hernia / testicular torsion)",
      "Blood in stool resembling red currant jelly (intussusception)"
    ],
    homeCare: [
      "Allow child to rest in a comfortable curled position with knees bent.",
      "Offer small sips of warm water; warm towel compress on tummy.",
      "Check bowel movements: rule out constipation with high-fiber fruits (papaya, prunes).",
      "Do not give painkillers or hot water bottles without pediatric consultation."
    ]
  },
  {
    id: "skin_rashes",
    name: "Skin Rashes & Allergies",
    icon: "sun",
    category: "Skin",
    color: "#EEE7FF",
    accent: "#7209B7",
    overview: "Pediatric rashes are very common and can arise from viral infections, heat, eczema, insect bites, or food and contact allergies.",
    durationOptions: [
      { id: "d1", label: "Appeared suddenly in last 6 hours" },
      { id: "d2", label: "Gradual over 2-4 days" },
      { id: "d3", label: "Longstanding dry eczema patches" }
    ],
    severityOptions: [
      { id: "s1", label: "Mild prickly heat or dry cheeks, not bothering child" },
      { id: "s2", label: "Itchy raised pink hives or scattered red spots" },
      { id: "s3", label: "Spreading rapidly, swelling of face/lips, or non-blanching dark purple spots" }
    ],
    redFlags: [
      "Glass Test: Press a clear drinking glass firmly against the rash. If the spots DO NOT fade/blanch under pressure (purpura/petechiae), seek EMERGENCY medical care (possible meningococcemia).",
      "Swelling of the lips, tongue, eyes, or throat with breathing sounds (Anaphylaxis)",
      "Widespread peeling, blistering, or raw skin around mouth/eyes",
      "Rash accompanied by high fever, lethargy, and extreme irritability"
    ],
    homeCare: [
      "Dress child in loose cotton fabrics; keep the room pleasantly cool.",
      "Apply gentle fragrance-free pediatric moisturizer / calamine lotion for itching.",
      "Trim child's nails short to prevent secondary bacterial infection from scratching.",
      "Bathe with lukewarm water and mild syndet cleanser."
    ]
  },
  {
    id: "poor_appetite",
    name: "Poor Appetite & Feeding Refusal",
    icon: "pie-chart",
    category: "Nutrition",
    color: "#FFF4CC",
    accent: "#F4A261",
    overview: "Appetite naturally fluctuates with growth spurts, teething, mild viral illnesses, or behavioral toddler autonomy.",
    durationOptions: [
      { id: "d1", label: "Past 2-3 days" },
      { id: "d2", label: "1-2 weeks during illness" },
      { id: "d3", label: "Persistent over months with weight stagnation" }
    ],
    severityOptions: [
      { id: "s1", label: "Eating smaller portions but drinking fluids and energetic" },
      { id: "s2", label: "Refusing solids, only wanting milk/fluids, slightly cranky" },
      { id: "s3", label: "Refusing both fluids and food, lethargic, losing weight" }
    ],
    redFlags: [
      "Weight loss or crossing major percentile lines downwards on growth chart",
      "Pain while swallowing, drooling excessively, or mouth ulcers",
      "Chronic pale skin, fatigue, and weakness (possible severe anemia)",
      "Signs of dehydration or persistent vomiting"
    ],
    homeCare: [
      "Never force-feed; make meal times stress-free, positive, and screen-free.",
      "Offer small, nutrient-dense portions (ghee, paneer, eggs, dal, nuts paste) every 2-3 hours.",
      "Limit milk intake to 400-500 ml/day in toddlers over 1 year to avoid filling their tummy with milk alone.",
      "Involve the child in food preparation to spark curiosity."
    ]
  }
];

// Pediatric Developmental Milestones (CDC & Indian Academy of Pediatrics Standards)
const DEVELOPMENT_MILESTONES = [
  {
    ageGroup: "0 - 3 Months",
    ageRangeLabel: "Newborn to 3 Months",
    summary: "Early visual engagement, social smiles, and head control development.",
    domains: [
      {
        domain: "Gross & Fine Motor",
        icon: "activity",
        milestones: [
          { id: "m0_1", text: "Lifts head and chest briefly when lying on tummy (Tummy Time)", redFlag: "Does not lift head at all by 3 months" },
          { id: "m0_2", text: "Brings hands towards mouth and opens fingers occasionally", redFlag: "Hands kept tightly fisted past 3 months" },
          { id: "m0_3", text: "Pushes down on legs when feet are placed on a firm surface", redFlag: "Feels unusually floppy or stiff" }
        ]
      },
      {
        domain: "Social & Communication",
        icon: "smile",
        milestones: [
          { id: "m0_4", text: "Social smile: Smiles back at parents and responds to friendly voices", redFlag: "Does not smile at people by 3 months" },
          { id: "m0_5", text: "Makes cooing, gurgling sounds (vowel-like 'ooh', 'aah')", redFlag: "Does not react to loud noises or voice" },
          { id: "m0_6", text: "Tracks moving objects and faces across visual midline with eyes", redFlag: "Eyes do not follow moving objects" }
        ]
      }
    ]
  },
  {
    ageGroup: "4 - 6 Months",
    ageRangeLabel: "4 to 6 Months",
    summary: "Rolling over, reaching for objects, babbling, and laughing aloud.",
    domains: [
      {
        domain: "Gross & Fine Motor",
        icon: "activity",
        milestones: [
          { id: "m4_1", text: "Rolls from tummy to back (and later back to tummy)", redFlag: "Cannot roll over in either direction by 6 months" },
          { id: "m4_2", text: "Holds head steady without support when held upright", redFlag: "Marked head lag when pulled to sit" },
          { id: "m4_3", text: "Reaches for and grasps toys with both hands; puts objects to mouth", redFlag: "Does not reach for toys" }
        ]
      },
      {
        domain: "Social & Communication",
        icon: "smile",
        milestones: [
          { id: "m4_4", text: "Laughs out loud, squeals with joy, and loves peek-a-boo", redFlag: "Does not laugh or make joyous sounds" },
          { id: "m4_5", text: "Babbles with consonant sounds ('ba-ba', 'ma-ma', 'da-da')", redFlag: "Makes very few or no vocal sounds" },
          { id: "m4_6", text: "Turns head towards sound of parent's voice or familiar music", redFlag: "Does not turn head towards voices" }
        ]
      }
    ]
  },
  {
    ageGroup: "7 - 9 Months",
    ageRangeLabel: "7 to 9 Months",
    summary: "Independent sitting, pincer grasp emergence, object permanence, and stranger awareness.",
    domains: [
      {
        domain: "Gross & Fine Motor",
        icon: "activity",
        milestones: [
          { id: "m7_1", text: "Sits without support for several minutes with steady posture", redFlag: "Cannot sit independently with help by 9 months" },
          { id: "m7_2", text: "Transfers objects from one hand to the other smoothly", redFlag: "Does not transfer objects between hands" },
          { id: "m7_3", text: "Supports weight on legs and bounces when held standing", redFlag: "Does not bear weight on legs" }
        ]
      },
      {
        domain: "Social & Communication",
        icon: "smile",
        milestones: [
          { id: "m7_4", text: "Understands 'No' and responds to own name with glance or smile", redFlag: "Does not respond to own name" },
          { id: "m7_5", text: "Shows stranger wariness and prefers known family caregivers", redFlag: "Does not recognize caregivers" },
          { id: "m7_6", text: "Plays interactive games like 'bye-bye' waving and patty-cake", redFlag: "Shows no interest in interactive games" }
        ]
      }
    ]
  },
  {
    ageGroup: "10 - 12 Months",
    ageRangeLabel: "10 to 12 Months (1 Year)",
    summary: "Pulling to stand, cruising furniture, first meaningful words, and finger feeding.",
    domains: [
      {
        domain: "Gross & Fine Motor",
        icon: "activity",
        milestones: [
          { id: "m10_1", text: "Pulls up to stand using furniture and cruises along edges", redFlag: "Cannot stand supported by 12 months" },
          { id: "m10_2", text: "Fine pincer grasp: Picks up small food pieces between thumb and forefinger", redFlag: "Cannot grasp small objects with fingers" },
          { id: "m10_3", text: "May take first independent steps or stand alone for a few seconds", redFlag: "No crawling or bottom-scooting" }
        ]
      },
      {
        domain: "Social & Communication",
        icon: "smile",
        milestones: [
          { id: "m10_4", text: "Says 1-2 meaningful words with intent ('Mama', 'Dada', 'Paani')", redFlag: "Does not say single words with meaning" },
          { id: "m10_5", text: "Uses gestures like pointing at interesting objects or waving bye-bye", redFlag: "Does not learn gestures like waving or shaking head" },
          { id: "m10_6", text: "Searches for hidden objects (understands object permanence)", redFlag: "Does not search for objects that are hidden" }
        ]
      }
    ]
  },
  {
    ageGroup: "1 - 2 Years",
    ageRangeLabel: "12 to 24 Months",
    summary: "Walking steadily, climbing, running, vocabulary burst, and simple 2-word phrases.",
    domains: [
      {
        domain: "Gross & Fine Motor",
        icon: "activity",
        milestones: [
          { id: "m1y_1", text: "Walks independently across the room and begins running", redFlag: "Cannot walk by 18 months" },
          { id: "m1y_2", text: "Builds a tower of 4-6 blocks and scribbles with crayons", redFlag: "Cannot hold a crayon or build a 2-block tower" },
          { id: "m1y_3", text: "Drinks from an open cup and attempts to use a spoon", redFlag: "Severe oral-motor feeding aversion" }
        ]
      },
      {
        domain: "Social & Communication",
        icon: "smile",
        milestones: [
          { id: "m1y_4", text: "Speaks at least 15-20 distinct words and combines two words ('More milk', 'Go car')", redFlag: "Fewer than 6 words by 18 months; no 2-word phrases by 24 months" },
          { id: "m1y_5", text: "Points to body parts when named ('Where is your nose?')", redFlag: "Does not imitate actions or words" },
          { id: "m1y_6", text: "Follows simple 1-step instructions ('Please bring the ball')", redFlag: "Does not follow simple commands" }
        ]
      }
    ]
  },
  {
    ageGroup: "2 - 3 Years",
    ageRangeLabel: "2 to 3 Years",
    summary: "Sentence formulation, jumping, interactive play, and emerging independence.",
    domains: [
      {
        domain: "Gross & Fine Motor",
        icon: "activity",
        milestones: [
          { id: "m2y_1", text: "Jumps in place with both feet leaving the ground; kicks a ball forward", redFlag: "Frequent falling or difficulty with stairs" },
          { id: "m2y_2", text: "Turns door handles, unscrews jar lids, and turns book pages one by one", redFlag: "Extremely poor hand-eye coordination" },
          { id: "m2y_3", text: "Pedals a tricycle or ride-on toy", redFlag: "Unable to manipulate small objects" }
        ]
      },
      {
        domain: "Social & Communication",
        icon: "smile",
        milestones: [
          { id: "m2y_4", text: "Speaks in 3-4 word sentences understood by strangers 75% of time", redFlag: "Speech is unclear or has severe stuttering/regression" },
          { id: "m2y_5", text: "Shows affection for playmates; participates in parallel & imaginative play", redFlag: "Does not make eye contact or show interest in peers" },
          { id: "m2y_6", text: "Understands concepts of 'mine', 'his', 'big', 'small'", redFlag: "Inability to understand simple instructions" }
        ]
      }
    ]
  },
  {
    ageGroup: "3 - 5 Years",
    ageRangeLabel: "3 to 5 Years (Preschooler)",
    summary: "Storytelling, hopping, dressing independently, and counting.",
    domains: [
      {
        domain: "Gross & Fine Motor",
        icon: "activity",
        milestones: [
          { id: "m3y_1", text: "Hops on one foot, balances for 3-5 seconds, catches a bounced ball", redFlag: "Cannot hop or jump" },
          { id: "m3y_2", text: "Draws circles, squares, and a person with 2-4 body parts", redFlag: "Cannot draw a circle or hold a pencil correctly" },
          { id: "m3y_3", text: "Dresses and undresses self with minimal assistance (except tiny buttons/laces)", redFlag: "Unable to manage basic personal hygiene" }
        ]
      },
      {
        domain: "Social & Communication",
        icon: "smile",
        milestones: [
          { id: "m3y_4", text: "Tells simple stories, uses past/future tense, knows colors and numbers", redFlag: "Unclear speech or difficulty with sentences" },
          { id: "m3y_5", text: "Cooperates with other children, takes turns, and negotiates solutions", redFlag: "Shows intense aggression or extreme withdrawal" },
          { id: "m3y_6", text: "Expresses a wide range of emotions and comforts friends in distress", redFlag: "Loss of previously acquired speech or motor skills" }
        ]
      }
    ]
  }
];

// Nutrition & Feeding Guidance Data
const NUTRITION_STAGES = [
  {
    id: "stage-0-6",
    title: "0 - 6 Months",
    subtitle: "Golden Foundation: Exclusive Breastfeeding",
    icon: "heart",
    color: "#DFF2FF",
    badge: "100% Milk Nutrition",
    dailyGuidelines: "Exclusive breastfeeding or infant formula for the first 6 months. No water, gripe water, animal milk, or sugar needed.",
    keyPoints: [
      "Colostrum (first golden milk) is rich in maternal antibodies (IgA) and acts as baby's first natural vaccine.",
      "Feed on demand: Look for early hunger cues (rooting, hand sucking, lip smacking) rather than waiting for late distress crying.",
      "Minimum 8-12 feeds in 24 hours. Normal output: 6+ heavy wet diapers and steady weight gain.",
      "Vitamin D supplementation (400 IU/day) as recommended by Indian Academy of Pediatrics."
    ],
    foodsRecommended: [
      { name: "Mother's Breastmilk", note: "Gold standard nutrition tailored to baby's developmental needs" },
      { name: "Pediatric Formula", note: "If medically advised by your pediatrician" }
    ],
    foodsAvoid: [
      "Cow's milk / Buffalo milk (hard on immature infant kidneys)",
      "Plain water (can dilute sodium levels and cause water intoxication)",
      "Honey (severe risk of infant botulism)",
      "Sugar, salt, jaggery, or herbal concoctions"
    ]
  },
  {
    id: "stage-6-8",
    title: "6 - 8 Months",
    subtitle: "Weaning & Complimentary Solid Intro",
    icon: "coffee",
    color: "#FFE5EC",
    badge: "Smooth Purees & Mashes",
    dailyGuidelines: "Breastfeeding continues on demand. Introduce 1-2 complementary solid meals per day (2-3 tablespoons per feed).",
    keyPoints: [
      "Start with single-ingredient, smooth, lump-free purees or well-cooked mashes.",
      "Follow the 3-day rule when introducing new foods to monitor for allergic reactions (hives, vomiting, diarrhea).",
      "Do NOT add salt or sugar. Natural flavors develop healthy taste buds.",
      "Offer small sips of boiled and cooled water after solid feeds (30-50 ml/day)."
    ],
    foodsRecommended: [
      { name: "Mashed Banana & Stewed Apple Puree", note: "Gentle on tummy, rich in pectin" },
      { name: "Ragi (Finger Millet) Porridge", note: "Exceptional source of calcium and iron" },
      { name: "Moong Dal & Rice Water / Khichdi", note: "Easily digestible plant protein" },
      { name: "Steamed Carrot & Pumpkin Puree", note: "Beta-carotene for vision and immunity" }
    ],
    foodsAvoid: [
      "Cow's milk before 12 months",
      "Added refined sugar, salt, and honey",
      "Whole nuts, whole grapes, or hard raw vegetables (choking hazard)",
      "Packaged infant juices"
    ]
  },
  {
    id: "stage-9-11",
    title: "9 - 11 Months",
    subtitle: "Finger Foods & Self-Feeding",
    icon: "smile",
    color: "#DFF7E8",
    badge: "Soft Finger Textures",
    dailyGuidelines: "3 meals per day plus 1 healthy snack. Continue breastfeeding 3-4 times daily.",
    keyPoints: [
      "Transition from smooth purees to soft lumps, shredded textures, and finger foods to encourage chewing.",
      "Encourage pincer grasp: Offer soft bite-sized cubes baby can pick up independently.",
      "Iron-rich foods are critical as infant prenatal iron stores deplete around this stage.",
      "Family dining: Seat baby at the family table in a safe high chair."
    ],
    foodsRecommended: [
      { name: "Soft Paneer Cubes / Well-Cooked Tofu", note: "Protein and calcium for teeth and bone growth" },
      { name: "Egg Yolk / Well-Cooked Scrambled Egg", note: "Choline for brain development, DHA and iron" },
      { name: "Thick Dal Khichdi with Ghee & Veggies", note: "Complete amino acid profile and healthy fats" },
      { name: "Soft Steamed Veggie Batons (Carrot, Zucchini, Sweet Potato)", note: "Self-feeding motor practice" }
    ],
    foodsAvoid: [
      "Whole dry fruits or hard raw nuts",
      "Popcorn, hard candy, or round hot dog coins",
      "Commercial biscuits with trans-fats and excessive sugar"
    ]
  },
  {
    id: "stage-1-2",
    title: "1 - 2 Years",
    subtitle: "Toddler Transition & Family Table",
    icon: "award",
    color: "#FFF4CC",
    badge: "Wholesome Family Meals",
    dailyGuidelines: "3 structured family meals + 2 healthy snacks. Cow's milk can be introduced (limit to max 400-500 ml/day).",
    keyPoints: [
      "Toddler eats mostly what the family eats, mildly spiced and seasoned.",
      "Avoid milk bottle dependency; transition to open cups to protect speech and teeth alignment.",
      "Expect appetite swings: Growth rate slows compared to infancy, which is completely normal.",
      "Division of responsibility: Parents decide WHAT, WHEN, and WHERE to offer food; child decides WHETHER and HOW MUCH to eat."
    ],
    foodsRecommended: [
      { name: "Soft Roti dipped in Dal / Vegetable Paratha", note: "Complex carbohydrates and dietary fiber" },
      { name: "Whole Curd / Yogurt with chopped soft fruits", note: "Probiotics for gut health and bioavailable calcium" },
      { name: "Steamed Idli with mild Sambar", note: "Fermented easily digestible traditional meal" },
      { name: "Boiled Chickpeas (Chana) & Soft Rajma", note: "Fiber, zinc, and plant-based protein" }
    ],
    foodsAvoid: [
      "Ultra-processed snacks (chips, noodles, sodas)",
      "Over-reliance on milk exceeding 500 ml/day (causes milk-induced iron deficiency anemia)",
      "Caffeinated beverages and tea"
    ]
  },
  {
    id: "stage-2-5",
    title: "2 - 5 Years",
    subtitle: "Preschooler Nutrition & Growth",
    icon: "star",
    color: "#EEE7FF",
    badge: "Balanced Rainbow Plate",
    dailyGuidelines: "Balanced diet incorporating all 5 food groups: Cereals, Pulses, Dairy, Fruits/Vegetables, and Healthy Fats.",
    keyPoints: [
      "Aim for a 'Rainbow Plate': Multiple natural colors on the plate ensure diverse micronutrients and antioxidants.",
      "Picky eating management: Keep exposing new foods 10-15 times without pressure. Pair a new vegetable with a favorite dip.",
      "Hydration: 1.2 to 1.5 Liters of plain water daily.",
      "No screens during mealtimes to foster mindful eating and fullness cues."
    ],
    foodsRecommended: [
      { name: "Colorful Fruit Bowls (Papaya, Apple, Pomegranate, Berries)", note: "Rich in Vitamin C and fiber" },
      { name: "Homemade Paneer Tikka / Sprouted Moong Cutlets", note: "Fun finger foods packed with clean protein" },
      { name: "Dry Fruit & Seed Powder Milk Smoothie (No refined sugar)", note: "Omega-3 and brain-boosting fats" },
      { name: "Whole Grain Dosa / Methi Thepla", note: "Iron, greens, and steady energy" }
    ],
    foodsAvoid: [
      "Sweetened breakfast cereals with artificial food dyes",
      "Packaged fruit juices (empty liquid sugars lacking natural fiber)",
      "Deep-fried fast food"
    ]
  }
];

// Paediatricians Directory at Mukta Children's Hospital
const MUKTA_DOCTORS = [
  {
    id: "dr-mukta",
    name: "Dr. Mukta Patil",
    title: "Chief Pediatrician & Neonatologist",
    qualifications: "MBBS, MD (Pediatrics), Fellowship in Neonatology (UK)",
    experience: "18+ Years Experience",
    department: "Pediatrics & Neonatal ICU",
    languages: "English, Hindi, Marathi",
    availability: "Mon - Sat: 10:00 AM - 2:00 PM & 5:00 PM - 8:00 PM",
    bio: "Renowned pediatric consultant specializing in critical newborn care, developmental assessments, and childhood immunizations.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    tags: ["Chief Consultant", "Neonatologist", "Immunization Expert"]
  },
  {
    id: "dr-rajesh",
    name: "Dr. Rajesh Deshmukh",
    title: "Pediatric Pulmonologist & Intensivist",
    qualifications: "MBBS, DCH, DNB (Pediatrics), Fellowship Pediatric Pulmonology",
    experience: "14+ Years Experience",
    department: "Pediatric Pulmonology & Asthma Clinic",
    languages: "English, Hindi, Marathi",
    availability: "Mon, Wed, Fri: 11:00 AM - 3:00 PM",
    bio: "Expert in childhood respiratory allergies, pediatric asthma, chronic cough management, and pediatric intensive care.",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    tags: ["Asthma Clinic", "Respiratory Care", "PICU Lead"]
  },
  {
    id: "dr-sneha",
    name: "Dr. Sneha Kulkarni",
    title: "Developmental & Behavioral Pediatrician",
    qualifications: "MBBS, MD (Pediatrics), PGD in Developmental Pediatrics",
    experience: "11+ Years Experience",
    department: "Child Development & Early Intervention",
    languages: "English, Hindi, Marathi",
    availability: "Tue, Thu, Sat: 2:00 PM - 6:00 PM",
    bio: "Dedicated to early detection of developmental milestones, ADHD screening, speech delay assessments, and autism interventions.",
    avatar: "https://images.unsplash.com/photo-1594824813506-03706be95be8?auto=format&fit=crop&w=400&q=80",
    tags: ["Milestone Specialist", "Behavioral Care", "Autism Support"]
  },
  {
    id: "dr-amit",
    name: "Dr. Amit Joshi",
    title: "Consultant Pediatric Surgeon",
    qualifications: "MBBS, MS (General Surgery), MCh (Pediatric Surgery)",
    experience: "15+ Years Experience",
    department: "Pediatric & Neonatal Surgery",
    languages: "English, Hindi, Marathi",
    availability: "By Appointment & 24/7 Surgical Emergencies",
    bio: "Performs minimally invasive pediatric laparoscopy, congenital anomaly corrections, pediatric urology, and emergency surgeries.",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    tags: ["Pediatric Surgeon", "Neonatal Surgery", "24/7 On-Call"]
  }
];

// Parenting Knowledge Centre Articles (Doctor-Reviewed)
const KNOWLEDGE_ARTICLES = [
  {
    id: "art-1",
    title: "Managing High Fever in Babies: A Pediatrician's Step-by-Step Guide",
    category: "Common Illnesses",
    readTime: "4 min read",
    author: "Dr. Mukta Patil",
    date: "Reviewed October 2024",
    summary: "Understand when fever is helpful, safe temperature ranges, cooling strategies, and red flags that need immediate hospital care.",
    content: `
      <h4>Why Does Fever Occur?</h4>
      <p>Fever is not a disease in itself; it is your baby's immune system creating an inhospitable environment for viruses and bacteria. A rise in core temperature stimulates white blood cells and antibody production.</p>
      
      <h4>How to Measure Temperature Accurately</h4>
      <ul>
        <li><strong>Infants under 3 months:</strong> Rectal or digital axillary (armpit) reading is gold standard.</li>
        <li><strong>Children over 6 months:</strong> Digital armpit or infrared temporal thermometers.</li>
        <li>Always add 1°F to an armpit reading to estimate core body temperature.</li>
      </ul>

      <h4>What You Should Do at Home</h4>
      <ol>
        <li><strong>Prioritize Comfort:</strong> Dress your child in light cotton. A room temperature of 24°C–26°C with gentle fan circulation is ideal.</li>
        <li><strong>Fluids First:</strong> Dehydration is the biggest risk with fever. Offer small sips of water, ORS, or breastfeed frequently.</li>
        <li><strong>Lukewarm Sponging:</strong> If temperature exceeds 102°F, sponge with lukewarm water (not cold). Never use alcohol or ice.</li>
        <li><strong>Medication:</strong> Give Paracetamol strictly according to your pediatrician's prescribed weight-based dosage (typically 10-15 mg/kg per dose). Never give Aspirin.</li>
      </ol>

      <div class="article-alert">
        <strong>⚠️ When to Go to the Emergency Room:</strong>
        <p>Infants under 3 months with fever ≥ 100.4°F (38°C), persistent unresponsiveness, breathing difficulty, extreme neck stiffness, or purpuric purple skin rash require IMMEDIATE hospital attention.</p>
      </div>
    `
  },
  {
    id: "art-2",
    title: "Starting Solids: The Golden Weaning Rules for 6-Month-Olds",
    category: "Nutrition",
    readTime: "5 min read",
    author: "Dr. Sneha Kulkarni",
    date: "Reviewed September 2024",
    summary: "Navigating the transition from milk to solids safely with wholesome Indian ingredients and allergen awareness.",
    content: `
      <h4>Is Your Baby Ready for Solids?</h4>
      <p>Around 6 months, babies develop developmental cues of readiness:</p>
      <ul>
        <li>Can sit upright with minimal support and hold their head steady.</li>
        <li>Diminishing extrusion reflex (stops reflexively pushing food out with the tongue).</li>
        <li>Shows keen interest in family food by watching your plate and leaning forward.</li>
      </ul>

      <h4>Traditional & Nutrient-Dense First Foods</h4>
      <p>Begin with single-grain or vegetable purees that are rich in iron and easily digestible:</p>
      <ul>
        <li><strong>Ragi Porridge:</strong> Excellent source of calcium and iron. Cook with water or expressed breastmilk.</li>
        <li><strong>Moong Dal Khichdi:</strong> Soft mashed rice and yellow moong dal with a drop of pure homemade cow ghee.</li>
        <li><strong>Steamed Veggie Purees:</strong> Carrots, bottle gourd (lauki), and pumpkin.</li>
      </ul>

      <h4>The 3-Day Rule & Allergens</h4>
      <p>Introduce one new single ingredient at a time and feed it for 3 consecutive days during morning hours. This allows you to monitor for any adverse reactions such as skin hives, vomiting, or altered stools.</p>
    `
  },
  {
    id: "art-3",
    title: "Understanding Childhood Vaccinations: Why Timing Matters",
    category: "Vaccinations",
    readTime: "6 min read",
    author: "Dr. Mukta Patil",
    date: "Reviewed August 2024",
    summary: "Clear scientific answers to common questions about vaccine schedules, boosters, and combination shots.",
    content: `
      <h4>How Do Vaccines Work?</h4>
      <p>Vaccines train your child's immune system using harmless weakened or inactive antigens. Memory B and T cells are formed, providing rapid immunological defense if the child ever encounters the actual virus or bacteria in the community.</p>

      <h4>Why Are Timelines So Specific?</h4>
      <p>Infants are born with maternal antibodies that gradually decline over the first 6 to 9 months. Vaccination intervals are meticulously researched to ensure vaccines are given at the exact window when maternal antibodies decline and the infant immune system is primed to generate peak response.</p>

      <h4>Combination Vaccines (Penta & Hexavalent)</h4>
      <p>Modern hexavalent vaccines combine 6 protections (DTaP/DTwP, IPV, Hib, Hep B) into a single injection. This dramatically reduces the number of painful pricks, clinic visits, and stress for both baby and parents without sacrificing efficacy.</p>
    `
  },
  {
    id: "art-4",
    title: "Healthy Sleep Habits for Infants and Toddlers",
    category: "Sleep",
    readTime: "4 min read",
    author: "Dr. Rajesh Deshmukh",
    date: "Reviewed July 2024",
    summary: "Circadian rhythms, safe sleep environments (SIDS prevention), and gentle bedtime routines.",
    content: `
      <h4>Safe Sleep Guidelines (Preventing SIDS)</h4>
      <p>Follow the AAP and IAP 'ABC' of safe infant sleep:</p>
      <ul>
        <li><strong>A - Alone:</strong> Sleep surface separate from parents, though in the same room for the first 6 months.</li>
        <li><strong>B - on Back:</strong> Always place your baby on their back to sleep, never on their stomach or side.</li>
        <li><strong>C - in Crib:</strong> Firm mattress with a fitted sheet; NO pillows, loose blankets, bumpers, or soft toys.</li>
      </ul>

      <h4>Establishing a 20-Minute Bedtime Routine</h4>
      <p>Predictability creates security for toddlers. A simple ritual: Warm sponge bath &rarr; Soft cotton pajamas &rarr; Lullaby or bedtime story &rarr; Lights dimmed. Keeping sleep and wake times consistent even on weekends regulates the child's natural melatonin production.</p>
    `
  },
  {
    id: "art-5",
    title: "Speech Delay vs. Normal Variation: What Parents Should Know",
    category: "Child Development",
    readTime: "5 min read",
    author: "Dr. Sneha Kulkarni",
    date: "Reviewed June 2024",
    summary: "Recognizing key communication milestones from first babble to sentences, and how to boost verbal skills at home.",
    content: `
      <h4>Normal Speech Trajectory</h4>
      <ul>
        <li><strong>By 12 months:</strong> Responds to name, babbles consonants, waves bye-bye, says 1-2 words.</li>
        <li><strong>By 18 months:</strong> Has 10-20 single words and points to show wants.</li>
        <li><strong>By 24 months:</strong> Uses 2-word spontaneous phrases ('Want milk', 'Bye daddy') and understands 50+ words.</li>
      </ul>

      <h4>Screen Time & Speech Delay</h4>
      <p>Pediatric guidelines recommend <strong>ZERO screen time</strong> for children under 2 years (except video calls with family) and less than 1 hour of educational media for children aged 2 to 5. Studies confirm that excessive background television and mobile phone use replace active conversational turn-taking, directly contributing to expressive language delays.</p>
    `
  },
  {
    id: "art-6",
    title: "Newborn Care in the First Month: Essential Do's and Don'ts",
    category: "Newborn Care",
    readTime: "5 min read",
    author: "Dr. Mukta Patil",
    date: "Reviewed May 2024",
    summary: "Umbilical cord hygiene, normal neonatal jaundice, bathing guidelines, and tummy time.",
    content: `
      <h4>Umbilical Cord Care</h4>
      <p>Keep the umbilical cord stump dry and clean (dry cord care). Fold the diaper below the stump so urine does not soak it. Do NOT apply turmeric, oils, cow dung, or antiseptics unless specifically prescribed. The stump normally falls off naturally between 7 and 14 days.</p>

      <h4>Physiological Jaundice</h4>
      <p>Mild yellowish tinge on face/eyes is common on day 2-4 as baby's liver matures. Frequent feeding helps excrete bilirubin in stools. However, if jaundice spreads downwards to the chest, palms, or soles, or baby appears sluggish, have their bilirubin checked immediately.</p>
    `
  }
];
