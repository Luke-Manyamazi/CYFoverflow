function SearchBar({
	searchTerm = "",
	onSearch,
	placeholder = "Search questions, topics, or users..."
}) {
	const handleChange = (e) => {
		const value = e.target.value;
		// Call onSearch immediately for real-time filtering
		if (onSearch) {
			onSearch(value);
		}
	};

	return (
					<div className="flex-1 relative">
			<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
							<svg
					className="h-5 w-5 text-gray-400 transition-colors duration-200"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<input
							type="text"
							placeholder={placeholder}
				value={searchTerm || ""}
							onChange={handleChange}
				className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#281d80]/50 focus:border-[#281d80] focus:bg-white hover:border-gray-300 hover:bg-white transition-all duration-200 shadow-sm"
			/>
		</div>
	);
}

export default SearchBar;


