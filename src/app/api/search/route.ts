import { db } from "@/db";
import { folders, tags, folderTags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag")?.trim();

  if (!tag) return NextResponse.json([]);

  const rows = await db
    .select({ s3Key: folders.s3Key })
    .from(folders)
    .innerJoin(folderTags, eq(folderTags.folderId, folders.id))
    .innerJoin(tags, eq(tags.id, folderTags.tagId))
    .where(eq(tags.name, tag));

  return NextResponse.json(rows.map((r) => r.s3Key));
}