# 👧 tangi

ತಂಗಿ [tangi] [Kan.](https://en.wikipedia.org/wiki/Kannada) younger sister  
ಅಕ್ಕ [akka] [Kan.](https://en.wikipedia.org/wiki/Kannada) older sister

Lightweight actor library for Web Workers inspired by [Akka](https://doc.akka.io).

## What is this?

Type-safe, production-ready and lightweight messaging layer for Web Workers.

## Why?

For people to scale Web Workers beyond the simple patterns of communication.

## Basic usage

Run `npx http-server .` and open index.html:

**index.html**
```html
<script type="module">
import { makeActorContext } from "https://esm.sh/@pricingmonkey/tangi";

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
const workerRemoteContext = await makeActorContext(worker);
const response = await workerRemoteContext.ask(id => ({ _tag: "PING", id }));
switch (response._tag) {
  case "Right": {  
    console.log(response.right);
    break;
  }
  case "Left": {  
    console.error(response.left);
    break;
  }
}
</script>
```

**worker.js**
```javascript
import { makeActorContext } from "https://esm.sh/@pricingmonkey/tangi";

const workerLocalContext = await makeActorContext(self);
workerLocalContext.receiveMessage(message => {
  switch (message._tag) {
    case "PING": {
      return { _tag: "Right", right: "PONG" };
    }  
  }
});
```

## Running demo projects

- `node_modules/.bin/webpack serve --mode development --host 0.0.0.0 --progress --no-client-overlay-warnings --config demo-shared/webpack.config.js`
- `node_modules/.bin/webpack serve --mode development --host 0.0.0.0 --progress --no-client-overlay-warnings --config demo/webpack.config.js`

## Interaction patterns (TypeScript)

Best served with:
- https://github.com/webpack-contrib/worker-loader

#### Fire and forget

Use `workerRemoteContext.tell({ _tag: "FIRE" })`. See example below:

**messages.ts**
```typescript
type FireMessage = {
  _tag: "FIRE";
}
```

**main.ts**
```typescript
import { makeActorContext } from "tangi";
import { FireMessage } from "./messages";

const worker = new (require("worker-loader!./worker"))();
const workerRemoteContext = await makeActorContext<FireMessage, never>(worker);
workerRemoteContext.tell({ _tag: "FIRE" });
```

**worker.ts**
```typescript
import { makeActorContext } from "tangi";
import { FireMessage } from "./messages";

const workerLocalContext = await makeActorContext<never, FireMessage>(self as any);
workerLocalContext.receiveMessage(message => {
  switch (message._tag) {
    case "FIRE": {
      // trigger some logic in the WebWorker
    }  
  }
});
```

#### Request-response

Use `workerRemoteContext.ask({ _tag: "PING" })` combined with `workerLocalContext.receiveMessage({ _tag: "PING" })`. See example below:

**messages.ts**
```typescript
type PingMessage = {
  _tag: "PING";
}

type PongMessage = {
  _tag: "PONG";
}
```

**main.ts**
```typescript
import { makeActorContext } from "tangi";
import { PingMessage, PongMessage } from "./messages";

const worker = new (require("worker-loader!./worker"))();
const workerRemoteContext = await makeActorContext<PingMessage, never>(worker);
const response = await workerRemoteContext.ask<string, PongMessage>(id => ({ _tag: "PING", id }));
console.log(response)
```

**worker.ts**
```typescript
import { makeActorContext } from "tangi";
import { PongMessage } from "./messages";

const workerLocalContext = await makeActorContext<never, PongMessage>(self as any);
workerLocalContext.receiveMessage(message => {
  switch (message._tag) {
    case "PING": {
      return { _tag: "PONG" };
    }  
  }
});
```

#### Cancellation (single message)

**worker.ts**
```typescript
import { makeActorContext, makeCancellationOperator } from "tangi";

type PingMessage = {
  _tag: "PING";
  id: string;
}

type CancelMessage = {
  _tag: "CANCEL";
  id: string;
}

const makeTask = (killSwitch) => {
  return async () => {
    for (let i = 0; i < 100000; i++) {
      await fetch("http://example.org");
      if (killSwitch.isCancelled) {
        return;
      }
    }
  }
};

const workerLocalContext = await makeActorContext<never, PongMessage>(self as any);
const cancellationOperator = makeCancellationOperator();
workerLocalContext.receiveMessage(async message => {
  switch (message._tag) {
    case "PING": {
      const cancellableTask = cancellationOperator.register(message.id, message.id, makeTask);
      try {
        await task.promise();
      } finally {
        cancellationOperator.unregister(message.id, message.id);  
      }
      return;
    }
    case "CANCEL": {
      cancellationOperator.cancel(message.id);
      return;
    }
  }
});
```

#### Cancellation (message groups)

Use it to cancel multiple messages in a given group/context.

Similar to [Cancellation (single message)](#cancellation-single-message) and:
 - types become:
```typescript
type PingMessage = {
  _tag: "PING";
  groupId: string;
  id: string;
}

type CancelMessage = {
  _tag: "CANCEL";
  groupId: string;
  id: string;
}
```
- cancellation operator calls change to:
```typescript
cancellationOperator.register(message.contextId, message.id, task);
      
cancellationOperator.unregister(message.contextId, message.id);
      
cancellationOperator.cancel(message.contextId);
```

## License

[Blue Oak Model License](https://blueoakcouncil.org/license/1.0.0)
