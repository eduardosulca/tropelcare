import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTropels } from '../api/endpoints';
import type { Tropel, PaginatedResponse, Species, VitalState } from '../types/api';

export default function TropelsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResponse<Tropel> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const page = searchParams.get('page') ?? '0';
  const size = searchParams.get('size') ?? '20';
  const species = searchParams.get('species') ?? '';
  const vitalState = searchParams.get('vitalState') ?? '';
  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'name,asc';

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');

    const params: Record<string, string> = { page, size, sort };
    if (species) params.species = species;
    if (vitalState) params.vitalState = vitalState;
    if (q) params.q = q;

    getTropels(params)
      .then(res => {
        if (!controller.signal.aborted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('Error al cargar tropeles');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [page, size, species, vitalState, q, sort]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '0');
    setSearchParams(next);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Atlas de Tropeles</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">← Dashboard</button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar..."
            value={q}
            onChange={e => updateParam('q', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
          <select value={species} onChange={e => updateParam('species', e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
            <option value="">Todas las especies</option>
            {(['BLOBITO','CHISPA','GRUNON','DORMILON','GLITCHY'] as Species[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={vitalState} onChange={e => updateParam('vitalState', e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
            <option value="">Todos los estados</option>
            {(['ESTABLE','HAMBRIENTO','AGITADO','MUTANDO','CRITICO'] as VitalState[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={e => updateParam('sort', e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
            <option value="name,asc">Nombre A-Z</option>
            <option value="updatedAt,desc">Más recientes</option>
            <option value="chaosIndex,desc">Mayor caos</option>
          </select>
          <select value={size} onChange={e => updateParam('size', e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
            <option value="50">50 por página</option>
          </select>
        </div>

        {loading && <div className="text-center py-12 text-gray-400">Cargando tropeles...</div>}
        {error && <div className="text-center py-12 text-red-400">{error}</div>}
        {!loading && !error && data?.content.length === 0 && <div className="text-center py-12 text-gray-400">No se encontraron tropeles</div>}

        {!loading && !error && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {data.content.map(tropel => (
                <div key={tropel.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition cursor-pointer" onClick={() => navigate(`/tropels/${tropel.id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{tropel.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${tropel.vitalState === 'CRITICO' ? 'bg-red-900 text-red-300' : tropel.vitalState === 'ESTABLE' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{tropel.vitalState}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{tropel.species} — {tropel.sector.name}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="text-blue-400">Energía: {tropel.energyLevel}</span>
                    <span className="text-orange-400">Caos: {tropel.chaosIndex}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">{data.totalElements} tropeles — Página {data.currentPage + 1} de {data.totalPages}</p>
              <div className="flex gap-2">
                <button disabled={data.currentPage === 0} onClick={() => updateParam('page', String(data.currentPage - 1))} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-4 py-2 rounded-lg transition">← Anterior</button>
                <button disabled={data.currentPage >= data.totalPages - 1} onClick={() => updateParam('page', String(data.currentPage + 1))} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-4 py-2 rounded-lg transition">Siguiente →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}