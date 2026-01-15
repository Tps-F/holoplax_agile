import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  const velocity = await prisma.velocityEntry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ velocity });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, points, range } = body;
  if (!name || !points || !range) {
    return NextResponse.json({ error: "name, points, range are required" }, { status: 400 });
  }
  const entry = await prisma.velocityEntry.create({
    data: {
      name,
      points: Number(points),
      range,
    },
  });
  return NextResponse.json({ entry });
}
