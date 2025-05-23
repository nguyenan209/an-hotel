export default function PaymentSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
