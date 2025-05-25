"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Camera, Loader2 } from "lucide-react";
import Loading from "@/components/loading";

// Form schema for profile information
const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." }),
  address: z.string().optional(),
  bio: z.string().optional(),
});

// Form schema for password change
const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Mock user data - in a real app, this would come from an API
const mockUser = {
  id: "u1",
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "0123456789",
  address: "123 Main St, City, Country",
  bio: "Travel enthusiast and food lover. Always looking for new adventures and experiences.",
  avatar: "",
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      bio: "",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Simulate API call to fetch user data
    const fetchUserData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUser(mockUser);

        // Set form default values
        profileForm.reset({
          fullName: mockUser.fullName,
          email: mockUser.email,
          phone: mockUser.phone,
          address: mockUser.address || "",
          bio: mockUser.bio || "",
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [profileForm]);

  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    try {
      // Simulate API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update local user state
      setUser({
        ...user,
        ...data,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsChangingPassword(true);
    try {
      // Simulate API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });

      // Reset form
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    setIsUpdating(true);
    try {
      // Simulate API call to upload avatar
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would upload the file to your server/S3
      // and get back a URL to the uploaded image

      // Update local user state with new avatar URL
      setUser({
        ...user,
        avatar: avatarPreview,
      });

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setAvatarFile(null);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={avatarPreview || user.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {user.fullName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
              >
                <Camera className="h-5 w-5" />
                <span className="sr-only">Upload new picture</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {avatarFile && (
              <Button
                onClick={uploadAvatar}
                disabled={isUpdating}
                className="mt-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Save New Picture"
                )}
              </Button>
            )}

            <div className="text-center mt-4">
              <h3 className="font-medium text-lg">{user.fullName}</h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your email"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your phone number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your address (optional)"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              This will be used for billing purposes.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us a little about yourself (optional)"
                                className="resize-none"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your current password"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your new password"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters long.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Confirm your new password"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Changing Password...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
