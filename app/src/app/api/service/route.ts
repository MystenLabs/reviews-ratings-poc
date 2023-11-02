import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const fetchCache = "force-no-store";
export const revalidate = 1;

export const POST = async (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
};

export const GET = (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);
};
