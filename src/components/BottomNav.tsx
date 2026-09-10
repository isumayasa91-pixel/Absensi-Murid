import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { Home, ClipboardCheck, History, PieChart, Users, User, ShieldCheck } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userProfile?: UserProfile;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, userProfile }) => {
  const isStudent = userProfile?.userType === 'SISWA';

  const bottomItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = isStudent
    ? [
        { id: 'home', label: 'Beranda', icon: Home },
        { id: 'absensi', label: 'Presensi', icon: ClipboardCheck },
        { id: 'riwayat', label: 'Riwayat', icon: History },
        { id: 'murid', label: 'Biodata', icon: Users },
        { id: 'profil', label: 'Profil', icon: User },
      ]
    : [
        { id: 'home', label: 'Beranda', icon: Home },
        { id: 'absensi', label: 'Absensi', icon: ClipboardCheck },
        { id: 'riwayat', label: 'Riwayat', icon: History },
        { id: 'laporan', label: 'Laporan', icon: PieChart },
        { id: 'murid', label: 'Data Murid', icon: Users },
        { id: 'profil', label: 'Profil', icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex justify-around sm:justify-center sm:gap-6 items-center shadow-lg">
      {bottomItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-2xl transition-all cursor-pointer ${
              isActive
                ? 'text-blue-600 font-extrabold scale-105'
                : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-xs tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

