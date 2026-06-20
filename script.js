let ARTICLES = [];


/* ============================================
   WIRELINE — data + behavior
   ============================================ */
const API_KEY = "797dc6ad864883533ea9a58cfa1f6d1c";

async function fetchNews(category = "all") {

  try {

    let url;

    switch(category){

      case "world":

        url = `https://gnews.io/api/v4/top-headlines?topic=world&lang=en&max=10&apikey=${API_KEY}`;

        break;

      case "tech":

        url = `https://gnews.io/api/v4/top-headlines?topic=technology&lang=en&max=10&apikey=${API_KEY}`;

        break;

      case "markets":

        url = `https://gnews.io/api/v4/top-headlines?topic=business&lang=en&max=10&apikey=${API_KEY}`;

        break;

      case "science":

        url = `https://gnews.io/api/v4/top-headlines?topic=science&lang=en&max=10&apikey=${API_KEY}`;

        break;

      case "culture":

        url = `https://gnews.io/api/v4/top-headlines?topic=entertainment&lang=en&max=10&apikey=${API_KEY}`;

        break;

      default:

        url = `https://gnews.io/api/v4/top-headlines?lang=en&max=30&apikey=${API_KEY}`;

    }

    const response = await fetch(url);

    const data = await response.json();

    ARTICLES = data.articles.map((article,index)=>({

      cat: category === "all" ? "world" : category,

      region: Math.floor(Math.random()*REGIONS.length),

      src: Math.floor(Math.random()*SOURCES.length),

      h: article.title,

      d: article.description || "No description available.",

      read: Math.floor(Math.random()*5)+2,

      lead: index === 0,

      bento: ["lg","md","sm","tall"][Math.floor(Math.random()*4)],

      image: article.image,

      url: article.url

    }));

    renderEverything();

  }

  catch(error){

    console.log(error);

  }

}

// ---- Sample aggregated article data (mock "global sources") ----
const SOURCES = ["Reuters Wire","AP Global","Associated Press","AFP","Bloomberg","The Guardian","Al Jazeera","Nikkei","DW News","BBC World","Reuters Markets","Kyodo News"];

const REGIONS = [
  {code:"LON", city:"London", offset:"UTC+0"},
  {code:"NYC", city:"New York", offset:"UTC-4"},
  {code:"TOK", city:"Tokyo", offset:"UTC+9"},
  {code:"DEL", city:"New Delhi", offset:"UTC+5:30"},
  {code:"NAI", city:"Nairobi", offset:"UTC+3"},
  {code:"SAO", city:"São Paulo", offset:"UTC-3"},
  {code:"BER", city:"Berlin", offset:"UTC+1"},
  {code:"SYD", city:"Sydney", offset:"UTC+10"},
  {code:"DXB", city:"Dubai", offset:"UTC+4"},
  {code:"SEL", city:"Seoul", offset:"UTC+9"},
];


// ---- Helpers ----
function regionOf(i){ return REGIONS[i]; }
function srcOf(i){ return SOURCES[i]; }

function timeAgo(hoursAgo){
  if(hoursAgo < 1) return "moments ago";
  if(hoursAgo < 24) return `${hoursAgo}h ago`;
  return `${Math.floor(hoursAgo/24)}d ago`;
}

// deterministic-ish fake "hours ago" per article index so it doesn't shuffle on re-render
function fakeHoursAgo(idx){
  return (idx * 3 + 1) % 30;
}

// ---- Render: Live Wire Ticker ----
function renderTicker(){
  const track = document.getElementById('wireTrack');
  const items = ARTICLES.slice(0, 12).map((a,i) => {
    const r = regionOf(a.region);
    return `<span><b>${r.code}</b> · ${a.h}</span>`;
  });
  // duplicate content for seamless loop
  track.innerHTML = items.join('') + items.join('');
}

// ---- Render: Lead story ----
function renderLead(){
  const lead = ARTICLES.find(a => a.lead);
  if(!lead) return;

const r = regionOf(lead.region);

  const el = document.getElementById('leadSection');
  el.innerHTML = `
    <div class="lead-card">
     <div class="lead-visual">

${
lead.image ?

`<img
src="${lead.image}"
class="lead-image">`

:

`<div class="lead-visual-grid"></div>
<div class="lead-visual-glyph">${r.code}</div>`

}

</div>
      <div class="lead-body">
        <span class="tag">Lead Story · ${capitalize(lead.cat)}</span>
        <h2 class="lead-headline">${lead.h}</h2>
        <p class="lead-dek">${lead.d}</p>
        <div class="lead-meta">
          <span class="dateline">${r.city.toUpperCase()} · ${r.offset}</span>
          <span class="dateline" style="opacity:.8">${srcOf(lead.src)}</span>
          <span class="feed-readtime">${lead.read} min read</span>
        </div>
      </div>
    </div>
  `;
}

