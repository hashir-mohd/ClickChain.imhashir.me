import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedStates, setCopiedStates] = React.useState<Record<number, boolean>>({});

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedStates(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [index]: false }));
      }, 2000);
    }).catch(err => console.error('Failed to copy code: ', err));
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props } : any) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          const blockIndex = node?.position?.start?.line ?? Math.random(); // Use line number or fallback

          return !inline && match ? (
            <div className="relative my-3 bg-[#282c34] rounded-lg overflow-hidden group clay-element-sm-shadow">
              <button
                onClick={() => handleCopy(codeString, blockIndex)}
                className="absolute top-2 right-2 p-1.5 bg-[var(--clay-bg-darker)] hover:bg-[var(--clay-accent-primary)] text-[var(--clay-text-light)] hover:text-white rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                aria-label={copiedStates[blockIndex] ? "Copied!" : "Copy code"}
                title={copiedStates[blockIndex] ? "Copied!" : "Copy code"}
              >
                {copiedStates[blockIndex] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                )}
              </button>
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
                customStyle={{ 
                  margin: 0, 
                  padding: '1rem', 
                  paddingTop: '2.8rem', // Adjusted for copy button visibility
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem', // text-sm
                  lineHeight: '1.25rem', // leading-relaxed for code
                }}
                codeTagProps={{ style: { fontFamily: "'Roboto Mono', monospace" } }}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={`bg-[var(--clay-bg-darker)] text-[var(--clay-accent-error-dark)] px-1.5 py-0.5 rounded-md text-xs font-mono ${className || ''}`} {...props}>
              {children}
            </code>
          );
        },
        p: ({node, ...props}: any) => <p className="my-2 leading-relaxed text-[var(--clay-text)]" {...props} />,
        ul: ({node, ...props}: any) => <ul className="list-disc list-inside my-3 pl-4 space-y-1.5 text-[var(--clay-text)]" {...props} />,
        ol: ({node, ...props}: any) => <ol className="list-decimal list-inside my-3 pl-4 space-y-1.5 text-[var(--clay-text)]" {...props} />,
        li: ({node, ...props}: any) => <li className="text-[var(--clay-text)]" {...props} />,
        a: ({node, ...props}: any) => <a className="text-[var(--clay-accent-info)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        blockquote: ({node, ...props}: any) => <blockquote className="my-3 pl-4 py-2 border-l-4 border-[var(--clay-accent-primary)] bg-[var(--clay-bg-darker)]/40 text-[var(--clay-text-light)] italic rounded-r-lg" {...props} />,
        h1: ({node, ...props}: any) => <h1 className="text-2xl font-semibold mt-4 mb-3 text-[var(--clay-text)]" {...props} />,
        h2: ({node, ...props}: any) => <h2 className="text-xl font-semibold mt-3 mb-2.5 text-[var(--clay-text)]" {...props} />,
        h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold mt-2.5 mb-2 text-[var(--clay-text)]" {...props} />,
        h4: ({node, ...props}: any) => <h4 className="text-base font-semibold mt-2 mb-1.5 text-[var(--clay-text)]" {...props} />,
        strong: ({node, ...props}: any) => <strong className="font-semibold text-[var(--clay-text)]" {...props} />,
        hr: ({node, ...props}: any) => <hr className="my-4 border-[var(--clay-bg-darker)]" {...props} />,
        table: ({node, ...props}: any) => <div className="overflow-x-auto my-3"><table className="min-w-full text-sm clay-inset-sm rounded-lg" {...props} /></div>,
        thead: ({node, ...props}: any) => <thead className="bg-[var(--clay-bg-darker)]/50 text-[var(--clay-text-light)] uppercase" {...props} />,
        th: ({node, ...props}: any) => <th className="px-4 py-2 text-left" {...props} />,
        tbody: ({node, ...props}: any) => <tbody className="divide-y divide-[var(--clay-bg-darker)]" {...props} />,
        tr: ({node, ...props}: any) => <tr className="hover:bg-[var(--clay-bg-darker)]/20" {...props} />,
        td: ({node, ...props}: any) => <td className="px-4 py-2 text-[var(--clay-text)]" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;