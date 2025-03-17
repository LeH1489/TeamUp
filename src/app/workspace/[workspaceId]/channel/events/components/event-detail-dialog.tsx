import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    title: string;
    content: string;
    deadline: number;
    status: "pending" | "expired";
    creator?: {
      name: string;
      image?: string;
    };
  } | null;
}

export const EventDetailDialog = ({
  open,
  onOpenChange,
  event,
}: EventDetailDialogProps) => {
  if (!event) return null;

  const now = Date.now();
  let displayStatus = event.status;

  if (event.status === "pending" && event.deadline < now) {
    displayStatus = "expired";
  }

  // Format deadline date
  const formattedDeadline = format(new Date(event.deadline), "dd/MM/yyyy");

  // Get status display
  const getStatusDisplay = () => {
    switch (event.status) {
      case "pending":
        return { text: "Pending", color: "bg-yellow-100 text-yellow-800" };
      case "expired":
        return { text: "Expired", color: "bg-red-100 text-red-800" };
      default:
        return { text: "Unknown", color: "bg-gray-100 text-gray-800" };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="overflow-hidden">
          <DialogTitle className="text-xl truncate">{event.title}</DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Created by {event.creator?.name || "Unknown"}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}
            >
              {displayStatus}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1">
          <div className="bg-slate-100 p-4 rounded-md mb-4 whitespace-pre-wrap">
            {event.content}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold">Deadline:</span>
              <span>{formattedDeadline}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold">Status:</span>
              <span
                className={statusDisplay.color
                  .replace("bg-", "text-")
                  .replace("-100", "-600")}
              >
                {displayStatus}
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold">Time Remaining:</span>
              <span>
                {event.status === "expired"
                  ? "Expired"
                  : formatTimeRemaining(event.deadline)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to format time remaining
function formatTimeRemaining(deadline: number): string {
  const now = Date.now();
  if (deadline < now) return "Expired";

  const diff = deadline - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} and ${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
}
