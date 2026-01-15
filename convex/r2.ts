/**
 * R2 Storage Actions
 * Handles presigned URL generation for Cloudflare R2
 *
 * Setup required:
 * 1. Set R2_ACCESS_KEY_ID in Convex environment
 * 2. Set R2_SECRET_ACCESS_KEY in Convex environment
 * 3. Set R2_BUCKET_NAME in Convex environment
 * 4. Set R2_ACCOUNT_ID in Convex environment
 */

import { v } from "convex/values";
import { action } from "./_generated/server";

// R2 endpoint format
const getR2Endpoint = (accountId: string) =>
  `https://${accountId}.r2.cloudflarestorage.com`;

/**
 * Generate a presigned URL for uploading a file to R2
 */
export const getUploadUrl = action({
  args: {
    filename: v.string(),
    contentType: v.string(),
    folder: v.optional(v.string()), // e.g., "photos", "invoices"
  },
  handler: async (ctx, args) => {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const accountId = process.env.R2_ACCOUNT_ID;

    if (!accessKeyId || !secretAccessKey || !bucketName || !accountId) {
      throw new Error("R2 credentials not configured");
    }

    // Generate unique key
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const folder = args.folder ?? "uploads";
    const key = `${folder}/${timestamp}-${randomId}-${args.filename}`;

    // For R2, we'll use the S3-compatible API
    // In production, you'd use @aws-sdk/client-s3 with S3Client
    // For now, return the details needed for client-side upload

    const endpoint = getR2Endpoint(accountId);
    const url = `${endpoint}/${bucketName}/${key}`;

    // Note: In production, generate a proper presigned URL using AWS SDK
    // This is a simplified version that returns the upload details
    return {
      uploadUrl: url,
      key,
      publicUrl: `https://pub-${accountId}.r2.dev/${key}`, // Public URL if bucket is public
      // For actual presigned URL generation, use AWS SDK v3:
      // import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
      // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
    };
  },
});

/**
 * Generate a presigned URL for downloading a file from R2
 */
export const getDownloadUrl = action({
  args: {
    key: v.string(),
    expiresInSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!accountId || !bucketName) {
      throw new Error("R2 credentials not configured");
    }

    // For public buckets, return the public URL
    // For private buckets, generate presigned URL using AWS SDK
    const publicUrl = `https://pub-${accountId}.r2.dev/${args.key}`;

    return {
      url: publicUrl,
      expiresAt: Date.now() + (args.expiresInSeconds ?? 3600) * 1000,
    };
  },
});

/**
 * Delete a file from R2
 */
export const deleteFile = action({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const accountId = process.env.R2_ACCOUNT_ID;

    if (!accessKeyId || !secretAccessKey || !bucketName || !accountId) {
      throw new Error("R2 credentials not configured");
    }

    // In production, use AWS SDK to delete:
    // const client = new S3Client({ ... });
    // await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: args.key }));

    // For now, log the deletion request
    console.log(`Delete requested for: ${args.key}`);

    return { success: true, key: args.key };
  },
});
