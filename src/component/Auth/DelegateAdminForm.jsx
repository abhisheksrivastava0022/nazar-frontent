import React, { useState, useEffect, useRef } from 'react';
import { useSnackbar, SnackbarProvider } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import ApiClient from '../ApiClient';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const DelegateAdminForm = () => {
    const navigate = useNavigate();
    const { postFormDataApiwithLogin, getRequestApi, postRequestApiwithLogin } = ApiClient();
    const { enqueueSnackbar } = useSnackbar();
    const userData = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [errors, setErrors] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [delegateId, setDelegateId] = useState(null);

    // OTP Verification States
    const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
    const [showMobileOtpInput, setShowMobileOtpInput] = useState(false);

    // OTP arrays for 6 digits
    const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
    const [mobileOtp, setMobileOtp] = useState(['', '', '', '', '', '']);

    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpType, setOtpType] = useState(''); // 'email' or 'mobile'

    // Refs for OTP inputs
    const emailOtpRefs = useRef([]);
    const mobileOtpRefs = useRef([]);

    // Track which fields are pre-filled and should be read-only
    const [readOnlyFields, setReadOnlyFields] = useState({
        email: false,
        mobile: false
    });

    // State for countries, states, cities
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pin_code: '',
        country: '',
        company_name: '',
        department: '',
        profile_photo: null
    });

    // OTP Timer Effect
    useEffect(() => {
        let timer;
        if (otpTimer > 0) {
            timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpTimer]);

    // Main navigation and data loading useEffect
    useEffect(() => {
        if (userData?.data) {
            const data = userData.data;
            const details = data.delegate_other_details;

            if (details) {
                const event_edition_form = details.event_edition_form;

                // Set read-only fields from userlogin data
                if (data.userlogin?.email) {
                    setFormData(prev => ({ ...prev, email: data.userlogin?.email }));
                    setReadOnlyFields(prev => ({ ...prev, email: true }));
                    setIsEmailVerified(true); // Assume email is verified if from userlogin
                }
                if (data.userlogin?.mobile) {
                    setFormData(prev => ({ ...prev, mobile: data.userlogin?.mobile }));
                    setReadOnlyFields(prev => ({ ...prev, mobile: true }));
                    setIsMobileVerified(true); // Assume mobile is verified if from userlogin
                }

                // Status 1 - Form needs to be filled
                if (details.status === 1) {
                    if (event_edition_form?.type == 1) {
                        navigate("/delegate-registraion");
                        // Internal form - stay on this page to fill

                    } else if (event_edition_form?.type == 2) {
                        // External form - check if delegate data exists
                        const delegateData = data.delegate;
                        if (delegateData) {
                            setEditMode(true);
                            setDelegateId(delegateData.id);
                            setFormData({
                                first_name: delegateData.first_name || '',
                                last_name: delegateData.last_name || '',
                                email: delegateData.email || '',
                                mobile: delegateData.mobile || '',
                                gender: delegateData.gender || '',
                                address: delegateData.address || '',
                                city: delegateData.city ? String(delegateData.city) : '',
                                state: delegateData.state ? String(delegateData.state) : '',
                                pin_code: delegateData.pin_code || '',
                                country: delegateData.country ? String(delegateData.country) : '',
                                company_name: delegateData.company_name || '',
                                department: delegateData.department || '',
                                profile_photo: null
                            });

                            // Set verification status based on existing data
                            if (delegateData.email) {
                                setIsEmailVerified(true);
                                setReadOnlyFields(prev => ({ ...prev, email: true }));
                            }
                            if (delegateData.mobile) {
                                setIsMobileVerified(true);
                                setReadOnlyFields(prev => ({ ...prev, mobile: true }));
                            }

                            // Load states and cities if country exists
                            if (delegateData?.country) {
                                loadStates(String(delegateData.country));
                            }
                            if (delegateData?.state) {
                                loadCities(String(delegateData.state));
                            }
                        }
                    }
                }
                // Status 2 - Profile view
                else if (details.status === 2) {
                    if (event_edition_form?.type === 2) {
                        //   navigate("/profile-delegate");
                    } else {
                        navigate("/profile");
                    }
                }
            }
        }
    }, [userData, navigate]);

    // Load countries on component mount
    useEffect(() => {
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            setLoadingCountries(true);
            const countriesRes = await getRequestApi("delegate/country");
            if (countriesRes.status) {
                setCountries(countriesRes.data || []);
            }
        } catch (err) {
            console.error('Error loading countries:', err);
            enqueueSnackbar('Failed to load countries', { variant: 'error' });
        } finally {
            setLoadingCountries(false);
        }
    };

    const loadStates = async (countryId) => {
        if (!countryId) {
            setStates([]);
            setFormData(prev => ({ ...prev, state: '', city: '' }));
            setCities([]);
            return;
        }

        setLoadingStates(true);
        try {
            const statesRes = await getRequestApi(`delegate/state/${countryId}`);
            if (statesRes.status) {
                setStates(statesRes.data || []);
            }
        } catch (err) {
            console.error('Error loading states:', err);
            enqueueSnackbar('Failed to load states', { variant: 'error' });
        } finally {
            setLoadingStates(false);
        }
    };

    const loadCities = async (stateId) => {
        if (!stateId) {
            setCities([]);
            setFormData(prev => ({ ...prev, city: '' }));
            return;
        }

        setLoadingCities(true);
        try {
            const citiesRes = await getRequestApi(`delegate/city/${stateId}`);
            if (citiesRes.status) {
                setCities(citiesRes.data || []);
            }
        } catch (err) {
            console.error('Error loading cities:', err);
            enqueueSnackbar('Failed to load cities', { variant: 'error' });
        } finally {
            setLoadingCities(false);
        }
    };

    const handleCountryChange = (e) => {
        const countryId = e.target.value;
        setFormData(prev => ({
            ...prev,
            country: countryId,
            state: '',
            city: ''
        }));
        if (countryId) {
            loadStates(countryId);
        } else {
            setStates([]);
        }
        setCities([]);
    };

    const handleStateChange = (e) => {
        const stateId = e.target.value;
        setFormData(prev => ({
            ...prev,
            state: stateId,
            city: ''
        }));
        if (stateId) {
            loadCities(stateId);
        } else {
            setCities([]);
        }
    };

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setFormData(prev => ({
            ...prev,
            city: cityId
        }));
    };

    // Handle OTP input change for 6-digit boxes
    const handleOtpChange = (type, index, value) => {
        // Allow only digits
        if (value && !/^\d*$/.test(value)) return;

        const otpArray = type === 'email' ? [...emailOtp] : [...mobileOtp];

        // Take only the last character if multiple are pasted
        const newValue = value.slice(-1);
        otpArray[index] = newValue;

        if (type === 'email') {
            setEmailOtp(otpArray);
        } else {
            setMobileOtp(otpArray);
        }

        // Auto-focus next input if current field is filled
        if (newValue && index < 5) {
            const nextInput = type === 'email'
                ? emailOtpRefs.current[index + 1]
                : mobileOtpRefs.current[index + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    // Handle key down for backspace
    const handleOtpKeyDown = (type, index, e) => {
        if (e.key === 'Backspace') {
            const otpArray = type === 'email' ? [...emailOtp] : [...mobileOtp];

            if (!otpArray[index] && index > 0) {
                // If current field is empty and backspace pressed, focus previous field
                const prevInput = type === 'email'
                    ? emailOtpRefs.current[index - 1]
                    : mobileOtpRefs.current[index - 1];
                if (prevInput) {
                    prevInput.focus();
                }
            }
        }
    };

    // Handle paste for OTP
    const handleOtpPaste = (type, e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);

        if (digits.length > 0) {
            const otpArray = type === 'email' ? [...emailOtp] : [...mobileOtp];

            digits.forEach((digit, index) => {
                if (index < 6) {
                    otpArray[index] = digit;
                }
            });

            if (type === 'email') {
                setEmailOtp(otpArray);
                // Focus the next empty field or last field
                const nextIndex = Math.min(digits.length, 5);
                if (nextIndex < 6) {
                    const nextInput = emailOtpRefs.current[nextIndex];
                    if (nextInput) nextInput.focus();
                }
            } else {
                setMobileOtp(otpArray);
                const nextIndex = Math.min(digits.length, 5);
                if (nextIndex < 6) {
                    const nextInput = mobileOtpRefs.current[nextIndex];
                    if (nextInput) nextInput.focus();
                }
            }
        }
    };

    // Get OTP as string
    const getOtpString = (type) => {
        const otpArray = type === 'email' ? emailOtp : mobileOtp;
        return otpArray.join('');
    };

    // Send OTP for verification
    const sendOtp = async (type) => {
        const value = type === 'email' ? formData.email : formData.mobile;

        if (!value) {
            enqueueSnackbar(`Please enter ${type} first`, {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
            return;
        }

        // Validate email format
        if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            enqueueSnackbar('Please enter a valid email address', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
            return;
        }

        // Validate mobile number (basic validation)
        if (type === 'mobile' && value.length < 10) {
            enqueueSnackbar('Please enter a valid mobile number', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
            return;
        }

        setSendingOtp(true);
        setOtpType(type);

        try {
            const response = await postRequestApiwithLogin('delegate/send-otp', {
                [type]: value,
                type: type
            });

            if (response.status) {
                enqueueSnackbar(`OTP sent to your ${type}`, {
                    variant: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' }
                });

                // Show OTP input field
                if (type === 'email') {
                    setShowEmailOtpInput(true);
                    // Reset OTP fields
                    setEmailOtp(['', '', '', '', '', '']);
                    // Focus first input after a short delay
                    setTimeout(() => {
                        if (emailOtpRefs.current[0]) {
                            emailOtpRefs.current[0].focus();
                        }
                    }, 100);
                } else {
                    setShowMobileOtpInput(true);
                    setMobileOtp(['', '', '', '', '', '']);
                    setTimeout(() => {
                        if (mobileOtpRefs.current[0]) {
                            mobileOtpRefs.current[0].focus();
                        }
                    }, 100);
                }

                // Start 60 second timer
                setOtpTimer(60);
            } else {
                enqueueSnackbar(response.message || `Failed to send OTP to ${type}`, {
                    variant: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' }
                });
            }
        } catch (error) {
            console.error('OTP send error:', error);
            enqueueSnackbar(`Failed to send OTP. Please try again.`, {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
        } finally {
            setSendingOtp(false);
        }
    };

    // Verify OTP
    const verifyOtp = async (type) => {
        const otpString = getOtpString(type);
        const value = type === 'email' ? formData.email : formData.mobile;

        if (otpString.length < 6) {
            enqueueSnackbar('Please enter complete 6-digit OTP', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
            return;
        }

        setVerifyingOtp(true);

        try {
            const response = await postRequestApiwithLogin('delegate/verify-otp', {
                [type]: value,
                otp: otpString,
                type: type
            });

            if (response.status) {
                enqueueSnackbar(`${type} verified successfully`, {
                    variant: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' }
                });

                // Update verification status
                if (type === 'email') {
                    setIsEmailVerified(true);
                    setShowEmailOtpInput(false);
                    setEmailOtp(['', '', '', '', '', '']);

                    // Make email read-only after verification
                    setReadOnlyFields(prev => ({ ...prev, email: true }));
                } else {
                    setIsMobileVerified(true);
                    setShowMobileOtpInput(false);
                    setMobileOtp(['', '', '', '', '', '']);

                    // Make mobile read-only after verification
                    setReadOnlyFields(prev => ({ ...prev, mobile: true }));
                }
            } else {
                enqueueSnackbar(response.message || 'Invalid OTP', {
                    variant: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' }
                });
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            enqueueSnackbar('OTP verification failed. Please try again.', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
        } finally {
            setVerifyingOtp(false);
        }
    };

    // Cancel OTP verification
    const cancelOtpVerification = (type) => {
        if (type === 'email') {
            setShowEmailOtpInput(false);
            setEmailOtp(['', '', '', '', '', '']);
        } else {
            setShowMobileOtpInput(false);
            setMobileOtp(['', '', '', '', '', '']);
        }
        setOtpTimer(0);
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        // Don't allow changes to read-only fields
        if (readOnlyFields[name]) {
            return;
        }

        // Reset verification status if email or mobile is changed
        if (name === 'email' && !readOnlyFields.email) {
            setIsEmailVerified(false);
            setShowEmailOtpInput(false);
            setEmailOtp(['', '', '', '', '', '']);
        }
        if (name === 'mobile' && !readOnlyFields.mobile) {
            setIsMobileVerified(false);
            setShowMobileOtpInput(false);
            setMobileOtp(['', '', '', '', '', '']);
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else if (type === 'radio' || type === 'select-one') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';

        // Email validation with verification check
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        } else if (!isEmailVerified && !readOnlyFields.email) {
            newErrors.email = 'Please verify your email';
        }

        // Mobile validation with verification check
        if (!formData.mobile?.trim()) {
            newErrors.mobile = 'Mobile is required';
        } else if (!isMobileVerified && !readOnlyFields.mobile) {
            newErrors.mobile = 'Please verify your mobile number';
        }

        if (!formData.gender) newErrors.gender = 'Please select gender';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.city) newErrors.city = 'City is required';

        // Profile photo is required only for new delegates (not in edit mode)
        if (!editMode && !formData.profile_photo) {
            newErrors.profile_photo = 'Profile photo is required';
        }

        // Validate file type if photo is uploaded
        if (formData.profile_photo && formData.profile_photo instanceof File) {
            const validPhotoTypes = ['jpg', 'jpeg', 'png'];
            const fileExt = formData.profile_photo.name.split('.').pop().toLowerCase();
            if (!validPhotoTypes.includes(fileExt)) {
                newErrors.profile_photo = 'Only JPG, JPEG, PNG files are allowed';
            }

            // Check file size (max 2MB)
            if (formData.profile_photo.size > 2 * 1024 * 1024) {
                newErrors.profile_photo = 'File size must be less than 2MB';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            enqueueSnackbar('Please fix all errors before submitting', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Add all text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'profile_photo') {
                    if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });

            // Add delegate_id if in edit mode
            if (editMode && delegateId) {
                formDataToSend.append('delegate_id', delegateId);
            }

            // Add profile photo if uploaded
            if (formData.profile_photo && formData.profile_photo instanceof File) {
                formDataToSend.append('profile_photo', formData.profile_photo);
            }

            const response = await postFormDataApiwithLogin('delegate/delegate-admin-registration', formDataToSend);

            if (response.status) {
                enqueueSnackbar(
                    editMode ? 'Delegate updated successfully!' : 'Delegate created successfully!',
                    { variant: 'success' }
                );
                setTimeout(function () {
                    window.location.href = "/profile-delegate";
                }, 1000);

            } else {
                if (response?.errors) {
                    throw new Error(response?.errors[0].message || 'Operation failed');
                } else {
                    throw new Error(response.message || 'Operation failed');
                }

            }

        } catch (error) {
            console.error('Submission error:', error);

            let errorMessage = 'Operation failed. Please try again.';
            if (error.response?.status === 413) {
                errorMessage = 'File size too large. Please upload a smaller image.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid data. Please check your information.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Navigate back based on context
        if (userData?.delegate_other_details?.event_edition_form?.type === 2) {
            navigate('/profile-delegate');
        } else {
            navigate('/profile');
        }
    };

    if (loadingData) {
        return (
            <div className="container mt-5 text-center">
                <CircularProgress />
                <p className="mt-3">Loading delegate data...</p>
            </div>
        );
    }

    const styles = `
        .otp-input-container {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin: 15px 0;
        }
        .otp-input {
            width: 45px;
            height: 45px;
            text-align: center;
            font-size: 20px;
            font-weight: 600;
            border: 1px solid #ced4da;
            border-radius: 6px;
            background-color: white;
        }
        .otp-input:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
            outline: none;
        }
        .otp-input.is-invalid {
            border-color: #dc3545;
        }
        .otp-input-group {
            margin-top: 15px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 3px solid #0d6efd;
        }
        .verify-button {
            margin-left: 10px;
            white-space: nowrap;
        }
        .verified-badge {
            color: #198754;
            font-size: 14px;
            margin-left: 10px;
        }
    `;

    return (
        <div className="container mt-4 mb-5">
            <style>{styles}</style>
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10 col-xl-8">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white py-3">
                            <h4 className="mb-0">
                                {editMode ? 'Edit Delegate' : 'Apply for Delegate'}
                            </h4>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Personal Information */}
                                <h5 className="text-primary mb-3">Personal Information</h5>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="first_name" className="form-label">
                                            First Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                        />
                                        {errors.first_name && (
                                            <div className="invalid-feedback">{errors.first_name}</div>
                                        )}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="last_name" className="form-label">
                                            Last Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                        />
                                        {errors.last_name && (
                                            <div className="invalid-feedback">{errors.last_name}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email <span className="text-danger">*</span>
                                        </label>
                                        <div>
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="email"
                                                    className={`form-control ${errors.email ? 'is-invalid' : ''} ${readOnlyFields.email ? 'bg-light' : ''}`}
                                                    id="email"
                                                    name="email"
                                                    value={formData.email || ''}
                                                    onChange={handleChange}
                                                    readOnly={readOnlyFields.email}
                                                    style={readOnlyFields.email ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                                                />
                                                {!readOnlyFields.email && !isEmailVerified && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary ms-2 verify-button"
                                                        onClick={() => sendOtp('email')}
                                                        disabled={sendingOtp || !formData.email}
                                                    >
                                                        {sendingOtp && otpType === 'email' ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            'Verify'
                                                        )}
                                                    </button>
                                                )}
                                                {isEmailVerified && (
                                                    <span className="verified-badge">
                                                        <i className="bi bi-check-circle-fill text-success"></i> Verified
                                                    </span>
                                                )}
                                            </div>

                                            {/* 6-digit OTP Input for Email */}
                                            {showEmailOtpInput && (
                                                <div className="otp-input-group">
                                                    <label className="form-label text-center d-block">Enter 6-digit OTP sent to your email</label>
                                                    <div className="otp-input-container">
                                                        {emailOtp.map((digit, index) => (
                                                            <input
                                                                key={index}
                                                                ref={(el) => (emailOtpRefs.current[index] = el)}
                                                                type="text"
                                                                className={`otp-input ${errors.emailOtp ? "is-invalid" : ""}`}
                                                                value={digit}
                                                                onChange={(e) => handleOtpChange('email', index, e.target.value)}
                                                                onKeyDown={(e) => handleOtpKeyDown('email', index, e)}
                                                                onPaste={index === 0 ? (e) => handleOtpPaste('email', e) : undefined}
                                                                maxLength="1"
                                                                inputMode="numeric"
                                                                pattern="\d*"
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-success"
                                                            onClick={() => verifyOtp('email')}
                                                            disabled={verifyingOtp || getOtpString('email').length < 6}
                                                        >
                                                            {verifyingOtp && otpType === 'email' ? (
                                                                <CircularProgress size={20} />
                                                            ) : (
                                                                'Verify OTP'
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => cancelOtpVerification('email')}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                    <div className="text-center mt-2">
                                                        {otpTimer > 0 ? (
                                                            <small className="text-muted">Resend OTP in {otpTimer} seconds</small>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn btn-link p-0"
                                                                onClick={() => sendOtp('email')}
                                                                disabled={sendingOtp}
                                                            >
                                                                Resend OTP
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {errors.email && (
                                                <div className="invalid-feedback d-block">{errors.email}</div>
                                            )}
                                            {readOnlyFields.email && (
                                                <div className="form-text text-muted">
                                                    <small>Email cannot be changed</small>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="mobile" className="form-label">
                                            Mobile Number <span className="text-danger">*</span>
                                        </label>
                                        <div>
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="tel"
                                                    className={`form-control ${errors.mobile ? 'is-invalid' : ''} ${readOnlyFields.mobile ? 'bg-light' : ''}`}
                                                    id="mobile"
                                                    name="mobile"
                                                    value={formData.mobile || ''}
                                                    onChange={handleChange}
                                                    readOnly={readOnlyFields.mobile}
                                                    style={readOnlyFields.mobile ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                                                />
                                                {!readOnlyFields.mobile && !isMobileVerified && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary ms-2 verify-button"
                                                        onClick={() => sendOtp('mobile')}
                                                        disabled={sendingOtp || !formData.mobile}
                                                    >
                                                        {sendingOtp && otpType === 'mobile' ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            'Verify'
                                                        )}
                                                    </button>
                                                )}
                                                {isMobileVerified && (
                                                    <span className="verified-badge">
                                                        <i className="bi bi-check-circle-fill text-success"></i> Verified
                                                    </span>
                                                )}
                                            </div>

                                            {/* 6-digit OTP Input for Mobile */}
                                            {showMobileOtpInput && (
                                                <div className="otp-input-group">
                                                    <label className="form-label text-center d-block">Enter 6-digit OTP sent to your mobile</label>
                                                    <div className="otp-input-container">
                                                        {mobileOtp.map((digit, index) => (
                                                            <input
                                                                key={index}
                                                                ref={(el) => (mobileOtpRefs.current[index] = el)}
                                                                type="text"
                                                                className={`otp-input ${errors.mobileOtp ? "is-invalid" : ""}`}
                                                                value={digit}
                                                                onChange={(e) => handleOtpChange('mobile', index, e.target.value)}
                                                                onKeyDown={(e) => handleOtpKeyDown('mobile', index, e)}
                                                                onPaste={index === 0 ? (e) => handleOtpPaste('mobile', e) : undefined}
                                                                maxLength="1"
                                                                inputMode="numeric"
                                                                pattern="\d*"
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-success"
                                                            onClick={() => verifyOtp('mobile')}
                                                            disabled={verifyingOtp || getOtpString('mobile').length < 6}
                                                        >
                                                            {verifyingOtp && otpType === 'mobile' ? (
                                                                <CircularProgress size={20} />
                                                            ) : (
                                                                'Verify OTP'
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => cancelOtpVerification('mobile')}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                    <div className="text-center mt-2">
                                                        {otpTimer > 0 ? (
                                                            <small className="text-muted">Resend OTP in {otpTimer} seconds</small>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn btn-link p-0"
                                                                onClick={() => sendOtp('mobile')}
                                                                disabled={sendingOtp}
                                                            >
                                                                Resend OTP
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {errors.mobile && (
                                                <div className="invalid-feedback d-block">{errors.mobile}</div>
                                            )}
                                            {readOnlyFields.mobile && (
                                                <div className="form-text text-muted">
                                                    <small>Mobile number cannot be changed</small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Gender Field */}
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label d-block">
                                            Gender <span className="text-danger">*</span>
                                        </label>
                                        <div className="d-flex gap-4">
                                            <div className="form-check">
                                                <input
                                                    className={`form-check-input ${errors.gender ? 'is-invalid' : ''}`}
                                                    type="radio"
                                                    name="gender"
                                                    id="genderMale"
                                                    value="male"
                                                    checked={formData.gender === 'male'}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="genderMale">
                                                    Male
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className={`form-check-input ${errors.gender ? 'is-invalid' : ''}`}
                                                    type="radio"
                                                    name="gender"
                                                    id="genderFemale"
                                                    value="female"
                                                    checked={formData.gender === 'female'}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="genderFemale">
                                                    Female
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className={`form-check-input ${errors.gender ? 'is-invalid' : ''}`}
                                                    type="radio"
                                                    name="gender"
                                                    id="genderOther"
                                                    value="other"
                                                    checked={formData.gender === 'other'}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="genderOther">
                                                    Other
                                                </label>
                                            </div>
                                        </div>
                                        {errors.gender && (
                                            <div className="text-danger small mt-1">{errors.gender}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Address Information */}
                                <h5 className="text-primary mb-3 mt-4">Address Information</h5>

                                <div className="mb-3">
                                    <label htmlFor="address" className="form-label">Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="address"
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="country" className="form-label">
                                            Country <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.country ? 'is-invalid' : ''}`}
                                            id="country"
                                            name="country"
                                            value={formData.country || ''}
                                            onChange={handleCountryChange}
                                            disabled={loadingCountries}
                                        >
                                            <option value="">Select Country</option>
                                            {loadingCountries ? (
                                                <option disabled>Loading countries...</option>
                                            ) : (
                                                countries.map(country => (
                                                    <option key={country.id} value={country.id}>
                                                        {country.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        {errors.country && (
                                            <div className="invalid-feedback">{errors.country}</div>
                                        )}
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="state" className="form-label">
                                            State <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                                            id="state"
                                            name="state"
                                            value={formData.state || ''}
                                            onChange={handleStateChange}
                                            disabled={!formData.country || loadingStates}
                                        >
                                            <option value="">Select State</option>
                                            {loadingStates ? (
                                                <option disabled>Loading states...</option>
                                            ) : (
                                                states.map(state => (
                                                    <option key={state.id} value={state.id}>
                                                        {state.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        {errors.state && (
                                            <div className="invalid-feedback">{errors.state}</div>
                                        )}
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="city" className="form-label">
                                            City <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.city ? 'is-invalid' : ''}`}
                                            id="city"
                                            name="city"
                                            value={formData.city || ''}
                                            onChange={handleCityChange}
                                            disabled={!formData.state || loadingCities}
                                        >
                                            <option value="">Select City</option>
                                            {loadingCities ? (
                                                <option disabled>Loading cities...</option>
                                            ) : (
                                                cities.map(city => (
                                                    <option key={city.id} value={city.id}>
                                                        {city.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        {errors.city && (
                                            <div className="invalid-feedback">{errors.city}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="pin_code" className="form-label">Pin Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="pin_code"
                                            name="pin_code"
                                            value={formData.pin_code || ''}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="company_name" className="form-label">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="company_name"
                                            name="company_name"
                                            value={formData.company_name || ''}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="department" className="form-label">Department</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="department"
                                            name="department"
                                            value={formData.department || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Profile Photo */}
                                <h5 className="text-primary mb-3 mt-4">Profile Photo</h5>

                                <div className="mb-4">
                                    <label htmlFor="profile_photo" className="form-label">
                                        Profile Image {!editMode && <span className="text-danger">*</span>}
                                    </label>
                                    <input
                                        type="file"
                                        className={`form-control ${errors.profile_photo ? 'is-invalid' : ''}`}
                                        id="profile_photo"
                                        name="profile_photo"
                                        onChange={handleChange}
                                        accept=".jpg,.jpeg,.png"
                                    />
                                    {errors.profile_photo && (
                                        <div className="invalid-feedback">{errors.profile_photo}</div>
                                    )}
                                    <div className="form-text">
                                        Allowed formats: JPG, JPEG, PNG. Max size: 2MB
                                    </div>
                                    {formData.profile_photo && formData.profile_photo instanceof File && (
                                        <div className="mt-2">
                                            <span className="badge bg-success">
                                                Selected: {formData.profile_photo.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <CircularProgress size={20} color="inherit" className="me-2" />
                                                {editMode ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            editMode ? 'Update Delegate' : 'Create Delegate'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Wrapper component for Snackbar provider
const DelegateAdminFormWithSnackbar = () => {
    return (
        <SnackbarProvider maxSnack={3}>
            <DelegateAdminForm />
        </SnackbarProvider>
    );
};

export default DelegateAdminFormWithSnackbar;