import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const components = {
    p: ({ children }: { children: React.ReactNode }) => {
      return <p>{renderMentions(children)}</p>;
    },
  };

  /*
    The renderMentions method parses mentions in the “@Name” format from react-mentions.
    Combining the ‘@’ symbol and subsequent anchor element into a single, styled span for compatibility with react-markdown.
  */
    const renderMentions = (children: React.ReactNode): React.ReactNode => {
      return React.Children.toArray(children).reduce((acc: React.ReactNode[], child, index, array) => {
        if (typeof child === 'string') {
          const parts = child.split('@');
          parts.forEach((part, partIndex) => {
            if (partIndex > 0) {
              const nextChild = array[index + 1];
              if (React.isValidElement(nextChild) && nextChild.type === 'a') {
                const { href, children: mentionChildren } = nextChild.props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
                const mentionName = React.Children.toArray(mentionChildren)[0];
                
                acc.push(
                  <span
                    key={`mention-${href}-${index}-${partIndex}`}
                    className="inline-flex items-center bg-[#e0e4ef] text-[#4751c4] font-bold rounded px-1 cursor-pointer hover:bg-slate-300"
                    data-mention-id={href}
                  >
                    @{mentionName}
                  </span>
                );
                array[index + 1] = <React.Fragment />; // Mark the next child as processed
              } else {
                acc.push('@' + part);
              }
            } else if (part) {
              acc.push(part);
            }
          });
        } else if (child !== null) {
          acc.push(child);
        }
        return acc;
      }, []);
    };    

  return (
    <ReactMarkdown
      className="chat-markdown"
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
