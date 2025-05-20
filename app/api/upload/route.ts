import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];

        console.log('Files received:', files);
        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const uploadPromises = files.map(async (file) => {
            const fileBuffer = Buffer.from(await file.arrayBuffer()); // Convert file to Buffer
            const fileExtension = file.name.split('.').pop();
            const baseFileName = file.name.replace(/\.[^/.]+$/, "");
            const fileKey = `uploads/${baseFileName}-${uuidv4()}.${fileExtension}`;
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: fileKey,
                Body: fileBuffer, // Use Buffer here
                ContentType: file.type,
            };

            await s3.upload(params).promise();
            return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        });

        const uploadedUrls = await Promise.all(uploadPromises);

        return NextResponse.json({ urls: uploadedUrls });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
    }
}