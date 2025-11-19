import React, { useState, useRef } from 'react';

const AskQuestionPage = () => {

  // State variables
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);

  const handleEditorChange = (newContent, editor) => {
    setContent(newContent);
    setCharCount(editor.getContent({ format: 'text' }).length);

    if (activeTemplate && !newContent.includes(`data-template="${activeTemplate}"`)) {
      setActiveTemplate(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Please enter a title for your question.');
      return;
    }

    if (content.trim().length < 50) {
      setError('Your question body is too short. Please provide more detail.');
      return;
    }

    if (
      content.includes("<em>Please provide a concise summary") ||
      content.includes("<em>Describe the feature you are trying to build") ||
      content.includes("<em>Provide a clear, concise summary of the bug.")
    ) {
      setError('Please replace the instructional text in the editor before posting.');
      return;
    }
  };

  return(
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">

          {/* Header */}
          <div className="text-center border-b border-gray-100 pb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Ask a public question</h2>
            <p className="text-sm text-gray-600">
              Be specific and imagine you're asking a question to another person.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;
