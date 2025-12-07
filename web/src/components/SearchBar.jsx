function SearchBar({
	searchTerm = "",
	onSearch,
	placeholder = "Search questions and tags...",
	selectedLabel = null,
}) {
	const handleChange = (e) => {
		const value = e.target.value;
		if (onSearch) {
			onSearch(value);
		}
	};

	const handleClear = () => {
		if (onSearch) {
			onSearch("");
		}
	};

	const dynamicPlaceholder = selectedLabel
		? `Search within "${selectedLabel.name}"...`
		: placeholder;

	const hasValue = searchTerm && searchTerm.trim().length > 0;

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
				placeholder={dynamicPlaceholder}
				value={searchTerm || ""}
				onChange={handleChange}
				className={`block w-full pl-11 ${hasValue ? "pr-10" : "pr-4"} py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#281d80]/50 focus:border-[#281d80] focus:bg-white hover:border-gray-300 hover:bg-white transition-all duration-200 shadow-sm`}
			/>
			{hasValue && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
					aria-label="Clear search"
				>
					<svg
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			)}
		</div>
	);
}

export default SearchBar;
