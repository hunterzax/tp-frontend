/**
 * useUserPermissions Hook
 * 
 * CWE-284 Fix: Fetch permissions from SERVER, not localStorage
 * This hook provides a secure way to get user permissions for UI rendering
 * 
 * ✅ PRODUCTION-READY: Server-validated permissions
 * 
 * @created 2025-10-29
 * @security Permissions are fetched from /api/auth/permissions (server-side)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import getCookieValue from '@/utils/getCookieValue';

// ============================================================================
// Types
// ============================================================================

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

export interface UseUserPermissionsReturn {
    permissions: UserPermissions | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Hook to fetch user permissions from server
 * 
 * @returns {UseUserPermissionsReturn} Object containing permissions, loading state, and error
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *     const { permissions, loading, error } = useUserPermissions();
 *     
 *     if (loading) return <Loading />;
 *     if (error) return <Error message={error} />;
 *     
 *     return (
 *         <div>
 *             {permissions?.f_create && <CreateButton />}
 *             {permissions?.f_edit && <EditButton />}
 *         </div>
 *     );
 * }
 * ```
 */
export function useUserPermissions(): UseUserPermissionsReturn {
    const router = useRouter();
    const [permissions, setPermissions] = useState<UserPermissions | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // ============================================================================
    // Fetch Permissions from Server
    // ============================================================================

    // ============================================================================
    // Fetch Permissions from Server
    // ============================================================================

    // Use useCallback to prevent infinite loops in useEffect
    const fetchPermissions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Get token from cookie
            const token = getCookieValue('v4r2d9z5m3h0c1p0x7l');

            if (!token) {
                // No token - redirect to signin
                console.warn('[PERMISSIONS] No token found, redirecting to signin');
                router.push('/en/signin');
                return;
            }

            // Remove quotes from token if present
            const cleanToken = token.replace(/^"|"$/g, '');

            // ✅ Fetch permissions from SERVER API (not localStorage!)
            const response = await fetch('/api/auth/permissions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid - redirect to signin
                    console.warn('[PERMISSIONS] Token invalid/expired, redirecting to signin');
                    router.push('/en/signin?error=session_expired');
                    return;
                }

                if (response.status === 403) {
                    // Forbidden - user doesn't have access
                    throw new Error('Access forbidden');
                }

                throw new Error(`Failed to fetch permissions: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !data.permissions) {
                throw new Error('Invalid response format from permissions API');
            }

            // ✅ Set permissions from server
            setPermissions(data.permissions);

            // Optional: Cache in localStorage for offline/UX purposes
            // But NEVER trust this for security - always validate on server!
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem(
                        'cached_permissions',
                        JSON.stringify({
                            permissions: data.permissions,
                            timestamp: Date.now(),
                            userId: data.userId,
                        })
                    );
                } catch (e) {
                    // Ignore localStorage errors
                    console.warn('[PERMISSIONS] Failed to cache permissions:', e);
                }
            }

            console.log('[PERMISSIONS] Successfully fetched permissions from server');

        } catch (err: any) {
            console.error('[PERMISSIONS] Error fetching permissions:', err);
            setError(err.message || 'Failed to fetch permissions');

            // Try to use cached permissions as fallback (UX only, not for security!)
            if (typeof window !== 'undefined') {
                try {
                    const cached = localStorage.getItem('cached_permissions');
                    if (cached) {
                        const parsedCache = JSON.parse(cached);
                        const cacheAge = Date.now() - parsedCache.timestamp;

                        // Use cache if less than 5 minutes old
                        if (cacheAge < 5 * 60 * 1000) {
                            console.warn('[PERMISSIONS] Using cached permissions (UX only)');
                            setPermissions(parsedCache.permissions);
                            setError('Using cached permissions (may be outdated)');
                        }
                    }
                } catch (e) {
                    // Ignore cache errors
                }
            }

        } finally {
            setLoading(false);
        }
    }, [router]);

    // ============================================================================
    // Effect: Fetch on Mount
    // ============================================================================

    useEffect(() => {
        fetchPermissions();

        // Optional: Refresh permissions periodically (every 5 minutes)
        const interval = setInterval(() => {
            console.log('[PERMISSIONS] Refreshing permissions...');
            fetchPermissions();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchPermissions]); // fetchPermissions is now stable via useCallback

    // ============================================================================
    // Return Hook API
    // ============================================================================

    return {
        permissions,
        loading,
        error,
        refetch: fetchPermissions,
    };
}

// ============================================================================
// Helper Hook: Check Specific Permission
// ============================================================================

/**
 * Hook to check if user has a specific permission
 * 
 * @param {keyof UserPermissions} permission - The permission to check
 * @returns {boolean} Whether user has the permission
 * 
 * @example
 * ```tsx
 * function CreateButton() {
 *     const canCreate = useHasPermission('f_create');
 *     
 *     if (!canCreate) return null;
 *     
 *     return <button>Create New</button>;
 * }
 * ```
 */
export function useHasPermission(permission: keyof UserPermissions): boolean {
    const { permissions, loading } = useUserPermissions();

    if (loading || !permissions) {
        return false; // Default to no permission while loading
    }

    return permissions[permission] === true;
}

// ============================================================================
// Helper Hook: Check Multiple Permissions (AND logic)
// ============================================================================

/**
 * Hook to check if user has ALL of the specified permissions
 * 
 * @param {Array<keyof UserPermissions>} requiredPermissions - Permissions to check
 * @returns {boolean} Whether user has all permissions
 * 
 * @example
 * ```tsx
 * function EditAndDeleteButtons() {
 *     const canEditAndDelete = useHasAllPermissions(['f_edit', 'f_delete']);
 *     
 *     if (!canEditAndDelete) return null;
 *     
 *     return (
 *         <>
 *             <button>Edit</button>
 *             <button>Delete</button>
 *         </>
 *     );
 * }
 * ```
 */
export function useHasAllPermissions(
    requiredPermissions: Array<keyof UserPermissions>
): boolean {
    const { permissions, loading } = useUserPermissions();

    if (loading || !permissions) {
        return false;
    }

    return requiredPermissions.every(perm => permissions[perm] === true);
}

// ============================================================================
// Helper Hook: Check Any Permission (OR logic)
// ============================================================================

/**
 * Hook to check if user has ANY of the specified permissions
 * 
 * @param {Array<keyof UserPermissions>} anyPermissions - Permissions to check
 * @returns {boolean} Whether user has at least one permission
 * 
 * @example
 * ```tsx
 * function ModifyButton() {
 *     const canModify = useHasAnyPermission(['f_edit', 'f_create']);
 *     
 *     if (!canModify) return null;
 *     
 *     return <button>Modify</button>;
 * }
 * ```
 */
export function useHasAnyPermission(
    anyPermissions: Array<keyof UserPermissions>
): boolean {
    const { permissions, loading } = useUserPermissions();

    if (loading || !permissions) {
        return false;
    }

    return anyPermissions.some(perm => permissions[perm] === true);
}

// ============================================================================
// Export Default
// ============================================================================

export default useUserPermissions;












