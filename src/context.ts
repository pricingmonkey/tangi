import { v1 } from 'uuid';

import { TypedMessageEvent, MessageSenderReceiver } from './types';
import { assignJob, Jobs, resolveJob } from './jobs';
import { timeout } from './timeout';

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

export type MessageFactory<T> = (id: string) => T;
export type AskOptions = { timeout: number };
export declare type MessageHandler<In extends { tag: string }, ResponseMap extends Record<In['tag'], any>> = (message: In & WithReply) => ResponseMap[In['tag']];

export type ActorContext<Out, In extends { tag: string }, ResponseMap extends Record<In['tag'], any> = any> = {
  ask<E, A>(makeMessage: MessageFactory<Out>, options?: AskOptions): Promise<Either<E, A>>;
  tell(message: Out): void;
  receiveMessage(onMessage: MessageHandler<In, ResponseMap>): void;
};

/**
 * See https://doc.akka.io/docs/akka/current/typed/interaction-patterns.html
 */

export const UNSAFE_REPLY = Symbol.for('@reply');
/** @deprecated use UNSAFE_REPLY instead. */
export const REPLY = Symbol.for('@reply');
export type WithReply = {
  [UNSAFE_REPLY]: (message: Either<any, any>) => void
  /** @deprecated use UNSAFE_REPLY instead. */
  [REPLY]: (message: Either<any, any>) => void
};
export const makeAdvancedActorContext = (logger: Logger = NO_LOGGER) =>
  async <Out, In extends { tag: string }, ResponseMap extends Record<In['tag'], any> = any>(messageSenderReceiverOrAsyncConstructor: MessageSenderReceiver<Out, In> | (() => Promise<MessageSenderReceiver<Out, In>>)): Promise<ActorContext<Out, In, ResponseMap>> => {
    type MessageWithReplyFn = In & WithReply;
    let onReceiveMessage: ((ev: MessageWithReplyFn) => ResponseMap[MessageWithReplyFn['tag']]) | undefined = undefined;
    const jobs: Jobs = {};
    const messageSenderReceiver = typeof messageSenderReceiverOrAsyncConstructor === 'function' ? await messageSenderReceiverOrAsyncConstructor() : messageSenderReceiverOrAsyncConstructor;
    messageSenderReceiver.onmessage = (ev: TypedMessageEvent<In>) => {
      const data: any = ev.data;
      if (jobs[data.id]) {
        resolveJob(jobs, data.id, data);
      } else {
        if (onReceiveMessage) {
          data[REPLY] = data[UNSAFE_REPLY] = (response: any) => {
            reply(data.id, response);
          };
          const response: any = onReceiveMessage(data);
          if (response instanceof Promise) {
            return response.then(r => {
              if (r !== undefined) {
                reply(data.id, r);
              }
            });
          } else {
            if (response !== undefined) {
              reply(data.id, response);
            }
          }
        } else {
          logger.warn('unhandled message: ' + JSON.stringify(data));
        }
      }
    };

    const ask = <E, A>(makeMessage: (id: string) => Out, options = { timeout: 30000 }): Promise<Either<E, A>> => {
      const id = v1();
      const promiseOfResult = assignJob<Either<E, A>>(jobs, id);
      messageSenderReceiver.postMessage(makeMessage(id));
      return timeout(promiseOfResult, options.timeout);
    };

    const reply = (id: string, response: Either<any, any>): void => {
      if (id === undefined || id === null) {
        throw new Error('cannot reply to message without id');
      }
      const message = { id, ...response };
      messageSenderReceiver.postMessage(message as any);
    };

    const tell = (message: Out): void => {
      messageSenderReceiver.postMessage(message);
    };

    const receiveMessage = <M extends MessageWithReplyFn> (onMessage: (message: M) => ResponseMap[M['tag']]) => {
      if (onReceiveMessage) {
        logger.warn('Overriding existing receiveMessage handler!');
      }
      onReceiveMessage = onMessage;
    };
    return { ask, tell, receiveMessage };
  };

const consoleLogger = { warn: (msg: string) => console.warn(msg) };
export const makeActorContext = makeAdvancedActorContext(consoleLogger);
