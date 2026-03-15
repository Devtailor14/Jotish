import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();


  if (isAuthenticated) {
    return <Navigate to="/list" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);


    await new Promise(r => setTimeout(r, 600));

    const result = login(username, password);
    if (result.success) {
      navigate('/list');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-card']}>
        <div className={styles['login-logo']}>
          <div className={styles['login-logo-icon']}>👤</div>
          <h1>Employee Insights</h1>
          <p>Sign in to your dashboard</p>
        </div>

        <form className={styles['login-form']} onSubmit={handleSubmit}>
          {error && <div className={styles['login-error']}>{error}</div>}

          <div className={styles['input-group']}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles['input-group']}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className={styles['login-btn']}
            disabled={isLoading}
            id="login-submit"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles['login-hint']}>
          Hint: testuser / Test123
        </p>
      </div>
    </div>
  );
}
