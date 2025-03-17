interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGenerateUploadUrlResource } from "@/features/resources/api/use-generate-upload-url-resource";
import { useUploadResource } from "@/features/resources/api/use-upload-resource";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
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
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { debounce, throttle, memoize } from "lodash";

const ResourceDialog = ({ open, onOpenChange }: ResourceDialogProps) => {
  const workspaceId = useWorkspaceId();
  const generateUploadUrlResource = useGenerateUploadUrlResource();

  //gọi api để tạo upload sau khi có url trả về từ generateUploadUrlResource
  const uploadResource = useUploadResource();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); //lưu trữ file được chọn (mảng các file được chọn)

  //lưu trữ url preview của file (key là tên or id của file, value là url preview)
  // {
  //   "abc.doc": "blob:http://localhost:3000/abc123...",
  //   "xyz.pdf": "blob:http://localhost:3000/xyz456...",
  //   "image.jpg": "blob:http://localhost:3000/img789..."
  // }
  const [previewUrls, setPreviewUrls] = useState<{ [k: string]: string }>({});

  //đang tải lên dùng để hiển thị loading cho button upload
  const [isUpLoading, setIsUpLoading] = useState(false);

  //hiển thị progress upload cho từng file tải lên (key là tên or id của file, value là progress upload)
  // {
  //   "abc.doc": "20%",
  //   "xyz.pdf": "50%",
  //   "image.jpg": "100%"
  // }
  const [uploadProgress, setUpLoadProgress] = useState<{
    [key: string]: string;
  }>({});

  //tham chiếu đến  <Input type="file" multiple className="hidden" />
  const fileInputRef = useRef<HTMLInputElement>(null);

  //lấy đuôi file từ tên file
  const getFileExtension = memoize((filename: string) => {
    const extension = filename.split(".");
    return extension ? extension.pop()?.toLowerCase() : "file";
  });

  //lấy kích thước filesize để hiển thị cho user biết
  const getFileSize = (size: number) => {
    if (size < 1024) {
      //nhỏ hơn 1024 là byte
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      //nhỏ hơn 1024 * 1024 là kilobyte vì 1024 * 1024 = 1024^2 = 1048576 (MB)
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      //lớn hơn  1024 * 1024 là MB
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  //lấy icon tương ứng với từng loại file
  // Trả về icon phù hợp dựa trên loại file
  const getFileIcon = (file: File) => {
    //khi 1 file tải lên nó sẽ file.type là: image/png, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
    const extension = getFileExtension(file.name);
    const fileType = file.type;

    // Danh sách các loại file và icon tương ứng
    const fileIcons = [
      {
        type: "image",
        check: fileType.startsWith("image/"),
        icon: <FileImageIcon className="h-10 w-10 text-blue-500" />,
      },
      {
        type: "pdf",
        check: extension === "pdf" || fileType.includes("pdf"),
        icon: <FileTextIcon className="h-10 w-10 text-red-500" />,
      },
      {
        type: "spreadsheet",
        check: ["xlsx", "xls", "csv"].includes(extension || ""),
        icon: <FileSpreadsheetIcon className="h-10 w-10 text-green-500" />,
      },
      {
        type: "presentation",
        check: ["pptx", "ppt"].includes(extension || ""),
        icon: <PresentationIcon className="h-10 w-10 text-orange-500" />,
      },
      {
        type: "archive",
        check: ["zip", "rar", "tar", "gz"].includes(extension || ""),
        icon: <FileArchiveIcon className="h-10 w-10 text-purple-500" />,
      },
      {
        type: "code",
        check: [
          "js",
          "html",
          "css",
          "json",
          "xml",
          "ts",
          "jsx",
          "tsx",
        ].includes(extension || ""),
        icon: <FileCodeIcon className="h-10 w-10 text-gray-500" />,
      },
      {
        type: "document",
        check: ["doc", "docx"].includes(extension || ""),
        icon: <FileTextIcon className="h-10 w-10 text-blue-700" />,
      },
    ];

    // Tìm icon phù hợp đầu tiên (item.check là true)
    const matchedIcon = fileIcons.find((item) => item.check)?.icon;

    // Trả về icon phù hợp hoặc icon mặc định
    return matchedIcon || <FileIcon className="h-10 w-10 text-gray-500" />;
  };

  //xử lý khi user chọn file từ input (fileInputRef)
  const handleFileChange = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files?.length) return;

      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          setPreviewUrls((prev) => ({ ...prev, [file.name]: url }));
        }
      });
    }, 300),
    []
  );

  //xử lý khi user xóa file chọn file khác
  const handleRemoveFile = (fileName: string) => {
    const newFiles = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles((prev) => [...newFiles]);

    //xóa luôn cả url preview
    if (previewUrls[fileName]) {
      URL.revokeObjectURL(previewUrls[fileName]); //giải phóng bộ nhớ

      //Tạo một bản sao của object previewUrls không chứa URL của file đã xóa và cập nhật state previewUrls
      setPreviewUrls((prev) => {
        const newUrls = { ...prev };
        delete newUrls[fileName];
        return newUrls;
      });
    }
  };

  //xử lý khi user click vào button upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsUpLoading(true);

      for (const file of selectedFiles) {
        //set progress upload cho từng file
        setUpLoadProgress((prev) => ({ ...prev, [file.name]: "Uploading..." }));

        //lấy url tải lên convex
        const uploadUrl = await generateUploadUrlResource.mutate({});

        if (!uploadUrl) {
          throw new Error(
            `Failed to generate upload URL for file: ${file.name}`
          );
        }

        //tải file lên convex
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload file: ${file.name}`);
        }

        const { storageId } = await result.json();

        const simpleFileType = getFileExtension(file.name);

        await uploadResource.mutate({
          workspaceId: workspaceId,
          name: file.name,
          description: `Uploaded on ${new Date().toLocaleDateString()}`,
          fileId: storageId,
          fileType: simpleFileType || "file",
        });

        setUpLoadProgress((prev) => ({ ...prev, [file.name]: "Completed" }));
      }

      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);

      //reset form
      setSelectedFiles([]);
      Object.keys(previewUrls).forEach((key) =>
        URL.revokeObjectURL(previewUrls[key])
      );
      setPreviewUrls({});
      setUpLoadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading files: ", error);
      toast.error("Failed to upload one or more files");
    } finally {
      setIsUpLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload new resources</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Upload new resources to the channel
        </DialogDescription>

        <div className="grid gap-4 py-2">
          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 w-full border-2 border-dashed rounded-md cursor-pointer hover:bg-accent transition text-center"
          >
            <UploadIcon className="mx-auto size-6 text-gray-400" />
            <div className="mt-2 text-sm text-gray-500">
              <p>Click to upload or drag and drop</p>
              <p>PDF, DOC, XLS, PPT, ZIP, Images, etc</p>
            </div>
            <Input
              onChange={handleFileChange}
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
            />
          </div>
          {/* Preview area */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium">{`Selected Files: ${selectedFiles.length}`}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="border rounded-md p-3 relative"
                  >
                    <div className="flex items-start space-x-3">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {file.name}
                        </p>
                        <div className="flex flex-col justify-between text-xs text-gray-500">
                          <p>Type: {getFileExtension(file.name)}</p>
                          <p>Size: {getFileSize(file.size)}</p>
                        </div>
                        {uploadProgress[file.name] && (
                          <p className="text-xs mt-1">
                            {uploadProgress[file.name] === "Uploading..." ? (
                              <span className="flex items-center text-blue-500">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Uploading...
                              </span>
                            ) : (
                              <span className="text-green-500">Completed</span>
                            )}
                          </p>
                        )}
                        {!isUpLoading && (
                          <Button
                            variant="ghost"
                            size="iconSm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(file.name);
                            }}
                            className="absolute top-1 right-1 size-6"
                          >
                            <XIcon />
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* {preview image} */}
                    {previewUrls[file.name] && (
                      <div className="mt-2 border rounded overflow-hidden">
                        <img
                          src={previewUrls[file.name]}
                          alt={file.name}
                          className="max-h-[100px] mx-auto"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpLoading}
            type="button"
          >
            Cancel
          </Button>
          <Button
            disabled={selectedFiles.length === 0 || isUpLoading}
            onClick={handleUpload}
            type="submit"
            className="bg-[#d82f5a]"
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDialog;
