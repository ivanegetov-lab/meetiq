type ComputeRiskParams = {
  score: number;
  annualizedCost: number;
  maxAnnualWaste?: number;
};

export type Severity = 'good' | 'mid' | 'severe';

type ComputeRiskResult = {
  risk: number;
  severity: Severity;
  wastePct: number;
  annualizedWaste: number;
  intensity: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function severityFromScore(score: number): Severity {
  if (score <= 40) return 'severe';
  if (score < 70) return 'mid';
  return 'good';
}

export function intensityFromAnnualWaste(annualizedWaste: number, maxAnnualWaste: number = 250000): number {
  const max = maxAnnualWaste;
  const v = Math.log10(annualizedWaste + 1) / Math.log10(max + 1);
  return clamp(v, 0, 1);
}

export function computeRisk({
  score,
  annualizedCost,
  maxAnnualWaste = 250000,
}: ComputeRiskParams): ComputeRiskResult {
  const wastePct = clamp(1 - score / 100, 0, 1);
  const annualizedWaste = annualizedCost * wastePct;
  const severity = severityFromScore(score);
  const intensity = intensityFromAnnualWaste(annualizedWaste, maxAnnualWaste);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  let risk: number;
  if (severity === 'good') risk = lerp(0.05, 0.3, intensity);
  else if (severity === 'mid') risk = lerp(0.36, 0.63, intensity);
  else risk = lerp(0.7, 0.98, intensity);

  return {
    risk: clamp(risk, 0, 1),
    severity,
    wastePct,
    annualizedWaste,
    intensity,
  };
}
