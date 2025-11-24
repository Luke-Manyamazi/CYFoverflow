// QuestionTemplates.js
export const TEMPLATES = [
	{
		id: "general-question",
		title: "General Question",
		description:
			"A standard template for most technical problems. Use this if you are unsure.",
		icon: "🧩",
		color: "bg-indigo-50 border-indigo-200 hover:border-indigo-500",
		textColor: "text-indigo-700",
		content: `
            <div data-template="general-question">
                <h3>Problem Summary</h3>
                <p class="template-placeholder" data-placeholder="Please provide a concise summary of your problem..."></p>
                <hr />
                <h3>What I've Already Tried</h3>
                <p class="template-placeholder" data-placeholder="Describe the solutions you have already attempted..."></p>
                <pre class="language-javascript"><code>// Your code here</code></pre>
            </div>
        `,
	},
	{
		id: "how-to",
		title: "How-To Question",
		description:
			"Best for when you need guidance on how to build a specific feature or use a tool.",
		icon: "🛠️",
		color: "bg-emerald-50 border-emerald-200 hover:border-emerald-500",
		textColor: "text-emerald-700",
		content: `
            <div data-template="how-to">
                <h3>What is your ultimate goal?</h3>
                <p class="template-placeholder" data-placeholder="Describe the feature you are trying to build..."></p>
                <hr />
                <h3>Where are you getting stuck?</h3>
                <p class="template-placeholder" data-placeholder="Explain the specific part of the process where you need help..."></p>
            </div>
        `,
	},
	{
		id: "bug-report",
		title: "Bug Report",
		description:
			"Found a glitch? Use this strict format to help others reproduce the issue.",
		icon: "🐛",
		color: "bg-rose-50 border-rose-200 hover:border-rose-500",
		textColor: "text-rose-700",
		content: `
            <div data-template="bug-report">
                <h3>Bug Summary</h3>
                <p class="template-placeholder" data-placeholder="Provide a clear, concise summary of the bug..."></p>
                <hr />
                <h3>Steps to Reproduce</h3>
                <ol>
                    <li class="template-placeholder" data-placeholder="Step 1..."></li>
                    <li class="template-placeholder" data-placeholder="Step 2..."></li>
                </ol>
                <h3>Expected vs Actual Behavior</h3>
                <p class="template-placeholder" data-placeholder="Description of what happened vs what you expected..."></p>
            </div>
        `,
	},
];
