import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import CustomSnackbar from "../library/CustomSnackbar";

import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Container,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  alpha,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  Lock,
  HowToReg,
  ArrowBack,
} from "@mui/icons-material";
import ApiClient from "../ApiClient";
const VITE_APP_GOOGLE_CAPTCHA = `${import.meta.env.VITE_APP_GOOGLE_CAPTCHA}`;

const Registration = () => {
  const navigate = useNavigate();
  const captchaRef = useRef(null);
  const { postRequestApi } = ApiClient()
  const [alertData, setAlertData] = useState({
    open: false,
    message: "",
    color: "",
    direction: "up",
    anchorVertical: "top",
    anchorHorizontal: "center",
  });

  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    company: "",

    address: "",
    captcha: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.first_name.trim())
      newErrors.first_name = "Enter your first name";
    if (!formData.last_name.trim())
      newErrors.last_name = "Enter your last name";

    if (!formData.email.trim()) newErrors.email = "Enter your email";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Enter a valid email";

    if (!formData.phone.trim()) newErrors.phone = "Enter your mobile number";
    else if (formData.phone.length !== 10)
      newErrors.phone = "Must be 10 digits";

    // if (!formData.company.trim()) newErrors.company = "Enter your company name";

    if (!formData.address.trim()) newErrors.address = "Enter your address";

    if (!formData.captcha) newErrors.captcha = "Please complete the CAPTCHA.";

    if (!formData.password.trim()) newErrors.password = "Enter password";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";

    if (formData.password !== formData.password_confirmation)
      newErrors.password_confirmation = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCaptchaChange = (value) => {
    setCaptcha(value);
    setFormData((prev) => ({ ...prev, captcha: value }));
    setErrors((prev) => ({ ...prev, captcha: "" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setAlertData({
        open: true,
        message: "Please fill all required fields correctly.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        company: formData.company,
        address: formData.address,
      };

      const res = await postRequestApi(
        `event/delegateRegister`,
        payload
      );

      if (res?.status) {
        if (res?.message) {
          setAlertData({
            open: true,
            message:
              res?.message ||
              "Registration successful! Please check your email for verification.",
            color: "green",
          });
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        let errorMessage = "Registration failed. Please try again.";

        // Handle nested errors structure
        if (res?.error?.errors && Array.isArray(res.error.errors)) {
          // Extract error messages from the errors array
          const errorMessages = res.error.errors.map((err) => err.message);
          errorMessage = errorMessages.join(", ");
        }
        // Alternative: check for direct errors array in response
        else if (res?.errors && Array.isArray(res.errors)) {
          const errorMessages = res.errors.map((err) => err.message);
          errorMessage = errorMessages.join(", ");
        }
        // Handle string error
        else if (res?.error) {
          errorMessage =
            typeof res.error === "string"
              ? res.error
              : JSON.stringify(res.error);
        }
        // Handle other common patterns
        else if (res?.message) {
          errorMessage = res.message;
        } else if (res?.Message) {
          errorMessage = res.Message;
        } else if (res?.data?.message) {
          errorMessage = res.data.message;
        }

        setAlertData({
          open: true,
          message: errorMessage,
          color: "red",
        });
      }
    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";

      // Handle nested errors structure
      if (res?.error?.errors && Array.isArray(res.error.errors)) {
        // Extract error messages from the errors array
        const errorMessages = res.error.errors.map((err) => err.message);
        errorMessage = errorMessages.join(", ");
      }
      // Alternative: check for direct errors array in response
      else if (res?.errors && Array.isArray(res.errors)) {
        const errorMessages = res.errors.map((err) => err.message);
        errorMessage = errorMessages.join(", ");
      }
      // Handle string error
      else if (res?.error) {
        errorMessage =
          typeof res.error === "string" ? res.error : JSON.stringify(res.error);
      }
      // Handle other common patterns
      else if (res?.message) {
        errorMessage = res.message;
      } else if (res?.Message) {
        errorMessage = res.Message;
      } else if (res?.data?.message) {
        errorMessage = res.data.message;
      }

      setAlertData({
        open: true,
        message: errorMessage,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />


      <Box className="main">


        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4} justifyContent="center">
            {/* Right Column - Registration Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                elevation={6}
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
                        // bgcolor: "primary.main",
                        bgcolor: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <HowToReg sx={{ fontSize: 40, color: "white" }} />
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      // color="primary"
                      gutterBottom
                    >
                      Create Account
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Fill in your details to get started
                    </Typography>
                  </Box>

                  {/* Form */}
                  <form onKeyPress={handleKeyPress}>
                    <Stack spacing={3}>
                      {/* Name Fields */}
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="First Name"
                            name="first_name"
                            fullWidth
                            required
                            value={formData.first_name}
                            onChange={handleChange}
                            error={!!errors.first_name}
                            helperText={errors.first_name}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person color="action" />
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
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Last Name"
                            name="last_name"
                            fullWidth
                            required
                            value={formData.last_name}
                            onChange={handleChange}
                            error={!!errors.last_name}
                            helperText={errors.last_name}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person color="action" />
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
                        </Grid>
                      </Grid>

                      {/* Contact Fields */}
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Email Address"
                            name="email"
                            type="email"
                            fullWidth
                            required
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email color="action" />
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
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Phone Number"
                            name="phone"
                            fullWidth
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            inputProps={{ maxLength: 10 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone color="action" />
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
                        </Grid>
                      </Grid>

                      {/* Company Fields */}
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 12 }}>
                          <TextField
                            label="Company Name"
                            name="company"
                            fullWidth

                            value={formData.company}
                            onChange={handleChange}
                            error={!!errors.company}
                            helperText={errors.company}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Business color="action" />
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
                        </Grid>

                      </Grid>

                      {/* Address */}
                      <TextField
                        label="Address"
                        name="address"
                        fullWidth
                        required
                        multiline
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        error={!!errors.address}
                        helperText={errors.address}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn color="action" />
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

                      {/* Password Fields */}
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Password"
                            name="password"
                            fullWidth
                            required
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={
                              errors.password || "Minimum 6 characters"
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
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
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            label="Confirm Password"
                            name="password_confirmation"
                            fullWidth
                            required
                            type={showConfirm ? "text" : "password"}
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            error={!!errors.password_confirmation}
                            helperText={errors.password_confirmation}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    edge="end"
                                    size="small"
                                  >
                                    {showConfirm ? (
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
                        </Grid>
                      </Grid>

                      {/* CAPTCHA */}
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <ReCAPTCHA
                            ref={captchaRef}
                            sitekey={VITE_APP_GOOGLE_CAPTCHA}
                            onChange={handleCaptchaChange}
                          />
                        </Box>
                        {errors.captcha && (
                          <Typography
                            color="error"
                            variant="body2"
                            sx={{ mt: 1, textAlign: "center" }}
                          >
                            {errors.captcha}
                          </Typography>
                        )}
                      </Box>

                      {/* Register Button */}
                      <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        size="large"
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: "25px",
                          textTransform: "none",
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          // background:
                          //   "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          // boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.2)",
                          // "&:hover": {
                          //   boxShadow: "0 6px 20px 0 rgba(0, 0, 0, 0.3)",
                          // },
                          // "&:disabled": {
                          //   background:
                          //     "linear-gradient(135deg, #cccccc 0%, #aaaaaa 100%)",
                          // },
                          backgroundColor: "#BEA460",
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} sx={{ color: "#fff" }} />
                        ) : (
                          <>
                            <HowToReg sx={{ mr: 1 }} />
                            Create Account
                          </>
                        )}
                      </Button>
                    </Stack>
                  </form>

                  {/* Divider */}
                  <Divider sx={{ my: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already Registered?
                    </Typography>
                  </Divider>

                  {/* Login Link */}
                  <Box textAlign="center">
                    <Button
                      component={Link}
                      to="/login"
                      fullWidth
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        borderRadius: "25px",
                        px: 4,
                        // borderColor: "primary.main",
                        borderColor: "#1d3f8a",
                        color: "#1d3f8a",
                        "&:hover": {
                          borderColor: "primary.dark",
                          backgroundColor: alpha("#667eea", 0.08),
                        },
                      }}
                    >
                      Sign In to Existing Account
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

      </Box>
    </>
  );
};

export default Registration;
