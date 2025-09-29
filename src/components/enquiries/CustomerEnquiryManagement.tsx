"use client";
import { useEffect, useState } from "react";
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
import HttpService from "@/service/httpService";
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
import { routes } from "@/service/api-routes";

// --- Types matching your API shape ---
interface ApiResponse {
  statusCode?: number;
  displayMessage?: string;
  result: TicketDto[];
  errorMessages?: any;
}

interface TicketDto {
  ticketNumber: string;
  user: ApiUser;
  userId: string;
  status: string;
  supportMessages: SupportMessageDto[];
  id: string;
  created: string;
  dateUpdated?: string | null;
  isDeleted?: boolean;
}

interface ApiUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string | null;
  country?: string;
  id?: string;
  // (other fields exist but not used in UI)
}

interface SupportMessageDto {
  supportTicket?: any | null;
  supportTicketId?: string;
  ticketid?: string;
  message: string;
  isAdmin: boolean;
  id: string;
  created: string;
  dateUpdated?: string | null;
  isDeleted?: boolean;
}

// --- View model used in the component ---
interface CustomerEnquiry {
  id: string; // ticket id
  ticketNumber: string;
  customerName: string;
  email: string;
  subject: string; // preview
  messages: SupportMessageDto[];
  status: string;
  dateCreated: string;
  user: ApiUser;
}

const mapTicketToEnquiry = (t: TicketDto): CustomerEnquiry => {
  const customerName =
    `${t.user?.firstName ?? ""} ${t.user?.lastName ?? ""}`.trim() || "Unknown";
  const subject =
    t.supportMessages && t.supportMessages.length > 0
      ? t.supportMessages[t.supportMessages.length - 1].message.slice(0, 120)
      : "No message available";

  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    customerName,
    email: t.user?.email ?? "",
    subject,
    messages: t.supportMessages || [],
    status: t.status || "Open",
    dateCreated: t.created,
    user: t.user,
  };
};

