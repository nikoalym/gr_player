"use client";
import { useState } from "react";
import type { ChStream } from "../lib/types/stream";
import StreamList from "./stream-list";
import VideoJS from "./videojs";

interface PlayerShellProps {
  streams: ChStream[];
}

export default function PlayerShell(props: PlayerShellProps) {
  const { streams } = props;
  const [nowPlaying, setNowPlaying] = useState<ChStream>();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Current playing info */}
      <div className="text-sm">
        <span className="font-medium">Now Playing:</span>{" "}
        {nowPlaying ? (
          <span className="flex items-center gap-2">
            {nowPlaying.name}
            {nowPlaying.enabled === true && (
              <span className="w-2 h-2 bg-green-500 rounded-full" />
            )}
            {nowPlaying.enabled === false && (
              <span className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </span>
        ) : (
          <span className="text-gray-500">Select a channel</span>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        <div className="w-80 border-r">
          <StreamList streams={streams} setNowPlaying={setNowPlaying} />
        </div>

        <div className="flex-1 flex flex-col">
          {/* Video player */}
          <div className="flex-1 bg-black">
            <VideoJS
              options={{
                src: nowPlaying?.url,
                autoplay: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
