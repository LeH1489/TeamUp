"use client";

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
import { Download, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import {
  FileIcon,
  UploadIcon,
  XIcon,
  FileTextIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  PresentationIcon,
  FileArchiveIcon,
  FileCodeIcon,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRemoveResource } from "@/features/resources/api/use-remove-resource";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { debounce, memoize } from "lodash";
import dynamic from "next/dynamic";

interface ResourceCardProps {
  resourceName: string;
  description: string;
  fileType: string;
  url: string;
  uploadedBy: string;
  id: Id<"resources">;
}

// Tách file icons config ra ngoài component để tránh tạo lại mỗi lần render
const FILE_ICONS = [
  {
    type: "pdf",
    check: (extension: string) =>
      extension === "pdf" || extension.includes("pdf"),
    icon: (size: string) => <FileTextIcon className={`${size} text-red-500`} />,
  },
  {
    type: "spreadsheet",
    check: (extension: string) => ["xlsx", "xls", "csv"].includes(extension),
    icon: (size: string) => (
      <FileSpreadsheetIcon className={`${size} text-green-500`} />
    ),
  },
  {
    type: "presentation",
    check: (extension: string) => ["pptx", "ppt"].includes(extension),
    icon: (size: string) => (
      <PresentationIcon className={`${size} text-orange-500`} />
    ),
  },
  {
    type: "archive",
    check: (extension: string) =>
      ["zip", "rar", "tar", "gz"].includes(extension),
    icon: (size: string) => (
      <FileArchiveIcon className={`${size} text-purple-500`} />
    ),
  },
  {
    type: "code",
    check: (extension: string) =>
      ["js", "html", "css", "json", "xml", "ts", "jsx", "tsx"].includes(
        extension
      ),
    icon: (size: string) => (
      <FileCodeIcon className={`${size} text-gray-500`} />
    ),
  },
  {
    type: "document",
    check: (extension: string) => ["doc", "docx"].includes(extension),
    icon: (size: string) => (
      <FileTextIcon className={`${size} text-blue-700`} />
    ),
  },
  {
    type: "image",
    check: (extension: string) =>
      ["jpg", "jpeg", "png", "gif", "webp"].includes(extension),
    icon: (size: string) => (
      <FileImageIcon className={`${size} text-blue-500`} />
    ),
  },
];

const ResourceCard = ({
  resourceName,
  description,
  fileType,
  url,
  uploadedBy,
  id,
}: ResourceCardProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const { mutate: removeResource, isPending: isDeleting } = useRemoveResource();

  const handleDelete = debounce(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeResource(
        { resourceId: id },
        {
          onSuccess: () => toast.success("File deleted successfully"),
          onError: (error) =>
            toast.error(error.message || "Failed to delete file"),
        }
      );
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }, 300);

  const handleCardClick = debounce(() => {
    setPreviewOpen(true);
  }, 300);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  //cache icon file
  // Cache file icon
  const getFileIcon = (fileType: string, size: string = "size-16") => {
    const matchedIcon = FILE_ICONS.find((item) => item.check(fileType))?.icon(
      size
    );
    return matchedIcon || <FileIcon className={`${size} text-gray-500`} />;
  };

  return (
    <div>
      {previewOpen && (
        <ResourcePreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          resource={{
            name: resourceName,
            fileType,
            url,
          }}
        />
      )}
      <Card
        onClick={handleCardClick}
        className="w-full h-56 cursor-pointer hover:border-[#d82f5a] hover:border"
      >
        <CardHeader className="border-slate-200 border-b mb-2 flex flex-row justify-between items-center h-14 overflow-hidden">
          <div className="overflow-hidden flex items-center gap-2">
            {getFileIcon(fileType, "size-4")}
            <CardTitle className="truncate text-base leading-normal">
              {resourceName}
            </CardTitle>
          </div>
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
              <DropdownMenuItem asChild>
                <a
                  href={url}
                  download={`${resourceName}.${fileType}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="h-24 p-6">
          <div className="flex items-center justify-center w-full h-full">
            {getFileIcon(fileType, "size-16")}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-1">
          <p>
            <span className="font-semibold text-[#d82f5a] truncate">
              Uploaded by:{" "}
            </span>
            {uploadedBy}
          </p>
          <p>
            <span className="italic text-sm text-gray-500">{description}</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResourceCard;

//lazy loading dialog preview file
const ResourcePreviewDialog = dynamic(
  () => import("./resource-preview-dialog"),
  {
    ssr: false,
  }
);
