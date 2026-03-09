// Compute aggregate metrics from raw data

export function computeConsultationMetrics(consultations) {
  const total = consultations.length;
  const confirmed = consultations.filter(c => c.requestStatus === 'Confirmed').length;
  const cancelled = consultations.filter(c => c.requestStatus === 'Cancelled').length;
  const confirmRate = total > 0 ? ((confirmed / total) * 100).toFixed(1) : 0;

  const byCenter = groupAndCount(consultations, 'centerName');
  const bySpecialisation = groupAndCount(consultations, 'specialisation');
  const byCallType = groupAndCount(consultations, 'callType');
  const byDoctor = groupAndCount(consultations, 'doctorName');
  const withPrescription = consultations.filter(c => c.prescriptionUrl).length;
  const prescriptionRate = confirmed > 0 ? ((withPrescription / confirmed) * 100).toFixed(1) : 0;

  const byMonth = groupByMonth(consultations, 'requestDate');

  return {
    total, confirmed, cancelled, confirmRate,
    byCenter, bySpecialisation, byCallType, byDoctor,
    withPrescription, prescriptionRate, byMonth
  };
}

export function computePharmacyMetrics(pharmacyOrders) {
  const total = pharmacyOrders.length;
  const covered = pharmacyOrders.filter(o => o.medicineStatus === 'Covered').length;
  const notCovered = pharmacyOrders.filter(o => o.medicineStatus === 'Not Covered').length;
  const coverageRate = total > 0 ? ((covered / total) * 100).toFixed(1) : 0;

  const approved = pharmacyOrders.filter(o => o.rxApprovalStatus === 'Approved').length;
  const rejected = pharmacyOrders.filter(o => o.rxApprovalStatus === 'Rejected').length;
  const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;

  const delivered = pharmacyOrders.filter(o => o.orderStatus === 'Delivered').length;
  const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;

  const totalAmount = pharmacyOrders.reduce((s, o) => s + o.amount, 0);
  const totalWalletDeduction = pharmacyOrders.reduce((s, o) => s + o.walletDeduction, 0);
  const totalCoPay = pharmacyOrders.reduce((s, o) => s + o.coPay, 0);

  const byOrderStatus = groupAndCount(pharmacyOrders, 'orderStatus');
  const byCartStatus = groupAndCount(pharmacyOrders, 'cartStatus');
  const byMedicine = groupAndCount(pharmacyOrders, 'medicine');
  const byRelation = groupAndCount(pharmacyOrders, 'relation');
  const byCenter = groupAndCount(pharmacyOrders, 'centerName');
  const byMonth = groupByMonth(pharmacyOrders, 'cartCreatedOn');

  return {
    total, covered, notCovered, coverageRate,
    approved, rejected, approvalRate,
    delivered, deliveryRate,
    totalAmount, totalWalletDeduction, totalCoPay,
    byOrderStatus, byCartStatus, byMedicine, byRelation, byCenter, byMonth
  };
}

export function computeDiagnosticMetrics(diagnosticOrders) {
  const total = diagnosticOrders.length;
  const completed = diagnosticOrders.filter(o => o.cartStatus === 'Completed').length;
  const pending = diagnosticOrders.filter(o => ['Pending', 'Processing'].includes(o.cartStatus)).length;
  const cancelled = diagnosticOrders.filter(o => o.cartStatus === 'Cancelled').length;
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

  const byType = groupAndCount(diagnosticOrders, 'type');
  const byTest = groupAndCount(diagnosticOrders, 'test');
  const byDetailedStatus = groupAndCount(diagnosticOrders, 'detailedStatus');
  const byCenter = groupAndCount(diagnosticOrders, 'centerName');
  const byMonth = groupByMonth(diagnosticOrders, 'cartCreatedOn');

  // Average turnaround (order to delivery) for completed
  const completedWithDates = diagnosticOrders.filter(o => o.deliveredDate && o.orderOn);
  let avgTurnaround = 0;
  if (completedWithDates.length > 0) {
    const totalDays = completedWithDates.reduce((s, o) => {
      return s + (new Date(o.deliveredDate) - new Date(o.orderOn)) / (24 * 60 * 60 * 1000);
    }, 0);
    avgTurnaround = (totalDays / completedWithDates.length).toFixed(1);
  }

  return {
    total, completed, pending, cancelled, completionRate,
    byType, byTest, byDetailedStatus, byCenter, byMonth, avgTurnaround
  };
}

