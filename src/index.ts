import { ApolloCache, Cache, Transaction } from 'apollo-cache';
import { DocumentNode } from 'graphql';

export interface OverrideOptions<TCache> {
  read?: <T>(query: Cache.ReadOptions) => T;
  write?: (write: Cache.WriteOptions) => void;
  diff?: <T>(query: Cache.DiffOptions) => Cache.DiffResult<T>;
  watch?: (watch: Cache.WatchOptions) => () => void;
  evict?: (query: Cache.EvictOptions) => Cache.EvictionResult;
  reset?: () => Promise<void>;
  restore?: (serializedState: TCache) => ApolloCache<TCache>;
  extract?: (optimistic: boolean) => TCache;
  removeOptimistic?: (id: string) => void;
  performTransaction?: (transaction: Transaction<any>) => void;
  recordOptimisticTransaction?: (transaction: Transaction<any>, id: string) => void;
  transformDocument?: (document: DocumentNode) => DocumentNode;
}

class OverrideCache<TCache> extends ApolloCache<TCache> {
  private cache: ApolloCache<TCache>;
  private options: OverrideOptions<TCache>;

  constructor(cache: ApolloCache<TCache>, options?: OverrideOptions<TCache>) {
    super();
    this.cache = cache;
    this.options = options || {};
  }

  public read<T>(query: Cache.ReadOptions): T {
    return this.options.read ? this.options.read(query) : this.cache.read(query);
  }

  public write(write: Cache.WriteOptions): void {
    this.options.write ? this.options.write(write) : this.cache.write(write);
  }

  public diff<T>(query: Cache.DiffOptions): Cache.DiffResult<T> {
    return this.options.diff ? this.options.diff(query) : this.cache.diff(query);
  }

  public watch(watch: Cache.WatchOptions): () => void {
    return this.options.watch ? this.options.watch(watch) : this.cache.watch(watch);
  }

  public evict(query: Cache.EvictOptions): Cache.EvictionResult {
    return this.options.evict ? this.options.evict(query) : this.cache.evict(query);
  }

  public reset(): Promise<void> {
    return this.options.reset ? this.options.reset() : this.cache.reset();
  }

  public restore(serializedState: TCache): ApolloCache<TCache> {
    return this.options.restore ? this.options.restore(serializedState) : this.cache.restore(serializedState);
  }

  public extract(optimistic: boolean): TCache {
    return this.options.extract ? this.options.extract(optimistic) : this.cache.extract(optimistic);
  }

  public removeOptimistic(id: string): void {
    this.options.removeOptimistic ? this.options.removeOptimistic(id) : this.cache.removeOptimistic(id);
  }

  public performTransaction(transaction: Transaction<any>): void {
    this.options.performTransaction
      ? this.options.performTransaction(transaction)
      : this.cache.performTransaction(transaction);
  }

  public recordOptimisticTransaction(transaction: Transaction<any>, id: string): void {
    this.options.recordOptimisticTransaction
      ? this.options.recordOptimisticTransaction(transaction, id)
      : this.cache.recordOptimisticTransaction(transaction, id);
  }

  public transformDocument(document: DocumentNode): DocumentNode {
    return this.options.transformDocument
      ? this.options.transformDocument(document)
      : this.cache.transformDocument(document);
  }
}

export const override = <TCache>(cache: ApolloCache<TCache>, options?: OverrideOptions<TCache>): ApolloCache<TCache> =>
  new OverrideCache<TCache>(cache, options);

export type RouterFunction = (document: DocumentNode, caches: Array<ApolloCache<any>>) => ApolloCache<any>;

class RoutingCache extends ApolloCache<any> {
  private caches: Array<ApolloCache<any>>;
  private router: RouterFunction;

  constructor(caches: Array<ApolloCache<any>>, router: RouterFunction) {
    super();
    this.caches = caches;
    this.router = router;
  }

  public read<T>(query: Cache.ReadOptions): T {
    const caches = this.check(this.router(query.query, this.caches));
    if (caches.length === 0) {
      throw new Error('No caches to read from for the document');
    } else {
      return caches[0].read(query);
    }
  }

  public write(write: Cache.WriteOptions): void {
    return this.check(this.router(write.query, this.caches)).forEach(cache => cache.write(write));
  }

  public diff<T>(query: Cache.DiffOptions): Cache.DiffResult<T> {
    const caches = this.check(this.router(query.query, this.caches));
    return caches.length === 0 ? { result: null as T, complete: false } : caches[0].diff(query);
  }

  public watch(watch: Cache.WatchOptions): () => void {
    const caches = this.check(this.router(watch.query, this.caches));

    return caches.length === 0 ? () => {} : caches[0].watch(watch);
  }

  public evict(query: Cache.EvictOptions): Cache.EvictionResult {
    let result;
    this.check(this.router(query.query, this.caches)).forEach(cache => (result = cache.evict(query)));
    return result;
  }

  public reset(): Promise<any> {
    return Promise.all(this.caches.map(cache => cache.reset()));
  }

  public extract(optimistic: boolean): any {
    const state = {};
    for (let idx = 0; idx < this.caches.length; idx++) {
      state['cache' + idx] = this.caches[idx].extract(optimistic);
    }
    return state;
  }

  public restore(serializedState: any): ApolloCache<any> {
    for (let idx = 0; idx < this.caches.length; idx++) {
      this.caches[idx].restore(serializedState['cache' + idx]);
    }
    return this;
  }

  public removeOptimistic(id: string): void {
    this.caches.forEach(cache => cache.removeOptimistic(id));
  }

  public performTransaction(transaction: Transaction<any>): void {
    this.caches.forEach(cache => cache.performTransaction(transaction));
  }

  public recordOptimisticTransaction(transaction: Transaction<any>, id: string): void {
    this.caches.forEach(cache => cache.recordOptimisticTransaction(transaction, id));
  }

  public transformDocument(document: DocumentNode): DocumentNode {
    return this.caches[0].transformDocument(document);
  }

  private check(caches: ApolloCache<any> | Array<ApolloCache<any>>): Array<ApolloCache<any>> {
    const cacheList = !caches
      ? []
      : caches.constructor === Array
        ? (caches as Array<ApolloCache<any>>)
        : ([caches] as Array<ApolloCache<any>>);
    if (process.env.NODE_ENV !== 'production') {
      for (const cache of cacheList) {
        if (this.caches.indexOf(cache) < 0) {
          throw new Error('Router must return a subset from submitted caches');
        }
      }
    }
    return cacheList;
  }
}

export const route = (caches: Array<ApolloCache<any>>, router: RouterFunction): ApolloCache<any> =>
  new RoutingCache(caches, router);

export default class ApolloCacheRouter {
  public static override = override;
  public static route = route;
}
