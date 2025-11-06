import React, { useEffect, useRef, useState } from 'react';

// Simple web view using an iframe sandbox.
// Note: Cross-origin pages cannot be read or controlled due to browser security.

export default function WebView({ url, onTitle, onCanNavigateChange }) {
  const iframeRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const navigate = (target) => {
    if (iframeRef.current) {
      iframeRef.current.src = target || 'about:blank';
    }
  };

  useEffect(() => {
    navigate(url);
  }, [url]);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.__pb_update__) {
        const { title, canBack, canForward } = e.data.__pb_update__;
        if (title) onTitle(title);
        setCanGoBack(!!canBack);
        setCanGoForward(!!canForward);
        onCanNavigateChange && onCanNavigateChange({ canGoBack: !!canBack, canGoForward: !!canForward });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onTitle, onCanNavigateChange]);

  const sandbox = [
    'allow-forms',
    'allow-same-origin',
    'allow-scripts',
    'allow-popups',
    'allow-presentation',
    'allow-top-navigation-by-user-activation',
  ].join(' ');

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <iframe
        ref={iframeRef}
        title="webview"
        sandbox={sandbox}
        className="w-full h-full"
      />
    </div>
  );
}
