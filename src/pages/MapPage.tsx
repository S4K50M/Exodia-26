import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

import mapImg from '../assets/map/map.png'
import '../styles/map.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { MapSVG } from '../assets/loading/MapSVG'

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Node { id: string; x: number; y: number }
interface Edge { source: string; target: string; weight: number }
interface MapData { nodes: Node[]; edges: Edge[] }

/* ─── Dijkstra ───────────────────────────────────────────────────────────── */
function dijkstra(
  nodes: Node[],
  edges: Edge[],
  sourceId: string,
  targetId: string,
): Node[] | null {
  // Build adjacency list (treat all edges as bidirectional)
  const adj = new Map<string, { to: string; w: number }[]>()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    adj.get(e.source)?.push({ to: e.target, w: e.weight })
    adj.get(e.target)?.push({ to: e.source, w: e.weight })
  }

  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()

  for (const n of nodes) {
    dist.set(n.id, Infinity)
    prev.set(n.id, null)
  }
  dist.set(sourceId, 0)

  // Simple priority queue via min-extraction (fine for ~200 nodes)
  const pq: { id: string; d: number }[] = [{ id: sourceId, d: 0 }]

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d)
    const u = pq.shift()!
    if (visited.has(u.id)) continue
    visited.add(u.id)
    if (u.id === targetId) break

    for (const { to, w } of adj.get(u.id) || []) {
      const alt = u.d + w
      if (alt < (dist.get(to) ?? Infinity)) {
        dist.set(to, alt)
        prev.set(to, u.id)
        pq.push({ id: to, d: alt })
      }
    }
  }

  if (!visited.has(targetId)) return null

  // Reconstruct path
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const path: Node[] = []
  let cur: string | null = targetId
  while (cur) {
    const node = nodeMap.get(cur)
    if (node) path.unshift(node)
    cur = prev.get(cur) ?? null
  }
  return path.length > 1 ? path : null
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function MapPage() {
  const [mapData, setMapData] = useState<MapData | null>(null)
  const [locations, setLocations] = useState<string[]>([])
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

  const [isFullscreen, setIsFullscreen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef   = useRef<HTMLDivElement>(null)
  const imgRef      = useRef<HTMLImageElement>(null)

  /* ── Fullscreen sync ──────────────────────────────────────────────────── */
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Fullscreen only the map canvas (image + SVG overlay), not the whole page
      const el = canvasRef.current as HTMLDivElement & {
        webkitRequestFullscreen?: () => Promise<void>
      }
      const req = el?.requestFullscreen
        ? el.requestFullscreen()
        : el?.webkitRequestFullscreen
        ? el.webkitRequestFullscreen()
        : Promise.reject()
      // Lock to landscape so the map fills the screen horizontally
      req
        .then(() => {
          const orient = screen.orientation as ScreenOrientation & {
            lock?: (o: string) => Promise<void>
          }
          return orient?.lock?.('landscape').catch(() => { /* not supported */ })
        })
        .catch(() => { /* fullscreen denied */ })
    } else {
      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>
      }
      const exit = doc.exitFullscreen
        ? doc.exitFullscreen()
        : doc.webkitExitFullscreen
        ? doc.webkitExitFullscreen()
        : Promise.reject()
      exit
        .then(() => {
          const orient = screen.orientation as ScreenOrientation & {
            unlock?: () => void
          }
          orient?.unlock?.()
        })
        .catch(() => { /* ignore */ })
    }
  }

  /* ── Load mapData.json ────────────────────────────────────────────────── */
  useEffect(() => {
    fetch('/mapData.json')
      .then((r) => r.json())
      .then((data: MapData) => {
        setMapData(data)
        // Named locations = nodes whose id does NOT start with "N" followed by digits
        const named = data.nodes
          .filter((n) => !/^N\d+$/.test(n.id))
          .map((n) => n.id)
          .sort((a, b) => a.localeCompare(b))
        setLocations(named)
      })
  }, [])

  /* ── Track natural image dimensions for SVG viewBox ───────────────────── */
  const onImgLoad = useCallback(() => {
    if (imgRef.current) {
      setImgSize({
        w: imgRef.current.naturalWidth,
        h: imgRef.current.naturalHeight,
      })
    }
  }, [])

  /* ── Compute path when both endpoints are set (derived, no effect) ──── */
  const path =
    mapData && fromId && toId && fromId !== toId
      ? dijkstra(mapData.nodes, mapData.edges, fromId, toId)
      : null

  const handleClear = () => {
    setFromId('')
    setToId('')
  }

  const pathD =
    path && path.length > 1
      ? path.map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x},${n.y}`).join(' ')
      : ''

  return (
    <LoadingScreen svg={<MapSVG />}>
    <div className="map-page">
      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="map-controls">
        <div className="map-controls-inner">
          <div className="map-select-group">
            <label htmlFor="map-from">From</label>
            <select
              id="map-from"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
            >
              <option value="">Select location…</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="map-select-group">
            <label htmlFor="map-to">To</label>
            <select
              id="map-to"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
            >
              <option value="">Select location…</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <button className="map-clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>

      {/* ── Map + SVG overlay ────────────────────────────────────────────── */}
      <div className="map-viewport" ref={containerRef}>
        <div className="map-canvas" ref={canvasRef}>
          {/* ── Fullscreen toggle ─────────────────────────────────────── */}
          <button
            className="map-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <img
            ref={imgRef}
            src={mapImg}
            alt="Campus Map"
            className="map-image"
            onLoad={onImgLoad}
            draggable={false}
            loading="eager"
            decoding="async"
          />

          {imgSize.w > 0 && (
            <svg
              className="map-svg-overlay"
              viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Start marker */}
              {path && path.length > 0 && (
                <circle
                  cx={path[0].x}
                  cy={path[0].y}
                  r={14}
                  fill="#22c55e"
                  stroke="#fff"
                  strokeWidth={4}
                />
              )}

              {/* Path line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#111"
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* End marker */}
              {path && path.length > 1 && (
                <circle
                  cx={path[path.length - 1].x}
                  cy={path[path.length - 1].y}
                  r={14}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={4}
                />
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
    </LoadingScreen>
  )
}
