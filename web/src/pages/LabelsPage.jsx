import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import LabelBadge from "../components/LabelBadge";
import Sidebar from "../components/Sidebar";
import { useSearch } from "../contexts/SearchContext";

const TAG_DESCRIPTIONS = {
	"Launch-Module": {
		description:
			"Success means: being employable. To succeed at CYF, you must successfully deliver a team project, including a 'Demo Day' demonstration.",
		link: "https://launch.codeyourfuture.io/success/",
	},
	ITD: {
		description:
			"In the Intro to Digital course you will learn and practice GenAI, data analysis and basic programming. You will also build and deploy websites to the cloud.",
	},
	ITP: {
		description:
			"Programming with JavaScript, Python and SQL, collaborate delivering working software with tests.",
	},
	Piscine: {
		description:
			"Preparation and assessment for the Software Development Course.",
	},
	SDC: {
		description:
			"Learn the advanced programming and soft skills needed to work in software development.",
		link: "https://codeyourfuture.io/become-a-student/",
	},
	HTML: {
		description:
			"HyperText Markup Language - the standard markup language for creating web pages and web applications. HTML describes the structure of a web page semantically.",
	},
	CSS: {
		description:
			"Cascading Style Sheets - a stylesheet language used to describe the presentation of a document written in HTML. CSS controls the layout, colors, fonts, and overall visual appearance of web pages.",
	},
	JavaScript: {
		description:
			"A high-level, interpreted programming language that is one of the core technologies of the World Wide Web. JavaScript enables interactive web pages and is an essential part of web applications.",
	},
	Java: {
		description:
			"A high-level, class-based, object-oriented programming language designed to have as few implementation dependencies as possible. Java is widely used for building enterprise-scale applications.",
	},
	React: {
		description:
			"A JavaScript library for building user interfaces, particularly web applications. React allows developers to create reusable UI components and manage application state efficiently.",
	},
	Python: {
		description:
			"A high-level, interpreted programming language known for its clear syntax and readability. Python is widely used for web development, data analysis, artificial intelligence, and automation.",
	},
};

function LabelsPage() {
	const navigate = useNavigate();
	const { searchTerm, setSearchTerm } = useSearch();
	const [labels, setLabels] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchLabels = async () => {
			try {
				setLoading(true);
				setError("");
				const response = await fetch("/api/questions/labels/all");

				if (!response.ok) {
					throw new Error("Failed to fetch labels");
				}

				const data = await response.json();
				setLabels(data);
			} catch (err) {
				console.error("Error fetching labels:", err);
				setError("Failed to load tags. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchLabels();
	}, []);

	useEffect(() => {
		setSearchTerm("");
	}, [setSearchTerm]);

	const handleLabelClick = (label) => {
		navigate("/", { state: { labelId: label.id } });
	};

	const getTagDescription = (tagName) => {
		return (
			TAG_DESCRIPTIONS[tagName] || {
				description: `Browse questions and discussions related to ${tagName}. This tag helps organize content and makes it easier to find relevant information.`,
			}
		);
	};

	const filteredLabels = useMemo(() => {
		if (!searchTerm || !searchTerm.trim()) {
			return labels;
		}

		const searchLower = searchTerm.toLowerCase().trim();
		return labels.filter((label) => {
			const tagInfo = getTagDescription(label.name);
			const nameMatch = label.name.toLowerCase().includes(searchLower);
			const descriptionMatch = tagInfo.description
				.toLowerCase()
				.includes(searchLower);
			return nameMatch || descriptionMatch;
		});
	}, [labels, searchTerm]);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
				<div className="flex flex-col md:flex-row gap-4 md:gap-8">
					<Sidebar />

					<main className="flex-1 min-w-0">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 lg:p-8">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 md:mb-6">
								<div>
									<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
										{searchTerm ? `Search Results for "${searchTerm}"` : "Tags"}
									</h1>
									<p className="text-sm sm:text-base text-gray-600">
										{searchTerm
											? `Found ${filteredLabels.length} tag${filteredLabels.length === 1 ? "" : "s"} matching your search`
											: "Browse all available tags to find questions by topic"}
									</p>
								</div>
							</div>

							{loading ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#281d80] mx-auto"></div>
									<p className="text-gray-600 mt-4">Loading tags...</p>
								</div>
							) : error ? (
								<div className="text-center py-8 text-red-600">
									{error}
									<button
										onClick={() => window.location.reload()}
										className="block mx-auto mt-4 bg-[#281d80] text-white px-4 py-2 rounded hover:bg-[#1f1566] cursor-pointer"
									>
										Try Again
									</button>
								</div>
							) : labels.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									<p>No tags available yet.</p>
								</div>
							) : filteredLabels.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									<svg
										className="h-16 w-16 text-gray-300 mx-auto mb-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
									<p className="text-lg font-medium text-gray-900 mb-2">
										No tags found
									</p>
									<p className="text-gray-600">
										Try different search terms to find tags
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
									{filteredLabels.map((label) => {
										const tagInfo = getTagDescription(label.name);
										return (
											<div
												key={label.id}
												role="button"
												tabIndex={0}
												className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#281d80] focus:ring-opacity-50"
												onClick={() => handleLabelClick(label)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														handleLabelClick(label);
													}
												}}
											>
												<div className="flex items-start justify-between mb-2">
													<LabelBadge
														label={label}
														onClick={handleLabelClick}
														className="text-sm font-semibold"
													/>
												</div>
												<p className="text-sm text-gray-600 mb-3 line-clamp-3">
													{tagInfo.description}
												</p>
												{tagInfo.link && (
													<a
														href={tagInfo.link}
														target="_blank"
														rel="noopener noreferrer"
														onClick={(e) => e.stopPropagation()}
														className="text-xs text-[#281d80] hover:text-[#1f1566] hover:underline flex items-center gap-1"
													>
														Learn more
														<svg
															className="w-3 h-3"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
															/>
														</svg>
													</a>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default LabelsPage;
