import { create } from 'zustand';

export interface StoryItem {
  id: string;
  username: string;
  avatar: string;
  stories: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    duration: number;
    isSeen: boolean;
    createdAt: string | Date;
  }>;
  isMe: boolean;
}

interface StoryState {
  stories: StoryItem[];
  isLoading: boolean;
  lastLoaded: number | null;
}

interface StoryActions {
  setStories: (stories: StoryItem[]) => void;
  setLoading: (loading: boolean) => void;
  updateStoryViewStatus: (storyId: string) => void;
  refreshStories: () => void;
}

type StoryStore = StoryState & StoryActions;

export const useStoryStore = create<StoryStore>((set, get) => ({
  stories: [],
  isLoading: false,
  lastLoaded: null,

  setStories: (stories) => {
    set({ stories, lastLoaded: Date.now() });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  updateStoryViewStatus: (storyId) => {
    const { stories } = get();
    const updatedStories = stories.map((user) => ({
      ...user,
      stories: user.stories.map((story) =>
        story.id === storyId ? { ...story, isSeen: true } : story
      ),
    }));
    set({ stories: updatedStories });
  },

  refreshStories: () => {
    // This will be called from the component that loads stories
    set({ lastLoaded: null });
  },
}));

