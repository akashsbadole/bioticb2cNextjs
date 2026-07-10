'use client';

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  InsertFrontmatter,
  UndoRedo,
  DiffSourceToggleWrapper,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { useRef } from 'react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
}

export default function WysiwygEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '300px',
  readOnly = false,
}: WysiwygEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);

  return (
    <div
      className="wysiwyg-editor-wrapper rounded-md border border-input bg-background overflow-hidden"
      style={{ minHeight }}
    >
      <MDXEditor
        ref={editorRef}
        markdown={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        contentEditableClassName="prose prose-sm sm:prose-base max-w-none dark:prose-invert focus:outline-none min-h-[300px] px-4 py-3 text-foreground"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageAutocompleteSuggestions: [],
            imageUploadHandler: async (image) => {
              try {
                const formData = new FormData();
                formData.append('file', image);

                const token = typeof window !== 'undefined'
                  ? localStorage.getItem('admin_token')
                  : null;

                const headers: Record<string, string> = {};
                if (token) {
                  headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch('/api/upload', {
                  method: 'POST',
                  headers,
                  body: formData,
                });

                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  throw new Error(err.error || 'Upload failed');
                }

                const data = await res.json();
                return data.url;
              } catch (err) {
                throw new Error(
                  err instanceof Error ? err.message : 'Image upload failed'
                );
              }
            },
          }),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: 'JavaScript',
              jsx: 'JavaScript (JSX)',
              ts: 'TypeScript',
              tsx: 'TypeScript (TSX)',
              css: 'CSS',
              html: 'HTML',
              json: 'JSON',
              md: 'Markdown',
              txt: 'Plain Text',
              python: 'Python',
              bash: 'Bash',
              sql: 'SQL',
            },
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <div className="h-4 w-px bg-border mx-1" />
                <BoldItalicUnderlineToggles />
                <StrikeThroughSupSubToggles />
                <div className="h-4 w-px bg-border mx-1" />
                <BlockTypeSelect />
                <ListsToggle />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertCodeBlock />
                <InsertThematicBreak />
                <div className="h-4 w-px bg-border mx-1" />
                <DiffSourceToggleWrapper>
                  <></>
                </DiffSourceToggleWrapper>
              </>
            ),
          }),
        ]}
      />
      <style jsx global>{`
        .wysiwyg-editor-wrapper [class*="mdxeditor"] {
          --accentColor: rgb(5, 150, 105);
          --accentColor2: rgb(4, 120, 87);
        }
        .wysiwyg-editor-wrapper [data-testid="editor-root"] {
          min-height: ${minHeight};
        }
      `}</style>
    </div>
  );
}
