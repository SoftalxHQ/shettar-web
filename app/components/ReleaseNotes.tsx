'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

function normalizeReleaseMarkdown(source: string): string {
  return source
    .replace(/\r\n/g, '\n')
    // GitHub notes often put a heading immediately after a list item.
    .replace(/([^\n])\n(#{1,6} )/g, '$1\n\n$2')
    .trim();
}

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  // Nested under page titles / version badges — don't use raw h1/h2.
  h1: ({ children }) => <h3>{children}</h3>,
  h2: ({ children }) => <h4>{children}</h4>,
  h3: ({ children }) => <h5>{children}</h5>,
  h4: ({ children }) => <h6>{children}</h6>,
};

type ReleaseNotesProps = {
  notes: string;
  className?: string;
};

export default function ReleaseNotes({ notes, className }: ReleaseNotesProps) {
  return (
    <div className={['release-notes', className].filter(Boolean).join(' ')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {normalizeReleaseMarkdown(notes)}
      </ReactMarkdown>
    </div>
  );
}
