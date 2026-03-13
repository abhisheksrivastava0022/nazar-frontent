import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";

const CustomSnackbar = ({ alertData, setAlertData }) => {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertData((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar
      sx={{ zIndex: "999999" }}
      open={alertData.open}
      message={alertData.message}
      anchorOrigin={{
        vertical: alertData.anchorVertical || "top",
        horizontal: alertData.anchorHorizontal || "center",
      }}
      ContentProps={{ sx: { bgcolor: alertData.color } }}
      TransitionComponent={(props) => (
        <Slide {...props} direction={alertData.direction || "up"} />
      )}
      autoHideDuration={3000}
      onClose={handleClose}
    />
  );
};

export default CustomSnackbar;
