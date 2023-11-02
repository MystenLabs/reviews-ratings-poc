import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { Result } from "@/app/types/Result";
import { Review } from "@/app/types/Review";

export const fetchCache = "force-no-store";
export const revalidate = 1;

export const GET = async (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);

    console.log("path", request.nextUrl.pathname);
    const id = request.nextUrl.pathname.split('/').pop();
    console.log("id", id);
    if (!id) {
        return new NextResponse("Not found", {status: 404});
    }
    try {
        const reviewJson = await kv.get(id.toString());
        console.log("reviewJson", JSON.stringify(reviewJson));
        if (!reviewJson) {
            return new NextResponse("Not found", {status: 404});
        }
        return NextResponse.json(
            reviewJson,
            { status: 200 }
        );
    }catch (error) {
        console.error(error);
        return new NextResponse("Not found", {status: 404});
    }


};