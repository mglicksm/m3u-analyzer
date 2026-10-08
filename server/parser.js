// server/parser.js

function parseM3U8(content) {
  const lines = content.split(/\r?\n/);
  const tracks = [];
  const artistCounts = {};
  const trackMap = new Map();
  const duplicates = [];

  let currentTrack = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Line format: #EXTINF:241, Dido - White Flag
      const info = line.substring(8);
      const commaIndex = info.indexOf(',');
      
      let duration = 0;
      let meta = info;

      if (commaIndex !== -1) {
        duration = parseInt(info.substring(0, commaIndex), 10) || 0;
        meta = info.substring(commaIndex + 1).trim();
      }

      // Split "Artist - Title"
      let artist = 'Unknown Artist';
      let title = meta;

      const hyphenIndex = meta.indexOf(' - ');
      if (hyphenIndex !== -1) {
        artist = meta.substring(0, hyphenIndex).trim();
        title = meta.substring(hyphenIndex + 3).trim();
      }

      currentTrack = { duration, artist, title };
    } else if (!line.startsWith('#')) {
      // This is the file path line following an #EXTINF line
      if (currentTrack) {
        currentTrack.path = line;
        tracks.push(currentTrack);

        // Aggregate artist counts
        artistCounts[currentTrack.artist] = (artistCounts[currentTrack.artist] || 0) + 1;

        // Duplicate detection key (case-insensitive)
        const dedupKey = `${currentTrack.artist.toLowerCase()}|||${currentTrack.title.toLowerCase()}`;
        if (trackMap.has(dedupKey)) {
          duplicates.push({
            original: trackMap.get(dedupKey),
            duplicate: currentTrack
          });
        } else {
          trackMap.set(dedupKey, currentTrack);
        }

        currentTrack = null;
      }
    }
  }

  // Calculate top artists sorted by track count
  const topArtists = Object.entries(artistCounts)
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count);

  const totalDurationSeconds = tracks.reduce((sum, t) => sum + t.duration, 0);

  return {
    summary: {
      totalTracks: tracks.length,
      totalUniqueArtists: Object.keys(artistCounts).length,
      totalDurationSeconds,
      duplicateCount: duplicates.length
    },
    topArtists,
    duplicates,
    tracks
  };
}

module.exports = { parseM3U8 };