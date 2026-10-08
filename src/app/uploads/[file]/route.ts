import fs from "node:fs/promises";
import path from "node:path";
import { IMAGE_TYPES, uploadPath } from "@/lib/uploads";

export async function GET(_request: Request, ctx: RouteContext<"/uploads/[file]">) {
  const { file } = await ctx.params;
  // Only plain generated file names are served — no path traversal.
  if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const data = await fs.readFile(uploadPath(file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": IMAGE_TYPES[path.extname(file).slice(1)],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
