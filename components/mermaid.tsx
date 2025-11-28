'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

/**
 * Sanitize mermaid chart syntax to fix common issues from AI-generated content
 * - Escapes parentheses in edge labels by wrapping in quotes
 * - Example: |start()| becomes |"start()"|
 */
function sanitizeMermaidChart(chart: string): string {
  // Fix edge labels containing parentheses: |label()| -> |"label()"|
  // Match |...| that contains () and isn't already quoted
  return chart.replace(/\|([^|"]*\([^|]*\)[^|"]*)\|/g, '|"$1"|');
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return;

      try {
        // Generate unique ID for this chart
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

        // Unescape literal \n and \t to actual newlines/tabs
        let processedChart = chart
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .trim();

        // Sanitize common syntax issues
        processedChart = sanitizeMermaidChart(processedChart);

        const { svg } = await mermaid.render(id, processedChart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    // Show diagram as code block when rendering fails
    const displayChart = chart
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .trim();

    return (
      <div className="my-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">Diagram (view as code):</p>
        <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
          {displayChart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
