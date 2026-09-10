import React from 'react';
import { AppLogo } from './AppLogo';
import { ActiveTab, UserProfile } from '../types';
import { Bell, Search, ShieldCheck, Home, Calendar, Users, ClipboardCheck, History, PieChart, Shield, User } from 'lucide-react';

interface NavbarHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadNotifCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalStudents: number;
  userProfile?: UserProfile;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadNotifCount,
  searchQuery,
  setSearchQuery,
  totalStudents,
  userProfile,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const avatarUrl =
    userProfile?.avatarUrl ||
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <button
          onClick={() => setActiveTab('home')}
          className="text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl p-1 -ml-1 transition-transform active:scale-98 cursor-pointer"
        >
          <AppLogo size="md" showLabel={true} />
        </button>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative hidden md:block w-56 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari murid, NIS, atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-800 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>

          {/* Date Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>{todayFormatted}</span>
          </div>

          {/* Total Students Counter */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{totalStudents} Murid</span>
          </div>

          {/* Cloud Sync Status Indicator */}
          <button
            onClick={() => setActiveTab('keamanan')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Sistem Tersimpan Aman di Cloud"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Tersimpan Aman</span>
          </button>

          {/* Notification Button */}
          <button
            onClick={() => setActiveTab('notifikasi')}
            className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none cursor-pointer"
            title="Notifikasi Real-time"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar Quick Button */}
          {userProfile && (
            <button
              onClick={() => setActiveTab('profil')}
              className="flex items-center gap-2 p-1 pl-1 pr-2.5 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer border border-slate-200/80"
              title={`Profil ${userProfile.name}`}
            >
              <img
                src={avatarUrl}
                alt={userProfile.name}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500/20"
              />
              <span className="hidden xl:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
                {userProfile.name.split(',')[0]}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

