/**
 * Web Service API Proxy
 * 
 * CWE-284 Fix: Added authentication and authorization
 * CWE-942 Fix: Replaced CORS wildcard with whitelist
 * 
 * @route GET /api/webservice
 * @security CRITICAL - Protected endpoint requiring authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthUser } from '@/utils/apiAuthMiddleware';

// ============================================================================
// OPTIONS - CORS Preflight
// ============================================================================

export async function OPTIONS(req: NextRequest) {
  // ✅ CWE-942 Fix: Whitelist allowed origins instead of wildcard
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const origin = req.headers.get('origin');
  
  const allowOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0] || 'https://yourdomain.com';
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,access-token",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

// ============================================================================
// GET - Fetch Meter Data
// ============================================================================

/**
 * ✅ CWE-284 Fix: Protected with authentication middleware
 * 
 * This endpoint now:
 * - Requires valid JWT token
 * - Validates user permissions
 * - Logs API access for audit
 * - Uses whitelisted CORS origins
 */
export const GET = withAuth(
  async (req: NextRequest, user: AuthUser) => {
    try {
      // ✅ User is already authenticated by middleware
      // ✅ Check if user has view permission
      if (!user.permissions.f_view) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'You do not have permission to view this data',
            code: 'NO_VIEW_PERMISSION'
          },
          { status: 403 }
        );
      }

      console.log(`[WEBSERVICE] User ${user.id} accessing meter data`);

      // ✅ ดึง token จาก env (ห้ามฮาร์ดโค้ดใน client)
      const ACCESS_TOKEN = process.env.TPA_ACCESS_TOKEN ?? "";
      const JWT_COOKIE = process.env.TPA_JWT_COOKIE ?? "";

      if (!ACCESS_TOKEN || !JWT_COOKIE) {
        console.error('[WEBSERVICE] Missing required environment variables');
        return NextResponse.json(
          {
            error: 'Configuration Error',
            message: 'Service is not properly configured',
            code: 'MISSING_CONFIG'
          },
          { status: 500 }
        );
      }

      const upstream = await fetch(
        "https://tpasystem-pre.pttplc.com/TPA_WEBCONFIG_UAT/Manage/AllMeter",
        {
          method: "GET",
          cache: "no-store", // ปิด cache เพื่อให้ได้ข้อมูลสด
          headers: {
            "access-token": ACCESS_TOKEN,
            Cookie: `jwt_token=${JWT_COOKIE}`,
          },
        }
      );

      // ส่งต่อสถานะและ header สำคัญ
      const resHeaders = new Headers();
      const contentType = upstream.headers.get("content-type") || "application/json";
      resHeaders.set("content-type", contentType);

      // ✅ CWE-942 Fix: Set CORS with whitelist
      const origin = req.headers.get('origin');
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      
      if (origin && allowedOrigins.includes(origin)) {
        resHeaders.set("Access-Control-Allow-Origin", origin);
        resHeaders.set("Access-Control-Allow-Credentials", "true");
      }
      
      resHeaders.set("Access-Control-Expose-Headers", "content-type");

      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: resHeaders,
      });
      
    } catch (err: any) {
      console.error('[WEBSERVICE] Error:', err.message);
      
      // ✅ Generic error message (don't leak internal details)
      return NextResponse.json(
        {
          error: 'Service Error',
          message: 'Unable to fetch data. Please try again later.',
          code: 'UPSTREAM_ERROR'
        },
        { status: 500 }
      );
    }
  },
  {
    // ✅ Require view permission to access this endpoint
    requiredPermission: 'f_view'
  }
);


// // app/api/magic-login/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { SignJWT, jwtVerify } from 'jose';

// const enc = new TextEncoder();
// const MAGIC_SECRET = enc.encode(process.env.NEXT_PUBLIC_MAGIC_LINK_SECRET!);  // ใช้เซ็น token ที่มากับลิงก์
// const SESSION_SECRET = enc.encode(process.env.NEXT_PUBLIC_SESSION_SECRET!);   // ใช้เซ็น session cookie

// export async function GET(req: NextRequest) {
//     const url = new URL(req.url);
//     const token = url.searchParams.get('token');
//     const redirect = url.searchParams.get('redirect') || '/TPA_Webconfig/Manage/AllMeter';

//     if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

//     try {
//         // ตรวจสอบ magic token อายุสั้น (สร้างจากแบ็กเอนด์ของคุณเอง)
//         await jwtVerify(token, MAGIC_SECRET, { algorithms: ['HS256'] });

//         // ออก session cookie ที่เว็บ TPA ใช้ยืนยันว่า login แล้ว
//         const session = await new SignJWT({ sub: 'magic' })
//             .setProtectedHeader({ alg: 'HS256' })
//             .setIssuedAt()
//             .setExpirationTime('2h')
//             .sign(SESSION_SECRET);

//         const res = NextResponse.redirect(new URL(redirect, url.origin));

//         res.cookies.set('session', session, {
//             httpOnly: true,
//             sameSite: 'lax',
//             secure: process.env.NODE_ENV === 'production',
//             path: '/',           // สำคัญ: ให้คุกกี้ติดทุก path รวมถึง /TPA_Webconfig/*
//             maxAge: 2 * 60 * 60
//         });
//         return res;
//     } catch {
//         return NextResponse.redirect(new URL('/login?error=magic', url.origin));
//     }
// }


// app/ws/[...path]/route.ts
// import { NextRequest } from 'next/server';

// export const dynamic = 'force-dynamic';

// export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
//     return proxy(req, ctx.params.path);
// }
// export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
//     return proxy(req, ctx.params.path);
// }
// export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
//     return proxy(req, ctx.params.path);
// }
// export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
//     return proxy(req, ctx.params.path);
// }

// async function proxy(req: NextRequest, pathSegs: string[]) {
//     const targetBase = process.env.NEXT_PUBLIC_WS_DOMAIN!; // เช่น "http://10.104.239.127"
//     const srcUrl = new URL(req.url);
//     const path = pathSegs.join('/');
//     const targetUrl = new URL(`${targetBase}/${path}${srcUrl.search}`);

//     // ดึง token จาก query หรือคุกกี้ก็ได้ (ตัวอย่างนี้ใช้ query ชื่อ at)
//     const token = srcUrl.searchParams.get('at');
//     if (!token) return new Response('Missing token', { status: 401 });

//     // สร้าง header ส่งไปปลายทาง พร้อม Authorization
//     const headers = new Headers(req.headers);
//     headers.set('host', new URL(targetBase).host);
//     headers.set('authorization', `Bearer ${token}`);

//     const body = ['GET', 'HEAD'].includes(req.method) ? undefined : req.body;

//     const resp = await fetch(targetUrl, {
//         method: req.method,
//         headers,
//         body,
//         redirect: 'manual',
//     });

//     // ปรับ Location header กรณีปลายทาง redirect ให้ไหลผ่าน /ws/*
//     const outHeaders = new Headers(resp.headers);
//     const loc = outHeaders.get('location');
//     if (loc && loc.startsWith(targetBase)) {
//         outHeaders.set('location', loc.replace(targetBase, `${srcUrl.origin}/ws`));
//     }

//     return new Response(resp.body, { status: resp.status, headers: outHeaders });
// }
