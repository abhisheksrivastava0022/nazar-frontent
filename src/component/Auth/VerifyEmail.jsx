import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  Fade,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import CustomSnackbar from "../library/CustomSnackbar";
import ApiClient from "../ApiClient";


const VerifyEmail = () => {
  const { postRequestApi } = ApiClient();
  const { token } = useParams();
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
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'success', 'error'

  const message = location.state?.message;

  // Show message from booking page if exists
  useEffect(() => {
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

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      const response = await postRequestApi(
        `event/verify-delegate/${token}`,
        {} // Pass empty object as body
      );

      if (response?.status) {
        const token = response?.access_token;
        if (token) {
          // Store token
          localStorage.setItem("token", token);
          localStorage.setItem("userData", JSON.stringify(response.data));

          setVerificationStatus("success");
          setAlertData({
            open: true,
            message: "Email verified and logged in successfully!",
            color: "success",
            anchorVertical: "top",
            anchorHorizontal: "right",
          });
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      } else {
        setVerificationStatus("error");
        if (response?.message) {
          setAlertData({
            open: true,
            message: response.message,
            color: "error",
            anchorVertical: "top",
            anchorHorizontal: "right",
          });
        } else {
          setAlertData({
            open: true,
            message:
              "Email verification failed. Link may be expired or invalid.",
            color: "error",
            anchorVertical: "top",
            anchorHorizontal: "right",
          });
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      setAlertData({
        open: true,
        message: "Network error. Please check your connection and try again.",
        color: "error",
        anchorVertical: "top",
        anchorHorizontal: "right",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger verification when component mounts with token
  useEffect(() => {
    if (token) {
      handleVerifyEmail();
    }
  }, [token]);

  // If no token, show error
  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 520,
            p: 4,
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Invalid Verification Link
          </Typography>
          <Typography variant="body1" paragraph>
            The verification link is invalid or has expired.
          </Typography>
          <Button variant="contained" component={Link} to="/" sx={{ mt: 2 }}>
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />


      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Fade in timeout={500}>
          <Paper
            elevation={6}
            sx={{
              width: "100%",
              maxWidth: 520,
              p: 4,
              borderRadius: 4,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              textAlign: "center",
            }}
          >


            <Typography
              variant="h4"
              fontWeight="bold"
              align="center"
              gutterBottom
              color="primary"
            >
              Email Verification
            </Typography>

            {/* Show booking summary if exists */}


            {verificationStatus === "success" && (
              <>
                <Alert severity="success" sx={{ my: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Email Verified Successfully!
                  </Typography>
                  <Typography variant="body2">
                    You have been automatically logged in. Redirecting...
                  </Typography>
                </Alert>
                <Box mt={2}>
                  <CircularProgress size={24} />
                </Box>
              </>
            )}

            {verificationStatus === "error" && (
              <>
                <Alert severity="error" sx={{ my: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Verification Failed
                  </Typography>
                  <Typography variant="body2">
                    The verification link is invalid or has expired.
                  </Typography>
                </Alert>
                <Box mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleVerifyEmail}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Try Again"}
                  </Button>
                  <Button variant="outlined" component={Link} to="/">
                    Go to Home
                  </Button>
                </Box>
              </>
            )}

            {!verificationStatus && !loading && (
              <Box my={3}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleVerifyEmail}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    px: 4,
                    backgroundColor: "#6a1e55",
                    "&:hover": {
                      backgroundColor: "#5a1845",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </Box>
            )}

            {/* Direct to home option */}
            <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid #e0e0e0" }}>
              <Typography variant="body2" color="textSecondary" align="center">
                <Link
                  to="/"
                  style={{
                    color: "#6a1e55",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  Go to Homepage
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </>
  );
};

export default VerifyEmail;
