import { PDFDashboardEnhanced } from './pdf-dashboard-enhanced';
import { PDFAnalyticsEngine } from './pdf-dashboard-analytics';

export interface VizConfig {
  width: number;
  height: number;
  theme: 'light' | 'dark';
  chartType: 'line' | 'bar' | 'area';
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  color: string;
  fill?: boolean;
}

export class PDFDashboardViz {
  private config: VizConfig;
  private dashboard: PDFDashboardEnhanced;
  private analytics: PDFAnalyticsEngine;
  private canvas: { width: number; height: number };

  constructor(config: Partial<VizConfig> = {}) {
    this.config = {
      width: 800,
      height: 400,
      theme: 'dark',
      chartType: 'line',
      ...config
    };
    this.dashboard = new PDFDashboardEnhanced();
    this.analytics = new PDFAnalyticsEngine();
    this.canvas = { width: this.config.width, height: this.config.height };
  }

  public generateThroughputChart(hours: number = 24): ChartData {
    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
      labels.push(time.getHours().toString().padStart(2, '0') + ':00');
      
      const start = new Date(time.getTime() - 60 * 60 * 1000);
      const throughput = this.dashboard.getThroughputForTimeWindow(start, time);
      data.push(throughput);
    }
    
    return {
      labels,
      datasets: [{
        label: 'Throughput (bytes/s)',
        data,
        color: this.config.theme === 'dark' ? '#4ade80' : '#16a34a',
        fill: true
      }]
    };
  }

  public generateFileCountChart(): ChartData {
    return {
      labels: ['Processed', 'Failed', 'Pending'],
      datasets: [{
        label: 'Files',
        data: [
          this.dashboard.getFilesInCategory('processed'),
          this.dashboard.getFilesInCategory('failed'),
          this.dashboard.getFilesInCategory('pending')
        ],
        color: this.config.theme === 'dark' ? '#60a5fa' : '#2563eb',
        fill: false
      }]
    };
  }

  public generateUptimeGauge(uptime: number): string {
    const radius = Math.min(this.config.width, this.config.height) * 0.4;
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    const angle = (uptime / 100) * Math.PI - (Math.PI / 2);
    
    const endX = centerX + radius * Math.cos(angle);
    const endY = centerY + radius * Math.sin(angle);
    
    return `
<svg width="${this.config.width}" height="${this.config.height}" viewBox="0 0 ${this.config.width} ${this.config.height}">
  <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#374151" stroke-width="20"/>
  <line x1="${centerX}" y1="${centerY}" x2="${endX}" y2="${endY}" stroke="#4ade80" stroke-width="4"/>
  <text x="${centerX}" y="${centerY + 50}" text-anchor="middle" fill="#e5e7eb" font-size="48">${uptime.toFixed(1)}%</text>
</svg>`;
  }

  public renderTable(headers: string[], rows: string[][]): string {
    const headerRow = headers.map(h => `<th style="padding:8px;border:1px solid #374151;background:#1f2937;color:#e5e7eb">${h}</th>`).join('');
    const bodyRows = rows.map(row => 
      `<tr>${row.map(cell => `<td style="padding:8px;border:1px solid #374151;color:#d1d5db">${cell}</td>`).join('')}</tr>`
    ).join('');
    
    return `
<table style="border-collapse:collapse;width:100%;font-family:monospace">
  <thead><tr>${headerRow}</tr></thead>
  <tbody>${bodyRows}</tbody>
</table>`;
  }

  public generateHTMLDashboard(): string {
    const report = this.analytics.generateReport();
    const throughput = this.generateThroughputChart();
    const fileCount = this.generateFileCountChart();
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PDF Dashboard</title>
  <style>
    body { font-family: monospace; background: #111827; color: #e5e7eb; padding: 20px; }
    .metric { background: #1f2937; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .label { color: #9ca3af; font-size: 0.875rem; }
    .value { color: #4ade80; font-size: 1.5rem; font-weight: bold; }
  </style>
</head>
<body>
  <h1>PDF Pipeline Dashboard</h1>
  <pre>${report}</pre>
  <div class="metric"><div class="label">Files Processed</div><div class="value">${fileCount.datasets[0].data[0]}</div></div>
</body>
</html>`;
  }
}
