import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'personal_browser_bookmarks_v1';

const readBookmarks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeBookmarks = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export default function BookmarksPanel({ onOpen }) {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setBookmarks(readBookmarks());
  }, []);

  const remove = (id) => {
    const next = bookmarks.filter((b) => b.id !== id);
    setBookmarks(next);
    writeBookmarks(next);
  };

  return (
    <div className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <Bookmark size={18} />
        <h2 className="font-semibold">Bookmarks</h2>
      </div>
      {bookmarks.length === 0 ? (
        <p className="text-sm text-zinc-500">No bookmarks yet. Use the star to save the current page.</p>
      ) : (
        <ul className="space-y-2">
          {bookmarks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2">
              <button
                onClick={() => onOpen(b.url)}
                className="flex-1 text-left truncate px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title={b.url}
              >
                <span className="font-medium">{b.title || b.url}</span>
                <span className="text-xs text-zinc-500 ml-2">{new URL(b.url).host}</span>
              </button>
              <a href={b.url} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Open in new tab">
                <ExternalLink size={16} />
              </a>
              <button onClick={() => remove(b.id)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Delete bookmark">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
