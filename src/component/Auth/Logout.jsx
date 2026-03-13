import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import CustomSnackbar from "../../CustomSnackbar";

const Logout = () => {
  const navigate = useNavigate();

  // Snackbar state
  const [alertData, setAlertData] = useState({
    open: false,
    message: "",
    color: "",
    direction: "up",
    anchorVertical: "top",
    anchorHorizontal: "center",
  });

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userData");

    sessionStorage.clear(); // Clear session storage if used
    setAlertData({
      open: true,
      message: "You have been logged out successfully.",
      color: "green",
      direction: "up",
      anchorVertical: "top",
      anchorHorizontal: "center",
    });

    const timeout = setTimeout(() => {
      navigate("/", { replace: true });
    }, 100); // Redirect after 500ms

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        bgcolor="#fafafa"
      >
        <CircularProgress sx={{ color: "#b15171", mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          Logging you out...
        </Typography>
      </Box>
    </>
  );
};

export default Logout;
