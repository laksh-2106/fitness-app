import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GREEN_COLOR, LIGHT_BG_COLOR, INPUT_BG_COLOR } from '../Constants';

export const Login = () => {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter valid details');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Get Started With Your Fitness Journey</h1>
      <input
        style={styles.input}
        placeholder="Email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
      />
      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
      />
      {error && <p style={{ color: GREEN_COLOR, alignSelf: 'flex-start', fontSize: 14 }}>{error}</p>}
      <button style={styles.button} onClick={handleLogin} disabled={loading}>
        {loading ? <span className="spinner" /> : 'Login'}
      </button>
      <div style={{ display: 'flex', gap: 4 }}>
        <span>Create a new account? </span>
        <span style={{ color: GREEN_COLOR, cursor: 'pointer' }} onClick={() => navigate('/signup')}>
          Sign up
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: LIGHT_BG_COLOR,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 1.2,
  },
  input: {
    width: '100%',
    maxWidth: 360,
    height: 50,
    borderRadius: 16,
    border: 'none',
    backgroundColor: INPUT_BG_COLOR,
    color: '#fff',
    padding: '0 16px',
    fontSize: 16,
    fontWeight: 500,
    outline: 'none',
  },
  button: {
    width: '100%',
    maxWidth: 360,
    height: 50,
    borderRadius: 25,
    backgroundColor: GREEN_COLOR,
    color: '#000',
    fontSize: 17,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  },
};
