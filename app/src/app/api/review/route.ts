import {revalidatePath} from "next/cache";
import {NextRequest, NextResponse} from "next/server";
import {kv} from "@vercel/kv";

interface ReviewRequestBody {
    key: string,
    value: string
}

export const POST = async (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);

    try {
        const {key, value}: ReviewRequestBody = await request.json();
        await kv.set(key, value);
        return NextResponse.json(
            {
                success: "Review added",
            },
            {status: 200}
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: "Failed to add review",
            },
            {status: 400}
        );
    }
};
