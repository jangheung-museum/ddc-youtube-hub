(function () {
  var C = window.HUB_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- 토스트 ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }
  $$('[data-toast]').forEach(function (el) { el.addEventListener('click', function () { toast(el.dataset.toast); }); });

  /* ---------- 모달 ---------- */
  function openM(id) { $(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeM(m) {
    m.classList.remove('open'); document.body.style.overflow = '';
    if (m.id === 'mVideo') $('#vPlayer').innerHTML = '';
  }
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m || e.target.hasAttribute('data-close')) closeM(m); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.modal.open').forEach(closeM); });

  /* ---------- 컨페티 ---------- */
  var cv = $('#confetti'), cx = cv.getContext('2d'), parts = [], raf;
  function confetti() {
    cv.width = innerWidth; cv.height = innerHeight;
    var cols = ['#9CD818', '#FFD44F', '#C65A4E', '#5AB0F0', '#F2A0C0', '#fff'];
    for (var i = 0; i < 140; i++) parts.push({ x: innerWidth / 2, y: innerHeight * .55, vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 4, r: Math.random() * 6 + 4, c: cols[i % cols.length], a: Math.random() * 6, life: 0 });
    cancelAnimationFrame(raf); tick();
  }
  function tick() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(function (p) { p.vy += .45; p.x += p.vx; p.y += p.vy; p.a += .2; p.life++;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); cx.restore(); });
    parts = parts.filter(function (p) { return p.y < cv.height + 40 && p.life < 220; });
    if (parts.length) raf = requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height);
  }

  /* ---------- 질문 폼 ---------- */
  var CAT_TEXT = {
    '시장에게 묻기': ['질문 내용', '시장님께 궁금한 점을 자유롭게 적어 주세요.', '질문 보내기'],
    '담당자에게 물어봐 주세요': ['궁금한 정책·민원', '어떤 정책이나 민원이 궁금한가요? 담당자를 찾아가 대신 물어볼게요.', '대신 물어봐 주세요'],
    '그냥 궁금해요': ['궁금한 것', '지명·역사·생활 등 동두천에 대해 그냥 궁금했던 것을 적어 주세요. "신비한 동두천 사전" 같은 AI 영상으로 풀어 드려요.', '궁금증 보내기'],
    '사연 보내기': ['나의 동두천 사연', '동두천에서 겪은 따뜻한 일, 웃긴 일, 고마운 사람 이야기를 들려주세요. "공감 사연툰"으로 만들어요.', '사연 보내기'],
    '우리 가게 추천': ['가게 이름과 추천 이유', '가게 이름, 위치, 추천하는 이유를 적어 주세요. "마감 10분" 출연 후보가 돼요.', '가게 추천하기'],
    '사진·영상 공모': ['사진·영상 소개', '어디서 무엇을 찍었는지 알려 주세요. 링크는 아래 칸에 붙여 주세요.', '공모 참여하기']
  };
  var cat = '시장에게 묻기';
  function setCat(c) {
    if (!CAT_TEXT[c]) return; cat = c;
    $$('#catChips .ch').forEach(function (b) { b.classList.toggle('on', b.dataset.cat === c); });
    $('#bodyLabel').textContent = CAT_TEXT[c][0]; $('#body').placeholder = CAT_TEXT[c][1]; $('#submitBtn').textContent = CAT_TEXT[c][2];
  }
  $$('#catChips .ch').forEach(function (b) { b.addEventListener('click', function () { setCat(b.dataset.cat); }); });
  $('#body').addEventListener('input', function () { $('#cnt').textContent = this.value.length; $('#fBody').classList.remove('bad'); });
  $('#nick').addEventListener('input', function () { $('#fNick').classList.remove('bad'); });

  // 구글폼 '미리 채워진 링크'에서 entry 번호 자동 추출
  var GF = null;
  (function parseForm() {
    var u = (C.googleFormPrefillUrl || '').trim(); if (!u) return;
    try {
      var url = new URL(u), map = {};
      url.searchParams.forEach(function (v, k) {
        if (k.indexOf('entry.') !== 0) return;
        var key = { NICK: 'nick', TOWN: 'town', BODY: 'body', LINK: 'link' }[v.trim().toUpperCase()] || 'cat';
        map[key] = k;
      });
      GF = { action: u.split('?')[0].replace(/\/viewform.*$/, '/formResponse'), map: map };
    } catch (e) { console.warn('구글폼 링크를 읽지 못했어요', e); }
  })();
  $('#modeNote').textContent = GF ? '구글폼으로 바로 전송돼요' : '시연 모드: 구글폼 연결 전이라 이 브라우저에만 저장돼요';

  $('#askForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = { cat: cat, nick: $('#nick').value.trim(), town: $('#town').value.trim(), body: $('#body').value.trim(), link: $('#link').value.trim() };
    var ok = true;
    if (!d.nick) { $('#fNick').classList.add('bad'); ok = false; }
    if (d.body.length < 10) { $('#fBody').classList.add('bad'); ok = false; }
    if (!ok) { toast('빠진 칸을 확인해 주세요'); return; }
    var btn = $('#submitBtn'); btn.disabled = true; btn.textContent = '보내는 중…';
    var done = function () {
      btn.disabled = false; setCat(cat);
      var list = store.get('hub_sent', []); list.push(Object.assign({ at: new Date().toISOString() }, d)); store.set('hub_sent', list);
      var q = $('#statQ'); q.textContent = (parseInt(q.textContent.replace(/,/g, ''), 10) + 1).toLocaleString();
      $('#doneMsg').textContent = (cat === '사진·영상 공모' || cat === '우리 가게 추천' || cat === '사연 보내기')
        ? '보내 주셔서 고마워요! 채택되면 공식 채널에서 소개해 드려요.'
        : '공감을 많이 받으면 다음 달 영상에서 답해 드려요.' + (GF ? '' : ' (시연 모드)');
      $('#askForm').reset(); $('#cnt').textContent = '0';
      openM('#mDone'); confetti();
    };
    if (GF) {
      var p = new URLSearchParams();
      Object.keys(GF.map).forEach(function (k) { if (d[k]) p.append(GF.map[k], d[k]); });
      fetch(GF.action, { method: 'POST', mode: 'no-cors', body: p }).then(done).catch(function () {
        btn.disabled = false; setCat(cat); toast('전송에 실패했어요. 잠시 후 다시 시도해 주세요');
      });
    } else setTimeout(done, 500);
  });
  $('#againBtn').addEventListener('click', function () { closeM($('#mDone')); go('ask'); });

  /* ---------- 이동 버튼 (data-go) ---------- */
  function go(id, c) {
    var el = document.getElementById(id); if (!el) return;
    if (c) setCat(c);
    var y = el.getBoundingClientRect().top + scrollY - 90;
    scrollTo({ top: y, behavior: 'smooth' });
    if (id === 'ask') setTimeout(function () { $('#nick').focus({ preventScroll: true }); }, 600);
  }
  $$('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(el.dataset.go, el.dataset.cat); });
  });

  /* ---------- 공감 버튼 ---------- */
  var liked = store.get('hub_liked', {});
  $$('.like').forEach(function (b) {
    var id = b.dataset.id, base = +b.dataset.n;
    function paint() { b.classList.toggle('on', !!liked[id]); b.querySelector('span').textContent = base + (liked[id] ? 1 : 0); }
    paint();
    b.addEventListener('click', function () {
      liked[id] = !liked[id]; store.set('hub_liked', liked); paint();
      b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
      toast(liked[id] ? '공감했어요! 다음 달 영상 후보에 반영돼요' : '공감을 취소했어요');
    });
  });

  /* ---------- 영상 팝업 ---------- */
  function openVideo(key) {
      var v = (C.videos || {})[key] || { title: '동두천시 유튜브', id: '' };
      $('#vTitle').textContent = v.title;
      $('#vPlayer').innerHTML = v.id
        ? '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
        : '<div class="ph"><img src="assets/ddc-shy.webp" alt=""><b style="font-size:18px">영상 준비 중이에요</b><p style="color:#C9D6CC;margin-top:6px">사업 착수 후 이 자리에서 바로 재생돼요.</p></div>';
      openM('#mVideo');
  }
  window.__openVideo = openVideo;
  $$('[data-video]').forEach(function (el) {
    el.addEventListener('click', function (e) { if (e.target.closest('.like')) return; openVideo(el.dataset.video); });
  });

  /* ---------- 시리즈 필터 ---------- */
  $$('#filterChips .ch').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#filterChips .ch').forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.sv').forEach(function (c) { c.classList.toggle('hide', b.dataset.f !== 'all' && c.dataset.cat !== b.dataset.f); });
    });
  });

  /* ---------- 퀴즈 ---------- */
  $('#quizBtn').addEventListener('click', function () {
    $$('#quizOpts button').forEach(function (b) { b.className = ''; b.disabled = false; });
    $('#quizMsg').textContent = '정답을 골라 보세요!'; $('#quizChar').src = 'assets/ddc-point.webp';
    openM('#mQuiz');
  });
  $$('#quizOpts button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.a === '1') {
        b.className = 'right'; $$('#quizOpts button').forEach(function (x) { x.disabled = true; });
        $('#quizMsg').textContent = '정답! 원효대사가 세웠다고 전해져요. 영상 댓글로도 남겨 주세요.';
        $('#quizChar').src = 'assets/ddc-party.webp'; confetti();
      } else {
        b.className = 'wrong'; $('#quizMsg').textContent = '아쉬워요! 다시 골라 보세요.'; $('#quizChar').src = 'assets/ddc-sad.webp';
      }
    });
  });

  /* ---------- 구독 · SNS ---------- */
  var sub = $('#subscribeBtn'); if (sub) sub.href = C.youtubeChannel || '#';
  $$('[data-sns]').forEach(function (a) {
    var u = (C.sns || {})[a.dataset.sns];
    if (u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; }
    else a.addEventListener('click', function () { toast('공식 계정 주소는 오픈 때 연결돼요'); });
  });

  /* ---------- 메뉴 현재 위치 표시 ---------- */
  var menuLinks = $$('.menu a'), tabLinks = $$('.tabbar a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return; var id = en.target.id;
        menuLinks.forEach(function (a) { a.classList.toggle('on', a.dataset.go === id); });
        tabLinks.forEach(function (a) { a.classList.toggle('on', (a.dataset.go || 'top') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'ask', 'vote', 'board', 'series', 'events'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- 히어로: 해 · 시차 효과 ---------- */
  var st = $('#stage'), sun = $('#sunBtn');
  var L = { c: $('#lyCloud'), f: $('#lyFar'), m: $('#lyMid'), n: $('#lyNear') };
  if (st && matchMedia('(hover:hover)').matches) {
    st.addEventListener('mousemove', function (e) {
      var r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      L.c.setAttribute('transform', 'translate(' + (x * -30) + ' ' + (y * -10) + ')');
      L.f.setAttribute('transform', 'translate(' + (x * -10) + ' 0)');
      L.m.setAttribute('transform', 'translate(' + (x * -18) + ' 0)');
      L.n.setAttribute('transform', 'translate(' + (x * -28) + ' 0)');
      sun.style.transform = 'translate(' + (x * 24) + 'px,' + (y * 16) + 'px)';
    });
    st.addEventListener('mouseleave', function () { for (var k in L) L[k].setAttribute('transform', ''); sun.style.transform = ''; });
  }
  if (sun) sun.addEventListener('click', function () {
    st.classList.toggle('dusk');
    toast(st.classList.contains('dusk') ? '소요산에 노을이 졌어요' : '다시 맑은 낮이에요');
  });
})();

/* ---------- 답변 게시판 (구글시트 '공개' 행 자동 표시) ---------- */
(function () {
  var grid = document.getElementById('bGrid'); if (!grid) return;
  var C = window.HUB_CONFIG || {}, note = document.getElementById('bNote'), more = document.getElementById('bMore'), qInput = document.getElementById('bq');
  var DEMO = [
    { cat: '시장에게 묻기', nick: '산책러', town: '보산동', q: '소요산 주차장 언제 늘어나요?', a: '주차 확충 계획과 단풍철 대책을 시장이 영상에서 직접 설명했어요.', fmt: '시민이 묻고 시장이 답하다 EP.07', vid: 'answer', date: '2027-11-15' },
    { cat: '그냥 궁금해요', nick: '궁금이', town: '생연동', q: '동두천은 왜 이름이 동두천이에요?', a: '시내를 흐르는 하천 이름에서 시 이름이 왔어요. 자세한 이야기는 영상에서!', fmt: '신비한 동두천 사전 EP.01', vid: 'dict', date: '2027-10-28' },
    { cat: '담당자에게 물어봐 주세요', nick: '출근러', town: '생연동', q: '대형폐기물은 어떻게 버려요?', a: '신고 방법부터 배출 날짜까지 담당자가 단계별로 알려 줬어요.', fmt: '민원 대신 물어봄 EP.03', vid: 'proxy', date: '2027-10-20' },
    { cat: '사연 보내기', nick: '우산요정', town: '지행동', q: '1호선에서 우산을 빌려준 학생을 찾습니다.', a: '사연을 공감 사연툰으로 만들었어요. 학생을 찾으면 후속편으로 전할게요!', fmt: '공감 사연툰 EP.02', vid: '', date: '2027-10-12' },
    { cat: '우리 가게 추천', nick: '단골', town: '보산동', q: '50년 된 보산동 분식집을 추천해요.', a: '사장님과 마감 10분 인터뷰를 촬영했어요.', fmt: '동두천 사람들: 마감 10분', vid: 'closing', date: '2027-09-30' },
    { cat: '그냥 궁금해요', nick: '역사덕후', town: '상패동', q: '소요산 자재암은 누가 세웠어요?', a: '원효대사가 세웠다고 전해져요. 전설까지 영상으로 정리했어요.', fmt: '신비한 동두천 사전 EP.04', vid: 'dict', date: '2027-09-18' },
    { cat: '사진·영상 공모', nick: '찰칵', town: '탑동동', q: '탑동계곡 여름 풍경을 찍었어요.', a: '채택! 동두천 1분 산책 여름편에 소개했어요.', fmt: '동두천 1분 산책', vid: '', date: '2027-08-22' },
    { cat: '시장에게 묻기', nick: '락스피릿', town: '중앙동', q: '락페스티벌 내년에도 하나요?', a: '내년 개최 계획을 영상에서 답했어요. 일정이 확정되면 공지로 알려 드려요.', fmt: '시민이 묻고 시장이 답하다 EP.06', vid: 'answer', date: '2027-08-10' }
  ];
  var all = [], view = [], shown = 6, filt = 'all', kw = '';

  // CSV 파서 (따옴표·줄바꿈 대응)
  function parseCSV(t) {
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  function col(head, keys) { for (var i = 0; i < head.length; i++) for (var k = 0; k < keys.length; k++) if (head[i].replace(/\s/g, '').indexOf(keys[k]) > -1) return i; return -1; }
  function fromSheet(text) {
    var rows = parseCSV(text).filter(function (r) { return r.some(function (x) { return x.trim(); }); });
    if (rows.length < 2) return [];
    var h = rows[0], ix = {
      date: col(h, ['타임스탬프', 'Timestamp']), cat: col(h, ['보낼곳']), nick: col(h, ['닉네임']), town: col(h, ['동네']),
      q: col(h, ['내용']), pub: col(h, ['공개']), a: col(h, ['답변']), fmt: col(h, ['포맷', '시리즈']), vid: col(h, ['영상ID', '유튜브ID', '영상아이디'])
    };
    return rows.slice(1).map(function (r) {
      var g = function (k) { return ix[k] > -1 ? (r[ix[k]] || '').trim() : ''; };
      return { pub: g('pub'), cat: g('cat'), nick: g('nick'), town: g('town'), q: g('q'), a: g('a'), fmt: g('fmt'), vid: g('vid'), date: (function (d) { var m = d.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/); return m ? m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2) : d; })(g('date')) };
    }).filter(function (o) { return (ix.pub < 0 || /^(y|yes|o|공개|예|✔|true)$/i.test(o.pub)) && o.a; }).reverse();
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function render() {
    var k = kw.toLowerCase();
    view = all.filter(function (o) { return (filt === 'all' || o.cat === filt) && (!k || (o.q + ' ' + o.a + ' ' + o.fmt).toLowerCase().indexOf(k) > -1); });
    grid.innerHTML = view.slice(0, shown).map(function (o, i) {
      var v = o.vid ? '<button class="bvid" data-i="' + i + '">▶ 답변 영상 보기</button>' : '';
      return '<article class="card bcard"><div class="bhead"><span class="bcat">' + esc(o.cat || '질문') + '</span><span class="bdate">' + esc(o.date) + '</span></div>' +
        '<p class="bq"><b>Q</b>' + esc(o.q) + '</p><p class="bmeta">' + esc([o.town, o.nick].filter(Boolean).join(' · ')) + '</p>' +
        '<p class="ba"><b>A</b>' + esc(o.a) + '</p><div class="bbot"><span class="bfmt">' + esc(o.fmt) + '</span>' + v + '</div></article>';
    }).join('') || '<div class="bempty"><img src="assets/ddc-shy.webp" alt=""><b>아직 해당하는 답변이 없어요</b><span>질문을 남겨 주시면 영상으로 답해 드려요!</span></div>';
    more.style.display = view.length > shown ? '' : 'none';
    Array.prototype.forEach.call(grid.querySelectorAll('.bvid'), function (b) {
      b.addEventListener('click', function () {
        var o = view[+b.dataset.i], cfg = (C.videos || {})[o.vid];
        var fake = document.createElement('div'); fake.dataset.video = cfg ? o.vid : '';
        if (!cfg && /^[\w-]{11}$/.test(o.vid)) { C.videos = C.videos || {}; C.videos['_b' + b.dataset.i] = { title: o.fmt || o.q, id: o.vid }; fake.dataset.video = '_b' + b.dataset.i; }
        window.__openVideo && window.__openVideo(fake.dataset.video);
      });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('#bChips .ch'), function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('#bChips .ch'), function (x) { x.classList.toggle('on', x === b); });
      filt = b.dataset.b; shown = 6; render();
    });
  });
  qInput.addEventListener('input', function () { kw = qInput.value.trim(); shown = 6; render(); });
  more.addEventListener('click', function () { shown += 6; render(); });

  var url = (C.answerSheetCsvUrl || '').trim();
  function demo(msg) { all = DEMO; note.textContent = msg; render(); }
  if (!url) demo('예시 데이터예요. 구글시트를 연결하면 실제 답변이 자동으로 올라와요.');
  else fetch(url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw 0; return r.text(); })
    .then(function (t) { all = fromSheet(t); note.textContent = all.length ? '구글시트에서 자동으로 불러왔어요.' : ''; if (!all.length) demo('아직 공개된 답변이 없어 예시를 보여 드려요.'); else render(); })
    .catch(function () { demo('구글시트를 불러오지 못해 예시를 보여 드려요.'); });
})();

