import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";

interface SidebarButtonProps {
  icon: LucideIcon | IconType;
  label: string;
  isActive?: boolean;
}

const SidebarButton = ({ icon: Icon, label, isActive }: SidebarButtonProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-0.5 cursor-pointer group">
      <Button
        variant="transparent"
        className={cn(
          "size-9 p-2 group-hover:bg-[#d82f5a]/20 rounded-full",
          isActive && "bg-[#d82f5a] "
        )}
      >
        <Icon
          className={cn(
            "size-5 text-black group-hover:scale-110 group-hover:text-[#d82f5a] transition-all",
            isActive && "text-white"
          )}
        />
      </Button>
      <span className="text-[11px] text-black font-semibold group-hover:text-[#d82f5a]">
        {label}
      </span>
    </div>
  );
};

export default SidebarButton;
