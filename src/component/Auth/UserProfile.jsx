import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,

  Business,
  LocationOn,
  Lock,
  HowToReg,
  ArrowBack,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

import CustomSnackbar from "../library/CustomSnackbar";
import ApiClient from "../ApiClient";

const UserProfile = () => {
  const navigate = useNavigate();
  const { getRequestApiwithLogin, postRequestApiwithLogin } = ApiClient();
  // Snackbar state
  const [alertData, setAlertData] = useState({
    open: false,
    message: "",
    color: "",
    direction: "up",
    anchorVertical: "top",
    anchorHorizontal: "center",
  });

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    company_name: "",

    captcha: "",
  });

  useEffect(() => {
    fetchdata();
  }, []);
  const fetchdata = async () => {
    const res = await getRequestApiwithLogin(`event/profile`);
    if (res.status) {
      setFormData(res.data);
    }
  };

  const [errors, setErrors] = useState({});

  // Validate inputs
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.first_name) newErrors.first_name = "Enter your first name";

    if (!formData.last_name) newErrors.last_name = "Enter your last name";

    if (!formData.email) newErrors.email = "Enter your email";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Enter a valid email";

    if (!formData.mobile) newErrors.mobile = "Enter your mobile number";
    else if (formData.mobile.length !== 10)
      newErrors.mobile = "Must be 10 digits";

    if (!formData.company_name) newErrors.company_name = "Enter your company_name name";


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format mobile number - remove non-numeric characters
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Submit handler with enhanced error handling
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
      // Prepare data for API - matching your table structure
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password, // Backend should hash this
        company_name: formData.company_name,

      };

      const res = await postRequestApiwithLogin(`event/profile`, payload);

      // Handle different response formats
      if (res.status) {
        setAlertData({
          open: true,
          message: res?.message || "",
          color: "green",
        });
        setTimeout(() => navigate("/"), 2000);
      } else {
        // Handle API validation errors
        let errorMessage = "Registration failed. Please try again.";

        if (res?.errors) {
          // Handle backend validation errors (Laravel-style)
          const errorMessages = Object.values(res.errors).flat();
          errorMessage = errorMessages.join(", ");
        } else if (res?.error) {
          // Handle error object
          errorMessage =
            typeof res.error === "string"
              ? res.error
              : JSON.stringify(res.error);
        } else if (res?.message) {
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
      console.error("Registration error:", err);

      let errorMessage = "Something went wrong. Please try again later.";

      // Handle axios error structure
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessage = errorMessages.join(", ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
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

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />


      <Box className="main">

        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Card
            elevation={6}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
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
                  <HowToReg sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  // color="primary"
                  gutterBottom
                >
                  Update Account details
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Fill in your details to get started
                </Typography>
              </Box>

              <Stack spacing={3}>
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
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      disabled
                      label="Email"
                      name="email"
                      type="email"
                      fullWidth
                      value={formData.email}
                    // onChange={handleChange}
                    // error={!!errors.email}
                    // helperText={errors.email}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Mobile Number"
                      name="mobile"
                      fullWidth
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      error={!!errors.mobile}
                      helperText={errors.mobile}
                      inputProps={{ maxLength: 10 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Company Name"
                      name="company_name"
                      fullWidth
                      required
                      value={formData.company_name}
                      onChange={handleChange}
                      error={!!errors.company_name}
                      helperText={errors.company_name}
                    />
                  </Grid>



                  <Grid size={{ xs: 12, md: 12 }}>
                    <Button
                      type="button"
                      fullWidth
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
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
                        <CircularProgress size={24} sx={{ color: "#121212" }} />
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Container>

      </Box>
    </>
  );
};

export default UserProfile;
