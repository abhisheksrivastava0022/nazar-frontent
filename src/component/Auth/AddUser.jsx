import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Avatar,
  CardMedia,
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
  Phone,
  CameraAlt,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

import CustomSnackbar from "../library/CustomSnackbar";
import ApiClient from "../ApiClient";
const BASE_URL_API = `${import.meta.env.VITE_BASE_URL}/nfdc-web-api/`;

const AddUser = ({
  userData = {},
  onSave
}) => {


  const navigate = useNavigate();
  const { getRequestApiwithLogin, postRequestApiwithLogin, putRequestApiwithLogin } = ApiClient();

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
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    company_name: "",

    profile_image: "",

  });

  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (userData?.id) {
      loadUser();
    }

  }, [userData]);
  const loadUser = async () => {
    try {
      const res = await getRequestApiwithLogin(`event/team-member/${userData.id}`);
      if (res.status) {
        setFormData(res.data);
      }
    } catch (error) {

    } finally {

    }
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlertData({
          open: true,
          message: "Image size should be less than 5MB",
          color: "red",
        });
        return;
      }

      // Check file type
      if (!file.type.match('image.*')) {
        setAlertData({
          open: true,
          message: "Please upload an image file",
          color: "red",
        });
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    setFormData(prev => ({ ...prev, profile_image: "" }));
  };

  // Validate inputs
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.first_name.trim()) newErrors.first_name = "Enter your first name";
    if (!formData.last_name.trim()) newErrors.last_name = "Enter your last name";

    if (formData.email.trim()) {
      if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email"
    }
    if (formData.mobile.trim()) {
      if (formData.mobile.length !== 10) newErrors.mobile = "Must be 10 digits";
    }
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

  // Submit handler
  const postFormDataApiwithLogin = async (endpoint, formData) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${BASE_URL_API}${endpoint}`, {
        method: "POST",
        headers: {
          "Authorization": 'Bearer ' + token
          // DO NOT set Content-Type header for FormData
        },
        body: formData,
        credentials: "include",
      });

      if (response.status === 401) {
        // Handle unauthorized
        return;
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
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
      let res;

      if (profileImage) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('first_name', formData.first_name);
        formDataToSend.append('last_name', formData.last_name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('mobile', formData.mobile);
        formDataToSend.append('company_name', formData.company_name);
        formDataToSend.append('profile_image', profileImage);
        // DEBUG: Log FormData contents
        console.log('FormData contents:');
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0] + ': ', pair[1]);
        }
        if (!userData?.id) {
          res = await postFormDataApiwithLogin(`event/add-team-member`, formDataToSend);
        } else {
          res = await postFormDataApiwithLogin(`event/team-member/${userData?.id}/update`, formDataToSend);

        }
      } else {
        // Send as JSON without profile image
        const jsonData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          mobile: formData.mobile,
          company_name: formData.company_name,

        };

        if (!userData?.id) {
          res = await postRequestApiwithLogin(`event/add-team-member`, jsonData);
        } else {
          res = await postRequestApiwithLogin(`event/team-member/${userData?.id}/update`, jsonData);

        }
      }
      onSave()
      // Rest of your success/error handling...
    } catch (err) {
      // Error handling...
    }
  };

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={3}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <IconButton component={Link} to="/team" sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                {/* Add Team Member */}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={3}>
              {/* Profile Image Upload */}
              <Grid size={{ md: 12 }} >
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={profileImagePreview}
                    sx={{
                      width: 150,
                      height: 150,
                      border: '3px solid',
                      borderColor: 'primary.main',
                      mb: 2,
                    }}
                  >
                    <Person sx={{ fontSize: 60 }} />
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <CameraAlt />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </IconButton>
                </Box>
                {profileImagePreview && (
                  <Button
                    color="error"
                    size="small"
                    onClick={handleRemoveImage}
                    startIcon={<Cancel />}
                    sx={{ mt: 1 }}
                  >
                    Remove Image
                  </Button>
                )}
              </Grid>

              {/* First Name */}
              <Grid size={{ md: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
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
                  required
                />
              </Grid>

              {/* Last Name */}
              <Grid size={{ md: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
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
                  required
                />
              </Grid>

              {/* Email with Verification */}
              <Grid size={{ md: 6 }}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
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
                      endAdornment: emailVerified ? (
                        <InputAdornment position="end">
                          <CheckCircle color="success" />
                        </InputAdornment>
                      ) : null,
                    }}

                    disabled={emailVerified}
                  />

                </Box>

                {/* Verification Code Input */}

              </Grid>

              {/* Mobile */}
              <Grid size={{ md: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}

                />
              </Grid>

              {/* Company Name */}
              <Grid size={{ md: 6 }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  error={!!errors.company_name}
                  helperText={errors.company_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business color="action" />
                      </InputAdornment>
                    ),
                  }}

                />
              </Grid>


              {/* Action Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/team")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <HowToReg />}
                  >
                    {loading ? "Adding..." : "Add Team Member"}
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <span>
                  The verification email has been sent to your email ID. Please check and confirm for verification
                </span>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container >
    </>
  );
};

export default AddUser;