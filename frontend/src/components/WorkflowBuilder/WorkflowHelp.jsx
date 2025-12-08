import React from 'react';
import { motion } from 'framer-motion';
import { X, Play, Zap, Layout, Calendar, List, MousePointer2, GitFork, Clipboard, Sparkles, FolderOpen, Save } from 'lucide-react';

const WorkflowHelp = ({ onClose }) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
    >
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-stone-900 border border-white/10 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-transparent">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Workflow Master Class</h2>
                    <p className="text-gray-400">Master the art of automated construction logic.</p>
                </div>
                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    {/* Section 1: The Basics */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><MousePointer2 size={24} /></div>
                            <h3 className="text-xl font-bold text-white">Core Interactions</h3>
                        </div>
                        <HelpCard 
                            title="Adding Nodes"
                            desc="Drag items from the sidebar OR drag a connection line from an existing node onto the empty canvas to quick-add."
                        />
                        <HelpCard 
                            title="Connecting Logic"
                            desc="Drag from the 'handle' (dot) of one node to another. This defines the flow of execution."
                        />
                        <HelpCard 
                            title="Context Menu"
                            desc="Right-click anywhere on the canvas to open a quick menu for adding standard nodes instantly."
                        />
                    </div>

                    {/* Section 2: Node Types */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><GitFork size={24} /></div>
                            <h3 className="text-xl font-bold text-white">Intelligent Nodes</h3>
                        </div>
                        <HelpCard 
                            title="Task / Action"
                            desc="Standard step. Can be assigned to staff, given a duration, and marked as mandatory."
                            icon={Clipboard}
                        />
                        <HelpCard 
                            title="Decision Logic"
                            desc="Branches the flow. Has 'Yes' and 'No' outputs. Configure the question in the side panel."
                            icon={GitFork}
                        />
                        <HelpCard 
                            title="Milestone"
                            desc="A checkpoint. Useful for invoicing triggers or client notifications."
                            icon={Sparkles}
                        />
                    </div>

                    {/* Section 3: Execution & AI */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Zap size={24} /></div>
                            <h3 className="text-xl font-bold text-white">Power Features</h3>
                        </div>
                        <HelpCard 
                            title="AI Assistant"
                            desc="Click 'AI Suggest' to generate entire complex workflows from a simple text prompt."
                            icon={Sparkles}
                        />
                        <HelpCard 
                            title="Live Execution"
                            desc="Click 'Run'. The workflow enters 'Live Mode'. Completed tasks turn green, blocked tasks turn red."
                            icon={Play}
                        />
                        <HelpCard 
                            title="Views"
                            desc="Switch between Graph (Visual), Timeline (Gantt-style), and List (Checklist) views."
                            icon={Layout}
                        />
                    </div>

                </div>

                {/* Pro Tips Section */}
                <div className="mt-12 p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl">
                    <h3 className="text-lg font-bold text-indigo-300 mb-4 flex items-center gap-2"><Sparkles size={20}/> Pro Tips</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <li className="flex items-start gap-2"><span className="text-indigo-500">•</span> Double-click anywhere on the background to create a default Task node instantly.</li>
                        <li className="flex items-start gap-2"><span className="text-indigo-500">•</span> Use the 'Load' folder to access your saved templates for recurring project types.</li>
                        <li className="flex items-start gap-2"><span className="text-indigo-500">•</span> Assign specific staff to nodes; they will receive notifications when the flow reaches that step.</li>
                        <li className="flex items-start gap-2"><span className="text-indigo-500">•</span> Use 'Decision' nodes to automate checks like 'Is Site Safe?' before proceeding.</li>
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Got it, Let's Build
                </button>
            </div>
        </motion.div>
    </motion.div>
  );
};

const HelpCard = ({ title, desc, icon: Icon }) => (
    <div className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors group">
        <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon size={16} className="text-gray-400 group-hover:text-white transition-colors" />}
            <h4 className="font-bold text-white text-sm">{title}</h4>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

export default WorkflowHelp;