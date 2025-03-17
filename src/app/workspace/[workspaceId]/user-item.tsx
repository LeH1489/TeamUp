import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { throttle } from "lodash";

interface UserItemProps {
  id: Id<"members">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof userItemVariants>["variant"];
}

const userItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-black",
        active: "text-white bg-[#d82f5a] hover:bg-[#d82f5a]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const UserItem = React.memo(
  ({ id, label = "Member", image, variant }: UserItemProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();

    // Cache values
    const avatarFallback = useMemo(
      () => label.charAt(0).toUpperCase(),
      [label]
    );
    const className = useMemo(
      () => cn(userItemVariants({ variant })),
      [variant]
    );

    // Throttle navigation
    // Tạo throttled function một lần duy nhất và lưu nó vào ref
    const throttledNavigate = useRef(
      throttle(
        (workspaceId: string, id: string) => {
          router.prefetch(`/workspace/${workspaceId}/member/${id}`);
          router.push(`/workspace/${workspaceId}/member/${id}`);
        },
        200,
        { trailing: false }
      )
    ).current;

    // Cache handler function gọi đến throttled function
    const handleClick = useCallback(() => {
      throttledNavigate(workspaceId, id);
    }, [workspaceId, id, throttledNavigate]);

    // Cleanup throttled function khi component unmount
    useEffect(() => {
      return () => {
        throttledNavigate.cancel();
      };
    }, [throttledNavigate]);

    return (
      <Button
        onClick={handleClick}
        variant="transparent"
        className={className}
        size="sm"
      >
        <Avatar className="size-5 rounded-md mr-1">
          <AvatarImage className="rounded-md" src={image} />
          <AvatarFallback className="rounded-full bg-[#d82f5a] text-white text-xs">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm truncate">{label}</span>
      </Button>
    );
  }
);

UserItem.displayName = "UserItem";
