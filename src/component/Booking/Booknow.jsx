import React, { useEffect, useState } from 'react'
import ApiClient from '../ApiClient'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Alert,
    CircularProgress,
    Box
} from '@mui/material'
import { useSelector } from 'react-redux';

const Booknow = ({ show, setDatarefresh, datarefresh }) => {

    const { postRequestApiwithLogin } = ApiClient();
    const [data, setData] = useState(0);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [removingLoading, setRemovingLoading] = useState(false);
    const [delegate_accredation, setDelegate_accredation] = useState(null);
    const userData = useSelector((state) => state.user);

    useEffect(() => {
        if (userData?.data) {
            const data = userData.data;
            const delegate_accredation = data.delegate_accredation;
            setDelegate_accredation(delegate_accredation)
        }
    }, [userData]);

    // Snackbar states
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // 'success', 'error', 'warning', 'info'
    });

    // Confirmation dialog states
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        action: null, // 'book' or 'remove'
        onConfirm: null
    });

    const user_id = 1000;

    useEffect(() => {
        if (show.id) {
            datacheck();
        }
    }, [show])

    const datacheck = async () => {
        setLoading(true);
        try {
            const response = await postRequestApiwithLogin("delegate/checkbookingstatus", { user_id, show_id: show.id });
            if (response.status) {
                setData(response.data);
            } else {
                showSnackbar(response.message || 'Failed to check booking status', 'error');
            }
        } catch (error) {
            showSnackbar('Network error occurred', 'error');
        } finally {
            setLoading(false);

        }
    }

    const seatbookedNow = async () => {
        setBookingLoading(true);
        try {
            const response = await postRequestApiwithLogin("delegate/seat/book", { user_id, show_id: show.id });
            if (response.status) {
                showSnackbar(response.message || 'Booking successful!', 'success');
                // datacheck(); // Refresh booking status
                setTimeout(() => {
                    setDatarefresh(datarefresh + 1)
                }, 500);
            } else {
                showSnackbar(response.message || 'Booking failed', 'error');
            }
        } catch (error) {
            showSnackbar('Network error occurred', 'error');
        } finally {
            setBookingLoading(false);


        }
    }

    const seatbookedRemoved = async () => {
        setRemovingLoading(true);
        try {
            const response = await postRequestApiwithLogin("delegate/seat/book/remove", { user_id, show_id: show.id });
            if (response.status) {
                showSnackbar(response.message || 'Booking removed successfully!', 'success');
                datacheck(); // Refresh booking status
            } else {
                showSnackbar(response.message || 'Failed to remove booking', 'error');
            }
        } catch (error) {
            showSnackbar('Network error occurred', 'error');
        } finally {
            setRemovingLoading(false);
            setDatarefresh(datarefresh + 1)
        }
    }

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    }

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }

    const openBookConfirmation = () => {
        setConfirmDialog({
            open: true,
            title: 'Confirm Booking',
            message: 'Are you sure you want to book this seat?',
            action: 'book',
            onConfirm: () => {
                seatbookedNow();
                setConfirmDialog(prev => ({ ...prev, open: false }));
            }
        });
    }

    const openRemoveConfirmation = () => {
        setConfirmDialog({
            open: true,
            title: 'Remove Booking',
            message: 'Are you sure you want to remove your booking?',
            action: 'remove',
            onConfirm: () => {
                seatbookedRemoved();
                setConfirmDialog(prev => ({ ...prev, open: false }));
            }
        });
    }

    const handleDialogClose = () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
    }

    const renderLoadingButton = (text, isLoading, onClick, variant = 'contained', color = 'primary', disabled = false, classcustum = "") => (

        <button
            variant={variant}

            onClick={onClick}
            // disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
            className={`btn btn-common booknow ${classcustum}`}
            disabled={isLoading || disabled}
        >
            {isLoading ? 'Processing...' : text}
        </button>


    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                <CircularProgress size={24} />
                <span style={{ marginLeft: 8 }}>Checking booking status...</span>
            </Box>
        );
    }
    const token = localStorage.getItem("token");

    return (
        <>
            {
                token && delegate_accredation && delegate_accredation.status == 'Confirmed' ?
                    <>
                        {data === 0 ? (
                            renderLoadingButton(
                                'Book Now',
                                bookingLoading,
                                openBookConfirmation,
                                'contained',
                                'primary',
                                false,

                            )
                        ) : data === 1 ? (
                            <>
                                {renderLoadingButton(
                                    'Booked',
                                    false,
                                    null,
                                    'contained',
                                    'primary',
                                    true,
                                    "booked-button"
                                )}
                                {renderLoadingButton(
                                    'Remove Booking',
                                    removingLoading,
                                    openRemoveConfirmation,
                                    'contained',
                                    'error',
                                    false,
                                    'removed-button'

                                )}
                            </>
                        ) : (
                            <button variant="contained" color="primary" disabled className='btn btn-common'>
                                Seats Full
                            </button>
                        )}

                        {/* Confirmation Dialog */}
                        <Dialog
                            open={confirmDialog.open}
                            onClose={handleDialogClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                                {confirmDialog.title}
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    {confirmDialog.message}
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleDialogClose} className='removed-button-text'>
                                    Cancel
                                </Button>
                                <Button className='btn common-btn'
                                    onClick={confirmDialog.onConfirm}
                                    color=""
                                    autoFocus
                                    variant="contained"
                                >
                                    Confirm
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Snackbar for notifications */}
                        <Snackbar
                            open={snackbar.open}
                            autoHideDuration={6000}
                            onClose={handleSnackbarClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        >
                            <Alert
                                onClose={handleSnackbarClose}
                                severity={snackbar.severity}
                                variant="filled"
                                sx={{ width: '100%' }}
                            >
                                {snackbar.message}
                            </Alert>
                        </Snackbar>
                    </>
                    :
                    <>
                    </>
            }
        </>

    )
}

export default Booknow