import React, { useContext, useEffect } from 'react';
import './GoogleLogin.css';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../context/LoginContext';
import { toast } from 'react-toastify';

export default function GoogleLogin() {
    const navigate = useNavigate();
    const { setUserLogin } = useContext(LoginContext);

    // Function to handle Google login
    const handleGoogleLogin = () => {
        // Open Google OAuth in new window
        const googleAuthUrl = 'http://localhost:5000/auth/google';
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        const authWindow = window.open(
            googleAuthUrl,
            'Google Login',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
        
        if (!authWindow) {
            toast.error('Please allow popups for Google login');
            return;
        }
        
        // Focus the popup window
        authWindow.focus();
        
        // Listen for messages from popup
        const messageHandler = (event) => {
            // Only accept messages from our backend
            if (event.origin !== 'http://localhost:5000') return;
            
            console.log("Received message:", event.data);
            
            if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
                const { token, user } = event.data;
                
                // Store data in localStorage
                localStorage.setItem('jwt', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Update login state
                setUserLogin(true);
                
                // Show success message
                toast.success(`Welcome, ${user.name}!`);
                
                // Remove event listener
                window.removeEventListener('message', messageHandler);
                
                // Navigate to home
                navigate('/');
                
            } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
                toast.error(event.data.error || 'Authentication failed');
                window.removeEventListener('message', messageHandler);
            }
        };
        
        // Add event listener for messages
        window.addEventListener('message', messageHandler);
        
        // Check if popup was closed by user
        const popupCheckInterval = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(popupCheckInterval);
                window.removeEventListener('message', messageHandler);
                console.log("Popup closed by user");
            }
        }, 1000);
    };

    return (
        <div className="google-login-container">
            <button 
                className="google-login-btn" 
                onClick={handleGoogleLogin}
                type="button"
            >
                <FcGoogle size={20} />
                <span>Continue with Google</span>
            </button>
        </div>
    );
}