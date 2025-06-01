import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { getYouTubeIframeProps, isYouTubeUrl } from '@/utils/youtube';

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
                iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'title', 'style', 'class', 'allow', 'loading', 'referrerpolicy'],
                img: ['src', 'alt', 'width', 'height', 'style', 'class'],
                a: ['href', 'title', 'target', 'rel'],
                '*': ['style', 'class']
              }
            }]
          ],
          remarkPlugins: [],
          components: {
            iframe: ({ node, ...props }) => {
              const enhancedProps = isYouTubeUrl(props.src) 
                ? getYouTubeIframeProps(props)
                : props;
              
              return (
                <div style={{ position: 'relative', width: '100%', margin: '1rem 0' }}>
                  <iframe 
                    {...enhancedProps} 
                    style={{
                      width: '100%',
                      minHeight: '315px',
                      aspectRatio: isYouTubeUrl(props.src) ? '16/9' : 'auto',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </div>
              );
            }
          }
        }}
      />
    </div>
  );
};

export default MarkdownEditor;