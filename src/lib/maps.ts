/**
 * Calculates the Haversine distance between two points in kilometers.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimates travel time based on distance and mode.
 * Driving: ~30 km/h (conservative for cities/Bali)
 * Walking: ~5 km/h
 */
export function estimateTravelTime(distanceKm: number, mode: 'drive' | 'walk'): number {
  const speed = mode === 'drive' ? 30 : 5;
  return (distanceKm / speed) * 60; // Returns minutes
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  // Pattern 1: @lat,lng
  const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match1 = url.match(pattern1);
  if (match1) {
    return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) };
  }

  // Pattern 2: !3dlat!4dlng (Long URLs)
  const pattern2 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
  const match2 = url.match(pattern2);
  if (match2) {
    return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) };
  }

  // Pattern 3: ll=lat,lng or q=lat,lng
  const pattern3 = /[?&](?:ll|q)=(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match3 = url.match(pattern3);
  if (match3) {
    return { lat: parseFloat(match3[1]), lng: parseFloat(match3[2]) };
  }

  return null;
}
