import chaiAsPromised from 'chai-as-promised';
import { It, Mock, Times } from 'typemoq';
import chai, { expect } from 'chai';
import * as fakeTimers from '@sinonjs/fake-timers';

import { makeActorContext, REPLY } from '../src/context';

chai.use(chaiAsPromised);

describe('actor context', () => {
  describe("ask", () => {
    it("should support ask pattern of communication and receive reply", async () => {
      const postMessage = Mock.ofType<(message: any) => void>();
      const messageSenderReceiver: any = { onmessage: undefined, postMessage: postMessage.object };
      const context = makeActorContext(messageSenderReceiver);

      let captureId;
      const makeMessage = (id: string): any => {
        captureId = id;
        return undefined;
      };
      const promise = context.ask(makeMessage);

      const messageEvent = { data: { id: captureId } };
      messageSenderReceiver.onmessage(messageEvent);
      const reply = await promise;

      expect(reply).to.equal(messageEvent.data);
    });

    describe("timeout", () => {
      it("should timeout after 30s by default if ask never resolves", async () => {
        const clock = fakeTimers.install();

        const postMessage = Mock.ofType<(message: any) => void>();
        const messageSenderReceiver: any = { onmessage: undefined, postMessage: postMessage.object };
        const context = makeActorContext(messageSenderReceiver);

        const makeMessage = (id: string): any => undefined;
        const promise = context.ask(makeMessage);
        await clock.tickAsync(30000);

        await expect(promise).to.be.rejectedWith("Timed out after 30000 ms");

        clock.uninstall();
      });

      it("should timeout after specified timeout if ask never resolves", async () => {
        const clock = fakeTimers.install();

        const postMessage = Mock.ofType<(message: any) => void>();
        const messageSenderReceiver: any = { onmessage: undefined, postMessage: postMessage.object };
        const context = makeActorContext(messageSenderReceiver);

        const makeMessage = (id: string): any => undefined;
        const promise = context.ask(makeMessage, { timeout: 2500 });
        await clock.tickAsync(2500);

        await expect(promise).to.be.rejectedWith("Timed out after 2500 ms");

        clock.uninstall();
      });
    });
  });

  describe("receiveMessage", () => {
    it("should attach reply handler to message which isn't already a reply", async () => {
      const onReceiveMessage = Mock.ofType<(message: any) => void>();
      const messageSenderReceiver: any = { onmessage: undefined };
      const context = makeActorContext(messageSenderReceiver);
      context.receiveMessage(onReceiveMessage.object);

      messageSenderReceiver.onmessage({ data: { id: 'some-id' } });

      onReceiveMessage.verify(fn => fn(It.is(msg => REPLY in msg)), Times.once());
    });

    it('should include id in reply to a message', async () => {
      const postMessage = Mock.ofType<(message: any) => void>();
      const messageSenderReceiver: any = { onmessage: undefined, postMessage: postMessage.object };
      const context = makeActorContext(messageSenderReceiver);
      let capturedMessage: any;
      context.receiveMessage((message) => {
        capturedMessage = message;
      });

      messageSenderReceiver.onmessage({ data: { id: 'some-id' } });

      capturedMessage[REPLY]({ });
      postMessage.verify(fn => fn(It.isObjectWith({ id: 'some-id' })), Times.once());
    });

    it('should throw error if attempted reply on message without id', async () => {
      const postMessage = Mock.ofType<(message: any) => void>();
      const messageSenderReceiver: any = { onmessage: undefined, postMessage: postMessage.object };
      const context = makeActorContext(messageSenderReceiver);
      let capturedMessage: any;
      context.receiveMessage((message) => {
        capturedMessage = message;
      });

      messageSenderReceiver.onmessage({ data: { } });

      expect(() => capturedMessage[REPLY]({ })).to.throw('cannot reply to message without id');
      postMessage.verify(fn => fn(It.isAny()), Times.never());
    });
  });
});
