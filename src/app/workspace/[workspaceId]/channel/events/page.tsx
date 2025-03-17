"use client";

import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { EventsHeader } from "./components/events-header";
import { AddEventButton } from "./components/add-event-button";
import { EventCard } from "./components/event-card";
import { useGetEvents } from "@/features/events/api/use-get-events";
import { useState } from "react";
import { EventDetailDialog } from "./components/event-detail-dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { useRemoveEvent } from "@/features/events/api/use-remove-event";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { EditEventDialog } from "./components/event-edit-dialog";
import { Loader } from "lucide-react";
import { debounce } from "lodash";

export default function EventsPage() {
  const workspaceId = useWorkspaceId();
  const { data: events, isLoading: isLoadingEvents } = useGetEvents({
    workspaceId,
  });
  const { data: member } = useCurrentMember({ workspaceId });
  const { mutate: removeEvent } = useRemoveEvent();

  const isAdmin = member?.role === "admin";
  // State để quản lý dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  // Hàm xử lý khi click vào event card
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  // Hàm xử lý khi click vào nút Edit
  const handleEditClick = (id: string) => {
    const eventToEdit = events?.find((event) => event._id === id);
    if (eventToEdit) {
      setEventToEdit(eventToEdit);
      setIsEditDialogOpen(true);
    }
  };

  // Hàm xử lý khi click vào nút Delete
  const handleDeleteClick = debounce(async (id: string) => {
    const confirmed = await confirm();
    if (confirmed) {
      try {
        await removeEvent({ id: id as Id<"events"> });
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error("Failed to delete event");
        console.error("Error deleting event:", error);
      }
    }
  }, 300);

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You will delete this event."
  );

  return (
    <>
      <ConfirmDialog />
      <EventDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={selectedEvent}
      />
      {eventToEdit && (
        <EditEventDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          event={eventToEdit}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            toast.success("Event updated successfully");
          }}
        />
      )}
      <div className="flex flex-col h-full">
        <EventsHeader eventName="Events" />
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-3 overflow-y-auto">
          {isAdmin && <AddEventButton />}

          {events?.map((event) => (
            <EventCard
              key={event._id}
              id={event._id}
              title={event.title}
              content={event.content}
              deadline={event.deadline}
              status={event.status}
              onClick={() => handleEventClick(event)}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}

          {isLoadingEvents && (
            <div className="col-span-full flex justify-center p-4">
              <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoadingEvents && events?.length === 0 && (
            <div className="col-span-full flex justify-center p-4">
              No events found.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
