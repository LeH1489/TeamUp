import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";

interface ThreadBarProps {
  count?: number;
  image?: string | null | undefined;
  timeStamp?: number;
  onClick?: () => void;
  name?: string;
}

export const ThreadBar = ({
  count,
  image,
  timeStamp,
  onClick,
  name = "Member",
}: ThreadBarProps) => {
  const avatarFallback = name.charAt(0).toUpperCase();

  if (!count && !timeStamp) return null;

  return (
    <Button
      onClick={onClick}
      className="p-1 bg-white rounded-md hover:bg-white border border-transparent hover:border-border
      flex items-center justify-start group/thread-bar transition-all max-w-[600px]"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={image || undefined} />
          <AvatarFallback className="bg-[#d82f5a] text-white rounded-md">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-sky-700 hover:underline font-bold truncate">
          {count !== undefined
            ? `${count} ${count > 1 ? "replies" : "reply"}`
            : ""}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden block">
          {timeStamp !== undefined &&
            `Last reply ${formatDistanceToNow(timeStamp, { addSuffix: true })}`}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:block hidden">
          View thread
        </span>
      </div>
      <ChevronRight
        className="size-4 text-muted-foreground ml-auto opacity-0 
      group-hover/thread-bar:opacity-100 transition shrink-0"
      />
    </Button>
  );
};
