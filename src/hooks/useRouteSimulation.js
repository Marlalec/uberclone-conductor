import { useEffect, useMemo, useState } from 'react';

const FRAME_MS = 50;
const DURATION_MS = 30000;

const distanceBetween = (start, end) =>
  Math.hypot(end.latitude - start.latitude, end.longitude - start.longitude);

const buildCumulativeDistances = (coordinates) =>
  coordinates.reduce((distances, coordinate, index) => {
    const previous = index === 0 ? 0 : distances[index - 1] + distanceBetween(coordinates[index - 1], coordinate);
    return [...distances, previous];
  }, []);

export const positionAt = (coordinates, distances, progress) => {
  const target = progress * distances[distances.length - 1];
  const index = Math.max(1, distances.findIndex((distance) => distance >= target));
  const start = coordinates[index - 1];
  const end = coordinates[index];
  const segment = distances[index] - distances[index - 1];
  const ratio = segment === 0 ? 0 : (target - distances[index - 1]) / segment;

  return {
    latitude: start.latitude + (end.latitude - start.latitude) * ratio,
    longitude: start.longitude + (end.longitude - start.longitude) * ratio,
    facingEast: end.longitude > start.longitude,
    nextIndex: index,
  };
};

export default function useRouteSimulation(coordinates) {
  const distances = useMemo(() => buildCumulativeDistances(coordinates), [coordinates]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    if (coordinates.length < 2) {
      return undefined;
    }

    const startedAt = Date.now();
    const timer = setInterval(() => {
      const nextProgress = Math.min(1, (Date.now() - startedAt) / DURATION_MS);
      setProgress(nextProgress);
      if (nextProgress === 1) {
        clearInterval(timer);
      }
    }, FRAME_MS);

    return () => clearInterval(timer);
  }, [coordinates]);

  return coordinates.length < 2 ? null : positionAt(coordinates, distances, progress);
}
