"use client";

import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col justify-center items-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading Interactive Canvas...</p>
    </div>
  ),
});

interface CourseDiagramProps {
  canEdit: boolean;
  persistenceKey?: string;
  onEditorMount?: (editor: any) => void;
}

export function CourseDiagram({ canEdit, persistenceKey, onEditorMount }: CourseDiagramProps) {
  return (
    <div className={`w-full overflow-hidden relative z-0 transition-all ${canEdit ? 'h-[500px] rounded-2xl shadow-sm border-2 border-slate-200' : 'h-[400px] pointer-events-none select-none rounded-3xl bg-slate-50'}`}>
      <Tldraw 
        hideUi={!canEdit} 
        persistenceKey={persistenceKey || "default-canvas"}
        onMount={onEditorMount}
      />
    </div>
  );
}
