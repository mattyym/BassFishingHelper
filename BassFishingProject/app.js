
const el = (id) => document.getElementById(id);
const speciesEl = el('species');
const waterTempEl = el('waterTemp');
const clarityEl = el('clarity');
const goBtn = el('go');
const statusEl = el('status');
const conditionsEl = el('conditions');
const resultsEl = el('results');

function classifyClouds(percent) {
  if (percent <= 20) return 'clear';
  if (percent <= 60) return 'partly';
  return 'overcast';
}
function classifyWind(mph) {
  if (mph < 5) return 'calm';
  if (mph <= 12) return 'breezy';
  return 'windy';
}
function round1(n) { return Math.round(n * 10) / 10; }

function inferSeason({ month, airTempF, waterTempF }) {
  const t = (typeof waterTempF === 'number') ? waterTempF : airTempF;
  if (t < 48) return 'winter';
  if (t >= 48 && t < 55) return 'pre-spawn';
  if (t >= 55 && t < 68) return 'spawn';
  if (t >= 65 && t < 75) return 'post-spawn';
  if (t >= 75 && month >= 6 && month <= 8) return 'summer'; // Jun-Aug 
  return 'fall';
}

function recommendByRules(c) {
  const base = [];


  if (c.species === 'smallmouth') {
    if (c.season === 'pre-spawn') {
      base.push(
        pick('3.5" tube', 'green pumpkin/black flake', '1/8–3/16 oz', 'Drag/pop across rocky points.'),
        pick('Suspending jerkbait', 'silver/blue', '', 'Twitch with 3–5s pauses.'),
        pick('3" finesse swimbait', 'natural shad', '1/8 oz', 'Slow roll near bottom on points.')
      );
    } else if (c.season === 'spawn') {
      base.push(
        pick('Ned rig', 'green pumpkin', '1/10–1/6 oz', 'Sight-fish beds or adjacent flats.'),
        pick('Tube', 'smoke/black flake', '1/8 oz', 'Short hops around beds/rock.')
      );
    } else if (c.season === 'summer') {
      base.push(
        pick('Drop shot', 'baitfish colors', '1/4 oz', 'Humps/rock piles; keep bait just off bottom.'),
        pick('Spinnerbait (double willow)', 'white', '3/8 oz', 'Wind on flats; cover water.')
      );
    } else if (c.season === 'fall') {
      base.push(
        pick('Flat-side crank', 'shad', '1/4–3/8 oz', 'Parallel rock banks; steady retrieve.'),
        pick('Swimbait 3–3.8"', 'natural', '1/8–3/16 oz', 'Chase bait schools on points.')
      );
    } else if (c.season === 'post-spawn') {
      base.push(
        pick('Topwater walking bait', 'bone', '', 'Low light over flats and points.'),
        pick('Ned rig', 'green pumpkin', '1/10–1/6 oz', 'Pick off roaming fish.')
      );
    } else { // winter
      base.push(
        pick('Jerkbait', 'ghost minnow', '', 'Long 5–10s pauses; suspend over 8–15 ft.'),
        pick('Football jig', 'green pumpkin', '3/8 oz', 'Drag slowly on rocks.')
      );
    }
  } else if (c.species === 'largemouth') {
    if (c.season === 'summer') {
      base.push(
        pick('Texas-rig worm 7–10"', 'green pumpkin/Junebug', '3/16–1/4 oz', 'Edges of grass; slow lift and drop.'),
        pick('Chatterbait', 'white/chart', '3/8–1/2 oz', 'Windy banks or grass flats.'),
        pick('Frog (hollow body)', 'black', '', 'Over mats in low light.')
      );
    } else if (c.season === 'pre-spawn') {
      base.push(
        pick('Spinnerbait', 'white/chart', '3/8 oz', 'Windy staging banks.'),
        pick('Jerkbait', 'shad', '', '2–4s pauses near points.'),
        pick('Jig', 'gp/black-blue', '3/8 oz', 'Craw around wood/rock.')
      );
    } else if (c.season === 'spawn') {
      base.push(
        pick('Texas-rig creature', 'white/gp', '1/8–1/4 oz', 'Pitch to beds/cover.'),
        pick('Wacky senko 5"', 'gp', '', 'Skip docks; slow sink.')
      );
    } else if (c.season === 'post-spawn') {
      base.push(
        pick('Topwater popper', 'bone', '', 'Early/late; shade lines.'),
        pick('Swim jig', 'white/shad', '1/4 oz', 'Bluegill or shad spawn banks.')
      );
    } else if (c.season === 'fall') {
      base.push(
        pick('Squarebill crank', 'shad', '1.5 size', 'Bang cover on shallow flats.'),
        pick('Chatterbait', 'white/shad', '3/8 oz', 'Wind + bait present.')
      );
    } else { // winter
      base.push(
        pick('Jig', 'black/blue', '3/8–1/2 oz', 'Slow crawl on steep rock.'),
        pick('Jerkbait', 'shad', '', 'Longer pauses on sunny points.')
      );
    }
  } else { // spotted
    if (c.season === 'summer') {
      base.push(
        pick('Drop shot', 'shad', '1/4 oz', 'Suspended fish over timber/points.'),
        pick('Underspin', 'white', '1/4 oz', 'Slow roll over bait balls.')
      );
    } else if (c.season === 'pre-spawn') {
      base.push(
        pick('Jerkbait', 'shad', '', 'Work over points with bait present.'),
        pick('Finesse swimbait 3–3.8"', 'natural', '1/8–3/16 oz', 'Count down to depth and slow roll.')
      );
    } else if (c.season === 'spawn') {
      base.push(
        pick('Neko rig', 'green pumpkin', '1/16–1/8 oz', 'Docks/rock transitions; shake lightly.')
      );
    } else if (c.season === 'post-spawn') {
      base.push(
        pick('Topwater walking bait', 'bone', '', 'Schoolers on points early/late.'),
        pick('Drop shot', 'natural', '3/16–1/4 oz', 'Watch electronics; vertical when possible.')
      );
    } else if (c.season === 'fall') {
      base.push(
        pick('Spinnerbait', 'white', '3/8 oz', 'Windy pockets chasing bait.'),
        pick('Alabama rig (check regs)', 'shad', '1/4 oz heads', 'Over suspended bait.')
      );
    } else { // winter
      base.push(
        pick('Jerkbait', 'ghost shad', '', 'Long pauses near bluff walls.'),
        pick('Finesse jig', 'gp', '5/16 oz', 'Drag slowly on rock humps.')
      );
    }
  }


  const notes = [];
  if (c.clarity === 'clear') {
    notes.push('Clear water → natural colors, lighter line, longer casts.');
    
  }
  if (c.clarity === 'muddy') {
    notes.push('Muddy water → darker/brighter colors, bulkier profiles, vibration.');
    base.push(pick('Chatterbait', 'black/blue or chart', '3/8–1/2 oz', 'Slow-rolled around cover.'));
  }
  if (c.cloud !== 'clear' || c.wind !== 'calm') {
    base.push(pick('Spinnerbait (double willow)', 'white/chart', '3/8 oz', 'Great with wind/overcast; cover water.'));
  }
  if (typeof c.waterTempF === 'number' && c.waterTempF < 45) {
    notes.push('Cold water → slow down; extend jerkbait pauses; drag bottom presentations.');
  }

  
  const unique = [];
  const seen = new Set();
  for (const p of base) {
    const key = `${p.lure}|${p.color}|${p.weight}|${p.tech}`;
    if (!seen.has(key)) { unique.push(p); seen.add(key); }
    if (unique.length >= 4) break;
  }
  return { picks: unique, notes };
}

