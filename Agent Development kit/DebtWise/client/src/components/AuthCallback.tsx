import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('AuthCallback: Processing OAuth callback');
      console.log('Current URL:', window.location.href);
      
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      console.log('Token:', token);
      console.log('Error:', error);

      if (error) {
        console.error('Authentication error:', error);
        setStatus(`Authentication failed: ${error}`);
        setTimeout(() => {
          navigate('/login?error=' + error);
        }, 2000);
        return;
      }

      if (token) {
        setStatus('Storing authentication token...');
        // Store the JWT token
        localStorage.setItem('authToken', token);
        console.log('Token stored in localStorage');
        
        setStatus('Fetching user information...');
        // Fetch user info before redirecting
        const success = await fetchUserInfo(token);
        
        if (success) {
          setStatus('Authentication complete! Redirecting...');
          console.log('Redirecting to dashboard');
          
          // Dispatch custom event to refresh auth state
          window.dispatchEvent(new CustomEvent('auth-refresh'));
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          setStatus('Failed to fetch user information');
          setTimeout(() => {
            navigate('/login?error=fetch_user_failed');
          }, 2000);
        }
      } else {
        console.error('No token received from authentication');
        setStatus('No authentication token received');
        setTimeout(() => {
          navigate('/login?error=no_token');
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  const fetchUserInfo = async (token: string): Promise<boolean> => {
    try {
      const backendURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      console.log('Fetching user info from:', `${backendURL}/auth/me`);
      
      const response = await fetch(`${backendURL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('User info response status:', response.status);

      if (response.ok) {
        const userInfo = await response.json();
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('User authenticated:', userInfo);
        return true;
      } else {
        console.error('Failed to fetch user info, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      return false;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 2s linear infinite'
      }}></div>
      <p>{status}</p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AuthCallback;