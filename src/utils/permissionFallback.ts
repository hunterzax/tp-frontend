/**
 * Permission Fallback Utility
 * 
 * CWE-284 Temporary Solution: Provides fallback mechanism for components
 * that haven't been migrated to useUserPermissions hook yet
 * 
 * ⚠️ TEMPORARY: This should be removed once all components are migrated
 * 
 * @created 2025-10-29
 * @deprecated Use useUserPermissions hook instead
 */

'use client';

import { decryptData } from './encryptionData';

// ============================================================================
// Types
// ============================================================================

export interface PermissionConfig {
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

// ============================================================================
// Main Fallback Function
// ============================================================================

/**
 * Get permissions with server validation fallback
 * 
 * This function attempts to:
 * 1. Fetch from server API (✅ SECURE)
 * 2. Fall back to localStorage if server unavailable (⚠️ UX ONLY)
 * 
 * ⚠️ WARNING: localStorage data is NOT secure!
 * This is for UX continuity only during migration period.
 * 
 * @deprecated Migrate to useUserPermissions hook instead
 */
export async function getPermissionsWithFallback(
    token: string | null
): Promise<{ permissions: PermissionConfig | null; source: 'server' | 'cache' | 'none' }> {

    // Try server first (SECURE)
    if (token) {
        try {
            const cleanToken = token.replace(/^"|"$/g, '');

            const response = await fetch('/api/auth/permissions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                // Add timeout
                signal: AbortSignal.timeout(5000),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.permissions) {
                    // ✅ Got permissions from server - SECURE
                    console.log('[PERMISSION_FALLBACK] Using server permissions (SECURE)');

                    // Update cache for next time
                    updateCachedPermissions(data.permissions);

                    return {
                        permissions: data.permissions,
                        source: 'server',
                    };
                }
            }
        } catch (error) {
            console.warn('[PERMISSION_FALLBACK] Server fetch failed, falling back to cache:', error);
        }
    }

    // Fallback to localStorage (UX ONLY - NOT SECURE!)
    try {
        // Try new cache format first
        const cachedData = localStorage.getItem('cached_permissions');
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            const cacheAge = Date.now() - parsed.timestamp;

            // Use cache if less than 10 minutes old
            if (cacheAge < 10 * 60 * 1000) {
                console.warn('[PERMISSION_FALLBACK] Using cached permissions (UX ONLY - NOT SECURE!)');
                return {
                    permissions: parsed.permissions,
                    source: 'cache',
                };
            }
        }

        // Try old localStorage format (k3a9r2b6m7t0x5w1s8j)
        const oldFormat = localStorage.getItem("k3a9r2b6m7t0x5w1s8j");
        if (oldFormat) {
            const decrypted = decryptData(oldFormat);
            if (decrypted) {
                const parsed = JSON.parse(decrypted);
                if (parsed?.role_config) {
                    const permissions = generateUserPermission(parsed);
                    console.warn('[PERMISSION_FALLBACK] Using old localStorage format (MIGRATION NEEDED!)');
                    return {
                        permissions,
                        source: 'cache',
                    };
                }
            }
        }
    } catch (error) {
        console.error('[PERMISSION_FALLBACK] Cache read failed:', error);
    }

    // No permissions available
    console.error('[PERMISSION_FALLBACK] No permissions available (server or cache)');
    return {
        permissions: null,
        source: 'none',
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate user permission from role_config
 * 
 * @deprecated This is the old pattern - kept for backward compatibility only
 */
function generateUserPermission(permission: any): PermissionConfig {
    return {
        f_view: permission?.role_config?.f_view === 1,
        f_create: permission?.role_config?.f_create === 1,
        f_edit: permission?.role_config?.f_edit === 1,
        f_delete: permission?.role_config?.f_delete === 1,
        f_import: permission?.role_config?.f_import === 1,
        f_export: permission?.role_config?.f_export === 1,
        f_approved: permission?.role_config?.f_approved === 1,
        f_noti_inapp: permission?.role_config?.f_noti_inapp === 1,
        f_noti_email: permission?.role_config?.f_noti_email === 1,
    };
}

/**
 * Update cached permissions
 */
function updateCachedPermissions(permissions: PermissionConfig): void {
    try {
        localStorage.setItem(
            'cached_permissions',
            JSON.stringify({
                permissions,
                timestamp: Date.now(),
            })
        );
    } catch (error) {
        console.warn('[PERMISSION_FALLBACK] Failed to update cache:', error);
    }
}

// ============================================================================
// Synchronous Fallback (for immediate use)
// ============================================================================

/**
 * Get permissions synchronously from cache only
 * 
 * ⚠️ WARNING: This is NOT secure! Use only for UI rendering.
 * Always validate permissions on server for any actual operations.
 * 
 * @deprecated Use useUserPermissions hook instead
 */
export function getPermissionsSyncFromCache(): PermissionConfig | null {
    if (typeof window === 'undefined') return null;

    try {
        // Try new cache format
        const cachedData = localStorage.getItem('cached_permissions');
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            return parsed.permissions;
        }

        // Try old format
        const oldFormat = localStorage.getItem("k3a9r2b6m7t0x5w1s8j");
        if (oldFormat) {
            const decrypted = decryptData(oldFormat);
            if (decrypted) {
                const parsed = JSON.parse(decrypted);
                if (parsed?.role_config) {
                    return generateUserPermission(parsed);
                }
            }
        }
    } catch (error) {
        console.error('[PERMISSION_FALLBACK] Sync cache read failed:', error);
    }

    return null;
}

// ============================================================================
// Migration Helper
// ============================================================================

/**
 * Check if component has been migrated to new permission system
 * 
 * Returns true if using useUserPermissions, false if still using old pattern
 */
export function checkMigrationStatus(componentName: string): boolean {
    // This is a helper for tracking migration progress
    // You can implement this based on your needs

    const migratedComponents = [
        'SecurePageExample',
        // Add components here as you migrate them
    ];

    return migratedComponents.includes(componentName);
}

// ============================================================================
// Export
// ============================================================================

const permissionFallback = {
    getPermissionsWithFallback,
    getPermissionsSyncFromCache,
    checkMigrationStatus,
};

export default permissionFallback;













