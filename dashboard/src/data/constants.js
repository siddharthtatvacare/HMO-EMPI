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
