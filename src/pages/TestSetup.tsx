import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Clock, Play, FileText, Settings, Type, Search, Plus } from 'lucide-react';
import ParagraphManager from '../components/ParagraphManager';
import type { Paragraph } from '../components/ParagraphManager';

const durations = [
   { value: 1, label: '1 Min' },
   { value: 3, label: '3 Min' },
   { value: 5, label: '5 Min' },
   { value: 10, label: '10 Min' },
   { value: 15, label: '15 Min' },
   { value: 30, label: '30 Min' },
   { value: 'custom', label: 'Custom' }
];

import { getParagraphsByLanguage } from '../data/paragraphs';

export default function TestSetup() {
   const navigate = useNavigate();
   const location = useLocation();

   // E.g. 'english', 'hindi-inscript', 'hindi-remington'
   const testLanguage = location.state?.language || 'english';
   const defaultParagraphsForLang = getParagraphsByLanguage(testLanguage);

   const [selectedDuration, setSelectedDuration] = useState<number | 'custom'>(1);
   const [showCustom, setShowCustom] = useState(false);
   const [customDurationInput, setCustomDurationInput] = useState<string>('5');
   const [searchQuery, setSearchQuery] = useState('');

   // Paragraph Management State
   const [paragraphs, setParagraphs] = useState<Paragraph[]>(() => {
      // 1. Get saved custom paragraphs spanning all languages
      const saved = localStorage.getItem('kushwriter_paragraphs');
      let customParagraphs: Paragraph[] = [];
      if (saved) {
         try {
            customParagraphs = JSON.parse(saved).filter((p: Paragraph) => p.isCustom);
         } catch (e) {
            console.error("Failed to parse saved paragraphs", e);
         }
      }

      // 2. Merge language-specific defaults with global custom paragraphs
      return [...defaultParagraphsForLang, ...customParagraphs];
   });

   const filteredParagraphs = paragraphs.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const [selectedParagraphId, setSelectedParagraphId] = useState<string>(paragraphs[0]?.id || '');
   const [isManagerOpen, setIsManagerOpen] = useState(false);

   // Save to local storage whenever paragraphs change
   useEffect(() => {
      localStorage.setItem('kushwriter_paragraphs', JSON.stringify(paragraphs));
      // Ensure selected ID is valid
      if (!paragraphs.find(p => p.id === selectedParagraphId) && paragraphs.length > 0) {
         setSelectedParagraphId(paragraphs[0].id);
      }
   }, [paragraphs]);

   const handleAddParagraph = (p: Omit<Paragraph, 'id' | 'isCustom'>) => {
      const newParagraph: Paragraph = {
         ...p,
         id: `custom-${Date.now()}`,
         isCustom: true
      };
      setParagraphs(prev => [...prev, newParagraph]);
      setSelectedParagraphId(newParagraph.id); // Auto-select newly added
   };

   const handleUpdateParagraph = (updated: Paragraph) => {
      setParagraphs(prev => prev.map(p => p.id === updated.id ? updated : p));
   };

   const handleDeleteParagraph = (id: string) => {
      setParagraphs(prev => prev.filter(p => p.id !== id));
   };

   const handleStartTest = () => {
      let finalDuration = selectedDuration;
      if (selectedDuration === 'custom') {
         const parsed = parseInt(customDurationInput);
         if (isNaN(parsed) || parsed <= 0) {
            alert("Please enter a valid custom duration in minutes.");
            return;
         }
         finalDuration = parsed;
      }

      navigate('/test/run', {
         state: {
            duration: finalDuration,
            paragraphId: selectedDuration === 'custom' ? selectedParagraphId : null,
            language: testLanguage
         }
      });
   };

   return (
      <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto fade-in pb-12">
         <div className="flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
               <ChevronLeft size={20} />
               <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
               Setup Typing Test
            </h1>
         </div>

         <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 flex flex-col gap-8 shadow-xl">

            {/* Duration Selection */}
            <div>
               <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="text-blue-400" size={20} />
                  Select Test Duration
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-6">
                  {durations.map((duration) => typeof duration.value === "number" ? (
                     <button
                        key={duration.value}
                        onClick={() => setSelectedDuration(duration.value as number)}
                        className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 border ${selectedDuration === duration.value
                           ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                           : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                           }`}
                     >
                        {duration.label}
                     </button>
                  ) : (
                     <div key={duration.value} className={`flex items-center py-3 px-4 rounded-xl font-medium transition-all duration-200 border ${selectedDuration === 'custom'
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                              : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                              }`}>
                        <input
                           type="number"
                           min="1"
                           max="1440"
                           value={selectedDuration === 'custom' ? customDurationInput : ''}
                           onChange={(e) => {
                              setSelectedDuration('custom');
                              setCustomDurationInput(e.target.value);
                           }}
                           onClick={() => setSelectedDuration('custom')}
                           className="w-full outline-none"
                           placeholder="Custom"
                        />
                     </div>
                  ))}
               </div>

               <div className="flex justify-center mt-2">
                  <button
                     onClick={() => setShowCustom(!showCustom)}
                     className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${showCustom
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-white'
                        }`}
                  >
                     <Settings size={16} className={showCustom ? "text-purple-400 animate-spin-slow" : ""} />
                     {showCustom ? 'Hide Advanced Mode' : 'Advanced Mode'}
                  </button>
               </div>
            </div>

            {/* Custom Settings (Only visible if 'custom' is selected) */}
            {showCustom && (
               <div className="fade-in pt-4 border-t border-slate-700/50 flex flex-col gap-6">

                  {/* Paragraph Selection */}
                  <div>
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                           <h2 className="text-lg font-bold text-white flex items-center gap-2">
                              <FileText className="text-blue-400" size={20} />
                              Select Paragraph
                           </h2>
                           <span className="text-xs text-slate-400 tracking-wider uppercase font-semibold">Language: {testLanguage.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                           <button
                              onClick={() => setIsManagerOpen(true)}
                              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-slate-800/60 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700/50 shrink-0"
                              title="Manage Paragraphs"
                           >
                              <Plus size={16} />
                           </button>
                           <div className="relative flex-1 sm:w-64">
                              <input
                                 type="text"
                                 placeholder="Search paragraphs..."
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                              />
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                           </div>
                        </div>
                     </div>


                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredParagraphs.length === 0 ? (
                           <div className="col-span-1 md:col-span-2 text-center py-8 text-slate-500">
                              No paragraphs found matching "{searchQuery}"
                           </div>
                        ) : (
                           filteredParagraphs.map((para) => (
                              <div
                                 key={para.id}
                                 onClick={() => setSelectedParagraphId(para.id)}
                                 className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedParagraphId === para.id
                                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10'
                                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                                    }`}
                              >
                                 <div className="flex items-center justify-between mb-2">
                                    <h3 className={`font-bold ${selectedParagraphId === para.id ? 'text-emerald-400' : 'text-slate-200'}`}>
                                       {para.title}
                                    </h3>
                                    {para.isCustom && (
                                       <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">Custom</span>
                                    )}
                                 </div>
                                 <p className="text-sm text-slate-400 line-clamp-2">
                                    {para.content}
                                 </p>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>
            )}

            {/* Start Action */}
            <div className="pt-6 border-t border-slate-700/50 flex justify-center mt-4">
               <button
                  onClick={handleStartTest}
                  className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-1"
               >
                  <Type size={24} />
                  Start Typing Test
               </button>
            </div>


         </div>

         {/* Paragraph Manager Modal */}
         <ParagraphManager
            isOpen={isManagerOpen}
            onClose={() => setIsManagerOpen(false)}
            paragraphs={paragraphs}
            onAddParagraph={handleAddParagraph}
            onUpdateParagraph={handleUpdateParagraph}
            onDeleteParagraph={handleDeleteParagraph}
         />
      </div>
   );
}
