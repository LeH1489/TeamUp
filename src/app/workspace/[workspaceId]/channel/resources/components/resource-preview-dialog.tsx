// components/resource-preview-dialog.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ResourcePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: {
    name: string;
    fileType: string;
    url: string;
  };
}

const ResourcePreviewDialog = ({
  open,
  onOpenChange,
  resource,
}: ResourcePreviewDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const renderPreview = () => {
    const { fileType, url } = resource;

    // Xử lý preview theo từng loại file
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileType)) {
      return (
        <div className="relative min-h-[600px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
            className="w-full h-[600px] border-none"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    }

    if (fileType === "pdf") {
      return (
        <div className="relative min-h-[600px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-[600px] border-none"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    }

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)) {
      return (
        <div className="flex justify-center">
          <img
            src={url}
            alt={resource.name}
            className="max-h-[600px] object-contain"
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>
      );
    }

    // Với các file code
    if (
      ["html", "css", "js", "jsx", "ts", "tsx", "json", "xml"].includes(
        fileType
      )
    ) {
      return (
        <div className="relative min-h-[600px] p-4">
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-500">File code {fileType.toUpperCase()}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Mở trong tab mới
            </a>
            <a
              href={url}
              download
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Tải xuống
            </a>
          </div>
        </div>
      );
    }

    // Fallback cho các file type khác
    // Fallback cho các file type khác
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500 mb-4">
          Preview không khả dụng cho loại file này
        </p>
        <a
          href={url}
          download
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Tải xuống
        </a>
      </div>
    );
  };

  useEffect(() => {
    setIsLoading(true);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {resource.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourcePreviewDialog;
