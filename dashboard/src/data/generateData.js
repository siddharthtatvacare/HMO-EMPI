import {
  FIRST_NAMES_MALE, FIRST_NAMES_FEMALE, SURNAMES, CENTERS, CALL_TYPES,
  SPECIALISATIONS, REQUEST_STATUSES, RX_APPROVAL_STATUSES, MEDICINE_STATUSES,
  CART_STATUSES, ORDER_STATUSES, DIAG_CART_STATUSES, DIAG_DETAILED_STATUSES,
  DIAG_TYPES, RELATIONS, MEDICINES, DIAGNOSTIC_TESTS, DOCTOR_NAMES, ADDRESSES
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

export function generateAllData() {
  const patients = [];
  const consultations = [];
  const pharmacyOrders = [];
  const diagnosticOrders = [];
  const cdmRecords = [];

  let consultIdx = 0;
  let pharmaIdx = 0;
  let diagIdx = 0;
  let cartIdx = 0;

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

    // Each patient gets a primary doctor (weighted by specialisation)
    const doctor = pick(DOCTOR_NAMES);

    // Patient enrollment date (spread across the 190 days)
    const enrollDate = generateDate(START_DATE, addDays(TODAY, -14));

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
      enrollDate: formatDate(enrollDate)
    };
    patients.push(patient);

    // --- CONSULTATIONS ---
    // Each patient has 1-4 consultations
    const numConsultations = randInt(1, 4);
    let lastConsultDate = new Date(enrollDate);

    for (let c = 0; c < numConsultations; c++) {
      const requestDate = c === 0 ? new Date(enrollDate) : addDays(lastConsultDate, randInt(14, 45));
      if (requestDate > TODAY) break;

      const isConfirmed = seededRandom() > 0.12; // 88% confirmed
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

        // Pick 1-3 medicines
        const medCategory = specialisation === 'Endo' ? 'diabetes' :
                            specialisation === 'Nephro' ? 'kidney' : 'hypertension';
        const meds = pickN([...MEDICINES[medCategory], ...MEDICINES.general], randInt(1, 3));

        for (const med of meds) {
          const cartId = generateCartId(cartIdx++);
          const isCovered = seededRandom() > 0.35; // 65% covered by Unilabs
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
    // ~60% of patients are enrolled in CDM
    if (seededRandom() > 0.4) {
      const dietPlanDate = addDays(new Date(enrollDate), randInt(3, 21));
      const physioPlanDate = addDays(dietPlanDate, randInt(0, 14));
      const weeksEnrolled = Math.floor((TODAY - dietPlanDate) / (7 * 24 * 60 * 60 * 1000));
      const validWeeks = Math.max(1, Math.min(weeksEnrolled, 26));

      // Metabolic score starts 40-75, changes weekly
      let baseScore = randInt(40, 75);
      const weeklyChanges = [];
      for (let w = 0; w < validWeeks; w++) {
        const change = randFloat(-3, 5, 1);
        weeklyChanges.push(change);
        baseScore = Math.max(10, Math.min(100, baseScore + change));
      }

      cdmRecords.push({
        patientId: patient.id,
        patientName: fullName,
        age,
        metabolicScore: Math.round(baseScore),
        initialScore: randInt(40, 75),
        dietPlanAssignedDate: formatDate(dietPlanDate),
        physioPlanAssignedDate: formatDate(physioPlanDate),
        dietConsultationsBooked: randInt(0, 12),
        physioConsultationsBooked: randInt(0, 8),
        weeklyScoreChanges: weeklyChanges,
        mealLoggingCount: randInt(5, 180),
        exerciseLoggingCount: randInt(2, 150),
        centerName: center,
        specialisation
      });
    }
  }

  return { patients, consultations, pharmacyOrders, diagnosticOrders, cdmRecords };
}
