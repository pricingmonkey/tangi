import { expect } from 'chai';
import { KillSwitch, makeCancellationOperator } from '../src/cancellationOperator';

describe('cancellationOperator', () => {
  const killablePromise = (killSwitch: KillSwitch) => Promise.resolve(killSwitch.isCancelled);

  it('should cancel registered task', async () => {
    const cancellationOperator = makeCancellationOperator();

    const cancellableTask = cancellationOperator.register('CONTEXT', '1', killablePromise);

    cancellationOperator.cancel('CONTEXT');

    expect(await cancellableTask.promise()).to.equal(true);
  });

  it('should not cancel task if had been unregistered', async () => {
    const cancellationOperator = makeCancellationOperator();

    const cancellableTask = cancellationOperator.register('CONTEXT', '1', killablePromise);
    cancellationOperator.unregister('CONTEXT', '1');

    cancellationOperator.cancel('CONTEXT');

    expect(await cancellableTask.promise()).to.equal(false);
  });

  it('should only cancel tasks from the right context', async () => {
    const cancellationOperator = makeCancellationOperator();

    const cancellableTaskOne = cancellationOperator.register('CONTEXT_1', '1', killablePromise);
    const cancellableTaskTwo = cancellationOperator.register('CONTEXT_2', '2', killablePromise);

    cancellationOperator.cancel('CONTEXT_1');

    expect(await cancellableTaskOne.promise()).to.equal(true);
    expect(await cancellableTaskTwo.promise()).to.equal(false);
  });

  it('should ignore non-existing unregistration', () => {
    const cancellationOperator = makeCancellationOperator();

    cancellationOperator.unregister('CONTEXT_1', '1');
  });

  it('should ignore non-existing cancellation', () => {
    const cancellationOperator = makeCancellationOperator();

    cancellationOperator.cancel('CONTEXT_1');
  });
});
