import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationPopover({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onNotificationClick,
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ENTRY' | 'ANOMALY'

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'ENTRY') return item.type === 'ENTRY';
    if (activeFilter === 'ANOMALY') return item.type === 'ANOMALY';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleItemClick = (item) => {
    if (onNotificationClick) {
      onNotificationClick(item);
    }
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ANOMALY':
        return 'warning';
      case 'ENTRY':
        return 'directions_car';
      case 'EXIT':
        return 'logout';
      default:
        return 'notifications';
    }
  };

  const getIconColors = (type, severity) => {
    if (type === 'ANOMALY' || severity === 'CRITICAL' || severity === 'critical') {
      return 'bg-red-500/10 text-red-500 border border-red-500/30';
    }
    if (type === 'ENTRY') {
      return 'bg-sky-500/10 text-sky-500 border border-sky-500/30';
    }
    if (type === 'EXIT') {
      return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30';
    }
    return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
  };

  return (
    <div
      className="notification-popover absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] bg-[#141b22] border border-[#2d3a47] rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-200 animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Popover Header */}
      <div className="notification-popover-header px-4 py-3.5 border-b border-[#242f3b] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[19px] text-[#7ad0ff]">notifications_active</span>
          <h3 className="font-semibold text-sm text-white notification-title">
            {t('notification.title', 'Notifikasi Sistem')}
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ea580c] text-white">
              {unreadCount} {t('notification.new', 'Baru')}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] font-mono text-[#7ad0ff] hover:text-white hover:underline transition-colors cursor-pointer flex items-center gap-1"
            title={t('notification.markAllRead', 'Tandai semua telah dibaca')}
          >
            <span className="material-symbols-outlined text-[14px]">done_all</span>
            <span>{t('notification.markAll', 'Tandai Dibaca')}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#242f3b] flex gap-1.5 notification-popover-filter bg-[#0f1419]/50">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[#1e2936] text-[#7ad0ff] border border-[#3b4b5d] notification-filter-active'
              : 'text-[#8fa0b0] hover:text-white hover:bg-[#1a232d] notification-filter-inactive'
          }`}
        >
          {t('notification.all', 'Semua')} ({notifications.length})
        </button>

        <button
          onClick={() => setActiveFilter('ENTRY')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            activeFilter === 'ENTRY'
              ? 'bg-[#102438] text-[#7ad0ff] border border-[#1b4363] notification-filter-active'
              : 'text-[#8fa0b0] hover:text-white hover:bg-[#1a232d] notification-filter-inactive'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00bfff]"></span>
          {t('notification.entry', 'Kendaraan Masuk')}
        </button>

        <button
          onClick={() => setActiveFilter('ANOMALY')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            activeFilter === 'ANOMALY'
              ? 'bg-[#2b1619] text-[#f87171] border border-[#52252a] notification-filter-active-anomaly'
              : 'text-[#8fa0b0] hover:text-white hover:bg-[#1a232d] notification-filter-inactive'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
          {t('notification.anomaly', 'Anomali')}
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-[#242f3b] notification-popover-list">
        {filteredNotifications.length === 0 ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[36px] text-[#55697d]">notifications_off</span>
            <p className="text-xs text-[#8fa0b0] font-mono">
              {t('notification.empty', 'Tidak ada notifikasi')}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 flex items-start gap-3 hover:bg-[#1c2430] transition-colors cursor-pointer group notification-item ${
                !item.isRead ? 'bg-[#18212b]/60 notification-item-unread' : ''
              }`}
            >
              {/* Type Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getIconColors(
                  item.type,
                  item.severity
                )}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {getIcon(item.type)}
                </span>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-white truncate notification-item-title group-hover:text-[#7ad0ff] transition-colors">
                    {item.title}
                  </span>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#ea580c] shrink-0" title="Belum dibaca"></span>
                  )}
                </div>

                <p className="text-[11px] text-[#9bb0c1] leading-relaxed line-clamp-2 notification-item-desc mb-1.5">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#7d90a1] notification-item-time">
                  <span>{item.time}</span>
                  {item.slotId && (
                    <span className="px-1.5 py-0.2 rounded bg-[#10151a] border border-[#273542] text-[#7ad0ff] notification-item-slot">
                      Slot: {item.slotId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Popover Footer Links */}
      <div className="px-4 py-2.5 bg-[#0f1419] border-t border-[#242f3b] flex items-center justify-between text-xs font-mono notification-popover-footer">
        <button
          onClick={() => {
            navigate('/anomaly-logs');
            onClose();
          }}
          className="text-[#f87171] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Log Anomali</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </button>

        <button
          onClick={() => {
            navigate('/gate-live');
            onClose();
          }}
          className="text-[#7ad0ff] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Gate Live OCR</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
