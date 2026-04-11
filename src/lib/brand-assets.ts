// Dobeu Brand Assets - Data URIs
// These can be used as 'src' for img tags or for download links

// Primary Logo: White Body, Yellow Accent, Transparent Face (Best on Dark Backgrounds)
const LOGO_PRIMARY_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="10" height="32" rx="5" fill="#EAB308" /><path fill-rule="evenodd" clip-rule="evenodd" d="M18 4H20C28.8366 4 36 11.1634 36 20C36 28.8366 28.8366 36 20 36H18V4ZM24.5 17.5C25.3284 17.5 26 16.8284 26 16C26 15.1716 25.3284 14.5 24.5 14.5C23.6716 14.5 23 15.1716 23 16C23 16.8284 23.6716 17.5 24.5 17.5ZM29.5 17.5C30.3284 17.5 31 16.8284 31 16C31 15.1716 30.3284 14.5 29.5 14.5C28.6716 14.5 28 15.1716 28 16C28 16.8284 28.6716 17.5 29.5 17.5ZM24 24C24 24 26 26 30 24C30 24.5 29 27 27 27C25 27 24 24.5 24 24Z" fill="#FFFFFF"/></svg>`;

// Reverse Logo: Black Body, Yellow Accent, Transparent Face (Best on Light Backgrounds)
const LOGO_REVERSE_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="10" height="32" rx="5" fill="#EAB308" /><path fill-rule="evenodd" clip-rule="evenodd" d="M18 4H20C28.8366 4 36 11.1634 36 20C36 28.8366 28.8366 36 20 36H18V4ZM24.5 17.5C25.3284 17.5 26 16.8284 26 16C26 15.1716 25.3284 14.5 24.5 14.5C23.6716 14.5 23 15.1716 23 16C23 16.8284 23.6716 17.5 24.5 17.5ZM29.5 17.5C30.3284 17.5 31 16.8284 31 16C31 15.1716 30.3284 14.5 29.5 14.5C28.6716 14.5 28 15.1716 28 16C28 16.8284 28.6716 17.5 29.5 17.5ZM24 24C24 24 26 26 30 24C30 24.5 29 27 27 27C25 27 24 24.5 24 24Z" fill="#000000"/></svg>`;

// Helper to convert SVG string to Data URI
const svgToDataUri = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;

export const BRAND_ASSETS = {
  logo: {
    primary: svgToDataUri(LOGO_PRIMARY_SVG),
    reverse: svgToDataUri(LOGO_REVERSE_SVG),
  },
};
