// utils/notifyStorage.ts
// CWE-922 Fix: Use secure storage for notifications
"use client";

import { secureLocalStorage } from "@/utils/secureStorage";

const STORAGE_KEY = "notifications";

export const getStoredNotifications = () => {
    const raw = secureLocalStorage.getItem(STORAGE_KEY);
    return raw || [];
};

export const storeNotification = (notification: any) => {
    const notis = getStoredNotifications();
    const alreadyExist = notis.find((n: any) => n.id === notification.id);
    if (!alreadyExist) {
        notis.unshift({ ...notification, isRead: false });
        secureLocalStorage.setItem(STORAGE_KEY, notis, { encrypt: false });
    }
};

export const storeNotificationList = (notification: any[]) => {
    const notis = getStoredNotifications();
    const newNotis = notification.filter((n: any) => !notis.some((m: any) => m.id === n.id));
    if (newNotis.length > 0) {
        const newNotisWithRead = newNotis.map((n: any) => ({ ...n, isRead: false }));
        notis.unshift(...newNotisWithRead);
        secureLocalStorage.setItem(STORAGE_KEY, notis, { encrypt: false });
    }
};

export const markAsRead = (notification: any[]) => {
    const notis = getStoredNotifications().map((n: any) => ({
        ...n,
        isRead: notification.some((noti: any) => noti === n.id) ? true : n.isRead,
    }));
    secureLocalStorage.setItem(STORAGE_KEY, notis, { encrypt: false });
};

export const markAllAsRead = () => {
    const notis = getStoredNotifications().map((n: any) => ({
        ...n,
        isRead: true,
    }));
    secureLocalStorage.setItem(STORAGE_KEY, notis, { encrypt: false });
};

export const clearNotifications = () => {
    secureLocalStorage.removeItem(STORAGE_KEY);
};