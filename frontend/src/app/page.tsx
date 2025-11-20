'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import machine from '@/utils/machine';
import Cookies from 'js-cookie';
import styles from '@/styles/Auth.module.css';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (activeTab === 'signup') {
        if (formData.password !== formData.confirm_password) throw new Error("Passwords do not match");
        await machine.post('/register/', { ...formData });
        setActiveTab('login');
        alert('Account created! Please log in.');
      } else {
        const response = await machine.post('/login/', { email: formData.email, password: formData.password });
        Cookies.set('token', response.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authBody}>
      <div className={styles.container}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <div className={styles.brand}>
            <h1>AI Vision Platform</h1>
            <p>Advanced object detection and intelligent analysis powered by state-of-the-art machine learning models</p>
          </div>
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path></svg>
              </div>
              <div className={styles.featureContent}>
                <h3>YOLO Object Detection</h3>
                <p>Real-time object detection with industry-leading accuracy.</p>
              </div>
            </div>
             <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
              </div>
              <div className={styles.featureContent}>
                <h3>AI-Powered Q&A</h3>
                <p>Ask questions about detected objects using Gemini.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          <div className={styles.authHeader}>
            <h2>{activeTab === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{activeTab === 'login' ? 'Enter your credentials to access your account' : 'Sign up to start analyzing images'}</p>
          </div>

          <div className={styles.tabContainer}>
            <button className={`${styles.authTab} ${activeTab === 'login' ? styles.active : ''}`} onClick={() => setActiveTab('login')}>Sign In</button>
            <button className={`${styles.authTab} ${activeTab === 'signup' ? styles.active : ''}`} onClick={() => setActiveTab('signup')}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === 'signup' && (
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input name="full_name" type="text" className={styles.authInput} placeholder="John Doe" onChange={handleChange} required />
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input name="email" type="email" className={styles.authInput} placeholder="you@example.com" onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
                <input name="password" type={showPassword ? "text" : "password"} className={styles.authInput} placeholder="Password" onChange={handleChange} required />
                <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            {activeTab === 'signup' && (
              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
                  <input name="confirm_password" type={showPassword ? "text" : "password"} className={styles.authInput} placeholder="Confirm Password" onChange={handleChange} required />
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button type="submit" disabled={loading} className={styles.submitBtn}>{loading ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}</button>
          </form>

          <div className={styles.divider}><span>OR CONTINUE WITH</span></div>
          <button type="button" className={styles.googleBtn}>
            <svg className={styles.googleIcon} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}