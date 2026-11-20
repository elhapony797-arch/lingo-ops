const CENTER = 'Lingo Ops Academy';
const SB_URL = 'https://cvbztwlbulrqwphmhakn.supabase.co';
const SB_KEY = 'sb_publishable_qyDfWomase0XdKMBsfdtXQ_jjKu9Ymc';

let MS = [], M, i = 0, stars = 0, missed = new Set(), GROUPS = [];
const app = document.getElementById('app');
const load = k => JSON.parse(localStorage.getItem(k) || 'null');
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let passport = load('passport') || {};

async function sb(path, method, body){
  try{
    const r = await fetch(SB_URL + '/rest/v1/' + path, {
      method: method || 'GET',
      headers: {apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal'},
      body: body ? JSON.stringify(body) : undefined
    });
    return r.ok ? (method === 'POST' ? true : await r.json()) : null;
  }catch(e){ return null; }
}

function uuid(){
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16); });
}

function speak(t){
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = 'en-US';
  u.rate = (M && M.voice === 'female') ? 0.95 : 0.85;
  u.pitch = (M && M.voice === 'female') ? 1.4 : 0.8;
  speechSynthesis.speak(u);
}
function norm(t){ return t.toLowerCase().replace(/[^a-z' ]/g,''); }

function skillOf(s){
  const w = [].concat(s.all || [], s.any || []).join(' ');
  if(/where|how much|do you have/.test(w)) return 'طرح الأسئلة (Where / How much / Do you have)';
  if(/my name|i am|i'm/.test(w)) return 'التعريف بالنفس (I am / My name is)';
  if(/would like|i want|can i|could i|may i|i need|looking for|i take|i will/.test(w)) return 'الطلب بأدب (I would like / Can I)';
  if(/thank/.test(w)) return 'عبارات الشكر والمجاملة';
  if(/tourism|work|business|visit|day|week/.test(w)) return 'التعبير عن الغرض والمدة';
  return 'المفردات (كلمات الأشياء والأماكن)';
}

function totalStars(){ return Object.values(passport).reduce((a,b)=>a+b,0); }
function rankOf(n){
  if(n >= 13) return '🕶️ Master Spy';
  if(n >= 9) return '⭐ Senior Agent';
  if(n >= 4) return '🕵️ Agent';
  return '🎒 Recruit';
}
function allDone(){ return MS.length > 0 && MS.every(m => passport[m.id] !== undefined); }
function stampIcon(n){ return n >= 3 ? '🥇' : n === 2 ? '🏅' : '🎖️'; }

function nameScreen(){
  let opts = '<option value="">اختر مجموعتك</option>' + GROUPS.map(g => '<option value="' + g.id + '">' + esc(g.name) + '</option>').join('');
  app.innerHTML = '<div class="card"><h2>🛂 مرحباً أيها العميل</h2><p class="ar">اكتب اسمك بالإنجليزية ليُطبع على جوازك وشهادتك.</p><input id="nm" placeholder="Your full name">' +
    (GROUPS.length ? '<select id="grp">' + opts + '</select>' : '') + '<button class="g" onclick="setName()">حفظ</button></div>';
}
async function setName(){
  const v = document.getElementById('nm').value.trim();
  if(!v) return;
  const gEl = document.getElementById('grp');
  const gid = gEl && gEl.value ? Number(gEl.value) : null;
  const id = uuid();
  save('name', v); save('sid', id);
  await sb('students', 'POST', {id: id, name: v, group_id: gid});
  home();
}

function home(){
  M = null;
  if(!load('name')) return nameScreen();
  const errs = (load('dna') || []).length;
  let h = '<div class="card"><h2>🛂 ' + esc(load('name')) + '</h2><p class="ar">الرتبة: ' + rankOf(totalStars()) + '<br>النجوم: ' + totalStars() + ' | المهمات المكتملة: ' + Object.keys(passport).length + ' / ' + MS.length + '</p>' +
    '<button class="g" onclick="passportScreen()">🛂 جواز السفر</button>' +
    '<button class="o" onclick="dnaScreen()">🧬 Language DNA (' + errs + ')</button></div><div class="card"><h2>اختر مهمتك</h2>';
  MS.forEach((m, idx) => {
    const open = idx === 0 || passport[MS[idx-1].id] !== undefined;
    const done = passport[m.id];
    h += '<button class="m ' + (open ? '' : 'lock') + '" ' + (open ? 'onclick="begin(' + idx + ')"' : 'disabled') + '>' +
      (open ? (done !== undefined ? '✅ ' : '▶️ ') : '🔒 ') + m.id + '. ' + m.title + (done !== undefined ? ' (' + done + '⭐)' : '') + '</button>';
  });
  app.innerHTML = h + '</div>';
}

function passportScreen(){
  let h = '<div class="card"><h2>🛂 English Passport</h2><p><b>' + esc(load('name')) + '</b></p><p class="ar">الرتبة: ' + rankOf(totalStars()) + ' | النجوم: ' + totalStars() + ' / ' + (MS.length * 3) + '</p></div>' +
    '<div class="card"><h3>الأختام</h3><div class="grid">';
  MS.forEach(m => {
    const n = passport[m.id];
    h += '<div class="stamp ' + (n !== undefined ? 'on' : '') + '"><div class="ic">' + (n !== undefined ? stampIcon(n) : '🔒') + '</div>' + esc(m.title) + (n !== undefined ? '<br>' + n + '⭐' : '') + '</div>';
  });
  h += '</div></div>';
  if(allDone()) h += '<div class="card"><h3>🎓 أنجزت كل المهمات!</h3><button class="g" onclick="certScreen()">عرض الشهادة</button></div>';
  else h += '<div class="card"><p class="ar">أكمل كل المهمات لتحصل على الشهادة.</p></div>';
  h += '<button class="x" onclick="home()">رجوع</button>';
  app.innerHTML = h;
}

function certScreen(){
  let d = load('certDate');
  if(!d){ d = new Date().toLocaleDateString('en-GB'); save('certDate', d); }
  app.innerHTML = '<div class="cert"><h2>Certificate of Achievement</h2><p>' + esc(CENTER) + '</p><p>This certifies that</p>' +
    '<div class="nm">' + esc(load('name')) + '</div>' +
    '<p>has completed all ' + MS.length + ' Lingo Ops missions</p>' +
    '<p>Rank: <b>' + rankOf(totalStars()).replace(/^\S+\s/, '') + '</b> | Stars: ' + totalStars() + '/' + (MS.length * 3) + '</p>' +
    '<p>Date: ' + d + '</p></div>' +
    '<p class="ar">صوّر الشاشة لحفظ الشهادة أو مشاركتها.</p><button class="x" onclick="passportScreen()">رجوع</button>';
}

function dnaScreen(){
  const dna = load('dna') || [];
  if(!dna.length){
    app.innerHTML = '<div class="card"><h2>🧬 Language DNA</h2><p class="ar">لا توجد أخطاء مسجّلة بعد. أكمل بعض المهمات وسنحلل أداءك.</p><button class="x" onclick="home()">رجوع</button></div>';
    return;
  }
  const count = {};
  dna.forEach(e => {
    const m = MS.find(x => x.id === e.mission);
    const s = m && m.steps[e.step];
    if(!s) return;
    const k = skillOf(s);
    count[k] = (count[k] || 0) + 1;
  });
  const list = Object.entries(count).sort((a,b) => b[1] - a[1]);
  const max = list.length ? list[0][1] : 1;
  let h = '<div class="card"><h2>🧬 Language DNA</h2><p class="ar">إجمالي الأخطاء: ' + dna.length + '</p>';
  if(list.length) h += '<p>🎯 احتياجك الأول: <b>' + list[0][0] + '</b></p>';
  h += '</div><div class="card"><h3>المهارات حسب الأخطاء</h3>';
  list.forEach(([k, n]) => {
    h += '<div style="margin-top:12px">' + k + ' — ' + n + '<div class="bar"><div style="width:' + Math.round(n / max * 100) + '%"></div></div></div>';
  });
  h += '</div><div class="card"><h3>آخر الأخطاء</h3>';
  dna.slice(-5).reverse().forEach(e => {
    const m = MS.find(x => x.id === e.mission);
    const s = m && m.steps[e.step];
    if(!s) return;
    h += '<div class="err">❓ ' + esc(s.say) + '<br>✍️ ' + esc(e.answer || '(فارغ)') + '</div>';
  });
  h += '</div><button class="x" onclick="home()">رجوع</button><button class="r" onclick="if(confirm(\'مسح كل الأخطاء؟\')){localStorage.removeItem(\'dna\');dnaScreen()}">مسح السجل</button>';
  app.innerHTML = h;
}

function begin(idx){
  M = MS[idx]; i = 0; stars = 0; missed = new Set();
  app.innerHTML = '<div class="card"><h2>مهمة ' + M.id + ': ' + M.title + '</h2><p class="ar">تحدّث مع ' + M.agent + ' بالإنجليزية. اكتب ردك أو انطق به.</p><button class="g" onclick="show()">ابدأ المهمة</button><button class="x" onclick="home()">رجوع</button></div>';
}

function show(){
  if(i >= M.steps.length) return finish();
  const s = M.steps[i];
  app.innerHTML = '<div class="card"><div class="en">🕵️ ' + M.agent + ': ' + s.say + '</div><div class="ar">' + s.ar + '</div>' +
  '<button class="o" onclick="speak(M.steps[i].say)">🔊 استمع</button>' +
  '<input id="ans" placeholder="Type your answer...">' +
  '<button class="b" onclick="listen()">🎤 تحدّث</button>' +
  '<button class="g" onclick="check()">تحقق</button>' +
  '<button class="x" onclick="home()">خروج</button>' +
  '<div id="fb"></div></div>';
  speak(s.say);
}

function listen(){
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!R){ document.getElementById('fb').textContent = 'المتصفح لا يدعم الميكروفون، اكتب إجابتك.'; return; }
  const r = new R(); r.lang = 'en-US';
  document.getElementById('fb').textContent = '🎤 أسمعك...';
  r.onresult = e => { document.getElementById('ans').value = e.results[0][0].transcript; check(); };
  r.onerror = () => { document.getElementById('fb').textContent = 'لم أسمعك، حاول مرة أخرى أو اكتب.'; };
  r.start();
}

function check(){
  const s = M.steps[i];
  const a = norm(document.getElementById('ans').value);
  const ok = (!s.all || s.all.every(w => a.includes(w))) && (!s.any || s.any.some(w => a.includes(w)));
  const fb = document.getElementById('fb');
  if(ok){
    fb.textContent = '✅ ممتاز!'; speak('Great job!');
    i++; setTimeout(show, 1800);
  } else {
    missed.add(i);
    const dna = load('dna') || [];
    dna.push({mission: M.id, step: i, answer: a, time: Date.now()});
    save('dna', dna);
    fb.textContent = '❌ قريب! جرّب مرة أخرى. تلميح: ' + s.ar;
    speak('Try again.');
  }
}

function finish(){
  stars = Math.max(1, M.steps.length - missed.size);
  passport[M.id] = Math.max(passport[M.id] || 0, stars);
  save('passport', passport);
  if(load('sid')) sb('results', 'POST', {student_id: load('sid'), mission_id: M.id, stars: stars, mistakes: missed.size});
  const n = (load('dna') || []).length;
  let h = '<div class="card"><h2>' + stampIcon(stars) + ' اكتملت المهمة!</h2><p>النجوم: ' + stars + ' / ' + M.steps.length + '</p><p class="ar">أخطاء مسجّلة في Language DNA: ' + n + '</p>';
  if(allDone()) h += '<p>🎓 أنجزت كل المهمات! شهادتك جاهزة.</p><button class="g" onclick="certScreen()">عرض الشهادة</button>';
  h += '<button class="g" onclick="home()">القائمة الرئيسية</button><button class="o" onclick="dnaScreen()">🧬 حلّل أخطائي</button></div>';
  app.innerHTML = h;
  speak('Mission complete. Well done, agent.');
}

(async () => {
  MS = await fetch('missions.json').then(r => r.json());
  const g = await sb('groups?select=id,name&order=id');
  GROUPS = g || [];
  home();
})();
