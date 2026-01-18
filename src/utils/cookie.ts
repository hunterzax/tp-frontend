export const deleteCookie = async (name: any) => {
    setCookie(name, null, 0);
  };
  
  export const deleteCookieCustom = async (name: any, damain:any) => {
    setCookieDelete(name, null, 0, damain);
  };
  
  export const setCookieDelete = (name: any, value: any, daysToExpire: any, domain: any) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);
  
    const cookieValue =
      encodeURIComponent(name) +
      "=" +
      encodeURIComponent(value) +
      "; expires=" +
      expirationDate.toUTCString() +
      "; path=/; domain=" +
      domain +
      "; SameSite=None; Secure";
  
    document.cookie = cookieValue;
  };
  
  /**
   * ✅ CWE-614 Fix: Added Secure and SameSite flags
   * 
   * ⚠️ IMPORTANT: HttpOnly flag cannot be set from client-side JavaScript
   * For authentication tokens and sensitive data, use server-side cookie management
   * through Next.js API routes or middleware.
   * 
   * This function now includes:
   * - Secure flag: Cookie only sent over HTTPS in production
   * - SameSite=Strict: Protection against CSRF attacks
   * 
   * @param name - Cookie name
   * @param value - Cookie value
   * @param daysToExpire - Number of days until expiration
   */
  export const setCookie = async (name: any, value: any, daysToExpire: any) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);
  
    // Build secure cookie string
    let cookieValue =
      encodeURIComponent(name) +
      "=" +
      encodeURIComponent(value) +
      "; expires=" +
      expirationDate.toUTCString() +
      "; path=/";
    
    // ✅ Add Secure flag in production (HTTPS only)
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      cookieValue += "; Secure";
    }
    
    // ✅ Add SameSite flag for CSRF protection
    cookieValue += "; SameSite=Strict";
  
    document.cookie = cookieValue;
  };
  
  export const getCookie = async (name: any) => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=");
  
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };
  