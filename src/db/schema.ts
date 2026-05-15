import { pgTable, uuid, text, primaryKey } from "drizzle-orm/pg-core";

export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  s3Key: text("s3_key").unique().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
});

export const folderTags = pgTable("folder_tags", {
  folderId: uuid("folder_id").references(() => folders.id, { onDelete: "cascade" }).notNull(),
  tagId: uuid("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
}, (t) => [primaryKey({ columns: [t.folderId, t.tagId] })]);