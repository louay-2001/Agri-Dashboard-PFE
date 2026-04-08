'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import MapComponent from '../components/MapComponent';
import AlarmConsole from '../components/AlarmConsole';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { acknowledgeAlert, DASHBOARD_DATA_UPDATED_EVENT, dispatchDashboardDataUpdated, getDashboardSummary, signin } from '../lib/api';

const splitterStyles = {
  vertical: "w-2 bg-neutral-300 dark:bg-neutral-700 cursor-col-resize hover:bg-blue-500 flex-shrink-0",
  horizontal: "h-2 bg-neutral-300 dark:bg-neutral-700 cursor-row-resize hover:bg-blue-500 flex-shrink-0",
};

const HORIZONTAL_SPLITTER_HEIGHT = 8;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(160);
  const [alarmConsoleHeight, setAlarmConsoleHeight] = useState(150);
  const [isResizingVertical, setIsResizingVertical] = useState(false);
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const mapContainerWrapperRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setCheckedAuth(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const refreshDashboard = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      return;
    }

    try {
      setDashboardLoading(true);
      setDashboardError('');
      const summary = await getDashboardSummary();
      setDashboardSummary(summary);
    } catch (err) {
      setDashboardError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Impossible de charger les donnees du dashboard'
      );
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    setLayoutReady(true);
    const checkSize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setDashboardSummary(null);
      setDashboardLoading(false);
      return;
    }

    refreshDashboard();
    const intervalId = window.setInterval(refreshDashboard, 10000);
    const handleDashboardDataUpdated = () => {
      refreshDashboard();
    };

    window.addEventListener(DASHBOARD_DATA_UPDATED_EVENT, handleDashboardDataUpdated);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(DASHBOARD_DATA_UPDATED_EVENT, handleDashboardDataUpdated);
    };
  }, [isAuthenticated, refreshDashboard]);

  const handleVerticalResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizingVertical(true);
  }, []);

  const handleVerticalResizeMove = useCallback((e) => {
    if (!isResizingVertical) return;
    const minWidth = 120;
    const newWidth = Math.max(minWidth, Math.min(e.clientX, window.innerWidth * 0.5));
    setSidebarWidth(newWidth);
  }, [isResizingVertical]);

  const handleVerticalResizeEnd = useCallback(() => {
    setIsResizingVertical(false);
  }, []);

  const handleHorizontalResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizingHorizontal(true);
  }, []);

  const handleHorizontalResizeMove = useCallback((e) => {
    if (!isResizingHorizontal || !mainContentRef.current) return;
    const mainContentRect = mainContentRef.current.getBoundingClientRect();
    const minMapHeight = 100;
    const minConsoleHeight = 80;
    const potentialNewHeight = mainContentRect.bottom - e.clientY - HORIZONTAL_SPLITTER_HEIGHT / 2;
    const newHeight = Math.max(
      minConsoleHeight,
      Math.min(potentialNewHeight, mainContentRect.height - minMapHeight - HORIZONTAL_SPLITTER_HEIGHT)
    );
    setAlarmConsoleHeight(newHeight);
  }, [isResizingHorizontal]);

  const handleHorizontalResizeEnd = useCallback(() => {
    setIsResizingHorizontal(false);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingVertical) handleVerticalResizeMove(e);
      if (isResizingHorizontal) handleHorizontalResizeMove(e);
    };

    const handleMouseUp = () => {
      if (isResizingVertical) handleVerticalResizeEnd();
      if (isResizingHorizontal) handleHorizontalResizeEnd();
    };

    if (isResizingVertical || isResizingHorizontal) {
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [
    isResizingVertical,
    handleVerticalResizeMove,
    handleVerticalResizeEnd,
    isResizingHorizontal,
    handleHorizontalResizeMove,
    handleHorizontalResizeEnd
  ]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await signin({ name, password });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || name);
        setIsAuthenticated(true);
      } else {
        setError(data.message || data.error || 'Token non recu depuis le serveur');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Erreur de connexion au serveur'
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setName('');
    setPassword('');
    setDashboardSummary(null);
  };

  const handleAcknowledgeAlert = useCallback(async (alertId) => {
    await acknowledgeAlert(alertId);
    dispatchDashboardDataUpdated();
  }, []);

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6"
        >
          <div className="flex justify-center">
            <Image
              src="/images/logo1.png"
              alt="Logo Dashboard IoT"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>

          <h2 className="text-2xl font-bold text-center text-neutral-800">
            Dashboard IoT - Connexion
          </h2>

          <input
            type="text"
            placeholder="Nom d'utilisateur"
            className="w-full px-4 py-2 border border-neutral-300 text-neutral-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-2 border border-neutral-300 text-neutral-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <Sidebar
        ref={sidebarRef}
        width={sidebarWidth}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {sidebarOpen && (
        <div
          className={splitterStyles.vertical}
          onMouseDown={handleVerticalResizeStart}
          aria-hidden="true"
        />
      )}

      <div ref={mainContentRef} className="flex flex-col flex-grow min-h-0 overflow-hidden">
        <div ref={mapContainerWrapperRef} className="relative flex-grow min-h-0 overflow-hidden">
          <MapComponent
            layoutReady={layoutReady}
            markers={dashboardSummary?.markers || []}
          />
        </div>

        <div
          className={`${splitterStyles.horizontal} flex-shrink-0`}
          onMouseDown={handleHorizontalResizeStart}
          aria-hidden="true"
        />

        <div
          style={{ height: `${alarmConsoleHeight}px` }}
          className="overflow-y-auto flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700"
        >
          <AlarmConsole
            alerts={dashboardSummary?.alerts || []}
            loading={dashboardLoading}
            error={dashboardError}
            onAcknowledge={handleAcknowledgeAlert}
          />
        </div>
      </div>

      <div className="w-72 flex-shrink-0 overflow-y-auto border-l border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        <RightPanel
          summary={dashboardSummary}
          loading={dashboardLoading}
          error={dashboardError}
        />
      </div>

      <div className="fixed top-4 left-4 z-50 flex justify-center items-center">
        <img
          src="/images/logo1.png"
          alt="Logo Dashboard IoT"
          className="w-24 h-24 rounded-full shadow-lg bg-white dark:bg-neutral-800 p-1"
        />
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-end">
        <ThemeSwitcher
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        />
      </div>

      {!sidebarOpen && (
        <div className="fixed top-20 left-4 z-[60] md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded bg-neutral-200/80 dark:bg-neutral-800/80 backdrop-blur-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open Menu"
          >
            <i className="fas fa-bars fa-lg" aria-hidden="true"></i>
          </button>
        </div>
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
