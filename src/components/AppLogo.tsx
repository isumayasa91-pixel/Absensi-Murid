import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'md', showLabel = false }) => {
  const dimensions = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-24 h-24 rounded-[2rem]',
  }[size];

  const iconScale = {
    sm: 'scale-[0.65]',
    md: 'scale-90',
    lg: 'scale-125',
    xl: 'scale-[1.8]',
  }[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative ${dimensions} bg-gradient-to-b from-[#2870ED] via-[#1E60E2] to-[#124FB8] flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 transition-transform hover:scale-105 overflow-hidden`}
        id="app-main-logo"
      >
        {/* Subtle inner highlight glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none" />

        {/* Custom SVG replicating Image 1 precisely */}
        <div className={`relative flex items-center justify-center ${iconScale}`}>
          <svg
            width="38"
            height="38"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            {/* Clipboard Body Outer Boundary */}
            <path
              d="M26 22C26 18.6863 28.6863 16 32 16H68C71.3137 16 74 18.6863 74 22V82C74 85.3137 71.3137 88 68 88H32C28.6863 88 26 85.3137 26 82V22Z"
              stroke="white"
              strokeWidth="7"
              strokeLinejoin="round"
            />

            {/* Top Clipboard Clip */}
            <path
              d="M42 16V13C42 10.7909 43.7909 9 46 9H54C56.2091 9 58 10.7909 58 13V16"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="50" cy="13" r="3" fill="#124FB8" />

            {/* User Avatar Silhouette */}
            {/* Head */}
            <circle cx="50" cy="38" r="10" fill="white" />
            {/* Body / Shoulders */}
            <path
              d="M34 59C34 51.268 41.1634 46 50 46C58.8366 46 66 51.268 66 59V61H34V59Z"
              fill="white"
            />

            {/* Document Lines */}
            <rect x="36" y="68" width="28" height="5" rx="2.5" fill="white" />
            <rect x="36" y="78" width="18" height="5" rx="2.5" fill="white" fillOpacity="0.85" />

            {/* Bottom Right Green Checkmark Badge */}
            <circle cx="70" cy="70" r="19" fill="#10B981" stroke="#124FB8" strokeWidth="4" />
            <path
              d="M60 70L67 77L80 62"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
            Absensi<span className="text-blue-600">Murid</span>
          </span>
          <span className="text-xs font-medium text-slate-500 mt-1">
            Catat Kehadiran, Laporan & Data
          </span>
        </div>
      )}
    </div>
  );
};

// Feature Icon components matching Image 2 squircle design exactly
export interface FeatureIconProps {
  type: 'absensi' | 'riwayat' | 'laporan' | 'murid' | 'notifikasi' | 'keamanan';
  size?: 'sm' | 'md' | 'lg';
}

export const FeatureSquircleIcon: React.FC<FeatureIconProps> = ({ type, size = 'md' }) => {
  const containerSize = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-18 h-18 rounded-[1.25rem]',
  }[size];

  const svgScale = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  switch (type) {
    case 'absensi':
      // Vibrant Blue Squircle with user avatar + checkmark
      return (
        <div className={`${containerSize} bg-gradient-to-b from-[#2E82FE] to-[#1463E9] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0`}>
          <svg className={svgScale} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill="white" stroke="none" />
            <circle cx="9" cy="7" r="4" fill="white" stroke="none" />
            <polyline points="15 11 17 13 22 8" stroke="white" strokeWidth="2.5" />
          </svg>
        </div>
      );

    case 'riwayat':
      // Emerald Green Squircle with Document List Check
      return (
        <div className={`${containerSize} bg-gradient-to-b from-[#10B981] to-[#059669] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0`}>
          <svg className={svgScale} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="white" stroke="none" />
            <polyline points="14 2 14 8 20 8" fill="none" stroke="#059669" strokeWidth="2" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="8" y1="16" x2="16" y2="16" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="8" y1="8" x2="11" y2="8" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'laporan':
      // Indigo/Purple Squircle with Pie Chart
      return (
        <div className={`${containerSize} bg-gradient-to-b from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0`}>
          <svg className={svgScale} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" fill="white" stroke="none" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" fill="white" stroke="#4F46E5" strokeWidth="1" />
          </svg>
        </div>
      );

    case 'murid':
      // Warm Orange Squircle with Student Group
      return (
        <div className={`${containerSize} bg-gradient-to-b from-[#F97316] to-[#EA580C] flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0`}>
          <svg className={svgScale} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-3-3.87" fill="white" stroke="none" />
            <path d="M9 21v-2a4 4 0 0 0-4-4H3a4 4 0 0 0-4 4v2" fill="white" stroke="none" />
            <circle cx="7" cy="7" r="4" fill="white" stroke="none" />
            <circle cx="15" cy="7" r="3" fill="white" stroke="none" />
          </svg>
        </div>
      );

    case 'notifikasi':
      // Teal/Cyan Squircle with Bell Icon
      return (
        <div className={`${containerSize} bg-gradient-to-b from-[#0D9488] to-[#0F766E] flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0`}>
          <svg className={svgScale} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="white" stroke="none" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2.5" />
          </svg>
        </div>
      );

    case 'keamanan':
      // Royal Deep Blue Squircle with Shield + User Silhouette
      return (
        <div className={`${containerSize} bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0`}>
          <svg className={svgScale} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="white" stroke="none" />
            <circle cx="12" cy="10" r="2.5" fill="#1D4ED8" />
            <path d="M8.5 16c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" fill="#1D4ED8" />
          </svg>
        </div>
      );

    default:
      return null;
  }
};
