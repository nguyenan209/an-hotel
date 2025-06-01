import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File; // Chỉ nhận một file
    const folder = (formData.get("folder") as string) || "uploads"; // Lấy folder từ FormData, mặc định là 'uploads'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Chuẩn bị dữ liệu để upload
    const fileBuffer = Buffer.from(await file.arrayBuffer()); // Convert file to Buffer
    const fileExtension = file.name.split(".").pop();
    const baseFileName = file.name.replace(/\.[^/.]+$/, "");
    const fileKey = `${folder}/${baseFileName}-${uuidv4()}.${fileExtension}`; // Thêm folder vào đường dẫn

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
    };

    // Upload file lên S3
    const uploadResult = await s3.upload(params).promise();

    // Trả về URL của ảnh đã tải lên
    return NextResponse.json({ url: uploadResult.Location });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
