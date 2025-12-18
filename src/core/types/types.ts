export type Pageable<T> = {
  page: number;
  size: number;
  sortProp: T;
  sortDirection: 'asc' | 'desc';
};

export type PageSortOption<T> = {
  sortProp: T;
  sortDirection: 'asc' | 'desc';
};

type MustIncludeId<T> = 'id' extends T ? T : never;

export type WorkspaceSortOption = MustIncludeId<'id' | 'name' | 'createdAt'>;
export type BoardSortOption = MustIncludeId<'id' | 'title' | 'createdAt'>;
