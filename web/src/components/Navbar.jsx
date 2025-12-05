import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useLabelFilter } from "../contexts/LabelFilterContext";
import { useSearch } from "../contexts/SearchContext";
import { useAuth } from "../contexts/useAuth";

import SearchBar from "./SearchBar";

function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoggedIn, user, logout } = useAuth();
	const { searchTerm, setSearchTerm } = useSearch();
	const { selectedLabel } = useLabelFilter();

	const shouldShowSearch = () => {
		const path = location.pathname;
		return (
			path === "/" ||
			path === "/questions" ||
			path === "/labels" ||
			path === "/my-questions"
		);
	};

	const handleLogout = () => {
		logout();
		navigate("/");
		setIsMenuOpen(false);
	};

	const userName = user?.name;

	return (
		<nav className="bg-white shadow-lg border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16 md:h-20 gap-4">
					<Link
						to="/"
						className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0 cursor-pointer"
					>
						<span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
							<span style={{ color: "#ed4d4e" }}>CYF</span>
							<span style={{ color: "#281d80" }}>overflow</span>
						</span>
					</Link>

					{shouldShowSearch() && (
						<div className="hidden md:flex flex-1 max-w-2xl mx-4">
							<SearchBar
								searchTerm={searchTerm}
								onSearch={setSearchTerm}
								selectedLabel={selectedLabel}
							/>
						</div>
					)}

					<div className="hidden md:flex items-center gap-4 lg:gap-6">
						{isLoggedIn ? (
							<>
								<div className="w-10 h-10 bg-[#281d80] text-white rounded-full flex items-center justify-center font-semibold">
									{userName?.charAt(0).toUpperCase()}
								</div>

								<button
									onClick={handleLogout}
									className="group relative bg-[#ed4d4e] text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:bg-[#d43d3e] cursor-pointer"
									aria-label="Logout"
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
										/>
									</svg>
									<span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
										Logout
										<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></span>
									</span>
								</button>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="text-gray-700 hover:text-[#281d80] px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold transition-colors duration-200 cursor-pointer"
								>
									Login
								</Link>
								<Link
									to="/signup"
									className="bg-[#281d80] text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
								>
									Sign Up
								</Link>
							</>
						)}
					</div>

					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
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

				{isMenuOpen && (
					<div className="md:hidden py-4 border-t border-gray-200">
						<div className="flex flex-col space-y-3">
							{shouldShowSearch() && (
								<div className="px-4">
									<SearchBar
										searchTerm={searchTerm}
										onSearch={setSearchTerm}
										selectedLabel={selectedLabel}
									/>
								</div>
							)}

							{isLoggedIn ? (
								<>
									<div className="px-4 py-2 flex items-center gap-3">
										<div className="w-10 h-10 bg-[#281d80] text-white rounded-full flex items-center justify-center font-semibold">
											{userName?.charAt(0).toUpperCase()}
										</div>
									</div>

									<div className="text-gray-700 px-4 py-2 text-base font-medium">
										Welcome,{" "}
										<span className="text-[#281d80] font-semibold">
											{userName}
										</span>
										!
									</div>
									<button
										onClick={handleLogout}
										className="bg-[#ed4d4e] text-white px-4 py-2.5 rounded-lg text-base font-semibold hover:bg-[#d43d3e] transition-all duration-200 shadow-md hover:shadow-lg text-left flex items-center gap-2 cursor-pointer"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
											/>
										</svg>
										Logout
									</button>
								</>
							) : (
								<>
									<Link
										to="/login"
										onClick={() => setIsMenuOpen(false)}
										className="text-gray-700 hover:text-[#281d80] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200 cursor-pointer"
									>
										Login
									</Link>
									<Link
										to="/signup"
										onClick={() => setIsMenuOpen(false)}
										className="bg-[#281d80] text-white px-4 py-2.5 rounded-lg text-base font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg text-center cursor-pointer"
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
