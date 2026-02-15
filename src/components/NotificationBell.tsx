"use client";

import { useState, useEffect, useRef } from "react";

interface NotificationItem {
  _id: string;
  type: "match" | "message" | "superlike";
  fromUser: {
    displayName: string;
    avatar: string;
    fursona: { name: string; species: string };
  };
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Notifications are non-critical; silent fail is acceptable
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "match": return "\u{1F49C}";
      case "message": return "\u{1F4AC}";
      case "superlike": return "\u{2B50}";
      default: return "\u{1F514}";
    }
  };

  const getMessage = (n: NotificationItem) => {
    switch (n.type) {
      case "match": return `You matched with ${n.fromUser.displayName}!`;
      case "message": return `${n.fromUser.displayName} sent you a message`;
      case "superlike": return `${n.fromUser.displayName} superliked you!`;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative p-2 text-foreground/60 hover:text-foreground transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="text-xl" aria-hidden="true">{"\u{1F514}"}</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-neon-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          role="menu"
          aria-label="Notifications"
        >
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-neon-purple hover:text-neon-pink"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-foreground/40 text-sm">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  role="menuitem"
                  className={`flex items-center gap-3 p-3 border-b border-border/50 ${
                    !n.read ? "bg-neon-purple/5" : ""
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{getIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{getMessage(n)}</p>
                    <p className="text-xs text-foreground/40">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-neon-purple" aria-label="Unread" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
