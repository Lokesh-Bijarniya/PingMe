import chatSocket from "./chatSocket";
import communitySocket from "./communitySocket";

export const setupSocketListeners = (dispatch) => {
  chatSocket.setupListeners(dispatch);
  communitySocket.setupListeners(dispatch);
};

export const cleanupSocketListeners = () => {
  chatSocket.cleanupListeners();
  communitySocket.cleanupListeners();
};
