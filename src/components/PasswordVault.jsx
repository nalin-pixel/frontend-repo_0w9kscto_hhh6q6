import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Lock, Plus, Trash2, Copy } from 'lucide-react';

// A very lightweight client-side password vault using Web Crypto.
// Data is stored locally in localStorage encrypted with a passphrase-derived key.

const STORAGE_KEY = 'personal_browser_vault_v1';

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(passphrase, data) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(data))
  );
  return {
    s: Array.from(salt),
    i: Array.from(iv),
    c: Array.from(new Uint8Array(ciphertext)),
  };
}

async function decryptData(passphrase, payload) {
  const dec = new TextDecoder();
  const salt = new Uint8Array(payload.s);
  const iv = new Uint8Array(payload.i);
  const key = await deriveKey(passphrase, salt);
  const ciphertext = new Uint8Array(payload.c);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(dec.decode(plaintext));
}

function useVault(passphrase) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setItems([]);
      setLoaded(true);
      return;
    }
    try {
      const obj = JSON.parse(raw);
      const data = await decryptData(passphrase, obj);
      setItems(Array.isArray(data) ? data : []);
      setLoaded(true);
    } catch (e) {
      setError('Incorrect passphrase or corrupted vault.');
      setLoaded(false);
    }
  };

  const save = async (nextItems) => {
    const payload = await encryptData(passphrase, nextItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  return { items, setItems, loaded, load, save, error };
}

export default function PasswordVault() {
  const [unlocked, setUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const { items, setItems, loaded, load, save, error } = useVault(passphrase);
  const [show, setShow] = useState({});

  const handleUnlock = async (e) => {
    e.preventDefault();
    await load();
    setUnlocked(true);
  };

  const addItem = async () => {
    const label = prompt('Label (e.g., site or app)');
    if (!label) return;
    const username = prompt('Username / Email');
    const password = prompt('Password');
    const next = [...items, { id: crypto.randomUUID(), label, username, password }];
    setItems(next);
    await save(next);
  };

  const removeItem = async (id) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    await save(next);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  if (!unlocked) {
    return (
      <div className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={18} />
          <h2 className="font-semibold">Password Vault</h2>
        </div>
        <form onSubmit={handleUnlock} className="flex items-center gap-2">
          <input
            type="password"
            placeholder="Enter passphrase to unlock"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-100/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          />
          <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm">Unlock</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-3 text-xs text-zinc-500">Tip: Your vault is encrypted locally. Keep your passphrase safe; there is no recovery.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lock size={18} />
          <h2 className="font-semibold">Password Vault</h2>
        </div>
        <button onClick={addItem} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm">
          <Plus size={16} /> Add
        </button>
      </div>
      {(!loaded && !error) ? (
        <p className="text-sm text-zinc-500">Enter your passphrase to load the vault.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500">No items yet. Use Add to create a password.</p>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((item) => (
            <div key={item.id} className="py-2 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                <div className="text-xs text-zinc-500 truncate">{item.username}</div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type={show[item.id] ? 'text' : 'password'}
                    readOnly
                    value={item.password}
                    className="px-2 py-1 rounded bg-zinc-100/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm w-56"
                  />
                  <button
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setShow((s) => ({ ...s, [item.id]: !s[item.id] }))}
                    title={show[item.id] ? 'Hide' : 'Show'}
                  >
                    {show[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => copyToClipboard(item.password)}
                    title="Copy password"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
