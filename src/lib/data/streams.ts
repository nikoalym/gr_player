//https://raw.githubusercontent.com/free-greek-iptv/greek-iptv/beb997e089f6a8fd5b0d62251516f82dac392c3b/Greekstreamtv.m3u



export default async function getStreams(): Promise<ChStream[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/free-greek-iptv/greek-iptv/beb997e089f6a8fd5b0d62251516f82dac392c3b/Greekstreamtv.m3u",
      { next: { revalidate: 120} }
    );
    const text = await response.text();

    return parseM3U(text);
  } catch (error) {
    return [];
  }
}

function parseM3U(content: string): ChStream[] {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  const channels: ChStream[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for EXTINF lines
    if (line.startsWith("#EXTINF:")) {
      const extinf = line;
      const url = lines[i + 1]; // Next line should be the URL

      if (url && !url.startsWith("#")) {
        const channel = parseEXTINF(extinf, url);
        if (channel) {
          channels.push(channel);
        }
        i++; // Skip the URL line since we've processed it
      }
    }
  }

  return channels;
}

function parseEXTINF(extinf: string, url: string): ChStream | null {
  try {
    // Extract duration (number after EXTINF:)
    const durationMatch = extinf.match(/#EXTINF:([^,\s]+)/);
    const duration = durationMatch ? parseFloat(durationMatch[1]) : undefined;

    // Extract attributes using regex
    const groupMatch = extinf.match(/group-title="([^"]+)"/);
    const tvgNameMatch = extinf.match(/tvg-name="([^"]+)"/);
    const logoMatch = extinf.match(/tvg-logo="([^"]+)"/);

    // Extract channel name (text after the last comma)
    const nameMatch = extinf.match(/,([^,]+)$/);

    const group = groupMatch ? groupMatch[1] : "Unknown";
    const tvgName = tvgNameMatch ? tvgNameMatch[1] : undefined;
    const logo = logoMatch ? logoMatch[1] : undefined;
    const name = nameMatch ? nameMatch[1].trim() : "Unknown Channel";

    return {
      name,
      url: url.trim(),
      logo,
      group,
      tvgName,
      duration: duration !== -1 ? duration : undefined,
    };
  } catch (error) {
    console.error("Error parsing EXTINF line:", extinf, error);
    return null;
  }
}
