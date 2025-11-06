import React, { useEffect, useMemo, useState } from 'react';
import AddressBar from './components/AddressBar.jsx';
import TabBar from './components/TabBar.jsx';
import BookmarksPanel from './components/BookmarksPanel.jsx';
import PasswordVault from './components/PasswordVault.jsx';
import WebView from './components/WebView.jsx';

const BOOKMARKS_KEY = 'personal_browser_bookmarks_v1';

function readBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(items) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(items));
}

function createTab(url = 'about:blank') {
  return { id: crypto.randomUUID(), url, title: 'New Tab' };
}

export default function App() {
  const [tabs, setTabs] = useState([createTab('https://duckduckgo.com')]);
  const [activeId, setActiveId] = useState(() => tabs[0]?.id);
  const activeTab = useMemo(() => tabs.find((t) => t.id === activeId) || tabs[0], [tabs, activeId]);

  useEffect(() => {
    if (!activeId && tabs.length > 0) setActiveId(tabs[0].id);
  }, [tabs, activeId]);

  const onNewTab = () => {
    const t = createTab('about:blank');
    setTabs((prev) => [...prev, t]);
    setActiveId(t.id);
  };

  const onCloseTab = (id) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) {
      const remaining = tabs.filter((t) => t.id !== id);
      setActiveId(remaining[remaining.length - 1]?.id || null);
    }
  };

  const onSelectTab = (id) => setActiveId(id);

  const onNavigate = (url) => {
    if (!activeTab) return;
    setTabs((prev) => prev.map((t) => (t.id === activeTab.id ? { ...t, url } : t)));
  };

  const onHome = () => onNavigate('https://duckduckgo.com');
  const onReload = () => onNavigate(activeTab?.url || 'about:blank');

  const onTitle = (title) => {
    if (!activeTab) return;
    setTabs((prev) => prev.map((t) => (t.id === activeTab.id ? { ...t, title: title || t.title } : t)));
  };

  const onAddBookmark = (url) => {
    try {
      const u = new URL(url);
      const title = activeTab?.title || u.host;
      const next = [...readBookmarks(), { id: crypto.randomUUID(), url: u.toString(), title }];
      writeBookmarks(next);
      // Light feedback
      alert('Bookmarked!');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">Personal Browser</div>
          <div className="text-xs text-zinc-500">Local-first • Sandbox iframe • Minimal</div>
        </div>

        <TabBar tabs={tabs} activeId={activeId} onNewTab={onNewTab} onCloseTab={onCloseTab} onSelectTab={onSelectTab} />
        <AddressBar
          onNavigate={onNavigate}
          onHome={onHome}
          onReload={onReload}
          canGoBack={false}
          canGoForward={false}
          onBack={() => {}}
          onForward={() => {}}
          onAddBookmark={onAddBookmark}
          currentUrl={activeTab?.url || ''}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 min-h-[70vh]">
          <div className="lg:col-span-3 h-[70vh]">
            <WebView url={activeTab?.url || 'about:blank'} onTitle={onTitle} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-3">
            <BookmarksPanel onOpen={onNavigate} />
            <PasswordVault />
          </div>
        </div>
      </div>
    </div>
  );
}
