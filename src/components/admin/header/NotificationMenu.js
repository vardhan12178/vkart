import React, { useRef, useState } from "react";
import { BellIcon } from "@heroicons/react/outline";
import { normalizeNotificationTitle } from "../../../utils/notificationHelpers";
import { getNotificationIcon, getTimeAgo } from "./notificationUi";
import useAdminNotifications from "./useAdminNotifications";
import useClickOutside from "./useClickOutside";

export default function NotificationMenu() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const { notifications, unreadCount, refetch, markAsRead, openNotification } =
    useAdminNotifications();
  useClickOutside(notificationRef, () => setNotificationsOpen(false));

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => {
          setNotificationsOpen(!notificationsOpen);
          if (!notificationsOpen) refetch();
        }}
        className={`
                  relative p-1.5 sm:p-2.5 rounded-full transition-all group min-w-[38px] min-h-[38px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center
                  ${notificationsOpen ? "bg-[#e9e1d7] text-[#1d1c19]" : "text-[#656159] hover:bg-black/[0.05] hover:text-[#1d1c19]"}
                `}
        aria-label="Notifications"
      >
        <BellIcon className={`w-5 h-5 ${notificationsOpen ? "fill-current" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-3 flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a85d37] ring-2 ring-[#fffdf8]"></span>
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {notificationsOpen && (
        <div className="fixed left-3 right-3 top-[3.75rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 z-50 origin-top overflow-hidden rounded-[1.25rem] border border-black/[0.08] bg-[#fffdf8] shadow-[0_24px_70px_rgba(29,28,25,.16)] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                {unreadCount > 0
                  ? `You have ${unreadCount} new alerts`
                  : "Recent activity & updates"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead([], true)}
                className="rounded-full border border-[#a85d37]/15 bg-[#efe4d9] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] font-bold text-[#75462f] transition-colors hover:bg-[#e9dace]"
              >
                Mark read
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item._id || item.id}
                  onClick={() => openNotification(item, () => setNotificationsOpen(false))}
                  className={`
                            px-4 py-2.5 sm:px-5 sm:py-3 hover:bg-slate-50 transition-colors flex gap-3 sm:gap-4 border-b border-slate-50 last:border-0 cursor-pointer
                            ${!item.isRead ? "bg-slate-50/50" : ""}
                          `}
                >
                  <div
                    className={`mt-0.5 h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${!item.isRead ? "bg-white shadow-sm ring-1 ring-slate-100" : "bg-slate-100"}`}
                  >
                    {getNotificationIcon(item.type, item.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p
                        className={`text-xs sm:text-sm ${!item.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}
                      >
                        {normalizeNotificationTitle(item.title)}
                      </p>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {getTimeAgo(item.createdAt || Date.now())}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                  {!item.isRead && (
                    <div className="flex-shrink-0 self-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500">
                <BellIcon className="h-7 w-7 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
