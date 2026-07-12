type FilterCallback = (value: any, ...args: any[]) => any;
type ActionCallback = (...args: any[]) => void;

class PluginHooks {
  private filters: Map<string, FilterCallback[]> = new Map();
  private actions: Map<string, ActionCallback[]> = new Map();

  addFilter(name: string, callback: FilterCallback, priority = 10) {
    if (!this.filters.has(name)) this.filters.set(name, []);
    this.filters.get(name)!.push({ callback, priority } as any);
    this.filters.get(name)!.sort((a: any, b: any) => a.priority - b.priority);
  }

  removeFilter(name: string, callback: FilterCallback) {
    const callbacks = this.filters.get(name);
    if (!callbacks) return;
    this.filters.set(name, callbacks.filter((cb: any) => cb.callback !== callback));
  }

  applyFilters(name: string, value: any, ...args: any[]): any {
    const callbacks = this.filters.get(name);
    if (!callbacks) return value;
    return callbacks.reduce((val, cb: any) => cb.callback(val, ...args), value);
  }

  addAction(name: string, callback: ActionCallback, priority = 10) {
    if (!this.actions.has(name)) this.actions.set(name, []);
    this.actions.get(name)!.push({ callback, priority } as any);
    this.actions.get(name)!.sort((a: any, b: any) => a.priority - b.priority);
  }

  removeAction(name: string, callback: ActionCallback) {
    const callbacks = this.actions.get(name);
    if (!callbacks) return;
    this.actions.set(name, callbacks.filter((cb: any) => cb.callback !== callback));
  }

  doAction(name: string, ...args: any[]) {
    const callbacks = this.actions.get(name);
    if (!callbacks) return;
    callbacks.forEach((cb: any) => cb.callback(...args));
  }

  getFilterNames(): string[] {
    return Array.from(this.filters.keys());
  }

  getActionNames(): string[] {
    return Array.from(this.actions.keys());
  }

  reset() {
    this.filters.clear();
    this.actions.clear();
  }
}

export const hooks = new PluginHooks();
