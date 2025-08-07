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
    <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm">
      <div className="font-semibold mb-2">Stream Status</div>
      <div className="text-xs text-gray-400 mb-2">Updated: {lastUpdated}</div>
      <div className="space-y-1">
        {nowPlaying && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Now Playing:</span>{" "}
            <span>{nowPlaying.name}</span>
          </div>
        )}

        {(enabledCount > 0 || disabledCount > 0) && (
          <div className="mb-4  bg-gray-700 rounded-lg text-sm">
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
      </div>
    </div>
  );
}
