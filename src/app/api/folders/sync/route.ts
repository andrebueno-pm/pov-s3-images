import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { db } from "@/db";
import { folders } from "@/db/schema";
import { NextResponse } from "next/server";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME,
    Delimiter: "/",
  });

  const response = await s3.send(command);

  const prefixes = response.CommonPrefixes?.map((p) =>
    p.Prefix!.replace(/\/$/, "")
  ) ?? [];

  if (prefixes.length === 0) {
    return NextResponse.json({ synced: 0 });
  }

  await db
    .insert(folders)
    .values(prefixes.map((key) => ({ s3Key: key })))
    .onConflictDoNothing();

  return NextResponse.json({ synced: prefixes.length, folders: prefixes });
}