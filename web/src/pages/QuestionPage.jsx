import React, { useState } from 'react';

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
        }
    return()
};

export default AskQuestionPage;
