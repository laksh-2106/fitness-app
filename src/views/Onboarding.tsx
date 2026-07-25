import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GREEN_COLOR, LIGHT_BG_COLOR, INPUT_BG_COLOR } from '../Constants';

export const Onboarding = () => {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const setError = useStore((s) => s.setError);
  const error = useStore((s) => s.error);
  const loading = useStore((s) => s.loading);

  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');

  const handleComplete = async () => {
    if (!gender || !height || !weight || !steps) {
      setError('Please enter valid details');
      return;
    }
    setError(null);
    await new Promise((r) => setTimeout(r, 500));
    completeOnboarding({
      gender: gender as 'Male' | 'Female',
      height: Number(height),
      weight: Number(weight),
      oneDayMaxSteps: Number(steps),
    });
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div>
        <h1 style={styles.header}>Hello {user?.name}!</h1>
        <p style={styles.subHeader}>Tell us more about you..</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {['Male', 'Female'].map((g) => (
          <button
            key={g}
            onClick={() => setGender(g as 'Male' | 'Female')}
            style={{
              ...styles.genderBtn,
              borderColor: gender === g ? GREEN_COLOR : '#666',
              backgroundColor: gender === g ? GREEN_COLOR : '#666',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Height</label>
        <div style={styles.row}>
          <input style={styles.input} placeholder="Cm" value={height} onChange={(e) => setHeight(e.target.value)} />
          <span style={styles.unit}>CM</span>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Weight</label>
        <div style={styles.row}>
          <input style={styles.input} placeholder="Kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <span style={styles.unit}>KG</span>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Daily steps</label>
        <div style={styles.row}>
          <input style={styles.input} placeholder="Steps" value={steps} onChange={(e) => setSteps(e.target.value)} />
          <span style={styles.unit}>Stp</span>
        </div>
      </div>

      <div style={styles.bottom}>
        {error && <p style={{ color: GREEN_COLOR, fontSize: 14 }}>{error}</p>}
        <button style={styles.btn} onClick={handleComplete}>
          {loading === 'pending' ? <span className="spinner" /> : 'Complete'}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', backgroundColor: LIGHT_BG_COLOR, padding: 20, paddingTop: 80, display: 'flex', flexDirection: 'column' },
  header: { fontSize: 28, fontWeight: 400, color: '#fff' },
  subHeader: { fontSize: 26, fontWeight: 300, color: '#fff' },
  field: { marginTop: 28 },
  label: { fontSize: 16, color: '#fff', display: 'block', marginBottom: 10 },
  row: { display: 'flex', gap: 12, alignItems: 'center' },
  input: { flex: 1, height: 50, borderRadius: 16, border: 'none', backgroundColor: INPUT_BG_COLOR, color: '#fff', padding: '0 16px', fontSize: 16, fontWeight: 500, outline: 'none' },
  unit: { backgroundColor: GREEN_COLOR, height: 40, width: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 600, fontSize: 12 },
  genderBtn: { height: 50, width: '45%', borderRadius: 8, color: '#000', fontSize: 16, fontWeight: 500, border: '2px solid', cursor: 'pointer' },
  bottom: { marginTop: 'auto', paddingBottom: 32 },
  btn: { width: '100%', height: 50, borderRadius: 25, backgroundColor: GREEN_COLOR, color: '#000', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 16 },
};
