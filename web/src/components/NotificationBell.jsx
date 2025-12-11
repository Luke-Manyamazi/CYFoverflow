import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "../contexts/NotificationContext";

function NotificationBell() {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const {
		notifications,
		unreadCount,
		loading,
		fetchNotifications,
		markAsRead,
		markAllAsRead,
	} = useNotifications();
	const navigate = useNavigate();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			fetchNotifications();
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, fetchNotifications]);

	const handleNotificationClick = async (notification) => {
		if (!notification.read) {
			await markAsRead(notification.id);
		}

		if (notification.related_question_id) {
			const identifier =
				notification.question_slug || notification.related_question_id;

			// If there's a related answer, navigate to it with hash
			if (notification.related_answer_id) {
				navigate(
					`/questions/${identifier}#answer-${notification.related_answer_id}`,
				);
			} else {
				navigate(`/questions/${identifier}`);
			}
			setIsOpen(false);
		}
	};

	const formatTimeAgo = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const seconds = Math.floor((now - date) / 1000);

		if (seconds < 60) return "just now";
		if (seconds < 3600) {
			const minutes = Math.floor(seconds / 60);
			return `${minutes}m ago`;
		}
		if (seconds < 86400) {
			const hours = Math.floor(seconds / 3600);
			return `${hours}h ago`;
		}
		const days = Math.floor(seconds / 86400);
		return `${days}d ago`;
	};

	const getNotificationIcon = (type) => {
		switch (type) {
			case "answer":
				return (
					<svg
						className="w-5 h-5 text-[#281d80]"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				);
			case "question_updated":
				return (
					<svg
						className="w-5 h-5 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				);
			case "answer_updated":
				return (
					<svg
						className="w-5 h-5 text-orange-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
						/>
					</svg>
				);
			default:
				return (
					<svg
						className="w-5 h-5 text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
						/>
					</svg>
				);
		}
	};

	const truncateMessage = (message, maxLength = 80) => {
		if (message.length <= maxLength) return message;
		return message.substring(0, maxLength).trim() + "...";
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
				aria-label="Notifications"
			>
				<svg
					className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 block h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-[#ed4d4e] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-80 md:w-96 max-w-[calc(100vw-1rem)] sm:max-w-none bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-8rem)] sm:max-h-96 overflow-hidden flex flex-col">
					<div className="px-4 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
						<h3 className="text-base sm:text-lg font-semibold text-gray-900">
							Notifications
							{unreadCount > 0 && (
								<span className="ml-2 px-2 py-0.5 text-xs font-medium bg-[#ed4d4e] text-white rounded-full">
									{unreadCount}
								</span>
							)}
						</h3>
						{unreadCount > 0 && (
							<button
								onClick={markAllAsRead}
								className="text-xs sm:text-sm text-[#281d80] hover:text-[#1f1566] font-medium cursor-pointer transition-colors"
							>
								Mark all read
							</button>
						)}
					</div>

					<div className="overflow-y-auto flex-1">
						{loading ? (
							<div className="px-4 py-12 text-center">
								<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#281d80]"></div>
								<p className="mt-2 text-sm text-gray-500">Loading...</p>
							</div>
						) : notifications.length === 0 ? (
							<div className="px-4 py-12 text-center">
								<svg
									className="mx-auto h-12 w-12 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
									/>
								</svg>
								<p className="mt-2 text-sm font-medium text-gray-900">
									No notifications
								</p>
								<p className="mt-1 text-xs text-gray-500">
									You&apos;re all caught up!
								</p>
							</div>
						) : (
							<div className="divide-y divide-gray-100">
								{notifications.map((notification) => (
									<button
										key={notification.id}
										onClick={() => handleNotificationClick(notification)}
										className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer group ${
											!notification.read
												? "bg-blue-50/50 hover:bg-blue-100/50"
												: "bg-white"
										}`}
									>
										<div className="flex items-start gap-3">
											<div className="flex-shrink-0 mt-0.5">
												{getNotificationIcon(notification.type)}
											</div>
											<div className="flex-1 min-w-0">
												<p
													className={`text-sm leading-snug ${
														!notification.read
															? "font-semibold text-gray-900"
															: "font-normal text-gray-700"
													}`}
												>
													{truncateMessage(notification.message)}
												</p>
												<div className="flex items-center gap-2 mt-1.5">
													<p className="text-xs text-gray-500">
														{formatTimeAgo(notification.created_at)}
													</p>
													{!notification.read && (
														<span className="h-1.5 w-1.5 rounded-full bg-[#281d80]"></span>
													)}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default NotificationBell;
