// app/devices/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link'; // <-- Import Link
import DeviceTabs from '../components/DeviceTabs';
import GatewayForm from '../components/GatewayForm';
import NodeForm from '../components/NodeForm';
import SensorForm from '../components/SensorForm';
import { Button } from '../components/ui/button'; // <-- Import Button

export default function DevicesPage() {
  const [activeTab, setActiveTab] = useState('Gateway'); // Default tab

  const renderActiveForm = () => {
    switch (activeTab) {
      case 'Gateway':
        return <GatewayForm />;
      case 'Node':
        return <NodeForm />;
      case 'Sensor':
        return <SensorForm />;
      default:
        return <div className="p-4 text-center text-neutral-500">Select a device type above.</div>;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
      {/* Header Section with Title and Back Button */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-y-2"> {/* Added flex-wrap and gap-y */}
        <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
          Device Management
        </h1>
        {/* Back Button using Link */}
        <Link href="/dashboard">
            <Button variant="outline" size="sm">
                {/* Optional Icon: Requires Font Awesome setup */}
                <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
                Back to Dashboard
            </Button>
        </Link>
      </div>

      <DeviceTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {renderActiveForm()}
      </div>
    </div>
  );
}