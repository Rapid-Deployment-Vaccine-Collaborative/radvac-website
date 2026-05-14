import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

interface RevalidatePayload {
  secret: string;
  slug: string;
  postType?: string;
}

export async function POST(request: Request) {
  try {
    const data: RevalidatePayload = await request.json();

    if (data.secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!data.slug) {
      return NextResponse.json(
        { error: "Missing slug parameter" },
        { status: 400 }
      );
    }

    const postType = data.postType ?? "page";
    const revalidated: string[] = [];

    if (postType === "page") {
      const path = data.slug === "home" ? "/" : `/${data.slug}`;
      revalidatePath(path);
      revalidated.push(path);
    } else if (postType === "post") {
      revalidatePath("/press-release");
      revalidated.push("/press-release");
      const singlePath = `/press-release/${data.slug}`;
      revalidatePath(singlePath);
      revalidated.push(singlePath);
    } else {
      console.log(
        `[revalidate] received unknown postType="${postType}" slug="${data.slug}" — no path-level revalidation`
      );
    }

    // Refresh layout-level data (menus, site settings) on every change.
    revalidatePath("/", "layout");
    revalidated.push("layout:/");

    return NextResponse.json({
      revalidated,
      postType,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("[revalidate] failed:", err);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
