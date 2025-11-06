import React from 'react';
import { X, Plus } from 'lucide-react';

export default function TabBar({ tabs, activeId, onNewTab, onCloseTab, onSelectTab }) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap transition-colors ${
              activeId === tab.id
                ? 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow'
                : 'bg-zinc-100/60 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 hover:dark:bg-zinc-800'
            }`}
          >
            <span className="max-w-[200px] truncate">{tab.title || 'New Tab'}</span>
            <span className="text-zinc-400">—</span>
            <span className="max-w-[260px] truncate text-zinc-500">{tab.url || 'about:blank'}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="ml-2 p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
              aria-label="Close tab"
            >
              <X size={14} />
            </span>
          </button>
        ))}
        <button onClick={onNewTab} className="ml-1 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 hover:dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700" aria-label="New tab">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
