/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const LabelFilterContext = createContext();

export function LabelFilterProvider({ children }) {
	const [selectedLabel, setSelectedLabel] = useState(null);

	return (
		<LabelFilterContext.Provider value={{ selectedLabel, setSelectedLabel }}>
			{children}
		</LabelFilterContext.Provider>
	);
}

export function useLabelFilter() {
	const context = useContext(LabelFilterContext);
	if (!context) {
		// Return default values if context is not available (for pages that don't use it)
		return { selectedLabel: null, setSelectedLabel: () => {} };
	}
	return context;
}
