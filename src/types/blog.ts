export interface ApiBlogPost {
  id: number;
  slug: string;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  contentTr: string;
  contentEn: string;
  thumbUrl: string | null;
  tagTr: string;
  tagEn: string;
  author: string;
  readTime: number;
  metaTitleTr: string;
  metaTitleEn: string;
  metaDescriptionTr: string;
  metaDescriptionEn: string;
  keywordsTr: string[];
  keywordsEn: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
