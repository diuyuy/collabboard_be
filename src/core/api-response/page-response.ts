import { Pageable } from '../types/types';

export class PageReponse<T> {
  items: T[];
  page: number;
  size: number;
  hasNext: boolean;
  totalElements: number;
  totalPages: number;

  constructor(pageResponse: PageReponse<T>) {
    this.items = pageResponse.items;
    this.page = pageResponse.page;
    this.size = pageResponse.size;
    this.hasNext = pageResponse.hasNext;
    this.totalElements = pageResponse.totalElements;
    this.totalPages = pageResponse.totalPages;
  }

  static from<T, R>(
    items: T[],
    totalElements: number,
    { page, size }: Pageable<R>,
  ) {
    return new PageReponse({
      items,
      hasNext: totalElements > page * size + items.length,
      page,
      size,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
    });
  }
}
