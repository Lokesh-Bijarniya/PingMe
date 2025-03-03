import Peer from 'simple-peer';

export const createPeer = (initiator, stream) => {
  const peer = new Peer({
    initiator,
    trickle: false,
    stream
  });

  return peer;
};

export const handleSignal = (peer, signal) => {
  peer.signal(signal);
};