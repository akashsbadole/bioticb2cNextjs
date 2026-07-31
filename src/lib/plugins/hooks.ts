type FilterCallback = (value: any, ...args: any[]) => any;
type ActionCallback = (...args: any[]) => void;

interface FilterEntry {
  callback: FilterCallback;
  priority: number;
}

interface ActionEntry {
  callback: ActionCallback;
  priority: number;
}

class PluginHooks {
  private filters: Map<string, FilterEntry[]> = new Map();
  private actions: Map<string, ActionEntry[]> = new Map();

  addFilter(name: string, callback: FilterCallback, priority = 10) {
    if (!this.filters.has(name)) this.filters.set(name, []);
    this.filters.get(name)!.push({ callback, priority });
    this.filters.get(name)!.sort((a, b) => a.priority - b.priority);
  }

  removeFilter(name: string, callback: FilterCallback) {
    const callbacks = this.filters.get(name);
    if (!callbacks) return;
    this.filters.set(name, callbacks.filter((cb) => cb.callback !== callback));
  }

  async applyFilters(name: string, value: any, ...args: any[]): Promise<any> {
    const callbacks = this.filters.get(name);
    if (!callbacks) return value;
    let result = value;
    for (const cb of callbacks) {
      result = await cb.callback(result, ...args);
    }
    return result;
  }

  addAction(name: string, callback: ActionCallback, priority = 10) {
    if (!this.actions.has(name)) this.actions.set(name, []);
    this.actions.get(name)!.push({ callback, priority });
    this.actions.get(name)!.sort((a, b) => a.priority - b.priority);
  }

  removeAction(name: string, callback: ActionCallback) {
    const callbacks = this.actions.get(name);
    if (!callbacks) return;
    this.actions.set(name, callbacks.filter((cb) => cb.callback !== callback));
  }

  doAction(name: string, ...args: any[]) {
    const callbacks = this.actions.get(name);
    if (!callbacks) return;
    callbacks.forEach((cb) => cb.callback(...args));
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
