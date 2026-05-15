"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type Folder = {
  id: string;
  s3Key: string;
  tags: string[];
};

export default function Home() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data) => {
        setFolders(data);
        setLoading(false);
      });
  }, []);

  const filtered = search.trim()
    ? folders.filter(
        (f) =>
          f.s3Key.toLowerCase().includes(search.toLowerCase()) ||
          f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : folders;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">S3 Image Tagger</h1>
        <button
          onClick={() =>
            fetch("/api/folders/sync", { method: "POST" }).then(() =>
              window.location.reload()
            )
          }
          className="text-sm text-muted-foreground underline"
        >
          Sync S3
        </button>
      </div>

      <Input
        placeholder="Search by folder name or tag..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        className="mb-6"
      />

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((folder) => (
            <Link key={folder.s3Key} href={`/folder/${folder.s3Key}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                <img
                  src={`https://contract-and-events-images.s3.amazonaws.com/${folder.s3Key}/thumbnail`}
                  alt={folder.s3Key}
                  className="w-full h-36 object-cover rounded mb-3"
                />
                <p className="font-medium text-sm mb-2 truncate">{folder.s3Key}</p>
                <div className="flex flex-wrap gap-1">
                  {folder.tags.length === 0 ? (
                    <span className="text-xs text-muted-foreground">no tags yet</span>
                  ) : (
                    folder.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}