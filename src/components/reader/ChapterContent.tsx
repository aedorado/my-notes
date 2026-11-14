'use client';

import React, { useMemo } from 'react';
import { slugify } from '@/components/MarkdownRenderer';

interface ChapterContentProps {
  content: string;
}

export function extractChapterHeadings(content: string) {
  const lines = content.split('\n');
  const headings: { id: string; title: string }[] = [];
  const seenIds = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      const rawTitle = trimmed.replace(/^##\s+/, '').trim();
      const cleanTitle = rawTitle.replace(/[*_`]/g, '');
      let baseId = slugify(cleanTitle);
      let id = baseId;
      let counter = 1;
      while (seenIds.has(id)) {
        id = `${baseId}-${counter++}`;
      }
      seenIds.add(id);
      headings.push({ id, title: cleanTitle });
    }
  }
  return headings;
}

export default function ChapterContent({ content }: ChapterContentProps) {
  const renderedSections = useMemo(() => {
    let processed = content;
    let glanceBlock: { left: string[]; right: string[] } | null = null;

    const glanceRegex = /:::glance\s*\n([\s\S]*?)\n:::(?:\s*\n|$)/;
    const glanceMatch = processed.match(glanceRegex);

    if (glanceMatch) {
      const rawGlance = glanceMatch[1];
      const leftMatch = rawGlance.match(/::::left\s*\n([\s\S]*?)\n::::/);
      const rightMatch = rawGlance.match(/::::right\s*\n([\s\S]*?)\n::::/);

      if (leftMatch && rightMatch) {
        glanceBlock = {
          left: leftMatch[1].trim().split('\n').filter(Boolean),
          right: rightMatch[1].trim().split('\n').filter(Boolean),
        };
      }
      processed = processed.replace(glanceRegex, '\n\n');
    }

    processed = processed
      .replace(/::::?(left|right|glance)\s*\n?/gi, '')
      .replace(/::::?\s*\n?/g, '');

    return { glanceBlock, remainingText: processed };
  }, [content]);

  return (
    <div className="prose">
      {/* 1. At A Glance Split Card */}
      {renderedSections.glanceBlock && (
        <div className="glance">
          {/* Left Column: In One Minute */}
          <div>
            <div className="k">In One Minute</div>
            <ul>
              {renderedSections.glanceBlock.left.map((line, idx) => {
                const lower = line.toLowerCase().trim();
                if (lower.startsWith('###') || lower.includes('in one minute') || !line.trim()) return null;
                const cleanLine = line.replace(/^[◆\-*]\s*/, '').trim();
                const boldMatch = cleanLine.match(/^\*\*([^*]+)\*\*:\s*(.*)$/);

                if (boldMatch) {
                  return (
                    <li key={idx}>
                      <strong>{boldMatch[1]}:</strong> {boldMatch[2]}
                    </li>
                  );
                }
                return <li key={idx}><InlineText text={cleanLine} /></li>;
              })}
            </ul>
          </div>

          {/* Right Column: Quick Facts */}
          <div>
            <div className="k">Quick Facts</div>
            <dl className="facts">
              {renderedSections.glanceBlock.right.map((line, idx) => {
                const lower = line.toLowerCase().trim();
                if (
                  lower.startsWith('###') ||
                  lower.includes('quick facts') ||
                  /^[|\s-:]+$/.test(line) ||
                  !line.trim()
                ) {
                  return null;
                }

                if (line.includes('|')) {
                  const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
                  if (cols.length >= 2) {
                    const label = cols[0].replace(/[*_]/g, '').trim();
                    const value = cols.slice(1).join(' | ').replace(/[*_]/g, '').trim();
                    if (label && value) {
                      return (
                        <div key={idx}>
                          <dt>{label}</dt>
                          <dd><InlineText text={value} /></dd>
                        </div>
                      );
                    }
                  }
                  return null;
                }

                const clean = line.replace(/^[*\-◆]\s*/, '').trim();
                const parts = clean.split(':');
                if (parts.length >= 2) {
                  const label = parts[0].replace(/[*_]/g, '').trim();
                  const value = parts.slice(1).join(':').replace(/[*_]/g, '').trim();
                  return (
                    <div key={idx}>
                      <dt>{label}</dt>
                      <dd><InlineText text={value} /></dd>
                    </div>
                  );
                }
                return null;
              })}
            </dl>
          </div>
        </div>
      )}

      {/* 2. Main Markdown Prose Flow */}
      <RenderMarkdownBody rawContent={renderedSections.remainingText} />
    </div>
  );
}

function RenderMarkdownBody({ rawContent }: { rawContent: string }) {
  const lines = rawContent.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inCallout = false;
  let calloutType = '';
  let calloutTitle = '';
  let calloutLines: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <p key={`p-${elements.length}`}>
            <InlineText text={text} />
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      if (listOrdered) {
        elements.push(
          <ol key={`ol-${elements.length}`}>
            {listItems.map((item, idx) => (
              <li key={idx}><InlineText text={item} /></li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`}>
            {listItems.map((item, idx) => (
              <li key={idx}><InlineText text={item} /></li>
            ))}
          </ul>
        );
      }
      listItems = [];
      listOrdered = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const [headerRow, ...bodyRows] = tableRows.filter((r) => !r.every((c) => c.match(/^[:\-\s]+$/)));
      elements.push(
        <div key={`table-${elements.length}`} className="tw">
          <table>
            {headerRow && (
              <thead>
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx}><InlineText text={cell.trim()} /></th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}><InlineText text={cell.trim()} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const flushCallout = () => {
    if (inCallout) {
      const type = calloutType.toLowerCase();
      let callClass = 'call';

      if (type.includes('case')) {
        callClass = 'call call-case';
      } else if (type.includes('caution') || type.includes('warn') || type.includes('danger')) {
        callClass = 'call call-caution';
      } else if (type.includes('remedy') || type.includes('cure')) {
        callClass = 'call call-remedy';
      } else {
        callClass = 'call call-class';
      }

      const displayTitle = calloutTitle
        ? (calloutTitle.toLowerCase() === calloutType.toLowerCase()
            ? calloutType.toUpperCase()
            : `${calloutType.toUpperCase()} — ${calloutTitle}`)
        : calloutType.toUpperCase();

      const calloutElements: React.ReactNode[] = [];
      let idx = 0;
      while (idx < calloutLines.length) {
        const raw = calloutLines[idx];
        const trimmed = raw.trim();
        if (!trimmed) {
          idx++;
          continue;
        }

        // 1. Table
        if (trimmed.startsWith('|')) {
          const tRows: string[][] = [];
          while (idx < calloutLines.length && calloutLines[idx].trim().startsWith('|')) {
            const rowTrim = calloutLines[idx].trim();
            const cells = rowTrim
              .replace(/^\|/, '')
              .replace(/\|$/, '')
              .split('|')
              .map((c) => c.trim());
            tRows.push(cells);
            idx++;
          }
          const [headerRow, ...bodyRows] = tRows.filter((r) => !r.every((c) => c.match(/^[:\-\s]+$/)));
          calloutElements.push(
            <div key={`c-tbl-${idx}`} className="tw" style={{ margin: '12px 0' }}>
              <table>
                {headerRow && (
                  <thead>
                    <tr>
                      {headerRow.map((cell, cIdx) => (
                        <th key={cIdx}><InlineText text={cell} /></th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}><InlineText text={cell} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }

        // 2. List
        const isUnordered = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isOrdered = /^\d+\.\s/.test(trimmed);
        if (isUnordered || isOrdered) {
          const items: string[] = [];
          while (
            idx < calloutLines.length &&
            (calloutLines[idx].trim().startsWith('- ') ||
              calloutLines[idx].trim().startsWith('* ') ||
              /^\d+\.\s/.test(calloutLines[idx].trim()))
          ) {
            const itemTrim = calloutLines[idx].trim();
            items.push(itemTrim.replace(/^([-*]|\d+\.)\s+/, ''));
            idx++;
          }
          if (isOrdered) {
            calloutElements.push(
              <ol key={`c-ol-${idx}`}>
                {items.map((it, itIdx) => (
                  <li key={itIdx}><InlineText text={it} /></li>
                ))}
              </ol>
            );
          } else {
            calloutElements.push(
              <ul key={`c-ul-${idx}`}>
                {items.map((it, itIdx) => (
                  <li key={itIdx}><InlineText text={it} /></li>
                ))}
              </ul>
            );
          }
          continue;
        }

        // 3. Image
        const imgM = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgM) {
          calloutElements.push(
            <figure key={`c-fig-${idx}`} style={{ margin: '14px 0', textAlign: 'center' }}>
              <img
                src={imgM[2]}
                alt={imgM[1] || 'Callout figure'}
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  margin: '0 auto',
                }}
              />
              {imgM[1] && (
                <figcaption style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '6px' }}>
                  {imgM[1]}
                </figcaption>
              )}
            </figure>
          );
          idx++;
          continue;
        }

        // 4. Paragraph
        calloutElements.push(
          <p key={`c-p-${idx}`}><InlineText text={trimmed} /></p>
        );
        idx++;
      }

      elements.push(
        <div key={`callout-${elements.length}`} className={callClass}>
          <div className="k">{displayTitle}</div>
          {calloutElements}
        </div>
      );
      inCallout = false;
      calloutType = '';
      calloutTitle = '';
      calloutLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      continue;
    }

    if (trimmed.startsWith('### ') && elements.length === 0) {
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      flushTable();
      flushCallout();

      const title = trimmed.replace(/^##\s+/, '').trim();
      const slug = slugify(title);

      elements.push(
        <h2 key={`h2-${elements.length}`} id={slug}>
          {title}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      flushTable();
      flushCallout();

      const title = trimmed.replace(/^###\s+/, '').trim();
      elements.push(
        <h3 key={`h3-${elements.length}`}>
          {title}
        </h3>
      );
      continue;
    }

    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      flushParagraph();
      flushList();
      flushTable();
      flushCallout();

      const alt = imgMatch[1];
      const src = imgMatch[2];

      elements.push(
        <figure key={`fig-${elements.length}`}>
          <img src={src} alt={alt || 'Lecture illustration'} loading="lazy" />
          {alt && <figcaption>{alt}</figcaption>}
        </figure>
      );
      continue;
    }

    const calloutStart = trimmed.match(/^>\s*\[!([A-Z0-9_\-]+)\](.*)$/);
    if (calloutStart) {
      flushParagraph();
      flushList();
      flushTable();
      flushCallout();

      inCallout = true;
      calloutType = calloutStart[1];
      calloutTitle = calloutStart[2].trim();
      continue;
    }

    if (inCallout) {
      if (trimmed.startsWith('>')) {
        calloutLines.push(trimmed.replace(/^>\s?/, ''));
        continue;
      } else if (trimmed === '') {
        calloutLines.push('');
        continue;
      } else {
        flushCallout();
      }
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph();
      flushList();
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    const isUnordered = trimmed.startsWith('- ') || trimmed.startsWith('* ');
    const isOrdered = /^\d+\.\s/.test(trimmed);

    if (isUnordered || isOrdered) {
      flushParagraph();
      flushTable();
      flushCallout();

      const text = isUnordered ? trimmed.replace(/^[-*]\s+/, '') : trimmed.replace(/^\d+\.\s+/, '');
      listItems.push(text);
      listOrdered = isOrdered;
      continue;
    } else if (listItems.length > 0) {
      flushList();
    }

    if (trimmed === '---' || trimmed === '***') {
      flushParagraph();
      flushList();
      flushTable();
      flushCallout();
      elements.push(<hr key={`hr-${elements.length}`} />);
      continue;
    }

    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();
  flushTable();
  flushCallout();

  return <>{elements}</>;
}

function InlineText({ text }: { text: string }) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const imgMatch = remaining.match(/^([\s\S]*?)!\[(.*?)\]\((.*?)\)([\s\S]*)$/);
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*([\s\S]*)$/);
    const italicMatch = remaining.match(/^([\s\S]*?)\*([^*]+)\*([\s\S]*)$/);

    if (imgMatch && (!boldMatch || imgMatch[1].length <= boldMatch[1].length) && (!italicMatch || imgMatch[1].length <= italicMatch[1].length)) {
      if (imgMatch[1]) {
        parts.push(<span key={key++}>{imgMatch[1]}</span>);
      }
      parts.push(
        <img
          key={key++}
          src={imgMatch[3]}
          alt={imgMatch[2] || 'Illustration'}
          loading="lazy"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '6px', margin: '8px auto', display: 'block' }}
        />
      );
      remaining = imgMatch[4];
    } else if (boldMatch && (!italicMatch || boldMatch[1].length <= italicMatch[1].length)) {
      if (boldMatch[1]) {
        parts.push(<span key={key++}>{boldMatch[1]}</span>);
      }
      parts.push(<strong key={key++}>{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
    } else if (italicMatch) {
      if (italicMatch[1]) {
        parts.push(<span key={key++}>{italicMatch[1]}</span>);
      }
      parts.push(<em key={key++}>{italicMatch[2]}</em>);
      remaining = italicMatch[3];
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return <>{parts}</>;
}

