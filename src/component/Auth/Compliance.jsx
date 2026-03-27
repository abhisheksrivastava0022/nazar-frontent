import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomSnackbar from "../library/CustomSnackbar";
import ApiClient from "../ApiClient";

const Compliance = () => {
    const { order_id } = useParams();
    let { formname = null } = useParams();
    const [data, setData] = useState([]);
    const { postRequestApi, getRequestApi } = ApiClient();
    const navigate = useNavigate();
    useEffect(() => {
        loadData();
    }, [order_id]);
    const loadData = async () => {
        const response = await getRequestApi(`request/loadCompliance/${order_id}`);
        if (response.status) {
            setData(response.data);
        } else {
            setAlertData({
                open: true,
                message: "Failed to load data.",
                color: "red",
                anchorVertical: "top",
                anchorHorizontal: "right",
            });
            setTimeout(() => {
                navigate("/");
            }, 2000);

        }
    }
    const [alertData, setAlertData] = useState({
        open: false,
        message: "",
        color: "success",
        anchorVertical: "top",
        anchorHorizontal: "right",
    });

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        comment: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const validationErrors = {};

        // Email validation (required)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            validationErrors.email = "Email address is required.";
        } else if (!emailRegex.test(formData.email)) {
            validationErrors.email = "Enter a valid email address.";
        }

        // Comment is optional - no validation needed

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                email: formData.email,
                comment: formData.comment || "", // Send empty string if no comment
                ...(formname && { formname }), // Add formname if exists
            };

            const response = await postRequestApi(`request/compliance/${order_id}`, payload);

            if (response?.status) {
                setAlertData({
                    open: true,
                    message: "Feedback submitted successfully!",
                    color: "green",
                    anchorVertical: "top",
                    anchorHorizontal: "right",
                });

                // Reset form
                setFormData({
                    email: "",
                    comment: "",
                });

                // Optional: redirect after success
                // setTimeout(() => {
                //     navigate("/thank-you");
                // }, 1500);
            } else {
                setAlertData({
                    open: true,
                    message: response?.message || "Failed to submit feedback.",
                    color: "red",
                    anchorVertical: "top",
                    anchorHorizontal: "right",
                });
            }
        } catch (error) {
            console.error("Feedback submission error:", error);
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

    return (
        <>
            <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />

            <div className="login-bg1">
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

                    <div className="row align-items-center">
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

                        <div className="col-md-6">
                            <div className="otp-card">
                                <div className="card-body p-4 p-md-5">
                                    {/* Header */}
                                    <div className="text-center mb-4">
                                        <h2 className="otp-title mb-2" style={{ fontSize: "25px" }}>
                                            Regulatory Compliance Form
                                        </h2>
                                        <p className="otp-subtitle text-muted">
                                            Submit required details to support enforcement of anti-piracy regulations and ensure swift action against unauthorized digital content.
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <div className="feedback-form">
                                        {/* Email Field (Required) */}
                                        <div className="mb-4">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Email Address <span className="text-danger">*</span>
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

                                        {/* Comment Field (Optional) */}
                                        <div className="mb-4">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Comment <span className="text-muted">(Optional)</span>
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <i className="bi bi-chat-text"></i>
                                                    </span>
                                                    <textarea
                                                        className={`form-control ${errors.comment ? "is-invalid" : ""}`}
                                                        name="comment"
                                                        value={formData.comment}
                                                        onChange={handleChange}
                                                        placeholder="additional Comment"
                                                        rows="4"
                                                        style={{ resize: "vertical" }}
                                                    />
                                                    {errors.comment && (
                                                        <div className="invalid-feedback">
                                                            {errors.comment}
                                                        </div>
                                                    )}
                                                </div>
                                                <small className="text-muted">
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    Your Compliance request helps us serve you better
                                                </small>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            className="btn btn-primary btn-lg w-100 submit-btn"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-send me-2"></i>
                                                    Submit Compliance
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Security Note */}
                                    <div className="alternative-login">
                                        <div className="text-center mt-3">
                                            <p className="text-muted small">
                                                <i className="bi bi-shield-check me-1"></i>
                                                Your feedback is anonymous and secure
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="curve-icon">
                                    <img src="images/icon-img-corner.png" alt="corner" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Compliance;