import React from 'react';
import './GoogleLoginButton.css';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  onSuccess, 
  className = '' 
}) => {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const backendURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    window.location.href = `${backendURL}/auth/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className={`google-login-button ${className}`}
      type="button"
    >
      <div className="google-icon">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
          />
          <path
            fill="#34A853"
            d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75 4.8 4.8 0 0 1-4.52-3.36H1.83v2.07A8.1 8.1 0 0 0 8.98 17z"
          />
          <path
            fill="#FBBC05"
            d="M4.26 10.71a4.8 4.8 0 0 1-.24-1.71c0-.59.09-1.17.24-1.71V5.22H1.83a8.1 8.1 0 0 0 0 7.56l2.43-2.07z"
          />
          <path
            fill="#EA4335"
            d="M8.98 4.24c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8.15 8.15 0 0 0 8.98 1 8.1 8.1 0 0 0 1.83 5.22L4.26 7.3A4.8 4.8 0 0 1 8.98 4.24z"
          />
        </svg>
      </div>
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;