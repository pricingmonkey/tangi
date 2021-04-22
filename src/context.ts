import { v1 } from 'uuid';

import { TypedMessageEvent, MessageSenderReceiver } from './types';
import { assignJob, Jobs, resolveJob } from './jobs';

interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}

interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}

type Either<E, A> = Left<E> | Right<A>;

type Logger = {
  warn: (msg: string) => void
};
const NO_LOGGER = { warn: () => undefined };

export type MessageHandler<T> = (message: T & WithReply) => void;
export type MessageFactory<T> = (id: string) => T;

export type ActorContext<Out, In> = {
  ask<E, A>(makeMessage: MessageFactory<Out>): Promise<Either<E, A>>;
  tell(message: Out): void;
  receiveMessage(onMessage: MessageHandler<In>): void;
};

/**
 * See https://doc.akka.io/docs/akka/current/typed/interaction-patterns.html
 */
export const REPLY = Symbol.for('@reply');
export type WithReply = { [REPLY]: (message: Either<any, any>) => void };
export const makeAdvancedActorContext = (logger: Logger = NO_LOGGER) =>
  <Out, In>(messageSenderReceiver: MessageSenderReceiver<Out, In>): ActorContext<Out, In> => {
    type MessageWithReplyFn = In & WithReply;
    let onReceiveMessage: ((ev: MessageWithReplyFn) => void) | undefined = undefined;
    const jobs: Jobs = {};
    messageSenderReceiver.onmessage = (ev: TypedMessageEvent<In>) => {
      const data: any = ev.data;
      if (jobs[data.id]) {
        resolveJob(jobs, data.id, data);
      } else {
        if (onReceiveMessage) {
          data[REPLY] = (response: any) => {
            if (data.id) {
              reply({ id: data.id, ...response });
            } else {
              throw new Error('cannot reply to message without id');
            }
          };
          onReceiveMessage(data);
        } else {
          logger.warn('unhandled message: ' + JSON.stringify(data));
        }
      }
    };

    const ask = <E, A>(makeMessage: (id: string) => Out): Promise<Either<E, A>> => {
      const id = v1();
      const promiseOfResult = assignJob<Either<E, A>>(jobs, id);
      messageSenderReceiver.postMessage(makeMessage(id));
      return promiseOfResult;
    };

    const reply = (message: Either<any, any> & { id: string }): void => {
      messageSenderReceiver.postMessage(message as any);
    };

    const tell = (message: Out): void => {
      messageSenderReceiver.postMessage(message);
    };

    const receiveMessage = (onMessage: (message: MessageWithReplyFn) => void) => {
      if (onReceiveMessage) {
        logger.warn('Overriding existing receiveMessage handler!');
      }
      onReceiveMessage = onMessage;
    };
    return { ask, tell, receiveMessage };
  };

const consoleLogger = { warn: (msg: string) => console.warn(msg) };
export const makeActorContext = makeAdvancedActorContext(consoleLogger);
