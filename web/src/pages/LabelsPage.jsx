import Sidebar from "../components/Sidebar";

function LabelsPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
				<div className="flex flex-col md:flex-row gap-4 md:gap-8">
					<Sidebar />

					<main className="flex-1 min-w-0">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 lg:p-8">
							<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
								Tags
							</h1>
							<p className="text-sm sm:text-base text-gray-600">
								Labels page - Implementation pending
							</p>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default LabelsPage;
