import { createContext } from "react";

export const PlayerContext = createContext({
  nowPlaying: "",
  setNowPlaying: (channelName: string) => {},
});
