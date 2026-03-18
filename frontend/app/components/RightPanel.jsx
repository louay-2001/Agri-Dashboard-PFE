'use client';

import React, { useEffect, useState } from 'react';
import {
  getAllAlerts,
  getAllGateways,
  getAllNodes,
  getAllSensors
} from '../lib/api';

function RightPanel() {
  const [username, setUsername] = useState('');
  const [hasToken, setHasToken] = useState(false);

  const [alertsCount, setAlertsCount] = useState(0);
  const [gatewaysCount, setGatewaysCount] = useState(0);
  const [nodesCount, setNodesCount] = useState(0);
  const [sensorsCount, setSensorsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [alertsError, setAlertsError] = useState('');
  const [gatewaysError, setGatewaysError] = useState('');
  const [nodesError, setNodesError] = useState('');
  const [sensorsError, setSensorsError] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (storedUsername) {
      setUsername(storedUsername);
    }

    setHasToken(!!token);

    const fetchStats = async () => {
      setLoading(true);

      try {
        const alerts = await getAllAlerts();
        setAlertsCount(Array.isArray(alerts) ? alerts.length : 0);
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error);
        setAlertsError('Impossible de charger les alertes');
      }

      try {
        const gateways = await getAllGateways();
        setGatewaysCount(Array.isArray(gateways) ? gateways.length : 0);
      } catch (error) {
        console.error('Erreur lors du chargement des gateways:', error);
        setGatewaysError('Impossible de charger les gateways');
      }

      try {
        const nodes = await getAllNodes();
        setNodesCount(Array.isArray(nodes) ? nodes.length : 0);
      } catch (error) {
        console.error('Erreur lors du chargement des nodes:', error);
        setNodesError('Impossible de charger les nodes');
      }

      try {
        const sensors = await getAllSensors();
        setSensorsCount(Array.isArray(sensors) ? sensors.length : 0);
      } catch (error) {
        console.error('Erreur lors du chargement des sensors:', error);
        setSensorsError('Impossible de charger les sensors');
      }

      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 mb-2">
          System Information
        </h3>

        <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-2">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            User:{' '}
            <span className="font-medium text-neutral-800 dark:text-neutral-100">
              {username || 'Unknown'}
            </span>
          </p>

          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Session Status:{' '}
            <span className={`font-medium ${hasToken ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {hasToken ? 'Connected' : 'Disconnected'}
            </span>
          </p>

          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            JWT Token:{' '}
            <span className={`font-medium ${hasToken ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {hasToken ? 'Available' : 'Missing'}
            </span>
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 mb-2">
          Live System Stats
        </h3>

        <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Alerts</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {loading ? 'Loading...' : alertsCount}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Gateways</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {loading ? 'Loading...' : gatewaysCount}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Nodes</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {loading ? 'Loading...' : nodesCount}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Sensors</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {loading ? 'Loading...' : sensorsCount}
            </span>
          </div>

          {alertsError && (
            <p className="text-xs text-red-600 dark:text-red-400">{alertsError}</p>
          )}
          {gatewaysError && (
            <p className="text-xs text-red-600 dark:text-red-400">{gatewaysError}</p>
          )}
          {nodesError && (
            <p className="text-xs text-red-600 dark:text-red-400">{nodesError}</p>
          )}
          {sensorsError && (
            <p className="text-xs text-red-600 dark:text-red-400">{sensorsError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightPanel;