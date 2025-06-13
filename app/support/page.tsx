import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Support | HomeStay",
  description:
    "Get help with your bookings, account, or report issues with your stay",
};

export default function SupportPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">How Can We Help You?</h1>
          <p className="text-muted-foreground">
            Our support team is here to assist you with any questions or issues
            you may have.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                File a Complaint
              </CardTitle>
              <CardDescription>
                Report issues with your booking, homestay, or host
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                If you've experienced any issues with your stay or booking,
                please file a complaint and our team will address it promptly.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/support/complaints">Submit a Complaint</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Live Chat
              </CardTitle>
              <CardDescription>
                Chat with our support team in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Get immediate assistance from our support team through our live
                chat service. Available 24/7.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                FAQs
              </CardTitle>
              <CardDescription>
                Find answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Browse our frequently asked questions to find quick answers to
                common inquiries about bookings, cancellations, and more.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View FAQs
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                My Complaints
              </CardTitle>
              <CardDescription>
                Track the status of your complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                View and track the status of complaints you've submitted. Check
                responses and updates from our team.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/support/my-complaints">View My Complaints</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-3 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">
                  +1 (555) 123-4567
                </p>
                <p className="text-xs text-muted-foreground">Available 24/7</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">
                  support@homestay.com
                </p>
                <p className="text-xs text-muted-foreground">
                  Response within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
