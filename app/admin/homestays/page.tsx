"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Trash } from "lucide-react";
import Cookies from "js-cookie";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Homestay } from "@prisma/client";
import Loading from "@/components/loading";

type FilterParams = {
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
};

export default function HomestaysPage() {
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [homestayToDelete, setHomestayToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();

  const getHomestays = async (resetPage = false) => {
    try {
      if (resetPage) {
        setLoading(true);
        setHomestays([]);
        setPage(1);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      // Prepare filter params
      const params: FilterParams = {
        search: searchQuery,
        status: statusFilter,
        page: resetPage ? "1" : page.toString(),
        limit: itemsPerPage.toString(),
      };

      const query = new URLSearchParams(params).toString();

      // Call the API
      const response = await fetch("/api/admin/homestays?" + query, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch homestays");
      }
      const data = await response.json();

      // Update state with response data
      setHomestays((prev) =>
        resetPage ? data.homestays : [...prev, ...data.homestays]
      );
      setHasMore(data.hasMore);
      if (!resetPage) {
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to load homestays",
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    getHomestays(true); // Load initial data
  }, [searchQuery, statusFilter]);

  const handleDelete = async (homestayId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/homestays/${homestayId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete homestay");
      }

      const result = await response.json();

      // Remove the deleted homestay from the local state
      setHomestays((prevHomestays) =>
        prevHomestays.filter((h) => h.id !== homestayId)
      );

      // Show success message
      toast({
        title: "Success",
        description: result.message,
      });
    } catch (err) {
      // Show error message
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete homestay",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setHomestayToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Homestays</h2>
        <Link href="/admin/homestays/new">
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
            You have a total of {homestays.length} homestays in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search homestays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getHomestays(true);
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homestays.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No homestays found.
                    </TableCell>
                  </TableRow>
                )}
                {homestays.map((homestay) => (
                  <TableRow key={homestay.id}>
                    <TableCell className="font-medium">
                      {homestay.name}
                    </TableCell>
                    <TableCell>{homestay.address}</TableCell>
                    <TableCell>{formatCurrency(homestay.price)}</TableCell>
                    <TableCell>{homestay.rating}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          homestay.status
                        )}`}
                      >
                        {homestay.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/homestays/${homestay.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setHomestayToDelete(homestay.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <InfiniteScroll
            onLoadMore={() => getHomestays(false)}
            hasMore={hasMore}
            isLoading={isLoadingMore}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setHomestayToDelete(null);
        }}
        onConfirm={() => homestayToDelete && handleDelete(homestayToDelete)}
        itemName="this homestay"
        isDeleting={isDeleting}
      />
    </div>
  );
}
