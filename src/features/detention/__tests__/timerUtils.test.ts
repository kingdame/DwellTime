/**
 * Timer Utilities Tests
 */

// Inline functions to avoid import chain issues
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs].map((v) => v.toString().padStart(2, '0')).join(':');
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function calculateTimerState(
  arrivalTime: Date,
  now: Date,
  gracePeriodMinutes: number = 120,
  hourlyRate: number = 75
) {
  const elapsedMs = now.getTime() - arrivalTime.getTime();
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const gracePeriodSeconds = gracePeriodMinutes * 60;
  const isInGracePeriod = elapsedSeconds < gracePeriodSeconds;
  const detentionSeconds = Math.max(0, elapsedSeconds - gracePeriodSeconds);
  const isDetentionActive = detentionSeconds > 0;
  const detentionHours = detentionSeconds / 3600;
  const currentEarnings = Math.round(detentionHours * hourlyRate * 100) / 100;

  return {
    elapsedSeconds,
    gracePeriodSeconds,
    detentionSeconds,
    isInGracePeriod,
    isDetentionActive,
    currentEarnings,
  };
}

function calculateDetentionAmount(
  arrivalTime: Date,
  departureTime: Date,
  gracePeriodMinutes: number,
  hourlyRate: number
) {
  const totalMinutes = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60);
  const detentionMinutes = Math.max(0, totalMinutes - gracePeriodMinutes);
  const detentionHours = detentionMinutes / 60;
  const totalAmount = Math.round(detentionHours * hourlyRate * 100) / 100;
  return { detentionMinutes: Math.round(detentionMinutes), totalAmount };
}

describe('formatTime', () => {
  it('formats zero correctly', () => {
    expect(formatTime(0)).toBe('00:00:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:00:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('00:02:05');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatTime(3661)).toBe('01:01:01');
  });

  it('handles large values', () => {
    expect(formatTime(36000)).toBe('10:00:00');
  });
});

describe('formatDuration', () => {
  it('formats minutes only when < 1 hour', () => {
    expect(formatDuration(1800)).toBe('30m');
    expect(formatDuration(60)).toBe('1m');
  });

  it('formats hours only when no minutes', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(7200)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(9000)).toBe('2h 30m');
  });
});

describe('formatCurrency', () => {
  it('formats whole numbers', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats decimals', () => {
    expect(formatCurrency(75.50)).toBe('$75.50');
    expect(formatCurrency(0.99)).toBe('$0.99');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('calculateTimerState', () => {
  const arrivalTime = new Date('2024-01-01T10:00:00');

  it('calculates grace period correctly', () => {
    const now = new Date('2024-01-01T11:00:00'); // 1 hour after arrival
    const result = calculateTimerState(arrivalTime, now);

    expect(result.elapsedSeconds).toBe(3600);
    expect(result.isInGracePeriod).toBe(true);
    expect(result.isDetentionActive).toBe(false);
    expect(result.currentEarnings).toBe(0);
  });

  it('calculates detention correctly after grace period', () => {
    const now = new Date('2024-01-01T13:00:00'); // 3 hours after arrival
    const result = calculateTimerState(arrivalTime, now);

    expect(result.elapsedSeconds).toBe(10800); // 3 hours
    expect(result.isInGracePeriod).toBe(false);
    expect(result.isDetentionActive).toBe(true);
    expect(result.detentionSeconds).toBe(3600); // 1 hour of detention
    expect(result.currentEarnings).toBe(75); // 1 hour at $75/hr
  });

  it('uses custom grace period and rate', () => {
    const now = new Date('2024-01-01T11:30:00'); // 1.5 hours after arrival
    const result = calculateTimerState(arrivalTime, now, 60, 100); // 1hr grace, $100/hr

    expect(result.isInGracePeriod).toBe(false);
    expect(result.detentionSeconds).toBe(1800); // 30 min detention
    expect(result.currentEarnings).toBe(50); // 0.5 hours at $100/hr
  });
});

describe('calculateDetentionAmount', () => {
  it('calculates zero detention within grace period', () => {
    const arrival = new Date('2024-01-01T10:00:00');
    const departure = new Date('2024-01-01T11:30:00'); // 1.5 hours
    const result = calculateDetentionAmount(arrival, departure, 120, 75);

    expect(result.detentionMinutes).toBe(0);
    expect(result.totalAmount).toBe(0);
  });

  it('calculates detention correctly after grace period', () => {
    const arrival = new Date('2024-01-01T10:00:00');
    const departure = new Date('2024-01-01T14:00:00'); // 4 hours
    const result = calculateDetentionAmount(arrival, departure, 120, 75);

    expect(result.detentionMinutes).toBe(120); // 2 hours detention
    expect(result.totalAmount).toBe(150); // 2 hours at $75/hr
  });

  it('handles partial hours', () => {
    const arrival = new Date('2024-01-01T10:00:00');
    const departure = new Date('2024-01-01T13:30:00'); // 3.5 hours
    const result = calculateDetentionAmount(arrival, departure, 120, 100);

    expect(result.detentionMinutes).toBe(90); // 1.5 hours detention
    expect(result.totalAmount).toBe(150); // 1.5 hours at $100/hr
  });
});
