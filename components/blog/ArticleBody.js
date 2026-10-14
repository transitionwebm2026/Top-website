'use client';

import ReactMarkdown from 'react-markdown';
import imageLoader from '@/lib/image-loader';

// Markdown written in the dashboard. Raw HTML is not rendered (react-markdown's
// default), so article content can never inject scripts into the page.
const components = {
  a: ({ href = '', children }) => (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {children}
    </a>
  ),
  // The article column is at most ~700px wide: 1200px covers high-density screens.
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt }) => <img src={src && imageLoader({ src, width: 1200 })} alt={alt || ''} loading="lazy" decoding="async" />,
};

export default function ArticleBody({ markdown }) {
  return (
    <div className="prose-article">
      <ReactMarkdown components={components}>{markdown || ''}</ReactMarkdown>
    </div>
  );
}
