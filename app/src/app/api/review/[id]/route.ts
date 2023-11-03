import {revalidatePath} from "next/cache";
import {NextRequest, NextResponse} from "next/server";
import {kv} from "@vercel/kv";

export const GET = async (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);

    const key = request.nextUrl.pathname.split('/').pop();
    console.log("key", key);
    if (!key) {
        return new NextResponse("Not found", {status: 404});
    }

    const review = await kv.get<string>(key);
    return NextResponse.json(review, {status: 200});
};