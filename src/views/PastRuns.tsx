import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ActivityCard } from './ActivityCard';
import { LIGHT_BG_COLOR } from '../Constants';

export const PastRuns = () => {
  const navigate = useNavigate();
  const oldActivites = useStore((s) => s.oldActivites);

  return (
    <div style={{ ...styles.container, maxWidth: 480, margin: '0 auto' }}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/')}>← Back</button>
        <h1 style={styles.title}>Past Runs</h1>
      </div>

      {oldActivites.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No runs yet. Start your first workout!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {oldActivites.map((item, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <ActivityCard buttonText="View" activity={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: LIGHT_BG_COLOR, minHeight: '100vh', padding: 16, paddingBottom: 40 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  back: { color: '#4adf7e', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' },
  title: { color: '#fff', fontSize: 24, fontWeight: 600, margin: 0 },
  empty: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  emptyText: { color: '#a3a3a3', fontSize: 16, textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column' },
};
