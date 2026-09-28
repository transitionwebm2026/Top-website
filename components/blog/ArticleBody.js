'use client';

import ReactMarkdown from 'react-markdown';

// Markdown written in the dashboard. Raw HTML is not rendered (react-markdown's
// default), so article content can never inject scripts into the page.
const components = {
  a: ({ href = '', children }) => (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {children}
    </a>
  ),
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt }) => <img src={src} alt={alt || ''} loading="lazy" />,
};

export default function ArticleBody({ markdown }) {
  return (
    <div className="prose-article">
      <ReactMarkdown components={components}>{markdown || ''}</ReactMarkdown>
    </div>
  );
}
