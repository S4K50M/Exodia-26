import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize2, Minimize2, ChevronDown } from 'lucide-react'

import mapImg from '../assets/map/map.png'
import '../styles/map.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { MapSVG } from '../assets/loading/MapSVG'

const MAP_PRELOAD_IMAGES = [mapImg]

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Node { id: string; x: number; y: number }
interface Edge { source: string; target: string; weight: number }
interface MapData { nodes: Node[]; edges: Edge[] }

interface LocationCategory {
  name: string
  items: string[]
}

/* ─── Categorized Dropdown Component ────────────────────────────────────── */
interface CategorizedDropdownProps {
  value: string
  onChange: (value: string) => void
  categories: LocationCategory[]
  placeholder: string
}

function CategorizedDropdown({
  value,
  onChange,
  categories,
  placeholder,
}: CategorizedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as unknown as Element)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Enable mouse wheel scrolling on the dropdown panel
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
    }

    panel.addEventListener('wheel', handleWheel)
    return () => {
      panel.removeEventListener('wheel', handleWheel)
    }
  }, [isOpen])

  const selectedLabel = categories
    .flatMap((cat) => cat.items)
    .find((item) => item === value) || placeholder

  return (
    <div className="map-dropdown" ref={dropdownRef}>
      <button
        className="map-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLabel}
        <ChevronDown
          size={16}
          className="map-dropdown-chevron"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {isOpen && (
        <div className="map-dropdown-panel" ref={panelRef}>
          {categories.map((category) => (
            <div key={category.name} className="map-dropdown-category">
              <button
                className="map-category-header"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category.name ? null : category.name
                  )
                }
              >
                <span>{category.name}</span>
                <ChevronDown
                  size={14}
                  className="map-category-chevron"
                  style={{
                    transform:
                      expandedCategory === category.name ? 'rotate(180deg)' : 'none',
                  }}
                />
              </button>

              {expandedCategory === category.name && (
                <div className="map-category-items">
                  {category.items.map((item) => (
                    <button
                      key={item}
                      className={`map-item ${value === item ? 'active' : ''}`}
                      onClick={() => {
                        onChange(item)
                        setIsOpen(false)
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
  const [categories, setCategories] = useState<LocationCategory[]>([])
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

  /* ── Load mapData.json and organize into categories ──────────────────── */
  useEffect(() => {
    fetch('/mapData.json')
      .then((r) => r.json())
      .then((data: MapData) => {
        setMapData(data)

        // ═══════════════════════════════════════════════════════════════════════════
        // EDIT YOUR LOCATION CATEGORIES HERE
        // Add location node IDs to each category array
        // ═══════════════════════════════════════════════════════════════════════════
        const locationCategories: LocationCategory[] = [
        {
          name: 'Hostels',
          items: [
            'B8',
            'B9',
            'B10',
            'B11',
            'B12',
            'B13',
            'B14',
            'B15',
            'B16',
            'B17',
            'B18',
            'B19',
            'B20',
            'B21',
            'B22',
            'B23',
            'B24',
            'B25',
            'B26',
          ],
        },
        {
          name: 'Academic Buildings',
          items: [
            'A9',
            'A10',
            'A11',
            'A13',
            'A14',
            'A17',
            'A18',
          ],
        },
        {
          name: 'Mess & Canteens',
          items: [
            'Pine Mess',
            'Tulsi Mess',
            'Oak Mess',
            'Alder Mess',
            'Peepal Mess',
            'Monal Canteen',
            'Amul Canteen',
            'Faculty Canteen',
            'Higher Taste',
            'Bake -o -mocha',
          ],
        },
        {
          name: 'Shops',
          items: [
            'Supermarket',
          ],
        },
      ]

        setCategories(locationCategories)
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
    <LoadingScreen svg={<MapSVG />} preloadImages={MAP_PRELOAD_IMAGES}>
    <div className="map-page">
      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="map-controls">
        <div className="map-controls-inner">
          <div className="map-select-group">
            <label>From</label>
            <CategorizedDropdown
              value={fromId}
              onChange={setFromId}
              categories={categories}
              placeholder="Select location…"
            />
          </div>

          <div className="map-select-group">
            <label>To</label>
            <CategorizedDropdown
              value={toId}
              onChange={setToId}
              categories={categories}
              placeholder="Select location…"
            />
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
