import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useData } from '../context/DataContext';
import { CITY_COORDINATES } from '../utils/api';
import styles from '../styles/Analytics.module.css';
import 'leaflet/dist/leaflet.css';

export default function Analytics() {
  const navigate = useNavigate();
  const { employees, mergedImage } = useData();
  const [hoveredBar, setHoveredBar] = useState(null);

  // Aggregate salary per city
  const cityData = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const city = emp.city || 'Unknown';
      const salary = emp.salary || 0;
      if (!map[city]) map[city] = { total: 0, count: 0 };
      map[city].total += salary;
      map[city].count += 1;
    });
    return Object.entries(map)
      .map(([city, data]) => ({ city, total: data.total, count: data.count, avg: data.total / data.count }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);
  }, [employees]);

  // Map city data with coordinates
  const mapMarkers = useMemo(() => {
    return cityData
      .filter(d => {
        const key = Object.keys(CITY_COORDINATES).find(
          k => k.toLowerCase() === d.city.toLowerCase()
        );
        return !!key;
      })
      .map(d => {
        const key = Object.keys(CITY_COORDINATES).find(
          k => k.toLowerCase() === d.city.toLowerCase()
        );
        return { ...d, coords: CITY_COORDINATES[key] };
      });
  }, [cityData]);

  // SVG Chart dimensions
  const chartWidth = Math.max(600, cityData.length * 70);
  const chartHeight = 350;
  const padding = { top: 30, right: 20, bottom: 80, left: 70 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const maxSalary = Math.max(...cityData.map(d => d.total), 1);
  const barWidth = Math.min(40, plotWidth / cityData.length - 8);

  // Color for bars
  const barColors = [
    '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd',
    '#818cf8', '#7c3aed', '#6d28d9', '#5b21b6',
    '#4f46e5', '#4338ca', '#3730a3', '#312e81',
    '#6366f1', '#8b5cf6', '#a78bfa',
  ];

  return (
    <div className={styles['analytics-page']}>
      <div className={styles['analytics-header']}>
        <button className={styles['back-btn']} onClick={() => navigate('/list')}>← Back</button>
        <h1>Analytics Dashboard</h1>
      </div>

      {/* Audit Image */}
      <div className={styles['audit-section']}>
        <h2 className={styles['section-title']}>🖼️ Audit Image</h2>
        {mergedImage ? (
          <img src={mergedImage} alt="Merged audit — photo with signature overlay" />
        ) : (
          <p className={styles['no-audit']}>
            No audit image available. Go to an employee's detail page to capture and sign a photo.
          </p>
        )}
      </div>

      {/* SVG Chart */}
      <div className={styles['chart-section']}>
        <h2 className={styles['section-title']}>📊 Salary Distribution by City</h2>
        <p className={styles['section-subtitle']}>
          Total salary aggregated per city (top {cityData.length} cities)
        </p>

        {cityData.length === 0 ? (
          <p className={styles['no-audit']}>No data available. Load employee data first.</p>
        ) : (
          <div className={styles['chart-container']} style={{ position: 'relative' }}>
            <svg width={chartWidth} height={chartHeight} role="img" aria-label="Salary distribution bar chart">
              {/* Y-Axis gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = padding.top + plotHeight * (1 - frac);
                const value = Math.round(maxSalary * frac);
                return (
                  <g key={frac}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="4,4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="Inter, sans-serif"
                    >
                      ₹{value >= 100000 ? `${(value / 1000).toFixed(0)}k` : value.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {cityData.map((d, i) => {
                const barHeight = (d.total / maxSalary) * plotHeight;
                const x = padding.left + (plotWidth / cityData.length) * i + (plotWidth / cityData.length - barWidth) / 2;
                const y = padding.top + plotHeight - barHeight;
                return (
                  <g key={d.city}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={4}
                      fill={barColors[i % barColors.length]}
                      opacity={hoveredBar === i ? 1 : 0.8}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{ transition: 'opacity 0.2s, y 0.3s, height 0.3s', cursor: 'pointer' }}
                    />
                    {/* Value on hover */}
                    {hoveredBar === i && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="11"
                        fontWeight="600"
                        fontFamily="Inter, sans-serif"
                      >
                        ₹{d.total >= 100000 ? `${(d.total / 1000).toFixed(1)}k` : d.total.toLocaleString()}
                      </text>
                    )}
                    {/* City label */}
                    <text
                      x={x + barWidth / 2}
                      y={padding.top + plotHeight + 16}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="Inter, sans-serif"
                      transform={`rotate(-35, ${x + barWidth / 2}, ${padding.top + plotHeight + 16})`}
                    >
                      {d.city.length > 10 ? d.city.slice(0, 10) + '…' : d.city}
                    </text>
                    {/* Count */}
                    <text
                      x={x + barWidth / 2}
                      y={padding.top + plotHeight + 40}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="Inter, sans-serif"
                    >
                      ({d.count})
                    </text>
                  </g>
                );
              })}

              {/* Axes */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + plotHeight}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
              <line
                x1={padding.left}
                y1={padding.top + plotHeight}
                x2={padding.left + plotWidth}
                y2={padding.top + plotHeight}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Map */}
      <div className={styles['map-section']}>
        <h2 className={styles['section-title']}>🗺️ City Distribution Map</h2>
        <p className={styles['section-subtitle']}>
          Employee cities plotted using a hardcoded coordinate lookup table
        </p>

        <div className={styles['map-wrapper']}>
          <MapContainer
            center={[30, 10]}
            zoom={2}
            style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {mapMarkers.map((marker) => (
              <CircleMarker
                key={marker.city}
                center={marker.coords}
                radius={Math.max(6, Math.min(20, marker.count * 3))}
                pathOptions={{
                  color: '#6366f1',
                  fillColor: '#8b5cf6',
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ color: '#1a1a2e', fontFamily: 'Inter, sans-serif' }}>
                    <strong>{marker.city}</strong><br />
                    Employees: {marker.count}<br />
                    Total Salary: ₹{marker.total.toLocaleString('en-IN')}<br />
                    Avg Salary: ₹{Math.round(marker.avg).toLocaleString('en-IN')}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
