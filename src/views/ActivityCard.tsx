import type { Activity } from '../models/Activity';
import { CARD_BG_COLOR, GREEN_COLOR } from '../Constants';

interface ActivityCardProps {
  buttonText?: string;
  activity?: Activity;
  onPress?: () => void;
}

export const ActivityCard = (props: ActivityCardProps) => {
  const { activity, buttonText, onPress } = props;

  if (activity && (activity.activityDetails?.length || activity.activityDetails?.duration)) {
    return (
      <div style={styles.card}>
        <div style={styles.details}>
          <p style={styles.detailLine}>{activity.activityDetails?.averageSpeed ?? '—'}</p>
          <p style={styles.detailLine}>{activity.activityDetails?.length ?? '—'}</p>
          <p style={styles.detailLine}>Total Time: {activity.activityDetails?.duration ?? '—'}</p>
          <p style={styles.detailLine}>Start: {activity.activityDetails?.startTime ?? '—'}</p>
          <p style={styles.detailLine}>End: {activity.activityDetails?.endTime ?? '—'}</p>
          <p style={styles.detailLine}>Date: {activity.date ?? '—'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <button style={styles.buttonText} onClick={onPress}>
        {buttonText}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: { backgroundColor: CARD_BG_COLOR, borderRadius: 16, padding: 16, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.15s ease' },
  buttonText: { fontSize: 34, fontWeight: 700, color: GREEN_COLOR, textAlign: 'center', lineHeight: 1.1, background: 'none', border: 'none', cursor: 'pointer' },
  details: { display: 'flex', flexDirection: 'column', gap: 6 },
  detailLine: { fontSize: 18, color: '#fff', fontWeight: 600, margin: 0 },
};
