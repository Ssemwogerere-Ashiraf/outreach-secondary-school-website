// news.js — simple client renderer for news.json
document.addEventListener('DOMContentLoaded', () => {
  const postsEl = document.getElementById('posts');
  const upcomingEl = document.getElementById('upcoming');
  const filter = document.getElementById('filterType');

  const DATA_PATH = '/data/news.json'; // adjust if needed

  function parseDate(d) { return d ? new Date(d) : null; }
  function formatDate(d) {
    if (!d) return '';
    return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  }

  function renderPosts(items, typeFilter='all') {
    postsEl.innerHTML = '';
    const filtered = items.filter(it => typeFilter === 'all' ? true : it.type === typeFilter);
    if (!filtered.length) {
      postsEl.innerHTML = '<div class="no-posts card">No posts found.</div>';
      return;
    }
    filtered.sort((a,b) => new Date(b.published || b.date) - new Date(a.published || a.date));
    filtered.forEach(item => {
      const post = document.createElement('article');
      post.className = 'post card';
      const title = `<h2>${item.title}</h2>`;
      const meta = `<div class="meta">${formatDate(parseDate(item.published || item.date))} • ${item.type}</div>`;
      const excerpt = `<div class="excerpt">${item.excerpt || item.content.slice(0,300) + (item.content.length>300?'…':'')}</div>`;
      const more = `<a class="read-more btn alt" href="#" data-id="${item.id}">Read details</a>`;
      post.innerHTML = title + meta + excerpt + more;
      postsEl.appendChild(post);

      post.querySelector('.read-more').addEventListener('click', (e) => {
        e.preventDefault();
        openDetail(item);
      });
    });
  }

  function renderUpcoming(items) {
    upcomingEl.innerHTML = '';
    const now = new Date();
    const events = items.filter(i => i.type === 'event' && i.date && new Date(i.date) >= now);
    events.sort((a,b) => new Date(a.date) - new Date(b.date));
    const top = events.slice(0,6);
    if (!top.length) {
      upcomingEl.innerHTML = '<li class="small-note">No upcoming events.</li>';
      return;
    }
    top.forEach(ev => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="event-date">${formatDate(parseDate(ev.date))}</span> ${ev.title}`;
      upcomingEl.appendChild(li);
    });
  }

  function openDetail(item) {
    const modal = document.createElement('div');
    modal.className = 'card';
    modal.style.position = 'fixed';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%,-50%)';
    modal.style.maxWidth = '720px';
    modal.style.width = 'calc(100% - 40px)';
    modal.style.zIndex = 9999;
    modal.style.padding = '18px';
    modal.innerHTML = `<h2>${item.title}</h2>
      <div class="meta">${formatDate(parseDate(item.published || item.date))} • ${item.type}</div>
      <div style="margin-top:12px">${item.content}</div>
      <div style="margin-top:12px"><button class="btn">Close</button></div>`;
    document.body.appendChild(modal);
    modal.querySelector('button').addEventListener('click', () => modal.remove());
  }

  async function loadData() {
    try {
      const res = await fetch(DATA_PATH);
      if (!res.ok) throw new Error('Failed to load news data');
      const data = await res.json();
      renderPosts(data.posts || []);
      renderUpcoming(data.posts || []);
    } catch (err) {
      postsEl.innerHTML = '<div class="no-posts card">Could not load news items.</div>';
      console.error(err);
    }
  }

  filter.addEventListener('change', () => {
    fetch(DATA_PATH).then(r => r.json()).then(data => renderPosts(data.posts || [], filter.value));
  });

  loadData();
});
