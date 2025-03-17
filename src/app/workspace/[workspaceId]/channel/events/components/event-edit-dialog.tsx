import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateEvent } from "@/features/events/api/use-update-event";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "../../../../../../../convex/_generated/dataModel";

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    _id: Id<"events">;
    title: string;
    content: string;
    deadline: number;
    status: "pending" | "expired";
  };
  onSuccess?: () => void;
}

export const EditEventDialog = ({
  open,
  onOpenChange,
  event,
  onSuccess,
}: EditEventDialogProps) => {
  const [title, setTitle] = useState(event.title);
  const [content, setContent] = useState(event.content);
  const [deadlineStr, setDeadlineStr] = useState("");
  const [status, setStatus] = useState<"pending" | "expired">(event.status);

  const { mutate: updateEvent, isPending } = useUpdateEvent();

  // Cập nhật state khi event thay đổi
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setContent(event.content);
      setDeadlineStr(format(new Date(event.deadline), "yyyy-MM-dd"));
      setStatus(event.status);
    }
  }, [event]);

  const handleSubmit = async () => {
    if (!title || !content || !deadlineStr) {
      return;
    }

    // Convert deadline string to timestamp
    const deadline = new Date(deadlineStr).getTime();

    try {
      await updateEvent({
        id: event._id,
        title,
        content,
        deadline,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Event
          </DialogTitle>
          <DialogDescription className="mt-1.5">
            Make changes to the event details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 w-full">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex justify-end items-center">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="flex justify-end items-start pt-2">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
              rows={10}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="flex justify-end items-center">
              <Label htmlFor="deadline" className="text-right">
                Deadline
              </Label>
            </div>
            <Input
              id="deadline"
              type="date"
              value={deadlineStr}
              onChange={(e) => setDeadlineStr(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="flex justify-end items-center">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
            </div>
            <Select
              value={status}
              onValueChange={(value: "pending" | "expired") => setStatus(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-[#d82f5a]"
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
