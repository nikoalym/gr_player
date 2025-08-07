"use client";
import { useState } from "react";
import StreamList from "./stream-list";
import StreamStats from "./stream-stats";
import VideoJS from "./videojs";

interface PlayerShellProps {
  streams: ChStream[];
}

export default function PlayerShell(props: PlayerShellProps) {
  const { streams } = props;
  const [nowPlaying, setNowPlaying] = useState<ChStream>();

  return (
    <div className="md:flex md:flex-row flex flex-col flex-1 min-h-screen">
      <div className="md:border-r md:h-screen md:overflow-y-auto p-2 flex flex-col">
        <StreamStats streams={streams} nowPlaying={nowPlaying} />
        <StreamList streams={streams} setNowPlaying={setNowPlaying} />
      </div>

      {/* Video player */}
      <div className="flex-1 bg-black">
        <VideoJS
          options={{
            src: nowPlaying?.url,
            autoplay: true,
            controls: true,
            fluid: true,
          }}
        />
      </div>
    </div>
  );
}
