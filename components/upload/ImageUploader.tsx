import React, { useState } from "react";
import { Upload, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  uploadedImages: string[];
  setUploadedImages: (images: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  uploadedImages,
  setUploadedImages,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData to send files
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      // Make API call to upload to S3
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const data = await response.json();
      setUploadProgress(100);

      // Add the new image URLs to the uploadedImages state
      const newImages = data.urls;
      setUploadedImages([...uploadedImages, ...newImages]);

      // Reset the file input
      event.target.value = "";

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error uploading images:", error);
      setIsUploading(false);
      setUploadProgress(0);
      alert("Failed to upload images. Please try again.");
    }
  };

  const handleDeleteUploadedImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {uploadedImages.map((imageUrl, index) => (
          <div
            key={`uploaded-${index}`}
            className="relative aspect-square overflow-hidden rounded-md border"
          >
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={`Uploaded image ${index + 1}`}
              className="object-cover w-full h-full"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => handleDeleteUploadedImage(index)}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete image</span>
            </Button>
          </div>
        ))}
        <div className="flex aspect-square items-center justify-center rounded-md border border-dashed relative">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Upload Image</p>
              <p className="text-xs text-muted-foreground">
                Drag and drop or click to upload
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="image-upload"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="image-upload"
                className="mt-2 cursor-pointer rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                Select Files
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
