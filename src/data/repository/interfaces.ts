import { Product } from "../models/Product";
import { FishingStore } from "../models/geography/FishingStore";
export type Query<T> = { [P in keyof T]?: T[P] | { $regex: RegExp } };

export interface Repository<T> {
  save(doc: T): Promise<T>;
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T>;
  findManyById(ids: string[]): Promise<T[]>;
  findManyByQuery(query?: Query<T>): Promise<T[]>;
}

export type FishRepository = Repository<Product>;
export type FishingStoreRepository = Repository<FishingStore>;
