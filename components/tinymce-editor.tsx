"use client";

import { Editor } from "@tinymce/tinymce-react";

interface TinyMCEEditorProps {
  apiKey: string;
  value: string;
  onChange: (content: string) => void;
  height?: number;
  folder: string;
}

export default function TinyMCEEditor({
  apiKey,
  value,
  onChange,
  height = 300,
  folder,
}: TinyMCEEditorProps) {
  return (
    <Editor
      apiKey={apiKey}
      value={value}
      init={{
        height,
        menubar: true,
        plugins: [
          "advlist autolink link image lists charmap preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table emoticons help",
          "image", // Thêm plugin image
        ],
        toolbar:
          "undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image | print preview media fullscreen | " +
          "forecolor backcolor emoticons | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        images_upload_handler: async (blobInfo, progress) => {
          return new Promise((resolve, reject) => {
            try {
              const formData = new FormData();
              progress(100); // Simulate progress completion
              formData.append("file", blobInfo.blob(), blobInfo.filename());
              formData.append("folder", folder); // Chỉ định folder là 'reviews'

              // Gửi ảnh lên server
              fetch("/api/upload/images", {
                method: "POST",
                body: formData,
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Failed to upload image");
                  }
                  return response.json();
                })
                .then((data) => {
                  resolve(data.url); // Trả về URL của ảnh đã tải lên
                })
                .catch((error) => {
                  console.error("Image upload failed:", error);
                  reject("Image upload failed");
                });
            } catch (error) {
              console.error("Image upload failed:", error);
              reject("Image upload failed");
            }
          });
        },
        paste_data_images: true, // Cho phép xử lý ảnh khi paste
        paste_preprocess: (plugin, args) => {
          console.log("Preprocess paste:", args.content);
        },
        paste_postprocess: async (plugin, args) => {
          const imgTags = args.node.querySelectorAll("img");
          for (const img of imgTags) {
            if (img.src.startsWith("data:")) {
              // Xử lý ảnh dạng base64
              const blob = await fetch(img.src).then((res) => res.blob());
              const formData = new FormData();
              formData.append("file", blob, "pasted-image.png");
              formData.append("folder", folder);

              try {
                const response = await fetch("/api/upload/images", {
                  method: "POST",
                  body: formData,
                });

                if (!response.ok) {
                  throw new Error("Failed to upload pasted image");
                }

                const data = await response.json();
                img.src = data.url; // Cập nhật URL của ảnh đã tải lên
              } catch (error) {
                console.error("Failed to upload pasted image:", error);
              }
            }
          }
        },
      }}
      onEditorChange={onChange}
    />
  );
}
