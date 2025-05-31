import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your content in markdown...", 
  height = 400,
  preview = 'edit',
  disabled = false 
}) => {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        placeholder={placeholder}
        data-color-mode="light"
        visibleDragBar={false}
        textareaProps={{
          disabled,
          style: {
            fontSize: 14,
            backgroundColor: disabled ? '#f1f5f9' : 'transparent',
          }
        }}
        previewOptions={{
          rehypePlugins: [],
          remarkPlugins: [],
        }}
      />
    </div>
  );
};

export default MarkdownEditor;