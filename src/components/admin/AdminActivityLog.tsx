'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminFetch } from '@/lib/admin-fetch';

interface ActivityLogEntry {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  User?: { id: string; name: string; email: string } | null;
}

function getActionBadgeClasses(action: string): string {
  if (action.includes('.create')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (action.includes('.update')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (action.includes('.delete')) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
  if (action === 'user.login') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
  if (action.includes('.bulk')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
}

function formatActionLabel(action: string): string {
  return action.replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function parseDetails(details: string | null): string {
  if (!details) return '—';
  try {
    const parsed = JSON.parse(details);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return details;
  }
}

export function AdminActivityLog() {
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('all');
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());

  const limit = 20;

  const { data, isLoading: loading } = useQuery({
    queryKey: ['admin-activity-logs', page, entityFilter],
    queryFn: async () => {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });
        if (entityFilter && entityFilter !== 'all') {
            params.set('entity', entityFilter);
        }
        const res = await adminFetch(`/api/activity-logs?${params.toString()}`);
        if (!res.ok) throw new Error('Failed');
        return res.json();
    }
  });

  const logs = data?.activityLogs || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const total = data?.pagination?.total || 0;

  const handleEntityFilterChange = (value: string) => {
    setEntityFilter(value);
    setPage(1);
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Log</h2>
          <p className="text-muted-foreground mt-1">Recent activity across the system</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={entityFilter} onValueChange={handleEntityFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Category">Category</SelectItem>
              <SelectItem value="Blog">Blog</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Enquiry">Enquiry</SelectItem>
              <SelectItem value="Page">Page</SelectItem>
              <SelectItem value="Banner">Banner</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Redirect">Redirect</SelectItem>
              <SelectItem value="Settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Log Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No activity logs yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Activity will appear here when actions are performed
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Timestamp</TableHead>
                    <TableHead className="w-[140px]">User</TableHead>
                    <TableHead className="w-[140px]">Action</TableHead>
                    <TableHead className="w-[100px]">Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const isExpanded = expandedDetails.has(log.id);
                    const detailsText = parseDetails(log.details);
                    const isLong = detailsText.length > 80;

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {log.userName || log.User?.name || 'System'}
                            </span>
                            {log.ipAddress && (
                              <span className="text-xs text-muted-foreground">
                                {log.ipAddress}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getActionBadgeClasses(log.action)}
                          >
                            {formatActionLabel(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.entity ? (
                            <Badge variant="outline">{log.entity}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="flex items-start gap-1">
                            <div
                              className={`text-sm text-muted-foreground whitespace-pre-wrap font-mono ${
                                isLong && !isExpanded ? 'line-clamp-2' : ''
                              }`}
                            >
                              {detailsText}
                            </div>
                            {isLong && (
                              <button
                                onClick={() => toggleDetails(log.id)}
                                className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {renderPageNumbers().map(p => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
