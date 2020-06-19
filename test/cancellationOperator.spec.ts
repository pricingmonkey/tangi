import { makeCancellationOperator } from '../src/cancellationOperator';
import { Mock, Times } from 'typemoq';

describe('cancellationOperator', () => {
  it('should cancel registered task', () => {
    const cancellableTask = Mock.ofType<{ cancel: () => void}>();
    const cancellationOperator = makeCancellationOperator();

    cancellationOperator.register('CONTEXT', '1', cancellableTask.object);

    cancellationOperator.cancel('CONTEXT');

    cancellableTask.verify((t) => t.cancel(), Times.once());
  });

  it('should not cancel task if had been unregistered', () => {
    const cancellableTask = Mock.ofType<{ cancel: () => void}>();
    const cancellationOperator = makeCancellationOperator();

    cancellationOperator.register('CONTEXT', '1', cancellableTask.object);
    cancellationOperator.unregister('CONTEXT', '1');

    cancellationOperator.cancel('CONTEXT');

    cancellableTask.verify((t) => t.cancel(), Times.never());
  });

  it('should only cancel tasks from the right context', () => {
    const cancellableTaskOne = Mock.ofType<{ cancel: () => void}>();
    const cancellableTaskTwo = Mock.ofType<{ cancel: () => void}>();
    const cancellationOperator = makeCancellationOperator();

    cancellationOperator.register('CONTEXT_1', '1', cancellableTaskOne.object);
    cancellationOperator.register('CONTEXT_2', '2', cancellableTaskOne.object);

    cancellationOperator.cancel('CONTEXT_1');

    cancellableTaskOne.verify((t) => t.cancel(), Times.once());
    cancellableTaskTwo.verify((t) => t.cancel(), Times.never());
  });

  it('should ignore non-existing unregistration', () => {
    const cancellationOperator = makeCancellationOperator();

    cancellationOperator.unregister('CONTEXT_1', '1');
  });

  it('should ignore non-existing cancellation', () => {
    const cancellationOperator = makeCancellationOperator();

    cancellationOperator.cancel('CONTEXT_1');
  });

  it('should ignore double cancellation', () => {
    const cancellableTask = Mock.ofType<{ cancel: () => void}>();
    const cancellationOperator = makeCancellationOperator();

    cancellationOperator.register('CONTEXT', '1', cancellableTask.object);

    cancellationOperator.cancel('CONTEXT');
    cancellableTask.verify((t) => t.cancel(), Times.once());
    cancellableTask.reset();

    cancellationOperator.cancel('CONTEXT');
    cancellableTask.verify((t) => t.cancel(), Times.never());
  });
});
