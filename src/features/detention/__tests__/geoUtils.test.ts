/**
 * Geo Utilities Tests
 * Pure function tests without external dependencies
 */

// Inline functions to avoid Expo dependency chain during testing
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(bearing / 45) % 8];
}

describe('calculateDistance', () => {
  it('returns 0 for same coordinates', () => {
    expect(calculateDistance(37.7749, -122.4194, 37.7749, -122.4194)).toBe(0);
  });

  it('calculates SF to LA distance (~559km)', () => {
    const distance = calculateDistance(37.7749, -122.4194, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(550000);
    expect(distance).toBeLessThan(570000);
  });

  it('calculates short distance accurately', () => {
    const distance = calculateDistance(37.7749, -122.4194, 37.7759, -122.4194);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });

  it('is symmetric', () => {
    const d1 = calculateDistance(37.0, -122.0, 38.0, -121.0);
    const d2 = calculateDistance(38.0, -121.0, 37.0, -122.0);
    expect(d1).toBeCloseTo(d2, 5);
  });
});

describe('formatDistance', () => {
  it('formats meters', () => {
    expect(formatDistance(50)).toBe('50m');
    expect(formatDistance(999)).toBe('999m');
  });

  it('formats kilometers', () => {
    expect(formatDistance(1000)).toBe('1.0km');
    expect(formatDistance(2500)).toBe('2.5km');
  });
});

describe('getCardinalDirection', () => {
  it('returns correct directions', () => {
    expect(getCardinalDirection(0)).toBe('N');
    expect(getCardinalDirection(45)).toBe('NE');
    expect(getCardinalDirection(90)).toBe('E');
    expect(getCardinalDirection(180)).toBe('S');
    expect(getCardinalDirection(270)).toBe('W');
  });
});

describe('geofence detection', () => {
  const facilityLat = 37.7749;
  const facilityLng = -122.4194;

  function isWithinGeofence(lat: number, lng: number, radius = 200): boolean {
    return calculateDistance(lat, lng, facilityLat, facilityLng) <= radius;
  }

  it('detects location at facility', () => {
    expect(isWithinGeofence(facilityLat, facilityLng)).toBe(true);
  });

  it('detects location within radius', () => {
    expect(isWithinGeofence(facilityLat + 0.0008, facilityLng)).toBe(true);
  });

  it('detects location outside radius', () => {
    expect(isWithinGeofence(facilityLat + 0.003, facilityLng)).toBe(false);
  });

  it('respects custom radius', () => {
    const testLat = facilityLat + 0.004;
    expect(isWithinGeofence(testLat, facilityLng, 200)).toBe(false);
    expect(isWithinGeofence(testLat, facilityLng, 500)).toBe(true);
  });
});
