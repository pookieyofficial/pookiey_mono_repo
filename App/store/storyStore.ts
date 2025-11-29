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

export interface CategorizedStories {
  myStory: StoryItem | null;
  friends: StoryItem[];
  discover: StoryItem[];
}

interface StoryState {
  stories: StoryItem[]; // Legacy: flat list for backward compatibility
  categorizedStories: CategorizedStories | null;
  isLoading: boolean;
  lastLoaded: number | null;
}

interface StoryActions {
  setStories: (stories: StoryItem[]) => void;
  setCategorizedStories: (stories: CategorizedStories) => void;
  setLoading: (loading: boolean) => void;
  updateStoryViewStatus: (storyId: string) => void;
  refreshStories: () => void;
}

type StoryStore = StoryState & StoryActions;

export const useStoryStore = create<StoryStore>((set, get) => ({
  stories: [],
  categorizedStories: null,
  isLoading: false,
  lastLoaded: null,

  setStories: (stories) => {
    set({ stories, lastLoaded: Date.now() });
  },

  setCategorizedStories: (categorizedStories) => {
    // Also maintain flat list for backward compatibility
    const flatList: StoryItem[] = [];
    if (categorizedStories.myStory) {
      flatList.push(categorizedStories.myStory);
    }
    flatList.push(...categorizedStories.friends);
    flatList.push(...categorizedStories.discover);
    
    set({ 
      categorizedStories, 
      stories: flatList,
      lastLoaded: Date.now() 
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  updateStoryViewStatus: (storyId) => {
    const { categorizedStories, stories } = get();
    
    // Update in categorized stories
    if (categorizedStories) {
      const updateInCategory = (category: StoryItem[]) => 
        category.map((user) => ({
          ...user,
          stories: user.stories.map((story) =>
            story.id === storyId ? { ...story, isSeen: true } : story
          ),
        }));
      
      const updatedCategorized: CategorizedStories = {
        myStory: categorizedStories.myStory ? {
          ...categorizedStories.myStory,
          stories: categorizedStories.myStory.stories.map((story) =>
            story.id === storyId ? { ...story, isSeen: true } : story
          ),
        } : null,
        friends: updateInCategory(categorizedStories.friends),
        discover: updateInCategory(categorizedStories.discover),
      };
      
      // Also update flat list
      const flatList: StoryItem[] = [];
      if (updatedCategorized.myStory) {
        flatList.push(updatedCategorized.myStory);
      }
      flatList.push(...updatedCategorized.friends);
      flatList.push(...updatedCategorized.discover);
      
      set({ 
        categorizedStories: updatedCategorized,
        stories: flatList 
      });
    } else {
      // Fallback to old behavior
      const updatedStories = stories.map((user) => ({
        ...user,
        stories: user.stories.map((story) =>
          story.id === storyId ? { ...story, isSeen: true } : story
        ),
      }));
      set({ stories: updatedStories });
    }
  },

  refreshStories: () => {
    // This will be called from the component that loads stories
    set({ lastLoaded: null });
  },
}));

