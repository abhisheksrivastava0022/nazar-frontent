import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

const AlertMessage = ({
    handleClickOpen,
    setOpen,
    open,
    handleClose,
    data,
}) => {
    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                {data?.heading ? (
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        {data.heading}
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                color: "red", // 🔴 sets the icon color to red
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                ) : (
                    <></>
                )}

                <DialogContent dividers>
                    <Typography gutterBottom>{data.content}</Typography>
                </DialogContent>
                <DialogActions
                    sx={
                        {
                            // display: "flex",
                            // justifyContent: "space-between",
                            // px: 3, // optional padding
                        }
                    }
                >
                    <Button
                        autoFocus
                        onClick={() => {
                            if (data?.onConfirm) {
                                data.onConfirm();
                            }
                            handleClose();
                        }}
                    >
                        Ok
                    </Button>
                    <Button onClick={handleClose} color="error">
                        Close
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
};

export default AlertMessage;
