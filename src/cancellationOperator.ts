export type CancellationOperator = {
  register: (contextId: string, id: string, task: { cancel: () => void }) => void;
  unregister: (contextId: string, id: string) => void;
  cancel: (contextId: string) => void
};

export const makeCancellationOperator = (): CancellationOperator => {
  const tasksByContext = new Map<string, Set<string>>();
  const cancellableTasks = new Map<string, { cancel: () => void }>();
  const register = (contextId: string, id: string, task: { cancel: () => void }) => {
    tasksByContext.set(contextId, (tasksByContext.get(contextId) || new Set()).add(id));
    cancellableTasks.set(id, task);
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
  return { register, unregister, cancel };
};
