export type Recurrence = 'one-time' | 'weekly' | 'monthly';
export type Currency = 'USD' | 'EUR';

export function hourlyRateFromSalary(salary: number): number {
  return salary / 2080;
}

export function meetingCost(attendees: number, salary: number, durationMinutes: number): number {
  const safeAttendees = Math.max(1, attendees);
  const safeDuration = Math.max(0, durationMinutes);
  const hourlyRate = hourlyRateFromSalary(salary);
  return safeAttendees * hourlyRate * (safeDuration / 60);
}

export function annualizedMultiplier(recurrence: Recurrence): number {
  if (recurrence === 'weekly') return 52;
  if (recurrence === 'monthly') return 12;
  return 1;
}

export function annualizedCost(cost: number, recurrence: Recurrence): number {
  return cost * annualizedMultiplier(recurrence);
}

export function costPerPerson(cost: number, attendees: number): number {
  return attendees > 0 ? cost / attendees : 0;
}

export function formatMoney(amount: number, currency: Currency): string {
  if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      // Fall back to manual formatting below.
    }
  }

  const symbol = currency === 'EUR' ? '€' : '$';
  return `${symbol}${amount.toFixed(2)}`;
}
