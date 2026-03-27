type TaskUpdateListener = () => void;

declare global {
  var __taskUpdateListeners: Set<TaskUpdateListener> | undefined;
}

const listeners =
  globalThis.__taskUpdateListeners ?? new Set<TaskUpdateListener>();

if (!globalThis.__taskUpdateListeners) {
  globalThis.__taskUpdateListeners = listeners;
}

export const subscribeTaskUpdates = (listener: TaskUpdateListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const publishTaskUpdate = () => {
  for (const listener of listeners) {
    listener();
  }
};
