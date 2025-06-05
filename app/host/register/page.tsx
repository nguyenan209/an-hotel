"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Home, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HostRegisterPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        experience: "",
        agreeTerms: false,
        agreePrivacy: false,
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        alert("Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24h.")
        setIsSubmitting(false)
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const isFormValid =
        formData.fullName &&
        formData.email &&
        formData.phone &&
        formData.address &&
        formData.agreeTerms &&
        formData.agreePrivacy

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Trở thành Host cùng HomeStay</h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Chia sẻ không gian của bạn và tạo thu nhập từ việc đón tiếp khách
                        </p>

                        {/* Benefits */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <Home className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">Dễ dàng bắt đầu</h3>
                                <p className="text-gray-600">Đăng ký đơn giản, hỗ trợ 24/7</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">Thu nhập ổn định</h3>
                                <p className="text-gray-600">Tạo thu nhập thụ động từ tài sản</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">An toàn bảo mật</h3>
                                <p className="text-gray-600">Bảo hiểm và hỗ trợ pháp lý</p>
                            </div>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">Đăng ký làm Host</CardTitle>
                            <CardDescription className="text-center">Điền thông tin để bắt đầu hành trình làm host</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fullName">Họ và tên *</Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                                            placeholder="Nhập họ và tên đầy đủ"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Số điện thoại *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            placeholder="0xxx xxx xxx"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="address">Địa chỉ homestay *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        placeholder="Địa chỉ chi tiết của homestay"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="experience">Kinh nghiệm và mô tả</Label>
                                    <Textarea
                                        id="experience"
                                        value={formData.experience}
                                        onChange={(e) => handleInputChange("experience", e.target.value)}
                                        placeholder="Chia sẻ về kinh nghiệm của bạn trong việc đón tiếp khách hoặc mô tả về homestay..."
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="agreeTerms"
                                            checked={formData.agreeTerms}
                                            onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                                        />
                                        <Label htmlFor="agreeTerms" className="text-sm leading-5">
                                            Tôi đồng ý với{" "}
                                            <Link href="/terms" className="text-blue-600 hover:underline">
                                                Điều khoản dịch vụ
                                            </Link>{" "}
                                            của HomeStay
                                        </Label>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="agreePrivacy"
                                            checked={formData.agreePrivacy}
                                            onCheckedChange={(checked) => handleInputChange("agreePrivacy", checked as boolean)}
                                        />
                                        <Label htmlFor="agreePrivacy" className="text-sm leading-5">
                                            Tôi đồng ý với{" "}
                                            <Link href="/privacy" className="text-blue-600 hover:underline">
                                                Chính sách bảo mật
                                            </Link>{" "}
                                            và cho phép HomeStay liên hệ với tôi
                                        </Label>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={!isFormValid || isSubmitting}>
                                    {isSubmitting ? "Đang xử lý..." : "Đăng ký làm Host"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Additional Info */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">Sau khi đăng ký, đội ngũ HomeStay sẽ liên hệ với bạn trong vòng 24 giờ</p>
                        <p className="text-sm text-gray-500">
                            Có câu hỏi? Liên hệ{" "}
                            <Link href="/contact" className="text-blue-600 hover:underline">
                                hỗ trợ khách hàng
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
