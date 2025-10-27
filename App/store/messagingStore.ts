import { create } from 'zustand';
import { InboxItem } from '@/hooks/useSocket';

interface MessagingState {
  inbox: InboxItem[];
  totalUnreadCount: number;
  isSocketConnected: boolean;
}

interface MessagingActions {
  setInbox: (inbox: InboxItem[]) => void;
  updateInbox: (updates: Partial<InboxItem>) => void;
  setSocketConnected: (connected: boolean) => void;
  calculateUnreadCount: () => number;
  setReloadTrigger: (trigger: (() => void) | null) => void;
  triggerReload: () => void;
}

type MessagingStore = MessagingState & MessagingActions;

let reloadFunction: (() => void) | null = null;

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  inbox: [],
  totalUnreadCount: 0,
  isSocketConnected: false,

  setInbox: (inbox) => {
    const totalUnreadCount = inbox.reduce((sum, item) => sum + item.unreadCount, 0);
    set({ inbox, totalUnreadCount });
  },

  updateInbox: (updates) => {
    const { inbox } = get();
    const updatedInbox = inbox.map((item) =>
      item.matchId === updates.matchId ? { ...item, ...updates } : item
    );
    const totalUnreadCount = updatedInbox.reduce((sum, item) => sum + item.unreadCount, 0);
    set({ inbox: updatedInbox, totalUnreadCount });
  },

  setSocketConnected: (connected) => set({ isSocketConnected: connected }),

  calculateUnreadCount: () => {
    const { inbox } = get();
    return inbox.reduce((sum, item) => sum + item.unreadCount, 0);
  },

  setReloadTrigger: (trigger) => {
    reloadFunction = trigger;
  },

  triggerReload: () => {
    if (reloadFunction) {
      reloadFunction();
    }
  },
}));
