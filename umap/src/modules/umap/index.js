import { Umap } from './umap.module';

export function umap(dataset, supervised) {
  return new Umap(dataset, supervised);
}
