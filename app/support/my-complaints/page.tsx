"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, XCircle, MessageSquare } from "lucide-react"

// Mock complaints data
const mockComplaints = [
  {
    id: "c1",
    subject: "Room not as described",
    description: "The room was significantly smaller than shown in the photos and the ocean view was barely visible.",
    priority: "medium",
    status: "open",
    createdAt: "2025-05-10T14:30:00Z",
    updatedAt: "2025-05-10T14:30:00Z",
    bookingId: "b1",
    homestayName: "Sunset Beach Villa",
    responses: [],
  },
  {
    id: "c2",
    subject: "Cleanliness issues",
    description:
      "The bathroom was not properly cleaned upon arrival. There were stains in the shower and hair on the floor.",
    priority: "high",
    status: "in_progress",
    createdAt: "2025-05-05T09:15:00Z",
    updatedAt: "2025-05-06T11:20:00Z",
    bookingId: "b2",
    homestayName: "Mountain Retreat",
    responses: [
      {
        id: "r1",
        message:
          "We apologize for the cleanliness issues you experienced. We've contacted the host and they will be sending a cleaning service immediately. Please let us know if this resolves the issue.",
        createdAt: "2025-05-06T11:20:00Z",
        isAdmin: true,
      },
    ],
  },
  {
    id: "c3",
    subject: "Wifi not working",
    description: "The wifi was not working during our entire stay despite being listed as an amenity.",
    priority: "medium",
    status: "resolved",
    createdAt: "2025-04-20T16:45:00Z",
    updatedAt: "2025-04-22T10:30:00Z",
    bookingId: "b3",
    homestayName: "Riverside Cottage",
    responses: [
      {
        id: "r2",
        message:
          "We've contacted the host about the wifi issue. They will be checking the router and contacting their service provider.",
        createdAt: "2025-04-21T09:10:00Z",
        isAdmin: true,
      },
      {
        id: "r3",
        message:
          "The host has confirmed that the wifi issue has been resolved. The router was replaced and is now functioning properly. Please let us know if you're still experiencing any issues.",
        createdAt: "2025-04-22T10:30:00Z",
        isAdmin: true,
      },
    ],
  },
  {
    id: "c4",
    subject: "Noisy neighbors",
    description: "The neighbors were extremely loud every night until 2am, making it impossible to sleep.",
    priority: "high",
    status: "closed",
    createdAt: "2025-03-15T20:00:00Z",
    updatedAt: "2025-03-18T14:15:00Z",
    bookingId: "b4",
    homestayName: "City Center Apartment",
    responses: [
      {
        id: "r4",
        message:
          "We've contacted the host about the noise issue. They will speak with the neighbors and try to resolve the situation.",
        createdAt: "2025-03-16T10:20:00Z",
        isAdmin: true,
      },
      {
        id: "r5",
        message:
          "The host has spoken with the neighbors and they have agreed to keep the noise down after 10pm. Please let us know if the issue persists.",
        createdAt: "2025-03-17T15:45:00Z",
        isAdmin: true,
      },
      {
        id: "r6",
        message:
          "As compensation for the inconvenience, we've issued a partial refund of $50 to your account. We hope this helps and apologize for the disruption to your stay.",
        createdAt: "2025-03-18T14:15:00Z",
        isAdmin: true,
      },
    ],
  },
]

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setComplaints(mockComplaints)
      } catch (error) {
        console.error("Failed to fetch complaints:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  const filteredComplaints = complaints.filter((complaint) => {
    if (activeTab === "all") return true
    if (activeTab === "open") return complaint.status === "open" || complaint.status === "in_progress"
    if (activeTab === "resolved") return complaint.status === "resolved" || complaint.status === "closed"
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500">Open</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>
      case "closed":
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "in_progress":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "closed":
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Loading your complaints...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Homepage
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">My Complaints</h1>
          <p className="text-muted-foreground mb-6">Track and manage the complaints you've submitted.</p>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You haven't submitted any complaints yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/support/complaints">Submit a Complaint</Link>
                </Button>
              </div>
            ) : (
              filteredComplaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} />)
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-6">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You don't have any open complaints.</p>
                <Button asChild className="mt-4">
                  <Link href="/support/complaints">Submit a Complaint</Link>
                </Button>
              </div>
            ) : (
              filteredComplaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} />)
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-6">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You don't have any resolved complaints.</p>
              </div>
            ) : (
              filteredComplaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  function ComplaintCard({ complaint }: { complaint: any }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getStatusIcon(complaint.status)}
              <div>
                <CardTitle>{complaint.subject}</CardTitle>
                <CardDescription>
                  Regarding booking at {complaint.homestayName} • Submitted on {formatDate(complaint.createdAt)}
                </CardDescription>
              </div>
            </div>
            <div>{getStatusBadge(complaint.status)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
              <p className="text-sm">{complaint.description}</p>
            </div>

            {complaint.responses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Responses</h4>
                <div className="space-y-3">
                  {isExpanded ? (
                    complaint.responses.map((response: any) => (
                      <div key={response.id} className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{response.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {response.isAdmin ? "Support Team" : "You"} • {formatDate(response.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{complaint.responses[complaint.responses.length - 1].message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {complaint.responses[complaint.responses.length - 1].isAdmin ? "Support Team" : "You"} •{" "}
                        {formatDate(complaint.responses[complaint.responses.length - 1].createdAt)}
                      </p>
                    </div>
                  )}

                  {complaint.responses.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs">
                      {isExpanded ? "Show Less" : `Show All Responses (${complaint.responses.length})`}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Handle click event - you can add custom logic here
              console.log(`Viewing details for complaint: ${complaint.id}`)
              // Navigate to complaint details
              window.location.href = `/support/complaints/${complaint.id}`
            }}
          >
            View Details
          </Button>
          {(complaint.status === "open" || complaint.status === "in_progress") && (
            <Button
              size="sm"
              className="flex items-center"
              onClick={() => {
                window.location.href = `/support/complaints/${complaint.id}`
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Reply
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }
}
