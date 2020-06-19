export interface TypedMessageEvent<D> extends MessageEvent {
  readonly data: D;
}

interface WorkerEventMap<D> extends AbstractWorkerEventMap {
  'message': TypedMessageEvent<D>;
}

export interface MessageSenderReceiver<Out, In> {
  onmessage: ((this: this, ev: TypedMessageEvent<In>) => any) | null;

  postMessage(message: Out, transfer: Transferable[]): void;

  postMessage(message: Out, options?: PostMessageOptions): void;

  addEventListener<K extends keyof WorkerEventMap<In>>(type: K, listener: (this: this, ev: WorkerEventMap<In>[K]) => any, options?: boolean | AddEventListenerOptions): void;
}