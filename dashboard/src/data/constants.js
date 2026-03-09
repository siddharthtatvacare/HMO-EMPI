// Filipino first names and surnames for realistic data
export const FIRST_NAMES_MALE = [
  'Juan', 'Jose', 'Mark', 'Angelo', 'Carlo', 'Miguel', 'Rafael', 'Gabriel', 'Antonio',
  'Francisco', 'Luis', 'Ricardo', 'Eduardo', 'Fernando', 'Roberto', 'Alejandro', 'Diego',
  'Jerico', 'Benedict', 'Christian', 'Dominic', 'Emilio', 'Felix', 'Gregorio', 'Ignacio',
  'Joaquin', 'Leonardo', 'Manuel', 'Nathaniel', 'Oscar', 'Paolo', 'Ramon', 'Sebastian',
  'Tomas', 'Vicente', 'Andres', 'Bernardo', 'Cesar', 'Danilo', 'Enrique', 'Fidel',
  'Gerardo', 'Hector', 'Ivan', 'Jaime', 'Kenneth', 'Lorenzo', 'Mario', 'Noel', 'Patrick'
];

export const FIRST_NAMES_FEMALE = [
  'Maria', 'Ana', 'Rosa', 'Carmen', 'Elena', 'Isabel', 'Sofia', 'Lucia', 'Angela',
  'Patricia', 'Teresa', 'Josefa', 'Dolores', 'Esperanza', 'Concepcion', 'Remedios',
  'Rosario', 'Milagros', 'Pilar', 'Lourdes', 'Corazon', 'Fe', 'Cristina', 'Angelica',
  'Beatriz', 'Catalina', 'Diana', 'Estrella', 'Felicia', 'Gloria', 'Helena', 'Irene',
  'Jasmine', 'Karen', 'Leonora', 'Magdalena', 'Natividad', 'Olivia', 'Paulina', 'Regina',
  'Samantha', 'Theresa', 'Ursula', 'Veronica', 'Wilma', 'Ximena', 'Yolanda', 'Zenaida'
];

export const SURNAMES = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres',
  'Villanueva', 'Ramos', 'Gonzales', 'Dela Cruz', 'Rivera', 'Flores', 'Aquino',
  'Castro', 'Morales', 'Dizon', 'Manalo', 'Pascual', 'Salazar', 'Navarro', 'Mercado',
  'Aguilar', 'Lopez', 'Hernandez', 'Martinez', 'Perez', 'Rodriguez', 'Fernandez',
  'De Leon', 'Santiago', 'Valdez', 'Soriano', 'Enriquez', 'Padilla', 'Magno', 'Jimenez',
  'Corpuz', 'Tolentino', 'Domingo', 'Del Rosario', 'Evangelista', 'Cabrera', 'Miranda',
  'Francisco', 'De Guzman', 'Lacson', 'Zamora', 'Lim', 'Tan', 'Co', 'Sy', 'Ong', 'Chua'
];

export const CENTERS = [
  'Aventus - Ayala North Exchange',
  'Aventus - One Ayala',
  'Aventus - North Edsa'
];

export const CALL_TYPES = ['Video', 'Voice'];

export const SPECIALISATIONS = ['Endo', 'IM', 'Nephro'];

export const SPECIALISATION_LABELS = {
  'Endo': 'Endocrinology',
  'IM': 'Internal Medicine',
  'Nephro': 'Nephrology'
};

export const REQUEST_STATUSES = ['Confirmed', 'Cancelled'];

export const RX_APPROVAL_STATUSES = ['Approved', 'Rejected'];

export const MEDICINE_STATUSES = ['Covered', 'Not Covered'];

export const CART_STATUSES = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const DIAG_CART_STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled'];

export const DIAG_DETAILED_STATUSES = [
  'Sample Pending', 'Sample Collected', 'Processing', 'Report Ready', 'Delivered', 'Cancelled'
];

export const DIAG_TYPES = ['Lab', 'Imaging', 'Home Collection'];

export const RELATIONS = ['Self', 'Spouse', 'Child', 'Parent'];

