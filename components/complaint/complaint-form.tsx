"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TinyMCEEditor from "@/components/tinymce-editor";

const complaintFormSchema = z.object({
  subject: z.string().min(5, {
    message: "Tiêu đề phải có ít nhất 5 ký tự.",
  }),
  description: z.string().min(20, {
    message: "Mô tả phải có ít nhất 20 ký tự.",
  }),
  priority: z.string({
    required_error: "Vui lòng chọn mức độ ưu tiên.",
  }),
  bookingId: z.string().optional(),
});

type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

interface ComplaintFormProps {
  bookingId?: string;
  bookingInfo?: {
    id: string;
    homestayName: string;
    checkIn: string;
    checkOut: string;
  };
  onSuccess?: () => void;
}

export function ComplaintForm({ bookingId, bookingInfo, onSuccess }: ComplaintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValues: Partial<ComplaintFormValues> = {
    subject: bookingInfo
      ? `Vấn đề với đặt phòng tại ${bookingInfo.homestayName}`
      : "",
    bookingId: bookingId || "",
    priority: "medium",
  };

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ComplaintFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Gửi complaint lên API thực tế
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.subject,
          description: data.description,
          priority: data.priority,
          bookingId: data.bookingId,
        }),
      });
      if (!res.ok) throw new Error("Không thể gửi khiếu nại");
      setIsSuccess(true);
      onSuccess?.();
      toast({
        title: "Đã gửi khiếu nại",
        description: "Chúng tôi đã nhận được khiếu nại của bạn và sẽ phản hồi sớm.",
      });
    } catch (err) {
      setError("Không thể gửi khiếu nại. Vui lòng thử lại.");
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi khiếu nại của bạn. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800">
          Đã gửi khiếu nại thành công
        </AlertTitle>
        <AlertDescription className="text-green-700">
          Cảm ơn bạn đã báo cáo vấn đề này. Đội ngũ hỗ trợ của chúng tôi sẽ
          xem xét khiếu nại của bạn và phản hồi trong vòng 24-48 giờ. Bạn có thể theo dõi
          trạng thái khiếu nại trong phần "Khiếu nại của tôi".
        </AlertDescription>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              form.reset(defaultValues);
            }}
          >
            Gửi khiếu nại khác
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="overflow-y-auto">
      <div className="w-full max-w-xl mx-auto p-4 pb-8">
        {bookingInfo && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
            <h3 className="font-medium text-base mb-2">Thông tin đặt phòng</h3>
            <p className="text-sm mb-1">Homestay: {bookingInfo.homestayName}</p>
            <p className="text-sm">
              Ngày: {new Date(bookingInfo.checkIn).toLocaleDateString()} -{" "}
              {new Date(bookingInfo.checkOut).toLocaleDateString()}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Tiêu đề</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mô tả ngắn gọn về vấn đề"
                      className="p-2"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cung cấp tiêu đề ngắn gọn cho khiếu nại của bạn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Mô tả
                  </FormLabel>
                  <FormControl>
                    <TinyMCEEditor
                      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ''}
                      value={field.value || ''}
                      onChange={field.onChange}
                      folder="complaints"
                    />
                  </FormControl>
                  <FormDescription>
                    Bao gồm tất cả chi tiết liên quan về vấn đề bạn đang gặp phải.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Mức độ ưu tiên
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="p-2">
                        <SelectValue placeholder="Chọn mức độ ưu tiên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Thấp - Không khẩn cấp</SelectItem>
                      <SelectItem value="medium">
                        Trung bình - Cần chú ý
                      </SelectItem>
                      <SelectItem value="high">Cao - Vấn đề khẩn cấp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn mức độ khẩn cấp của khiếu nại của bạn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 pb-2">
              <Button
                type="submit"
                className="w-full py-3 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi khiếu nại"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
