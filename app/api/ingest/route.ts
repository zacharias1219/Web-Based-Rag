import { handleBootstrapping } from "@/app/services/bootstrap";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { targetIndex } = await req.json();
    await handleBootstrapping(targetIndex);
    return NextResponse.json({ success: true }, { status: 200 });
}