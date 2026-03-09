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
  const avgMetabolicScore = total > 0
    ? (cdmRecords.reduce((s, r) => s + r.metabolicScore, 0) / total).toFixed(1)
    : 0;

  const avgInitialScore = total > 0
    ? (cdmRecords.reduce((s, r) => s + r.initialScore, 0) / total).toFixed(1)
    : 0;

  const improved = cdmRecords.filter(r => r.metabolicScore > r.initialScore).length;
  const improvementRate = total > 0 ? ((improved / total) * 100).toFixed(1) : 0;

  const totalDietConsults = cdmRecords.reduce((s, r) => s + r.dietConsultationsBooked, 0);
  const totalPhysioConsults = cdmRecords.reduce((s, r) => s + r.physioConsultationsBooked, 0);
  const totalMealLogs = cdmRecords.reduce((s, r) => s + r.mealLoggingCount, 0);
  const totalExerciseLogs = cdmRecords.reduce((s, r) => s + r.exerciseLoggingCount, 0);

  const avgMealLogs = total > 0 ? (totalMealLogs / total).toFixed(1) : 0;
  const avgExerciseLogs = total > 0 ? (totalExerciseLogs / total).toFixed(1) : 0;

  // Score distribution buckets
  const scoreDistribution = {
    'Critical (≤30)': cdmRecords.filter(r => r.metabolicScore <= 30).length,
    'Low (31-50)': cdmRecords.filter(r => r.metabolicScore > 30 && r.metabolicScore <= 50).length,
    'Moderate (51-70)': cdmRecords.filter(r => r.metabolicScore > 50 && r.metabolicScore <= 70).length,
    'Good (71-85)': cdmRecords.filter(r => r.metabolicScore > 70 && r.metabolicScore <= 85).length,
    'Excellent (86-100)': cdmRecords.filter(r => r.metabolicScore > 85).length,
  };

  const byCenter = {};
  cdmRecords.forEach(r => {
    if (!byCenter[r.centerName]) byCenter[r.centerName] = { count: 0, totalScore: 0 };
    byCenter[r.centerName].count++;
    byCenter[r.centerName].totalScore += r.metabolicScore;
  });
  Object.keys(byCenter).forEach(k => {
    byCenter[k].avgScore = (byCenter[k].totalScore / byCenter[k].count).toFixed(1);
  });

  return {
    total, avgMetabolicScore, avgInitialScore, improved, improvementRate,
    totalDietConsults, totalPhysioConsults, totalMealLogs, totalExerciseLogs,
    avgMealLogs, avgExerciseLogs, scoreDistribution, byCenter
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
