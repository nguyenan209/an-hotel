import { PaymentMethod } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentMethod, bookingData, paymentDetails } = body;

    console.log("=== CHECKOUT PAYMENT API ===");
    console.log("Payment Method:", paymentMethod);
    console.log("Request Body:", JSON.stringify(body, null, 2));

    // Tạo booking ID và confirmation code
    const bookingId = `BK${Math.floor(100000 + Math.random() * 900000)}`;
    const confirmationCode = `HC${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId = `TX${Math.floor(100000 + Math.random() * 900000)}`;

    // Xử lý theo từng phương thức thanh toán
    switch (paymentMethod) {
      case PaymentMethod.BANK_TRANSFER:
        console.log("=== QR CODE PAYMENT PROCESSING ===");
        console.log("QR Payment Details:", paymentDetails);
        console.log("Amount:", bookingData.totalAmount);
        console.log("QR Status:", paymentDetails?.qrStatus || "confirmed");
        console.log(
          "QR Transaction ID:",
          paymentDetails?.qrTransactionId || transactionId
        );

        // Giả lập xử lý thanh toán QR
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return NextResponse.json({
          success: true,
          message: "QR payment processed successfully",
          data: {
            ...bookingData,
            bookingId,
            confirmationCode,
            paymentStatus: "completed",
            paymentDetails: {
              method: "qr_code",
              status: "completed",
              transactionId,
              paidAmount: bookingData.totalAmount,
              remainingAmount: 0,
              paymentDate: new Date().toISOString(),
              qrTransactionId: paymentDetails?.qrTransactionId || transactionId,
              bankName: paymentDetails?.bankName || "Vietcombank",
              accountNumber:
                paymentDetails?.accountNumber || "**** **** **** 1234",
            },
            estimatedCheckInTime: "14:00",
            estimatedCheckOutTime: "12:00",
            createdAt: new Date().toISOString(),
          },
        });

      case PaymentMethod.CREDIT_CARD:
        console.log("=== CREDIT CARD PAYMENT PROCESSING ===");
        console.log("Card Payment Details:", paymentDetails);
        console.log(
          "Stripe Payment Intent ID:",
          paymentDetails?.paymentIntentId
        );
        console.log("Card Last 4:", paymentDetails?.cardLast4);
        console.log("Card Brand:", paymentDetails?.cardBrand);
        console.log("Amount in USD:", paymentDetails?.amountInUSD);

        // Giả lập xử lý thanh toán thẻ
        await new Promise((resolve) => setTimeout(resolve, 1500));

        return NextResponse.json({
          success: true,
          message: "Credit card payment processed successfully",
          data: {
            ...bookingData,
            bookingId,
            confirmationCode,
            paymentStatus: "completed",
            paymentDetails: {
              method: "credit_card",
              status: "completed",
              transactionId,
              paidAmount: bookingData.totalAmount,
              remainingAmount: 0,
              paymentDate: new Date().toISOString(),
              stripePaymentIntentId: paymentDetails?.paymentIntentId,
              cardLast4: paymentDetails?.cardLast4 || "1234",
              cardBrand: paymentDetails?.cardBrand || "visa",
              amountInUSD: paymentDetails?.amountInUSD,
              exchangeRate: paymentDetails?.exchangeRate || 24000,
            },
            estimatedCheckInTime: "14:00",
            estimatedCheckOutTime: "12:00",
            createdAt: new Date().toISOString(),
          },
        });

      case PaymentMethod.CASH:
        console.log("=== RECEPTION PAYMENT PROCESSING ===");
        console.log("Reception Payment Details:", paymentDetails);
        console.log("Customer Info:", bookingData.customer);
        console.log("Special Requests:", bookingData.specialRequests);
        console.log(
          "Total Amount to Pay at Reception:",
          bookingData.totalAmount
        );

        // Giả lập xử lý đặt phòng thanh toán tại lễ tân
        await new Promise((resolve) => setTimeout(resolve, 800));

        return NextResponse.json({
          success: true,
          message: "Booking confirmed - Payment at reception",
          data: {
            ...bookingData,
            bookingId,
            confirmationCode,
            paymentStatus: "pending",
            paymentDetails: {
              method: "reception",
              status: "pending",
              transactionId: null,
              paidAmount: 0,
              remainingAmount: bookingData.totalAmount,
              paymentDate: null,
              paymentDueDate: new Date(
                Date.now() + 24 * 60 * 60 * 1000
              ).toISOString(), // 24 hours from now
              receptionNote: "Customer will pay at reception during check-in",
            },
            estimatedCheckInTime: "14:00",
            estimatedCheckOutTime: "12:00",
            createdAt: new Date().toISOString(),
            specialInstructions:
              "Please bring valid ID and confirmation code for check-in",
          },
        });

      default:
        console.log("=== UNKNOWN PAYMENT METHOD ===");
        console.log("Invalid payment method:", paymentMethod);

        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment method",
            error: `Payment method '${paymentMethod}' is not supported`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("=== CHECKOUT PAYMENT API ERROR ===");
    console.error("Error processing payment:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Thêm method GET để test API
export async function GET() {
  return NextResponse.json({
    message: "Checkout Payment API is running",
    supportedMethods: ["qr_code", "credit_card", "reception"],
    timestamp: new Date().toISOString(),
  });
}