// ---- Render: Bento grid ----
function renderBento(){
  const bentoArticles = ARTICLES.filter(a => a.bento);
  const grid = document.getElementById('bentoGrid');
  grid.innerHTML = bentoArticles.map(a => {
    const r = regionOf(a.region);
    const sizeClass = `bento-cell--${a.bento}`;
    const darkClass = a.dark ? 'bento-cell--dark' : '';
    return `
      <div class="bento-cell ${sizeClass} ${darkClass} glow">
        <div>
          <span class="bento-region">${r.city} · ${r.offset}</span>
        </div>
        <div>
          <span class="tag">${capitalize(a.cat)}</span>
          <p class="bento-headline" style="margin-top:10px;">${a.h}</p>
        </div>
      </div>
    `;
  }).join('');
}

// ---- Render: Source marquee ----
function renderSources(){
  const track = document.getElementById('sourceTrack');
  const items = SOURCES.map(s => `<span>${s}</span>`);
  track.innerHTML = items.join('') + items.join('');
}

// ---- Render: Feed grid (with filter + search) ----
let currentFilter = 'all';
let currentSearch = '';
let visibleCount = 9;

function getFilteredArticles(){

  return ARTICLES.filter(a => {

    return currentSearch === ''

    ||

    a.h.toLowerCase()

    .includes(currentSearch)

    ||

    a.d.toLowerCase()

    .includes(currentSearch);

  });

}

function renderFeed(){
  const filtered = getFilteredArticles();
  const grid = document.getElementById('feedGrid');
  const count = document.getElementById('resultsCount');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  if(filtered.length === 0){
    grid.innerHTML = `<p style="font-family:var(--font-mono); color:var(--stone); grid-column:1/-1; padding:40px 0;">No dispatches match that search. Try another desk or term.</p>`;
    count.textContent = "0 results";
    loadMoreBtn.style.display = 'none';
    return;
  }

  const toShow = filtered.slice(0, visibleCount);
  grid.innerHTML = toShow.map((a, idx) => {
    const realIdx = ARTICLES.indexOf(a);
    const r = regionOf(a.region);
    return `

<article class="feed-card">

${a.image ?

`<img
src="${a.image}"
class="feed-image">`

: ''}

<div class="feed-card-top">

<span class="tag">

${capitalize(a.cat)}

</span>

<span class="dateline">

${r.code}

</span>

</div>

<h3 class="feed-headline">

${a.h}

</h3>

<p class="feed-excerpt">

${a.d}

</p>

<a
href="${a.url}"
target="_blank"
class="feed-link">

Read Full Article →

</a>

<div class="feed-card-bottom">

<span class="feed-readtime">

${a.read} min

</span>

</div>

</article>

`;
  }).join('');

  count.textContent = currentFilter === 'all' && currentSearch === ''
    ? `showing all ${filtered.length} stories`
    : `${filtered.length} result${filtered.length === 1 ? '' : 's'} found`;

  loadMoreBtn.style.display = visibleCount < filtered.length ? 'block' : 'none';
}

function renderEverything(){

  renderLead();

  renderTicker();

  renderBento();

  renderFeed();

}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// ---- Date / clock ----
function renderDateMeta(){
  const now = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('dateMeta').textContent = now.toLocaleDateString('en-US', opts).toUpperCase();
}

function tickClock(){
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2,'0');
  const m = String(now.getUTCMinutes()).padStart(2,'0');
  const s = String(now.getUTCSeconds()).padStart(2,'0');
  document.getElementById('footerClock').textContent = `UTC ${h}:${m}:${s}`;
}

// ---- Event wiring ----
function initFilters(){

  const pills = document.querySelectorAll('.nav-pill');

  pills.forEach(pill => {

    pill.addEventListener('click', async () => {

      pills.forEach(p =>

        p.classList.remove('active')

      );

      pill.classList.add('active');

      currentFilter = pill.dataset.filter;

      visibleCount = 9;

      if(currentFilter === "all"){

        await fetchNews();

      }

      else{

        await fetchNews(currentFilter);

      }

    });

  });

}

function initSearch(){
  const input = document.getElementById('searchInput');
  input.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim().toLowerCase();
    visibleCount = 9;
    renderFeed();
  });
}

function initLoadMore(){
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    visibleCount += 6;
    renderFeed();
  });
}

function initSignalForm(){
  const form = document.getElementById('signalForm');
  const note = document.getElementById('signalNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.textContent = "you're on the list — first dispatch arrives tomorrow at 06:00 UTC";
    form.querySelector('input').value = '';
  });
}



// ---- Init ----
document.addEventListener(
'DOMContentLoaded',
async () => {

 await fetchNews();



 renderSources();

 renderDateMeta();

 tickClock();

 setInterval(
 tickClock,
 1000
 );

 initFilters();

 initSearch();

 initLoadMore();

 initSignalForm();

}
);
