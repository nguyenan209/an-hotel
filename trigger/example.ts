import { BookingStatus } from "@prisma/client";
import { logger, schedules, wait } from "@trigger.dev/sdk/v3";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

export const firstScheduledTask = schedules.task({
  id: "first-scheduled-task",
  // Every hour
  cron: "* * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    logger.info(`Today is ${today}`);
    // Find all bookings with status PAID and checkout date is today
    const bookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PAID,
        checkOut: {
          equals: today,
        },
      },
    });

    logger.info(`Found ${bookings.length} bookings to update`);

    // Update status to COMPLETED
    const updatedBookings = await prisma.booking.updateMany({
      where: {
        id: {
          in: bookings.map((booking) => booking.id),
        },
      },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });

    logger.info(`Updated ${updatedBookings.count} bookings to COMPLETED status`);

    return {
      updatedCount: updatedBookings.count,
    };
  },
});