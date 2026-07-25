import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Steps } from './Steps';
import { ActivityCard } from './ActivityCard';
import { LIGHT_BG_COLOR } from '../Constants';

export const Home = () => {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const liveActivity = useStore((s) => s.liveActivity);
  const topActivity = useStore((s) => s.topActivity);
  const lastFourDaysSteps = useStore((s) => s.lastFourDaysSteps);

  return (
    <div style={{ ...styles.container, maxWidth: 480, margin: '0 auto' }}>
      <div style={styles.topBar}>
        <span style={styles.greeting}>Hi, {user?.name ?? 'Athlete'}</span>
        <button style={styles.logout} onClick={() => { useStore.getState().logout(); navigate('/login'); }}>
          Logout
        </button>
      </div>

      <Steps lastFourDaysSteps={lastFourDaysSteps} maxSteps={user?.oneDayMaxSteps} />

      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <ActivityCard
            buttonText={liveActivity ? 'View Live' : 'Start Run'}
            activity={liveActivity ?? undefined}
            onPress={() => navigate('/run')}
          />
        </div>
        <div style={{ width: 16 }} />
        <div style={{ flex: 1 }}>
          <ActivityCard
            buttonText="Past Runs"
            onPress={() => navigate('/past')}
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <ActivityCard
          buttonText="Top Workout"
          activity={topActivity ?? undefined}
          onPress={() => navigate('/past')}
        />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { backgroundColor: LIGHT_BG_COLOR, minHeight: '100vh', padding: 16, paddingBottom: 40, display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { color: '#fff', fontSize: 22, fontWeight: 600 },
  logout: { color: '#4adf7e', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' },
  row: { display: 'flex', justifyContent: 'space-between' },
};
