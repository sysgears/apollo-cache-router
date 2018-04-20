import { ApolloCache, Cache, Transaction } from 'apollo-cache';
import { DocumentNode } from 'graphql';

export interface LogOptions {
  logger?: (msg: string) => void;
  formatter?: (methodName: string, args: any[], result: any) => string;
}

export default class LogCache<TCache> extends ApolloCache<TCache> {
  private cache: ApolloCache<TCache>;
  private options: LogOptions;

  constructor(cache: ApolloCache<TCache>, options?: LogOptions) {
    super();
    this.cache = cache;
    this.options = options || {};
  }

  public read<T>(query: Cache.ReadOptions): T {
    return this.log('read', [query], this.cache.read(query));
  }

  public write(write: Cache.WriteOptions): void {
    return this.log('write', [write], this.cache.write(write));
  }

  public diff<T>(query: Cache.DiffOptions): Cache.DiffResult<T> {
    return this.log('diff', [query], this.cache.diff(query));
  }

  public watch(watch: Cache.WatchOptions): () => void {
    return this.log('watch', [watch], this.cache.watch(watch));
  }

  public evict(query: Cache.EvictOptions): Cache.EvictionResult {
    return this.log('evict', [query], this.cache.evict(query));
  }

  public reset(): Promise<void> {
    this.log('reset', [], undefined);
    return this.cache.reset();
  }

  public restore(serializedState: TCache): ApolloCache<TCache> {
    return this.log('restore', [serializedState], this.cache.restore(serializedState));
  }

  public extract(optimistic: boolean): TCache {
    return this.log('extract', [optimistic], this.cache.extract(optimistic));
  }

  public removeOptimistic(id: string): void {
    this.log('removeOptimistic', [id], undefined);
    this.cache.removeOptimistic(id);
  }

  public performTransaction(transaction: Transaction<any>): void {
    this.log('performTransaction', [transaction], 'start');
    this.cache.performTransaction(transaction);
    this.log('performTransaction', [transaction], 'end');
  }

  public recordOptimisticTransaction(transaction: Transaction<any>, id: string): void {
    this.log('recordOptimisticTransaction', [transaction, id], 'start');
    this.cache.recordOptimisticTransaction(transaction, id);
    this.log('recordOptimisticTransaction', [transaction, id], 'end');
  }

  public transformDocument(document: DocumentNode): DocumentNode {
    return this.log('transformDocument', [document], this.cache.transformDocument(document));
  }

  private log<T>(methodName: string, args: any[], result: T): T {
    const msg =
      this.options && this.options.formatter
        ? this.options.formatter(methodName, args, result)
        : methodName + JSON.stringify(args) + ' -> ' + JSON.stringify(result);
    ((this.options && this.options.logger) || console.log)(msg);
    return result;
  }
}
