import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { TEMPLATES } from './templates.js';

const AskQuestionPage = () => {

  // State variables
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);



  // Template specific fields state
  const [templateFields, setTemplateFields] = useState({
    'bug-report': { browser: '', os: '' },
    'how-to': { documentationLink: '' }
  });

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
      content.includes("<em>Please provide a concise summary</em>") ||
      content.includes("<em>Describe the feature you are trying to build</em>") ||
      content.includes("<em>Provide a clear, concise summary of the bug.</em>")
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

            <form className="space-y-6" onSubmit={handleSubmit}>
            
                {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
                )}


                {/* Title Input */}
                <div>
                    <label htmlFor="questionTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                        Question Title
                    </label>
                    <input
                        id="questionTitle"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#281d80] focus:ring-2 focus:ring-[#281d80]/20 transition-all"
                        placeholder="e.g., How do I filter an array in JavaScript?"
                    />
                </div>


                    {/*TinyMCE Editor */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Details</label>
                    <div className="rounded-lg overflow-hidden border-2 border-gray-200 focus-within:border-[#281d80] focus-within:ring-2 focus-within:ring-[#281d80]/20 transition-all">
                        <Editor
                            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                            onInit={(evt, editor) => editorRef.current = editor}
                            value={content}
                            onEditorChange={handleEditorChange}
                            init={{
                                height: 400,
                                menubar: false,
                                statusbar: false,
                                plugins: 'codesample link lists',
                                toolbar: 'undo redo | blocks | bold italic | bullist numlist | link | codesample | inserttemplate',
                                content_style: `
                                body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; }
                                em { color: #888888; font-style: italic; }
                                hr { border: none; border-top: 1px dashed #ccc; margin: 10px 0; }
                                pre { background: #f4f4f5; padding: 10px; border-radius: 5px; }
                                `,
                                setup: (editor) => {
                                editor.ui.registry.addMenuButton('inserttemplate', {
                                    text: 'Choose Template',
                                    fetch: (callback) => {
                                    const items = TEMPLATES.map(template => ({
                                        type: 'menuitem',
                                        text: template.title,
                                        onAction: () => {
                                        editor.setContent(template.content);
                                        setActiveTemplate(template.id);
                                        handleEditorChange(template.content, editor);
                                        }
                                    }));
                                    callback(items);
                                    }
                                });
                                }
                            }}
                    
                        />
                    </div>
                </div>
                
                {/* Character count */}
                <div className="flex justify-end mt-2">
                    <span className={`text-xs ${charCount < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                        {charCount} characters (min 50)
                    </span>
                </div>



                {/*Template-specific fields */}
            {activeTemplate === 'bug-report' && (
              <div className="bg-blue-50 border-l-4 border-[#281d80] p-6 rounded-r-lg space-y-4 animate-fade-in-down">
                <h4 className="text-[#281d80] font-bold text-sm uppercase tracking-wide">🐛 Bug Report Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Browser Version</label>
                    <input
                      type="text"
                      placeholder="e.g., Chrome 98"
                      value={templateFields['bug-report'].browser}
                      onChange={(e) =>
                        setTemplateFields(prev => ({
                          ...prev,
                          'bug-report': { ...prev['bug-report'], browser: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#281d80]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">OS</label>
                    <input
                      type="text"
                      placeholder="e.g., Windows 11"
                      value={templateFields['bug-report'].os}
                      onChange={(e) =>
                        setTemplateFields(prev => ({
                          ...prev,
                          'bug-report': { ...prev['bug-report'], os: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#281d80]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTemplate === 'how-to' && (
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg space-y-4 animate-fade-in-down">
                <h4 className="text-green-800 font-bold text-sm uppercase tracking-wide">📘 Context</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Documentation Link</label>
                  <input
                    type="text"
                    placeholder="e.g., https://react.dev/..."
                    value={templateFields['how-to'].documentationLink}
                    onChange={(e) =>
                      setTemplateFields(prev => ({
                        ...prev,
                        'how-to': { ...prev['how-to'], documentationLink: e.target.value }
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-[#281d80] hover:bg-[#1f1566] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#281d80] transition-all shadow-md hover:shadow-lg"
            >
              Post Your Question
            </button>

            </form>

        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;
