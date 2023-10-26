import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const fetchCache = "force-no-store";

export const POST = async (request: NextRequest) => {
    const path = request.nextUrl.searchParams.get("path") || "/";
    revalidatePath(path);

    let service_type = await request.json();
    console.log(JSON.stringify(service_type));
    
};