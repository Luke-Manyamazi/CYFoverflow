import { useState } from "react";
import { HiOutlineLogout } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();
	const { isLoggedIn, user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate("/");
		setIsMenuOpen(false);
	};

	const userName = user?.name;

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
						{isLoggedIn ? (
							<>
								<span className="text-gray-700 px-3 lg:px-4 py-2 text-sm lg:text-base font-medium hidden lg:inline">
									Welcome,{" "}
									<span className="text-[#281d80] font-semibold">
										{userName}
									</span>
									!
								</span>
								<button
									onClick={handleLogout}
									className="p-2 rounded-lg text-[#ed4d4e] hover:bg-red-50 hover:text-[#d43d3e] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ed4d4e] focus:ring-offset-2"
									aria-label="Logout"
									title="Logout"
								>
									<HiOutlineLogout className="w-5 h-5 lg:w-6 lg:h-6" />
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
							{isLoggedIn ? (
								<>
									<div className="text-gray-700 px-4 py-2 text-base font-medium">
										Welcome,{" "}
										<span className="text-[#281d80] font-semibold">
											{userName}
										</span>
										!
									</div>
									<button
										onClick={handleLogout}
										className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#ed4d4e] hover:bg-red-50 hover:text-[#d43d3e] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ed4d4e] focus:ring-offset-2"
										aria-label="Logout"
									>
										<HiOutlineLogout className="w-5 h-5" />
										<span className="text-base font-semibold">Logout</span>
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
		</nav>
	);
}

export default Navbar;
