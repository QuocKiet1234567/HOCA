import './social.css';

export function setupSocial({ applyPlayer, notify, onVisit }) {
  let token = localStorage.getItem('aqua-token') || '';
  let me = null, visiting = null, busy = false, lastGift = null;
  const panel = document.createElement('aside'); panel.className = 'social-panel';
  panel.innerHTML = `<button class="social-toggle" aria-expanded="false">♧ <span>Bạn bè & hồ cá</span><b id="social-badge"></b></button>
  <div class="social-content" hidden><div class="social-heading"><div><small>CÙNG NHAU THƯ GIÃN</small><h2>Một hồ cá, thêm tình bạn.</h2></div><button id="social-close" aria-label="Đóng">×</button></div>
  <form id="profile-form"><p>Đặt tên để có hồ riêng, kết bạn và trao tặng những chú cá.</p><label for="player-name">Tên của bạn</label><input id="player-name" maxlength="24" required placeholder="Bạn muốn được gọi là gì?" autocomplete="nickname"><button class="social-primary">Tạo hồ của tôi</button><small>Hồ gắn với trình duyệt này. Giữ dữ liệu trình duyệt để trở lại hồ của bạn.</small></form>
  <section id="profile-info" hidden><div class="profile-card"><strong id="profile-name"></strong><span>Mã kết bạn: <b id="profile-code"></b></span><button id="copy-invite">Sao chép lời mời ↗</button></div><form id="friend-form"><label for="friend-code">Kết bạn bằng mã</label><div class="input-row"><input id="friend-code" maxlength="8" required placeholder="Ví dụ: A1B2C3D" autocomplete="off"><button class="social-primary">Gửi mời</button></div></form><div id="requests"></div><div class="friends-heading">BẠN BÈ <span id="friends-count">0</span></div><div id="friends-list"></div><div id="gift-log"></div></section>
  <p id="social-status" role="status" aria-live="polite"></p></div>`;
  document.getElementById('app').append(panel);
  const q = s => panel.querySelector(s);
  const content = q('.social-content');
  function open(value) { content.hidden = !value; q('.social-toggle').setAttribute('aria-expanded', String(value)); }
  q('.social-toggle').onclick = () => open(content.hidden); q('#social-close').onclick = () => open(false);
  async function api(route, body) {
    const res = await fetch('/api/' + route, { method: body ? 'POST' : 'GET', headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (!(res.headers.get('content-type') || '').includes('application/json')) throw new Error('Chế độ bạn bè cần máy chủ. Hãy chạy npm run dev.');
    const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Không kết nối được máy chủ.'); return data;
  }
  async function run(task, background = false) { if (busy) return; busy = true; if (!background) q('#social-status').textContent = 'Đang xử lý…'; try { await task(); q('#social-status').textContent = ''; } catch (e) { q('#social-status').textContent = e.message; if (!background) notify(e.message); } finally { busy = false; } }
  function button(label, action) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.onclick = () => run(action); return b; }
  function render(data) {
    me = data.player; q('#profile-form').hidden = true; q('#profile-info').hidden = false;
    q('#profile-name').textContent = me.name; q('#profile-code').textContent = me.code;
    q('#social-badge').textContent = data.requests.length || '';
    const requests = q('#requests'); requests.replaceChildren();
    for (const p of data.requests) { const row = document.createElement('div'); row.className = 'friend-row'; const name = document.createElement('span'); name.textContent = `${p.name} muốn kết bạn`; row.append(name, button('Đồng ý', async () => { await api('friend-response', { code: p.code, accept: true }); await refresh(); }), button('×', async () => { await api('friend-response', { code: p.code, accept: false }); await refresh(); })); requests.append(row); }
    q('#friends-count').textContent = data.friends.length;
    const list = q('#friends-list'); list.replaceChildren();
    if (!data.friends.length) { const p = document.createElement('p'); p.className = 'social-empty'; p.textContent = 'Chưa có bạn bè. Gửi mã của bạn để bắt đầu một tình bạn mới.'; list.append(p); }
    for (const p of data.friends) { const row = document.createElement('div'); row.className = 'friend-row'; const name = document.createElement('span'); name.textContent = `${p.name} · ${p.count} cá`; row.append(name, button('Ghé hồ', async () => { const data = await api('visit?code=' + p.code); visiting = p.code; onVisit(data.player); applyPlayer(data.player); open(false); }), button('Tặng cá', async () => { await api('gift', { code: p.code }); notify(`Bạn đã tặng ${p.name} một chú cá ♡`); await refresh(); })); list.append(row); }
    const log = q('#gift-log'); log.replaceChildren();
    if (data.gifts.length) { const heading = document.createElement('h3'); heading.textContent = 'QUÀ TẶNG GẦN ĐÂY'; log.append(heading); for (const gift of data.gifts.slice(0, 5)) { const p = document.createElement('p'); p.textContent = `♡ ${gift.from} đã tặng bạn một chú cá · ${new Date(gift.at).toLocaleDateString('vi-VN')}`; log.append(p); } }
    if (lastGift !== null && data.gifts[0]?.at > lastGift) notify(`${data.gifts[0].from} vừa tặng bạn một chú cá!`);
    lastGift = data.gifts[0]?.at || 0;
    if (!visiting) applyPlayer(me);
  }
  async function refresh() { render(await api('me')); if (visiting) { const data = await api('visit?code=' + visiting); applyPlayer(data.player); } }
  q('#profile-form').onsubmit = e => { e.preventDefault(); run(async () => { const data = await api('register', { name: q('#player-name').value }); token = data.token; localStorage.setItem('aqua-token', token); await refresh(); notify('Hồ riêng của bạn đã sẵn sàng!'); }); };
  q('#friend-form').onsubmit = e => { e.preventDefault(); run(async () => { await api('friend-request', { code: q('#friend-code').value }); q('#friend-code').value = ''; notify('Đã gửi lời mời. Chờ bạn ấy đồng ý nhé!'); }); };
  q('#copy-invite').onclick = () => run(async () => { const url = new URL(location.href); url.search = ''; url.searchParams.set('friend', me.code); try { await navigator.clipboard.writeText(`Cùng nuôi cá với ${me.name} tại ${url.href} — mã kết bạn: ${me.code}`); notify('Đã sao chép link và mã kết bạn.'); } catch { q('#social-status').textContent = `Mã của bạn: ${me.code}. Link: ${url.href}`; throw new Error(`Hãy sao chép mã kết bạn: ${me.code}`); } });
  const invitation = new URLSearchParams(location.search).get('friend'); if (invitation) { q('#friend-code').value = invitation.slice(0, 8); open(true); }
  const banner = document.createElement('div'); banner.className = 'visit-banner'; banner.hidden = true; const visitName = document.createElement('span'); banner.append(visitName, button('Về hồ của tôi ↗', async () => { visiting = null; banner.hidden = true; onVisit(null); await refresh(); })); document.getElementById('app').append(banner);
  const originalVisit = onVisit; onVisit = player => { originalVisit(player); banner.hidden = !player; visitName.textContent = player ? `Đang ghé hồ của ${player.name}` : ''; };
  if (token) run(refresh);
  setInterval(() => { if (token && !busy && !document.hidden) run(refresh, true); }, 4000);
  return { action(type) { if (visiting) { notify('Bạn đang ghé thăm. Về hồ của mình để chăm sóc nhé.'); return true; } if (!token) return false; run(async () => { await api('action', { action: type }); await refresh(); }); return true; }, isConnected: () => !!token };
}
