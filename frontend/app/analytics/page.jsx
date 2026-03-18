"use client";

import React from 'react';

const Analytics = () => {
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-bold mb-4">📊 Analytics</h1>
      <p className="mb-2">Bienvenue sur la page d'analytique du tableau de bord IoT.</p>

      <div className="mt-6 p-4 border rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Vous trouverez ci-dessous les graphiques de température, de gaz, et la carte de géolocalisation des capteurs.
        </p>
      </div>

      {/* COURBE TEMPÉRATURE */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">🌡️ Température (Grafana)</h2>
        <iframe
          src="http://localhost:3002/d-solo/beknmr2mhzuv4b/temperature?orgId=1&from=1746201949695&to=1746202249695&timezone=browser&refresh=auto&panelId=1&__feature.dashboardSceneSolo"
          width="100%"
          height="400"
          frameBorder="0"
          className="rounded-lg shadow-lg"
        ></iframe>
      </div>

      {/* COURBE GAZ */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">💨 Gaz (Grafana)</h2>
        <iframe
          src="http://localhost:3002/d-solo/dekoxxa7nokcge/gaz?orgId=1&from=1746186169938&to=1746207769938&timezone=browser&refresh=auto&panelId=1&__feature.dashboardSceneSolo"
          width="100%"
          height="400"
          frameBorder="0"
          className="rounded-lg shadow-lg"
        ></iframe>
      </div>

      {/* MAP GÉOLOCALISATION */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">🗺️ Position des capteurs (GeoMap)</h2>
        <iframe
          src="http://localhost:3002/d-solo/aekofbyxy6whsa/new-dashboard?orgId=1&from=1746182258478&to=1746203858478&timezone=browser&refresh=auto&showCategory=Panel%20links&panelId=1&__feature.dashboardSceneSolo"
          width="100%"
          height="400"
          frameBorder="0"
          className="rounded-lg shadow-lg"
        ></iframe>
      </div>
    </div>
  );
};

export default Analytics;
