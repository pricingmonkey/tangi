import {makeMultiChannelActorContext} from "@pricingmonkey/tangi";

for await (const local of makeMultiChannelActorContext((resolve) => {
  self.onconnect = event => {
    resolve(event.ports[0]);
  }
})) {
  local.receiveMessage(msg => {
    if (msg._tag === 'PING') {
      return { _tag: "PONG" };
    }
  });
}
