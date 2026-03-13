import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  CircularProgress,
  Grid,
  Paper,
  Fade,
  IconButton,
  Container,
  Card,
  CardContent,
  Divider,
  Alert,
  Stack,
  alpha,
} from "@mui/material";
import { Link } from "react-router-dom";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Login as LoginIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  TheaterComedy as TheaterIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";



import CustomSnackbar from "../library/CustomSnackbar";
import ApiClient from "../ApiClient";
import CustomGoogleLogin from "../CustomGoogleLogin";
const VITE_APP_GOOGLE_CAPTCHA = `${import.meta.env.VITE_APP_GOOGLE_CAPTCHA}`;

const SignIn = () => {
  const { postRequestApi } = ApiClient();
  const captchaRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [alertData, setAlertData] = useState({
    open: false,
    message: "",
    color: "success",
    direction: "up",
    anchorVertical: "top",
    anchorHorizontal: "right",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captcha: "",
  });
  const [errors, setErrors] = useState({});
  const [captcha, setCaptcha] = useState(null);

  const message = location.state?.message;

  useState(() => {
    if (message) {
      setAlertData({
        open: true,
        message: message,
        color: "info",
        anchorVertical: "top",
        anchorHorizontal: "center",
      });
    }
  }, [message]);

  const onSuccessGoogle = async (data) => {

    const response = await postRequestApi(
      `event/delegateLogin/google`,
      data
    );

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
          navigate("/");
        }, 1000);

      }
    }
    console.log('Login successful:', data);
  }
  const onErrorGoogle = (data) => {
    console.log('Login failed:', data);

  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCaptchaChange = (cap) => {
    setCaptcha(cap);
    setFormData((prev) => ({ ...prev, captcha: cap }));
    setErrors((prev) => ({ ...prev, captcha: "" }));
  };

  const validate = () => {
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      validationErrors.email = "Enter your email address.";
    } else if (!emailRegex.test(formData.email)) {
      validationErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      validationErrors.password = "Enter your password.";
    }
    if (!formData.captcha) {
      validationErrors.captcha = "Please complete the CAPTCHA.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    setLoading(true);

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
        captchaResponse: captcha,
      };
      const response = await postRequestApi(
        `event/delegateLogin`,
        loginData
      );

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
            navigate("/");
          }, 1000);

        }
      } else {
        if (captchaRef.current) captchaRef.current.reset();
        setCaptcha(null);
        setFormData((prev) => ({ ...prev, captcha: "" }));
        setAlertData({
          open: true,
          message: response?.message || "Invalid email or password.",
          color: "red",
          anchorVertical: "top",
          anchorHorizontal: "right",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      if (captchaRef.current) captchaRef.current.reset();
      setCaptcha(null);

      setAlertData({
        open: true,
        message: "Network error. Please check your connection and try again.",
        color: "red",
        anchorVertical: "top",
        anchorHorizontal: "right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

  const signup = () => navigate("/registration");
  const ForgotPass = () => navigate("/forget-password");

  const baseUrl = import.meta.env.VITE_APP_HOME_URL;

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />


      <Box className="main common-form ">
        <Box className="pt-3 login-hero-section">

        </Box>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={0} justifyContent="center">

            <Grid
              item
              xs={12}
              md={8}
              lg={6}
            >
              <Fade in timeout={500}>
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
                          bgcolor: "#000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        <LoginIcon sx={{ fontSize: 40, color: "white" }} />
                      </Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        // color="primary"
                        gutterBottom
                      >
                        Access Your Account
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Enter your email address to access your account
                      </Typography>
                    </Box>

                    {/* Form */}
                    <form onSubmit={handleLogin} onKeyPress={handleKeyPress}>
                      <Stack spacing={3}>
                        {/* Email Field */}
                        <TextField
                          label="Email Address"
                          name="email"
                          type="email"
                          required
                          fullWidth
                          variant="outlined"
                          value={formData.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          autoFocus
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
                              "&:hover": {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "primary.main",
                                },
                              },
                            },
                          }}
                        />

                        {/* Password Field */}
                        <TextField
                          label="Password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          fullWidth
                          required
                          variant="outlined"
                          value={formData.password}
                          onChange={handleChange}
                          error={!!errors.password}
                          helperText={errors.password}
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
                                    setShowPassword((prev) => !prev)
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
                              "&:hover": {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "primary.main",
                                },
                              },
                            },
                          }}
                        />

                        {/* CAPTCHA */}
                        <Box sx={{ mt: 2 }}>
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
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

                        {/* Login Button */}
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          onClick={handleLogin}
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
                            // background: "info.light",
                            backgroundColor: "#BEA460",
                          }}
                        >
                          {loading ? (
                            <CircularProgress
                              size={24}
                              sx={{ color: "#fff" }}
                            />
                          ) : (
                            <>
                              <LoginIcon sx={{ mr: 1 }} />
                              Sign In
                            </>
                          )}
                        </Button>
                      </Stack>
                    </form>

                    {/* Links */}
                    <Box sx={{ mt: 4 }}>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Grid item>
                          <Button
                            onClick={signup}
                            sx={{
                              textTransform: "none",
                              // color: "primary.main",
                              color: "#1d3f8a",
                              fontWeight: 600,
                              "&:hover": {
                                backgroundColor: alpha("#667eea", 0.08),
                              },
                            }}
                          >
                            Don't have an account? Sign Up
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            onClick={ForgotPass}
                            sx={{
                              textTransform: "none",
                              // color: "primary.main",
                              color: "#1d3f8a",
                              fontWeight: 600,
                              "&:hover": {
                                backgroundColor: alpha("#667eea", 0.08),
                              },
                            }}
                          >
                            Forgot Password?
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box textAlign="center">

                      <Button
                        component={Link}
                        to="/login-otp"
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
                        Login with OTP
                      </Button>
                    </Box>
                    {/* Divider */}
                    <Divider sx={{ my: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>

                    {/* Continue without login */}
                    <Box textAlign="center">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        Don't want to create an account?
                      </Typography>
                      <Divider sx={{ my: 2 }}></Divider>
                      <CustomGoogleLogin onSuccess={onSuccessGoogle} onError={onErrorGoogle} />
                      <Divider sx={{ my: 2 }}></Divider>
                      <Button
                        component={Link}
                        to="/"
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
                        Continue without login
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
        </Container>

      </Box>
    </>
  );
};

export default SignIn;
