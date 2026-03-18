// c:\Dashboard\frontend\app\layout.js
import './globals.css'; // Tailwind base/components/utilities included here
import localFont from 'next/font/local';
import '@fortawesome/fontawesome-free/css/all.css'; // Font Awesome
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css'; // <-- IMPORT LEAFLET CSS HERE (CRITICAL)

const inter = localFont({
  src: [
    // Path relative to layout.js (app/layout.js -> ../public/...)
    { path: '../public/fonts/static/Inter_18pt-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/static/Inter_18pt-SemiBold.ttf', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-inter', // Optional
});

export const metadata = {
    title: 'IoT Platform Frontend',
    description: 'Modern IoT Dashboard',
};

export default function RootLayout({ children }) { // Destructure children directly
  return (
    <html lang="en" className="h-full">
      {/* No <head> needed here; Next.js handles metadata and font links */}
      <body className={`${inter.variable ?? ''} font-sans bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 h-full`}> {/* Use variable or className */}
        {children}
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};