import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { Result } from "@/app/types/Result";
import { Review } from "@/app/types/Review";

export const fetchCache = "force-no-store";
export const revalidate = 1;

interface IReviewSubmit {
    reviewHash: string, 
    review: Review
}
export const POST = async (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
    try {
        let body: IReviewSubmit = await request.json();
        let key = body.reviewHash;
        let value = body.review;
        await kv.set(key.toString(), JSON.stringify(value));
        return NextResponse.json(
            {
              success: "Review added to kv",
            },
            { status: 200 }
          );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
              error: "Could not add review to kv",
            },
            { status: 400 }
          );
    }
    
};

export const GET = (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
};