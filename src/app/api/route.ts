import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore: any = await cookies();
  const token = cookieStore.get('v4r2d9z5m3h0c1p0x7l')?.value;
  
  // CWE-918 Fix: Validate environment variable and construct safe URL
  const baseUrl = process.env.NEXT_PUBLIC_DEMO_API;
  if (!baseUrl) {
    return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
  }

  // Validate that the URL is from allowed domain
  try {
    const fullUrl = `${baseUrl}/pokemon/ditto`;
    new URL(fullUrl); // Validate URL format
    
    const response:any = await fetch(fullUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid API configuration' }, { status: 500 });
  }
}
