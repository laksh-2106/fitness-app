import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GREEN_COLOR, LIGHT_BG_COLOR, CARD_BG_COLOR, ORANGE_COLOR } from '../Constants';

interface Coord { lat: number; long: number; }

const generateTrack = (): Coord[] => {
  const track: Coord[] = [];
  let lat = 37.7749;
  let long = -122.4194;
  for (let i = 0; i < 40; i++) {
    lat += (Math.random() - 0.45) * 0.001;
    long += (Math.random() - 0.45) * 0.001;
    track.push({ lat, long });
  }
  return track;
};

const haversine = (a: Coord, b: Coord): number => {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLong = ((b.long - a.long) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLong / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

export const RunScreen = () => {
  const navigate = useNavigate();
  const endRun = useStore((s) => s.endRun);
  const liveActivity = useStore((s) => s.liveActivity);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [track, setTrack] = useState<Coord[]>([]);
  const trackRef = useRef<Coord[]>([]);
  const distRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gpsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setRunning(true);
    const startMs = Date.now();
    const startStr = new Date().toLocaleTimeString();
    const newTrack = generateTrack();
    trackRef.current = [newTrack[0]];
    setTrack([newTrack[0]]);
    distRef.current = 0;

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);

    let i = 1;
    gpsRef.current = setInterval(() => {
      if (i >= newTrack.length) {
        stop(newTrack, startStr);
        return;
      }
      const prev = trackRef.current[trackRef.current.length - 1];
      const next = newTrack[i];
      const d = haversine(prev, next);
      distRef.current += d;
      trackRef.current.push(next);
      setTrack([...trackRef.current]);
      setDistance(distRef.current);
      i++;
    }, 1500);
  };

  const stop = (fullTrack?: Coord[], startStr?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gpsRef.current) clearInterval(gpsRef.current);
    timerRef.current = null;
    gpsRef.current = null;
    setRunning(false);

    const finalTrack = fullTrack ?? trackRef.current;
    const start = startStr ?? new Date().toLocaleTimeString();
    const end = new Date().toLocaleTimeString();
    const km = distRef.current / 1000;
    const speed = elapsed > 0 ? distRef.current / elapsed : 0;

    endRun({
      startTime: start,
      endTime: end,
      duration: formatTime(elapsed),
      length: `${km.toFixed(2)} km`,
      averageSpeed: `${speed.toFixed(2)} m/s`,
      coordinates: finalTrack,
    });
    navigate('/');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gpsRef.current) clearInterval(gpsRef.current);
    };
  }, []);

  const km = distance / 1000;
  const speed = elapsed > 0 ? distance / elapsed : 0;
  const bounds = getBounds(track);

  return (
    <div style={{ ...styles.container, maxWidth: 480, margin: '0 auto' }}>
      <div style={styles.mapArea}>
        <svg style={styles.map} viewBox={`${bounds.minLong} ${bounds.minLat} ${bounds.maxLong - bounds.minLong || 0.01} ${bounds.maxLat - bounds.minLat || 0.01}`}>
          <polyline
            points={track.map((c) => `${c.long},${c.lat}`).join(' ')}
            fill="none"
            stroke={GREEN_COLOR}
            strokeWidth={0.0008}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {track.length > 0 && (
            <circle cx={track[track.length - 1].long} cy={track[track.length - 1].lat} r={0.0015} fill={ORANGE_COLOR} />
          )}
        </svg>
        <div style={styles.mapOverlay}>
          <span style={styles.mapLabel}>San Francisco</span>
        </div>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{formatTime(elapsed)}</span>
          <span style={styles.statLabel}>Time</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{km.toFixed(2)}</span>
          <span style={styles.statLabel}>km</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{speed.toFixed(2)}</span>
          <span style={styles.statLabel}>m/s</span>
        </div>
      </div>

      <div style={styles.controls}>
        {!running ? (
          <button style={styles.startBtn} onClick={start}>
            Start Workout
          </button>
        ) : (
          <button style={styles.stopBtn} onClick={() => stop()}>
            Stop Workout
          </button>
        )}
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    </div>
  );
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};
const pad = (n: number) => n.toString().padStart(2, '0');

const getBounds = (track: Coord[]) => {
  if (track.length === 0) return { minLat: 37.77, maxLat: 37.78, minLong: -122.42, maxLong: -122.41 };
  let minLat = Infinity, maxLat = -Infinity, minLong = Infinity, maxLong = -Infinity;
  track.forEach((c) => {
    minLat = Math.min(minLat, c.lat);
    maxLat = Math.max(maxLat, c.lat);
    minLong = Math.min(minLong, c.long);
    maxLong = Math.max(maxLong, c.long);
  });
  const padLat = (maxLat - minLat) * 0.15 || 0.005;
  const padLong = (maxLong - minLong) * 0.15 || 0.005;
  return { minLat: minLat - padLat, maxLat: maxLat + padLat, minLong: minLong - padLong, maxLong: maxLong + padLong };
};

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: LIGHT_BG_COLOR, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  mapArea: { flex: 1, position: 'relative', minHeight: 320, backgroundColor: '#1a1a1a', overflow: 'hidden' },
  map: { width: '100%', height: '100%', display: 'block' },
  mapOverlay: { position: 'absolute', top: 12, left: 12 },
  mapLabel: { color: '#fff', fontSize: 13, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 8 },
  stats: { display: 'flex', justifyContent: 'space-around', padding: '20px 16px', backgroundColor: CARD_BG_COLOR },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontSize: 28, fontWeight: 700 },
  statLabel: { color: '#a3a3a3', fontSize: 13 },
  controls: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  startBtn: { height: 50, borderRadius: 25, backgroundColor: GREEN_COLOR, color: '#000', fontSize: 17, fontWeight: 600, border: 'none', cursor: 'pointer' },
  stopBtn: { height: 50, borderRadius: 25, backgroundColor: ORANGE_COLOR, color: '#fff', fontSize: 17, fontWeight: 600, border: 'none', cursor: 'pointer' },
  backBtn: { height: 44, borderRadius: 22, backgroundColor: '#333', color: '#fff', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer' },
};