// Chronic disease medicines common in Philippines
export const MEDICINES = {
  diabetes: [
    'Metformin 500mg', 'Metformin 850mg', 'Glimepiride 2mg', 'Glimepiride 4mg',
    'Sitagliptin 100mg', 'Empagliflozin 10mg', 'Empagliflozin 25mg',
    'Insulin Glargine 100IU', 'Vildagliptin 50mg', 'Dapagliflozin 10mg'
  ],
  hypertension: [
    'Losartan 50mg', 'Losartan 100mg', 'Amlodipine 5mg', 'Amlodipine 10mg',
    'Telmisartan 40mg', 'Telmisartan 80mg', 'Valsartan 80mg', 'Valsartan 160mg',
    'Candesartan 8mg', 'Irbesartan 150mg'
  ],
  cholesterol: [
    'Atorvastatin 20mg', 'Atorvastatin 40mg', 'Rosuvastatin 10mg', 'Rosuvastatin 20mg',
    'Simvastatin 20mg', 'Fenofibrate 160mg'
  ],
  kidney: [
    'Erythropoietin 4000IU', 'Calcium Carbonate 500mg', 'Calcitriol 0.25mcg',
    'Sodium Bicarbonate 500mg', 'Iron Sucrose 100mg', 'Sevelamer 800mg'
  ],
  general: [
    'Omeprazole 20mg', 'Pantoprazole 40mg', 'Multivitamins', 'Vitamin D3 1000IU',
    'Aspirin 80mg', 'Clopidogrel 75mg'
  ]
};

// Diagnostic tests
export const DIAGNOSTIC_TESTS = {
  Lab: [
    'HbA1c', 'Fasting Blood Sugar', 'Lipid Profile', 'Complete Blood Count',
    'Serum Creatinine', 'BUN', 'Urinalysis', 'Thyroid Panel (TSH, T3, T4)',
    'Liver Function Test', 'Electrolytes Panel', 'Uric Acid', 'Microalbumin'
  ],
  Imaging: [
    'Chest X-Ray', 'Kidney Ultrasound', 'Abdominal Ultrasound', 'ECG',
    '2D Echo', 'Thyroid Ultrasound', 'Doppler Ultrasound'
  ],
  'Home Collection': [
    'HbA1c', 'Fasting Blood Sugar', 'Lipid Profile', 'Complete Blood Count',
    'Serum Creatinine', 'Urinalysis', 'Thyroid Panel (TSH, T3, T4)'
  ]
};

// Filipino doctor names
export const DOCTOR_NAMES = [
  'Dr. Maria Elena Santos', 'Dr. Jose Miguel Reyes', 'Dr. Ana Patricia Cruz',
  'Dr. Roberto Carlos Garcia', 'Dr. Sofia Isabel Mendoza', 'Dr. Fernando Luis Torres',
  'Dr. Carmen Rosa Villanueva', 'Dr. Eduardo Antonio Ramos', 'Dr. Teresa Lucia Gonzales',
  'Dr. Ricardo Manuel Rivera', 'Dr. Angelica Fe Flores', 'Dr. Francisco Diego Aquino',
  'Dr. Esperanza Pilar Castro', 'Dr. Lorenzo Miguel Morales', 'Dr. Cristina Elena Dizon',
  'Dr. Rafael Ignacio Manalo', 'Dr. Beatriz Carmen Pascual', 'Dr. Gregorio Tomas Salazar',
  'Dr. Helena Diana Navarro', 'Dr. Joaquin Sebastian Mercado'
];

// Philippine addresses by center area
export const ADDRESSES = {
  'Aventus - Ayala North Exchange': [
    'Ayala Ave., Makati City', 'Paseo de Roxas, Makati City', 'Gil Puyat Ave., Makati City',
    'Chino Roces Ave., Makati City', 'Buendia Ave., Makati City', 'Leviste St., Makati City',
    'Salcedo Village, Makati City', 'Legazpi Village, Makati City'
  ],
  'Aventus - One Ayala': [
    'Ayala Center, Makati City', 'EDSA cor. Ayala Ave., Makati City',
    'Glorietta Complex, Makati City', 'Park Triangle, BGC, Taguig',
    'Bonifacio High Street, BGC, Taguig', 'McKinley Parkway, BGC, Taguig'
  ],
  'Aventus - North Edsa': [
    'North Ave., Quezon City', 'EDSA, Quezon City', 'Trinoma Mall Area, Quezon City',
    'Congressional Ave., Quezon City', 'Mindanao Ave., Quezon City',
    'Visayas Ave., Quezon City', 'Commonwealth Ave., Quezon City', 'Fairview, Quezon City'
  ]
};

// ============================================================
// NEW — HMO EMPI Constants
// ============================================================

