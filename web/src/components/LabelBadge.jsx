function LabelBadge({ label, onClick, className = "" }) {
	const handleClick = (e) => {
		e.stopPropagation();
		if (onClick) {
			onClick(label);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={`px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors cursor-pointer ${className}`}
		>
			{label.name}
		</button>
	);
}

export default LabelBadge;
