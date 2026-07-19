"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket, Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { authHeaders } from "@/lib/fetch";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

export function SupportPage() {
  const { auth, navigate } = useAppStore();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    enabled: !!auth.user,
    queryFn: async () => {
      const res = await fetch("/api/support", {
        headers: authHeaders(auth.token),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      subject: string;
      message: string;
      orderId?: string;
      priority: string;
    }) => {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(auth.token),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Support ticket created");
      setSubject("");
      setMessage("");
      setOrderId("");
      setPriority("medium");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: () => toast.error("Failed to create ticket"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    createMutation.mutate(
      {
        subject,
        message,
        orderId: orderId || undefined,
        priority,
      },
      {
        onSettled: () => setSubmitting(false),
      }
    );
  };

  if (!auth.user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to access support</h1>
        <Button onClick={() => navigate("login")}>Log In</Button>
      </div>
    );
  }

  const tickets = data?.tickets || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground mt-1">
            Need help? Create a support ticket and we&apos;ll get back to you.
          </p>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {formOpen && (
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Create Support Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID (optional)</Label>
                <Input
                  id="orderId"
                  placeholder="Related order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Ticket
              </Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="p-12 text-center">
          <Ticket className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No support tickets yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create a ticket and our team will help you.
          </p>
          <Button onClick={() => setFormOpen(true)}>Create Your First Ticket</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket: any) => (
            <Card key={ticket.id} className="overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium text-sm">{ticket.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString()} · Order #
                        {ticket.Order?.orderNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={statusColors[ticket.status] || ""}>
                      {ticket.status}
                    </Badge>
                    {expandedId === ticket.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              {expandedId === ticket.id && (
                <div className="px-4 pb-4 pt-2 border-t">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Your Message</p>
                      <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                    {ticket.adminReply && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Admin Reply</p>
                        <p className="text-sm whitespace-pre-wrap">{ticket.adminReply}</p>
                        {ticket.repliedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(ticket.repliedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Priority: {ticket.priority}</span>
                      <span>·</span>
                      <span>Status: {ticket.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
