import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboard, getSectors } from '../api/endpoints';
import type { DashboardSummary, Sector } from '../types/api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboard(), getSectors()])
      .then(([s, sec]) => {
        setSummary(s);
        setSectors(sec);
      })
      .catch(() => setError('Error al cargar el dashboard'))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Cargando...</div>;
  if (error) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">TropelCare Control Room</h1>
            <p className="text-gray-400">Bienvenido, {user?.displayName} — {user?.teamCode}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/tropels')} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">Tropeles</button>
            <button onClick={() => navigate('/signals')} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">Señales</button>
            <button onClick={handleLogout} className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg transition">Salir</button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total Tropeles</p>
              <p className="text-4xl font-bold text-blue-400">{summary.totalTropels}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Tropeles Críticos</p>
              <p className="text-4xl font-bold text-red-400">{summary.criticalTropels}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Señales Abiertas</p>
              <p className="text-4xl font-bold text-yellow-400">{summary.openSignals}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Estabilidad Promedio</p>
              <p className="text-4xl font-bold text-green-400">{summary.sectorStabilityAvg}%</p>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Señales por Severidad</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary && Object.entries(summary.signalsBySeverity).map(([key, val]) => (
              <div key={key} className="text-center">
                <p className="text-gray-400 text-sm">{key}</p>
                <p className="text-2xl font-bold">{val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Sectores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectors.map(sector => (
              <div
                key={sector.id}
                className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
                onClick={() => navigate(`/sectors/${sector.id}/story`)}
              >
                <p className="font-semibold">{sector.name}</p>
                <p className="text-gray-400 text-sm">{sector.sectorCode} — {sector.climate}</p>
                <p className="text-green-400 text-sm mt-1">Estabilidad: {sector.stabilityLevel}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}