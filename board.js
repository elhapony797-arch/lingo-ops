const _home = home;
home = function(){
  _home();
  const c = document.querySelector('#app .card');
  if (c && load('name')) c.insertAdjacentHTML('beforeend', '<button class="b" onclick="leaderboardScreen()">🏆 ترتيب المجموعات</button>');
};

async function leaderboardScreen(){
  app.innerHTML = '<div class="card">جارٍ التحميل...</div>';
  let rows = null;
  try{
    const r = await fetch(SB_URL + '/rest/v1/rpc/leaderboard', {
      method: 'POST',
      headers: {apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json'},
      body: '{}'
    });
    if(r.ok) rows = await r.json();
  }catch(e){}
  let h = '<div class="card"><h2>🏆 ترتيب المجموعات</h2><p class="ar">الترتيب حسب متوسط النجوم لكل طالب، ليكون عادلاً بين المجموعات المختلفة في العدد.</p>';
  if(!rows) h += '<p>تعذّر تحميل الترتيب الآن. حاول لاحقاً.</p>';
  else if(!rows.length) h += '<p>لا توجد مجموعات فيها طلاب بعد.</p>';
  else {
    const medals = ['🥇', '🥈', '🥉'];
    rows.forEach((g, idx) => {
      h += '<div class="err" style="direction:rtl;text-align:right"><b>' + (medals[idx] || (idx + 1) + '.') + ' ' + esc(g.grp_name) + '</b><br>متوسط النجوم: ' + g.star_avg + ' | المجموع: ' + g.star_total + ' | الطلاب: ' + g.student_count + '</div>';
    });
  }
  h += '</div><button class="x" onclick="home()">رجوع</button>';
  app.innerHTML = h;
}
