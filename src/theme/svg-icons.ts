// Raw SVG markup, copied verbatim from the provided design assets
// (../../../assets/mymeal_separate_svg_assets/*.svg at the repo root).
// Kept as plain strings (rendered via react-native-svg's SvgXml) rather
// than imported .svg files, so no Metro SVG-transformer config is
// needed - these just need the react-native-svg runtime.

export const CHEF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#FFE08A"/><path d="M18 34a10 10 0 0 1-2-6 9 9 0 0 1 14-7 10 10 0 0 1 18 6 9 9 0 0 1-2 7v12H18Z" fill="#FFFFFF" stroke="#FFC928" stroke-width="4" stroke-linejoin="round"/><path d="M19 39h26M21 48h22" fill="none" stroke="#FFC928" stroke-width="4" stroke-linecap="round"/></svg>`;

export const MENU_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="#2E7D5B" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></g></svg>`;

export const EDIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="#2E7D5B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7"/><path d="m15 5 4 4M7 16l1-.2 10-10a2.1 2.1 0 0 0-3-3L5 13.8 4.8 16z"/></g></svg>`;

export const SETTINGS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm9 4.8v-2.6l-2.1-.7a7.4 7.4 0 0 0-.7-1.6l1-2-1.9-1.9-2 1a7.4 7.4 0 0 0-1.6-.7L13 2.7h-2.6l-.7 2.1a7.4 7.4 0 0 0-1.6.7l-2-1-1.9 1.9 1 2a7.4 7.4 0 0 0-.7 1.6l-2.1.7v2.6l2.1.7a7.4 7.4 0 0 0 .7 1.6l-1 2 1.9 1.9 2-1a7.4 7.4 0 0 0 1.6.7l.7 2.1H13l.7-2.1a7.4 7.4 0 0 0 1.6-.7l2 1 1.9-1.9-1-2a7.4 7.4 0 0 0 .7-1.6Z" fill="none" stroke="#2E7D5B" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

export const CAMERA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="#2E7D5B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3l1.5-2h7L17 7h3a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 7Z"/><circle cx="12" cy="13" r="4"/></g></svg>`;

export const MIC_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="#2E7D5B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/></g></svg>`;

export const SEND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="#2E7D5B"/><path d="M24 34V14m-8 8 8-8 8 8" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
