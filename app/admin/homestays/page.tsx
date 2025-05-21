"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Edit, Plus, Trash } from "lucide-react";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { mockHomestays } from "@/lib/mock-data/admin";
import { Homestay } from "@prisma/client";
import Loading from "@/components/loading";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getHomestays = async (resetPage = false, loadMore = false) => {
    try {
      if (resetPage) {
        setLoading(true);
        setHomestays([]);
        setPage(1);
      } else if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Prepare filter params
      const params: FilterParams = {
        search: searchQuery,
        status: statusFilter,
        page: (loadMore ? page + 1 : resetPage ? 1 : page).toString(),
        limit: itemsPerPage.toString(),
      };

      const query = new URLSearchParams(params).toString();

      // Call the mock API
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
      if (loadMore) {
        setHomestays((prev) => [...prev, ...data.homestays]);
        setPage((prev) => prev + 1);
      } else {
        setHomestays(data.homestays);
        if (resetPage) {
          setPage(1);
        }
      }

      setTotalItems(data.total);
      setHasMore(data.hasMore);
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    getHomestays();
  }, []);

  // Refetch when filters, page, or items per page change
  useEffect(() => {
    if (!loading) {
      getHomestays(false);
    }
  }, [itemsPerPage]);

  // Theo dõi sự thay đổi của statusFilter và gọi API
  useEffect(() => {
    getHomestays(true); // Reset về trang 1 khi thay đổi bộ lọc
  }, [statusFilter]);

  // Handle search and filter changes
  const handleSearchFilter = () => {
    getHomestays(true); // Reset to page 1 when filters change
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    getHomestays(false); // Keep the current page
  };

  // Function to load more data when scrolling
  const loadMore = () => {
    if (!isLoadingMore && hasMore && !loading && !isRefreshing) {
      getHomestays(false, true);
    }
  };

  // Add scroll event listener to implement infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled to the bottom
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 // Load more when 100px from bottom
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, hasMore, loading, isRefreshing]);

  const handleDelete = async (homestayId: string) => {
    try {
      setIsDeleting(true);
      // Call the mock API to delete the homestay
      const result = await deleteHomestayApi(homestayId);

      // Remove the deleted homestay from the local state
      setHomestays((prevHomestays) =>
        prevHomestays.filter((h) => h.id !== homestayId)
      );

      // Update total count
      setTotalItems((prev) => prev - 1);

      // Recalculate total pages
      const newTotalPages = Math.ceil((totalItems - 1) / itemsPerPage);
      setTotalPages(newTotalPages);

      // Show success message
      toast({
        title: "Success",
        description: result.message,
      });

      getHomestays(true);
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

  // Render loading skeletons
  if (loading && !isRefreshing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-40" />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error && !isRefreshing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Homestays</h2>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-red-600">
                Error Loading Homestays
              </h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => getHomestays(false)} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
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
            You have a total of {mockHomestays.length} homestays in the system.
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
                    handleSearchFilter();
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
                {homestays.length === 0 && loading && <Loading />}
                {homestays.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No homestays found.
                    </TableCell>
                  </TableRow>
                )}
                {homestays.length &&
                  homestays.map((homestay: Homestay) => (
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
        </CardContent>
      </Card>

      {/* Loading indicator and info */}
      {homestays.length > 0 && (
        <div className="text-center py-4">
          {isLoadingMore ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading more...</p>
            </div>
          ) : hasMore ? (
            <p className="text-sm text-muted-foreground">Scroll to load more</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Showing all {totalItems} homestays
            </p>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this homestay? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => homestayToDelete && handleDelete(homestayToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