export function CustomerEnquiryManagement() {
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [currentEnquiry, setCurrentEnquiry] = useState<CustomerEnquiry | null>(
    null
  );
  const [responseMessage, setResponseMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshToggle, setRefreshToggle] = useState<number>(0); // to refetch after actions
  const [error, setError] = useState<string | null>(null);

  // NEW state: confirmation dialog for closing ticket
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [closeInProgress, setCloseInProgress] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await HttpService.getData(routes.getEnquiry());

        console.log("Fetched tickets:", res);
        // if your API returns result directly as array, handle that too
        const tickets = Array.isArray(res)
          ? res
          : (res as unknown as TicketDto[]);
        const mapped = tickets.map(mapTicketToEnquiry);
        setEnquiries(mapped);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message ?? "An error occurred while fetching tickets.");
        toast({
          title: "Failed to load tickets",
          description: err.message ?? "See console for details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToggle]); // re-run when refreshToggle changes

  const refresh = () => setRefreshToggle((s) => s + 1);

  const handleViewEnquiry = (enquiry: CustomerEnquiry) => {
    setCurrentEnquiry(enquiry);
    setIsDialogOpen(true);
  };

  // POST a message to backend, optimistic update but prepend on success
  const handleSendResponse = async () => {
    if (!currentEnquiry || !responseMessage.trim()) return;

    const payload = {
      message: responseMessage.trim(),
      ticketid: currentEnquiry.ticketNumber, // API expects "ticketid" — using ticketNumber from UI
      isAdmin: true,
    };

    // optimistic local message (temp) - prepend
    const tempMsg: SupportMessageDto = {
      supportTicket: null,
      supportTicketId: currentEnquiry.id,
      ticketid: currentEnquiry.id,
      message: payload.message,
      isAdmin: true,
      id: `local-${Math.random().toString(36).slice(2, 9)}`,
      created: new Date().toISOString(),
      dateUpdated: null,
      isDeleted: false,
    };

    // Prepend temp message to the local state
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === currentEnquiry.id
          ? { ...e, messages: [tempMsg, ...e.messages] }
          : e
      )
    );
    setCurrentEnquiry({
      ...currentEnquiry,
      messages: [tempMsg, ...currentEnquiry.messages],
    });
    setResponseMessage("");

    try {
      const res = await HttpService.postData(
        payload,
        routes.sendTicketMessage()
      );

      // Try to parse created message from response body
      const created = res;

      // If backend returns a created message object with an id, replace the temp one.

      toast({
        title: "Response Sent",
        description: "Your response has been posted.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to send response",
        description: err.message ?? "See console for details.",
      });
      // Rollback: remove the temp message we prepended
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === currentEnquiry.id
            ? {
                ...e,
                messages: e.messages.filter((m) => !m.id.startsWith("local-")),
              }
            : e
        )
      );
      setCurrentEnquiry((c) =>
        c
          ? {
              ...c,
              messages: c.messages.filter((m) => !m.id.startsWith("local-")),
            }
          : c
      );
      // Optional: refresh to get server state
      // refresh();
    }
  };

  // PATCH / update status (local only unless you implement server call)
  const handleUpdateStatus = async (status: string) => {
    if (!currentEnquiry) return;

    const prevStatus = currentEnquiry.status;
    // optimistic update
    setEnquiries((prev) =>
      prev.map((e) => (e.id === currentEnquiry.id ? { ...e, status } : e))
    );
    setCurrentEnquiry({ ...currentEnquiry, status });

    // NOTE: Implement server status update if you have endpoint.
  };

  // NEW: open close confirmation dialog (keeps current enquiry open)
  const openCloseConfirm = () => setIsCloseConfirmOpen(true);

  // NEW: perform close ticket action with optimistic update + rollback
  const handleConfirmClose = async () => {
    if (!currentEnquiry) return;
    setCloseInProgress(true);

    const prevStatus = currentEnquiry.status;

    // optimistic
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === currentEnquiry.id ? { ...e, status: "Closed" } : e
      )
    );
    setCurrentEnquiry({ ...currentEnquiry, status: "Closed" });

    try {
      const payload = { ticketid: currentEnquiry.ticketNumber };
      // NOTE: the curl you provided sends { "ticketid": "4356454hg4" }
      // we're using ticketNumber here to match that shape — change to currentEnquiry.id if your API expects internal id.
      await HttpService.postData(payload, routes.closeTicket());

      toast({
        title: "Ticket Closed",
        description: `Ticket ${currentEnquiry.ticketNumber} has been closed.`,
      });
      setIsCloseConfirmOpen(false);
    } catch (err: any) {
      console.error(err);
      // rollback
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === currentEnquiry.id ? { ...e, status: prevStatus } : e
        )
      );
      setCurrentEnquiry((c) => (c ? { ...c, status: prevStatus } : c));

      toast({
        title: "Failed to close ticket",
        description: err.message ?? "See console for details.",
      });
    } finally {
      setCloseInProgress(false);
    }
  };

  // Filter enquiries based on search and status
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q && statusFilter === "all") return true;

    const nameMatches = enquiry.customerName.toLowerCase().includes(q);
    const emailMatches = enquiry.email.toLowerCase().includes(q);
    const ticketMatches = enquiry.ticketNumber.toLowerCase().includes(q);
    const messageMatches = enquiry.messages.some((m) =>
      m.message.toLowerCase().includes(q)
    );

    const matchesSearch =
      q === ""
        ? true
        : nameMatches || emailMatches || ticketMatches || messageMatches;
    const matchesStatus =
      statusFilter === "all" || enquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "default";
      case "pending":
        return "outline";
      case "resolved":
      case "closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Support Tickets</h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to support tickets
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <div>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>
              View and respond to customer support tickets
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center bg-muted rounded-md">
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search by name, email, ticket or message..."
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
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading tickets...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-destructive">
              Error: {error}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnquiries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell>{enquiry.ticketNumber}</TableCell>
                      <TableCell>
                        <div>{enquiry.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {enquiry.email}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {enquiry.subject}
                      </TableCell>
                      <TableCell>
                        {new Date(enquiry.dateCreated).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(enquiry.status)}>
                          {enquiry.status}
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
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      {currentEnquiry && (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-start gap-4">
                  <span>{currentEnquiry.ticketNumber}</span>
                  <div className="flex gap-2 items-center">
                    <Badge
                      variant={getStatusBadgeVariant(currentEnquiry.status)}
                    >
                      {currentEnquiry.status}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription className="space-y-1">
                  <div>
                    From: {currentEnquiry.customerName} ({currentEnquiry.email})
                  </div>
                  <div>
                    Date:{" "}
                    {new Date(currentEnquiry.dateCreated).toLocaleString()}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Conversation history */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Conversation:</h4>
                  {currentEnquiry.messages.length === 0 ? (
                    <div className="p-4 bg-muted rounded">No messages yet.</div>
                  ) : (
                    currentEnquiry.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-4 rounded-md ${
                          m.isAdmin ? "bg-secondary/20" : "bg-muted"
                        }`}
                      >
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>
                            {m.isAdmin
                              ? "Support"
                              : currentEnquiry.customerName}
                          </span>
                          <span>{new Date(m.created).toLocaleString()}</span>
                        </div>
                        <p className="whitespace-pre-line text-sm">
                          {m.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Response form */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={currentEnquiry.status}
                        onValueChange={(value: string) =>
                          handleUpdateStatus(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
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
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={handleSendResponse}
                  disabled={!responseMessage.trim()}
                >
                  Send Response
                </Button>

                {/* Close ticket button opens confirmation dialog */}
                <Button
                  variant="destructive"
                  onClick={openCloseConfirm}
                  className="ml-auto"
                  disabled={currentEnquiry.status.toLowerCase() === "closed"}
                >
                  Close Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirmation dialog for closing ticket */}
          <Dialog
            open={isCloseConfirmOpen}
            onOpenChange={setIsCloseConfirmOpen}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Close ticket</DialogTitle>
                <DialogDescription>
                  Are you sure you want to close ticket{" "}
                  {currentEnquiry.ticketNumber}? This action will mark the
                  ticket as closed and should only be used when the issue is
                  resolved.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCloseConfirmOpen(false)}
                  disabled={closeInProgress}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmClose}
                  disabled={closeInProgress}
                >
                  {closeInProgress ? "Closing..." : "Yes, close ticket"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
