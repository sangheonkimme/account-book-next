import React from "react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

interface NotificationProps {
  title: string;
  message: string;
}

export const showSuccessNotification = ({
  title,
  message,
}: NotificationProps) => {
  notifications.show({
    withCloseButton: true,
    autoClose: 2400,
    position: "top-center",
    title,
    message,
    color: "teal",
    icon: <IconCheck />,
  });
};

export const showErrorNotification = ({
  title,
  message,
}: NotificationProps) => {
  notifications.show({
    withCloseButton: true,
    autoClose: 2400,
    position: "top-center",
    title,
    message,
    color: "red",
    icon: <IconX />,
  });
};
