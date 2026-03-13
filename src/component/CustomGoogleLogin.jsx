// CustomGoogleLogin.jsx - SIMPLIFIED
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import ApiClient from './ApiClient';
import { useNavigate, useParams } from 'react-router-dom';

const CustomGoogleLogin = ({
    clientId = "971097898307-69jqfc505ll2thab5uokru1mdmf5h96s.apps.googleusercontent.com",
    onSuccess,
    onError,
    buttonText = "Sign in with Google",
    style = {}
}) => {
    const { postRequestApi } = ApiClient();
    const { formname } = useParams();

    const navigate = useNavigate();
    const handleSuccess = async (credentialResponse) => {
        try {
            console.log('Google login successful:', credentialResponse);

            if (credentialResponse.credential) {
                // Decode the JWT token
                const base64Url = credentialResponse.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));


                // Optional: Send to your backend
                try {
                    const backendResponse = await postRequestApi('delegate/google', {
                        token: credentialResponse.credential,
                        formname
                    });


                    if (backendResponse?.status) {
                        const token = backendResponse?.access_token;

                        if (token) {
                            localStorage.setItem("token", token);
                            navigate("/profile");
                        }
                    }


                } catch (backendError) {
                    // Still call onSuccess with Google data if backend fails
                    if (onSuccess) {
                        onSuccess({
                            ...userData,
                            googleToken: credentialResponse.credential
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error processing Google login:', error);
            if (onError) onError(error);
        }
    };

    const handleError = () => {
        console.error('Google login failed');
        if (onError) onError(new Error('Google login failed'));
    };

    // If no clientId provided, show error
    if (!clientId) {
        return (
            <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
                Error: Google Client ID is required
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div style={style}>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap={false}
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                />
            </div>
        </GoogleOAuthProvider>
    );
};

export default CustomGoogleLogin;