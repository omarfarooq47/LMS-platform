"use client";

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReactPlayerModule from 'react-player';
const ReactPlayer = ReactPlayerModule as any;
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, ArrowUp, ArrowDown, Video, Type, Image as ImageIcon, Save, Eye, Edit2 } from 'lucide-react';
import { CourseDiagram } from './CourseDiagram';

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

  useEffect(() => {
    setBlocks(initialBlocks?.length > 0 ? initialBlocks : [{ id: 'init', type: 'text', data: 'Start writing your lesson...' }]);
    setEditMode(false);
    setIsClient(true);
  }, [initialBlocks, setBlocks, setEditMode]);

  if (!isClient) return null;

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-6 sticky top-[4.5rem] bg-white/95 py-3 px-2 z-20 backdrop-blur-md border-b border-slate-100 shadow-sm rounded-xl">
        <h2 className="text-xl font-bold text-indigo-950 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md shadow-inner">📝</span> Lesson Content
        </h2>
        
        {canEdit && (
          <div className="flex gap-2">
             <Button variant={isEditing ? "outline" : "default"} onClick={() => setEditMode(false)} className={`gap-2 ${!isEditing && 'bg-indigo-900 text-white shadow-md'}`}>
               <Eye className="w-4 h-4" /> Preview
             </Button>
             <Button variant={isEditing ? "default" : "outline"} onClick={() => setEditMode(true)} className={`gap-2 ${isEditing && 'bg-indigo-900 text-white shadow-md'}`}>
               <Edit2 className="w-4 h-4" /> Edit
             </Button>
             {isEditing && (
               <Button onClick={() => onSave(blocks)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 ml-2 shadow-md hover:scale-105 transition-transform text-white">
                 <Save className="w-4 h-4" /> Save
               </Button>
             )}
          </div>
        )}
      </div>

      <div className="space-y-6 min-h-[400px]">
        {blocks.map((block, index) => (
          <div key={block.id} className={`group relative rounded-2xl transition-all duration-300 ${isEditing ? 'border-2 border-dashed border-slate-300 p-6 bg-slate-50 hover:border-indigo-400 hover:bg-white' : ''}`}>
             
             {isEditing && (
               <div className="absolute -right-4 -top-4 bg-white shadow-lg border border-slate-200 rounded-xl flex items-center p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-30 transform group-hover:scale-100 scale-95">
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-100" onClick={() => moveBlock(block.id, 'up')} disabled={index === 0}>
                   <ArrowUp className="w-4 h-4 text-slate-600" />
                 </Button>
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-100" onClick={() => moveBlock(block.id, 'down')} disabled={index === blocks.length - 1}>
                   <ArrowDown className="w-4 h-4 text-slate-600" />
                 </Button>
                 <div className="w-px h-6 bg-slate-200 mx-1"></div>
                 <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-red-100 hover:text-red-600" onClick={() => removeBlock(block.id)}>
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </div>
             )}

             {/* TEXT BLOCK */}
             {block.type === 'text' && (
               isEditing ? (
                 <div className="space-y-3">
                   <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
                     <Type className="w-4 h-4" /> Markdown Text
                   </label>
                   <Textarea 
                     value={block.data} 
                     onChange={(e) => updateBlock(block.id, e.target.value)} 
                     className="min-h-[200px] font-mono text-sm bg-white shadow-inner border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 p-4 rounded-xl leading-relaxed"
                     placeholder="# Heading 1&#10;Type markdown content here..."
                   />
                 </div>
               ) : (
                 <div className="prose prose-lg prose-indigo max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-2xl prose-img:shadow-md">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.data}</ReactMarkdown>
                 </div>
               )
             )}

             {/* VIDEO BLOCK */}
             {block.type === 'video' && (
               isEditing ? (
                 <div className="space-y-3">
                   <label className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                     <Video className="w-4 h-4" /> YouTube Video
                   </label>
                   <Input 
                     value={block.data} 
                     onChange={(e) => updateBlock(block.id, e.target.value)} 
                     placeholder="https://www.youtube.com/watch?v=..."
                     className="bg-white"
                   />
                   {block.data && (
                     <div className="aspect-video w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border-4 border-slate-100 shadow-md">
                       <ReactPlayer url={block.data} width="100%" height="100%" controls />
                     </div>
                   )}
                 </div>
               ) : (
                 block.data && (
                   <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-xl border border-slate-100 my-10 max-w-4xl mx-auto">
                     <ReactPlayer url={block.data} width="100%" height="100%" controls />
                   </div>
                 )
               )
             )}

             {/* IMAGE/DIAGRAM BLOCK */}
             {block.type === 'image' && (
                isEditing ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                       <ImageIcon className="w-4 h-4" /> Interactive Diagram
                    </label>
                    <CourseDiagram canEdit={true} />
                  </div>
                ) : (
                  <div className="my-10">
                     <CourseDiagram canEdit={false} />
                  </div>
                )
             )}
          </div>
        ))}
        
        {isEditing && (
          <div className="pt-10 pb-4 flex justify-center gap-4 relative">
            <div className="absolute top-14 left-0 right-0 h-px bg-slate-200 -z-10"></div>
            <Button variant="outline" onClick={() => addBlock('text')} className="gap-2 bg-white text-indigo-700 font-bold border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all">
              <Type className="w-5 h-5" /> Add Text
            </Button>
            <Button variant="outline" onClick={() => addBlock('video')} className="gap-2 bg-white text-rose-700 font-bold border-2 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all">
              <Video className="w-5 h-5" /> Add Video
            </Button>
            <Button variant="outline" onClick={() => addBlock('image')} className="gap-2 bg-white text-emerald-700 font-bold border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all">
              <ImageIcon className="w-5 h-5" /> Add Diagram
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
