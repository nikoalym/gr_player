"use client";

interface StreamListProps {
  streams: ChStream[];
  setNowPlaying: (stream: ChStream) => void;
  showOnlyEnabled?: boolean;
}

export default function StreamList(props: StreamListProps) {
  const { streams, setNowPlaying } = props;

  return (
    <div className="flex md:flex md:flex-col gap-2 overflow-x-auto">
      {streams.map((channel) => (
        <div key={channel.name} className="flex flex-col w-fit ">
          <div
            className={`p-4 w-max rounded relative cursor-pointer ${
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
            <div className="absolute top-1 right-1">
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
    </div>
  );
}
