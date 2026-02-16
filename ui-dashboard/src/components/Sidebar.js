import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GitPullRequest,
  BarChart3,
  Bot,
  Settings,
  Leaf,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'emerald' },
    { id: 'optimizations', label: 'Optimizations', icon: GitPullRequest, color: 'blue' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'purple' },
    { id: 'agents', label: 'Agents', icon: Bot, color: 'orange' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' },
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        hover: 'hover:bg-emerald-50 hover:text-emerald-600',
        active: 'bg-emerald-600 text-white',
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-50 hover:text-blue-600',
        active: 'bg-blue-600 text-white',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-50 hover:text-purple-600',
        active: 'bg-purple-600 text-white',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        hover: 'hover:bg-orange-50 hover:text-orange-600',
        active: 'bg-orange-600 text-white',
      },
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        hover: 'hover:bg-gray-50 hover:text-gray-600',
        active: 'bg-gray-600 text-white',
      },
    };
    return colors[color];
  };

  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-800">Green CI</h1>
            <p className="text-xs text-gray-500">Optimizer</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const colors = getColorClasses(item.color, isActive);
            
            return (
              <motion.li
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? colors.active + ' shadow-lg shadow-' + item.color + '-200'
                      : 'text-gray-600 hover:' + colors.hover
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-100 font-medium">AGENT STATUS</span>
          </div>
          <p className="text-white text-sm font-medium">All systems operational</p>
          <p className="text-emerald-200 text-xs mt-1">Monitoring 5 projects</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;