import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await api.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <LoadingSpinner text="Verifying your email..." />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">{status === 'success' ? '✅' : '❌'}</div>
          <h1 className="auth-title">
            {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h1>
          <p className="auth-subtitle">{message}</p>
        </div>

        {status === 'success' ? (
          <Link to="/login" className="btn btn-primary btn-block btn-lg">
            Sign In Now
          </Link>
        ) : (
          <Link to="/register" className="btn btn-secondary btn-block btn-lg">
            Try Again
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