function pick(lure, color, weight, tech) {
  return {
    lure: lure,
    color: color,
    weight: weight,
    tech: tech
  };
}

async function callLocalAI(conditions) {
  const res = await fetch('http://localhost:3000/ai-recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conditions)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI HTTP ${res.status}: ${errText}`);
  }

  return res.json();
}


goBtn.addEventListener('click', async () => {
  resultsEl.classList.add('hidden');
  conditionsEl.classList.add('hidden');
  statusEl.textContent = 'Getting your location…';

  try {
    const position = await getPosition();
    const { latitude: lat, longitude: lon } = position.coords;

    statusEl.textContent = 'Fetching weather…';
    const weather = await fetchWeather(lat, lon);

    const species = speciesEl.value;
    const airTempF = weather.main?.temp;
    const windMph = weather.wind?.speed;
    const cloudPct = weather.clouds?.all ?? 0;
    const cloud = classifyClouds(cloudPct);
    const wind = classifyWind(windMph ?? 0);
    const waterTempF = parseOptionalFloat(waterTempEl.value);
    const clarity = clarityEl.value || undefined;
    const now = new Date();
    const month = now.getMonth() + 1;

    const season = inferSeason({ month, airTempF, waterTempF });


        const payload = {
      species,
      season,
      airTempF,
      waterTempF,                 
      cloud,                      
      wind,                       
      waterClarity: clarity,      
      timeOfDay: getTimeBucket(now),
      lat, lon,
      locationName: prettyPlace(weather)
    };


    let usedAI = false;
    try {
      statusEl.textContent = 'Asking local AI…';
      const { recommendations, notes } = await callLocalAI(payload);

      const picks = (recommendations || []).map(r => ({
        lure: r.lure,
        color: r.color || '',
        weight: r.weight || '',
        tech: r.technique
      }));

      renderConditions({ season, airTempF, waterTempF, cloud, wind, locationName: prettyPlace(weather) });
      renderResults(picks, notes || recommendations?.[0]?.why || []);
      usedAI = true;
      statusEl.textContent = '';
    } catch (e) {
      console.warn('Local AI failed, using rule engine:', e);
    }

    if (!usedAI) {
      const { picks, notes } = recommendByRules({ species, season, waterTempF, cloud, wind, clarity });
      renderConditions({ season, airTempF, waterTempF, cloud, wind, locationName: prettyPlace(weather) });
      renderResults(picks, notes);
      statusEl.textContent = '(Local AI unavailable — showing rule-based picks)';
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = String(err.message || err || 'Something went wrong.');
  }
});

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error('Geolocation not supported.'));
    navigator.geolocation.getCurrentPosition(resolve, (e) => {
      reject(new Error(e.message || 'Unable to get location. Check permissions.'));
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  });
}

