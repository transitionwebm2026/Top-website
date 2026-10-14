'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import imageLoader from '@/lib/image-loader';

// Markdown written in the dashboard, with GFM tables. Raw HTML is not rendered
// (react-markdown's default), so article content can never inject scripts into
// the page. The one exception is `<br>`: a table cell can't hold a newline, so
// it is the only way to put several lines in one cell.
const BR = /^<br\s*\/?>$/i;

function rehypeLineBreaks() {
  const walk = (node) =>
    node.children?.forEach((child, i) => {
      if (child.type === 'raw' && BR.test(child.value.trim())) node.children[i] = { type: 'element', tagName: 'br', properties: {}, children: [] };
      else walk(child);
    });
  return walk;
}

const components = {
  a: ({ href = '', children }) => (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {children}
    </a>
  ),
  // The article column is at most ~700px wide: 1200px covers high-density screens.
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt }) => <img src={src && imageLoader({ src, width: 1200 })} alt={alt || ''} loading="lazy" decoding="async" />,
  // Wide tables scroll sideways on phones instead of stretching the article.
  table: ({ children }) => (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  ),
};

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeLineBreaks];

export default function ArticleBody({ markdown }) {
  return (
    <div className="prose-article">
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
        {markdown || ''}
      </ReactMarkdown>
    </div>
  );
}
