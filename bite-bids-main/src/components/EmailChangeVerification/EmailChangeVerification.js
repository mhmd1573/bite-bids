// import React, { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import axios from 'axios';

// const EmailChangeVerification = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [status, setStatus] = useState('loading'); // loading, success, error
//   const [message, setMessage] = useState('');
//   const [newEmail, setNewEmail] = useState('');

//   useEffect(() => {
//     const verifyEmail = async () => {
//       const token = searchParams.get('token');

//       if (!token) {
//         setStatus('error');
//         setMessage('No verification token found');
//         return;
//       }

//       try {
//         // ✅ CALL BACKEND API
//         const response = await axios.get(
//           `http://localhost:8001/api/auth/verify-email-change?token=${token}`
//         );

//         if (response.data.success) {
//           setStatus('success');
//           setMessage(response.data.message);
//           setNewEmail(response.data.new_email);

//           // Redirect to profile after 3 seconds
//           setTimeout(() => {
//             navigate('/profile');
//           }, 3000);
//         }
//       } catch (error) {
//         setStatus('error');
//         setMessage(
//           error.response?.data?.detail || 
//           'Email verification failed. Please try again.'
//         );

//         // Redirect to login after 3 seconds
//         setTimeout(() => {
//           navigate('/login');
//         }, 3000);
//       }
//     };

//     verifyEmail();
//   }, [searchParams, navigate]);

//   return (
//     <div className="email-verification-container">
//       {status === 'loading' && (
//         <div className="loading">
//           <div className="spinner"></div>
//           <h2>Verifying your email...</h2>
//         </div>
//       )}

//       {status === 'success' && (
//         <div className="success">
//           <div className="success-icon">✓</div>
//           <h2>Email Verified Successfully!</h2>
//           <p>{message}</p>
//           <p>Your new email: <strong>{newEmail}</strong></p>
//           <p>Redirecting to your profile...</p>
//         </div>
//       )}

//       {status === 'error' && (
//         <div className="error">
//           <div className="error-icon">✗</div>
//           <h2>Verification Failed</h2>
//           <p>{message}</p>
//           <p>Redirecting you to login page...</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmailChangeVerification;




import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import './EmailChangeVerification.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EmailChangeVerification = ({ navigateToPage }) => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    console.log('📧 EmailChangeVerification component mounted');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Pathname:', window.location.pathname);
    console.log('🔍 Search:', window.location.search);
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    console.log('🎫 Token from URL:', token);

    if (!token) {
      console.error('❌ No token found in URL');
      setStatus('error');
      setMessage('No verification token found');
      return;
    }

    const verifyEmail = async () => {
      try {
        console.log('🚀 Starting email verification...');
        console.log('🌐 Backend URL:', BACKEND_URL);
        const url = `${BACKEND_URL}/api/auth/verify-email-change?token=${token}`;
        console.log('📍 Full API URL:', url);
        
        const response = await axios.get(url);
        
        console.log('✅ Verification response:', response.data);

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
          setNewEmail(response.data.new_email);

          console.log('✅ Email verified successfully! Redirecting in 3 seconds...');
          
          setTimeout(() => {
            console.log('🔄 Redirecting to profile...');
            if (navigateToPage) {
              navigateToPage('profile');
            } else {
              window.location.href = '/profile';
            }
          }, 3000);
        } else {
          console.warn('⚠️ Response success was false:', response.data);
          setStatus('error');
          setMessage('Verification failed');
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        console.error('❌ Error response:', error.response?.data);
        
        setStatus('error');
        setMessage(
          error.response?.data?.detail || 
          'Email verification failed. Please try again.'
        );

        setTimeout(() => {
          console.log('🔄 Redirecting to login...');
          if (navigateToPage) {
            navigateToPage('login');
          } else {
            window.location.href = '/login';
          }
        }, 3000);
      }
    };

    verifyEmail();
  }, [navigateToPage]);

  return (
    <div className="verify-email-page">
      <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <div className="verify-email-form-card" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "2rem", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "1.5rem" }}>
            Email Change Verification
          </h2>

          {status === 'loading' && (
            <div>
              <div style={{ margin: "2rem auto", width: "50px", height: "50px", border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
              <p style={{ color: "#475569", fontSize: "1rem" }}>Verifying your new email...</p>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: "0.5rem" }}>Please wait...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="info-icon" style={{ margin: "0 auto 1rem", width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #dcfce7, #bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803d" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "32px", height: "32px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p style={{ color: "#15803d", fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                {message}
              </p>
              <p style={{ color: "#475569", fontSize: "1rem", marginTop: "1rem" }}>
                Your new email: <strong>{newEmail}</strong>
              </p>
              <p style={{ marginTop: "1.5rem", color: "#475569", fontSize: "0.95rem" }}>
                Redirecting to your profile...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="info-icon" style={{ margin: "0 auto 1rem", width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #fee2e2, #fecaca)", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "32px", height: "32px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p style={{ color: "#dc2626", fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                {message}
              </p>
              <p style={{ marginTop: "1.5rem", color: "#475569", fontSize: "0.95rem" }}>
                Redirecting you to login page...
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmailChangeVerification;