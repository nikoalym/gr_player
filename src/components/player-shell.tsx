"use client";
import { useState } from "react";
import StreamList from "./stream-list";
import VideoJS from "./videojs";

interface PlayerShellProps {
  streams: ChStream[];
}

export default function PlayerShell(props: PlayerShellProps) {
  const { streams } = props;
  const [nowPlaying, setNowPlaying] = useState<ChStream>();

  return (
    <div className="flex">
      <div>Now Playing: {nowPlaying && nowPlaying.name}</div>
      <StreamList streams={streams} setNowPlaying={setNowPlaying} />
      <div>
        <VideoJS options={{ src: nowPlaying?.url, autoplay: true }} />
      </div>
    </div>
  );
}
