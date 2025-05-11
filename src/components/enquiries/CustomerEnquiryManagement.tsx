"use client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, MessageSquare } from "lucide-react";

// Types
interface CustomerEnquiry {
  id: string;
  customer: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  dateCreated: string;
  responses: EnquiryResponse[];
}

interface EnquiryResponse {
  id: string;
  message: string;
  staffName: string;
  dateCreated: string;
}

// Mock data
const mockEnquiries: CustomerEnquiry[] = [
  {
    id: "ENQ-001",
    customer: "John Smith",
    email: "john.smith@example.com",
    subject: "Unable to download purchased symbols",
    message:
      "I purchased a symbol pack yesterday but haven't received the download link. Could you please help?",
    status: "new",
    priority: "medium",
    dateCreated: "2023-09-15",
    responses: [],
  },
  {
    id: "ENQ-002",
    customer: "Sarah Johnson",
    email: "sarah.j@example.com",
    subject: "Custom symbol request",
    message:
      "I'm looking for a specific set of symbols for my project. Do you offer custom symbol creation services?",
    status: "in-progress",
    priority: "low",
    dateCreated: "2023-09-10",
    responses: [
      {
        id: "RES-001",
        message:
          "Thank you for your interest in our custom symbol services. Yes, we do offer custom symbol creation. Could you please provide more details about what you're looking for?",
        staffName: "Admin",
        dateCreated: "2023-09-11",
      },
    ],
  },
  {
    id: "ENQ-003",
    customer: "Michael Chen",
    email: "michael.c@example.com",
    subject: "Billing issue with recent purchase",
    message:
      "I was charged twice for my recent symbol pack purchase. Order #12345. Please help resolve this issue.",
    status: "resolved",
    priority: "high",
    dateCreated: "2023-09-05",
    responses: [
      {
        id: "RES-002",
        message:
          "I'm sorry to hear about the billing issue. I've checked our records and confirmed the double charge. We've processed a refund for the duplicate charge which should appear in your account within 3-5 business days.",
        staffName: "Admin",
        dateCreated: "2023-09-06",
      },
      {
        id: "RES-003",
        message:
          "Thank you for your patience. Is there anything else we can help you with?",
        staffName: "Admin",
        dateCreated: "2023-09-07",
      },
    ],
  },
];

export function CustomerEnquiryManagement() {
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>(mockEnquiries);
  const [currentEnquiry, setCurrentEnquiry] = useState<CustomerEnquiry | null>(
    null
  );
  const [responseMessage, setResponseMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleViewEnquiry = (enquiry: CustomerEnquiry) => {
    setCurrentEnquiry(enquiry);
    setIsDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!currentEnquiry || !responseMessage.trim()) return;

    const newResponse: EnquiryResponse = {
      id: `RES-${Math.random().toString(36).substring(2, 7)}`,
      message: responseMessage,
      staffName: "Admin",
      dateCreated: new Date().toISOString().split("T")[0],
    };

    // Update the enquiry with the new response
    const updatedEnquiries = enquiries.map((enq) =>
      enq.id === currentEnquiry.id
        ? {
            ...enq,
            responses: [...enq.responses, newResponse],
            status: enq.status === "new" ? "in-progress" : enq.status,
          }
        : enq
    );

    setEnquiries(updatedEnquiries);
    setCurrentEnquiry({
      ...currentEnquiry,
      responses: [...currentEnquiry.responses, newResponse],
      status:
        currentEnquiry.status === "new" ? "in-progress" : currentEnquiry.status,
    });
    setResponseMessage("");

    toast({
      title: "Response Sent",
      description: "Your response has been sent to the customer",
    });
  };

  const handleUpdateStatus = (status: "new" | "in-progress" | "resolved") => {
    if (!currentEnquiry) return;

    const updatedEnquiries = enquiries.map((enq) =>
      enq.id === currentEnquiry.id ? { ...enq, status } : enq
    );

    setEnquiries(updatedEnquiries);
    setCurrentEnquiry({ ...currentEnquiry, status });

    toast({
      title: "Status Updated",
      description: `Enquiry status changed to ${status}`,
    });
  };

  const handleUpdatePriority = (priority: "low" | "medium" | "high") => {
    if (!currentEnquiry) return;

    const updatedEnquiries = enquiries.map((enq) =>
      enq.id === currentEnquiry.id ? { ...enq, priority } : enq
    );

    setEnquiries(updatedEnquiries);
    setCurrentEnquiry({ ...currentEnquiry, priority });

    toast({
      title: "Priority Updated",
      description: `Enquiry priority changed to ${priority}`,
    });
  };

  // Filter enquiries based on search and status
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || enquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "default";
      case "in-progress":
        return "outline";
      case "resolved":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Enquiries</h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to customer enquiries
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <div>
            <CardTitle>All Enquiries</CardTitle>
            <CardDescription>
              View and respond to customer questions and issues
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center bg-muted rounded-md">
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search enquiries..."
                className="border-0 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnquiries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No enquiries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <TableRow key={enquiry.id}>
                    <TableCell>{enquiry.id}</TableCell>
                    <TableCell>
                      <div>{enquiry.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {enquiry.email}
                      </div>
                    </TableCell>
                    <TableCell>{enquiry.subject}</TableCell>
                    <TableCell>{enquiry.dateCreated}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(enquiry.status)}>
                        {enquiry.status === "in-progress"
                          ? "In Progress"
                          : enquiry.status.charAt(0).toUpperCase() +
                            enquiry.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getPriorityBadgeVariant(enquiry.priority)}
                      >
                        {enquiry.priority.charAt(0).toUpperCase() +
                          enquiry.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleViewEnquiry(enquiry)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Enquiry Details Dialog */}
      {currentEnquiry && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-start gap-4">
                <span>{currentEnquiry.subject}</span>
                <div className="flex gap-2 items-center">
                  <Badge
                    variant={getPriorityBadgeVariant(currentEnquiry.priority)}
                  >
                    {currentEnquiry.priority.charAt(0).toUpperCase() +
                      currentEnquiry.priority.slice(1)}{" "}
                    Priority
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(currentEnquiry.status)}>
                    {currentEnquiry.status === "in-progress"
                      ? "In Progress"
                      : currentEnquiry.status.charAt(0).toUpperCase() +
                        currentEnquiry.status.slice(1)}
                  </Badge>
                </div>
              </DialogTitle>
              <DialogDescription className="space-y-1">
                <div>
                  From: {currentEnquiry.customer} ({currentEnquiry.email})
                </div>
                <div>Date: {currentEnquiry.dateCreated}</div>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Original enquiry */}
              <div className="bg-muted p-4 rounded-md">
                <div className="font-medium mb-2">Customer Enquiry:</div>
                <p className="whitespace-pre-line text-sm">
                  {currentEnquiry.message}
                </p>
              </div>

              {/* Conversation history */}
              {currentEnquiry.responses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Previous Responses:</h4>
                  {currentEnquiry.responses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-secondary/20 p-4 rounded-md"
                    >
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>{response.staffName}</span>
                        <span>{response.dateCreated}</span>
                      </div>
                      <p className="whitespace-pre-line text-sm">
                        {response.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Response form */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={currentEnquiry.status}
                      onValueChange={(
                        value: "new" | "in-progress" | "resolved"
                      ) => handleUpdateStatus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={currentEnquiry.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        handleUpdatePriority(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Type your response here..."
                    className="min-h-32"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={!responseMessage.trim()}
              >
                Send Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
