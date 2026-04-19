import { v2 as cloudinary } from 'cloudinary';

type UploadResult = {
  url: string;
  publicId: string;
};

function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);
}

export async function uploadRawFileToCloudinary({
  filePath,
  publicId,
  folder = 'renderlite/builds',
}: {
  filePath: string;
  publicId: string;
  folder?: string;
}): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.',
    );
  }

  const res = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder,
    public_id: publicId,
    overwrite: true,
  });

  return { url: res.secure_url, publicId: res.public_id };
}
