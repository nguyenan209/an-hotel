"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  complaint: z.string().min(10, {
    message: "Complaint must be at least 10 characters.",
  }),
});

const ComplaintsPage = () => {
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      complaint: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate a successful submission
    console.log(values);
    setSuccess(true);
    form.reset();
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-[500px] mx-auto">
        <CardHeader>
          <CardTitle>Gửi khiếu nại</CardTitle>
          <CardDescription>
            Vui lòng điền form bên dưới để gửi khiếu nại của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="complaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khiếu nại</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Vui lòng mô tả khiếu nại của bạn chi tiết."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={success}>
                {success ? "Khiếu nại đã được gửi!" : "Gửi khiếu nại"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintsPage;
