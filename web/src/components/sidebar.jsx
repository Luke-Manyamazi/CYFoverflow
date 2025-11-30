import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

const Sidebar = () => {
	const location = useLocation();
	const { isLoggedIn } = useAuth();

	const isActive = (path) => {
		if (path === "/" && location.pathname === "/") return true;
		// labels endpoint(Sheetal, Luke, Eyuel, Ali)
		if (path === "/" && location.pathname.startsWith("/")) return true;
		// my-questions endpoint(Sheetal, Luke, Eyuel, Ali)
		if (path === "/" && location.pathname === "/") return true;
		return false;
	};

	return (
		<div className="hidden md:block w-64 bg-white shadow-lg min-h-screen fixed left-0 top-16 md:top-20 z-10">
			<div className="p-4 space-y-2">
				<Link
					to="/"
					className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
						isActive("/")
							? "bg-[#281d80] text-white"
							: "text-gray-700 hover:bg-gray-100"
					}`}
				>
					<span className="text-lg font-semibold">🏠 Home</span>
				</Link>

				{isLoggedIn && (
					// We need the my-questions endpoint(Sheetal, Luke, Eyuel, Ali)
					<Link
						to="/"
						className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
							// it might be changed later
							isActive("/my-questions")
								? "bg-[#281d80] text-white"
								: "text-gray-700 hover:bg-gray-100"
						}`}
					>
						<span className="text-lg font-semibold">👤 My Questions</span>
					</Link>
				)}

				<Link
					// We need the labels endpoint(Sheetal, Luke, Eyuel, Ali)
					to="/"
					className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
						// it might be changed later
						isActive("/labels")
							? "bg-[#281d80] text-white"
							: "text-gray-700 hover:bg-gray-100"
					}`}
				>
					<span className="text-lg font-semibold">🏷️ Tags</span>
				</Link>
			</div>
		</div>
	);
};

export default Sidebar;