// Filipino employers with member size tiers
// Total members across all employers should sum to ~1000
export const EMPLOYERS = [
  // Large (50-80 members each)
  { name: 'San Miguel Corporation', size: 'large', members: 78 },
  { name: 'Ayala Corporation', size: 'large', members: 71 },
  { name: 'PLDT Inc.', size: 'large', members: 65 },
  { name: 'Globe Telecom', size: 'large', members: 58 },
  { name: 'BDO Unibank', size: 'large', members: 62 },
  { name: 'Jollibee Foods Corp', size: 'large', members: 52 },
  { name: 'SM Investments', size: 'large', members: 55 },
  // Medium (20-49 members each)
  { name: 'Meralco', size: 'medium', members: 44 },
  { name: 'Aboitiz Equity Ventures', size: 'medium', members: 38 },
  { name: 'Manila Water', size: 'medium', members: 32 },
  { name: 'Metrobank', size: 'medium', members: 35 },
  { name: 'Bank of the Philippine Islands', size: 'medium', members: 30 },
  { name: 'Robinsons Land', size: 'medium', members: 28 },
  { name: 'Cebu Pacific Air', size: 'medium', members: 25 },
  { name: 'Philippine Airlines', size: 'medium', members: 22 },
  { name: 'Universal Robina Corp', size: 'medium', members: 26 },
  { name: 'Megaworld Corporation', size: 'medium', members: 24 },
  { name: 'First Gen Corporation', size: 'medium', members: 20 },
  // Small (5-19 members each)
  { name: 'Converge ICT', size: 'small', members: 18 },
  { name: 'DMCI Holdings', size: 'small', members: 16 },
  { name: 'Filinvest Land', size: 'small', members: 15 },
  { name: 'Security Bank', size: 'small', members: 14 },
  { name: 'Emperador Inc.', size: 'small', members: 12 },
  { name: 'GT Capital Holdings', size: 'small', members: 11 },
  { name: 'Monde Nissin', size: 'small', members: 10 },
  { name: 'DoubleDragon Properties', size: 'small', members: 9 },
  { name: 'Puregold Price Club', size: 'small', members: 12 },
  { name: 'Vista Land & Lifescapes', size: 'small', members: 10 },
  { name: 'Wilcon Depot', size: 'small', members: 8 },
  { name: 'AllDay Marts', size: 'small', members: 7 },
  { name: 'Century Pacific Food', size: 'small', members: 8 },
  { name: 'D&L Industries', size: 'small', members: 6 },
  { name: 'Shakey\'s Pizza', size: 'small', members: 7 },
  { name: 'Max\'s Group', size: 'small', members: 6 },
];

// Risk cohort definitions — derived from biomarker profiles off count
export const RISK_COHORTS = [
  { id: 'extremely_low', label: 'Extremely Low', profilesOff: 0, color: '#0E6B5E', cssVar: '--risk-ext-low' },
  { id: 'low', label: 'Low', profilesOff: 1, color: '#00875A', cssVar: '--risk-low' },
  { id: 'at_risk', label: 'At Risk', profilesOff: 2, color: '#C27D2E', cssVar: '--risk-at' },
  { id: 'high', label: 'High', profilesOff: 3, color: '#E8590C', cssVar: '--risk-high' },
  { id: 'extremely_high', label: 'Extremely High', profilesOff: [4, 5], color: '#DE350B', cssVar: '--risk-ext-high' },
];

// Metabolic score interpretation bands (raw additive, 157-616 range)
export const METABOLIC_SCORE_BANDS = [
  { label: 'Excellent', min: 526, color: '#0E6B5E' },
  { label: 'Good', min: 430, max: 525, color: '#00875A' },
  { label: 'Moderate', min: 310, max: 429, color: '#C27D2E' },
  { label: 'Poor', min: 215, max: 309, color: '#E8590C' },
  { label: 'Critical', max: 214, color: '#DE350B' },
];

