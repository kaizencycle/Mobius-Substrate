// Reflection Input Component
// Cycle: C-151

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReflectionInputProps {
  onSubmit: (content: string) => void;
}

export function ReflectionInput({ onSubmit }: ReflectionInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = content.length;
  const qualityEstimate = Math.min(1.0, characterCount / 500);

  return (
    <div className="rounded-2xl bg-slate-900/50 border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Daily Reflection</h2>
        <span className="text-xs text-slate-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you learn today? How did you grow? What would you do differently?"
        className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-slate-600"
      />

      {/* Meta info */}
      <div className="flex items-center justify-between mt-3 text-sm">
        <div className="flex items-center gap-4 text-slate-500">
          <span>{characterCount} characters</span>
          <span>•</span>
          <span>Quality: {Math.round(qualityEstimate * 100)}%</span>
        </div>
        <div className="text-slate-500">
          Est. reward: ~{(0.02 + qualityEstimate * 0.08).toFixed(3)} MIC
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!content.trim() || isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full mt-4 py-3 rounded-lg font-medium transition-all ${
          content.trim() && !isSubmitting
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" />
            </svg>
            Recording...
          </span>
        ) : (
          'Record Reflection'
        )}
      </motion.button>

      {/* Success message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-green-400 text-sm text-center"
          >
            ✓ Reflection recorded • MIC minted to your wallet
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
