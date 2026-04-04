type TaskUpdateListener = () => void;

declare global {
  var __taskUpdateListeners: Set<TaskUpdateListener> | undefined;
}

const getTaskUpdateListeners = () => {
  if (!globalThis.__taskUpdateListeners) {
    globalThis.__taskUpdateListeners = new Set<TaskUpdateListener>();
  }

  return globalThis.__taskUpdateListeners;
};

const listeners = getTaskUpdateListeners();

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
