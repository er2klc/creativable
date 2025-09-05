export const useAppointmentNotification = (appointment?: any) => {
  const sendNotification = async (notificationData?: any) => {
    // Simplified notification - just log for now
    console.log('Would send notification for appointment:', appointment || notificationData);
    return Promise.resolve();
  };

  return { sendNotification };
};