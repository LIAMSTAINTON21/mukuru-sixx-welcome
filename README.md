# Mukuru welcome page (counted) — venue-generic

Static thank-you page shown (via QR code) to customers who sign up to Mukuru at a partner venue. No venue name appears anywhere, so the same page and printed QR work at any bar.

- Served by GitHub Pages from the `main` branch, root folder. No build step.
- To change copy: edit `index.html`, commit and push. The live page updates within a minute or two.
- Pint card carries a 15-minute claim countdown (`data-minutes` on `#claim` in `index.html`).
- Counter: see `stats.html` (not linked from the page). Keys: `qr-scans` for opens from the printed QR (`?s=qr`), `direct` for typed or shared links.
- The page validates nothing and is not a voucher; staff handle sign-up checks and pint distribution.
