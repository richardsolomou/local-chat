import { X } from "lucide-react";
import { type RefObject, useImperativeHandle, useRef } from "react";

type FileUploadProps = {
  files: FileList | undefined;
  onFilesChange: (files: FileList | undefined) => void;
  disabled?: boolean;
};

export type FileUploadRef = {
  openFileDialog: () => void;
};

export const FileUpload = ({
  files,
  onFilesChange,
  ref,
}: FileUploadProps & { ref?: RefObject<FileUploadRef | null> }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      fileInputRef.current?.click();
    },
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesChange(e.target.files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    if (files) {
      const dt = new DataTransfer();
      Array.from(files).forEach((file, index) => {
        if (index !== indexToRemove) {
          dt.items.add(file);
        }
      });
      onFilesChange(dt.files);

      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
    }
  };

  return (
    <>
      {/* Hidden File Input */}
      <input
        accept="image/*,audio/*"
        className="hidden"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      {/* File Previews */}
      {files && files.length > 0 && (
        <div className="flex gap-2">
          {Array.from(files).map((file, index) => (
            <div
              className="group relative overflow-hidden rounded-lg bg-zinc-800/40"
              key={index}
            >
              {file.type.startsWith("image/") ? (
                <img
                  alt={file.name}
                  className="h-20 w-20 object-cover"
                  src={URL.createObjectURL(file)}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center">
                  <span className="max-w-[60px] truncate text-xs text-zinc-400">
                    {file.name}
                  </span>
                </div>
              )}
              <button
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                onClick={() => removeFile(index)}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

FileUpload.displayName = "FileUpload";

export type { FileUploadProps };
