"use client";

import { Edit, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { HomestayCombobox } from "@/components/homestay/homestay-compobox";
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
import { useToast } from "@/hooks/use-toast";
import { getHomestays, getRooms } from "@/lib/data";
import { formatCurrency, getStatusColor } from "@/lib/utils";

export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [homestayFilter, setHomestayFilter] = useState("all");
  const [rooms, setRooms] = useState<any[]>([]);
  const [homestays, setHomestays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [openHomestayCombobox, setOpenHomestayCombobox] = useState(false);
  const [homestaySearchTerm, setHomestaySearchTerm] = useState("");
  const [isLoadingMoreHomestays, setIsLoadingMoreHomestays] = useState(false);
  const [hasMoreHomestays, setHasMoreHomestays] = useState(true);
  const [homestaySkip, setHomestaySkip] = useState(0);

  const { toast } = useToast();
  const observerTarget = useRef(null);

  // Fetch rooms and homestays on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsData = await getRooms();
        const homestaysData = await getHomestays();
        setRooms(roomsData);
        setHomestays(homestaysData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter rooms based on search query, status filter, and homestay filter
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    const matchesHomestay =
      homestayFilter === "all" || room.homestayId === homestayFilter;

    return matchesSearch && matchesStatus && matchesHomestay;
  });

  // Function to load more homestays
  const loadMoreHomestays = async () => {
    if (isLoadingMoreHomestays || !hasMoreHomestays) return;

    try {
      setIsLoadingMoreHomestays(true);

      const nextSkip = homestaySkip + 5;
      const response = await fetchHomestays({
        search: homestaySearchTerm,
        skip: nextSkip,
        limit: 5,
      });

      setHomestays((prev) => [...prev, ...response.homestays]);
      setHomestaySkip(nextSkip);
      setHasMoreHomestays(response.hasMore);
    } catch (error) {
      console.error("Error loading more homestays:", error);
    } finally {
      setIsLoadingMoreHomestays(false);
    }
  };

  // Get homestay name by ID
  const getHomestayName = (homestayId: string) => {
    const homestay = homestays.find((h) => h.id === homestayId);
    return homestay ? homestay.name : "Unknown";
  };

  // Function to handle search for homestays
  const handleHomestaySearch = async (value) => {
    setHomestaySearchTerm(value);

    try {
      // Reset pagination when search changes
      setHomestaySkip(0);

      const response = await fetchHomestays({
        search: value,
        skip: 0,
        limit: 5,
      });

      setHomestays(response.homestays);
      setHasMoreHomestays(response.hasMore);
    } catch (error) {
      console.error("Error searching homestays:", error);
    }
  };

  // Handle scroll in the command list to implement infinite scrolling
  const handleCommandListScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // If scrolled to bottom (with a small threshold)
    if (
      scrollHeight - scrollTop - clientHeight < 50 &&
      hasMoreHomestays &&
      !isLoadingMoreHomestays
    ) {
      loadMoreHomestays();
    }
  };

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !loading
        ) {
          getRoomsData(true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, loading, rooms.length]);

  // Reset homestay pagination when dropdown opens
  useEffect(() => {
    if (openHomestayCombobox) {
      // Reset search and pagination when opening the dropdown
      setHomestaySearchTerm("");
      setHomestaySkip(0);

      // Fetch initial homestays
      const fetchInitialHomestays = async () => {
        try {
          const response = await fetchHomestays({ limit: 5 });
          setHomestays(response.homestays);
          setHasMoreHomestays(response.hasMore);
        } catch (error) {
          console.error("Error fetching initial homestays:", error);
        }
      };

      fetchInitialHomestays();
    }
  }, [openHomestayCombobox]);

  // Fetch rooms and homestays on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const homestaysData = await getHomestays();
        setHomestays(homestaysData);
        const fetchRooms = async () => {
          try {
            const roomsData = await getRooms();
            setRooms(roomsData);
          } catch (error) {
            console.error("Error fetching rooms:", error);
          }
        };
        fetchRooms();
      } catch (error) {
        setError("Error fetching data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch rooms when filters change
  useEffect(() => {
    if (!loading && statusFilter !== "all") {
      getRoomsData();
    }
  }, [statusFilter, homestayFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
        <Link href="/admin/rooms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Rooms</CardTitle>
          <CardDescription>
            You have a total of {rooms.length} rooms in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <HomestayCombobox
                value={homestayFilter}
                onValueChange={setHomestayFilter}
                placeholder="Filter by homestay"
                allOptionLabel="All Homestays"
                showAllOption={true}
                className="w-[200px]"
                triggerClassName="w-[200px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Homestay</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{getHomestayName(room.homestayId)}</TableCell>
                      <TableCell>{room.capacity} guests</TableCell>
                      <TableCell>{formatCurrency(room.price)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            room.status
                          )}`}
                        >
                          {room.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/rooms/${room.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
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
