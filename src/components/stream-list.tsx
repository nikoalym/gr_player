"use client";

interface StreamListProps {
  streams: ChStream[];
  setNowPlaying: (stream: ChStream) => void;
  showOnlyEnabled?: boolean;
}

export default function StreamList(props: StreamListProps) {
  const { streams, setNowPlaying } = props;

  return (
    <>
      {streams.map((channel) => (
        <div key={channel.name} className="w-full max-w-3xl mb-2 flex flex-col">
          <div
            className={`p-2 rounded relative cursor-pointer ${
              channel.enabled === false
                ? "bg-red-100 opacity-50 "
                : channel.enabled === true
                ? "bg-gray-500 hover:bg-gray-300"
                : "bg-yellow-200 hover:bg-yellow-100"
            }`}
            onClick={() => {
              if (channel.enabled !== false) {
                setNowPlaying({
                  ...channel,

                  url: channel.url,
                });
              }
            }}
          >
            {/* Status indicator */}
            <div className="absolute top-2 right-2">
              {channel.enabled === true && (
                <span
                  className="w-3 h-3 bg-green-500 rounded-full block"
                  title="Stream is working"
                ></span>
              )}
              {channel.enabled === false && (
                <span
                  className="w-3 h-3 bg-red-500 rounded-full block"
                  title="Stream is broken"
                ></span>
              )}
              {channel.enabled === undefined && (
                <span
                  className="w-3 h-3 bg-gray-400 rounded-full block"
                  title="Stream not tested"
                ></span>
              )}
            </div>

            <span
              className={`font-semibold ${
                channel.enabled ? "text-white" : "text-gray-400"
              }`}
            >
              {channel.name}
            </span>

            {/* Stream status text */}
            {channel.enabled === false && (
              <div className="text-xs text-red-600 mt-1">
                ⚠️ Stream unavailable
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
