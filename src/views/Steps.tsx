import { GREEN_COLOR, LIGHT_TEXT_COLOR, CARD_BG_COLOR } from '../Constants';

interface StepsProps {
  lastFourDaysSteps?: number[];
  maxSteps?: number;
}

export const Steps = (props: StepsProps) => {
  const data = props.lastFourDaysSteps ?? [6000, 9000, 1000, 10000, 11000, 2000, 5000];
  const max = 10000;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Steps</span>
        <span style={styles.subtitle}>Last 7 days</span>
      </div>
      <div style={styles.chart}>
        {data.map((item, index) => {
          const percentage = Math.min((item / max) * 100, 100);
          const date = new Date();
          date.setDate(date.getDate() - index);
          const label = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(date);
          return (
            <div key={index} style={styles.barWrap}>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, height: `${percentage}%` }} />
              </div>
              <span style={styles.barLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: CARD_BG_COLOR, borderRadius: 16, padding: 16, marginBottom: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: 600 },
  subtitle: { color: LIGHT_TEXT_COLOR, fontSize: 13 },
  chart: { display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 },
  barWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  barTrack: { width: '100%', height: 100, backgroundColor: '#3a3a3a', borderRadius: 8, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: GREEN_COLOR, borderRadius: 8, transition: 'height 0.6s ease' },
  barLabel: { color: LIGHT_TEXT_COLOR, fontSize: 10, textAlign: 'center' },
};
