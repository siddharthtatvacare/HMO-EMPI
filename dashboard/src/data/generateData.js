import {
  FIRST_NAMES_MALE, FIRST_NAMES_FEMALE, SURNAMES, CENTERS, CALL_TYPES,
  SPECIALISATIONS, MEDICINES, DIAGNOSTIC_TESTS, DOCTOR_NAMES, ADDRESSES,
  DIAG_TYPES, EMPLOYERS, BIOMARKER_PROFILES, COMPETITOR_MOLECULES,
  EXTERNAL_PROVIDERS, LOCATIONS, HOSPITALIZATION_REASONS, RISK_COHORTS,
  METABOLIC_SCORE_BANDS
} from './constants.js';

// Seeded random for reproducible data
let seed = 42;
function seededRandom() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function pick(arr) { return arr[Math.floor(seededRandom() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => seededRandom() - 0.5);
  return shuffled.slice(0, n);
}
function randInt(min, max) { return Math.floor(seededRandom() * (max - min + 1)) + min; }
function randFloat(min, max, dec = 1) {
  return parseFloat((seededRandom() * (max - min) + min).toFixed(dec));
}
// Gaussian-ish random (sum of 3 uniforms, centered around mean)
function randGauss(mean, stddev) {
  const u = seededRandom() + seededRandom() + seededRandom();
  return mean + stddev * (u - 1.5) / 0.7;
}

function generatePhone() {
  return `+63 9${randInt(10, 99)} ${randInt(100, 999)} ${randInt(1000, 9999)}`;
}

function generateEmail(first, last) {
  const domains = ['gmail.com', 'yahoo.com.ph', 'outlook.com', 'hotmail.com'];
  const clean = s => s.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  return `${clean(first)}.${clean(last)}${randInt(1, 99)}@${pick(domains)}`;
}

function generateDate(start, end) {
  const s = start.getTime();
  const e = end.getTime();
  return new Date(s + seededRandom() * (e - s));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function generateConsultationId(index) {
  return `CONS-${String(index + 1).padStart(6, '0')}`;
}

function generateOrderId(prefix, index) {
  return `${prefix}-${String(index + 1).padStart(6, '0')}`;
}

function generateCartId(index) {
  return `CART-${String(index + 1).padStart(6, '0')}`;
}

// Date range: last ~190 days from "today" (Mar 9, 2026)
const TODAY = new Date(2026, 2, 9); // March 9, 2026
const START_DATE = new Date(2025, 8, 1); // Sep 1, 2025

// ============================================================
// Employer assignment — weighted by company size
// ============================================================
function buildEmployerPool() {
  const pool = [];
  for (const emp of EMPLOYERS) {
    for (let i = 0; i < emp.members; i++) {
      pool.push(emp.name);
    }
  }
  return pool;
}

// ============================================================
// Biomarker generation
// ============================================================
function generateBiomarkerProfile(targetProfilesOff) {
  // Two-pass approach: targetProfilesOff determines which profiles should be "off",
  // then we generate realistic sub-test values to match.
  // This gives us explicit pyramid control while producing realistic data.
  const profileOrder = ['hba1c', 'lipidProfile', 'bloodGlucose', 'kidneyProfile', 'liverFunction'];

  // Randomly select which profiles are off
  const shuffled = [...profileOrder].sort(() => seededRandom() - 0.5);
  const offProfiles = new Set(shuffled.slice(0, targetProfilesOff));

  // Generate values with risk factor tuned to match desired off/on state
  const generateProfileValue = (profileKey) => {
    const shouldBeOff = offProfiles.has(profileKey);
    // rf controls how abnormal the values are: off profiles get high rf, normal get low
    return shouldBeOff ? 0.6 + seededRandom() * 0.4 : seededRandom() * 0.35;
  };

  // HbA1c
  const hba1cRf = generateProfileValue('hba1c');
  const hba1cValue = BIOMARKER_PROFILES.hba1c.generate(hba1cRf);
  const hba1cOff = BIOMARKER_PROFILES.hba1c.isOff(hba1cValue);

  // Lipid Profile — generate all 8 sub-tests
  const lipidRf = generateProfileValue('lipidProfile');
  const lipidTests = BIOMARKER_PROFILES.lipidProfile.subTests.map(st => {
    const value = st.generate(lipidRf + (seededRandom() - 0.5) * 0.15);
    let off = false;
    if (st.normalMax !== undefined && value > st.normalMax) off = true;
    if (st.normalMin !== undefined && value < st.normalMin) off = true;
    if (st.normalMin !== undefined && st.normalMax !== undefined && (value < st.normalMin || value > st.normalMax)) off = true;
    return { name: st.name, value, unit: st.unit, off };
  });
  const lipidOffCount = lipidTests.filter(t => t.off).length;
  const lipidOff = lipidOffCount >= BIOMARKER_PROFILES.lipidProfile.offThreshold;

  // Blood Glucose
  const glucoseRf = generateProfileValue('bloodGlucose');
  const glucoseValue = BIOMARKER_PROFILES.bloodGlucose.generate(glucoseRf);
  const glucoseOff = BIOMARKER_PROFILES.bloodGlucose.isOff(glucoseValue);

  // Kidney Profile — 9 sub-tests
  const kidneyRf = generateProfileValue('kidneyProfile');
  const kidneyTests = BIOMARKER_PROFILES.kidneyProfile.subTests.map(st => {
    const value = st.generate(kidneyRf + (seededRandom() - 0.5) * 0.15);
    let off = false;
    if (st.normalMax !== undefined && value > st.normalMax) off = true;
    if (st.normalMin !== undefined && value < st.normalMin) off = true;
    return { name: st.name, value, unit: st.unit, off };
  });
  const kidneyOffCount = kidneyTests.filter(t => t.off).length;
  const kidneyOff = kidneyOffCount >= BIOMARKER_PROFILES.kidneyProfile.offThreshold;

  // Liver Function — 11 sub-tests
  const liverRf = generateProfileValue('liverFunction');
  const liverTests = BIOMARKER_PROFILES.liverFunction.subTests.map(st => {
    const value = st.generate(liverRf + (seededRandom() - 0.5) * 0.15);
    let off = false;
    if (st.normalMax !== undefined && value > st.normalMax) off = true;
    if (st.normalMin !== undefined && value < st.normalMin) off = true;
    return { name: st.name, value, unit: st.unit, off };
  });
  const liverOffCount = liverTests.filter(t => t.off).length;
  const liverOff = liverOffCount >= BIOMARKER_PROFILES.liverFunction.offThreshold;

  const profilesOff = [hba1cOff, lipidOff, glucoseOff, kidneyOff, liverOff].filter(Boolean).length;

  return {
    hba1c: { value: hba1cValue, off: hba1cOff, status: hba1cOff ? 'abnormal' : BIOMARKER_PROFILES.hba1c.isBorderline(hba1cValue) ? 'borderline' : 'normal' },
    lipidProfile: { subTests: lipidTests, offCount: lipidOffCount, off: lipidOff, status: lipidOff ? 'abnormal' : lipidOffCount > 0 ? 'borderline' : 'normal' },
    bloodGlucose: { value: glucoseValue, off: glucoseOff, status: glucoseOff ? 'abnormal' : BIOMARKER_PROFILES.bloodGlucose.isBorderline(glucoseValue) ? 'borderline' : 'normal' },
    kidneyProfile: { subTests: kidneyTests, offCount: kidneyOffCount, off: kidneyOff, status: kidneyOff ? 'abnormal' : kidneyOffCount > 0 ? 'borderline' : 'normal' },
    liverFunction: { subTests: liverTests, offCount: liverOffCount, off: liverOff, status: liverOff ? 'abnormal' : liverOffCount > 0 ? 'borderline' : 'normal' },
    profilesOff
  };
}

function getRiskCohort(profilesOff) {
  if (profilesOff === 0) return 'Extremely Low';
  if (profilesOff === 1) return 'Low';
  if (profilesOff === 2) return 'At Risk';
  if (profilesOff === 3) return 'High';
  return 'Extremely High';
}

// ============================================================
// Behavioral data generation (ALL patients, weekly time series)
// ============================================================
function generateBehavior(riskFactor, numWeeks) {
  // Lower risk patients have better habits
  const healthFactor = 1 - riskFactor; // 1 = very healthy, 0 = very unhealthy
  const weeks = Math.max(1, numWeeks);

  const exercisePerWeek = [];
  const mealsLoggedPerDay = [];
  const waterLitersPerDay = [];
  const sleepHoursPerNight = [];
  const stressLevel = [];

  for (let w = 0; w < weeks; w++) {
    // Small trend: slight improvement over time for engaged patients
    const timeFactor = healthFactor > 0.5 ? w * 0.005 : 0;

    exercisePerWeek.push(Math.max(0, Math.round(
      (healthFactor * 5 + timeFactor + (seededRandom() - 0.5) * 1.5) * 10) / 10
    ));
    mealsLoggedPerDay.push(Math.max(0, parseFloat(
      (healthFactor * 5 + 1 + timeFactor + (seededRandom() - 0.5) * 1.2).toFixed(1)
    )));
    waterLitersPerDay.push(Math.max(0.3, parseFloat(
      (healthFactor * 2.2 + 0.5 + (seededRandom() - 0.5) * 0.4).toFixed(1)
    )));
    sleepHoursPerNight.push(Math.max(3, Math.min(10, parseFloat(
      (healthFactor * 3 + 5 + (seededRandom() - 0.5) * 1.0).toFixed(1)
    ))));
    stressLevel.push(Math.max(1, Math.min(5, Math.round(
      (1 - healthFactor) * 4 + 1 + (seededRandom() - 0.5) * 1.0
    ))));
  }

  return { exercisePerWeek, mealsLoggedPerDay, waterLitersPerDay, sleepHoursPerNight, stressLevel };
}

// ============================================================
// Metabolic score generation (CDM patients only, raw 157-616)
// ============================================================
function generateMetabolicScore(riskFactor, isImprover) {
  // riskFactor 0-1. Lower risk = higher score.
  const healthFactor = 1 - riskFactor;

  // Section scores with realistic ranges
  const habitBase = 21 + healthFactor * 84; // 21-105
  const wellnessBase = 21 + healthFactor * 80; // 21-101
  const profileBase = 25 + healthFactor * 75; // 25-100
  const diagnosticBase = 90 + healthFactor * 220; // 90-310

  const habit = Math.round(Math.max(21, Math.min(105, habitBase + (seededRandom() - 0.5) * 20)));
  const wellness = Math.round(Math.max(21, Math.min(101, wellnessBase + (seededRandom() - 0.5) * 18)));
  const profile = Math.round(Math.max(25, Math.min(100, profileBase + (seededRandom() - 0.5) * 15)));
  const diagnostic = Math.round(Math.max(90, Math.min(310, diagnosticBase + (seededRandom() - 0.5) * 40)));

  const current = habit + wellness + profile + diagnostic;

  // Initial score was worse (or same for non-improvers)
  const delta = isImprover
    ? randInt(15, 60) // improved by 15-60 points
    : randInt(-20, 5); // stayed same or slightly declined
  const initial = Math.max(157, Math.min(616, current - delta));

  const trend = current > initial + 10 ? '↑' : current < initial - 10 ? '↓' : '→';

  // Label based on current score
  let label = 'Critical';
  if (current > 525) label = 'Excellent';
  else if (current >= 430) label = 'Good';
  else if (current >= 310) label = 'Moderate';
  else if (current >= 215) label = 'Poor';

  return {
    current,
    initial,
    label,
    trend,
    sections: { habit, wellness, profile, diagnostic }
  };
}

// ============================================================
// MetScore trend generation (every 10 days for CDM patients)
// ============================================================
function generateMetScoreTrend(enrollDate, metabolicScore, isImprover) {
  const { initial, current } = metabolicScore;
  const startDate = new Date(enrollDate);
  const trend = [];
  const totalDays = Math.max(10, Math.round((TODAY - startDate) / (24 * 60 * 60 * 1000)));
  const numPoints = Math.floor(totalDays / 10);

  for (let i = 0; i <= numPoints; i++) {
    const t = numPoints > 0 ? i / numPoints : 1; // 0..1 progress
    // Smooth interpolation with noise: logistic curve + jitter
    const logistic = 1 / (1 + Math.exp(-6 * (t - 0.4))); // S-curve centered at 40%
    const base = initial + (current - initial) * logistic;
    // Add realistic noise: ±8 points, more volatile early on
    const noise = (seededRandom() - 0.5) * 16 * (1 - t * 0.5);
    const score = Math.max(157, Math.min(616, Math.round(base + noise)));

    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 10);
    if (date > TODAY) break;

    trend.push({ date: formatDate(date), score });
  }

  // Ensure last point is exactly the current score
  if (trend.length > 0) {
    trend[trend.length - 1].score = current;
  }

  return trend;
}

// ============================================================
// Financial data generation
// ============================================================
function generateFinancials(riskCohort, isCDM) {
  // Premium: ₱35K-₱55K per year (realistic for Philippine HMO, targets ~80% MLR)
  const annualPremium = randInt(35000, 55000);

  // Claims scale exponentially with risk
  const riskMultipliers = {
    'Extremely Low': 0.4,
    'Low': 0.7,
    'At Risk': 1.2,
    'High': 2.0,
    'Extremely High': 3.5
  };
  const mult = riskMultipliers[riskCohort] || 1;
  const cdmDiscount = isCDM ? 0.8 : 1.0; // CDM patients cost 20% less

  const baseClaim = 50000;
  const consultation = Math.round(baseClaim * 0.19 * mult * cdmDiscount * (0.8 + seededRandom() * 0.4));
  const pharmacy = Math.round(baseClaim * 0.26 * mult * cdmDiscount * (0.8 + seededRandom() * 0.4));
  const diagnostics = Math.round(baseClaim * 0.175 * mult * cdmDiscount * (0.8 + seededRandom() * 0.4));

  // Hospitalization: only for high/ext-high risk, and much less likely for CDM
  let hospitalization = 0;
  if (riskCohort === 'High' || riskCohort === 'Extremely High') {
    const hospChance = isCDM ? 0.06 : 0.14;
    if (seededRandom() < hospChance) {
      hospitalization = randInt(80000, 350000);
    }
  }

  return {
    annualPremium,
    claims: { consultation, pharmacy, diagnostics, hospitalization },
    totalClaims: consultation + pharmacy + diagnostics + hospitalization
  };
}

// ============================================================
// Ecosystem / leakage generation
// ============================================================
function generateEcosystem(riskCohort, totalClaims) {
  // Higher risk patients have more external spend (less loyalty)
  const retentionRates = {
    'Extremely Low': 0.88,
    'Low': 0.82,
    'At Risk': 0.72,
    'High': 0.64,
    'Extremely High': 0.55
  };
  const baseRetention = retentionRates[riskCohort] || 0.7;
  const retention = Math.max(0.3, Math.min(0.98, baseRetention + (seededRandom() - 0.5) * 0.15));

  const ecosystemSpend = Math.round(totalClaims * retention);
  const externalSpend = totalClaims - ecosystemSpend;

  // External providers used
  const externalProviders = [];
  if (externalSpend > 0) {
    const numExternal = randInt(1, 3);
    const types = ['hospitals', 'pharmacies', 'diagnosticLabs'];
    for (let i = 0; i < numExternal; i++) {
      const type = pick(types);
      externalProviders.push({
        provider: pick(EXTERNAL_PROVIDERS[type]),
        type,
        spend: Math.round(externalSpend / numExternal)
      });
    }
  }

  return {
    ecosystemSpend,
    externalSpend,
    retentionRate: parseFloat(retention.toFixed(2)),
    externalProviders
  };
}

// ============================================================
// Main generation function
// ============================================================
export function generateAllData() {
  seed = 42; // Reset seed for reproducibility

  const patients = [];
  const consultations = [];
  const pharmacyOrders = [];
  const diagnosticOrders = [];
  const cdmRecords = [];
  const competitorPrescriptions = [];
  const externalVisits = [];
  const hospitalizationEvents = [];

  let consultIdx = 0;
  let pharmaIdx = 0;
  let diagIdx = 0;
  let cartIdx = 0;

  const employerPool = buildEmployerPool();

  // Generate 1000 patients
  for (let i = 0; i < 1000; i++) {
    const gender = seededRandom() > 0.48 ? 'Female' : 'Male';
    const firstName = gender === 'Male' ? pick(FIRST_NAMES_MALE) : pick(FIRST_NAMES_FEMALE);
    const surname = pick(SURNAMES);
    const fullName = `${firstName} ${surname}`;
    const age = randInt(25, 72);
    const phone = generatePhone();
    const email = generateEmail(firstName, surname);
    const center = pick(CENTERS);
    const specialisation = pick(SPECIALISATIONS);
    const doctor = pick(DOCTOR_NAMES);
    const employer = pick(employerPool);
    const enrollDate = generateDate(START_DATE, addDays(TODAY, -14));

    // Target risk distribution (pyramid shape):
    // Ext Low (~35%), Low (~25%), At Risk (~18%), High (~12%), Ext High (~10%)
    const riskRoll = seededRandom();
    let targetProfilesOff;
    if (riskRoll < 0.48) targetProfilesOff = 0;       // Extremely Low ~48%
    else if (riskRoll < 0.68) targetProfilesOff = 1;   // Low ~20%
    else if (riskRoll < 0.82) targetProfilesOff = 2;   // At Risk ~14%
    else if (riskRoll < 0.92) targetProfilesOff = 3;   // High ~10%
    else targetProfilesOff = randInt(4, 5);             // Extremely High ~8%

    // Underlying health risk factor derived from profiles-off (used for behavior, financials)
    const baseRiskFactor = Math.max(0, Math.min(1, targetProfilesOff / 5 + (seededRandom() - 0.5) * 0.1));

    // Determine CDM enrollment and improver status BEFORE biomarker generation
    // so biomarker trends can correlate with CDM outcomes
    const cdmChance = baseRiskFactor > 0.5 ? 0.72 : baseRiskFactor > 0.3 ? 0.60 : 0.48;
    const isCDM = seededRandom() < cdmChance;
    const isImprover = isCDM ? seededRandom() < 0.865 : false;

    // Generate Q1 and Q2 biomarker profiles with trend tied to CDM status
    // CDM improvers: Q1 worse than Q2 (guaranteed improvement)
    // CDM decliners: Q1 same or better than Q2 (worsening)
    // Non-CDM: random slight shift
    let q1TargetOff, q2TargetOff;
    if (isCDM && isImprover) {
      // Improver: Q1 has more profiles off, Q2 is better
      const improvement = Math.max(1, Math.min(3, Math.round(1 + seededRandom() * 1.5)));
      q1TargetOff = Math.min(5, targetProfilesOff + improvement);
      q2TargetOff = targetProfilesOff;
    } else if (isCDM && !isImprover) {
      // Decliner: Q1 was better or same, Q2 is worse
      const decline = seededRandom() > 0.4 ? 1 : 0;
      q1TargetOff = Math.max(0, targetProfilesOff - decline);
      q2TargetOff = targetProfilesOff;
    } else {
      // Non-CDM: random slight shift (Q1 might be slightly worse)
      const shift = seededRandom() > 0.5 ? 1 : 0;
      q1TargetOff = Math.min(5, targetProfilesOff + shift);
      q2TargetOff = targetProfilesOff;
    }

    const bioQ1 = generateBiomarkerProfile(q1TargetOff);
    const bioQ2 = generateBiomarkerProfile(q2TargetOff);

    const riskCohort = getRiskCohort(bioQ2.profilesOff);

    // Behavioral data (ALL patients, ~26 weeks)
    const behavior = generateBehavior(baseRiskFactor, 26);

    // Financial data
    const financials = generateFinancials(riskCohort, isCDM);

    // Medication adherence: correlated with risk (healthier patients more adherent)
    const medicationAdherence = Math.max(10, Math.min(100, Math.round(
      (1 - baseRiskFactor) * 65 + 30 + (seededRandom() - 0.5) * 20
    )));

    // Ecosystem data
    const ecosystem = generateEcosystem(riskCohort, financials.totalClaims);

    // Location (for geographic analysis)
    const location = pick(LOCATIONS);

    const patient = {
      id: `PAT-${String(i + 1).padStart(4, '0')}`,
      name: fullName,
      gender,
      age,
      phone,
      email,
      center,
      specialisation,
      doctor,
      employer,
      location,
      enrollDate: formatDate(enrollDate),
      // Biomarkers
      biomarkers: { q1: bioQ1, q2: bioQ2 },
      profilesOff: { q1: bioQ1.profilesOff, q2: bioQ2.profilesOff },
      riskCohort,
      // Behavior
      behavior,
      // Financial
      annualPremium: financials.annualPremium,
      claims: financials.claims,
      totalClaims: financials.totalClaims,
      // Ecosystem
      ecosystemSpend: ecosystem.ecosystemSpend,
      externalSpend: ecosystem.externalSpend,
      retentionRate: ecosystem.retentionRate,
      externalProviders: ecosystem.externalProviders,
      // Adherence
      medicationAdherence,
      // CDM status
      isCDM,
    };
    patients.push(patient);

    // --- CONSULTATIONS ---
    const numConsultations = randInt(1, 4);
    let lastConsultDate = new Date(enrollDate);

    for (let c = 0; c < numConsultations; c++) {
      const requestDate = c === 0 ? new Date(enrollDate) : addDays(lastConsultDate, randInt(14, 45));
      if (requestDate > TODAY) break;

      const isConfirmed = seededRandom() > 0.12;
      const status = isConfirmed ? 'Confirmed' : 'Cancelled';
      const callType = pick(CALL_TYPES);

      const confirmedOn = isConfirmed ? addDays(requestDate, randInt(0, 2)) : null;
      const bookedOn = isConfirmed ? addDays(confirmedOn, randInt(0, 1)) : null;
      const appointmentDate = isConfirmed ? addDays(bookedOn, randInt(1, 7)) : null;
      const hasPrescription = isConfirmed && seededRandom() > 0.15;

      const consultation = {
        consultationId: generateConsultationId(consultIdx++),
        patientId: patient.id,
        patientName: fullName,
        gender,
        phone,
        email,
        doctorName: doctor,
        centerName: center,
        callType,
        specialisation,
        requestStatus: status,
        requestDate: formatDate(requestDate),
        confirmedOn: confirmedOn ? formatDate(confirmedOn) : null,
        bookedOn: bookedOn ? formatDate(bookedOn) : null,
        appointmentDate: appointmentDate ? formatDate(appointmentDate) : null,
        prescriptionUrl: hasPrescription ? `https://visit.ph/rx/${generateConsultationId(consultIdx - 1)}` : null
      };
      consultations.push(consultation);

      lastConsultDate = requestDate;

      // --- PHARMACY ORDERS (from consultation) ---
      if (hasPrescription && seededRandom() > 0.2) {
        const relation = seededRandom() > 0.75 ? pick(['Spouse', 'Child', 'Parent']) : 'Self';
        const pharmaPatientName = relation === 'Self' ? fullName : `${pick(gender === 'Male' ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE)} ${surname}`;
        const pharmaGender = relation === 'Self' ? gender : (gender === 'Male' ? 'Female' : 'Male');

        const medCategory = specialisation === 'Endo' ? 'diabetes' :
                            specialisation === 'Nephro' ? 'kidney' : 'hypertension';
        const meds = pickN([...MEDICINES[medCategory], ...MEDICINES.general], randInt(1, 3));

        for (const med of meds) {
          const cartId = generateCartId(cartIdx++);
          const isCovered = seededRandom() > 0.35;
          const rxApproval = isCovered ? 'Approved' : (seededRandom() > 0.3 ? 'Approved' : 'Rejected');
          const medStatus = isCovered ? 'Covered' : 'Not Covered';

          const baseAmount = randFloat(150, 3500, 2);
          const walletDeduction = isCovered ? baseAmount : 0;
          const coPay = isCovered ? 0 : baseAmount;

          const cartCreatedOn = addDays(appointmentDate, randInt(0, 2));
          const cartStatus = rxApproval === 'Rejected' ? 'Cancelled' : pick(['Pending', 'Processing', 'Delivered', 'Delivered', 'Delivered']);
          const orderStatus = cartStatus === 'Delivered' ? 'Delivered' :
                              cartStatus === 'Cancelled' ? 'Cancelled' :
                              pick(['Pending', 'Processing', 'Shipped']);

          const address = pick(ADDRESSES[center]);

          pharmacyOrders.push({
            orderId: generateOrderId('PHR', pharmaIdx++),
            partnerOrderId: `UNI-${randInt(100000, 999999)}`,
            cartId,
            patientId: patient.id,
            patientName: pharmaPatientName,
            gender: pharmaGender,
            relation,
            medicine: med,
            amountDeduction: walletDeduction,
            rxApprovalStatus: rxApproval,
            medicineStatus: medStatus,
            cartStatus,
            orderStatus,
            deliveryAddress: address,
            partnerBookingId: `PB-${randInt(10000, 99999)}`,
            prescriptionUrl: consultation.prescriptionUrl,
            amount: baseAmount,
            cartCreatedOn: formatDate(cartCreatedOn),
            walletDeduction,
            coPay,
            consultationId: consultation.consultationId,
            centerName: center,
            specialisation
          });
        }
      }

      // --- DIAGNOSTIC ORDERS (from consultation) ---
      if (isConfirmed && seededRandom() > 0.35) {
        const diagType = pick(DIAG_TYPES);
        const tests = pickN(DIAGNOSTIC_TESTS[diagType], randInt(1, 3));

        for (const test of tests) {
          const diagCartId = generateCartId(cartIdx++);
          const cartCreatedOn = addDays(appointmentDate, randInt(0, 3));
          const isCompleted = seededRandom() > 0.2;
          const isCancelled = !isCompleted && seededRandom() > 0.5;

          const cartStatus = isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : pick(['Pending', 'Processing']);
          const detailedStatus = isCancelled ? 'Cancelled' :
                                 isCompleted ? pick(['Report Ready', 'Delivered']) :
                                 pick(['Sample Pending', 'Sample Collected', 'Processing']);

          const orderOn = addDays(cartCreatedOn, randInt(0, 1));
          const collectionDate = !isCancelled ? addDays(orderOn, randInt(0, 3)) : null;
          const deliveredDate = isCompleted ? addDays(collectionDate, randInt(1, 5)) : null;

          const address = pick(ADDRESSES[center]);

          diagnosticOrders.push({
            orderId: generateOrderId('DGN', diagIdx++),
            cartId: diagCartId,
            patientId: patient.id,
            patientName: fullName,
            age,
            cartStatus,
            detailedStatus,
            test,
            type: diagType,
            address,
            cartCreatedOn: formatDate(cartCreatedOn),
            deliveredDate: deliveredDate ? formatDate(deliveredDate) : null,
            orderOn: formatDate(orderOn),
            collectionDate: collectionDate ? formatDate(collectionDate) : null,
            consultationId: consultation.consultationId,
            centerName: center,
            specialisation
          });
        }
      }
    }

    // --- CDM RECORDS (GoodFlip) ---
    if (isCDM) {
      const dietPlanDate = addDays(new Date(enrollDate), randInt(3, 21));
      const physioPlanDate = addDays(dietPlanDate, randInt(0, 14));

      // isImprover already determined above (before biomarker generation)
      const metabolicScore = generateMetabolicScore(baseRiskFactor, isImprover);

      // --- Engagement (strongly correlated with improvement) ---
      const coachingSessions = isImprover ? randInt(14, 24) : randInt(2, 8);
      const dietConsultationsBooked = isImprover ? randInt(6, 12) : randInt(0, 4);
      const physioConsultationsBooked = isImprover ? randInt(4, 8) : randInt(0, 3);

      // --- Diet plan adherence ---
      const dietPlanAdherence = isImprover
        ? Math.round(70 + seededRandom() * 25)    // 70-95%
        : Math.round(15 + seededRandom() * 30);   // 15-45%
      const avgCaloriesTarget = Math.round(1600 + (1 - baseRiskFactor) * 400 + (seededRandom() - 0.5) * 200);
      const calorieDeviation = isImprover
        ? 1 + (seededRandom() - 0.5) * 0.08       // ±4% of target
        : 1.15 + seededRandom() * 0.25;           // 15-40% over target
      const avgCaloriesActual = Math.round(avgCaloriesTarget * calorieDeviation);
      const mealLoggingRate = isImprover
        ? Math.round(80 + seededRandom() * 18)    // 80-98%
        : Math.round(20 + seededRandom() * 30);   // 20-50%

      // --- Exercise plan adherence ---
      const avgWorkoutDurationTarget = Math.round(30 + seededRandom() * 30); // 30-60 min
      const exercisePlanAdherence = isImprover
        ? Math.round(65 + seededRandom() * 25)    // 65-90%
        : Math.round(10 + seededRandom() * 30);   // 10-40%
      const avgWorkoutDurationActual = Math.round(avgWorkoutDurationTarget * (exercisePlanAdherence / 100));
      const exerciseLoggingRate = isImprover
        ? Math.round(75 + seededRandom() * 20)    // 75-95%
        : Math.round(15 + seededRandom() * 30);   // 15-45%
      const avgDailySteps = isImprover
        ? Math.round(8000 + seededRandom() * 6000)   // 8000-14000
        : Math.round(3000 + seededRandom() * 3000);  // 3000-6000
      const neatImprovement = isImprover
        ? Math.round(15 + seededRandom() * 30)    // 15-45%
        : Math.round(-5 + seededRandom() * 15);   // -5 to 10%

      // --- BCA readings with weight/BMI/dates ---
      const patientHeight = parseFloat((gender === 'Male'
        ? 1.62 + seededRandom() * 0.18   // 162-180cm
        : 1.52 + seededRandom() * 0.16   // 152-168cm
      ).toFixed(2));
      const baseWeight = parseFloat((gender === 'Male'
        ? 62 + baseRiskFactor * 28 + (seededRandom() - 0.5) * 10
        : 50 + baseRiskFactor * 22 + (seededRandom() - 0.5) * 8
      ).toFixed(1));
      const numBCA = randInt(2, 4);
      const bcaReadings = [];
      const enrollmentDays = Math.max(30, Math.round((TODAY - new Date(enrollDate)) / (1000 * 60 * 60 * 24)));
      const bcaInterval = Math.round(enrollmentDays / numBCA);
      for (let b = 0; b < numBCA; b++) {
        const bcaDate = addDays(new Date(enrollDate), Math.round(bcaInterval * (b + 0.5)));
        if (bcaDate > TODAY) break;
        const weightDelta = isImprover ? -b * (0.8 + seededRandom() * 0.8) : b * (seededRandom() * 0.3);
        const weight = parseFloat((baseWeight + weightDelta).toFixed(1));
        const bmi = parseFloat((weight / (patientHeight * patientHeight)).toFixed(1));
        const bodyFat = parseFloat((15 + baseRiskFactor * 25 + (seededRandom() - 0.5) * 5 - (isImprover ? b * 1.2 : 0)).toFixed(1));
        const muscleMass = parseFloat((25 + (1 - baseRiskFactor) * 15 + (seededRandom() - 0.5) * 3 + (isImprover ? b * 0.5 : 0)).toFixed(1));
        const visceralFat = Math.max(1, Math.round(5 + baseRiskFactor * 15 + (seededRandom() - 0.5) * 3 - (isImprover ? b * 0.8 : 0)));
        bcaReadings.push({ date: formatDate(bcaDate), weight, bmi, bodyFat, muscleMass, visceralFat });
      }

      // Generate MetScore trend (every 10 days)
      const metScoreTrend = generateMetScoreTrend(enrollDate, metabolicScore, isImprover);

      // Generate Q0 biomarker baseline (at enrollment, before Q1)
      // For improvers: Q0 should be worst (Q0 > Q1 > Q2 profiles off)
      // For decliners: Q0 should be better or same as Q1
      const q0TargetOff = isImprover
        ? Math.min(5, q1TargetOff + Math.max(1, Math.round(seededRandom() * 1.5)))
        : Math.max(0, q1TargetOff - (seededRandom() > 0.6 ? 1 : 0));
      const bioQ0 = generateBiomarkerProfile(q0TargetOff);

      cdmRecords.push({
        patientId: patient.id,
        patientName: fullName,
        age,
        centerName: center,
        specialisation,
        dietPlanAssignedDate: formatDate(dietPlanDate),
        physioPlanAssignedDate: formatDate(physioPlanDate),
        // Engagement
        coachingSessions,
        dietConsultationsBooked,
        physioConsultationsBooked,
        // Diet plan adherence
        dietPlanAdherence,
        avgCaloriesTarget,
        avgCaloriesActual,
        mealLoggingRate,
        // Exercise plan adherence
        exercisePlanAdherence,
        avgWorkoutDurationTarget,
        avgWorkoutDurationActual,
        exerciseLoggingRate,
        avgDailySteps,
        neatImprovement,
        // BCA & body composition
        patientHeight,
        bcaReadings,
        // Metabolic score & trends
        metabolicScore,
        metScoreTrend,
        isImprover,
        biomarkerTrend: {
          q0: bioQ0,
          q1: bioQ1,
          q2: bioQ2,
        },
      });
    }

    // --- COMPETITOR PRESCRIPTIONS ---
    // Some patients get competitor brands externally
    if (ecosystem.externalSpend > 5000 && seededRandom() < 0.3) {
      const mol = pick(COMPETITOR_MOLECULES);
      competitorPrescriptions.push({
        patientId: patient.id,
        molecule: mol.molecule,
        unilabBrand: mol.unilabBrand,
        competitorBrand: mol.competitorBrand,
        category: mol.category,
        prescribingDoctor: pick(DOCTOR_NAMES),
        volume: randInt(1, 12), // units per period
        revenueLost: randInt(2000, 15000),
      });
    }

    // --- EXTERNAL VISITS ---
    if (ecosystem.externalProviders.length > 0) {
      for (const ext of ecosystem.externalProviders) {
        externalVisits.push({
          patientId: patient.id,
          provider: ext.provider,
          type: ext.type,
          spend: ext.spend,
          location: patient.location,
          date: formatDate(generateDate(START_DATE, TODAY)),
        });
      }
    }

    // --- HOSPITALIZATION EVENTS ---
    if (financials.claims.hospitalization > 0) {
      hospitalizationEvents.push({
        patientId: patient.id,
        patientName: fullName,
        reason: pick(HOSPITALIZATION_REASONS),
        cost: financials.claims.hospitalization,
        admissionDate: formatDate(generateDate(START_DATE, TODAY)),
        durationDays: randInt(2, 14),
        center: pick(EXTERNAL_PROVIDERS.hospitals),
        riskCohort,
      });
    }
  }

  return {
    patients,
    consultations,
    pharmacyOrders,
    diagnosticOrders,
    cdmRecords,
    competitorPrescriptions,
    externalVisits,
    hospitalizationEvents,
  };
}
