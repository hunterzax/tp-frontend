/**
 * User Permissions API Endpoint
 * 
 * CWE-284 Fix: Server-side permission validation endpoint
 * This endpoint provides authenticated users with their permissions
 * fetched from the database (NOT from localStorage)
 * 
 * @route GET /api/auth/permissions
 * @created 2025-10-29
 * @security CRITICAL - Server-side permission source of truth
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthUser } from '@/utils/apiAuthMiddleware';

// ============================================================================
// GET /api/auth/permissions
// ============================================================================

/**
 * Fetch user permissions from server
 * 
 * @security
 * - Requires authentication (JWT token)
 * - Permissions fetched from DATABASE, not client storage
 * - This is the ONLY trusted source of permission data
 * 
 * @returns UserPermissions object
 * 
 * @example Response
 * ```json
 * {
 *   "success": true,
 *   "permissions": {
 *     "f_view": true,
 *     "f_create": true,
 *     "f_edit": false,
 *     ...
 *   },
 *   "userId": "user123",
 *   "role": "admin"
 * }
 * ```
 */
export const GET = withAuth(
    async (req: NextRequest, user: AuthUser) => {
        try {
            // ✅ User is already authenticated by middleware
            // ✅ Permissions are already fetched from database
            
            console.log(`[PERMISSIONS] Fetching permissions for user: ${user.id}`);
            
            // Return permissions to client
            // Client can cache these for UI, but MUST NOT trust them for security
            return NextResponse.json({
                success: true,
                permissions: user.permissions,
                userId: user.id,
                role: user.role || 'user',
                timestamp: new Date().toISOString(),
            });
            
        } catch (error: any) {
            console.error('[PERMISSIONS] Error fetching permissions:', error);
            
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to fetch permissions',
                    message: error.message || 'Unknown error'
                },
                { status: 500 }
            );
        }
    },
    {
        // No specific permission required - all authenticated users can fetch their own permissions
        allowPublic: false
    }
);

// ============================================================================
// OPTIONS /api/auth/permissions (CORS Preflight)
// ============================================================================

export async function OPTIONS(req: NextRequest) {
    // Get allowed origins from environment
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    const origin = req.headers.get('origin');
    
    // Check if origin is allowed
    const allowOrigin = origin && allowedOrigins.includes(origin) 
        ? origin 
        : allowedOrigins[0] || 'https://yourdomain.com';
    
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': allowOrigin,
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Max-Age': '86400', // 24 hours
            'Access-Control-Allow-Credentials': 'true',
        },
    });
}













