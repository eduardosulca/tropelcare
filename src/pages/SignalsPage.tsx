import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSignalsFeed } from '../api/endpoints';
import type { Signal, SignalType, Severity, SignalStatus } from '../types/api';

export default function SignalsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const signalType = searchParams.get('signalType') ?? '';
  const severity = searchParams.get('severity') ?? '';
  const status = searchParams.get('status') ?? '';
  const q = searchParams.get('q') ?? '';

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  function resetFeed() {
    setSignals([]);
    setCursor(null);
    setHasMore(true);
    setPageError('');
    seenIds.current = new Set();
    loadingRef.current = false;
  }

  useEffect(() => { resetFeed(); }, [signalType, severity, status, q]);

  const loadMore = useCallback(async (currentCursor: string | null) => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setPageError('');

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params: Record<string, string> = { limit: '15' };
    if (currentCursor) params.cursor = currentCursor;
    if (signalType) params.signalType = signalType;
    if (severity) params.severity = severity;
    if (status) params.status = status;
    if (q) params.q = q;

    try {
      const res = await getSignalsFeed(params);
      if (controller.signal.aborted) return;
      const newItems = res.items.filter(s => !seenIds.current.has(s.id));
      newItems.forEach(s => seenIds.current.add(s.id));
      setSignals(prev => [...prev, ...newItems]);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch {
      if (!controller.signal.aborted) setPageError('Error al cargar señales. Intenta de nuevo.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, [signalType, severity, status, q, hasMore]);

  useEffect(() => {
    loadMore(null);
  }, [signalType, severity, status, q]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
        loadMore(cursor);
      }
    }, { threshold: 0.1 });
    if (bottomRef.current) observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [cursor, hasMore, loadMore]);

  const severityColor: Record<string, string> = {
    LEVE: 'bg-blue-900 text-blue-300',
    MODERADO: 'bg-yellow-900 text-yellow-300',
    GRAVE: 'bg-orange-900 text-orange-300',
    CRITICO: 'bg-red-900 text-red-300',
  };

  const statusColor: Record<string, string> = {
    RECIBIDA: 'text-gray-400',
    PROCESANDO: 'text-yellow-400',
    ATENDIDA: 'text-green-400',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Feed de Señales</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">← Dashboard</button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          <input type="text" placeholder="Buscar..." value={q} onChange={e => updateParam('q', e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
          <select value={signalType} onChange={e => updateParam('signalType', e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
            <option value="">Todos los tipos</option>
            {(['HAMBRE','ABANDONO','MUTACION','FUGA','CONFLICTO','REPRODUCCION_MASIVA','SENAL_CORRUPTA'] as SignalType[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={severity} onChange={e => updateParam('severity', e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
            <option value="">Toda severidad</option>
            {(['LEVE','MODERADO','GRAVE','CRITICO'] as Severity[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={status} onChange={e => updateParam('status', e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
            <option value="">Todos los estados</option>
            {(['RECIBIDA','PROCESANDO','ATENDIDA'] as SignalStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {signals.map(signal => (
            <div key={signal.id} onClick={() => navigate(`/signals/${signal.id}`)} className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full mr-2 ${severityColor[signal.severity]}`}>{signal.severity}</span>
                  <span className="text-gray-300 text-sm">{signal.signalType}</span>
                </div>
                <span className={`text-sm font-semibold ${statusColor[signal.status]}`}>{signal.status}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2 truncate">{signal.rawContent}</p>
              <p className="text-gray-600 text-xs mt-1">{new Date(signal.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {loading && <div className="text-center py-8 text-gray-400">Cargando señales...</div>}
        {pageError && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-3">{pageError}</p>
            <button onClick={() => { loadingRef.current = false; loadMore(cursor); }} className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg transition">Reintentar</button>
          </div>
        )}
        {!hasMore && !loading && <div className="text-center py-8 text-gray-500">— Fin de la lista —</div>}
        {signals.length === 0 && !loading && !pageError && <div className="text-center py-12 text-gray-400">No hay señales</div>}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}