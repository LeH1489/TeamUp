import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEvent } from "@/features/events/api/use-create-event";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useState } from "react";
import { toast } from "sonner";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
}

export const EventDialog = ({ open, onOpenChange, mode }: EventDialogProps) => {
  const workspaceId = useWorkspaceId();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deadline, setDeadline] = useState("");

  const { mutate: createEvent, isPending } = useCreateEvent();

  const handleSubmit = () => {
    if (!title || !content || !deadline) {
      toast.error("Please fill all fields");
      return;
    }

    // Convert deadline string to timestamp
    const deadlineTimestamp = new Date(deadline).getTime();

    createEvent(
      {
        workspaceId,
        title,
        content,
        deadline: deadlineTimestamp,
      },
      {
        onSuccess: () => {
          toast.success("Event created successfully");
          onOpenChange(false);
          // Reset form
          setTitle("");
          setContent("");
          setDeadline("");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create event");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create new event" : "Edit event"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for this event.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-y-4 py-2">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex justify-end items-center">
              <Label htmlFor="title">Title</Label>
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
              <Label htmlFor="content">Content</Label>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="flex justify-end items-center">
              <Label htmlFor="deadline">Deadline</Label>
            </div>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-[#d82f5a]"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
