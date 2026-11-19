import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.cloud.ru';
const S3_REGION = process.env.S3_REGION || 'ru-central-1';
const S3_BUCKET = process.env.S3_BUCKET || 'bridgik-drops';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

export const isS3Enabled = Boolean(
  S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY && S3_BUCKET
);

let s3Client: S3Client | null = null;

if (isS3Enabled) {
  s3Client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID!,
      secretAccessKey: S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
  console.log(`[S3] Initialized Object Storage client for bucket '${S3_BUCKET}' (${S3_ENDPOINT})`);
}

/**
 * Uploads a readable stream directly to S3
 */
export async function uploadStreamToS3(
  stream: Readable,
  key: string,
  mimeType: string = 'application/octet-stream'
): Promise<void> {
  if (!s3Client) throw new Error('S3 client is not configured');

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: S3_BUCKET,
      Key: key,
      Body: stream,
      ContentType: mimeType,
    },
  });

  await upload.done();
}

/**
 * Generates a presigned direct download URL for the client (full speed, zero VDS bandwidth)
 */
export async function getS3DownloadUrl(
  key: string,
  fileName: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!s3Client) throw new Error('S3 client is not configured');

  const encodedName = encodeURIComponent(fileName);
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes an object from S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  if (!s3Client) return false;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (err) {
    console.warn(`[S3] Failed to delete object '${key}':`, err);
    return false;
  }
}
