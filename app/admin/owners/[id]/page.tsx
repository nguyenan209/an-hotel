"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Hotel, User } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const ownerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  status: z.string(),
});

type OwnerFormValues = z.infer<typeof ownerSchema>;

export default function OwnerDetailPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const isNewOwner = id === "new";
  const [owner, setOwner] = useState<any | null>(null);
  const [ownerHomestays, setOwnerHomestays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!isNewOwner);

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: isNewOwner
      ? {
          name: "",
          email: "",
          phone: "",
          address: "",
          status: "active",
        }
      : undefined,
  });

  useEffect(() => {
    if (isNewOwner) {
      setIsLoading(false);
      return;
    }

    // Simulate API call to fetch owner details
    const fetchOwner = async () => {
      try {
        // In a real app, you would fetch from an API
        const mockOwners = [
          {
            id: "own1",
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            phone: "0901234567",
            address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
            totalHomestays: 3,
            joinDate: "2023-01-15T10:30:00Z",
            status: "active",
          },
          {
            id: "own2",
            name: "Trần Thị B",
            email: "tranthib@example.com",
            phone: "0912345678",
            address: "456 Lê Lợi, Quận 1, TP.HCM",
            totalHomestays: 2,
            joinDate: "2023-02-20T14:45:00Z",
            status: "active",
          },
        ];

        const foundOwner = mockOwners.find((o) => o.id === id);

        if (foundOwner) {
          setOwner(foundOwner);
          form.reset({
            name: foundOwner.name,
            email: foundOwner.email,
            phone: foundOwner.phone,
            address: foundOwner.address,
            status: foundOwner.status,
          });

          // Get owner homestays
          const mockHomestays = [
            {
              id: "hs1",
              name: "Sunset Beach Villa",
              location: "Đà Nẵng",
              price: 2500000,
              status: "active",
              createdAt: "2023-02-15T10:30:00Z",
            },
            {
              id: "hs2",
              name: "Mountain Retreat Lodge",
              location: "Sapa",
              price: 1800000,
              status: "active",
              createdAt: "2023-03-20T14:45:00Z",
            },
            {
              id: "hs3",
              name: "Riverside Cottage",
              location: "Hội An",
              price: 1500000,
              status: "pending",
              createdAt: "2023-05-10T09:15:00Z",
            },
          ];

          setOwnerHomestays(mockHomestays);
        }
      } catch (error) {
        console.error("Error fetching owner:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwner();
  }, [id, isNewOwner, form]);

  const onSubmit = (data: OwnerFormValues) => {
    // In a real app, you would submit to an API
    console.log("Form submitted:", data);

    // Simulate successful submission
    setTimeout(() => {
      router.push("/admin/owners");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/owners">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isNewOwner ? "Add New Owner" : `Edit Owner: ${owner?.name}`}
        </h2>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {!isNewOwner && (
            <TabsTrigger value="homestays">Homestays</TabsTrigger>
          )}
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Owner Information</CardTitle>
                  <CardDescription>
                    Enter the owner's personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-500" />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      >
                        <span className="sr-only">Change avatar</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
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
                          <Input
                            placeholder="Enter email address"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="terminated">
                              Terminated
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {!isNewOwner && (
              <TabsContent value="homestays" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Homestay Listings</CardTitle>
                    <CardDescription>
                      View all homestays owned by this person.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ownerHomestays.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Hotel className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">
                          No homestays found
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          This owner hasn't listed any homestays yet.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ownerHomestays.map((homestay) => (
                              <TableRow key={homestay.id}>
                                <TableCell className="font-medium">
                                  {homestay.name}
                                </TableCell>
                                <TableCell>{homestay.location}</TableCell>
                                <TableCell>
                                  {homestay.price.toLocaleString()} VND
                                </TableCell>
                                <TableCell>
                                  {formatDate(homestay.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      homestay.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : homestay.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {homestay.status.charAt(0).toUpperCase() +
                                      homestay.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Link
                                    href={
                                      homestay.status === "pending"
                                        ? `/admin/approvals/${homestay.id}`
                                        : `/admin/homestays/${homestay.id}`
                                    }
                                  >
                                    <Button variant="outline" size="sm">
                                      View Details
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/owners">Cancel</Link>
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {isNewOwner ? "Create Owner" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
