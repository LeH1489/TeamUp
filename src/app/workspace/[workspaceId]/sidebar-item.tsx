"use client";

import { LucideIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { IconType } from "react-icons/lib";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { throttle } from "lodash";

interface SidebarItemProps {
  label: string;
  id: string;
  icon: LucideIcon | IconType;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
}

const sidebarItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden",
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

export const SidebarItem = React.memo(
  ({ label, id, icon: Icon, variant }: SidebarItemProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();

    // Cache className
    const className = useMemo(
      () => cn(sidebarItemVariants({ variant })),
      [variant]
    );

    // Tạo throttled function một lần duy nhất
    const throttledNavigate = useRef(
      throttle(
        (workspaceId: string, id: string) => {
          router.prefetch(`/workspace/${workspaceId}/channel/${id}`);
          router.push(`/workspace/${workspaceId}/channel/${id}`);
        },
        200,
        { trailing: false }
      )
    ).current;

    // Cache handler với useCallback
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
        size="sm"
        className={className}
      >
        <Icon className="size-3.5 mr-1 shrink-0" />
        <span className="text-sm truncate">{label}</span>
      </Button>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
