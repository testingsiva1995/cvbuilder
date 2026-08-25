'use client';
import React, { useRef, useEffect, useCallback, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, title, active, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
  id,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const savedSelection = useRef<Range | null>(null);

  // Convert plain text / HTML to editor content
  const htmlToDisplay = useCallback((html: string) => {
    // If it's plain text (no HTML tags), convert newlines to <br>
    if (!/<[a-z][\s\S]*>/i.test(html)) {
      return html.replace(/\n/g, '<br>');
    }
    return html;
  }, []);

  // Convert editor HTML back to storable format
  const getCleanHtml = useCallback((el: HTMLDivElement) => {
    return el.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/<div>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .trim();
  }, []);

  // Sync external value → editor (only when not focused to avoid cursor jump)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalChange.current) return;
    const newHtml = htmlToDisplay(value);
    if (el.innerHTML !== newHtml) {
      el.innerHTML = newHtml;
    }
  }, [value, htmlToDisplay]);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    setActiveFormats(formats);
  }, []);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    onChange(el.innerHTML);
    setTimeout(() => { isInternalChange.current = false; }, 0);
    updateActiveFormats();
  }, [onChange, updateActiveFormats]);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateActiveFormats();
    handleInput();
  }, [handleInput, updateActiveFormats]);

  const handleHeading = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const parentBlock = range.commonAncestorContainer.parentElement?.closest('h3, p, div');
    if (parentBlock?.tagName === 'H3') {
      document.execCommand('formatBlock', false, 'p');
    } else {
      document.execCommand('formatBlock', false, 'h3');
    }
    updateActiveFormats();
    handleInput();
  }, [handleInput, updateActiveFormats]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelection.current);
    }
  }, []);

  const handleInsertLink = useCallback(() => {
    saveSelection();
    setShowLinkInput(true);
  }, [saveSelection]);

  const applyLink = useCallback(() => {
    if (!linkUrl) return;
    restoreSelection();
    editorRef.current?.focus();
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    document.execCommand('createLink', false, url);
    setShowLinkInput(false);
    setLinkUrl('');
    handleInput();
  }, [linkUrl, restoreSelection, handleInput]);

  const handleClearFormatting = useCallback(() => {
    execCommand('removeFormat');
    execCommand('formatBlock', 'p');
  }, [execCommand]);

  const minHeight = `${rows * 1.6}rem`;

  return (
    <div className={`flex flex-col rounded-xl border border-border overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/40 border-b border-border flex-wrap">
        <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" active={activeFormats.has('bold')}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" active={activeFormats.has('italic')}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" active={activeFormats.has('underline')}>
          <span className="underline">U</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={handleHeading} title="Heading">
          <span className="text-[10px] font-black">H</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet list">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="2" cy="4" r="1.2" fill="currentColor"/>
            <rect x="5" y="3.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
            <circle cx="2" cy="8" r="1.2" fill="currentColor"/>
            <rect x="5" y="7.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
            <circle cx="2" cy="12" r="1.2" fill="currentColor"/>
            <rect x="5" y="11.2" width="6" height="1.6" rx="0.8" fill="currentColor"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered list">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <text x="0.5" y="5" fontSize="5" fill="currentColor" fontWeight="700">1.</text>
            <rect x="5" y="3.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
            <text x="0.5" y="9.5" fontSize="5" fill="currentColor" fontWeight="700">2.</text>
            <rect x="5" y="7.2" width="8" height="1.6" rx="0.8" fill="currentColor"/>
            <text x="0.5" y="14" fontSize="5" fill="currentColor" fontWeight="700">3.</text>
            <rect x="5" y="11.2" width="6" height="1.6" rx="0.8" fill="currentColor"/>
          </svg>
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={handleInsertLink} title="Insert/Edit link">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.5 8.5L8.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M6.5 5.5L8 4a2.121 2.121 0 013 3L9.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 8.5L6 10a2.121 2.121 0 01-3-3L4.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 5.5H8a3 3 0 010 6H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.5 3L2 5.5 4.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('redo')} title="Redo (Ctrl+Y)">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M11 5.5H5a3 3 0 000 6h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 3L11 5.5 8.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={handleClearFormatting} title="Clear formatting">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M3 3h7M5.5 3l-1 7M7.5 3l1 7M2 10l9-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </ToolbarButton>
      </div>

      {/* Link input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/5 border-b border-border">
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl(''); } }}
            placeholder="https://example.com"
            className="flex-1 text-xs px-2 py-1 rounded border border-border bg-background outline-none focus:border-primary"
            autoFocus
          />
          <button type="button" onClick={applyLink} className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded font-semibold">OK</button>
          <button type="button" onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} className="text-xs px-2 py-1 rounded border border-border">✕</button>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={editorRef}
        id={id}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        className="px-3 py-2.5 text-sm text-foreground outline-none leading-relaxed overflow-y-auto rich-editor-content"
        style={{ minHeight }}
      />

      <style>{`
        .rich-editor-content:empty:before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          pointer-events: none;
        }
        .rich-editor-content h3 {
          font-size: 0.85em;
          font-weight: 700;
          margin: 0.3em 0 0.1em;
        }
        .rich-editor-content ul {
          list-style: disc;
          padding-left: 1.2em;
          margin: 0.2em 0;
        }
        .rich-editor-content ol {
          list-style: decimal;
          padding-left: 1.2em;
          margin: 0.2em 0;
        }
        .rich-editor-content a {
          color: var(--primary);
          text-decoration: underline;
        }
        .rich-editor-content p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
