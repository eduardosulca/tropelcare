# TropelCare Control Room

## Integrantes
- Eduardo Sulca - (tu código de estudiante)

## Instalación

npm install
npm run dev

## Variables de entorno requeridas

VITE_API_BASE_URL=https://hackaton-20261-front-587720740455.us-east1.run.app/api/v1

## Comandos

npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run typecheck # Verificar tipos TypeScript

## Link del deploy

https://tropelcare-omgc.vercel.app

## Decisiones técnicas

- React 18 + TypeScript estricto + Vite
- React Router para navegación y estado en URL
- Fetch API nativo para llamadas al backend
- Tailwind CSS para estilos
- Infinite scroll con IntersectionObserver
- Scrollytelling con IntersectionObserver y CSS sticky
- AbortController para cancelar requests obsoletas
- Deduplicación de señales por ID en el feed