async function fetchWeather(lat, lon) {
  const res = await fetch(`/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Weather error (${res.status}): ${msg}`);
  }
  return res.json();
}

function parseOptionalFloat(v) {
  if (v === null || v === undefined || String(v).trim() === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function getTimeBucket(d) {
  const h = d.getHours();
  if (h <= 8 || h >= 19) return 'low-light';
  if (h <= 16) return 'midday';
  return 'evening';
}

function prettyPlace(weather) {
  const city = weather.name;
  const country = weather.sys?.country;
  return [city, country].filter(Boolean).join(', ') || 'Your area';
}

function renderConditions({ season, airTempF, waterTempF, cloud, wind, locationName }) {
  conditionsEl.innerHTML = `
    <h2>Today’s Conditions</h2>
    <div class="chips">
      <span class="chip">${locationName}</span>
      <span class="chip">Season: ${cap(season)}</span>
      <span class="chip">Air: ${Math.round(airTempF)}°F</span>
      ${typeof waterTempF === 'number' ? `<span class="chip">Water: ${Math.round(waterTempF)}°F</span>` : ''}
      <span class="chip">Clouds: ${cap(cloud)}</span>
      <span class="chip">Wind: ${cap(wind)}</span>
    </div>
  `;
  conditionsEl.classList.remove('hidden');
}
function renderResults(picks, notes) {
  const tiles = picks.map(p => `
    <div class="tile">
      <h3>${p.lure}</h3>
      <p class="hint">${[p.color, p.weight].filter(Boolean).join(' • ')}</p>
      <p>${p.tech}</p>
    </div>
  `).join('');
  const why = notes.length ? `<div class="tile"><h3>Why these work</h3>${notes.map(n=>`<p class="hint">• ${n}</p>`).join('')}</div>` : '';
  resultsEl.innerHTML = `
    <h2>Recommendations</h2>
    <div class="grid">${tiles}${why}</div>
  `;
  resultsEl.classList.remove('hidden');
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
