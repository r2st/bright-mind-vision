import { useEffect } from 'react';

/**
 * Custom hook to dynamically update favicon using SVG data URL
 */
export const useFavicon = (color = "#ffffff", size = 32, strokeWidth = 6) => {
  useEffect(() => {
    // Create SVG string for the favicon
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="BM favicon" shape-rendering="geometricPrecision">
        <title>BM Favicon</title>
        <g fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">
          <!-- B -->
          <path d="M16 14 L16 50" />
          <path d="M16 14 H28 Q36 14 28 24 H16" />
          <path d="M16 32 H30 Q38 32 30 50 H16" />
          <!-- M -->
          <path d="M36 50 L36 14 L46 30 L56 14 L56 50" />
        </g>
      </svg>
    `;

    // Create a data URL from the SVG
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    // Update the favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);

    // Cleanup function
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [color, size, strokeWidth]);
};
