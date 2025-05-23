import { QRCodeCanvas } from "qrcode.react";
import { useMemo } from "react";

interface QrCodePaymentProps {
  amount: number;
  sessionId: string;
  className?: string;
  sessionUrl?: string;
}

export function QrCodePayment({
  amount,
  sessionId,
  className = "",
  sessionUrl = "",
}: QrCodePaymentProps) {

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white p-6 rounded-lg border shadow-md">
        <QRCodeCanvas
          value={sessionUrl}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          className="mx-auto"
        />
      </div>
    </div>
  );
}