import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { format } from "date-fns";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

interface EventCardProps {
  id: string; // Thêm id để xác định event
  title: string;
  content: string;
  deadline: number;
  status: "pending" | "expired";
  onClick: () => void;
  onEdit?: (id: string) => void; // Thêm handler cho sự kiện edit
  onDelete?: (id: string) => void; // Thêm handler cho sự kiện delete
}

export const EventCard = ({
  id,
  title,
  content,
  deadline,
  status,
  onClick,
  onEdit,
  onDelete,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const { data: member } = useCurrentMember({ workspaceId });
  const isAdmin = member?.role === "admin";

  // Format deadline date
  const formattedDeadline = format(new Date(deadline), "dd/MM/yyyy");

  const now = Date.now();
  let displayStatus = status;

  if (status === "pending" && deadline < now) {
    displayStatus = "expired";
  }

  // Get status display text and color
  const getStatusDisplay = () => {
    switch (status) {
      case "pending":
        return { text: "Pending", color: "text-yellow-600" };
      case "expired":
        return { text: "Expired", color: "text-red-600" };
      default:
        return { text: "Unknown", color: "text-gray-600" };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Ngăn sự kiện click lan truyền đến card khi click vào dropdown
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className="w-full h-56 cursor-pointer hover:border-[#d82f5a] hover:border"
      onClick={onClick}
    >
      <CardHeader className="border-slate-200 border-b mb-2 flex flex-row justify-between items-center h-14 overflow-hidden">
        <div className="overflow-hidden">
          <CardTitle
            className="truncate text-base leading-normal"
            title={title}
          >
            {title}
          </CardTitle>
        </div>

        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
              <Button
                variant="ghost"
                size="iconSm"
                className="text-black hover:bg-[#f2eded]"
              >
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(id);
                }}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(id);
                }}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="h-20">
        <p className="line-clamp-3">{content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p>
          <span className="font-semibold text-[#d82f5a]">Deadline: </span>
          {formattedDeadline}
        </p>
        <p>
          <span className="font-semibold text-[#d82f5a]">Status: </span>
          <span className={statusDisplay.color}>{displayStatus}</span>
        </p>
      </CardFooter>
    </Card>
  );
};
