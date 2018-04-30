import { ApolloCache, Cache, Transaction } from 'apollo-cache';
import { DocumentNode, print } from 'graphql';

export interface LogOptions {
  logger?: (...args: any[]) => void;
  formatter?: (methodName: string, args: any[], error: any, result: any) => string;
}

export const defaultFormatter = (methodName: string, args: any[], error: any, result: any): string =>
  ['transformDocument', 'watch'].indexOf(methodName) >= 0
    ? undefined
    : methodName +
      '(' +
      (args.length === 1 && !!args[0] && (!!args[0].definitions || (!!args[0].query && !!args[0].query.definitions))
        ? print(args[0].query || args[0])
        : JSON.stringify(args)) +
      ')' +
      ` ${error ? 'e' : ''}-> ` +
      (!error && result && result.definitions ? print(result) : JSON.stringify(error || result));

export const defaultLogger = (...args: any[]): void => console.log.apply(null, args);

const getDefaultLogOptions = (options: LogOptions): LogOptions => {
  const result = options;
  if (!result.formatter) {
    result.formatter = defaultFormatter;
  }
  if (!result.logger) {
    result.logger = defaultLogger;
  }

  return result;
};

export default class LogCache<TCache> extends ApolloCache<TCache> {
  private cache: ApolloCache<TCache>;
  private options: LogOptions;

  constructor(cache: ApolloCache<TCache>, options?: LogOptions) {
    super();
    this.cache = cache;
    this.options = getDefaultLogOptions(options);
  }

  public read<T>(query: Cache.ReadOptions): T {
    return this.log('read', [query], () => this.cache.read(query));
  }

  public write(write: Cache.WriteOptions): void {
    return this.log('write', [write], () => this.cache.write(write));
  }

  public diff<T>(query: Cache.DiffOptions): Cache.DiffResult<T> {
    return this.log('diff', [query], () => this.cache.diff(query));
  }

  public watch(watch: Cache.WatchOptions): () => void {
    return this.log('watch', [watch], () => this.cache.watch(watch));
  }

  public evict(query: Cache.EvictOptions): Cache.EvictionResult {
    return this.log('evict', [query], () => this.cache.evict(query));
  }

  public async reset(): Promise<void> {
    let error;
    try {
      await this.cache.reset();
    } catch (e) {
      error = e;
    }
    return this.log('reset', [], () => {
      if (error) {
        throw error;
      }
    });
  }

  public restore(serializedState: TCache): ApolloCache<TCache> {
    return this.log('restore', [serializedState], () => this.cache.restore(serializedState));
  }

  public extract(optimistic: boolean): TCache {
    return this.log('extract', [optimistic], () => this.cache.extract(optimistic));
  }

  public removeOptimistic(id: string): void {
    this.log('removeOptimistic', [id], () => this.cache.removeOptimistic(id));
  }

  public performTransaction(transaction: Transaction<any>): void {
    this.log('performTransaction', [transaction], () => this.cache.performTransaction(transaction));
  }

  public recordOptimisticTransaction(transaction: Transaction<any>, id: string): void {
    this.log('recordOptimisticTransaction', [transaction, id], () =>
      this.cache.recordOptimisticTransaction(transaction, id)
    );
  }

  public transformDocument(document: DocumentNode): DocumentNode {
    return this.log('transformDocument', [document], () => this.cache.transformDocument(document));
  }

  private log<T>(methodName: string, args: any[], operation: () => T): T {
    let result;
    let error;
    try {
      result = operation();
      return result;
    } catch (e) {
      error = e;
      throw e;
    } finally {
      const msg = this.options.formatter(methodName, args, error, result);
      if (msg) {
        this.options.logger(msg);
      }
    }
  }
}
