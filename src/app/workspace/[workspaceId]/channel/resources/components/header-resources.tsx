import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";

interface HeaderResourcesProps {
  resourceName: string;
}

export const HeaderResources = ({ resourceName }: HeaderResourcesProps) => {
  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <p className="text-lg font-semibold"># {resourceName}</p>
    </div>
  );
};
