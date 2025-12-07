function PaginationControls({
	currentPage,
	totalPages,
	onPageChange,
	className = "",
}) {
	if (totalPages <= 1) return null;

	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push("ellipsis");
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push(1);
				pages.push("ellipsis");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div
			className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
		>
			<div className="text-sm text-gray-600">
				Page <span className="font-semibold text-gray-900">{currentPage}</span>{" "}
				of <span className="font-semibold text-gray-900">{totalPages}</span>
			</div>

			<div className="flex items-center gap-1 sm:gap-2">
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
					aria-label="Previous page"
				>
					Previous
				</button>

				<div className="flex items-center gap-1">
					{pageNumbers.map((page, index) => {
						if (page === "ellipsis") {
							return (
								<span
									key={`ellipsis-${index}`}
									className="px-2 py-2 text-sm text-gray-500"
								>
									...
								</span>
							);
						}

						return (
							<button
								key={page}
								onClick={() => onPageChange(page)}
								className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
									currentPage === page
										? "bg-[#281d80] text-white"
										: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
								}`}
								aria-label={`Go to page ${page}`}
								aria-current={currentPage === page ? "page" : undefined}
							>
								{page}
							</button>
						);
					})}
				</div>

				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
					aria-label="Next page"
				>
					Next
				</button>
			</div>
		</div>
	);
}

export default PaginationControls;
