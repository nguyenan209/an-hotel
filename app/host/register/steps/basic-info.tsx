"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface BasicInfoStepProps {
  data: any
  onComplete: (data: any) => void
}

export default function BasicInfoStep({ data, onComplete }: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    homestayAddress: data.homestayAddress || "",
    experience: data.experience || "",
    agreeTerms: false,
    agreePrivacy: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc"
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    if (!formData.homestayAddress.trim()) {
      newErrors.homestayAddress = "Địa chỉ homestay là bắt buộc"
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản dịch vụ"
    }

    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = "Bạn phải đồng ý với chính sách bảo mật"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/host/register/step1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          homestayAddress: formData.homestayAddress,
          experience: formData.experience,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onComplete({
          registrationId: result.registrationId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          homestayAddress: formData.homestayAddress,
          experience: formData.experience,
        })
      } else {
        setErrors({ submit: result.error || "Có lỗi xảy ra" })
      }
    } catch (error) {
      setErrors({ submit: "Có lỗi xảy ra, vui lòng thử lại" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.homestayAddress &&
    formData.agreeTerms &&
    formData.agreePrivacy

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Họ và tên *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Nhập họ và tên đầy đủ"
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Số điện thoại *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="0xxx xxx xxx"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="homestayAddress">Địa chỉ homestay *</Label>
        <Input
          id="homestayAddress"
          value={formData.homestayAddress}
          onChange={(e) => handleInputChange("homestayAddress", e.target.value)}
          placeholder="Địa chỉ chi tiết của homestay"
          className={errors.homestayAddress ? "border-red-500" : ""}
        />
        {errors.homestayAddress && <p className="text-red-500 text-sm mt-1">{errors.homestayAddress}</p>}
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
        {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

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
        {errors.agreePrivacy && <p className="text-red-500 text-sm">{errors.agreePrivacy}</p>}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
      </Button>
    </form>
  )
}
