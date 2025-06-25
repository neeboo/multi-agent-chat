export async function GET() {
  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: "Multi-Agent System is running",
  })
}
