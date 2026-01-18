/**
 * API Authentication Middleware
 * 
 * CWE-284 Fix: Server-side authentication and authorization middleware
 * This middleware provides JWT token validation and permission checking for API routes
 * 
 * @file apiAuthMiddleware.ts
 * @created 2025-10-29
 * @security CRITICAL - This file implements server-side access control
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AuthUser {
    id: string;
    email?: string;
    role?: string;
    permissions: UserPermissions;
}

export interface UserPermissions {
    f_view?: boolean;
    f_create?: boolean;
    f_edit?: boolean;
    f_delete?: boolean;
    f_import?: boolean;
    f_export?: boolean;
    f_approved?: boolean;
    f_noti_inapp?: boolean;
    f_noti_email?: boolean;
}

export interface AuthConfig {
    requiredPermission?: keyof UserPermissions;
    requiredRole?: string[];
    allowPublic?: boolean;
}

export type AuthenticatedHandler = (
    req: NextRequest,
    user: AuthUser
) => Promise<NextResponse>;

// ============================================================================
// Main Authentication Middleware
// ============================================================================

/**
 * Wraps API route handlers with authentication and authorization
 * 
 * @param handler - The actual API route handler to execute
 * @param config - Authentication configuration options
 * @returns Wrapped handler with authentication
 * 
 * @example
 * ```typescript
 * export const GET = withAuth(
 *     async (req, user) => {
 *         // Handler code here - user is already authenticated
 *         return NextResponse.json({ data: "secure data" });
 *     },
 *     { requiredPermission: 'f_view' }
 * );
 * ```
 */
export function withAuth(
    handler: AuthenticatedHandler,
    config: AuthConfig = {}
): (req: NextRequest) => Promise<NextResponse> {
    return async (req: NextRequest): Promise<NextResponse> => {
        // ✅ PUBLIC ENDPOINTS: Skip auth for public routes
        if (config.allowPublic) {
            // Create a mock user for public endpoints
            const publicUser: AuthUser = {
                id: 'public',
                permissions: {},
            };
            return handler(req, publicUser);
        }

        // ============================================================================
        // STEP 1: Extract Token from Request
        // ============================================================================
        
        const token = extractToken(req);
        
        if (!token) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'No authentication token provided',
                    code: 'NO_TOKEN'
                },
                { status: 401 }
            );
        }

        // ============================================================================
        // STEP 2: Validate JWT Token
        // ============================================================================
        
        let payload: any;
        try {
            payload = await validateJWT(token);
        } catch (error: any) {
            console.error('[AUTH] Token validation failed:', error.message);
            
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: getErrorMessage(error),
                    code: getErrorCode(error)
                },
                { status: 401 }
            );
        }

        // ============================================================================
        // STEP 3: Fetch User Permissions from Database
        // ============================================================================
        
        let permissions: UserPermissions;
        try {
            permissions = await fetchUserPermissions(payload.sub || payload.userId);
        } catch (error: any) {
            console.error('[AUTH] Failed to fetch permissions:', error.message);
            
            return NextResponse.json(
                {
                    error: 'Internal Server Error',
                    message: 'Failed to fetch user permissions',
                    code: 'PERMISSION_FETCH_ERROR'
                },
                { status: 500 }
            );
        }

        // ============================================================================
        // STEP 4: Check Required Role
        // ============================================================================
        
        if (config.requiredRole && config.requiredRole.length > 0) {
            const userRole = payload.role || '';
            
            if (!config.requiredRole.includes(userRole)) {
                console.warn(`[AUTH] User ${payload.sub} role '${userRole}' not in required roles:`, config.requiredRole);
                
                return NextResponse.json(
                    {
                        error: 'Forbidden',
                        message: 'Insufficient role permissions',
                        code: 'INSUFFICIENT_ROLE',
                        required: config.requiredRole,
                        current: userRole
                    },
                    { status: 403 }
                );
            }
        }

        // ============================================================================
        // STEP 5: Check Required Permission
        // ============================================================================
        
        if (config.requiredPermission) {
            const hasPermission = permissions[config.requiredPermission] === true;
            
            if (!hasPermission) {
                console.warn(`[AUTH] User ${payload.sub} missing permission: ${config.requiredPermission}`);
                
                return NextResponse.json(
                    {
                        error: 'Forbidden',
                        message: `Permission '${config.requiredPermission}' is required`,
                        code: 'INSUFFICIENT_PERMISSION',
                        required: config.requiredPermission
                    },
                    { status: 403 }
                );
            }
        }

        // ============================================================================
        // STEP 6: Construct Authenticated User Object
        // ============================================================================
        
        const user: AuthUser = {
            id: payload.sub || payload.userId,
            email: payload.email,
            role: payload.role,
            permissions: permissions,
        };

        // ============================================================================
        // STEP 7: Log API Access for Audit Trail
        // ============================================================================
        
        await logApiAccess({
            userId: user.id,
            endpoint: req.nextUrl.pathname,
            method: req.method,
            timestamp: new Date(),
            ip: getClientIP(req),
            userAgent: req.headers.get('user-agent') || 'unknown'
        });

        // ============================================================================
        // STEP 8: Execute Handler with Authenticated User
        // ============================================================================
        
        try {
            return await handler(req, user);
        } catch (error: any) {
            console.error('[AUTH] Handler execution error:', error);
            
            return NextResponse.json(
                {
                    error: 'Internal Server Error',
                    message: 'An error occurred processing your request',
                    code: 'HANDLER_ERROR'
                },
                { status: 500 }
            );
        }
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract JWT token from request headers or cookies
 */
