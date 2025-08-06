// Test script to demonstrate the M3U parser
const testM3U = `#EXTM3U
#EXTINF:-1 group-title="ΠΑΝΕΛΛΑΔΙΚΑ" tvg-name="ERT 1" tvg-logo="https://i.imgur.com/Dd3HM0I.png",ERT1 HD
http://ert-live-bcbs15228.siliconweb.com/media/ert_1/ert_1_3Mbps.m3u8
#EXTINF:-1 group-title="ΠΑΝΕΛΛΑΔΙΚΑ" tvg-name="ERT 2" tvg-logo="https://i.imgur.com/cpzgu5L.png",ERT2 HD
http://ert-live-bcbs15228.siliconweb.com/media/ert_2/ert_2_3Mbps.m3u8
#EXTINF:900 group-title="ΠΑΝΕΛΛΑΔΙΚΑ" tvg-name="megatv.com" tvg-logo="https://i.imgur.com/yyp6tS5.png",MEGA HD
https://streamcdnm17-c98db5952cb54b358365984178fb898a.msvdn.net/live/S86713049/gonOwuUacAxM/playlist.m3u8`;

function parseM3U(content) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const channels = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#EXTINF:')) {
      const extinf = line;
      const url = lines[i + 1];
      
      if (url && !url.startsWith('#')) {
        const channel = parseEXTINF(extinf, url);
        if (channel) {
          channels.push(channel);
        }
        i++;
      }
    }
  }
  
  return channels;
}

function parseEXTINF(extinf, url) {
  try {
    const durationMatch = extinf.match(/#EXTINF:([^,\s]+)/);
    const duration = durationMatch ? parseFloat(durationMatch[1]) : undefined;
    
    const groupMatch = extinf.match(/group-title="([^"]+)"/);
    const tvgNameMatch = extinf.match(/tvg-name="([^"]+)"/);
    const logoMatch = extinf.match(/tvg-logo="([^"]+)"/);
    const nameMatch = extinf.match(/,([^,]+)$/);
    
    const group = groupMatch ? groupMatch[1] : 'Unknown';
    const tvgName = tvgNameMatch ? tvgNameMatch[1] : undefined;
    const logo = logoMatch ? logoMatch[1] : undefined;
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
    
    return {
      name,
      url: url.trim(),
      logo,
      group,
      tvgName,
      duration: duration !== -1 ? duration : undefined
    };
  } catch (error) {
    console.error("Error parsing EXTINF line:", extinf, error);
    return null;
  }
}

// Test the parser
const result = parseM3U(testM3U);
console.log(JSON.stringify(result, null, 2));
