import React, { useState } from 'react';

const AskQuestionPage = () => {
  // State variables

  const [content, setContent] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [charCount, setCharCount] = useState(0);


  const handleEditorChange = (newContent, editor) => {
    setContent(newContent);
    setCharCount(editor.getContent({ format: 'text' }).length);

    if (activeTemplate && !newContent.includes(`data-template="${activeTemplate}"`)) {
      setActiveTemplate(null);
    }
  };

  return()
};

export default AskQuestionPage;
