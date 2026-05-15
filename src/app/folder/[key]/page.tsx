"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "https://contract-and-events-images.s3.amazonaws.com";

export default function FolderPage() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data) => {
        const folder = data.find((f: { s3Key: string; tags: string[] }) => f.s3Key === key);
        setTags(folder?.tags ?? []);
        setLoading(false);
      });
  }, [key]);

  async function addTag() {
    const tag = newTag.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    await fetch(`/api/folders/${key}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });
    setTags((prev) => [...prev, tag]);
    setNewTag("");
  }

  async function removeTag(tag: string) {
    await fetch(`/api/folders/${key}/tags`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-muted-foreground underline mb-6 block"
      >
        ← Back
      </button>

      <h1 className="text-xl font-bold mb-6 break-all">{key}</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {["thumbnail", "details", "feedCardFavicon"].map((img) => (
          <div key={img}>
            <p className="text-xs text-muted-foreground mb-1">{img}</p>
            <img
              src={`${BASE_URL}/${key}/${img}`}
              alt={img}
              className="w-full rounded border object-cover"
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Tags</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {loading ? (
            <span className="text-xs text-muted-foreground">Loading...</span>
          ) : tags.length === 0 ? (
            <span className="text-xs text-muted-foreground">No tags yet</span>
          ) : (
            tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={newTag}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") void addTag();
            }}
          />
          <Button onClick={() => void addTag()}>Add</Button>
        </div>
      </div>
    </main>
  );
}
