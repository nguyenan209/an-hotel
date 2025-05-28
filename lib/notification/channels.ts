export const getNotificationChannel = (userId: string): string => {
  return `notifications-${userId}`;
};

export const getPaymentChannel = (sessionId: string): string => {
  return `payment-${sessionId}`;
};
