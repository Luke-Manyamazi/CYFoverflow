// QuestionTemplates.js
export const TEMPLATES = [
    {
        id: 'general-question',
        title: 'General Question',
        description: 'A standard template for most technical problems.',
        content: `
            <div data-template="general-question">
                <h3>Problem Summary</h3>
                <p><em>Please provide a concise summary of your problem. The more specific you are, the better.</em></p>
                <hr />
                <h3>What I've Already Tried</h3>
                <p><em>Describe the solutions you have already attempted.</em></p>
                <pre class="language-javascript"><code>// Your code here</code></pre>
            </div>
        `
    },
    {
        id: 'how-to',
        title: 'How-To Question',
        description: 'For when you need guidance on accomplishing a task.',
        content: `
            <div data-template="how-to">
                <h3>What is your ultimate goal?</h3>
                <p><em>Describe the feature you are trying to build.</em></p>
                <hr />
                <h3>Where are you getting stuck?</h3>
                <p><em>Explain the specific part of the process where you need help.</em></p>
            </div>
        `
    },
    {
        id: 'bug-report',
        title: 'Bug Report',
        description: 'A structured report for reproducible bugs.',
        content: `
            <div data-template="bug-report">
                <h3>Bug Summary</h3>
                <p><em>Provide a clear, concise summary of the bug.</em></p>
                <hr />
                <h3>Steps to Reproduce</h3>
                <ol><li><em>...</em></li></ol>
                <h3>Expected vs Actual Behavior</h3>
                <p><em>Description...</em></p>
            </div>
        `
    }
];