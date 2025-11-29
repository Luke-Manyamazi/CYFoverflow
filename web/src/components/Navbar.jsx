import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const navigate = useNavigate();
	const { isLoggedIn, user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate("/");
		setIsMenuOpen(false);
	};

	const userName = user?.name;

	// Mock notifications data - we can replace this with real data later
	const mockNotifications = [
		{
			id: 1,
			text: "Example notification text 1",
			time: "2 hours ago",
			read: false,
		},
		{
			id: 2,
			text: "Example notification text 2",
			time: "1 day ago",
			read: true,
		},
		{
			id: 3,
			text: "Example notification text 3",
			time: "3 days ago",
			read: true,
		},
	];

	const unreadCount = mockNotifications.filter(
		(notification) => !notification.read,
	).length;

	return (
		<nav className="bg-white shadow-lg border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16 md:h-20">
					<Link
						to="/"
						className="flex items-center hover:opacity-80 transition-opacity"
					>
						<span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
							<span style={{ color: "#ed4d4e" }}>CYF</span>
							<span style={{ color: "#281d80" }}>overflow</span>
						</span>
					</Link>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center gap-4 lg:gap-6">
						<Link
							to="/"
							className="text-gray-700 hover:text-[#281d80] px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold transition-colors duration-200"
						>
							Home
						</Link>

						{isLoggedIn ? (
							<>
								{/* Ask Question Button */}
								<Link
									to="/ask"
									className="bg-[#281d80] text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg"
								>
									Ask Question
								</Link>

								{/* Notifications */}
								<div className="relative">
									<button
										onClick={() => setShowNotifications(!showNotifications)}
										className="relative p-2 text-gray-700 hover:text-[#281d80] hover:bg-gray-100 rounded-lg transition-colors duration-200"
										aria-label="Notifications"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										{unreadCount > 0 && (
											<span className="absolute -top-1 -right-1 bg-[#ed4d4e] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
												{unreadCount}
											</span>
										)}
									</button>

									{/* Notifications Dropdown */}
									{showNotifications && (
										<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
											<div className="p-4 border-b border-gray-200">
												<h3 className="text-lg font-semibold text-gray-900">
													Notifications
												</h3>
											</div>
											<div className="max-h-96 overflow-y-auto">
												{mockNotifications.length > 0 ? (
													mockNotifications.map((notification) => (
														<div
															key={notification.id}
															className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
																!notification.read ? "bg-blue-50" : ""
															}`}
														>
															<p className="text-sm text-gray-800">
																{notification.text}
															</p>
															<p className="text-xs text-gray-500 mt-1">
																{notification.time}
															</p>
														</div>
													))
												) : (
													<div className="p-4 text-center text-gray-500">
														No notifications yet
													</div>
												)}
											</div>
											<div className="p-4 border-t border-gray-200">
												<button className="text-sm text-[#281d80] hover:text-[#1f1566] font-medium">
													View all notifications
												</button>
											</div>
										</div>
									)}
								</div>

								{/* Profile Icon */}
								<button
									onClick={() => navigate("/profile")}
									className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
									aria-label="Profile"
								>
									<div className="w-8 h-8 bg-[#281d80] text-white rounded-full flex items-center justify-center font-semibold">
										{userName?.charAt(0).toUpperCase()}
									</div>
									<span className="text-gray-700 text-sm lg:text-base font-medium hidden lg:inline">
										{userName}
									</span>
								</button>

								{/* Logout Button */}
								<button
									onClick={handleLogout}
									className="bg-[#ed4d4e] text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-semibold hover:bg-[#d43d3e] transition-all duration-200 shadow-md hover:shadow-lg"
								>
									Logout
								</button>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="text-gray-700 hover:text-[#281d80] px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold transition-colors duration-200"
								>
									Login
								</Link>
								<Link
									to="/signup"
									className="bg-[#281d80] text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
						aria-label="Toggle menu"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							{isMenuOpen ? (
								<path d="M6 18L18 6M6 6l12 12" />
							) : (
								<path d="M4 6h16M4 12h16M4 18h16" />
							)}
						</svg>
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden py-4 border-t border-gray-200">
						<div className="flex flex-col space-y-3">
							<Link
								to="/"
								onClick={() => setIsMenuOpen(false)}
								className="text-gray-700 hover:text-[#281d80] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
							>
								Home
							</Link>

							{isLoggedIn ? (
								<>
									<Link
										to="/ask"
										onClick={() => setIsMenuOpen(false)}
										className="bg-[#281d80] text-white px-4 py-2.5 rounded-lg text-base font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg text-center"
									>
										Ask Question
									</Link>

									<Link
										to="/profile"
										onClick={() => setIsMenuOpen(false)}
										className="text-gray-700 hover:text-[#281d80] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center gap-3"
									>
										<div className="w-8 h-8 bg-[#281d80] text-white rounded-full flex items-center justify-center font-semibold">
											{userName?.charAt(0).toUpperCase()}
										</div>
										Profile
									</Link>

									<button
										onClick={() => {
											setIsMenuOpen(false);
											setShowNotifications(true);
										}}
										className="text-gray-700 hover:text-[#281d80] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center gap-3 justify-between"
									>
										<span>Notifications</span>
										{unreadCount > 0 && (
											<span className="bg-[#ed4d4e] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
												{unreadCount}
											</span>
										)}
									</button>

									<div className="text-gray-700 px-4 py-2 text-base font-medium">
										Welcome,{" "}
										<span className="text-[#281d80] font-semibold">
											{userName}
										</span>
										!
									</div>
									<button
										onClick={handleLogout}
										className="bg-[#ed4d4e] text-white px-4 py-2.5 rounded-lg text-base font-semibold hover:bg-[#d43d3e] transition-all duration-200 shadow-md hover:shadow-lg text-left"
									>
										Logout
									</button>
								</>
							) : (
								<>
									<Link
										to="/login"
										onClick={() => setIsMenuOpen(false)}
										className="text-gray-700 hover:text-[#281d80] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
									>
										Login
									</Link>
									<Link
										to="/signup"
										onClick={() => setIsMenuOpen(false)}
										className="bg-[#281d80] text-white px-4 py-2.5 rounded-lg text-base font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg text-center"
									>
										Sign Up
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Mobile Notifications Overlay */}
			{showNotifications && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
					<div className="fixed top-0 right-0 left-0 bg-white rounded-b-lg shadow-xl">
						<div className="p-4 border-b border-gray-200 flex justify-between items-center">
							<h3 className="text-lg font-semibold text-gray-900">
								Notifications
							</h3>
							<button
								onClick={() => setShowNotifications(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div className="max-h-96 overflow-y-auto">
							{mockNotifications.map((notification) => (
								<div
									key={notification.id}
									className={`p-4 border-b border-gray-100 ${
										!notification.read ? "bg-blue-50" : ""
									}`}
								>
									<p className="text-sm text-gray-800">{notification.text}</p>
									<p className="text-xs text-gray-500 mt-1">
										{notification.time}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}

export default Navbar;
