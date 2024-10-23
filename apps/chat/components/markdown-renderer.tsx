import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MentionRenderer = ({ content }) => {
  const components = {
    p({node, children, ...props}) {
      const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = children.reduce((acc, child) => {
        console.log('child', child);
        if (typeof child === 'string') {
          let lastIndex = 0;
          const elements = [];
          let match;
    
          while ((match = mentionRegex.exec(child)) !== null) {
            console.log('match', match);
            if (match.index > lastIndex) {
              elements.push(child.slice(lastIndex, match.index));
            }
            elements.push(
              <span
                key={`mention-${match[1]}`}
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 cursor-pointer"
                data-mention-id={match[2]}
              >
                @{match[1]}
              </span>
            );
            lastIndex = mentionRegex.lastIndex;
          }
    
          if (lastIndex < child.length) {
            elements.push(child.slice(lastIndex));
          }
    
          return acc.concat(elements);
        }
        return acc.concat(child);
      }, []);
    
      return <p {...props}>{parts}</p>;
    }
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
