export class State<T extends { [key: string]: any }> {
  constructor(private state: T) {}

  public get<K extends keyof T, R extends T[K]>(key: K): R {
    return this.state[key];
  }

  public set<K extends keyof T, R extends T[K]>(key: K, value: R): void {
    this.state[key] = value;
  }

  public merge(value: { [key: string]: any }): void {
    this.state = { ...this.state, ...value };
  }
}
