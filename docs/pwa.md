# PWA — instalar Moto Control como app

Fase 2A.5 convierte la web en una **PWA instalable**: se puede agregar a la
pantalla de inicio y abrir como una app (pantalla completa, sin barra del
navegador), manteniendo todo lo demás igual. **No** es una app nativa ni un APK.

## ¿Qué es la PWA aquí?

- Manifest (`public/manifest.webmanifest`) + íconos (`public/icons`).
- Service worker (`public/sw.js`) que cachea **solo** el shell estático y da una
  **página offline** de respaldo.
- Banner discreto **"Instalar Moto Control"** (Android/Chrome).
- Nombre instalado: **Moto Control** (ajustable en el manifest antes de entregar).

## Cómo instalar

### Android (Chrome)
1. Abre la app en Chrome.
2. Aparece el banner **"Instala Moto Control" → Instalar** (o menú ⋮ →
   *Agregar a pantalla de inicio / Instalar aplicación*).
3. El ícono queda en la pantalla de inicio y abre en pantalla completa.

### iPhone / iPad (Safari)
iOS no muestra el banner automático. Manualmente:
1. Abre la app en **Safari**.
2. Toca **Compartir** (cuadro con flecha) → **Agregar a pantalla de inicio**.
3. Confirma. El ícono queda en la pantalla de inicio.

### Escritorio (Chrome/Edge)
Ícono de instalar en la barra de direcciones → *Instalar*.

## Qué funciona con conexión

Todo: dashboard, motos, arrendatarios, alquileres, pagos, vencimientos,
mantenimientos, fotomultas + mapa, reportes/exportaciones, configuración, acta
PDF y subida de archivos. **La app es online-first.**

## Qué pasa sin conexión

- Si abres la app sin internet, verás una **página offline** clara con botón
  **Reintentar**.
- Si estabas dentro y se cae la red, aparece un **banner "Sin conexión"**.

## Qué NO está soportado offline (por diseño)

- No hay **escritura offline** ni **sincronización**: crear/editar requiere red.
- No se consultan datos offline (la app no guarda información de la flota en el
  dispositivo).
- No hay **notificaciones push** (fuera de alcance por ahora).

## Privacidad / seguridad del caché

El service worker es deliberadamente conservador:

- **Navegaciones:** red primero; sin red → página `/offline`. Las páginas `/app`
  **nunca** se guardan en caché.
- **Cachea solo** assets de build no sensibles (`/_next/static`, `/icons`,
  manifest).
- **No cachea:** datos de `/app`, exportaciones CSV, actas PDF, documentos o
  evidencias, ni nada de **Supabase / Storage / URLs firmadas** (son otro
  origen y se ignoran por completo).
- No se expone la `service-role` (sigue siendo server-side). El dispositivo no
  almacena datos sensibles offline.

## PWA vs APK

| | PWA (esto) | APK / Play Store |
| --- | --- | --- |
| Instalación | Desde el navegador | Descarga/instalación de archivo o tienda |
| Actualización | Automática (es la web) | Requiere publicar versiones |
| Costo/mantenimiento | Bajo | Mayor (firma, store, releases) |
| Acceso nativo | Limitado | Completo |

## Camino futuro hacia APK (si el cliente lo pide)

Se puede empaquetar esta misma PWA como APK con un **Trusted Web Activity (TWA)**
(p. ej. Bubblewrap) y publicarla en Play Store, **sin reescribir la app**. Queda
como opción de Fase 3 si surge la necesidad.

## Actualización / recuperación de la PWA instalada

- El service worker se **auto-actualiza**: al abrir la PWA, el navegador detecta
  el `sw.js` nuevo, lo instala y en `activate` **purga las versiones de caché
  anteriores** (el nombre de caché está versionado, p. ej. `moto-control-v2`).
- Solo se cachean respuestas **200 válidas de mismo origen** (nunca 404 ni
  redirects), para evitar "envenenar" el caché durante un redeploy — esa era la
  causa de un crash que aparecía solo en la PWA (ChunkLoadError).
- Si una PWA quedó en mal estado por una versión vieja: **cierra y vuelve a
  abrir** la app un par de veces (para que tome el SW nuevo) o, si persiste,
  desinstálala y vuelve a agregarla a la pantalla de inicio (o borra los datos
  del sitio en el navegador).
- Cualquier error de cliente ahora se muestra **controlado** ("Algo salió mal" +
  Reintentar) en vez del mensaje crudo de Next.

## Ajustes antes de entregar

- Cambiar `name` / `short_name` / `description` en `public/manifest.webmanifest`.
- Reemplazar los íconos de `public/icons` por el logo definitivo (regenerables
  con `node scripts/generate-icons.mjs` si quieres mantener el estilo actual).
