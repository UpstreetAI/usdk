import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MentionRenderer: React.FC<{ content: string }> = ({ content }) => {
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
    return React.Children.map(children, (child, index) => {
      if (typeof child === 'string' && child === '@') {
        const nextChild = Array.isArray(children) ? children[index + 1] : null;
        if (React.isValidElement(nextChild) && nextChild.type === 'a') {
          const { href, children: mentionChildren } = nextChild.props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
          const mentionName = React.Children.toArray(mentionChildren)[0];
          
          return (
            <span
              key={`mention-${href}`}
              className="inline-flex items-center bg-[#e0e4ef] text-[#4751c4] font-bold rounded px-1 cursor-pointer hover:bg-slate-300"
              data-mention-id={href}
            >
              @{mentionName}
            </span>
          );
        }
        return child;
      }
      if (React.isValidElement(child) && child.type === 'a') {
        // Skip this child as it will be handled with the '@' symbol
        return null;
      }
      return child;
    });
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

export default MentionRenderer;
