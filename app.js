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
      $('#doneMsg').textContent = (cat === '사진·영상 공모' || cat === '우리 가게 추천')
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
  $$('[data-video]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('.like')) return;
      var v = (C.videos || {})[el.dataset.video] || { title: '동두천시 유튜브', id: '' };
      $('#vTitle').textContent = v.title;
      $('#vPlayer').innerHTML = v.id
        ? '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
        : '<div class="ph"><img src="assets/ddc-shy.webp" alt=""><b style="font-size:18px">영상 준비 중이에요</b><p style="color:#C9D6CC;margin-top:6px">사업 착수 후 이 자리에서 바로 재생돼요.</p></div>';
      openM('#mVideo');
    });
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
        menuLinks.forEach(function (a) { a.classList.toggle('on', a.dataset.go === id && (id !== 'ask' || a.dataset.cat === cat)); });
        tabLinks.forEach(function (a) { a.classList.toggle('on', (a.dataset.go || 'top') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'answer', 'ask', 'how', 'series', 'events'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
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
