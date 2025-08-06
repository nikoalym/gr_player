"use client";


interface StreamListProps {
  streams: ChStream[];
  setNowPlaying: (stream: ChStream) => void;
}

export default function StreamList(props: StreamListProps) {
  const { streams, setNowPlaying } = props;
  return (
    <div className="w-56 h-180 overflow-y-auto p-2">
      {streams.map((channel) => (
        <div key={channel.name} className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold ">{channel.name}</h2>
          <div className="flex flex-col">
            <div
              className="p-2 rounded bg-gray-100"
              onClick={() => setNowPlaying(channel)}
            >
              <img
                src={channel.logo}
                alt={`${channel.name} logo`}
                className="w-16 h-16 "
              />
              <span className="font-semibold">{channel.name}</span> -{" "}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
