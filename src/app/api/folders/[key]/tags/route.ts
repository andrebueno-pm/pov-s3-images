import { db } from "@/db";
import { folders, tags, folderTags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

async function getOrCreateFolder(key: string) {
  const existing = await db
    .select()
    .from(folders)
    .where(eq(folders.s3Key, key))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const inserted = await db
    .insert(folders)
    .values({ s3Key: key })
    .returning();
  return inserted[0];
}

async function getOrCreateTag(name: string) {
  const existing = await db
    .select()
    .from(tags)
    .where(eq(tags.name, name))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const inserted = await db
    .insert(tags)
    .values({ name })
    .returning();
  return inserted[0];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const { tag } = await req.json();
  if (!tag?.trim()) return NextResponse.json({ error: "tag required" }, { status: 400 });

  const folder = await getOrCreateFolder(decodeURIComponent(key));
  const tagRow = await getOrCreateTag(tag.trim().toLowerCase());

  await db
    .insert(folderTags)
    .values({ folderId: folder.id, tagId: tagRow.id })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ key: string }> }
  ) {
    const { key } = await params;
    const { tag } = await req.json();
  
    const folder = await db
      .select()
      .from(folders)
      .where(eq(folders.s3Key, decodeURIComponent(key)))
      .limit(1);
    const tagRow = await db
      .select()
      .from(tags)
      .where(eq(tags.name, tag.trim().toLowerCase()))
      .limit(1);
  
    if (!folder[0] || !tagRow[0]) return NextResponse.json({ ok: true });
  
    await db
      .delete(folderTags)
      .where(
        eq(folderTags.folderId, folder[0].id) &&
        eq(folderTags.tagId, tagRow[0].id)
      );
  
    return NextResponse.json({ ok: true });
  }