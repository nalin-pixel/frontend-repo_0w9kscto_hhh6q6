import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Home, Star } from 'lucide-react';

const normalizeUrl = (input) => {
  try {
    if (!input) return 'about:blank';
    if (!/^https?:\/\//i.test(input) && !/^about:/.test(input)) {
      return new URL(`https://${input}`).toString();
    }
    return new URL(input).toString();
  } catch (e) {
    return `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;
  }
};

export default function AddressBar({
  onNavigate,
  onHome,
  onReload,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onAddBookmark,
  currentUrl,
}) {
  const [value, setValue] = useState(currentUrl || '');

  useEffect(() => {
    setValue(currentUrl || '');
  }, [currentUrl]);

  const submit = (e) => {
    e.preventDefault();
    const url = normalizeUrl(value.trim());
    onNavigate(url);
  };

  return (
    <div className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 shadow-sm">
      <div className="flex items-center gap-2">
        <button onClick={onBack} disabled={!canGoBack} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <button onClick={onForward} disabled={!canGoForward} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40" aria-label="Forward">
          <ArrowRight size={18} />
        </button>
        <button onClick={onReload} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Reload">
          <RefreshCw size={18} />
        </button>
        <button onClick={onHome} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Home">
          <Home size={18} />
        </button>
        <form onSubmit={submit} className="flex-1">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search or enter address"
            className="w-full px-4 py-2 rounded-lg bg-zinc-100/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          />
        </form>
        <button onClick={() => onAddBookmark(currentUrl)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Bookmark">
          <Star size={18} />
        </button>
      </div>
    </div>
  );
}
