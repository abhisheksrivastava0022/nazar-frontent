import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { postRequestLocal } from "../../../API/Local";
import HeroSection from "../../Web/LandingPage/HeroSection";
import Footer from "../../Web/HeaderFooter/Footer";

const AuthChangePassword = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error", // 'error', 'success', 'warning', 'info'
  });

  // Validation errors
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Old password validation
    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = "Old password is required";
      isValid = false;
    }
    // else if (formData.oldPassword.length < 6) {
    //   newErrors.oldPassword = 'Old password must be at least 6 characters';
    //   isValid = false;
    // }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    }
    // else if (formData.newPassword.length < 8) {
    //   newErrors.newPassword = 'Password must be at least 8 characters';
    //   isValid = false;
    // } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
    //   newErrors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
    //   isValid = false;
    // }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Check if new password is same as old password
    if (
      formData.oldPassword &&
      formData.newPassword &&
      formData.oldPassword === formData.newPassword
    ) {
      newErrors.newPassword = "New password cannot be same as old password";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Show snackbar
  const showSnackbar = (message, severity = "error") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      showSnackbar("Please fix the errors in the form", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await postRequestLocal(
        `nfdc-web-api/post/client/change-password`,
        formData
      );

      if (response.status) {
        // Success
        showSnackbar("Password changed successfully!", "success");

        // Reset form
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Optional: Redirect after success
        setTimeout(() => {
          navigate("/update-profile"); // or wherever you want to redirect
        }, 1000);
      } else {
        // Handle API errors
        const errorMessage = response.message || "Failed to change password";
        showSnackbar(errorMessage, "error");
      }
    } catch (error) {
      console.error("Change password error:", error);
      showSnackbar("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel/back
  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <>
      <section className="main">
        <section className="login-hero-section">
          <HeroSection />
        </section>
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <LockIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your current password and set a new one
              </Typography>
            </Box>

            {/* Password Requirements Info */}
            {/* <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Password Requirements:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Minimum 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>Cannot be same as old password</li>
            </ul>
          </Typography>
        </Alert> */}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Old Password */}
                <TextField
                  fullWidth
                  name="oldPassword"
                  label="Old Password"
                  type={showPassword.oldPassword ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={handleChange}
                  error={!!errors.oldPassword}
                  helperText={errors.oldPassword}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            togglePasswordVisibility("oldPassword")
                          }
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword.oldPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* New Password */}
                <TextField
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type={showPassword.newPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  disabled={loading}
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
                            togglePasswordVisibility("newPassword")
                          }
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword.newPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Confirm Password */}
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
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
                            togglePasswordVisibility("confirmPassword")
                          }
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword.confirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    size="large"
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                  >
                    {loading ? "Changing Password..." : "Change Password"}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>

        <Footer />
      </section>
    </>
  );
};

export default AuthChangePassword;
