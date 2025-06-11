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
    message: "Subject must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  priority: z.string({
    required_error: "Please select a priority level.",
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
}

export function ComplaintForm({ bookingId, bookingInfo }: ComplaintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValues: Partial<ComplaintFormValues> = {
    subject: bookingInfo
      ? `Issue with booking at ${bookingInfo.homestayName}`
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
      // In a real app, this would be an API call
      console.log("Submitting complaint:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful submission
      setIsSuccess(true);
      toast({
        title: "Complaint submitted",
        description: "We've received your complaint and will respond shortly.",
      });
    } catch (err) {
      setError("Failed to submit complaint. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your complaint. Please try again.",
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
          Complaint Submitted Successfully
        </AlertTitle>
        <AlertDescription className="text-green-700">
          Thank you for bringing this to our attention. Our support team will
          review your complaint and respond within 24-48 hours. You can track
          the status of your complaint in the "My Complaints" section.
        </AlertDescription>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              form.reset(defaultValues);
            }}
          >
            Submit Another Complaint
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
            <h3 className="font-medium text-base mb-2">Booking Information</h3>
            <p className="text-sm mb-1">Homestay: {bookingInfo.homestayName}</p>
            <p className="text-sm">
              Dates: {new Date(bookingInfo.checkIn).toLocaleDateString()} -{" "}
              {new Date(bookingInfo.checkOut).toLocaleDateString()}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
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
                  <FormLabel className="text-sm font-medium">Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the issue"
                      className="p-2"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a short title for your complaint.
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
                    Description
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
                    Include all relevant details about the issue you're
                    experiencing.
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
                    Priority
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="p-2">
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low - Not urgent</SelectItem>
                      <SelectItem value="medium">
                        Medium - Needs attention
                      </SelectItem>
                      <SelectItem value="high">High - Urgent issue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the urgency level of your complaint.
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
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
