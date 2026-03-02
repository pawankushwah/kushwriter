import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, FileText } from 'lucide-react';

export interface Paragraph {
  id: string;
  title: string;
  content: string;
  isCustom: boolean;
}

interface ParagraphManagerProps {
  isOpen: boolean;
  onClose: () => void;
  paragraphs: Paragraph[];
  onAddParagraph: (p: Omit<Paragraph, 'id' | 'isCustom'>) => void;
  onUpdateParagraph: (p: Paragraph) => void;
  onDeleteParagraph: (id: string) => void;
}

export default function ParagraphManager({ 
  isOpen, 
  onClose, 
  paragraphs,
  onAddParagraph,
  onUpdateParagraph,
  onDeleteParagraph
}: ParagraphManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
     if (!isOpen) {
        setEditingId(null);
        setIsAddingMode(false);
        setEditTitle('');
        setEditContent('');
     }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveEdit = () => {
     if (!editTitle.trim() || !editContent.trim()) return;

     if (editingId) {
        onUpdateParagraph({
           id: editingId,
           title: editTitle.trim(),
           content: editContent.trim(),
           isCustom: true
        });
     }
     setEditingId(null);
  };

  const handleAddNew = () => {
     if (!editTitle.trim() || !editContent.trim()) return;
     
     onAddParagraph({
        title: editTitle.trim(),
        content: editContent.trim()
     });
     
     setIsAddingMode(false);
     setEditTitle('');
     setEditContent('');
  };

  const startEditing = (p: Paragraph) => {
     if (!p.isCustom) return; // Cannot edit default paragraphs
     setEditingId(p.id);
     setEditTitle(p.title);
     setEditContent(p.content);
     setIsAddingMode(false);
  };

  const startAdding = () => {
     setIsAddingMode(true);
     setEditingId(null);
     setEditTitle('');
     setEditContent('');
  };

  const cancelEditOrAdd = () => {
     setEditingId(null);
     setIsAddingMode(false);
     setEditTitle('');
     setEditContent('');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 fade-in">
      <div 
         className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
         onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
         {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <FileText className="text-emerald-400" />
               Manage Your Paragraphs
            </h2>
            <button 
               onClick={onClose}
               className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
               <X size={20} />
            </button>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            
            {/* Add New Button (Only show if not already adding/editing) */}
            {!isAddingMode && !editingId && (
               <button 
                  onClick={startAdding}
                  className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all group"
               >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center mb-1">
                     <Plus size={20} />
                  </div>
                  <span className="font-semibold">Add Custom Paragraph</span>
               </button>
            )}

            {/* Edit / Add Form */}
            {(isAddingMode || editingId) && (
               <div className="bg-slate-800/40 border border-slate-700 p-5 rounded-2xl flex flex-col gap-4 shadow-lg focus-within:border-emerald-500/50 transition-colors">
                  <h3 className="font-bold text-white mb-1">
                     {isAddingMode ? 'Create New Paragraph' : 'Edit Paragraph'}
                  </h3>
                  
                  <div className="flex flex-col gap-1.5">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                     <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="e.g., Short Story Extract"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                     />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Content</label>
                     <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Paste or type your paragraph here..."
                        rows={6}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none custom-scrollbar leading-relaxed"
                     />
                     <div className="text-right text-xs text-slate-500 mt-1">
                        {editContent.length} characters • {editContent.trim().split(/\s+/).filter(w => w.length > 0).length} words
                     </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-2">
                     <button 
                        onClick={cancelEditOrAdd}
                        className="px-5 py-2.5 text-slate-400 hover:text-white font-medium hover:bg-slate-800 rounded-xl transition-colors"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={isAddingMode ? handleAddNew : handleSaveEdit}
                        disabled={!editTitle.trim() || !editContent.trim()}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                     >
                        <Save size={16} />
                        {isAddingMode ? 'Save Paragraph' : 'Update Paragraph'}
                     </button>
                  </div>
               </div>
            )}

            {/* List of Paragraphs */}
            <div className="flex flex-col gap-3 mt-2">
               {paragraphs.filter(p => p.isCustom).length > 0 && <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-1">Available Paragraphs</h3>}
               
               {paragraphs.filter(p => p.isCustom).map(para => (
                  <div 
                     key={para.id} 
                     className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border ${
                        editingId === para.id ? 'bg-slate-800/80 border-slate-600' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                     }`}
                  >
                     <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                           <h4 className="font-bold text-slate-200">{para.title}</h4>
                           {/* {!para.isCustom && (
                              <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">Default</span>
                           )} */}
                           {para.isCustom && (
                              <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">Custom</span>
                           )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                           {para.content}
                        </p>
                     </div>
                     
                     {para.isCustom && editingId !== para.id && (
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                           <button 
                              onClick={() => startEditing(para)}
                              className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800/50 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                              title="Edit"
                           >
                              <Edit2 size={16} />
                           </button>
                           <button 
                              onClick={() => {
                                 if (window.confirm('Are you sure you want to delete this paragraph?')) {
                                    onDeleteParagraph(para.id);
                                 }
                              }}
                              className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                              title="Delete"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     )}
                  </div>
               ))}
               
               {paragraphs.filter(p => p.isCustom).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                     No custom paragraphs available.
                  </div>
               )}
            </div>

         </div>
      </div>
    </div>
  );
}
