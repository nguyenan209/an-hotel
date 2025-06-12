"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit, Eye, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function OwnerHomestaysPage() {
  const params = useParams();
  const ownerId = params.id as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [owner, setOwner] = useState<any>(null);
  const [homestays, setHomestays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const ownerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/owners/${ownerId}`);
        const homestaysRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/owners/${ownerId}/homestays`);
        const ownerData = await ownerRes.json();
        const homestaysData = await homestaysRes.json();
        setOwner(ownerData);
        setHomestays(homestaysData);
      } catch (e) {
        setOwner(null);
        setHomestays([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (ownerId) fetchData();
  }, [ownerId]);

  // Filter homestays based on search query
  const filteredHomestays = homestays.filter(
    (homestay) =>
      homestay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      homestay.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg">Loading owner information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin/owners"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Owners
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">
            Homestays for {owner.name}
          </h2>
          <p className="text-muted-foreground">
            Email: {owner.email} | Phone: {owner.phone}
          </p>
        </div>
        <Link href={`/admin/owners/${ownerId}/homestays/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Homestay
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Homestays</CardTitle>
          <CardDescription>
            View and manage all homestays owned by {owner.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search homestays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Homestay</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHomestays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No homestays found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHomestays.map((homestay) => (
                    <TableRow key={homestay.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md overflow-hidden">
                            <Image
                              src={homestay.image || "/placeholder.svg"}
                              alt={homestay.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{homestay.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{homestay.location}</TableCell>
                      <TableCell>{formatCurrency(homestay.price)}</TableCell>
                      <TableCell>{homestay.rooms}</TableCell>
                      <TableCell>
                        {homestay.rating > 0 ? (
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            {homestay.rating.toFixed(1)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No ratings
                          </span>
                        )}
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
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/homestays/${homestay.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </Link>
                          <Link href={`/admin/homestays/${homestay.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
