import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Sparkles, Calendar } from 'lucide-react';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    link: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 'n1',
        title: 'Приглашение на интервью',
        message: 'Компания «Яндекс» пригласила вас на техническое собеседование (Backend C#).',
        time: '12 мин назад',
        isRead: false,
        link: '/applications',
    },
    {
        id: 'n2',
        title: 'Статус отклика обновлен',
        message: 'Рекрутер «Тинькофф Технологии» перевел ваш отклик в статус «На рассмотрении».',
        time: '2 часа назад',
        isRead: false,
        link: '/applications',
    },
];

export function NotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
    const navigate = useNavigate();

    const unreadCount = items.filter((i) => !i.isRead).length;

    const markAllRead = () => {
        setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    };

    const handleSelect = (item: NotificationItem) => {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
        setIsOpen(false);
        navigate(item.link);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="relative p-2 rounded-lg text-scoutly-muted hover:text-scoutly-dark hover:bg-gray-100 transition-colors cursor-pointer"
                title="Центр уведомлений"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-scoutly-action text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white shadow-xl border border-gray-100 z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 bg-scoutly-bg border-b border-gray-100">
              <span className="text-xs font-bold text-scoutly-dark uppercase tracking-wider">
                Уведомления ({unreadCount})
              </span>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-scoutly-accent hover:text-scoutly-primary cursor-pointer"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    <span>Прочитать все</span>
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className={`w-full text-left p-4 transition-colors hover:bg-scoutly-bg/70 cursor-pointer flex gap-3 ${
                                        !item.isRead ? 'bg-scoutly-accent/5' : 'bg-white'
                                    }`}
                                >
                                    <div className="mt-0.5 h-8 w-8 rounded-lg bg-scoutly-primary/10 text-scoutly-primary flex items-center justify-center shrink-0">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold text-scoutly-dark">{item.title}</span>
                                            {!item.isRead && (
                                                <span className="h-2 w-2 rounded-full bg-scoutly-action shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-scoutly-muted leading-relaxed">{item.message}</p>
                                        <div className="flex items-center gap-1 text-[11px] text-scoutly-muted/80">
                                            <Calendar className="h-3 w-3" />
                                            <span>{item.time}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}