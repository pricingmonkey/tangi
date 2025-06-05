import { makeActorContext } from '@pricingmonkey/tangi';

const local = makeActorContext(self);
local.receiveMessage(msg => {
  if (msg._tag === 'PING') {
    return { _tag: 'PONG' };
  }
});
