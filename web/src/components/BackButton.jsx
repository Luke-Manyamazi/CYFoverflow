import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function BackButton({ className = "", text = "Back" }) {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<button
			onClick={handleBack}
			className={`flex items-center gap-2 text-gray-600 hover:text-[#281d80] transition-colors duration-200 cursor-pointer ${className}`}
		>
			<FaArrowLeft className="w-4 h-4" />
			<span className="font-medium">{text}</span>
		</button>
	);
}

export default BackButton;
