import { formatMoney, type Currency } from '@/lib/calculations';

type MeetingMessageParams = {
  score: number;
  wasteDollars: number;
  annualizedWaste: number;
  cost: number;
  annualizedCost: number;
  currency: Currency;
};

type MeetingMessage = {
  headline: string;
  body: string;
  severity: 'good' | 'mid' | 'bad' | 'severe';
};

export function meetingMessage(params: MeetingMessageParams): MeetingMessage {
  const { score, wasteDollars, annualizedWaste, cost, annualizedCost, currency } = params;

  if (score < 50 && wasteDollars > 2000) {
    return {
      severity: 'severe',
      headline: 'Critical Efficiency Risk',
      body: `Quality is low while spend is high. Current meeting cost is ${formatMoney(
        cost,
        currency
      )}, with an annualized burn of ${formatMoney(annualizedCost, currency)}. You likely burned ${formatMoney(
        wasteDollars,
        currency
      )} with limited measurable outcome.`,
    };
  }

  if (score >= 80) {
    return {
      severity: 'good',
      headline: 'Strong Meeting Discipline',
      body: `Execution quality is high and waste is contained at ${formatMoney(
        wasteDollars,
        currency
      )} per meeting (${formatMoney(annualizedWaste, currency)} annualized). Keep this operating standard.`,
    };
  }

  if (score >= 50) {
    return {
      severity: 'mid',
      headline: 'Moderate Performance, Clear Headroom',
      body: `The meeting structure is functional but leaves measurable value on the table. Estimated waste is ${formatMoney(
        wasteDollars,
        currency
      )} per meeting and ${formatMoney(annualizedWaste, currency)} annually.`,
    };
  }

  return {
    severity: 'bad',
    headline: 'Low Quality Relative to Cost',
    body: `Core decision hygiene is weak for this spend level. Estimated waste is ${formatMoney(
      wasteDollars,
      currency
    )} per meeting and ${formatMoney(annualizedWaste, currency)} annualized.`,
  };
}
