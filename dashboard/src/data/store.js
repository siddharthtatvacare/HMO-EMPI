import { generateAllData } from './generateData.js';
import {
  computeConsultationMetrics, computePharmacyMetrics,
  computeDiagnosticMetrics, computeCDMMetrics, computeExecutiveSummary
} from './metrics.js';

// Generate once and cache
const rawData = generateAllData();

export const patients = rawData.patients;
export const consultations = rawData.consultations;
export const pharmacyOrders = rawData.pharmacyOrders;
export const diagnosticOrders = rawData.diagnosticOrders;
export const cdmRecords = rawData.cdmRecords;

// Pre-computed metrics
export const consultationMetrics = computeConsultationMetrics(consultations);
export const pharmacyMetrics = computePharmacyMetrics(pharmacyOrders);
export const diagnosticMetrics = computeDiagnosticMetrics(diagnosticOrders);
export const cdmMetrics = computeCDMMetrics(cdmRecords);
export const executiveSummary = computeExecutiveSummary(
  patients, consultations, pharmacyOrders, diagnosticOrders, cdmRecords
);

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
