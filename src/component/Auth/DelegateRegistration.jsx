import React, { useState, useEffect, useRef } from 'react';
import { useSnackbar, SnackbarProvider } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import ApiClient from '../ApiClient';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const DelegateRegistration = () => {
    const navigate = useNavigate();
    const { postFormDataApiwithLogin, getRequestApi, postRequestApiwithLogin } = ApiClient();
    const { enqueueSnackbar } = useSnackbar();
    const userData = useSelector((state) => state.user);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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
        phone: false,
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
        // Personal Details
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pin_code: '',
        country: '',
        mobile: '',
        notes: '',
        company_name: '',
        department: '',

        // Professional Details
        professionType: '',
        jobTitle: '',
        company: '',
        industry: '',
        yearsOfExperience: '',
        educationLevel: '',
        university: '',

        // Documents
        resume: null,
        coverLetter: null,
        photo: null,

        // Terms
        agreeToTerms: false
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
                    if (event_edition_form?.type === 2) {
                        navigate("/delegate-form");
                    } else if (event_edition_form?.type === 1) {
                        // Load existing delegate data if available
                        const delegateData = details.details || data.delegate;
                        if (delegateData) {
                            setFormData(prev => ({
                                ...prev,
                                ...delegateData,
                                country: delegateData?.country ? String(delegateData.country) : '',
                                city: delegateData?.city ? String(delegateData.city) : '',
                                state: delegateData?.state ? String(delegateData.state) : '',
                                gender: delegateData?.gender || '',
                                email: delegateData?.email || data.userlogin?.email || '',
                                phone: delegateData?.phone || data.userlogin?.phone || '',
                                mobile: delegateData?.mobile || data.userlogin?.mobile || ''
                            }));

                            // Load states and cities if country exists
                            if (delegateData?.country) {
                                loadStates(String(delegateData.country));
                            }
                            if (delegateData?.state) {
                                loadCities(String(delegateData.state));
                            }
                        } else {
                            // Pre-fill with userlogin data if no delegate data exists
                            setFormData(prev => ({
                                ...prev,
                                email: data.userlogin?.email || '',
                                mobile: data.userlogin?.mobile || ''
                            }));
                        }
                    }
                }
                // Status 2 - Profile view
                else if (details.status === 2) {
                    if (event_edition_form?.type === 2) {
                        navigate("/profile-delegate");
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
            enqueueSnackbar('Failed to load countries', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
        } finally {
            setLoadingCountries(false);
        }
    };

    // Load states based on country
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
            enqueueSnackbar('Failed to load states', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
        } finally {
            setLoadingStates(false);
        }
    };

    // Load cities based on state
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
            enqueueSnackbar('Failed to load cities', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
        } finally {
            setLoadingCities(false);
        }
    };

    // Handle country change
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

    // Handle state change
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

    // Handle city change
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
            console.log({
                [type]: value,
                type: type
            })
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

    const validateStep = (stepNumber) => {
        const newErrors = {};

        if (stepNumber === 1) {
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

            if (!formData.mobile?.trim()) {
                newErrors.mobile = 'Mobile is required';
            } else if (!isMobileVerified && !readOnlyFields.mobile) {
                newErrors.mobile = 'Please verify your mobile number';
            }

            if (!formData.gender) newErrors.gender = 'Please select your gender';
            if (!formData.country) newErrors.country = 'Country is required';
            if (!formData.state) newErrors.state = 'State is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.pin_code?.trim()) newErrors.pin_code = 'ZIP/Pin code is required';

            if (formData.dob) {
                const dob = new Date(formData.dob);
                const today = new Date();
                if (dob >= today) newErrors.dob = 'Date of birth must be in the past';
            }
        }

        if (stepNumber === 2) {
            if (!formData.professionType) newErrors.professionType = 'Please select a profession type';
            if (!formData.jobTitle?.trim()) newErrors.jobTitle = 'Job title is required';
            if (!formData.company?.trim()) newErrors.company = 'Company/Organization is required';
        }

        if (stepNumber === 3) {
            if (!formData.resume) newErrors.resume = 'Resume/CV is required';
            if (formData.resume && formData.resume instanceof File) {
                const validResumeTypes = ['pdf', 'doc', 'docx'];
                const fileExt = formData.resume.name.split('.').pop().toLowerCase();
                if (!validResumeTypes.includes(fileExt)) {
                    newErrors.resume = 'Only PDF, DOC, DOCX files are allowed';
                }
                if (formData.resume.size > 5 * 1024 * 1024) {
                    newErrors.resume = 'File size must be less than 5MB';
                }
            }

            if (formData.photo && formData.photo instanceof File) {
                const validPhotoTypes = ['jpg', 'jpeg', 'png'];
                const fileExt = formData.photo.name.split('.').pop().toLowerCase();
                if (!validPhotoTypes.includes(fileExt)) {
                    newErrors.photo = 'Only JPG, JPEG, PNG files are allowed';
                }
                if (formData.photo.size > 2 * 1024 * 1024) {
                    newErrors.photo = 'File size must be less than 2MB';
                }
            }

            if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

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

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'radio') {
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

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            enqueueSnackbar('Please fix the errors before proceeding', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
        }
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(3)) {
            enqueueSnackbar('Please fix all errors before submitting', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            Object.keys(formData).forEach(key => {
                if (key !== 'resume' && key !== 'coverLetter' && key !== 'photo') {
                    if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });

            if (formData.resume && formData.resume instanceof File) {
                formDataToSend.append('resume', formData.resume);
            }
            if (formData.coverLetter && formData.coverLetter instanceof File) {
                formDataToSend.append('coverLetter', formData.coverLetter);
            }
            if (formData.photo && formData.photo instanceof File) {
                formDataToSend.append('photo', formData.photo);
            }

            const response = await postFormDataApiwithLogin('delegate/delegate-registration', formDataToSend);

            if (response.status) {
                enqueueSnackbar('Registration submitted successfully!', {
                    variant: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' }
                });

                setTimeout(function () {
                    window.location.href = "/profile";
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

            let errorMessage = 'Submission failed. Please try again.';

            if (error.response) {
                const status = error.response.status;
                if (status === 413) {
                    errorMessage = 'File size too large. Please upload smaller files.';
                } else if (status === 400) {
                    errorMessage = 'Invalid data. Please check your information.';
                } else if (status === 401 || status === 403) {
                    errorMessage = 'Authentication required. Please login again.';
                } else if (status === 429) {
                    errorMessage = 'Too many requests. Please try again later.';
                } else if (status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            enqueueSnackbar(errorMessage, {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 6000
            });
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = ['Personal Details', 'Professional Details', 'Documents & Terms'];
    const stepCount = 3;

    const renderStepIndicator = () => (
        <div className="step-indicator-container mb-5">
            <style jsx>{`
                .step-indicator-wrapper {
                    position: relative;
                    padding: 20px 0;
                }
                .step-indicator-item {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                    flex: 0 0 auto;
                }
                .step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #e9ecef;
                    border: 2px solid #dee2e6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #6c757d;
                    margin: 0 auto 8px;
                    position: relative;
                    transition: all 0.3s ease;
                }
                .step-circle.active {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                    color: white;
                }
                .step-check {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background-color: #198754;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }
                .step-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #6c757d;
                    white-space: nowrap;
                }
                .step-label.active {
                    color: #0d6efd;
                }
                .step-label-mobile {
                    font-size: 12px;
                    color: #6c757d;
                }
                .step-line {
                    flex: 1;
                    height: 2px;
                    background-color: #dee2e6;
                    margin: 0 10px;
                    position: relative;
                    top: -20px;
                    z-index: 1;
                }
                .step-line.active {
                    background-color: #0d6efd;
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease;
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .bg-gradient-primary {
                    background: linear-gradient(45deg, #0d6efd, #0b5ed7);
                }
                .form-professional {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    padding: 10px 0;
                }
                .form-professional-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    min-width: 150px;
                }
                .border-danger {
                    border: 1px solid #dc3545;
                    border-radius: 5px;
                    padding: 10px;
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
                .otp-input-group {
                    margin-top: 15px;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    border-left: 3px solid #0d6efd;
                }
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
                .otp-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                    justify-content: center;
                }
            `}</style>

            <div className="step-indicator-wrapper">
                <div className="d-flex justify-content-between align-items-center position-relative">
                    {[1, 2, 3].map((stepNumber) => (
                        <React.Fragment key={stepNumber}>
                            <div className="step-indicator-item">
                                <div className={`step-circle ${step >= stepNumber ? 'active' : ''}`}>
                                    {stepNumber}
                                    {step > stepNumber && (
                                        <span className="step-check">✓</span>
                                    )}
                                </div>
                                <div className={`step-label d-none d-md-block ${step >= stepNumber ? 'active' : ''}`}>
                                    {stepTitles[stepNumber - 1]}
                                </div>
                                <div className="step-label-mobile d-md-none">
                                    Step {stepNumber}
                                </div>
                            </div>
                            {stepNumber < 3 && (
                                <div className={`step-line ${step > stepNumber ? 'active' : ''}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="step-content animate-slide-in">
            <h3 className="mb-4 text-primary">Personal Details</h3>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="first_name" className="form-label">First Name *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                    {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="last_name" className="form-label">Last Name *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                    {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <div>
                        <div className="d-flex align-items-center">
                            <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''} ${readOnlyFields.email ? 'bg-light' : ''}`}
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                readOnly={readOnlyFields.email}
                                style={readOnlyFields.email ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                                required
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
                                <div className="otp-actions">
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

                        {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                        {readOnlyFields.email && (
                            <div className="form-text text-muted">
                                <small>Email cannot be changed</small>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''} ${readOnlyFields.phone ? 'bg-light' : ''}`}
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        readOnly={readOnlyFields.phone}
                        style={readOnlyFields.phone ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    {readOnlyFields.phone && (
                        <div className="form-text text-muted">
                            <small>Phone number cannot be changed</small>
                        </div>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="mobile" className="form-label">Mobile Number *</label>
                    <div>
                        <div className="d-flex align-items-center">
                            <input
                                type="tel"
                                className={`form-control ${errors.mobile ? 'is-invalid' : ''} ${readOnlyFields.mobile ? 'bg-light' : ''}`}
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, ''); // remove non-digits
                                    if (value.length <= 10) {
                                        handleChange({
                                            target: {
                                                name: "mobile",
                                                value: value
                                            }
                                        });
                                    }
                                }}
                                inputMode="numeric"
                                pattern="[0-9]{10}"
                                maxLength={10}
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
                                <div className="otp-actions">
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

                        {errors.mobile && <div className="invalid-feedback d-block">{errors.mobile}</div>}
                        {readOnlyFields.mobile && (
                            <div className="form-text text-muted">
                                <small>Mobile number cannot be changed</small>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="dob" className="form-label">Date of Birth</label>
                    <input
                        type="date"
                        className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                    />
                    {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                </div>
            </div>

            {/* Gender Field */}
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label d-block">Gender *</label>
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
                    {errors.gender && <div className="text-danger small mt-1">{errors.gender}</div>}
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="address" className="form-label">Address *</label>
                <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                />
            </div>

            <div className="row">
                <div className="col-md-4 mb-3">
                    <label htmlFor="country" className="form-label">Country *</label>
                    <select
                        className={`form-select ${errors.country ? 'is-invalid' : ''}`}
                        id="country"
                        name="country"
                        value={formData.country}
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
                    {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                </div>

                <div className="col-md-4 mb-3">
                    <label htmlFor="state" className="form-label">State *</label>
                    <select
                        className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                        id="state"
                        name="state"
                        value={formData.state}
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
                    {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                </div>

                <div className="col-md-4 mb-3">
                    <label htmlFor="city" className="form-label">City *</label>
                    <select
                        className={`form-select ${errors.city ? 'is-invalid' : ''}`}
                        id="city"
                        name="city"
                        value={formData.city}
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
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                </div>
            </div>

            <div className="row">
                <div className="col-md-4 mb-3">
                    <label htmlFor="pin_code" className="form-label">ZIP/Pin Code *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.pin_code ? 'is-invalid' : ''}`}
                        id="pin_code"
                        name="pin_code"
                        value={formData.pin_code}
                        onChange={handleChange}
                        required
                    />
                    {errors.pin_code && <div className="invalid-feedback">{errors.pin_code}</div>}
                </div>

                <div className="col-md-4 mb-3">
                    <label htmlFor="company_name" className="form-label">Company Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
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
                        value={formData.department}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="notes" className="form-label">Additional Notes</label>
                <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                ></textarea>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="step-content animate-slide-in">
            <h3 className="mb-4 text-primary">Professional Details</h3>

            <div className="row mb-4">
                <div className="col-12">
                    <label className="form-label d-block">Applied for *</label>
                    <div className={`d-flex flex-wrap gap-3 ${errors.professionType ? 'border-danger p-3 rounded' : ''}`}>
                        {['Industry', 'Academia', 'Government', 'Non-Profit Organization', 'Student', 'Individual/Visitor'].map((type) => (
                            <div key={type} className="form-check">
                                <input
                                    id={`profession-${type}`}
                                    type="radio"
                                    value={type}
                                    name="professionType"
                                    checked={formData.professionType === type}
                                    onChange={handleChange}
                                    className="form-check-input"
                                />
                                <label htmlFor={`profession-${type}`} className="form-check-label">
                                    {type}
                                </label>
                            </div>
                        ))}
                    </div>
                    {errors.professionType && <div className="text-danger small mt-1">{errors.professionType}</div>}
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="jobTitle" className="form-label">Job Title *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.jobTitle ? 'is-invalid' : ''}`}
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        required
                    />
                    {errors.jobTitle && <div className="invalid-feedback">{errors.jobTitle}</div>}
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="company" className="form-label">Company/Organization *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.company ? 'is-invalid' : ''}`}
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                    />
                    {errors.company && <div className="invalid-feedback">{errors.company}</div>}
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="industry" className="form-label">Industry</label>
                    <select
                        className="form-select"
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                    >
                        <option value="">Select Industry</option>
                        <option value="IT">Information Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="yearsOfExperience" className="form-label">Years of Experience</label>
                    <select
                        className="form-select"
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                    >
                        <option value="">Select Experience</option>
                        <option value="0-2">0-2 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="6-10">6-10 years</option>
                        <option value="10+">10+ years</option>
                    </select>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="educationLevel" className="form-label">Highest Education Level</label>
                    <select
                        className="form-select"
                        id="educationLevel"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleChange}
                    >
                        <option value="">Select Education</option>
                        <option value="High School">High School</option>
                        <option value="Bachelor's">Bachelor's Degree</option>
                        <option value="Master's">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="university" className="form-label">University/Institution</label>
                    <input
                        type="text"
                        className="form-control"
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="step-content animate-slide-in">
            <h3 className="mb-4 text-primary">Document Upload</h3>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Resume/CV *</h5>
                    <p className="card-text">Upload your resume or CV (PDF, DOC, DOCX, max 5MB)</p>
                    <div className="mb-3">
                        <input
                            type="file"
                            className={`form-control ${errors.resume ? 'is-invalid' : ''}`}
                            id="resume"
                            name="resume"
                            onChange={handleChange}
                            accept=".pdf,.doc,.docx"
                        />
                        {errors.resume && <div className="invalid-feedback d-block">{errors.resume}</div>}
                        {formData.resume && formData.resume instanceof File && (
                            <div className="mt-2">
                                <span className="badge bg-success">Selected: {formData.resume.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Cover Letter</h5>
                    <p className="card-text">Upload your cover letter (PDF, DOC, DOCX, max 5MB)</p>
                    <div className="mb-3">
                        <input
                            type="file"
                            className="form-control"
                            id="coverLetter"
                            name="coverLetter"
                            onChange={handleChange}
                            accept=".pdf,.doc,.docx"
                        />
                        {formData.coverLetter && formData.coverLetter instanceof File && (
                            <div className="mt-2">
                                <span className="badge bg-success">Selected: {formData.coverLetter.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Profile Photo</h5>
                    <p className="card-text">Upload a professional photo (JPG, JPEG, PNG, max 2MB)</p>
                    <div className="mb-3">
                        <input
                            type="file"
                            className={`form-control ${errors.photo ? 'is-invalid' : ''}`}
                            id="photo"
                            name="photo"
                            onChange={handleChange}
                            accept=".jpg,.jpeg,.png"
                        />
                        {errors.photo && <div className="invalid-feedback d-block">{errors.photo}</div>}
                        {formData.photo && formData.photo instanceof File && (
                            <div className="mt-2">
                                <span className="badge bg-success">Selected: {formData.photo.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="form-check mt-4">
                <input
                    className={`form-check-input ${errors.agreeToTerms ? 'is-invalid' : ''}`}
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="agreeToTerms">
                    I agree to the terms and conditions and confirm that all information provided is accurate.
                </label>
                {errors.agreeToTerms && <div className="invalid-feedback d-block">{errors.agreeToTerms}</div>}
            </div>
        </div>
    );

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-12 col-xl-12">
                    <div className="card border-0">
                        <div className="card-header bg-primary text-white py-4">
                            <h1 className="text-center mb-0">Delegate Registration</h1>
                            <p className="text-center mb-0 opacity-75">Complete all sections to submit your application</p>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            {renderStepIndicator()}

                            <form onSubmit={handleSubmit}>
                                {step === 1 && renderStep1()}
                                {step === 2 && renderStep2()}
                                {step === 3 && renderStep3()}

                                <div className="d-flex justify-content-between mt-5 pt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={prevStep}
                                        disabled={step === 1}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>Previous
                                    </button>

                                    {step < 3 ? (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={nextStep}
                                        >
                                            Next <i className="bi bi-arrow-right ms-2"></i>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={loading || !formData.agreeToTerms}
                                        >
                                            {loading ? (
                                                <>
                                                    <CircularProgress size={20} color="inherit" className="me-2" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle me-2"></i>Submit Application
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="card-footer bg-light py-3">
                            <div className="text-center text-muted small">
                                <i className="bi bi-shield-check me-1"></i>
                                Your information is secure and will not be shared with third parties.
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <div className="progress" style={{ height: '4px' }}>
                            <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${(step / stepCount) * 100}%` }}
                                aria-valuenow={(step / stepCount) * 100}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                        <p className="text-muted mt-2">Step {step} of {stepCount} - {stepTitles[step - 1]}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Wrapper component for Snackbar provider
const DelegateRegistrationWithSnackbar = () => {
    return (
        <SnackbarProvider maxSnack={3}>
            <DelegateRegistration />
        </SnackbarProvider>
    );
};

export default DelegateRegistrationWithSnackbar;