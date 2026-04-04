"use client";

import { useEffect, useState, Suspense } from 'react';
import { useEditorStore } from '@/store/editorStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui-therapy/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, ArrowUp, ArrowDown, Video, Type, Image as ImageIcon, Save, Eye, Edit2, Check } from 'lucide-react';
import { CourseDiagram } from './CourseDiagram';
import { CodeBlock } from '@/components/ui/CodeBlock';

// Custom renderers for react-markdown
const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  // Fenced code blocks  (```lang ... ```)
  code({ node, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const isBlock = !props.inline;
    if (isBlock) {
      return (
        <CodeBlock
          code={String(children).replace(/\n$/, '')}
          lang={match?.[1] ?? 'text'}
        />
      );
    }
    // Inline code
    return (
      <code
        className="bg-muted text-primary font-mono text-[0.85em] px-1.5 py-0.5 rounded-md border border-border"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export function LessonEditor({ 
  initialBlocks, 
  canEdit,
  onSave
}: { 
  initialBlocks: any[], 
  canEdit: boolean,
  onSave: (blocks: any[]) => void 
}) {
  const { blocks, isEditing, setBlocks, updateBlock, addBlock, removeBlock, moveBlock, setEditMode } = useEditorStore();
  const [isClient, setIsClient] = useState(false);
  // Track which block is currently open for inline editing
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  useEffect(() => {
    setBlocks(initialBlocks?.length > 0 ? initialBlocks : [{ id: 'init', type: 'text', data: 'Start writing your lesson...' }]);
    setEditMode(false);
    setIsClient(true);
  }, [initialBlocks, setBlocks, setEditMode]);

  // When leaving edit mode, close any open block editor
  useEffect(() => {
    if (!isEditing) setEditingBlockId(null);
  }, [isEditing]);

  if (!isClient) return null;

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-6 sticky top-18 bg-card/95 py-3 px-2 z-20 backdrop-blur-md border-b border-border shadow-sm rounded-xl">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="bg-primary/10 text-primary p-1.5 rounded-md shadow-inner">📝</span> Lesson Content
        </h2>
        
        {canEdit && (
          <div className="flex gap-2 items-center">
            {/* Single toggle Edit / Preview button */}
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setEditMode(!isEditing)}
              className="gap-2 transition-all"
            >
              {isEditing ? <><Eye className="w-4 h-4" /> Preview</> : <><Edit2 className="w-4 h-4" /> Edit</>}
            </Button>
            {isEditing && (
              <Button
                onClick={() => { onSave(blocks); setEditMode(false); }}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 ml-1 shadow-md hover:scale-105 transition-transform text-white"
              >
                <Save className="w-4 h-4" /> Save
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6 min-h-100 px-6 pb-8 pt-8">
        {blocks.map((block, index) => {
          const isBlockEditing = isEditing && editingBlockId === block.id;

          return (
            <div
              key={block.id}
              className={`group relative rounded-2xl transition-all duration-200 ${
                isEditing
                  ? isBlockEditing
                    ? 'border-2 border-primary bg-card shadow-md p-6'
                    : 'border-2 border-dashed border-border hover:border-primary/50 bg-muted/60 hover:bg-card p-6'
                  : 'p-6'
              }`}
            >
              {/* Hover tooltip — visible in edit mode on hover (or always when that block is being edited) */}
              {isEditing && (
                <div className={`absolute -right-3 -top-4 bg-card shadow-lg border border-border rounded-xl flex items-center p-1 z-30 transition-all duration-150 ${isBlockEditing ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'}`}>
                  <Button
                    variant="ghost" size="icon"
                    className="w-8 h-8 rounded-lg hover:bg-muted disabled:opacity-30"
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="w-8 h-8 rounded-lg hover:bg-muted disabled:opacity-30"
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blocks.length - 1}
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    variant="ghost" size="icon"
                    className={`w-8 h-8 rounded-lg transition-colors ${isBlockEditing ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-primary/10 hover:text-primary'}`}
                    onClick={() => setEditingBlockId(isBlockEditing ? null : block.id)}
                    title={isBlockEditing ? 'Done editing' : 'Edit block'}
                  >
                    {isBlockEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    variant="ghost" size="icon"
                    className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                    onClick={() => removeBlock(block.id)}
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              )}

              {/* TEXT BLOCK */}
              {block.type === 'text' && (
                isBlockEditing ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <Type className="w-4 h-4" /> Markdown Text
                    </label>
                    <Textarea 
                      value={block.data} 
                      onChange={(e) => updateBlock(block.id, e.target.value)} 
                      className="min-h-50 font-mono text-sm bg-card shadow-inner focus:border-primary focus:ring-1 focus:ring-primary p-4 rounded-xl leading-relaxed noto-sans-arabic-oaktree"
                      placeholder="# Heading 1&#10;Type markdown content here..."
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="prose prose-lg prose-invert:dark max-w-none py-2 noto-sans-arabic-oaktree">
                    {block.data
                      ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{block.data}</ReactMarkdown>
                      : <span className="text-muted-foreground italic text-sm">Empty text block — click ✏️ to edit</span>
                    }
                  </div>
                )
              )}

              {/* VIDEO BLOCK */}
              {block.type === 'video' && (
                isBlockEditing ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                      <Video className="w-4 h-4" /> YouTube Video
                    </label>
                    <Input 
                      value={block.data} 
                      onChange={(e) => updateBlock(block.id, e.target.value)} 
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-card"
                      autoFocus
                    />
                    {block.data && (
                      <div className="aspect-video w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border-4 border-border shadow-md">
                        <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded-2xl" />}>
                          <ReactPlayer
                            src={block.data}
                            width="100%"
                            height="100%"
                            controls
                            config={{ youtube: { origin: typeof window !== 'undefined' ? window.location.origin : '' } }}
                          />
                        </Suspense>
                      </div>
                    )}
                  </div>
                ) : (
                  block.data ? (
                    <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-xl border border-border my-4 max-w-4xl mx-auto">
                      <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded-3xl" />}>
                        <ReactPlayer
                            src={block.data}
                            width="100%"
                            height="100%"
                            controls
                            config={{ youtube: { origin: typeof window !== 'undefined' ? window.location.origin : '' } }}
                          />
                      </Suspense>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 text-muted-foreground italic text-sm gap-2">
                      <Video className="w-5 h-5" /> Empty video block — click ✏️ to add a URL
                    </div>
                  )
                )
              )}

              {/* IMAGE/DIAGRAM BLOCK */}
              {block.type === 'image' && (
                isBlockEditing ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Interactive Diagram
                    </label>
                    <CourseDiagram canEdit={true} />
                  </div>
                ) : (
                  <div className="my-4">
                    <CourseDiagram canEdit={false} />
                  </div>
                )
              )}
            </div>
          );
        })}
        
        {isEditing && (
          <div className="pt-10 pb-4 flex justify-center gap-4 relative">
            <div className="absolute top-14 left-0 right-0 h-px bg-border -z-10" />
            <Button variant="outline" onClick={() => addBlock('text')} className="gap-2 font-bold rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all">
              <Type className="w-5 h-5" /> Add Text
            </Button>
            <Button variant="outline" onClick={() => addBlock('video')} className="gap-2 text-rose-700 font-bold border-2 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all">
              <Video className="w-5 h-5" /> Add Video
            </Button>
            <Button variant="outline" onClick={() => addBlock('image')} className="gap-2 text-emerald-700 font-bold border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all">
              <ImageIcon className="w-5 h-5" /> Add Diagram
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}