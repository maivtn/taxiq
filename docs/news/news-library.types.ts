export type NewsTab = 'news' | 'plan' | 'content' | 'events';

export type FeaturedVideo = {
  url: string;
  image: string;
  alt: string;
  badge: string;
  duration: string;
  timeAgo: string;
  views: string;
  title: string;
  description: string;
};

export type ChannelVideo = {
  url: string;
  image: string;
  alt: string;
  duration: string;
  timeAgo: string;
  views: string;
  title: string;
  description: string;
  isExtra?: boolean;
};

export type PlanTopic = {
  url: string;
  icon: string;
  title: string;
  description: string;
};

export type MediaListItem = {
  url: string;
  title: string;
  meta: string;
};

export type FeaturedContent = {
  url: string;
  image: string;
  title: string;
  description: string;
  duration: string;
  views: string;
};

export type TrainingVideo = {
  url: string;
  image: string;
  title: string;
  meta: string;
};

export type UpcomingSession = {
  imgUrl?: string;
  day: string;
  date: string;
  time: string;
  type: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  link?: string;
  htmlContent?: string;
  icon?: string;
};

export type VideoZoomHistoryItem = {
  url: string;
  title: string;
  date?: string;
  time?: string;
  description?: string;
};

export type NewsLibraryContent = {
  featuredVideos?: FeaturedVideo[];
  channelVideos?: ChannelVideo[];
  planTopics?: PlanTopic[];
  morePlanVideos?: MediaListItem[];
  featuredContent?: FeaturedContent | null;
  solutionPresentations?: MediaListItem[];
  trainingVideos?: TrainingVideo[];
  upcomingSessions?: UpcomingSession[];
  upcomingEvents?: UpcomingSession[];
  recentSessions?: string[];
  videoZoomHistory?: VideoZoomHistoryItem[];
};
