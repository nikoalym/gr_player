export default function StreamStats(props: {
  streams: ChStream[];
  nowPlaying?: ChStream;
}) {
  const { streams, nowPlaying } = props;
  const lastUpdated = new Date().toLocaleString();

  const enabledCount = streams.filter(
    (stream) => stream.enabled === true
  ).length;
  const disabledCount = streams.filter(
    (stream) => stream.enabled === false
  ).length;
  const unknownCount = streams.length - enabledCount - disabledCount;
  return (
    <div className="mb-2 p-3 bg-gray-700 rounded-lg text-sm md:flex md:flex-col flex gap-3 items-center">

      <div className="flex md:flex-col items-center gap-2">
        <span className="font-normal ">Stream Status:</span>
        <span className="text-xs text-gray-400 ">
          <span className="font-extrabold">{lastUpdated}</span>
        </span>
      </div>

      {nowPlaying && (
        <div className="flex items-center md:flex-col gap-2">
          <span className="font-medium">Now Playing:</span>{" "}
          <span className="font-bold flex-1 w-full">{nowPlaying.name}</span>
        </div>
      )}

      {(enabledCount > 0 || disabledCount > 0) && (
        <div className="bg-gray-700 rounded-lg text-sm flex md:flex-col gap-2 items-center">
          {enabledCount > 0 && (
            <span>
              Working: <span className="font-bold">{enabledCount}</span>
            </span>
          )}
          {disabledCount > 0 && (
            <span>
              Broken: <span className="font-bold">{disabledCount}</span>
            </span>
          )}
          {unknownCount > 0 && (
            <span>
              Untested: <span className="font-bold">{unknownCount}</span>
            </span>
          )}
        </div>
      )}

    </div>
  );
}
