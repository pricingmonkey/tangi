import { makeActorContext, REPLY } from '../src/context';
import { It, Mock, Times } from 'typemoq';
import { expect } from 'chai';

describe('actor context', () => {
  it('should support ask pattern of communication and receive reply', async () => {
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
