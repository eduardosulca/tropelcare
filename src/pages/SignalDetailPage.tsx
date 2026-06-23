import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSignal, updateSignalStatus } from '../api/endpoints';
import type { Signal } from '../types/api';

export default function SignalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSignal(id)
      .then(setSignal)
      .catch(() => setError('Error al cargar la señal'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(status: 'PROCESANDO' | 'ATENDIDA') {
    if (!id) return;
    setUpdating(true);
    setUpdateError('');
    setSuccess('');
    try {
      const updated = await updateSignalStatus(id, status);
      setSignal(updated);
      setSuccess(`Estado actualizado a ${status}`);
    } catch {
      setUpdateError('Error al actualizar. Intenta de nuevo.');
    } finally {
      setUpdating(false);
    }
  }

  const severityColor: Record<string, string> = {
    LEVE: 'bg-blue-900 text-blue-300',
    MODERADO: 'bg-yellow-900 text-yellow-300',
    GRAVE: 'bg-orange-900 text-orange-300',
    CRITICO: 'bg-red-900 text-red-300',
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Cargando...</div>;
  if (error) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">{error}</div>;
  if (!signal) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition mb-6">← Volver</button>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">Detalle de Señal</h1>
            <span className={`text-sm px-3 py-1 rounded-full ${severityColor[signal.severity]}`}>{signal.severity}</span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Tipo</span>
              <span className="font-semibold">{signal.signalType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estado</span>
              <span className={`font-semibold ${signal.status === 'ATENDIDA' ? 'text-green-400' : signal.status === 'PROCESANDO' ? 'text-yellow-400' : 'text-gray-300'}`}>{signal.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Creada</span>
              <span>{new Date(signal.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Actualizada</span>
              <span>{new Date(signal.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm mb-1">Contenido</p>
            <p className="text-gray-200">{signal.rawContent}</p>
          </div>

          {success && <p className="text-green-400 text-sm mb-4">{success}</p>}
          {updateError && <p className="text-red-400 text-sm mb-4">{updateError}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => handleUpdate('PROCESANDO')}
              disabled={updating || signal.status === 'PROCESANDO'}
              className="flex-1 bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 py-2 rounded-lg font-semibold transition"
            >
              {updating ? 'Actualizando...' : 'Marcar PROCESANDO'}
            </button>
            <button
              onClick={() => handleUpdate('ATENDIDA')}
              disabled={updating || signal.status === 'ATENDIDA'}
              className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 py-2 rounded-lg font-semibold transition"
            >
              {updating ? 'Actualizando...' : 'Marcar ATENDIDA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}