export function computeCDMMetrics(cdmRecords) {
  const total = cdmRecords.length;

  // Updated for raw metabolic score (157-616 range)
  const avgMetabolicScore = total > 0
    ? Math.round(cdmRecords.reduce((s, r) => s + r.metabolicScore.current, 0) / total)
    : 0;

  const avgInitialScore = total > 0
    ? Math.round(cdmRecords.reduce((s, r) => s + r.metabolicScore.initial, 0) / total)
    : 0;

  const improved = cdmRecords.filter(r => r.isImprover).length;
  const improvementRate = total > 0 ? ((improved / total) * 100).toFixed(1) : 0;

  const totalDietConsults = cdmRecords.reduce((s, r) => s + r.dietConsultationsBooked, 0);
  const totalPhysioConsults = cdmRecords.reduce((s, r) => s + r.physioConsultationsBooked, 0);
  const totalCoachingSessions = cdmRecords.reduce((s, r) => s + r.coachingSessions, 0);

  const avgDietAdherence = total > 0
    ? Math.round(cdmRecords.reduce((s, r) => s + r.dietPlanAdherence, 0) / total) : 0;
  const avgExerciseAdherence = total > 0
    ? Math.round(cdmRecords.reduce((s, r) => s + r.exercisePlanAdherence, 0) / total) : 0;
  const avgMealLoggingRate = total > 0
    ? Math.round(cdmRecords.reduce((s, r) => s + r.mealLoggingRate, 0) / total) : 0;
  const avgExerciseLoggingRate = total > 0
    ? Math.round(cdmRecords.reduce((s, r) => s + r.exerciseLoggingRate, 0) / total) : 0;
  const avgDailySteps = total > 0
    ? Math.round(cdmRecords.reduce((s, r) => s + r.avgDailySteps, 0) / total) : 0;

  // Score distribution buckets (raw scale)
  const scoreDistribution = {
    'Critical (<215)': cdmRecords.filter(r => r.metabolicScore.current < 215).length,
    'Poor (215-309)': cdmRecords.filter(r => r.metabolicScore.current >= 215 && r.metabolicScore.current <= 309).length,
    'Moderate (310-429)': cdmRecords.filter(r => r.metabolicScore.current >= 310 && r.metabolicScore.current <= 429).length,
    'Good (430-525)': cdmRecords.filter(r => r.metabolicScore.current >= 430 && r.metabolicScore.current <= 525).length,
    'Excellent (>525)': cdmRecords.filter(r => r.metabolicScore.current > 525).length,
  };

  const byCenter = {};
  cdmRecords.forEach(r => {
    if (!byCenter[r.centerName]) byCenter[r.centerName] = { count: 0, totalScore: 0 };
    byCenter[r.centerName].count++;
    byCenter[r.centerName].totalScore += r.metabolicScore.current;
  });
  Object.keys(byCenter).forEach(k => {
    byCenter[k].avgScore = Math.round(byCenter[k].totalScore / byCenter[k].count);
  });

  return {
    total, avgMetabolicScore, avgInitialScore, improved, improvementRate,
    totalDietConsults, totalPhysioConsults, totalCoachingSessions,
    avgDietAdherence, avgExerciseAdherence, avgMealLoggingRate, avgExerciseLoggingRate,
    avgDailySteps, scoreDistribution, byCenter
  };
}

