"use client";
import React from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

export default function VideoJS(props: {
  options: {
    src?: string;
    autoplay?: boolean;

    controls?: true;
    fluid?: true;
  };
  onReady?: (player: Player) => void;
}) {
  const videoRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<Player | null>(null);
  const { options, onReady } = props;

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");

      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      }));

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      videojs.log("updating player options");

      const player = playerRef.current;

      videojs.on(player.el_, "error", () => {
        
        console.log("player error:", player.error());
      });

      player.src(options.src || "");
    }
  }, [onReady, options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;
    console.log("disposing player on unmount");
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return <div ref={videoRef} />;
}
