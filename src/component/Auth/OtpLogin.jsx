import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomSnackbar from "../library/CustomSnackbar";
import ApiClient from "../ApiClient";
import CustomGoogleLogin from "../CustomGoogleLogin";
import ReCAPTCHA from "react-google-recaptcha";

const OtpLogin = () => {
  let { formname = null } = useParams();

  const { postRequestApi, getRequestApi } = ApiClient();
  const navigate = useNavigate();

  const [alertData, setAlertData] = useState({
    open: false,
    message: "",
    color: "success",
    anchorVertical: "top",
    anchorHorizontal: "right",
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter mobile/email, 2: Enter OTP
  const [loginMethod, setLoginMethod] = useState("mobile"); // 'mobile' or 'email'
  const [timer, setTimer] = useState(0);
  const [formData, setFormData] = useState({
    mobile: "",
    email: "",
    otp: ["", "", "", "", "", ""],
  });
  const [errors, setErrors] = useState({});

  // Refs for OTP inputs
  const otpRefs = useRef([]);

  // Timer for OTP resend
  // useEffect(() => {
  //     let interval;
  //     if (timer > 0) {
  //         interval = setInterval(() => {
  //             setTimer((prev) => prev - 1);
  //         }, 1000);
  //     }
  //     return () => clearInterval(interval);
  // }, [timer]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // navigate("/"); //TODO
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMethodChange = (method) => {
    setLoginMethod(method);
    setFormData({ mobile: "", email: "", otp: ["", "", "", "", "", ""] });
    setErrors({});
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData((prev) => ({ ...prev, otp: newOtp }));
    setErrors((prev) => ({ ...prev, otp: "" }));

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP input keydown
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste event for OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setFormData((prev) => ({ ...prev, otp: newOtp }));
      otpRefs.current[5]?.focus();
    }
  };

  const validateStep1 = () => {
    const validationErrors = {};

    if (loginMethod === "mobile") {
      const mobileRegex = /^[0-9]{10}$/;
      if (!formData.mobile.trim()) {
        validationErrors.mobile = "Enter your mobile number.";
      } else if (!mobileRegex.test(formData.mobile)) {
        validationErrors.mobile = "Enter a valid 10-digit mobile number.";
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        validationErrors.email = "Enter your email address.";
      } else if (!emailRegex.test(formData.email)) {
        validationErrors.email = "Enter a valid email address.";
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const validateStep2 = () => {
    const validationErrors = {};
    const otpValue = formData.otp.join("");

    if (otpValue.length !== 6) {
      validationErrors.otp = "Please enter all 6 digits.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateStep1()) {
      return;
    }

    setLoading(true);
    try {
      const payload =
        loginMethod === "mobile"
          ? { mobile: formData.mobile }
          : { email: formData.email };

      const response = await postRequestApi(`request/generate-otp`, {
        ...payload,
        ...{ formname },
      });

      if (response?.status) {
        setAlertData({
          open: true,
          message: `OTP sent successfully! ${loginMethod === "mobile" ? "Check your SMS" : "Check your email"}`,
          color: "green",
          anchorVertical: "top",
          anchorHorizontal: "right",
        });
        // setTimer(60);
        setStep(2);
        // Focus first OTP input after a brief delay
        //setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setAlertData({
          open: true,
          message: response?.message || "Failed to send OTP.",
          color: "red",
          anchorVertical: "top",
          anchorHorizontal: "right",
        });
      }
    } catch (error) {
      console.error("OTP send error:", error);
      setAlertData({
        open: true,
        message: "Network error. Please try again.",
        color: "red",
        anchorVertical: "top",
        anchorHorizontal: "right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    try {
      const otpValue = formData.otp.join("");
      const payload = {
        formname,
        otp: otpValue,
        ...(loginMethod === "mobile"
          ? { mobile: formData.mobile }
          : { email: formData.email }),
      };

      const response = await postRequestApi(
        `request/verify-otp-login`,
        payload,
      );
      console.log({ response });
      if (response?.status) {
        const token = response?.access_token;
        const data = response?.data;

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("userData", JSON.stringify(data));

          setAlertData({
            open: true,
            message: "Login successful!",
            color: "green",
            anchorVertical: "top",
            anchorHorizontal: "right",
          });

          setTimeout(() => {
            navigate("/request/create");
          }, 1000);
        }
      } else {
        setAlertData({
          open: true,
          message: response?.message || "Invalid OTP.",
          color: "red",
          anchorVertical: "top",
          anchorHorizontal: "right",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setAlertData({
        open: true,
        message: "Network error. Please try again.",
        color: "red",
        anchorVertical: "top",
        anchorHorizontal: "right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    await handleSendOtp();
  };

  const handleBack = () => {
    setStep(1);
    setFormData((prev) => ({ ...prev, otp: ["", "", "", "", "", ""] }));
    setErrors({});
  };

  const goToPasswordLogin = () => {
    navigate("/login");
  };

  const signup = () => navigate("/registration");

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />
      <div className="login-bg">
        <div className="container mt-2 mb-5">
          <header class="d-flex py-3 mb-4 ">
            <div class="logo-header">
              <a href="/" class=" mb-3 mb-md-0  ">
                {" "}
                <img
                  src="/images/nazar-white.png"
                  alt="NAZAR"
                  class="img-fluid"
                />{" "}
              </a>
              <a
                href="https://mib.gov.in/"
                class=" mb-3 mb-md-0  "
                target="_blank"
              >
                {" "}
                <img
                  src="/images/mib-logo.svg"
                  alt="MIB"
                  class="img-fluid"
                />{" "}
              </a>
              <a
                href="https://www.nfdcindia.com/"
                class="mb-3 mb-md-0 "
                target="_blank"
              >
                {" "}
                <img
                  src="/images/logo1.png"
                  alt="NFDC"
                  class="second-logo"
                />{" "}
              </a>
            </div>
          </header>
          <div class="row align-items-center">
            <div class="col-md-6">
              <div class="content-div-text">
                <h1 style={{ fontSize: "55px" }}> NAZAR</h1>
                <span className="yellow-text" style={{ fontSize: "18px" }}>
                  <b>
                    National Anti-Piracy & Zero-Tolerance Action on Rights
                    Infringement
                  </b>
                </span>
                {/* <img src="/images/nazar-white.png" class=" text-logo" />  */}

                <p class="mt-3 ">
                  NAZAR is a national platform dedicated to combating digital
                  piracy by enabling structured reporting and swift removal of
                  unauthorized film and digital content links.
                </p>
              </div>
            </div>

            <div class="col-md-6">
              <div className="otp-card ">
                <div className="card-body p-4 p-md-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h2 style={{ fontSize: "25px" }} className="otp-title mb-2">
                      {step === 1
                        ? "Login to Register Complaint"
                        : "Verify OTP"}
                    </h2>
                    <p className="otp-subtitle text-muted">
                      {step === 1
                        ? "Enter your mobile number or email to receive OTP"
                        : `Enter the 6-digit OTP sent to your ${loginMethod === "mobile" ? "mobile" : "email"}`}
                    </p>
                  </div>

                  {/* Step 1: Enter Mobile/Email */}
                  {step === 1 ? (
                    <div className="step-1-container">
                      {/* Login Method Selection */}
                      <div className="login-method-selector mb-4">
                        <div className="btn-group w-100" role="group">
                          <button
                            type="button"
                            className={`btn method-btn ${loginMethod === "mobile" ? "active" : ""}`}
                            onClick={() => handleMethodChange("mobile")}
                          >
                            <i className="bi bi-phone me-2"></i>
                            Mobile
                          </button>
                          <button
                            type="button"
                            className={`btn method-btn ${loginMethod === "email" ? "active" : ""}`}
                            onClick={() => handleMethodChange("email")}
                          >
                            <i className="bi bi-envelope me-2"></i>
                            Email
                          </button>
                        </div>
                      </div>

                      {/* Input Field */}
                      <div className="mb-4">
                        {loginMethod === "mobile" ? (
                          <div className="form-group">
                            <div className="mb-3">
                              <label className="form-label">
                                Certificate Number / Application Number
                              </label>
                              <div className="input-group input-group-lg">
                                {/* <span className="input-group-text">
                                  <i className="bi bi-phone"></i>
                                </span> */}
                                <input
                                  type="text"
                                  className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                                  name="certificate_number"
                                  value={formData.certificate_number}
                                  onChange={handleChange}
                                  placeholder="Enter Your Certificate Number or Application Number"
                                  // maxLength="10"
                                  autoFocus
                                />
                                {errors.certificate_number && (
                                  <div className="invalid-feedback">
                                    {errors.certificate_number}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="form-label">
                                Mobile Number
                              </label>
                              <div className="input-group input-group-lg">
                                <span className="input-group-text">
                                  <i className="bi bi-phone"></i>
                                </span>
                                <input
                                  type="tel"
                                  className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                                  name="mobile"
                                  value={formData.mobile}
                                  onChange={handleChange}
                                  placeholder="Enter 10-digit mobile number"
                                  maxLength="10"
                                  autoFocus
                                />
                                {errors.mobile && (
                                  <div className="invalid-feedback">
                                    {errors.mobile}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="form-group">
                            <div className="mb-3">
                              <label className="form-label">
                                Certificate Number / Application Number
                              </label>
                              <div className="input-group input-group-lg">
                                {/* <span className="input-group-text">
                                  <i className="bi bi-phone"></i>
                                </span> */}
                                <input
                                  type="text"
                                  className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                                  name="certificate_number"
                                  value={formData.certificate_number}
                                  onChange={handleChange}
                                  placeholder="Enter Your Certificate Number or Application Number"
                                  // maxLength="10"
                                  autoFocus
                                />
                                {errors.certificate_number && (
                                  <div className="invalid-feedback">
                                    {errors.certificate_number}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="form-label">
                                Email Address
                              </label>
                              <div className="input-group input-group-lg">
                                <span className="input-group-text">
                                  <i className="bi bi-envelope"></i>
                                </span>
                                <input
                                  type="email"
                                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  placeholder="Enter your email address"
                                  autoFocus
                                />
                                {errors.email && (
                                  <div className="invalid-feedback">
                                    {errors.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="CAPTCHA">
                        <div className="text-center">
                          <ReCAPTCHA
                            // ref={captchaRef}
                            sitekey="6LdGG00rAAAAACZLHbrJGlxWWKZG0x8DuA9V0V6k" // Your site key
                            // onChange={handleCaptchaChange}
                          />
                        </div>
                      </div>
                      {errors.captcha && (
                        <Typography color="error" variant="body2">
                          {errors.captcha}
                        </Typography>
                      )}

                      {/* Send OTP Button */}
                      <button
                        className="btn btn-primary btn-lg w-100 send-otp-btn mt-3"
                        onClick={handleSendOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Send OTP
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Step 2: Enter OTP */
                    <div className="step-2-container">
                      {/* OTP Sent To Info */}
                      <div className="otp-sent-info mb-4">
                        <p className="text-muted mb-1 small">OTP sent to:</p>
                        <p className="fw-bold mb-0">
                          {loginMethod === "mobile"
                            ? `${formData.mobile}`
                            : formData.email}
                        </p>
                      </div>

                      {/* OTP Input Boxes */}
                      <div className="otp-input-container mb-3">
                        <div className="otp-inputs d-flex justify-content-center gap-2 gap-md-3">
                          {formData.otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => (otpRefs.current[index] = el)}
                              type="text"
                              className={`otp-input ${errors.otp ? "is-invalid" : ""}`}
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={index === 0 ? handleOtpPaste : undefined}
                              maxLength="1"
                              inputMode="numeric"
                              pattern="\d*"
                            />
                          ))}
                        </div>
                        {errors.otp && (
                          <div className="text-danger text-center mt-2 small">
                            {errors.otp}
                          </div>
                        )}
                      </div>

                      {/* Timer and Resend */}
                      {/* <div className="text-center mb-4">
                                                {timer > 0 ? (
                                                    <div className="timer-section">
                                                        <p className="text-muted mb-2">
                                                            OTP expires in: <span className="timer-text">{formatTimer(timer)}</span>
                                                        </p>
                                                        <button className="btn btn-link text-muted" disabled>
                                                            Resend OTP
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-muted mb-2">Didn't receive OTP?</p>
                                                        <button
                                                            className="btn btn-link resend-btn"
                                                            onClick={handleResendOtp}
                                                            disabled={loading}
                                                        >
                                                            <i className="bi bi-arrow-clockwise me-1"></i>
                                                            Resend OTP
                                                        </button>
                                                    </div>
                                                )}
                                            </div> */}

                      {/* Verify Button */}
                      <button
                        className="btn btn-success btn-lg w-100 verify-btn mb-3"
                        onClick={handleVerifyOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Verify & Login
                          </>
                        )}
                      </button>

                      {/* Back Button */}
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={handleBack}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  {/* <div className="divider my-4">
                                        <span>OR</span>
                                    </div>

                                    <div className="alternative-login">
                                        <CustomGoogleLogin />
                                    </div> */}
                  <div className="alternative-login">
                    <div className="text-center mt-3">
                      <p className="text-muted small">
                        <i className="bi bi-shield-check me-1"></i>
                        Your information is secured
                      </p>
                    </div>
                    {/* <button
                                            className="btn btn-outline-primary w-100 mb-3"
                                            onClick={goToPasswordLogin}
                                        >
                                            <i className="bi bi-key me-2"></i>
                                            Login with Password Instead
                                        </button> */}

                    {/* <div className="text-center">
                                            <p className="text-muted mb-0">
                                                Don't have an account?{" "}
                                                <button className="btn btn-link p-0 signup-link" onClick={signup}>
                                                    Sign Up
                                                </button>
                                            </p>
                                        </div> */}
                  </div>
                </div>
              </div>

              {/* Security Note */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OtpLogin;
