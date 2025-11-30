import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const VersionCheck = () => {
    const [newVersionAvailable, setNewVersionAvailable] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        // Check version immediately on mount
        checkVersion();

        // Check every 5 minutes
        const interval = setInterval(checkVersion, 5 * 60 * 1000);

        // Check when window regains focus
        window.addEventListener('focus', checkVersion);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkVersion);
        };
    }, []);

    const checkVersion = async () => {
        if (checking) return;
        setChecking(true);

        try {
            // Add timestamp to prevent caching of version.json itself
            const response = await fetch(`/version.json?t=${new Date().getTime()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) return;

            const data = await response.json();
            const currentVersion = localStorage.getItem('app_version');

            if (currentVersion && currentVersion !== data.version) {
                setNewVersionAvailable(true);
            }

            // Update local storage with latest version
            localStorage.setItem('app_version', data.version);
        } catch (error) {
            console.error('Failed to check version:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleRefresh = () => {
        // Unregister service workers to force update
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    registration.unregister();
                }
                window.location.reload(true);
            });
        } else {
            window.location.reload(true);
        }
    };

    if (!newVersionAvailable) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-900 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center justify-between animate-slide-up" dir="rtl">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <RefreshCw className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">تحديث جديد متوفر</h4>
                    <p className="text-xs text-blue-200">نسخة جديدة من الموقع متاحة</p>
                </div>
            </div>
            <button
                onClick={handleRefresh}
                className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
            >
                تحديث الآن
            </button>
        </div>
    );
};

export default VersionCheck;
