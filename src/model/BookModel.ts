export default interface BookModel {
  _id?: string;
  title: string;
  reference?: string;
  shortDescription: string;
  description: string;
  authors: string[];
  primaryAuthor: string;
  authorInfo: string;
  categories: string[];
  isManaged: boolean;
  isbn: string;
  pageCount?: number;
  chapterCount?: number;
  publishedDate: string;
  thumbnail?: string;
  overview?: string;
  readingProgress?: string;
  startedReadingOn?: Date;
  finishedReadingOn?: Date;
}
