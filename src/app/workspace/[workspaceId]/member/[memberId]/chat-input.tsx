import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
  conversationId: Id<"conversations">;
}

type CreateMessageValue = {
  conversationId: Id<"conversations">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage"> | undefined;
};

export const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
  const editorRef = useRef<Quill | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const { mutate: createMessage } = useCreateMessage();

  const workspaceId = useWorkspaceId();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef.current?.enable(false);

      const values: CreateMessageValue = {
        conversationId,
        workspaceId,
        body,
        image: undefined,
      };

      //upload image: https://docs.convex.dev/file-storage/upload-files
      if (image) {
        const url = await generateUploadUrl({}, { throwOnError: true });

        if (!url) {
          throw new Error("Url not found");
        }

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image!.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, {
        throwOnError: true,
      });
    } catch (error: any) {
      console.error("Error deleting file:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }

    //clear message
    setEditorKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey} //khi key thay đổi => react xem đó là 1 quill mới => quill sẽ được khởi tạo lại => clear message
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
};
