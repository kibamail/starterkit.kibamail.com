"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { WebhookDestination } from "@/webhooks/client/types";
import { internalApi } from "@/lib/api/client";
import { WebhookEventsTable } from "./webhook-events-table";
import { WebhookEventsFilter } from "./webhook-events-filter";
import { WebhookStatusFilter } from "./webhook-status-filter";

interface WebhookDetailClientProps {
  destination: WebhookDestination;
}

type TimePeriod = "24h" | "14d" | "30d";
type StatusFilter = "all" | "success" | "failed";

export function WebhookDetailClient({ destination }: WebhookDetailClientProps) {
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24h");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Calculate start date based on time period
  const getStartDate = (period: TimePeriod): string => {
    switch (period) {
      case "24h":
        return dayjs().subtract(24, "hours").toISOString();
      case "14d":
        return dayjs().subtract(14, "days").toISOString();
      case "30d":
        return dayjs().subtract(30, "days").toISOString();
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "webhook-events",
      destination.id,
      nextCursor,
      prevCursor,
      timePeriod,
      statusFilter,
    ],
    queryFn: () =>
      internalApi.webhooks().listEvents(destination.id || "", {
        next: nextCursor || undefined,
        prev: prevCursor || undefined,
        start: getStartDate(timePeriod),
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const events = data?.events || [];
  const pagination = {
    count: data?.count || 0,
    next: data?.next || null,
    prev: data?.prev || null,
  };

  const handleNextPage = () => {
    if (pagination.next) {
      setNextCursor(pagination.next);
      setPrevCursor(null);
    }
  };

  const handlePrevPage = () => {
    if (pagination.prev) {
      setPrevCursor(pagination.prev);
      setNextCursor(null);
    }
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    // Reset pagination when time period changes
    setNextCursor(null);
    setPrevCursor(null);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    // Reset pagination when status filter changes
    setNextCursor(null);
    setPrevCursor(null);
  };

  return (
    <>
      <div className="mt-4 flex justify-start gap-2">
        <WebhookEventsFilter
          value={timePeriod}
          onChange={handleTimePeriodChange}
        />
        <WebhookStatusFilter
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
      </div>
      <WebhookEventsTable
        events={events}
        pagination={pagination}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        destinationId={destination.id || ""}
        isLoading={isLoading}
      />
    </>
  );
}