// Biomarker profile definitions with normal ranges
// Source: goodflip_scoring.md diagnostic section
export const BIOMARKER_PROFILES = {
  hba1c: {
    label: 'HbA1c',
    unit: '%',
    normalMax: 5.6,
    borderlineMax: 6.4,
    // Single test — off if >= 6.5
    isOff: (value) => value >= 6.5,
    isBorderline: (value) => value >= 5.7 && value < 6.5,
    generate: (riskFactor) => {  // riskFactor 0-1, higher = worse
      const base = 4.8 + riskFactor * 4.2; // 4.8 to 9.0
      return parseFloat(base.toFixed(1));
    }
  },
  lipidProfile: {
    label: 'Lipid Profile',
    offThreshold: 2,  // off if >= 2 of 8 sub-tests out of range
    subTests: [
      { name: 'Total Cholesterol', unit: 'mg/dL', normalMax: 200, generate: (rf) => Math.round(140 + rf * 120) },
      { name: 'Triglycerides', unit: 'mg/dL', normalMax: 150, generate: (rf) => Math.round(80 + rf * 170) },
      { name: 'HDL', unit: 'mg/dL', normalMin: 40, generate: (rf) => Math.round(65 - rf * 35) },
      { name: 'Non-HDL Cholesterol', unit: 'mg/dL', normalMax: 130, generate: (rf) => Math.round(90 + rf * 80) },
      { name: 'LDL', unit: 'mg/dL', normalMax: 100, generate: (rf) => Math.round(60 + rf * 100) },
      { name: 'VLDL', unit: 'mg/dL', normalMax: 30, generate: (rf) => Math.round(15 + rf * 30) },
      { name: 'Chol/HDL Ratio', unit: '', normalMin: 3.5, normalMax: 5.0, generate: (rf) => parseFloat((3.0 + rf * 3.5).toFixed(1)) },
      { name: 'HDL/LDL Ratio', unit: '', normalMin: 0.5, normalMax: 3.0, generate: (rf) => parseFloat((2.5 - rf * 2.2).toFixed(1)) },
    ]
  },
  bloodGlucose: {
    label: 'Blood Glucose',
    unit: 'mg/dL',
    normalMax: 100,
    borderlineMax: 125,
    // Single test — off if >= 126
    isOff: (value) => value >= 126,
    isBorderline: (value) => value >= 100 && value < 126,
    generate: (riskFactor) => {
      const base = 75 + riskFactor * 100; // 75 to 175
      return Math.round(base);
    }
  },
  kidneyProfile: {
    label: 'Kidney Profile',
    offThreshold: 3,  // off if >= 3 of 9 sub-tests out of range
    subTests: [
      { name: 'BUN', unit: 'mg/dL', normalMin: 8.9, normalMax: 20.6, generate: (rf) => parseFloat((8 + rf * 25).toFixed(1)) },
      { name: 'Creatinine', unit: 'mg/dL', normalMin: 0.72, normalMax: 1.25, generate: (rf) => parseFloat((0.6 + rf * 1.5).toFixed(2)) },
      { name: 'Uric Acid', unit: 'mg/dL', normalMin: 3.5, normalMax: 7.2, generate: (rf) => parseFloat((3.0 + rf * 6.0).toFixed(1)) },
      { name: 'Calcium', unit: 'mg/dL', normalMin: 8.4, normalMax: 10.2, generate: (rf) => parseFloat((8.0 + rf * 4.0).toFixed(1)) },
      { name: 'Phosphorus', unit: 'mg/dL', normalMin: 2.3, normalMax: 4.7, generate: (rf) => parseFloat((2.0 + rf * 4.0).toFixed(1)) },
      { name: 'Sodium', unit: 'mmol/L', normalMin: 136, normalMax: 145, generate: (rf) => Math.round(134 + rf * 16) },
      { name: 'Potassium', unit: 'mmol/L', normalMin: 3.5, normalMax: 5.1, generate: (rf) => parseFloat((3.2 + rf * 2.5).toFixed(1)) },
      { name: 'Chloride', unit: 'mmol/L', normalMin: 98, normalMax: 107, generate: (rf) => Math.round(96 + rf * 16) },
      { name: 'eGFR', unit: 'mL/min', normalMin: 90, generate: (rf) => Math.round(120 - rf * 80) },
    ]
  },
  liverFunction: {
    label: 'Liver Function',
    offThreshold: 3,  // off if >= 3 of 11 sub-tests out of range
    subTests: [
      { name: 'Bilirubin Total', unit: 'mg/dL', normalMin: 0.2, normalMax: 1.2, generate: (rf) => parseFloat((0.2 + rf * 2.0).toFixed(1)) },
      { name: 'Bilirubin Direct', unit: 'mg/dL', normalMax: 0.5, generate: (rf) => parseFloat((0.1 + rf * 0.8).toFixed(1)) },
      { name: 'Bilirubin Indirect', unit: 'mg/dL', normalMin: 0.1, normalMax: 1.0, generate: (rf) => parseFloat((0.1 + rf * 1.5).toFixed(1)) },
      { name: 'AST', unit: 'U/L', normalMin: 5, normalMax: 34, generate: (rf) => Math.round(10 + rf * 50) },
      { name: 'ALT', unit: 'U/L', normalMax: 55, generate: (rf) => Math.round(12 + rf * 70) },
      { name: 'ALP', unit: 'U/L', normalMin: 40, normalMax: 150, generate: (rf) => Math.round(40 + rf * 160) },
      { name: 'Total Protein', unit: 'g/dL', normalMin: 6.4, normalMax: 8.3, generate: (rf) => parseFloat((6.0 + rf * 3.5).toFixed(1)) },
      { name: 'Albumin', unit: 'g/dL', normalMin: 3.8, normalMax: 5.0, generate: (rf) => parseFloat((4.8 - rf * 2.0).toFixed(1)) },
      { name: 'Globulin', unit: 'g/dL', normalMin: 2.3, normalMax: 3.5, generate: (rf) => parseFloat((2.2 + rf * 2.0).toFixed(1)) },
      { name: 'A/G Ratio', unit: '', normalMin: 1.0, normalMax: 2.1, generate: (rf) => parseFloat((2.0 - rf * 1.5).toFixed(1)) },
      { name: 'GGT', unit: 'U/L', normalMin: 12, normalMax: 64, generate: (rf) => Math.round(15 + rf * 80) },
    ]
  }
};

