import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSectorStory } from '../api/endpoints';
import type { SectorStoryResponse, SectorStoryStage } from '../types/api';

const colorMap: Record<string, string> = {
  emerald: 'from-emerald-900 to-emerald-700 border-emerald-500',
  blue: 'from-blue-900 to-blue-700 border-blue-500',
  red: 'from-red-900 to-red-700 border-red-500',
  yellow: 'from-yellow-900 to-yellow-700 border-yellow-500',
  purple: 'from-purple-900 to-purple-700 border-purple-500',
  orange: 'from-orange-900 to-orange-700 border-orange-500',
  cyan: 'from-cyan-900 to-cyan-700 border-cyan-500',
  pink: 'from-pink-900 to-pink-700 border-pink-500',
};

function StageVisual({ stage }: { stage: SectorStoryStage }) {
  const colors = colorMap[stage.colorToken] ?? colorMap['blue'];
  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br p-6 ${colors} h-full flex flex-col justify-between`}>
      <div>
        <p className="text-xs uppercase tracking-widest opacity-70 mb-2">{stage.assetKey}</p>
        <h3 className="text-2xl font-bold mb-4">{stage.title}</h3>
        <p className="text-sm opacity-80 mb-4">{stage.dominantEvent}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xs opacity-60">Estabilidad</p>
          <p className="text-2xl font-bold">{stage.metrics.stability}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xs opacity-60">Energía</p>
          <p className="text-2xl font-bold">{stage.metrics.energy}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xs opacity-60">Alertas</p>
          <p className="text-2xl font-bold">{stage.metrics.alerts}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-black/30 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-white/70 transition-all duration-500"
            style={{ width: `${Math.round(stage.progress * 100)}%` }}
          />
        </div>
        <p className="text-xs opacity-60 mt-1 text-right">{Math.round(stage.progress * 100)}% completado</p>
      </div>
    </div>
  );
}

export default function SectorStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<SectorStoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStage, setActiveStage] = useState(0);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!id) return;
    getSectorStory(id)
      .then(setStory)
      .catch(() => setError('Error al cargar la historia'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!story) return;
    const observers: IntersectionObserver[] = [];
    story.stages.forEach((_, i) => {
      const el = stageRefs.current[i];
      if (!el) return;
      const obs = new IntersectionObserver(
        entries => { if (entries[0].isIntersecting) setActiveStage(i); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [story]);

  function scrollToStage(i: number) {
    stageRefs.current[i]?.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'center',
    });
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Cargando historia...</div>;
  if (error) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">{error}</div>;
  if (!story) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header fijo */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-6 py-3 flex justify-between items-center">
        <div>
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm mr-4">← Volver</button>
          <span className="font-bold">{story.sector.name}</span>
          <span className="text-gray-400 text-sm ml-2">{story.sector.sectorCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Etapa {activeStage + 1} / {story.stages.length}</span>
          <div className="flex gap-1">
            {story.stages.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToStage(i)}
                aria-label={`Ir a etapa ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${i === activeStage ? 'bg-white scale-125' : 'bg-gray-600 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Layout sticky desktop */}
      <div className="max-w-6xl mx-auto px-6 py-8 lg:flex lg:gap-8">
        {/* Visual sticky */}
        <div className="hidden lg:block lg:w-1/2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <StageVisual stage={story.stages[activeStage]} />
        </div>

        {/* Etapas scrolleables */}
        <div className="lg:w-1/2 space-y-24 pb-32">
          {story.stages.map((stage, i) => (
            <div
              key={stage.stageOrder}
              ref={el => { stageRefs.current[i] = el; }}
              tabIndex={0}
              onFocus={() => setActiveStage(i)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
            >
              {/* Visual mobile */}
              <div className="lg:hidden mb-4">
                <StageVisual stage={stage} />
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">Etapa {i + 1}</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{stage.title}</h2>
                <p className="text-gray-300 leading-relaxed mb-4">{stage.narrative}</p>
                <p className="text-sm text-gray-500 italic">Evento dominante: {stage.dominantEvent}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}