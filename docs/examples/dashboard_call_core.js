/**
 * DASHBOARD INTEGRATION EXAMPLE
 * 
 * This file demonstrates how junior developers working on Module 7 (Dashboard)
 * should call core functions from their UI components.
 * 
 * ⚠️ This is a REFERENCE EXAMPLE ONLY - not part of the actual application.
 * 
 * Location: You work in apps/dashboard/src/
 * You import from: "../core"
 */

import React, { useState, useEffect } from "react";
import {
  getChartData,
  aggregateTimeSeries,
  prepareClusterData,
  paginate,
  applyFilters,
} from "../core";

/**
 * EXAMPLE 1: Chart Visualization with Time-Series Aggregation
 */
function MetricsChart() {
  const [chartData, setChartData] = useState(null);
  const [timeWindow, setTimeWindow] = useState(3600000); // 1 hour in ms

  useEffect(() => {
    const fetchAndTransform = async () => {
      // Fetch raw data from backend API
      const response = await fetch("/api/metrics?range=24h");
      const rawData = await response.json();
      // rawData format: [{ timestamp: 1234567890, value: 42, region: "US" }, ...]

      // Transform for charting using core function
      const transformed = getChartData(rawData, "timestamp", "value", "region");

      // Aggregate each series to reduce data points
      const aggregated = transformed.series.map((s) => ({
        ...s,
        points: aggregateTimeSeries(s.points, timeWindow),
      }));

      setChartData({ ...transformed, series: aggregated });
    };

    fetchAndTransform();
  }, [timeWindow]);

  return (
    <div>
      <select onChange={(e) => setTimeWindow(Number(e.target.value))}>
        <option value={60000}>1 minute</option>
        <option value={3600000}>1 hour</option>
        <option value={86400000}>1 day</option>
      </select>

      {chartData && (
        <div>
          <h3>Metrics by Region</h3>
          {/* Pass chartData.series to your chart library (Chart.js, Recharts, etc.) */}
          <pre>{JSON.stringify(chartData.series, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * EXAMPLE 2: Map with Geospatial Clustering
 */
function LocationMap() {
  const [clusters, setClusters] = useState([]);
  const [gridSize, setGridSize] = useState(0.1); // degrees

  useEffect(() => {
    const fetchAndCluster = async () => {
      // Fetch location data from API
      const response = await fetch("/api/locations");
      const locations = await response.json();
      // locations format: [{ lat: 40.7128, lng: -74.0060, value: 10 }, ...]

      // Prepare clusters using core function
      const clustered = prepareClusterData(locations, gridSize);

      setClusters(clustered);
    };

    fetchAndCluster();
  }, [gridSize]);

  return (
    <div>
      <label>
        Cluster Size:
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
        />
        {gridSize.toFixed(2)}°
      </label>

      {/* Render clusters on your map library (Leaflet, Google Maps, Mapbox) */}
      <div>
        <h3>Location Clusters</h3>
        {clusters.map((c, i) => (
          <div key={i}>
            Cluster {i + 1}: ({c.lat.toFixed(2)}, {c.lng.toFixed(2)}) - {c.count} points
            {c.sum && `, total: ${c.sum}`}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * EXAMPLE 3: Paginated Table with Filters
 */
function ReportsTable() {
  const [allReports, setAllReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState([]);
  const pageSize = 20;

  useEffect(() => {
    // Fetch all reports from API
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => setAllReports(data));
  }, []);

  // Apply filters first
  const filtered = applyFilters(allReports, filters);

  // Then paginate
  const paginatedData = paginate(filtered, currentPage, pageSize);

  const addFilter = (field, op, value) => {
    setFilters([...filters, { field, op, value }]);
    setCurrentPage(1); // Reset to first page
  };

  const clearFilters = () => {
    setFilters([]);
    setCurrentPage(1);
  };

  return (
    <div>
      <h3>Reports</h3>

      {/* Filter Controls */}
      <div>
        <button onClick={() => addFilter("status", "eq", "active")}>
          Show Active Only
        </button>
        <button onClick={() => addFilter("score", "gte", 70)}>
          Score ≥ 70
        </button>
        <button onClick={() => addFilter("region", "in", ["US", "CA"])}>
          US/CA Only
        </button>
        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Score</th>
            <th>Region</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.items.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.status}</td>
              <td>{report.score}</td>
              <td>{report.region}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {Math.ceil(paginatedData.total / pageSize)}
        </span>
        <button
          disabled={currentPage * pageSize >= paginatedData.total}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
        <span>
          Showing {paginatedData.items.length} of {paginatedData.total} reports
        </span>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 4: Combined Workflow
 */
function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    // Fetch from API
    fetch("/api/dashboard/data")
      .then((r) => r.json())
      .then((data) => {
        setRawData(data);

        // Apply filters
        const filtered = applyFilters(data, [
          { field: "active", op: "eq", value: true },
        ]);

        // Paginate
        const paginated = paginate(filtered, 1, 50);

        setDisplayData(paginated.items);
      });
  }, []);

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <MetricsChart />
      <LocationMap />
      <ReportsTable />
    </div>
  );
}

/**
 * KEY TAKEAWAYS FOR JUNIOR DEVELOPERS:
 * 
 * 1. Always import from "../core" for data transformations
 * 2. Fetch raw data from backend API first
 * 3. Transform/filter/paginate using core functions
 * 4. Pass transformed data to UI components/charts
 * 5. Never implement data processing logic in src/
 * 
 * WRONG APPROACH (DON'T DO THIS):
 * 
 * function MyChart() {
 *   const [data, setData] = useState([]);
 * 
 *   useEffect(() => {
 *     fetch("/api/metrics").then(r => r.json()).then(raw => {
 *       // ❌ DON'T do data transformation in UI
 *       const grouped = {};
 *       for (const item of raw) {
 *         const key = item.region;
 *         if (!grouped[key]) grouped[key] = [];
 *         grouped[key].push({ x: item.time, y: item.value });
 *       }
 *       setData(grouped);
 *     });
 *   }, []);
 * }
 * 
 * CORRECT APPROACH (DO THIS):
 * 
 * import { getChartData } from "../core";
 * 
 * function MyChart() {
 *   const [data, setData] = useState(null);
 * 
 *   useEffect(() => {
 *     fetch("/api/metrics").then(r => r.json()).then(raw => {
 *       const chartData = getChartData(raw, "time", "value", "region");
 *       setData(chartData);
 *     });
 *   }, []);
 * }
 */

export { MetricsChart, LocationMap, ReportsTable, Dashboard };
