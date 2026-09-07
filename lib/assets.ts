/// <reference types="vite/client" />
// Both Sites and GitHub Pages use Vite, which substitutes the configured base.
export const assetUrl = (name: string) => `${import.meta.env.BASE_URL}${name}`;
