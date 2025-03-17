"use client";

import { UserButton } from "@/features/auth/components/user-button";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export default function Home() {
  const router = useRouter();

  //dùng global state management jotai
  const [open, setOpen] = useCreateWorkspaceModal();

  const { data, isLoading } = useGetWorkspaces();

  const workspaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (workspaceId) {
      //khác push ở chỗ replace không thêm vào history, user ko thể quay lại được
      router.replace(`/workspace/${workspaceId}`);
    } else if (!open) {
      // kiểm tra nếu modal chưa mở và không có workspace nào được chọn
      // thì  sẽ mở modal để người dùng có thể tạo một workspace mới.
      //lien tuc mo => chi cho phep user tao 1 workspace ko lam gi khac dc nua
      setOpen(true);
    }
  }, [workspaceId, isLoading, open, setOpen, router]);

  return (
    <div className="h-full flex items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
