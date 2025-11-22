import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

function Home() {
	const navigate = useNavigate();
	const { isLoggedIn, user } = useAuth();

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
			<div className="text-center">
				<h1 className="text-5xl font-bold text-gray-900 mb-6">
					Welcome to <span style={{ color: "#ed4d4e" }}>CYF</span>
					<span style={{ color: "#281d80" }}>overflow</span>
				</h1>
				<p className="text-xl text-gray-600 mb-4 font-medium">
					Your community Q&A platform for technical questions
				</p>

				{isLoggedIn && user && (
					<div className="mt-8 mb-6">
						<p className="text-lg text-gray-700 mb-4">
							Welcome back,{" "}
							<span className="font-semibold text-[#281d80]">{user.name}</span>!
						</p>
						<button
							onClick={() => navigate("/ask")}
							className="bg-[#281d80] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg"
						>
							Ask a Question
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default Home;