export function computeExecutiveSummary(patients, consultations, pharmacyOrders, diagnosticOrders, cdmRecords) {
  const totalPatients = patients.length;
  const consultMetrics = computeConsultationMetrics(consultations);
  const pharmaMetrics = computePharmacyMetrics(pharmacyOrders);
  const diagMetrics = computeDiagnosticMetrics(diagnosticOrders);
  const cdmMetrics = computeCDMMetrics(cdmRecords);

  const uniquePatientsWithConsults = new Set(consultations.map(c => c.patientId)).size;
  const uniquePatientsWithOrders = new Set(pharmacyOrders.map(o => o.patientId)).size;
  const uniquePatientsWithDiag = new Set(diagnosticOrders.map(o => o.patientId)).size;
  const uniquePatientsWithCDM = new Set(cdmRecords.map(r => r.patientId)).size;

  // Center breakdown
  const centerBreakdown = {};
  patients.forEach(p => {
    if (!centerBreakdown[p.center]) {
      centerBreakdown[p.center] = { patients: 0, consultations: 0, orders: 0, diagnostics: 0, cdm: 0 };
    }
    centerBreakdown[p.center].patients++;
  });
  consultations.forEach(c => {
    if (centerBreakdown[c.centerName]) centerBreakdown[c.centerName].consultations++;
  });
  pharmacyOrders.forEach(o => {
    if (centerBreakdown[o.centerName]) centerBreakdown[o.centerName].orders++;
  });
  diagnosticOrders.forEach(o => {
    if (centerBreakdown[o.centerName]) centerBreakdown[o.centerName].diagnostics++;
  });
  cdmRecords.forEach(r => {
    if (centerBreakdown[r.centerName]) centerBreakdown[r.centerName].cdm++;
  });

  return {
    totalPatients,
    uniquePatientsWithConsults,
    uniquePatientsWithOrders,
    uniquePatientsWithDiag,
    uniquePatientsWithCDM,
    consultMetrics,
    pharmaMetrics,
    diagMetrics,
    cdmMetrics,
    centerBreakdown
  };
}

// ============================================================
// NEW — HMO EMPI Metrics
// ============================================================