// Competitor molecule mapping: molecule → Unilab brand → competitor brand
export const COMPETITOR_MOLECULES = [
  { molecule: 'Metformin 500mg', unilabBrand: 'Glucofast', competitorBrand: 'Glucophage (Merck)', category: 'diabetes' },
  { molecule: 'Metformin 850mg', unilabBrand: 'Glucofast 850', competitorBrand: 'Glucophage XR (Merck)', category: 'diabetes' },
  { molecule: 'Losartan 50mg', unilabBrand: 'Lifezar', competitorBrand: 'Cozaar (MSD)', category: 'hypertension' },
  { molecule: 'Losartan 100mg', unilabBrand: 'Lifezar 100', competitorBrand: 'Cozaar (MSD)', category: 'hypertension' },
  { molecule: 'Atorvastatin 20mg', unilabBrand: 'Avamax', competitorBrand: 'Lipitor (Pfizer)', category: 'cholesterol' },
  { molecule: 'Atorvastatin 40mg', unilabBrand: 'Avamax 40', competitorBrand: 'Lipitor (Pfizer)', category: 'cholesterol' },
  { molecule: 'Amlodipine 5mg', unilabBrand: 'Normetec', competitorBrand: 'Norvasc (Pfizer)', category: 'hypertension' },
  { molecule: 'Amlodipine 10mg', unilabBrand: 'Normetec 10', competitorBrand: 'Norvasc (Pfizer)', category: 'hypertension' },
  { molecule: 'Empagliflozin 10mg', unilabBrand: null, competitorBrand: 'Jardiance (Boehringer Ingelheim)', category: 'diabetes' },
  { molecule: 'Rosuvastatin 20mg', unilabBrand: 'Cresmax', competitorBrand: 'Crestor (AstraZeneca)', category: 'cholesterol' },
  { molecule: 'Telmisartan 40mg', unilabBrand: 'Pritel', competitorBrand: 'Micardis (Boehringer Ingelheim)', category: 'hypertension' },
  { molecule: 'Sitagliptin 100mg', unilabBrand: null, competitorBrand: 'Januvia (MSD)', category: 'diabetes' },
];

// External healthcare providers (where leaked spend goes)
export const EXTERNAL_PROVIDERS = {
  hospitals: [
    'St. Luke\'s Medical Center - QC',
    'Asian Hospital and Medical Center',
    'The Medical City',
    'Makati Medical Center',
    'Cardinal Santos Medical Center'
  ],
  pharmacies: [
    'Mercury Drug',
    'Watsons',
    'Rose Pharmacy',
    'Generics Pharmacy',
    'SouthStar Drug'
  ],
  diagnosticLabs: [
    'Hi-Precision Diagnostics',
    'Health Metrics Inc.',
    'Healthway QualiMed',
    'MyHealth Clinic',
    'Personalab'
  ]
};

// Geographic locations for leakage analysis
export const LOCATIONS = [
  'Quezon City', 'Makati CBD', 'BGC Taguig', 'Mandaluyong', 'Pasig',
  'San Juan', 'Pasay', 'Parañaque', 'Las Piñas', 'Muntinlupa'
];

// Hospitalization reasons (for high-risk patients)
export const HOSPITALIZATION_REASONS = [
  'Diabetic ketoacidosis', 'Acute kidney injury', 'Hypertensive crisis',
  'Liver failure exacerbation', 'Cardiovascular event', 'Pneumonia',
  'Sepsis', 'Stroke', 'Heart failure decompensation', 'Diabetic foot infection'
];
