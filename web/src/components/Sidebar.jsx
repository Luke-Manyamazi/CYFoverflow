import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

function Sidebar() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoggedIn } = useAuth();

	const handleNavigation = (path) => {
		navigate(path);
	};

	const isActive = (path) => {
		return location.pathname === path;
	};

	return (
		<aside className="sidebar-responsive md:w-64 flex-shrink-0">
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
				<nav>
					<ul className="space-y-1 md:space-y-2">
						<li>
							<button
								onClick={() => handleNavigation("/")}
								className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors flex items-center gap-2 md:gap-3 cursor-pointer text-sm md:text-base ${
									isActive("/")
										? "bg-blue-50 text-blue-700 font-semibold"
										: "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
								}`}
							>
								<span>📋</span>
								<span className="font-medium">Home</span>
							</button>
						</li>
						<li>
							<button
								onClick={() => handleNavigation("/labels")}
								className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors flex items-center gap-2 md:gap-3 cursor-pointer text-sm md:text-base ${
									isActive("/labels")
										? "bg-blue-50 text-blue-700 font-semibold"
										: "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
								}`}
							>
								<span>🏷️</span>
								<span className="font-medium">Tags</span>
							</button>
						</li>

						{isLoggedIn && (
							<>
								<li className="border-t border-gray-200 mt-3 md:mt-4 pt-3 md:pt-4">
									<h3 className="px-3 md:px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
										Personal
									</h3>
								</li>
								<li>
									<button
										onClick={() => handleNavigation("/my-questions")}
										className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors flex items-center gap-2 md:gap-3 cursor-pointer text-sm md:text-base ${
											isActive("/my-questions")
												? "bg-blue-50 text-blue-700 font-semibold"
												: "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
										}`}
									>
										<span>❓</span>
										<span className="font-medium">My Questions</span>
									</button>
								</li>
								<li>
									<button
										onClick={() => handleNavigation("/my-responses")}
										className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors flex items-center gap-2 md:gap-3 cursor-pointer text-sm md:text-base ${
											isActive("/my-responses")
												? "bg-blue-50 text-blue-700 font-semibold"
												: "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
										}`}
									>
										<span>💬</span>
										<span className="font-medium">My Responses</span>
									</button>
								</li>
							</>
						)}
					</ul>
				</nav>
			</div>
		</aside>
	);
}

export default Sidebar;
