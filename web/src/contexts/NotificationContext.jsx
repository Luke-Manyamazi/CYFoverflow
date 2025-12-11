/* eslint-disable react-refresh/only-export-components */
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import { useAuth } from "./useAuth";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const { isLoggedIn, user, token } = useAuth();

	const fetchNotifications = useCallback(async () => {
		if (!isLoggedIn || !user?.id) {
			setNotifications([]);
			setUnreadCount(0);
			return;
		}

		try {
			setLoading(true);
			const response = await fetch("/api/notifications", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setNotifications(data);
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Failed to fetch notifications:", {
					status: response.status,
					statusText: response.statusText,
					error: errorData,
				});
			}
		} catch (error) {
			console.error("Error fetching notifications:", error);
		} finally {
			setLoading(false);
		}
	}, [isLoggedIn, user?.id, token]);

	const fetchUnreadCount = useCallback(async () => {
		if (!isLoggedIn || !user?.id) {
			setUnreadCount(0);
			return;
		}

		try {
			const response = await fetch("/api/notifications/unread-count", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setUnreadCount(data.count || 0);
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Failed to fetch unread count:", {
					status: response.status,
					statusText: response.statusText,
					error: errorData,
				});
			}
		} catch (error) {
			console.error("Error fetching unread count:", error);
		}
	}, [isLoggedIn, user?.id, token]);

	const markAsRead = useCallback(
		async (notificationId) => {
			if (!isLoggedIn || !user?.id) return;

			try {
				const response = await fetch(
					`/api/notifications/${notificationId}/read`,
					{
						method: "PUT",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				if (response.ok) {
					setNotifications((prev) =>
						prev.map((notif) =>
							notif.id === notificationId ? { ...notif, read: true } : notif,
						),
					);
					setUnreadCount((prev) => Math.max(0, prev - 1));
				}
			} catch (error) {
				console.error("Error marking notification as read:", error);
			}
		},
		[isLoggedIn, user?.id, token],
	);

	const markAllAsRead = useCallback(async () => {
		if (!isLoggedIn || !user?.id) return;

		try {
			const response = await fetch("/api/notifications/read-all", {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				setNotifications((prev) =>
					prev.map((notif) => ({ ...notif, read: true })),
				);
				setUnreadCount(0);
			}
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
		}
	}, [isLoggedIn, user?.id, token]);

	useEffect(() => {
		if (isLoggedIn && user?.id) {
			fetchNotifications();
			fetchUnreadCount();
		} else {
			setNotifications([]);
			setUnreadCount(0);
		}
	}, [isLoggedIn, user?.id, token, fetchNotifications, fetchUnreadCount]);

	useEffect(() => {
		if (!isLoggedIn || !user?.id) return;

		const POLL_INTERVAL = 30000;

		const intervalId = setInterval(() => {
			if (document.visibilityState === "visible") {
				fetchUnreadCount();
			}
		}, POLL_INTERVAL);

		const handleFocus = () => {
			fetchUnreadCount();
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				fetchUnreadCount();
			}
		};

		window.addEventListener("focus", handleFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			clearInterval(intervalId);
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [isLoggedIn, user?.id, token, fetchUnreadCount]);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				loading,
				fetchNotifications,
				fetchUnreadCount,
				markAsRead,
				markAllAsRead,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
}

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotifications must be used within NotificationProvider",
		);
	}
	return context;
}
