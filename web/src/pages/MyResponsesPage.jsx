import Sidebar from "../components/sidebar";

function MyResponsesPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					<Sidebar />

					<main className="flex-1">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
							<h1 className="text-2xl font-bold text-gray-900 mb-4">My Responses</h1>
							<p className="text-gray-600">My Responses page - Implementation pending</p>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default MyResponsesPage;

