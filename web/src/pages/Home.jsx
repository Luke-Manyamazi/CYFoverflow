import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import { useAuth } from "../contexts/useAuth";

function Home() {
	const navigate = useNavigate();
	const { isLoggedIn, user } = useAuth();

	return (
		<>
			<Sidebar />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:ml-64">
				<div className="flex gap-6 lg:gap-8">
					{/* Main Content */}
					<main className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-6">
							<div>
								<h1 className="text-5xl font-bold text-gray-900 mb-6">
									Welcome to <span style={{ color: "#ed4d4e" }}>CYF</span>
									<span style={{ color: "#281d80" }}>overflow</span>
								</h1>
								<p className="text-xl text-gray-600 mb-4 font-medium">
									Your community Q&A platform for technical questions
								</p>
							</div>

							{isLoggedIn && user && (
								<button
									onClick={() => navigate("/ask")}
									className="bg-[#281d80] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg shrink-0"
								>
									Ask a Question
								</button>
							)}
						</div>
					</main>
				</div>
			</div>
		</>
	);
}

export default Home;
