import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

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
          rehypePlugins: [
            rehypeRaw,
            [rehypeSanitize, {
              tagNames: ['iframe', 'img', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote', 'code', 'pre', 'br'],
              attributes: {
                iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'title', 'style', 'class', 'allow', 'loading'],
                img: ['src', 'alt', 'width', 'height', 'style', 'class'],
                a: ['href', 'title', 'target', 'rel'],
                '*': ['style', 'class']
              }
            }]
          ],
          remarkPlugins: [],
        }}
      />
    </div>
  );
};

export default MarkdownEditor;