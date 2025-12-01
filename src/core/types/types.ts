export type Pageable<T> = {
  page: number;
  size: number;
  sortProp: T;
  sortDirection: 'asc' | 'desc';
};

export type WorkspaceSortOption = 'id' | 'name';
