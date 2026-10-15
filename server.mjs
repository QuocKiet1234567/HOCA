import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
export function createAquariumServer({ dataDirectory = path.join(root, 'data'), middleware } = {}) {
  mkdirSync(dataDirectory, { recursive: true });
  const file = path.join(dataDirectory, 'players.json');
  const db = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { players: {} };
  const persist = () => { writeFileSync(file + '.tmp', JSON.stringify(db)); renameSync(file + '.tmp', file); };
  const publicPlayer = p => ({ code: p.code, name: p.name, count: p.count, night: p.night, plants: p.plants, fedAt: p.fedAt });
  const rates = new Map();
  const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/')) {
      if (middleware) return middleware(req, res, () => { res.writeHead(404); res.end('Not found'); });
      let relative;
      try { relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).slice(1); }
      catch { res.writeHead(400); res.end('Bad request'); return; }
      const asset = path.resolve(root, 'dist', relative);
      if (!asset.startsWith(path.join(root, 'dist') + path.sep)) { res.writeHead(403); return res.end(); }
      try {
        const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
        res.writeHead(200, { 'Content-Type': types[path.extname(asset)] || 'application/octet-stream' }); res.end(readFileSync(asset));
      } catch { res.writeHead(404); res.end('Not found'); }
      return;
    }
    const reply = (data, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
    try {
      if (!['GET', 'POST'].includes(req.method)) fail('Phương thức không hợp lệ.', 405);
      // Same-origin writes only; friends authenticate with their own private browser token.
      if (req.method === 'POST' && req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) fail('Nguồn truy cập không hợp lệ.', 403);
      const ip = req.socket.remoteAddress;
      const now = Date.now();
      let rate = rates.get(ip);
      if (!rate || now - rate.start > 60000) { rate = { start: now, count: 0 }; rates.set(ip, rate); }
      if (++rate.count > 240) fail('Bạn thao tác quá nhanh. Thử lại sau một phút nhé.', 429);
      let body = {};
      if (req.method === 'POST') {
        let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 4096) fail('Dữ liệu quá dài.', 413); }
        try { body = JSON.parse(raw || '{}'); } catch { fail('Dữ liệu không hợp lệ.'); }
        if (!body || typeof body !== 'object' || Array.isArray(body)) fail('Dữ liệu không hợp lệ.');
      }
      if (url.pathname === '/api/register' && req.method === 'POST') {
        const name = typeof body.name === 'string' ? body.name.trim().slice(0, 24) : '';
        if (!name) fail('Hãy nhập tên của bạn.');
        let code; do { code = randomBytes(4).toString('hex').toUpperCase(); } while (db.players[code]);
        const token = randomBytes(32).toString('hex');
        db.players[code] = { code, token, name, count: 8, night: false, plants: true, fedAt: 0, friends: [], requests: [], gifts: [] };
        persist(); return reply({ token, player: publicPlayer(db.players[code]) }, 201);
      }
      const auth = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '');
      const player = auth && Object.values(db.players).find(p => timingSafeEqual(Buffer.from(p.token), Buffer.from(auth[1])));
      if (!player) fail('Hãy tạo hồ cá để bắt đầu.', 401);
      const friend = code => { const p = db.players[code]; if (!p || !player.friends.includes(code)) fail('Bạn cần kết bạn trước khi ghé thăm hoặc tặng cá.', 403); return p; };
      if (url.pathname === '/api/me' && req.method === 'GET') return reply({ player: publicPlayer(player), friends: player.friends.map(c => publicPlayer(db.players[c])), requests: player.requests.map(c => publicPlayer(db.players[c])), gifts: player.gifts });
      if (url.pathname === '/api/visit' && req.method === 'GET') return reply({ player: publicPlayer(friend(url.searchParams.get('code'))) });
      if (req.method !== 'POST') fail('Không tìm thấy.', 404);
      switch (url.pathname) {
        case '/api/friend-request': {
          const code = String(body.code || '').trim().toUpperCase();
          const target = /^[A-F0-9]{8}$/.test(code) ? db.players[code] : null;
          if (!target) fail('Không tìm thấy người chơi với mã này.', 404);
          if (target === player) fail('Đây là mã của chính bạn.');
          if (player.friends.includes(code)) fail('Hai bạn đã là bạn bè rồi.');
          if (target.requests.includes(player.code)) fail('Lời mời đã được gửi, chờ bạn ấy đồng ý nhé.');
          target.requests.push(player.code); break;
        }
        case '/api/friend-response': {
          if (!player.requests.includes(body.code)) fail('Lời mời không còn tồn tại.');
          player.requests = player.requests.filter(c => c !== body.code);
          if (body.accept === true) {
            const target = db.players[body.code];
            if (!player.friends.includes(target.code)) player.friends.push(target.code);
            if (!target.friends.includes(player.code)) target.friends.push(player.code);
            target.requests = target.requests.filter(c => c !== player.code);
          }
          break;
        }
        case '/api/gift': {
          const target = friend(body.code);
          if (player.count <= 1) fail('Hãy giữ lại ít nhất một chú cá trong hồ của bạn.');
          if (target.count >= 24) fail('Hồ của bạn ấy đã đủ 24 chú cá.');
          if (now - (player.lastGift || 0) < 3000) fail('Chờ một chút trước khi tặng tiếp nhé.');
          player.count--; target.count++; player.lastGift = now;
          target.gifts.unshift({ from: player.name, code: player.code, at: now }); target.gifts = target.gifts.slice(0, 20);
          break;
        }
        case '/api/action': {
          if (body.action === 'add') { if (player.count >= 24) fail('Hồ đã đủ 24 chú cá.'); player.count++; }
          else if (body.action === 'feed') { if (now - player.fedAt < 9000) fail('Các bạn nhỏ đang ăn, chờ một chút nhé.'); player.fedAt = now; }
          else if (body.action === 'light') player.night = !player.night;
          else if (body.action === 'plants') player.plants = !player.plants;
          else fail('Thao tác không hợp lệ.');
          break;
        }
        default: fail('Không tìm thấy.', 404);
      }
      persist(); reply({ player: publicPlayer(player) });
    } catch (error) { if (!res.headersSent) reply({ error: error.status ? error.message : 'Máy chủ gặp lỗi. Vui lòng thử lại.' }, error.status || 500); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dev = process.argv.includes('--dev');
  const vite = dev ? await (await import('vite')).createServer({ server: { middlewareMode: true }, appType: 'spa' }) : null;
  const server = createAquariumServer({ middleware: vite?.middlewares });
  const port = Number(process.env.PORT || 5173);
  server.listen(port, '0.0.0.0', () => console.log(`AQUA: http://localhost:${port}/ — thiết bị cùng Wi-Fi dùng http://<IP-máy-chủ>:${port}/`));
}