/* ---------- DDC 픽셀 캐릭터 (혼자 걷기 · 반응 · 잡기 · 던지기) ---------- */
(function () {
  var stage = document.getElementById('stage'), el = document.getElementById('ddc'), cv = document.getElementById('ddcCv');
  if (!stage || !el || !cv) return;
  var g = cv.getContext('2d'), sh = document.getElementById('ddcShadow'), say = document.getElementById('ddcSay'),
      fxBox = document.getElementById('ddcFx'), hint = document.getElementById('ddcHint');

  /* ===== 1. 픽셀 그림 (24 x 30) ===== */
  var C = { G: '#8CC21E', GL: '#B9E356', GD: '#6C9A10', K: '#5B5B56', KL: '#7C7C76', KD: '#43433F', F: '#F5F2E7', FD: '#DEDACB', E: '#33332F', P: '#F2C2BC', O: '#EF7A1A', W: '#FFFFFF' };
  function r(x, y, w, h, c) { g.fillStyle = C[c] || c; g.fillRect(x, y, w, h); }
  function sprite(o) {             // o: {face, arms, legs, frame, look, sit}
    g.clearRect(0, 0, 24, 30);
    var dy = o.sit ? 2 : (o.bob || 0);
    g.save(); g.translate(0, dy);
    // 안테나 C
    r(11, 0, 5, 2, 'G'); r(10, 1, 2, 4, 'G'); r(11, 4, 4, 2, 'G'); r(12, 0, 2, 1, 'GL');
    // 고리
    r(9, 6, 6, 1, 'K'); r(8, 7, 2, 3, 'K'); r(14, 7, 2, 3, 'K'); r(10, 7, 4, 3, 'G'); r(10, 6, 2, 1, 'KL');
    // 팔 (두건 뒤)
    if (o.arms === 'up') { r(1, 14, 3, 5, 'K'); r(20, 14, 3, 5, 'K'); }
    if (o.arms === 'wave') { r(20, 12 + (o.frame % 2), 3, 6, 'K'); }
    // 몸통 · 다리
    var L = o.legs || 'stand', f = o.frame || 0;
    if (L === 'stand') { r(8, 25, 3, 4, 'KD'); r(13, 25, 3, 4, 'KD'); }
    if (L === 'walk') { var a = [4, 3, 2, 3][f % 4], b = [2, 3, 4, 3][f % 4]; r(8, 25, 3, a, 'KD'); r(13, 25, 3, b, 'KD'); }
    if (L === 'dangle') { r(8 + (f % 2), 25, 3, 5, 'KD'); r(13 - (f % 2), 25, 3, 5, 'KD'); }
    if (L === 'tuck') { r(7, 24, 4, 3, 'KD'); r(13, 24, 4, 3, 'KD'); }
    if (L === 'sit') { r(6, 25, 4, 2, 'KD'); r(14, 25, 4, 2, 'KD'); }
    r(6, 20, 12, 5, 'K'); r(7, 25, 10, 1, 'KD'); r(7, 20, 3, 1, 'KL');
    if (!o.arms || o.arms === 'down') { r(4, 21, 2, 3, 'K'); r(18, 21, 2, 3, 'K'); }
    if (o.arms === 'wave') { r(4, 21, 2, 3, 'K'); }
    if (o.arms === 'point') { r(1, 21, 5, 2, 'K'); r(18, 21, 2, 3, 'K'); }
    if (o.arms === 'hug') { r(5, 21, 3, 2, 'K'); r(16, 21, 3, 2, 'K'); }
    // 두건
    r(7, 9, 10, 1, 'G'); r(5, 10, 14, 1, 'G'); r(4, 11, 16, 1, 'G'); r(3, 12, 18, 8, 'G'); r(4, 20, 16, 1, 'GD');
    r(19, 13, 2, 7, 'GD'); r(3, 19, 2, 1, 'GD'); r(5, 11, 4, 1, 'GL'); r(4, 12, 2, 2, 'GL'); r(7, 10, 2, 1, 'GL');
    // 얼굴
    r(7, 13, 10, 1, 'F'); r(6, 14, 12, 5, 'F'); r(7, 19, 10, 1, 'FD'); r(7, 14, 2, 1, 'W');
    r(6, 17, 2, 1, 'P'); r(16, 17, 2, 1, 'P'); r(11, 17, 2, 1, 'G');
    var lx = o.look || 0, fc = o.face || 'normal';
    if (fc === 'normal') { r(8 + lx, 15, 2, 2, 'E'); r(14 + lx, 15, 2, 2, 'E'); }
    if (fc === 'blink' || fc === 'sleep') { r(8 + lx, 16, 2, 1, 'E'); r(14 + lx, 16, 2, 1, 'E'); }
    if (fc === 'happy') { r(7, 16, 1, 1, 'E'); r(8, 15, 1, 1, 'E'); r(9, 16, 1, 1, 'E'); r(14, 16, 1, 1, 'E'); r(15, 15, 1, 1, 'E'); r(16, 16, 1, 1, 'E'); r(10, 18, 4, 1, 'E'); r(11, 18, 2, 1, 'O'); }
    if (fc === 'wink') { r(8, 15, 2, 2, 'E'); r(14, 16, 1, 1, 'E'); r(15, 15, 1, 1, 'E'); r(16, 16, 1, 1, 'E'); r(10, 18, 4, 1, 'E'); r(11, 18, 2, 1, 'O'); }
    if (fc === 'surprise') { r(8, 14, 2, 3, 'E'); r(14, 14, 2, 3, 'E'); r(11, 18, 2, 1, 'E'); }
    if (fc === 'dizzy') { [[7, 14], [9, 14], [8, 15], [7, 16], [9, 16], [14, 14], [16, 14], [15, 15], [14, 16], [16, 16]].forEach(function (p) { r(p[0], p[1], 1, 1, 'E'); }); r(10, 18, 1, 1, 'E'); r(11, 18, 1, 1, 'F'); r(12, 18, 1, 1, 'E'); r(13, 18, 1, 1, 'F'); }
    if (fc === 'sleep') { r(11, 18, 2, 1, 'FD'); }
    g.restore();
  }

  /* ===== 2. 크기 · 놀이 영역 (글자 영역은 못 들어감) ===== */
  var SC, CW, CH, W, H, GROUND, MINX, MINY, mobile, TR = [];
  function overText(l, t, w, h) { for (var i = 0; i < TR.length; i++) { var q = TR[i]; if (l < q.r && l + w > q.l && t < q.b && t + h > q.t) return true; } return false; }
  function textBox() {
    var rr = stage.getBoundingClientRect(), R = 0, B = 0;
    ['.hl .slogan', '.hl .chip', '.hl h1', '.hl .lead', '.hl .cta', '.hl .stats'].forEach(function (q) {
      var e = stage.querySelector(q); if (!e) return; var b = e.getBoundingClientRect();
      R = Math.max(R, b.right - rr.left); B = Math.max(B, b.bottom - rr.top);
    });
    return { right: R, bottom: B };
  }
  var x, y, vx = 0, vy = 0, ang = 0, va = 0, face = 1;
  function measure(first) {
    var rr = stage.getBoundingClientRect(); W = rr.width; H = rr.height; mobile = W < 700;
    SC = mobile ? 4 : 6; CW = 24 * SC; CH = 30 * SC;
    el.style.width = CW + 'px'; el.style.height = CH + 'px';
    GROUND = H - (mobile ? 20 : 32);
    MINX = 0; MINY = -CH * .3;
    TR = []; ['.hl .slogan', '.hl .chip', '.hl h1', '.hl .lead', '.hl .cta', '.hl .stats'].forEach(function (q) {
      var e = stage.querySelector(q); if (!e) return; var b = e.getBoundingClientRect();
      TR.push({ l: b.left - rr.left, t: b.top - rr.top, r: b.right - rr.left, b: b.bottom - rr.top });
    });                         // 언덕 전체 폭 사용 (글자 위로는 뒤로 지나감)
    if (first) { x = mobile ? W - CW - 24 : W - CW - 280; y = GROUND - CH; }
    x = Math.min(Math.max(x, MINX), W - CW); y = Math.max(Math.min(y, GROUND - CH), MINY);
  }
  measure(true); addEventListener('resize', function () { measure(false); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { measure(false); }).observe(stage);
  addEventListener('load', function () { measure(false); });

  /* ===== 3. 말풍선 · 효과 ===== */
  var sayT = 0;
  function talk(t, ms) { say.textContent = t; say.classList.add('on'); sayT = performance.now() + (ms || 1600); }
  function fx(ch, cls, n) {
    for (var k = 0; k < (n || 1); k++) (function (k) {
      setTimeout(function () {
        var i = document.createElement('i'); i.textContent = ch; if (cls) i.className = cls;
        i.style.left = (x + CW * (.3 + Math.random() * .4)) + 'px'; i.style.top = (y + CH * .15) + 'px';
        i.style.color = cls ? '' : ['#E0564A', '#F2A0C0', '#9CD818', '#FFC93C'][k % 4];
        i.style.setProperty('--dx', ((Math.random() - .5) * 30) + 'px');
        fxBox.appendChild(i); setTimeout(function () { i.remove(); }, 2100);
      }, k * 120);
    })(k);
  }
  var LINES = {
    hello: ['안녕!', '반가워요!', '동두천 구경 왔어요?'],
    tap: ['헤헤', '간지러워!', '또 눌러줘!', '질문 남겨줄래요?'],
    grab: ['으앗!', '어디 가요?!', '살살 해줘요~'],
    wall: ['아야!', '쿵!', '벽이다!'],
    dizzy: ['어지러워…', '별이 보여요…', '빙글빙글~'],
    land: ['착지!', '또 던져줘!', '10점 만점!'],
    idle: ['소요산 가고 싶다~', '오늘 날씨 좋다!', '질문은 왼쪽에서!', '영상도 보고 가요!'],
    wake: ['깜짝이야!', '안 잤어요!'],
    night: ['졸려…', '노을 예쁘다~'], morning: ['좋은 아침!', '해가 떴다!']
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ===== 4. 상태 머신 ===== */
  var state = 'idle', t = 0, frame = 0, ft = 0, target = 0, nextAct = 2, blinkT = 3, sq = 0, lastTouch = performance.now(),
      pointer = { x: -999, y: -999, t: 0 }, helloAt = 0, held = false, grabOff = { x: 0, y: 0 }, trail = [], downAt = 0, moved = 0, landSpd = 0;
  function set(s) { state = s; t = 0; frame = 0; }
  function onGround() { return y >= GROUND - CH - .5; }

  function decide() {
    var rnd = Math.random();
    if (rnd < .6) { target = MINX + Math.random() * (W - CW - MINX); set('walk'); }
    else if (rnd < .72) { set('hop'); vy = -520; }
    else if (rnd < .85) { set('point'); if (!mobile) talk(pick(LINES.idle), 2000); }
    else { set('idle'); talk(pick(LINES.idle), 1800); }
    nextAct = 1.6 + Math.random() * 3;
  }

  var last = performance.now();
  function step(now) {
    var dt = Math.min(.033, (now - last) / 1000); last = now; t += dt; ft += dt;
    var near = Math.hypot(pointer.x - (x + CW / 2), pointer.y - (y + CH / 2)) < (mobile ? 0 : 190) && now - pointer.t < 1500;

    if (!held) {
      // 공중 물리
      if (!onGround() || vy < 0) {
        vy += 2200 * dt; x += vx * dt; y += vy * dt; ang += va * dt;
        var maxX = W - CW;
        if (x < MINX) { x = MINX; if (Math.abs(vx) > 400) { talk(pick(LINES.wall)); sq = .5; } vx = Math.abs(vx) * .55; va = -va * .5; }
        if (x > maxX) { x = maxX; if (Math.abs(vx) > 400) { talk(pick(LINES.wall)); sq = .5; } vx = -Math.abs(vx) * .55; va = -va * .5; }
        if (y < MINY) { y = MINY; vy = Math.abs(vy) * .4; }
        if (y >= GROUND - CH) {
          landSpd = vy; y = GROUND - CH;
          if (vy > 650) { vy = -vy * .35; vx *= .7; va *= .6; sq = Math.min(1, landSpd / 1500); }
          else {
            vy = 0; sq = Math.min(.8, landSpd / 900);
            if (state === 'fly') {
              if (landSpd > 500 || Math.abs(ang) > 90) { set('dizzy'); talk(pick(LINES.dizzy), 1800); fx('★', '', 4); }
              else { set('land'); if (Math.random() < .6) talk(pick(LINES.land)); }
            } else if (state === 'hop' || state === 'happy') set('idle');
          }
        }
      } else {
        // 땅 위
        ang += (0 - ang) * Math.min(1, dt * 12); vx *= Math.pow(.001, dt);
        if (state === 'idle' || state === 'point') {
          if (near) { face = pointer.x < x + CW / 2 ? -1 : 1; if (now - helloAt > 9000) { helloAt = now; set('wave'); talk(pick(LINES.hello)); } }
          if (t > nextAct) decide();
          if (now - lastTouch > 25000 || stage.classList.contains('dusk')) set('sleep');
        } else if (state === 'walk') {
          var d = target - x; face = d < 0 ? -1 : 1;
          var sp = (mobile ? 46 : 70) * (near ? .4 : 1);
          if (Math.abs(d) < 4) { set('idle'); nextAct = 1 + Math.random() * 2.5; }
          else x += Math.sign(d) * Math.min(Math.abs(d), sp * dt);
          if (near && now - helloAt > 9000) { helloAt = now; set('wave'); talk(pick(LINES.hello)); }
        } else if (state === 'wave' && t > 1.4) set('idle');
        else if (state === 'land' && t > .5) set('idle');
        else if (state === 'dizzy' && t > 1.9) { set('shake'); }
        else if (state === 'shake' && t > .5) set('idle');
        else if (state === 'sleep') {
          if (ft > 1.3) { ft = 0; fx('Z', 'z'); }
          if (!stage.classList.contains('dusk') && now - lastTouch < 25000) { set('idle'); talk(pick(LINES.wake)); }
        } else if (state === 'fly') set('land');
      }
    }

    // 프레임 · 깜빡임
    if (ft > (state === 'walk' ? .14 : .22)) { ft = 0; frame++; }
    blinkT -= dt; var blink = blinkT < 0 && blinkT > -.12; if (blinkT < -.12) blinkT = 2 + Math.random() * 3;
    sq *= Math.pow(.002, dt);
    if (sayT && now > sayT) { say.classList.remove('on'); sayT = 0; }

    // 그리기
    var look = near ? (pointer.x < x + CW / 2 ? -1 : 1) : (state === 'walk' ? face : 0), o;
    switch (state) {
      case 'walk': o = { face: blink ? 'blink' : 'normal', legs: 'walk', frame: frame, look: look, bob: frame % 2 ? -1 : 0 }; break;
      case 'held': o = { face: 'surprise', legs: 'dangle', arms: 'up', frame: frame }; break;
      case 'fly': o = { face: Math.hypot(vx, vy) > 900 ? 'surprise' : 'happy', legs: 'tuck', arms: 'up' }; break;
      case 'hop': case 'happy': o = { face: 'happy', legs: 'tuck', arms: 'up' }; break;
      case 'wave': o = { face: 'wink', arms: 'wave', frame: frame, legs: 'stand' }; break;
      case 'point': o = { face: blink ? 'blink' : 'normal', arms: 'point', look: -1, legs: 'stand' }; break;
      case 'dizzy': o = { face: 'dizzy', legs: 'sit', sit: true, arms: 'down' }; break;
      case 'shake': o = { face: 'blink', legs: 'stand', look: frame % 2 ? 1 : -1 }; break;
      case 'land': o = { face: 'happy', legs: 'stand', arms: 'up' }; break;
      case 'sleep': o = { face: 'sleep', legs: 'sit', sit: true, arms: 'hug' }; break;
      default: o = { face: blink ? 'blink' : 'normal', legs: 'stand', look: look, bob: Math.sin(t * 3) > .6 ? -1 : 0 };
    }
    sprite(o);
    var sx = 1 + sq * .22, sy = 1 - sq * .2, flip = (state === 'point') ? 1 : 1;
    if (state === 'dizzy') ang = Math.sin(t * 10) * 6;
    if (state === 'shake') ang = Math.sin(t * 40) * 5;
    el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + ang + 'deg)';
    cv.style.transform = 'scale(' + (sx * flip) + ',' + sy + ')';
    var lift = Math.max(0, (GROUND - CH) - y), k = Math.max(.25, 1 - lift / 420);
    sh.style.transform = 'translate(' + (x + CW / 2 - 55) + 'px,' + (GROUND - 8) + 'px) scale(' + k + ')'; sh.style.opacity = k;
    var bx = Math.min(W - 70, Math.max(70, x + CW / 2)), by = Math.max(4, y - 44), bw = say.offsetWidth || 90;
    say.style.transform = 'translate(-50%,0) translate(' + bx + 'px,' + by + 'px)';
    say.style.visibility = overText(bx - bw / 2, by, bw, 36) ? 'hidden' : 'visible';   // 글자 위에서는 말풍선 숨김
    var hx = Math.min(W - 200, Math.max(8, x - 40)), hy = Math.max(8, y - 40);
    hint.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';
    hint.style.visibility = overText(hx, hy, hint.offsetWidth || 180, 34) ? 'hidden' : 'visible';
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  setTimeout(function () { talk(pick(LINES.hello), 1800); }, 1200);

  /* ===== 5. 마우스 · 터치 ===== */
  function local(e) { var rr = stage.getBoundingClientRect(); return { x: e.clientX - rr.left, y: e.clientY - rr.top, t: performance.now() }; }
  stage.addEventListener('pointermove', function (e) { var p = local(e); pointer.x = p.x; pointer.y = p.y; pointer.t = p.t; });
  stage.addEventListener('pointerleave', function () { pointer.t = 0; });
  var hinted = false;
  function touch() { lastTouch = performance.now(); if (!hinted) { hinted = true; hint.classList.add('off'); } }

  el.addEventListener('pointerdown', function (e) {
    e.preventDefault(); el.setPointerCapture(e.pointerId); touch();
    var wasSleep = state === 'sleep';
    var p = local(e); grabOff.x = p.x - x; grabOff.y = p.y - y; trail = [p]; downAt = p.t; moved = 0;
    held = true; el.classList.add('grab'); vx = vy = va = 0;
    el.style.transformOrigin = grabOff.x + 'px ' + grabOff.y + 'px';
    set('held'); talk(wasSleep ? pick(LINES.wake) : pick(LINES.grab), 1200);
  });
  el.addEventListener('pointermove', function (e) {
    if (!held) return;
    var p = local(e), l = trail[trail.length - 1]; moved += Math.hypot(p.x - l.x, p.y - l.y);
    trail.push(p); if (trail.length > 6) trail.shift();
    var nx = Math.min(Math.max(p.x - grabOff.x, MINX), W - CW), ny = Math.min(Math.max(p.y - grabOff.y, MINY), GROUND - CH);
    // 잡힌 지점을 축으로 대롱대롱 흔들림 (움직인 방향 반대로 기울기)
    var mvx = (nx - x) / Math.max(.001, (p.t - l.t) / 1000);
    va += (-mvx * .02 - ang * 18 - va * 4) * .016 * 6;
    x = nx; y = ny;
  });
  // 잡고 있는 동안 진자 운동
  (function swing() { if (held) { va += (-ang * 30 - va * 5) * .016; ang = Math.max(-70, Math.min(70, ang + va * .016)); } requestAnimationFrame(swing); })();

  function release() {
    if (!held) return; held = false; el.classList.remove('grab'); el.style.transformOrigin = '50% 50%';
    var a = trail[0], b = trail[trail.length - 1], dt = Math.max(16, b.t - a.t) / 1000;
    if (moved < 6 && b.t - downAt < 320) {          // 톡: 깡총 + 하트
      set('happy'); vy = -620; vx = 0; va = 0; ang = 0;
      fx('♥', '', 3); talk(pick(LINES.tap), 1500);
    } else {                                         // 던지기
      vx = Math.max(-2600, Math.min(2600, (b.x - a.x) / dt));
      vy = Math.max(-2600, Math.min(2600, (b.y - a.y) / dt));
      va = vx * .3 + ang * 2; set('fly');
      if (Math.hypot(vx, vy) < 120) { vy = Math.max(vy, 0); }
    }
  }
  el.addEventListener('pointerup', release); el.addEventListener('pointercancel', release);

  // 노을 ↔ 낮 반응
  new MutationObserver(function () {
    if (stage.classList.contains('dusk')) talk(pick(LINES.night), 1800);
    else { lastTouch = performance.now(); talk(pick(LINES.morning), 1800); }
  }).observe(stage, { attributes: true, attributeFilter: ['class'] });
})();
