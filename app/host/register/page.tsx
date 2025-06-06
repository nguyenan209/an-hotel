"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BasicInfoStep from "./steps/basic-info";
import PaymentStep from "./steps/payment";
import ConfirmationStep from "./steps/confirmation";
import StepIndicator from "./_components/step-indicator";

export default function HostRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    registrationId: "",
    fullName: "",
    email: "",
    phone: "",
    homestayAddress: "",
    experience: "",
    packageType: "",
    paymentId: "",
    clientSecret: "",
  });

  const steps = [
    {
      number: 1,
      title: "Thông tin cơ bản",
      description: "Điền thông tin cá nhân",
    },
    { number: 2, title: "Thanh toán", description: "Chọn gói và thanh toán" },
    { number: 3, title: "Hoàn tất", description: "Xác nhận đăng ký" },
  ];

  const handleStepComplete = (stepData: any) => {
    setRegistrationData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Trở thành Host cùng HomeStay
            </h1>
            <p className="text-xl text-gray-600">
              Chia sẻ không gian của bạn và tạo thu nhập từ việc đón tiếp khách
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          <Card className="max-w-3xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {steps[currentStep - 1]?.title}
              </CardTitle>
              <CardDescription className="text-center">
                {steps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <BasicInfoStep
                  data={registrationData}
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 2 && (
                <PaymentStep
                  data={registrationData}
                  onComplete={handleStepComplete}
                  onBack={handleBackStep}
                />
              )}
              {currentStep === 3 && (
                <ConfirmationStep data={registrationData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
