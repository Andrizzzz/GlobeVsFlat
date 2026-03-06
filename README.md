# GlobeVsFlat

Interactive scientific web application for comparing spherical Earth and flat Earth models using real mathematical calculations, flight paths, and map projections.

This project provides a side-by-side comparison between:

🌍 3D Globe (CesiumJS)  
🧭 Azimuthal Equidistant Flat Map  
🗺 Mercator Projection  

It also includes distance calculations, flight route simulations, and Qibla direction to the Kaaba.

---

# Main Features

- 3D Globe visualization using CesiumJS
- Flat Earth map using Azimuthal Equidistant projection
- Mercator projection comparison
- 13 real flight routes across the Southern Hemisphere
- Distance comparison using mathematical models
- Qibla direction calculator using browser geolocation
- Custom Kaaba icon for Qibla direction
- Arabic (RTL) and English language support
- Dark / Light theme toggle
- Responsive layout for mobile and desktop
- Reset All button
- Projection comparison mode

---

# Technologies Used

Frontend

- React
- Vite
- TailwindCSS
- CesiumJS
- Leaflet
- react-i18next

Backend

- Node.js
- Express.js

---

# Mathematical Models

### Globe Model

- Earth radius: 6371 km
- Haversine distance formula
- Spherical initial bearing

### Flat Model

- Azimuthal Equidistant Projection
- Centered at the North Pole
- Euclidean distance in projected plane

### Mercator Projection

- EPSG:3857
- Used for visual comparison only

---

# Flight Routes Included

Sydney → Santiago  
Johannesburg → Sydney  
Santiago → Auckland  
Perth → Johannesburg  
Buenos Aires → Sydney  
Cape Town → Auckland  
São Paulo → Johannesburg  
Lima → Sydney  
Dubai → Santiago  
Santiago → Sydney  
Auckland → Cape Town  
Santiago → Johannesburg  
Rio de Janeiro → Sydney  

---

# Run the Project Locally

Install dependencies:

```bash
npm install
Start development server:

npm run dev
Environment Variables

Create a .env file:

VITE_CESIUM_TOKEN=your_cesium_token
Project Structure
client/
server/
shared/
script/

Main frontend components:

GlobeView.tsx
FlatMapView.tsx
MercatorView.tsx
ControlPanel.tsx
FlightsPanel.tsx
QiblaPanel.tsx
ComparisonTable.tsx
Author

Mustafa Hasan

License

MIT License
