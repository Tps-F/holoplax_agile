import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  const current =
    (await prisma.automationSetting.findFirst({ where: { id: 1 } })) ??
    (await prisma.automationSetting.create({ data: { low: 35, high: 70 } }));
  return NextResponse.json({ low: current.low, high: current.high });
}

export async function POST(request: Request) {
  const body = await request.json();
  const low = Number(body.low);
  const high = Number(body.high);
  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    return NextResponse.json({ error: "low/high are required" }, { status: 400 });
  }
  const saved = await prisma.automationSetting.upsert({
    where: { id: 1 },
    update: { low, high },
    create: { id: 1, low, high },
  });
  return NextResponse.json({ low: saved.low, high: saved.high });
}
