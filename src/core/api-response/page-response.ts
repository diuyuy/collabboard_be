import { ApiProperty } from '@nestjs/swagger';
import { Pageable } from '../types/types';

export class PageResponse<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    type: 'array',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: 'Current page number (0-indexed)',
    example: 0,
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    type: Number,
  })
  size: number;

  @ApiProperty({
    description: 'Indicates whether there are more pages available',
    example: true,
    type: Boolean,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Total number of elements across all pages',
    example: 100,
    type: Number,
  })
  totalElements: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
    type: Number,
  })
  totalPages: number;

  constructor(pageResponse: PageResponse<T>) {
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
    return new PageResponse({
      items,
      hasNext: totalElements > page * size + items.length,
      page,
      size,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
    });
  }
}
