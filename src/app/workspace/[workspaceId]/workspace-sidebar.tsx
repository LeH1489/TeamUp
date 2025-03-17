import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  AlertTriangle,
  HashIcon,
  Loader,
  CalendarClock,
  Database,
} from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import { useGetMembers } from "@/features/members/api/use-get-member";
import { UserItem } from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import { Separator } from "@/components/ui/separator";
import { useMemberId } from "@/hooks/use-member-id";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

export const WorkspaceSidebar = () => {
  const memberId = useMemberId();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const pathname = usePathname();

  // Kiểm tra xem user có đang ở trang events, resources, tasks
  const pathChecks = useMemo(
    () => ({
      isEventsActive: pathname === `/workspace/${workspaceId}/channel/events`,
      isResourcesActive:
        pathname === `/workspace/${workspaceId}/channel/resources`,
    }),
    [pathname, workspaceId] // Add pathname to dependencies
  );

  const [_open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: worksapce, isLoading: worksapceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });

  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  // Memoize loading state
  const isLoading = useMemo(
    () =>
      worksapceLoading || memberLoading || channelsLoading || membersLoading,
    [worksapceLoading, memberLoading, channelsLoading, membersLoading]
  );

  //loading animation
  if (isLoading) {
    return <LoadingSpinner />;
  }

  //fetching data error
  if (!worksapce || !member) {
    return (
      <div className="flex flex-col bg-[#f2eded] h-full items-center justify-center">
        <AlertTriangle className="size-5 text-black" />
        <p className="text-black text-sm">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#f2eded] h-full">
      <WorkspaceHeader
        workspace={worksapce}
        isAdmin={member.role === "admin"}
      />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem
          label="Events"
          icon={CalendarClock}
          id="events"
          variant={pathChecks.isEventsActive ? "active" : "default"}
        />
        <SidebarItem
          label="Public resources"
          icon={Database}
          id="resources"
          variant={pathChecks.isResourcesActive ? "active" : "default"}
        />
      </div>

      <Separator className="mt-3 bg-slate-300 h-[0.5px] w-full" />

      <WorkspaceSection
        label="Channels"
        hint="New channel"
        onNew={member.role === "admin" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            icon={HashIcon}
            label={item.name}
            id={item._id}
            variant={channelId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>

      <Separator className="mt-3 bg-slate-300 h-[1px] w-full" />

      <WorkspaceSection
        label="Direct messages"
        hint="New direct message"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem
            key={item._id}
            id={item._id}
            label={item.user.name}
            image={item.user.image}
            variant={item._id === memberId ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};

// Tách components nhỏ để tối ưu re-render
const LoadingSpinner = React.memo(() => (
  <div className="flex flex-col bg-[#f2eded] h-full items-center justify-center">
    <Loader className="size-5 animate-spin text-black" />
  </div>
));
