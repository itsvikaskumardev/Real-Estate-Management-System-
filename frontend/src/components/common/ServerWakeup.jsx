import React, { useState, useEffect } from "react";
import { FaSpinner, FaServer } from "react-icons/fa";
import API_URL from "../../config";

const ServerWakeup = () => {
  const [isAwake, setIsAwake] = useState(false);
  const [dots, setDots] = useState("");
  
  // Extract base URL for the health check (remove /api if present, or just use the root)
  const healthCheckUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '/health') : `${API_URL}/health`;

  useEffect(() => {
    // Animate dots for "Waking up server..."
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const response = await fetch(healthCheckUrl);
        if (response.ok) {
          if (isMounted) setIsAwake(true);
          return;
        }
      } catch (error) {
        // Backend is probably still sleeping/starting
      }

      // If not awake, check again in 3 seconds
      if (isMounted) {
        timeoutId = setTimeout(checkHealth, 3000);
      }
    };

    // Initial check
    checkHealth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [healthCheckUrl]);

  if (isAwake) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center max-w-md p-8 text-center bg-white shadow-2xl rounded-2xl border border-gray-100">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
          <div className="relative flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-full shadow-lg">
            <FaServer size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Starting Server{dots}
        </h2>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          Please wait a moment while we wake up the backend services. Since we use a free-tier hosting service, this might take up to a minute.
        </p>

        <div className="flex items-center justify-center space-x-2 text-emerald-500">
          <FaSpinner className="animate-spin" size={20} />
          <span className="font-medium text-sm">Connecting...</span>
        </div>
      </div>
    </div>
  );
};

export default ServerWakeup;
