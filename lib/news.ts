export type NewsItem = {
  id: string;
  category: "procurement" | "ai";
  title: string;
  summary: string;
  publishedAt: string;
  sourceUrl: string;
};
export const newsFeed: { version: number; updatedAt: string | null; automaticUpdates: boolean; items: NewsItem[] } = {
  version: 1, updatedAt: null, automaticUpdates: false, items: [],
};
