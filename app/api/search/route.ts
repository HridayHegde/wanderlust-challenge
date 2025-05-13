import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { searchSchema } from "@/lib/validations"

function isNextRequest(request: NextRequest | Request): request is NextRequest {
  return 'json' in request
}

export async function POST(request: NextRequest | Request) {
  try {
    let body: any
    if (isNextRequest(request)) {
      body = await request.json()
    } else {
      // For node-mocks-http Request
      body = (request as any).body
    }

    const result = searchSchema.parse(body)

    const destinations = await db.destination.findMany({
      where: result.query
        ? {
          OR: [
            { name: { contains: result.query, mode: "insensitive" } },
            { description: { contains: result.query, mode: "insensitive" } },
          ],
        }
        : undefined,
      take: result.limit || 10,
    })

    return NextResponse.json({ results: destinations })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Search failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    )
  }
}
