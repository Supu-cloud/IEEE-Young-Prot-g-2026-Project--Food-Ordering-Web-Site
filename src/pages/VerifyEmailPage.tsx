import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle } from 'lucide-react';
import { environment } from '../core/config/environment';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      axios
        .get(`${environment.apiBaseUrl}/auth/verify-email?token=${token}`)
        .then((res) => {
          setIsSuccess(true);
          setMessage(res.data.message || 'Email verified successfully!');
        })
        .catch((err) => {
          setIsSuccess(false);
          setMessage(err.response?.data?.message || 'Verification failed or link expired.');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setMessage('Invalid verification link.');
    }
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="application-success">
        {loading ? (
          <h2>Verifying your email...</h2>
        ) : (
          <>
            <span>{isSuccess ? <CheckCircle2 color="green" /> : <XCircle color="red" />}</span>
            <h1>{isSuccess ? 'Email Verified!' : 'Verification Failed'}</h1>
            <p>{message}</p>
            <Link className="button button--primary" to="/login">
              Continue to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}