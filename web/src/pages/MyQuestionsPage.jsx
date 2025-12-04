import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/useAuth";

function MyQuestionsPage() {
	const { token, isLoggedIn } = useAuth();
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchMyQuestions = async () => {
			try {
				const response = await fetch("/api/questions/my-questions", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const data = await response.json();

				if (!response.ok) throw new Error(data.error);

				setQuestions(data);
			} catch (err) {
				setError(err.message || "Failed to load your questions.");
			} finally {
				setLoading(false);
			}
		};

		if (isLoggedIn && token) {
			fetchMyQuestions();
		} else {
			setError("You must be logged in to view your questions.");
			setLoading(false);
		}
	}, [isLoggedIn, token]);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					<Sidebar />

					<main className="flex-1">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
							<h1 className="text-2xl font-bold text-gray-900 mb-4">
								My Questions
							</h1>
							{loading && <p>Loading your questions...</p>}
							{error && <p className="text-red-500 text-sm">{error}</p>}
							{!loading && !error && questions.length === 0 && (
								<p className="text-gray-600">
									You have not posted any questions yet.
								</p>
							)}
							<div className="space-y-4 mt-6">
								{questions.map((q) => (
									<div
										key={q.id}
										className="border border-gray-200 rounded-lg p-4 hover:shadow transition"
									>
										<h2 className="text-lg font-semibold text-lg text-gray-900 mb-2">
											{q.title}
										</h2>

										<p className="text-sm text-gray-600 mt-1 line-clamp-2">
											{q.content.replace(/<[^>]+>/g, "").slice(0, 200)}...
										</p>

										<p className="text-xs text-gray-400 mt-2">
											Posted on {new Date(q.created_at).toLocaleDateString()}
										</p>
									</div>
								))}
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default MyQuestionsPage;