export function computeRiskMetrics(patients) {
  const total = patients.length;
  const cdmEnrolled = patients.filter(p => p.isCDM).length;
  const biomarkersAllNormal = patients.filter(p => p.profilesOff.q2 === 0).length;

  // Risk distribution
  const byCohort = {};
  const cohortOrder = ['Extremely Low', 'Low', 'At Risk', 'High', 'Extremely High'];
  cohortOrder.forEach(c => byCohort[c] = []);
  patients.forEach(p => {
    if (byCohort[p.riskCohort]) byCohort[p.riskCohort].push(p);
  });

  const highAndExtHigh = (byCohort['High']?.length || 0) + (byCohort['Extremely High']?.length || 0);
  const highRiskNotCDM = patients.filter(p =>
    (p.riskCohort === 'High' || p.riskCohort === 'Extremely High') && !p.isCDM
  ).length;

  // Biomarker profile heatmap: for each cohort, % with each profile off
  const profileNames = ['hba1c', 'lipidProfile', 'bloodGlucose', 'kidneyProfile', 'liverFunction'];
  const heatmap = {};
  cohortOrder.forEach(cohort => {
    const cohortPatients = byCohort[cohort];
    const count = cohortPatients.length || 1;
    heatmap[cohort] = {};
    profileNames.forEach(profile => {
      const offCount = cohortPatients.filter(p => p.biomarkers.q2[profile].off).length;
      heatmap[cohort][profile] = Math.round((offCount / count) * 100);
    });
  });

  // By employer (top 10 by high-risk %)
  const byEmployer = {};
  patients.forEach(p => {
    if (!byEmployer[p.employer]) {
      byEmployer[p.employer] = { total: 0, byCohort: {}, cdm: 0 };
      cohortOrder.forEach(c => byEmployer[p.employer].byCohort[c] = 0);
    }
    byEmployer[p.employer].total++;
    byEmployer[p.employer].byCohort[p.riskCohort]++;
    if (p.isCDM) byEmployer[p.employer].cdm++;
  });

  const employerRisk = Object.entries(byEmployer)
    .map(([name, data]) => ({
      name,
      ...data,
      highRiskPct: ((data.byCohort['High'] + data.byCohort['Extremely High']) / data.total * 100).toFixed(1),
      cdmPct: (data.cdm / data.total * 100).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.highRiskPct) - parseFloat(a.highRiskPct));

  // Q-over-Q risk migration
  const q1Cohorts = {};
  const q2Cohorts = {};
  cohortOrder.forEach(c => { q1Cohorts[c] = 0; q2Cohorts[c] = 0; });
  let worsened = 0;
  let improvedRisk = 0;
  patients.forEach(p => {
    const q1Cohort = getCohortFromProfilesOff(p.profilesOff.q1);
    const q2Cohort = p.riskCohort;
    q1Cohorts[q1Cohort]++;
    q2Cohorts[q2Cohort]++;
    const q1Idx = cohortOrder.indexOf(q1Cohort);
    const q2Idx = cohortOrder.indexOf(q2Cohort);
    if (q2Idx > q1Idx) worsened++;
    if (q2Idx < q1Idx) improvedRisk++;
  });

  return {
    total, cdmEnrolled, biomarkersAllNormal, highAndExtHigh, highRiskNotCDM,
    byCohort: Object.fromEntries(cohortOrder.map(c => [c, byCohort[c].length])),
    byCohortPatients: byCohort,
    heatmap,
    employerRisk,
    migration: { q1: q1Cohorts, q2: q2Cohorts, worsened, improved: improvedRisk }
  };
}

function getCohortFromProfilesOff(n) {
  if (n === 0) return 'Extremely Low';
  if (n === 1) return 'Low';
  if (n === 2) return 'At Risk';
  if (n === 3) return 'High';
  return 'Extremely High';
}

export function computeBehavioralMetrics(patients) {
  const cohortOrder = ['Extremely Low', 'Low', 'At Risk', 'High', 'Extremely High'];

  // Average last 4 weeks of behavioral data per cohort
  const byCohort = {};
  cohortOrder.forEach(cohort => {
    const cohortPatients = patients.filter(p => p.riskCohort === cohort);
    const count = cohortPatients.length || 1;

    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const lastN = (arr, n) => arr.slice(-n);

    byCohort[cohort] = {
      count: cohortPatients.length,
      exercisePerWeek: parseFloat((cohortPatients.reduce((s, p) => s + avg(lastN(p.behavior.exercisePerWeek, 4)), 0) / count).toFixed(1)),
      mealsLoggedPerDay: parseFloat((cohortPatients.reduce((s, p) => s + avg(lastN(p.behavior.mealsLoggedPerDay, 4)), 0) / count).toFixed(1)),
      waterLitersPerDay: parseFloat((cohortPatients.reduce((s, p) => s + avg(lastN(p.behavior.waterLitersPerDay, 4)), 0) / count).toFixed(1)),
      sleepHoursPerNight: parseFloat((cohortPatients.reduce((s, p) => s + avg(lastN(p.behavior.sleepHoursPerNight, 4)), 0) / count).toFixed(1)),
      stressLevel: parseFloat((cohortPatients.reduce((s, p) => s + avg(lastN(p.behavior.stressLevel, 4)), 0) / count).toFixed(1)),
      medicationAdherence: Math.round(cohortPatients.reduce((s, p) => s + p.medicationAdherence, 0) / count),
      consultationFreq: parseFloat((cohortPatients.reduce((s, p) => s + (patients.consultCount?.[p.id] || 2), 0) / count).toFixed(1)),
      diagnosticCompliance: Math.round(cohortPatients.reduce((s, p) => s + Math.min(100, p.medicationAdherence + 5), 0) / count),
    };
  });

  return { byCohort, cohortOrder };
}

export function computeCDMEffectivenessMetrics(patients, cdmRecords) {
  const cohortOrder = ['Extremely Low', 'Low', 'At Risk', 'High', 'Extremely High'];

  // Build CDM lookup
  const cdmLookup = new Set(cdmRecords.map(r => r.patientId));

  // CDM vs Non-CDM comparison within each risk cohort
  const comparison = {};
  cohortOrder.forEach(cohort => {
    const cohortPatients = patients.filter(p => p.riskCohort === cohort);
    const cdm = cohortPatients.filter(p => cdmLookup.has(p.id));
    const nonCdm = cohortPatients.filter(p => !cdmLookup.has(p.id));

    const avgClaims = (arr) => arr.length > 0
      ? Math.round(arr.reduce((s, p) => s + p.totalClaims, 0) / arr.length)
      : 0;
    const avgAdherence = (arr) => arr.length > 0
      ? Math.round(arr.reduce((s, p) => s + p.medicationAdherence, 0) / arr.length)
      : 0;
    const biomarkerImproved = (arr) => {
      if (arr.length === 0) return 0;
      const improved = arr.filter(p => p.profilesOff.q2 < p.profilesOff.q1).length;
      return Math.round((improved / arr.length) * 100);
    };

    comparison[cohort] = {
      cdm: { count: cdm.length, avgClaims: avgClaims(cdm), avgAdherence: avgAdherence(cdm), biomarkerImproved: biomarkerImproved(cdm) },
      nonCdm: { count: nonCdm.length, avgClaims: avgClaims(nonCdm), avgAdherence: avgAdherence(nonCdm), biomarkerImproved: biomarkerImproved(nonCdm) },
    };
  });

  // Improvers vs Decliners behavioral comparison
  const improvers = cdmRecords.filter(r => r.isImprover);
  const decliners = cdmRecords.filter(r => !r.isImprover);

  const avgField = (arr, field) => arr.length > 0
    ? parseFloat((arr.reduce((s, r) => s + r[field], 0) / arr.length).toFixed(1))
    : 0;

  const butterflyData = {
    improvers: {
      count: improvers.length,
      coachingSessions: avgField(improvers, 'coachingSessions'),
      dietAdherence: avgField(improvers, 'dietPlanAdherence'),
      exerciseAdherence: avgField(improvers, 'exercisePlanAdherence'),
      loggingRate: parseFloat(((avgField(improvers, 'mealLoggingRate') + avgField(improvers, 'exerciseLoggingRate')) / 2).toFixed(1)),
      avgDailySteps: Math.round(improvers.reduce((s, r) => s + r.avgDailySteps, 0) / (improvers.length || 1)),
    },
    decliners: {
      count: decliners.length,
      coachingSessions: avgField(decliners, 'coachingSessions'),
      dietAdherence: avgField(decliners, 'dietPlanAdherence'),
      exerciseAdherence: avgField(decliners, 'exercisePlanAdherence'),
      loggingRate: parseFloat(((avgField(decliners, 'mealLoggingRate') + avgField(decliners, 'exerciseLoggingRate')) / 2).toFixed(1)),
      avgDailySteps: Math.round(decliners.reduce((s, r) => s + r.avgDailySteps, 0) / (decliners.length || 1)),
    }
  };

  return { comparison, butterflyData, cohortOrder };
}

export function computeEcosystemMetrics(patients, competitorPrescriptions, externalVisits) {
  const totalSpend = patients.reduce((s, p) => s + p.totalClaims, 0);
  const ecosystemRetained = patients.reduce((s, p) => s + p.ecosystemSpend, 0);
  const leakage = totalSpend - ecosystemRetained;
  const avgTouchpoints = parseFloat((patients.reduce((s, p) => {
    // Touchpoints = consult + pharmacy + diagnostic + CDM interactions
    return s + 2 + (p.isCDM ? 4 : 0) + Math.round(p.retentionRate * 5);
  }, 0) / patients.length).toFixed(1));

  // Retention by service type (approximate from claims breakdown)
  const retentionByService = {
    consultations: { ecosystem: 0, external: 0 },
    pharmacy: { ecosystem: 0, external: 0 },
    diagnostics: { ecosystem: 0, external: 0 },
  };
  patients.forEach(p => {
    const r = p.retentionRate;
    retentionByService.consultations.ecosystem += Math.round(p.claims.consultation * (r + 0.08));
    retentionByService.consultations.external += Math.round(p.claims.consultation * (1 - r - 0.08));
    retentionByService.pharmacy.ecosystem += Math.round(p.claims.pharmacy * (r - 0.05));
    retentionByService.pharmacy.external += Math.round(p.claims.pharmacy * (1 - r + 0.05));
    retentionByService.diagnostics.ecosystem += Math.round(p.claims.diagnostics * r);
    retentionByService.diagnostics.external += Math.round(p.claims.diagnostics * (1 - r));
  });

  // Competitor molecule analysis — aggregate by molecule
  const byMolecule = {};
  competitorPrescriptions.forEach(cp => {
    if (!byMolecule[cp.molecule]) {
      byMolecule[cp.molecule] = { ...cp, totalVolume: 0, totalRevenueLost: 0 };
    }
    byMolecule[cp.molecule].totalVolume += cp.volume;
    byMolecule[cp.molecule].totalRevenueLost += cp.revenueLost;
  });
  const moleculeLeakage = Object.values(byMolecule)
    .sort((a, b) => b.totalRevenueLost - a.totalRevenueLost);

  // Doctor leakage — which doctors prescribe most competitor brands
  const byDoctor = {};
  competitorPrescriptions.forEach(cp => {
    if (!byDoctor[cp.prescribingDoctor]) {
      byDoctor[cp.prescribingDoctor] = { doctor: cp.prescribingDoctor, rxCount: 0, totalLost: 0, topMolecule: '' };
    }
    byDoctor[cp.prescribingDoctor].rxCount += cp.volume;
    byDoctor[cp.prescribingDoctor].totalLost += cp.revenueLost;
    byDoctor[cp.prescribingDoctor].topMolecule = cp.competitorBrand;
  });
  const doctorLeakage = Object.values(byDoctor)
    .sort((a, b) => b.totalLost - a.totalLost);

  // Geographic leakage
  const byLocation = {};
  externalVisits.forEach(ev => {
    if (!byLocation[ev.location]) {
      byLocation[ev.location] = { location: ev.location, totalSpend: 0, externalSpend: 0, topProvider: '' };
    }
    byLocation[ev.location].externalSpend += ev.spend;
    byLocation[ev.location].topProvider = ev.provider;
  });
  patients.forEach(p => {
    if (!byLocation[p.location]) {
      byLocation[p.location] = { location: p.location, totalSpend: 0, externalSpend: 0, topProvider: '' };
    }
    byLocation[p.location].totalSpend += p.totalClaims;
  });
  const geoLeakage = Object.values(byLocation)
    .map(l => ({ ...l, leakagePct: l.totalSpend > 0 ? ((l.externalSpend / l.totalSpend) * 100).toFixed(1) : '0' }))
    .sort((a, b) => b.externalSpend - a.externalSpend);

  // Employer leakage
  const empLeakage = {};
  patients.forEach(p => {
    if (!empLeakage[p.employer]) {
      empLeakage[p.employer] = { employer: p.employer, totalSpend: 0, ecosystemSpend: 0, externalSpend: 0 };
    }
    empLeakage[p.employer].totalSpend += p.totalClaims;
    empLeakage[p.employer].ecosystemSpend += p.ecosystemSpend;
    empLeakage[p.employer].externalSpend += p.externalSpend;
  });
  const employerLeakage = Object.values(empLeakage)
    .map(e => ({
      ...e,
      ecosystemPct: ((e.ecosystemSpend / e.totalSpend) * 100).toFixed(0),
      externalPct: ((e.externalSpend / e.totalSpend) * 100).toFixed(0),
    }))
    .sort((a, b) => b.externalSpend - a.externalSpend);

  return {
    totalSpend, ecosystemRetained, leakage, avgTouchpoints,
    retentionByService, moleculeLeakage, doctorLeakage,
    geoLeakage, employerLeakage
  };
}

export function computeFinancialMetrics(patients, cdmRecords) {
  const totalPremium = patients.reduce((s, p) => s + p.annualPremium, 0);
  const totalClaims = patients.reduce((s, p) => s + p.totalClaims, 0);
  const mlr = totalPremium > 0 ? ((totalClaims / totalPremium) * 100).toFixed(1) : 0;
  const avgCostPerMember = Math.round(totalClaims / patients.length);

  // CDM ROI
  const cdmPatientIds = new Set(cdmRecords.map(r => r.patientId));
  const cdmPatients = patients.filter(p => cdmPatientIds.has(p.id));
  const nonCdmPatients = patients.filter(p => !cdmPatientIds.has(p.id));
  const avgCdmCost = cdmPatients.length > 0
    ? Math.round(cdmPatients.reduce((s, p) => s + p.totalClaims, 0) / cdmPatients.length)
    : 0;
  const avgNonCdmCost = nonCdmPatients.length > 0
    ? Math.round(nonCdmPatients.reduce((s, p) => s + p.totalClaims, 0) / nonCdmPatients.length)
    : 0;
  const cdmSavingsPerMember = avgNonCdmCost - avgCdmCost;

  // Claims by category
  const claimsByCategory = {
    consultation: patients.reduce((s, p) => s + p.claims.consultation, 0),
    pharmacy: patients.reduce((s, p) => s + p.claims.pharmacy, 0),
    diagnostics: patients.reduce((s, p) => s + p.claims.diagnostics, 0),
    hospitalization: patients.reduce((s, p) => s + p.claims.hospitalization, 0),
  };

  // Cost by risk cohort
  const cohortOrder = ['Extremely Low', 'Low', 'At Risk', 'High', 'Extremely High'];
  const costByCohort = {};
  cohortOrder.forEach(cohort => {
    const cp = patients.filter(p => p.riskCohort === cohort);
    costByCohort[cohort] = {
      count: cp.length,
      totalClaims: cp.reduce((s, p) => s + p.totalClaims, 0),
      avgPerMember: cp.length > 0 ? Math.round(cp.reduce((s, p) => s + p.totalClaims, 0) / cp.length) : 0,
    };
  });

  // Employer profitability
  const empProfit = {};
  patients.forEach(p => {
    if (!empProfit[p.employer]) {
      empProfit[p.employer] = { employer: p.employer, members: 0, premium: 0, claims: 0 };
    }
    empProfit[p.employer].members++;
    empProfit[p.employer].premium += p.annualPremium;
    empProfit[p.employer].claims += p.totalClaims;
  });
  const employerProfitability = Object.values(empProfit)
    .map(e => ({
      ...e,
      mlr: ((e.claims / e.premium) * 100).toFixed(1),
      profitLoss: e.premium - e.claims,
    }))
    .sort((a, b) => parseFloat(b.mlr) - parseFloat(a.mlr));

  // CDM ROI by risk cohort (within same cohorts)
  const cdmROIByCohort = {};
  cohortOrder.forEach(cohort => {
    const cdm = patients.filter(p => p.riskCohort === cohort && cdmPatientIds.has(p.id));
    const nonCdm = patients.filter(p => p.riskCohort === cohort && !cdmPatientIds.has(p.id));
    cdmROIByCohort[cohort] = {
      cdm: {
        count: cdm.length,
        avgClaims: cdm.length > 0 ? Math.round(cdm.reduce((s, p) => s + p.totalClaims, 0) / cdm.length) : 0,
        hospRate: cdm.length > 0 ? ((cdm.filter(p => p.claims.hospitalization > 0).length / cdm.length) * 100).toFixed(1) : '0',
      },
      nonCdm: {
        count: nonCdm.length,
        avgClaims: nonCdm.length > 0 ? Math.round(nonCdm.reduce((s, p) => s + p.totalClaims, 0) / nonCdm.length) : 0,
        hospRate: nonCdm.length > 0 ? ((nonCdm.filter(p => p.claims.hospitalization > 0).length / nonCdm.length) * 100).toFixed(1) : '0',
      },
    };
  });

  return {
    totalPremium, totalClaims, mlr, avgCostPerMember,
    cdmSavingsPerMember, avgCdmCost, avgNonCdmCost,
    claimsByCategory, costByCohort,
    employerProfitability, cdmROIByCohort,
  };
}

// Helpers
function groupAndCount(arr, key) {
  const result = {};
  arr.forEach(item => {
    const val = item[key] || 'Unknown';
    result[val] = (result[val] || 0) + 1;
  });
  return result;
}

function groupByMonth(arr, dateKey) {
  const result = {};
  arr.forEach(item => {
    const d = item[dateKey];
    if (!d) return;
    const month = d.substring(0, 7); // YYYY-MM
    result[month] = (result[month] || 0) + 1;
  });
  return result;
}
