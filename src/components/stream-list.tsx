"use client";

import type { ChStream } from '../lib/types/stream';

interface StreamListProps {
  streams: ChStream[];
  setNowPlaying: (stream: ChStream) => void;
  showOnlyEnabled?: boolean;
}

export default function StreamList(props: StreamListProps) {
  const { streams, setNowPlaying, showOnlyEnabled = false } = props;
  
  // Filter streams based on availability if requested
  const filteredStreams = showOnlyEnabled 
    ? streams.filter(stream => stream.enabled !== false)
    : streams;
  
  const enabledCount = streams.filter(stream => stream.enabled === true).length;
  const disabledCount = streams.filter(stream => stream.enabled === false).length;
  const unknownCount = streams.length - enabledCount - disabledCount;
  
  return (
    <div className="w-56 h-180 overflow-y-auto p-2">
      {/* Stream stats header */}
      {(enabledCount > 0 || disabledCount > 0) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-semibold mb-2">Stream Status</div>
          <div className="space-y-1">
            {enabledCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Working: {enabledCount}</span>
              </div>
            )}
            {disabledCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Broken: {disabledCount}</span>
              </div>
            )}
            {unknownCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span>Untested: {unknownCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {filteredStreams.map((channel) => (
        <div key={channel.name} className="w-full max-w-3xl mb-2">
          <h2 className="text-2xl font-bold">{channel.name}</h2>
          <div className="flex flex-col">
            <div
              className={`p-2 rounded relative cursor-pointer transition-colors ${
                channel.enabled === false 
                  ? 'bg-red-100 opacity-60' 
                  : channel.enabled === true 
                    ? 'bg-green-100 hover:bg-green-200' 
                    : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => {
                if (channel.enabled !== false) {
                  setNowPlaying({
                    ...channel,

                    url: channel.url.startsWith("http:")
                      ? channel.url.replace("http:", "https:")
                      : channel.url,
                  });
                }
              }}
            >
              {/* Status indicator */}
              <div className="absolute top-2 right-2">
                {channel.enabled === true && (
                  <span className="w-3 h-3 bg-green-500 rounded-full block" title="Stream is working"></span>
                )}
                {channel.enabled === false && (
                  <span className="w-3 h-3 bg-red-500 rounded-full block" title="Stream is broken"></span>
                )}
                {channel.enabled === undefined && (
                  <span className="w-3 h-3 bg-gray-400 rounded-full block" title="Stream not tested"></span>
                )}
              </div>
              
              <img
                src={channel.logo}
                alt={`${channel.name} logo`}
                className="w-16 h-16"
              />
              <span className="font-semibold">{channel.name}</span>
              
              {/* Stream status text */}
              {channel.enabled === false && (
                <div className="text-xs text-red-600 mt-1">⚠️ Stream unavailable</div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {filteredStreams.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No streams available
          {showOnlyEnabled && <div className="text-xs mt-1">Try disabling the "working only" filter</div>}
        </div>
      )}
    </div>
  );
}
