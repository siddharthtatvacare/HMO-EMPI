import { generateAllData } from './generateData.js';
import {
  computeConsultationMetrics, computePharmacyMetrics,
  computeDiagnosticMetrics, computeCDMMetrics, computeExecutiveSummary,
  computeRiskMetrics, computeBehavioralMetrics, computeCDMEffectivenessMetrics,
  computeEcosystemMetrics, computeFinancialMetrics
} from './metrics.js';

// Generate once and cache
const rawData = generateAllData();

export const patients = rawData.patients;
export const consultations = rawData.consultations;
export const pharmacyOrders = rawData.pharmacyOrders;
export const diagnosticOrders = rawData.diagnosticOrders;
export const cdmRecords = rawData.cdmRecords;
export const competitorPrescriptions = rawData.competitorPrescriptions;
export const externalVisits = rawData.externalVisits;
export const hospitalizationEvents = rawData.hospitalizationEvents;

// Pre-computed metrics (existing)
export const consultationMetrics = computeConsultationMetrics(consultations);
export const pharmacyMetrics = computePharmacyMetrics(pharmacyOrders);
export const diagnosticMetrics = computeDiagnosticMetrics(diagnosticOrders);
export const cdmMetrics = computeCDMMetrics(cdmRecords);
export const executiveSummary = computeExecutiveSummary(
  patients, consultations, pharmacyOrders, diagnosticOrders, cdmRecords
);

// Pre-computed metrics (new HMO EMPI)
export const riskMetrics = computeRiskMetrics(patients);
export const behavioralMetrics = computeBehavioralMetrics(patients);
export const cdmEffectivenessMetrics = computeCDMEffectivenessMetrics(patients, cdmRecords);
export const ecosystemMetrics = computeEcosystemMetrics(patients, competitorPrescriptions, externalVisits);
export const financialMetrics = computeFinancialMetrics(patients, cdmRecords);

// Lookup helpers
export function getPatientById(id) {
  return patients.find(p => p.id === id);
}

export function getConsultationsForPatient(patientId) {
  return consultations.filter(c => c.patientId === patientId);
}

export function getPharmacyOrdersForPatient(patientId) {
  return pharmacyOrders.filter(o => o.patientId === patientId);
}

export function getDiagnosticOrdersForPatient(patientId) {
  return diagnosticOrders.filter(o => o.patientId === patientId);
}

export function getCDMRecordForPatient(patientId) {
  return cdmRecords.find(r => r.patientId === patientId);
}

export function getPatientsByRiskCohort(cohort) {
  return patients.filter(p => p.riskCohort === cohort);
}

export function getPatientsByEmployer(employer) {
  return patients.filter(p => p.employer === employer);
}
