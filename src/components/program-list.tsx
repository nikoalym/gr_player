"use server";
import { getProgramms, type Programm } from "@/lib/data/schedule";

function isCurrentlyPlaying(program: Programm, nextProgram?: Programm): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Parse program time (assuming format like "14:30" or "14:30:00")
  const timeMatch = program.programmTime.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return false;
  
  const programStart = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
  
  // If there's a next program, use its time as end time
  if (nextProgram) {
    const nextTimeMatch = nextProgram.programmTime.match(/(\d{1,2}):(\d{2})/);
    if (nextTimeMatch) {
      const programEnd = parseInt(nextTimeMatch[1]) * 60 + parseInt(nextTimeMatch[2]);
      return currentTime >= programStart && currentTime < programEnd;
    }
  }
  
  // If no next program, assume this program runs until end of day or for 2 hours max
  const assumedEndTime = Math.min(programStart + 120, 24 * 60); // 2 hours or end of day
  return currentTime >= programStart && currentTime < assumedEndTime;
}

export default async function ProgrammList() {
  const pro = await getProgramms();

  return (
    <div className="w-56 h-180 overflow-y-auto m-2">
      {pro.map((channel) => (
        <div key={channel.channel} className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">{channel.channel}</h2>
          <ul className="list-disc pl-2">
            {channel.programms.map((program, index) => {
              const nextProgram = channel.programms[index + 1];
              const isPlaying = isCurrentlyPlaying(program, nextProgram);
              
              return (
                <li 
                  key={index} 
                  className={`m-2 p-2 rounded ${
                    isPlaying 
                      ? 'bg-green-200 border-l-4 border-green-500 font-bold text-black' 
                      : ''
                  }`}
                >
                  <span className="font-semibold">{program.programmName}</span> -{" "}
                  <span>{program.programmTime}</span>
                  {isPlaying && <span className="ml-2 text-green-700">🔴 NOW</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
