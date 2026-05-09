'use client';

import { useState, useRef, useEffect } from 'react';
import { useCopilotStore } from '@/store/copilot-store';

interface FloatingMiniModeProps {
  onClose: () => void;
}

export default function FloatingMiniMode({ onClose }: FloatingMiniModeProps) {
  const { currentQuestion, questions } = useCopilotStore();
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const latestQuestion = currentQuestion || questions[0];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  return (
    <div
      ref={dragRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      className="w-[320px] glass-panel border-2 border-neon-cyan rounded-xl shadow-2xl"
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        className="px-4 py-3 border-b border-gray-700 flex items-center justify-between cursor-move bg-gray-900/80"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-neon-cyan">Mini Mode</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-hide">
        {latestQuestion ? (
          <div>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">Latest Question</span>
                <span className="text-xs text-neon-cyan">
                  {new Date(latestQuestion.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm font-semibold text-white mb-3">
                {latestQuestion.question}
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3">
              {latestQuestion.isStreaming && !latestQuestion.answer && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-neon-cyan"></div>
                  <span className="text-xs">Generating...</span>
                </div>
              )}

              {latestQuestion.answer && (
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {latestQuestion.answer}
                  {latestQuestion.isStreaming && (
                    <span className="inline-block w-1.5 h-3 bg-neon-cyan ml-1 animate-pulse"></span>
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👂</div>
            <p className="text-sm text-gray-400">Waiting for questions...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/80">
        <p className="text-xs text-gray-500 text-center">
          Drag to reposition • {questions.length} total questions
        </p>
      </div>
    </div>
  );
}
