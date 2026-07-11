"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ticket,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { adminFetch } from "@/lib/fetch";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

export function AdminSupport() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-support", statusFilter, page],
    queryFn: async () => {
      const url = new URL("/api/admin/support", window.location.origin);
      if (statusFilter) url.searchParams.set("status", statusFilter);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", "20");
      const res = await adminFetch(url.toString());
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      priority,
    }: {
      id: string;
      status?: string;
      priority?: string;
    }) => {
      const res = await adminFetch(`/api/admin/support/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Ticket updated");
      queryClient.invalidateQueries({ queryKey: ["admin-support"] });
    },
    onError: () => toast.error("Failed to update ticket"),
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, adminReply }: { id: string; adminReply: string }) => {
      const res = await adminFetch(`/api/admin/support/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reply sent");
      setReplyTicketId(null);
      setReplyText("");
      setReplying(false);
      queryClient.invalidateQueries({ queryKey: ["admin-support"] });
    },
    onError: () => {
      toast.error("Failed to send reply");
      setReplying(false);
    },
  });

  const handleReply = (ticketId: string) => {
    setReplying(true);
    replyMutation.mutate({ id: ticketId, adminReply: replyText });
  };

  const tickets = data?.tickets || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  const filtered = search
    ? tickets.filter(
        (t: any) =>
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.message.toLowerCase().includes(search.toLowerCase()) ||
          t.User?.email.toLowerCase().includes(search.toLowerCase())
      )
    : tickets;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground text-sm">
            Manage customer support requests
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ticket: any) => (
                <Card key={ticket.id} className="border-l-4 border-l-primary/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {ticket.subject}
                          </h4>
                          <Badge
                            variant="secondary"
                            className={statusColors[ticket.status] || ""}
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {ticket.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{ticket.User?.name || "Unknown"}</span>
                          <span>·</span>
                          <span>{ticket.User?.email}</span>
                          <span>·</span>
                          <span>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          {ticket.Order && (
                            <>
                              <span>·</span>
                              <span>Order #{ticket.Order.orderNumber}</span>
                            </>
                          )}
                        </div>
                        {ticket.adminReply && (
                          <div className="mt-2 bg-muted/50 p-2 rounded text-xs">
                            <span className="font-medium">Admin: </span>
                            <span className="text-muted-foreground line-clamp-1">
                              {ticket.adminReply}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={ticket.status}
                          onValueChange={(status) =>
                            updateMutation.mutate({ id: ticket.id, status })
                          }
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs h-8"
                        onClick={() =>
                          setReplyTicketId(
                            replyTicketId === ticket.id ? null : ticket.id
                          )
                        }
                      >
                        {replyTicketId === ticket.id ? (
                          <>
                            <ChevronUp className="h-3 w-3" /> Cancel Reply
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" /> Reply
                          </>
                        )}
                      </Button>
                      {replyTicketId === ticket.id && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReply(ticket.id)}
                              disabled={replying || !replyText.trim()}
                            >
                              {replying && (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              )}
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