function extractToken(req: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Try cookie as fallback
    const cookieToken = req.cookies.get('v4r2d9z5m3h0c1p0x7l')?.value;
    if (cookieToken) {
        // Remove quotes if present
        return cookieToken.replace(/^"|"$/g, '');
    }

    return null;
}

/**
 * Validate JWT token and return payload
 * 
 * ✅ PRODUCTION-READY: Uses jose library for proper JWT validation
 * This validates both the signature and claims of the JWT token
 */
async function validateJWT(token: string): Promise<any> {
    try {
        // ✅ Get JWT secret from environment
        const jwtSecret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
        
        if (!jwtSecret) {
            console.error('[AUTH] JWT_SECRET not configured in environment variables');
            throw new Error('JWT secret not configured');
        }

        // ✅ Import jose for JWT verification
        const { jwtVerify } = await import('jose');
        
        // ✅ Convert secret to Uint8Array as required by jose
        const secret = new TextEncoder().encode(jwtSecret);
        
        // ✅ Verify JWT with signature validation
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'], // Specify allowed algorithms
        });
        
        // ✅ Additional validation checks
        if (!payload.sub && !payload.userId) {
            throw new Error('Token missing user identifier');
        }
        
        // Log successful validation (in development only)
        if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] JWT validated successfully for user:', payload.sub || payload.userId);
        }
        
        return payload;
        
    } catch (error: any) {
        // Log error details for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('[AUTH] JWT validation error:', error.message);
        }
        
        // Re-throw with user-friendly message
        if (error.code === 'ERR_JWT_EXPIRED' || error.message.includes('exp')) {
            throw new Error('Token expired');
        }
        
        if (error.message.includes('signature')) {
            throw new Error('Invalid token signature');
        }
        
        if (error.message.includes('malformed')) {
            throw new Error('Malformed token');
        }
        
        throw new Error(`JWT validation failed: ${error.message}`);
    }
}

/**
 * Fetch user permissions from database
 * 
 * ⚠️ IMPORTANT: This is a PLACEHOLDER implementation
 * Replace this with actual database query
 */
async function fetchUserPermissions(userId: string): Promise<UserPermissions> {
    // ⚠️ TODO: Implement actual database query
    // Example implementation:
    // 
    // const db = await getDatabase();
    // const result = await db.query(`
    //     SELECT rp.* 
    //     FROM user_roles ur
    //     JOIN role_permissions rp ON ur.role_id = rp.role_id
    //     WHERE ur.user_id = ?
    // `, [userId]);
    // 
    // return {
    //     f_view: result.f_view === 1,
    //     f_create: result.f_create === 1,
    //     ... etc
    // };

    // TEMPORARY: Return mock permissions (REPLACE THIS!)
    console.warn('[AUTH] Using mock permissions - REPLACE WITH database query!');
    
    // For development: grant all permissions
    // For production: MUST fetch from database
    return {
        f_view: true,
        f_create: true,
        f_edit: true,
        f_delete: false, // Example: not everyone can delete
        f_import: true,
        f_export: true,
        f_approved: false, // Example: not everyone can approve
        f_noti_inapp: true,
        f_noti_email: true,
    };
}

/**
 * Log API access for audit trail
 * 
 * ⚠️ IMPORTANT: Implement actual logging to database or logging service
 */
async function logApiAccess(data: {
    userId: string;
    endpoint: string;
    method: string;
    timestamp: Date;
    ip: string;
    userAgent: string;
}): Promise<void> {
    // ⚠️ TODO: Implement actual audit logging
    // Options:
    // 1. Log to database table
    // 2. Send to logging service (e.g., Datadog, Sentry)
    // 3. Write to file (not recommended for production)
    
    // TEMPORARY: Console log (REPLACE THIS!)
    if (process.env.NODE_ENV === 'development') {
        console.log('[AUDIT]', {
            userId: data.userId,
            endpoint: data.endpoint,
            method: data.method,
            timestamp: data.timestamp.toISOString(),
            ip: data.ip,
        });
    }
    
    // Production implementation example:
    // await db.query(`
    //     INSERT INTO audit_logs (user_id, endpoint, method, ip, user_agent, timestamp)
    //     VALUES (?, ?, ?, ?, ?, ?)
    // `, [data.userId, data.endpoint, data.method, data.ip, data.userAgent, data.timestamp]);
}

/**
 * Get client IP address from request
 */
function getClientIP(req: NextRequest): string {
    // Try common headers for client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIP = req.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    return 'unknown';
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: any): string {
    const message = error.message || 'Unknown error';
    
    if (message.includes('expired')) {
        return 'Your session has expired. Please sign in again.';
    }
    
    if (message.includes('invalid') || message.includes('malformed')) {
        return 'Invalid authentication token. Please sign in again.';
    }
    
    return 'Authentication failed. Please sign in again.';
}

/**
 * Get error code for client handling
 */
function getErrorCode(error: any): string {
    const message = error.message || '';
    
    if (message.includes('expired')) {
        return 'TOKEN_EXPIRED';
    }
    
    if (message.includes('invalid') || message.includes('malformed')) {
        return 'TOKEN_INVALID';
    }
    
    return 'AUTH_FAILED';
}

// ============================================================================
// Exports
// ============================================================================

export default withAuth;
