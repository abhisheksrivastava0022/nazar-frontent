import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  alpha,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Key as KeyIcon,
} from "@mui/icons-material"; //postRequestApi
import CustomSnackbar from "../library/CustomSnackbar";
import ApiClient from "../ApiClient";

function ForgotPassword() {
  const { postRequestApi } = ApiClient();
  const [alertData, setAlertData] = useState({
    open: false,
    message: "",
    color: "green",
    anchorVertical: "top",
    anchorHorizontal: "right",
  });

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleEmailSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      showAlert("Email address is required", "error");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      showAlert("Please enter a valid email address", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await postRequestApi(
        // "post/send-otp",
        `event/sendotpemail`,
        {
          email: email.trim(),
          type: "password_reset",
        }
      );

      if (response.status) {
        showAlert("OTP sent to your email!", "success");
        setStep(2);
        setOtpTimer(120); // 2 minutes timer
        setCanResend(false);
      } else {
        showAlert(
          response.message || "Failed to send OTP. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      showAlert("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      showAlert("Please enter the complete 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await postRequestApi(
        "event/verify-otp",
        {
          email: email.trim(),
          otp: otpString,
          type: "password_reset",
        }
      );

      if (response.success || response.status) {
        showAlert("OTP verified successfully!", "success");
        setStep(3);
      } else {
        showAlert(
          response.message || "Invalid OTP. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      showAlert("Failed to verify OTP. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await postRequestApi(
        "event/resend-otp",
        {
          email: email.trim(),
          type: "password_reset",
        }
      );

      if (response.success || response.status) {
        showAlert("New OTP sent to your email!", "success");
        setOtpTimer(120);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        showAlert(response.message || "Failed to resend OTP.", "error");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showAlert("Failed to resend OTP. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    // Validation
    if (!password.trim()) {
      showAlert("Password is required", "error");
      return;
    }
    if (password.length < 8) {
      showAlert("Password must be at least 8 characters long", "error");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await postRequestApi(
        "event/reset-password",
        {
          email: email.trim(),
          newPassword: password,
          confirmPassword: confirmPassword,
        }
      );

      if (response.success || response.status) {
        showAlert(
          "Password reset successfully! Redirecting to login...",
          "success"
        );
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        showAlert(response.message || "Failed to reset password.", "error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showAlert("Failed to reset password. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, color) => {
    setAlertData({
      open: true,
      message,
      color,
      anchorVertical: "top",
      anchorHorizontal: "right",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />

      <Box className="main">

        <Container maxWidth="md" sx={{ py: 8 }}>
          <Fade in timeout={500}>
            <Card
              elevation={6}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                {/* Header */}
                <Box textAlign="center" mb={4}>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      bgcolor: "#1d3f8a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <KeyIcon sx={{ fontSize: 40, color: "white" }} />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {step === 1 && "Reset Your Password"}
                    {step === 2 && "Verify OTP"}
                    {step === 3 && "Set New Password"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step === 1 && "Enter your email to receive OTP"}
                    {step === 2 && `Enter OTP sent to ${email}`}
                    {step === 3 && "Create a new secure password"}
                  </Typography>
                </Box>

                {/* Progress Indicator */}
                <Box sx={{ mb: 4 }}>
                  <Grid container justifyContent="center" spacing={2}>
                    {[1, 2, 3].map((stepNum) => (
                      <Grid item key={stepNum}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: step >= stepNum ? "#1d3f8a" : "grey.300",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: step >= stepNum ? "white" : "text.secondary",
                            fontWeight: "bold",
                            position: "relative",
                            "&::after":
                              stepNum < 3
                                ? {
                                  content: '""',
                                  position: "absolute",
                                  top: "50%",
                                  left: "100%",
                                  width: 40,
                                  height: 2,
                                  bgcolor:
                                    step > stepNum ? "#1d3f8a" : "grey.300",
                                }
                                : {},
                          }}
                        >
                          {step > stepNum ? <CheckCircleIcon /> : stepNum}
                        </Box>
                        <Typography
                          variant="caption"
                          display="block"
                          textAlign="center"
                          mt={1}
                        >
                          {stepNum === 1 && "Email"}
                          {stepNum === 2 && "OTP"}
                          {stepNum === 3 && "Password"}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Step 1: Email Input */}
                {step === 1 && (
                  <Stack spacing={3}>
                    <TextField
                      label="Email Address"
                      type="email"
                      fullWidth
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "white",
                        },
                      }}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleEmailSubmit()
                      }
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleEmailSubmit}
                      disabled={loading}
                      size="large"
                      sx={{
                        py: 1.5,
                        borderRadius: "12px",
                        textTransform: "none",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        backgroundColor: "info.light",
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: "#fff" }} />
                      ) : (
                        <>
                          <SendIcon sx={{ mr: 1 }} />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </Stack>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" textAlign="center" mb={2}>
                        Enter 6-digit OTP sent to your email
                      </Typography>
                      <Box display="flex" justifyContent="center" gap={2}>
                        {otp.map((digit, index) => (
                          <TextField
                            key={index}
                            inputRef={(ref) => (otpRefs.current[index] = ref)}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            inputProps={{
                              maxLength: 1,
                              style: { textAlign: "center" },
                            }}
                            sx={{
                              width: 50,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                backgroundColor: "white",
                              },
                            }}
                          />
                        ))}
                      </Box>

                      {/* Timer */}
                      {/* <Typography
                        variant="body2"
                        textAlign="center"
                        mt={2}
                        color={otpTimer > 0 ? "text.secondary" : "error"}
                      >
                        {otpTimer > 0
                          ? `Resend OTP in ${formatTime(otpTimer)}`
                          : "OTP expired"}
                      </Typography> */}
                    </Box>

                    <Stack direction="row" spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setStep(1)}
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                        }}
                      >
                        <ArrowBackIcon sx={{ mr: 1 }} />
                        Back
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={verifyOtp}
                        disabled={loading || otp.join("").length !== 6}
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                          backgroundColor: "info.light",
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} sx={{ color: "#fff" }} />
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </Stack>

                    {/* <Divider>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>

                    <Button
                      fullWidth
                      variant="text"
                      onClick={handleResendOtp}
                      disabled={!canResend || loading}
                      sx={{
                        textTransform: "none",
                        color: "#1d3f8a",
                      }}
                    >
                      Didn't receive OTP? Resend
                    </Button> */}
                  </Stack>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                  <Stack spacing={3}>
                    <TextField
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "white",
                        },
                      }}
                    />

                    <TextField
                      label="Confirm New Password"
                      type={showConfirmPassword ? "text" : "password"}
                      fullWidth
                      variant="outlined"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={
                        password !== confirmPassword && confirmPassword !== ""
                      }
                      helperText={
                        password !== confirmPassword && confirmPassword !== ""
                          ? "Passwords do not match"
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              size="small"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "white",
                        },
                      }}
                    />

                    <Alert severity="info" sx={{ borderRadius: "12px" }}>
                      Password must be at least 8 characters long
                    </Alert>

                    <Stack direction="row" spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setStep(2)}
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                        }}
                      >
                        <ArrowBackIcon sx={{ mr: 1 }} />
                        Back
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handlePasswordReset}
                        disabled={
                          loading ||
                          !password ||
                          !confirmPassword ||
                          password !== confirmPassword
                        }
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                          backgroundColor: "info.light",
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} sx={{ color: "#fff" }} />
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {/* Back to Login Link */}
                <Box textAlign="center" mt={4}>
                  <Button
                    onClick={() => navigate("/login")}
                    sx={{
                      textTransform: "none",
                      color: "#1d3f8a",
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: alpha("#667eea", 0.08),
                      },
                    }}
                  >
                    <ArrowBackIcon sx={{ mr: 1, fontSize: 20 }} />
                    Back to Login
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Container>


      </Box>
    </>
  );
}

export default ForgotPassword;
