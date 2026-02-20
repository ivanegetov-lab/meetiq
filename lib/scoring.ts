export type QualityAnswers = {
  goalDefined: boolean;
  ownerAssigned: boolean;
  prereadSent: boolean;
  decisionMade: boolean;
  nextActionsClear: boolean;
};

export function qualityScore(a: QualityAnswers): number {
  const points =
    (a.goalDefined ? 20 : 0) +
    (a.ownerAssigned ? 20 : 0) +
    (a.prereadSent ? 20 : 0) +
    (a.decisionMade ? 20 : 0) +
    (a.nextActionsClear ? 20 : 0);

  return Math.max(0, Math.min(100, points));
}
