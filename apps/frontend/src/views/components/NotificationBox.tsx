import React from "react";
import { Alert, type AlertColor, Box } from "@mui/material";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationBoxProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
}

const NotificationBox: React.FC<NotificationBoxProps> = ({ type, message, onClose }) => {
  if (!message) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity={type as AlertColor}
        variant="filled"
        onClose={onClose}
        sx={{ borderRadius: 2 }}
      >
        {message}
      </Alert>
    </Box>
  );
};

export default NotificationBox;
