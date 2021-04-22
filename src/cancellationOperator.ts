export type KillSwitch = { isCancelled: boolean };

type CancellableTask<T> = {
  promise: () => Promise<T>;
  cancel: () => void;
};

const makeTaskCancellable = <T> (
  killableTask: (killSwitch: KillSwitch) => Promise<T>
): CancellableTask<T> => {
  const killSwitch = { isCancelled: false };
  return {
    cancel: () => {
      killSwitch.isCancelled = true;
    },
    promise: () => {
      return killableTask(killSwitch);
    }
  };
};

export type CancellationOperator = {
  register: <T> (contextId: string, id: string, task: (killSwitch: KillSwitch) => Promise<T>) => CancellableTask<T>;
  unregister: (contextId: string, id: string) => void;
  cancel: (contextId: string) => void;
};

export const makeCancellationOperator = (): CancellationOperator => {
  const tasksByContext = new Map<string, Set<string>>();
  const cancellableTasks = new Map<string, { cancel: () => void }>();
  const register = <T> (contextId: string, id: string, task: (killSwitch: KillSwitch) => Promise<T>) => {
    tasksByContext.set(contextId, (tasksByContext.get(contextId) || new Set()).add(id));
    const cancellableTask = makeTaskCancellable(task);
    cancellableTasks.set(id, cancellableTask);
    return cancellableTask;
  };
  const unregister = (contextId: string, id: string) => {
    const task = tasksByContext.get(contextId);
    if (!task) {
      return;
    }
    task.delete(id);
    cancellableTasks.delete(id);
  };
  const cancel = (contextId: string) => {
    const tasks = tasksByContext.get(contextId);
    if (!tasks) {
      return;
    }
    tasks.forEach(id => {
      const cancellableTask = cancellableTasks.get(id);
      if (cancellableTask) {
        cancellableTask.cancel();
      }
      unregister(contextId, id);
    });
  };
  return {
    register,
    unregister,
    cancel
  };
};
