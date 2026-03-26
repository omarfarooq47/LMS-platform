import { create } from 'zustand';

export type BlockType = 'text' | 'video' | 'image';

export interface Block {
  id: string;
  type: BlockType;
  data: any;
}

interface EditorState {
  blocks: Block[];
  isEditing: boolean;
  setBlocks: (blocks: Block[]) => void;
  updateBlock: (id: string, data: any) => void;
  addBlock: (type: BlockType) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  toggleEditMode: () => void;
  setEditMode: (mode: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  blocks: [],
  isEditing: false,
  setBlocks: (blocks) => set({ blocks }),
  updateBlock: (id, data) => set((state) => ({
    blocks: state.blocks.map((b) => (b.id === id ? { ...b, data } : b))
  })),
  addBlock: (type) => set((state) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      data: type === 'text' ? '' : type === 'video' ? '' : null
    };
    return { blocks: [...state.blocks, newBlock] };
  }),
  removeBlock: (id) => set((state) => ({
    blocks: state.blocks.filter((b) => b.id !== id)
  })),
  moveBlock: (id, direction) => set((state) => {
    const index = state.blocks.findIndex((b) => b.id === id);
    if (index < 0) return state;
    if (direction === 'up' && index === 0) return state;
    if (direction === 'down' && index === state.blocks.length - 1) return state;
    
    const newBlocks = [...state.blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    
    return { blocks: newBlocks };
  }),
  toggleEditMode: () => set((state) => ({ isEditing: !state.isEditing })),
  setEditMode: (mode) => set({ isEditing: mode })
}));
