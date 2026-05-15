import { db } from "@/db";
import { folders, tags, folderTags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db
    .select({
      folderId: folders.id,
      s3Key: folders.s3Key,
      tagName: tags.name,
    })
    .from(folders)
    .leftJoin(folderTags, eq(folderTags.folderId, folders.id))
    .leftJoin(tags, eq(tags.id, folderTags.tagId))
    .orderBy(folders.s3Key);

  const map = new Map<string, { id: string; s3Key: string; tags: string[] }>();
  for (const row of rows) {
    if (!map.has(row.s3Key)) {
      map.set(row.s3Key, { id: row.folderId, s3Key: row.s3Key, tags: [] });
    }
    if (row.tagName) {
      map.get(row.s3Key)!.tags.push(row.tagName);
    }
  }

  return NextResponse.json(Array.from(map.values()));
}