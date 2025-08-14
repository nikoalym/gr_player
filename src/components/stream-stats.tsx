import Image from "next/image";

export default function StreamStats(props: {
  streams: ChStream[];
  nowPlaying?: ChStream;
}) {
  const { streams, nowPlaying } = props;

  const enabledCount = streams.filter(
    (stream) => stream.enabled === true
  ).length;
  const disabledCount = streams.filter(
    (stream) => stream.enabled === false
  ).length;
  const unknownCount = streams.length - enabledCount - disabledCount;
  return (
    <div className="mb-2 p-3 bg-gray-700 rounded-lg text-sm md:flex md:flex-col flex gap-3">
      <div className="flex items-center gap-2">
        <Image
          src="/favicon.ico"
          width={20}
          height={20}
          alt="GreekTV Player"
          className=" "
        />
        <span className="font-extrabold ">GreekTV Player</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Now Playing:</span>{" "}
        {nowPlaying && (
          <span className="font-bold flex-1 w-full">{nowPlaying.name}</span>
        )}
      </div>

      {(enabledCount > 0 || disabledCount > 0) && (
        <div className="flex items-center gap-2">
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
