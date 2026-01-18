/**
 * Notifications API
 * 
 * CWE-284 Fix: Added authentication middleware
 * CWE-644 Fix: Header validation (already implemented)
 * CWE-918 Fix: URL validation (already implemented)
 * 
 * @route GET /api/notifications
 * @security Protected endpoint requiring authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthUser } from '@/utils/apiAuthMiddleware';

/**
 * ✅ CWE-284 Fix: Protected with authentication middleware
 */
export const GET = withAuth(
  async (request: NextRequest, user: AuthUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = searchParams.get('limit') || '100';
      const since = searchParams.get('since');
      const userEmail = searchParams.get('userEmail');

      // ✅ Validate that user can only fetch their own notifications
      // (or allow admins to fetch any user's notifications)
      if (!userEmail) {
        return NextResponse.json(
          { error: 'User email is required' },
          { status: 400 }
        );
      }

      // ✅ Security: Users can only access their own notifications
      // unless they have admin role
      if (user.email !== userEmail && user.role !== 'admin') {
        console.warn(`[NOTIFICATIONS] User ${user.id} attempted to access notifications for ${userEmail}`);
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'You can only access your own notifications',
            code: 'UNAUTHORIZED_ACCESS'
          },
          { status: 403 }
        );
      }

      console.log(`[NOTIFICATIONS] User ${user.id} fetching notifications for ${userEmail}`);

    const gotifyDomain = process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? 'https://gotify.i24.dev';
    const gotifyToken = process.env.NEXT_PUBLIC_NOTI_IN_APP_TOKEN;
    
    if (!gotifyToken) {
      return NextResponse.json(
        { error: 'Gotify token not configured' },
        { status: 500 }
      );
    }

    // CWE-644 Fix: Validate and sanitize token before using in header
    const { buildSafeAuthHeader } = await import('@/utils/headerValidator');
    const authHeader = buildSafeAuthHeader(gotifyToken);
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Invalid notification service token format' },
        { status: 500 }
      );
    }

    // CWE-918 Fix: Validate gotifyDomain URL
    let gotifyResponse;
    try {
      const domainUrl = new URL(gotifyDomain);
      
      // Whitelist allowed domains
      const allowedDomains = ['gotify.i24.dev', 'localhost', '127.0.0.1'];
      if (!allowedDomains.includes(domainUrl.hostname)) {
        return NextResponse.json(
          { error: 'Invalid notification service domain' },
          { status: 400 }
        );
      }

      // Validate query parameters
      if (limit && (isNaN(Number(limit)) || Number(limit) > 1000)) {
        return NextResponse.json(
          { error: 'Invalid limit parameter' },
          { status: 400 }
        );
      }

      gotifyResponse = await fetch(
        `${gotifyDomain}/message?limit=${limit}${since ? `&since=${since}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          // Add timeout
          signal: AbortSignal.timeout(600000) // 10 minutes timeout
        }
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid notification service configuration' },
        { status: 500 }
      );
    }

    if (!gotifyResponse.ok) {
      throw new Error(`Gotify API responded with status: ${gotifyResponse.status}`);
    }

    const data = await gotifyResponse.json();
    
    // Filter messages by user email
    const filteredMessages = data?.messages?.filter((item: any) => 
      item?.extras?.email?.includes(userEmail)
    ) || [];

    return NextResponse.json({
      messages: filteredMessages,
      paging: data?.paging,
      totalRecord: filteredMessages.length,
      oldestId: data?.messages?.length > 0 ? Math.min(...data.messages.map((n: any) => n.id)) : null
    });

    } catch (error: any) {
      console.error('[NOTIFICATIONS] Error:', error.message);
      
      // ✅ Generic error message (don't leak internal details)
      return NextResponse.json(
        { error: 'Failed to fetch notifications', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }
  },
  {
    // ✅ Require f_noti_inapp permission to access notifications
    requiredPermission: 'f_noti_inapp'
  }
);
