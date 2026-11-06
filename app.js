/* 회사별 갤러리 + 상세 창 + 목차 현재 위치 */
(function () {
  document.documentElement.classList.add('js');
  var arts = Array.prototype.slice.call(document.querySelectorAll('.details .proj'));
  var peek = document.querySelector('.peek');
  var panel = peek.querySelector('.panel');
  var content = peek.querySelector('.content');
  var openIdx = -1, lastFocus = null;

  function coverHTML(a, cls) {
    var chip = (cls === 'cv' && a.dataset.demo) ? '<span class="demo-chip" role="link" tabindex="0" data-href="' + a.dataset.demo + '">직접 보기 ↗</span>' : '';
    return a.dataset.cover
      ? '<div class="' + cls + '"><img src="' + a.dataset.cover + '" alt="" loading="lazy"' + (a.dataset.pos ? ' style="object-position:' + a.dataset.pos + '"' : '') + '>' + chip + '</div>'
      : '<div class="' + cls + ' txt t-' + a.dataset.tone + '"><span>' + a.dataset.coverText + '</span>' + chip + '</div>';
  }
  function openDemo(e) {
    var t = e.target.closest('.demo-chip'); if (!t) return false;
    e.preventDefault(); e.stopPropagation();
    window.open(t.dataset.href, '_blank', 'noopener');
    return true;
  }

  function makeCard(a, org) {
    var c = document.createElement('a');
    c.className = 'card'; c.href = '#' + a.id;
    c.innerHTML = coverHTML(a, 'cv') +
      '<div class="cb"><h4>' + a.querySelector('h3').innerHTML + '</h4><p class="sub">' + a.dataset.sub + '</p>' +
      '<p class="pr"><span class="tag ' + a.dataset.tone + '">' + a.dataset.tag + '</span><span>' + (org ? org + ' · ' : '') + a.dataset.when + '</span></p></div>';
    c.addEventListener('click', function (e) { if (openDemo(e)) return; e.preventDefault(); open(arts.indexOf(a), c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList.contains('demo-chip')) openDemo(e); });
    return c;
  }

  // 회사마다 카드 만들기
  document.querySelectorAll('.co').forEach(function (co) {
    var g = co.querySelector('.gallery');
    co.querySelectorAll('.details .proj').forEach(function (a) { g.appendChild(makeCard(a)); });
  });

  // 개발 프로젝트 모아보기
  var dg = document.querySelector('.dev-gallery');
  if (dg) {
    arts.filter(function (a) { return a.dataset.dev; })
      .sort(function (x, y) { return +x.dataset.dev - +y.dataset.dev; })
      .forEach(function (a) { dg.appendChild(makeCard(a)); });
  }
  var tabs = document.querySelectorAll('.viewtabs [data-view]');
  function showView(v) {
    tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.view === v)); });
    document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== v; });
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () { showView(b.dataset.view); });
  });
  if (location.hash === '#dev') showView('dev');

  // 상세 창
  function fill(i) {
    var a = arts[i]; openIdx = i;
    var body = a.querySelector('.body').cloneNode(true);
    var f = body.querySelector('figure img');
    if (f && f.getAttribute('src') === a.dataset.cover) f.closest('figure').remove();
    var demo = a.dataset.demo ? '<a class="demo-btn" href="' + a.dataset.demo + '" target="_blank" rel="noopener">' + (a.dataset.demoLabel || '데모 직접 보기') + ' <span aria-hidden="true">↗</span></a>' : '';
    content.innerHTML = coverHTML(a, 'pcv') + '<div class="pin"><h2 id="peek-title">' + a.querySelector('h3').innerHTML + '</h2>' + a.querySelector('.props').outerHTML + demo + '</div>';
    var pin = content.querySelector('.pin');
    pin.appendChild(body);
    var lk = body.querySelector('.links:not(.print-link)');
    if (lk) { lk.classList.add('top-links'); pin.insertBefore(lk, body); }
    panel.scrollTop = 0;
    peek.querySelector('[data-prev]').disabled = i <= 0;
    peek.querySelector('[data-next]').disabled = i >= arts.length - 1;
  }
  function open(i, from) {
    lastFocus = from || document.activeElement;
    fill(i);
    peek.hidden = false; document.body.classList.add('locked');
    requestAnimationFrame(function () { peek.classList.add('on'); });
    history.replaceState(null, '', '#' + arts[i].id);
    peek.querySelector('.close').focus();
  }
  function close() {
    if (peek.hidden) return;
    peek.classList.remove('on'); document.body.classList.remove('locked');
    setTimeout(function () { peek.hidden = true; }, 160);
    history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    openIdx = -1;
  }
  function step(d) { var t = openIdx + d; if (t < 0 || t >= arts.length) return; fill(t); history.replaceState(null, '', '#' + arts[t].id); }
  peek.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) close();
    else if (e.target.closest('[data-prev]')) step(-1);
    else if (e.target.closest('[data-next]')) step(1);
  });
  document.addEventListener('keydown', function (e) {
    if (peek.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') {
      var f = panel.querySelectorAll('button:not([disabled]), a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // 흐름도의 근거 숫자를 누르면 해당 프로젝트 상세
  document.querySelectorAll('[data-open]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var k = arts.map(function (x) { return x.id; }).indexOf(el.dataset.open);
      if (k < 0) return; e.preventDefault(); open(k, el);
    });
  });
  // 사진 크게 보기
  var lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true;
  lb.innerHTML = '<img alt=""><button type="button" aria-label="닫기">✕</button>';
  document.body.appendChild(lb);
  function lbOpen(src, alt) { var im = lb.querySelector('img'); im.src = src; im.alt = alt || ''; lb.hidden = false; requestAnimationFrame(function () { lb.classList.add('on'); }); }
  function lbClose() { lb.classList.remove('on'); setTimeout(function () { lb.hidden = true; }, 160); }
  lb.addEventListener('click', lbClose);
  content.addEventListener('click', function (e) {
    var im = e.target.closest('.pcv img, .ph img, .doc img, .ad img'); if (!im) return;
    e.preventDefault(); lbOpen(im.currentSrc || im.src, im.alt);
  });
  document.addEventListener('click', function (e) {
    var im = e.target.closest('.edu-figs img'); if (!im) return;
    e.preventDefault(); lbOpen(im.currentSrc || im.src, im.alt);
  });
  document.addEventListener('keydown', function (e) { if (!lb.hidden && e.key === 'Escape') { e.stopImmediatePropagation(); lbClose(); } }, true);
  var hit = arts.filter(function (a) { return '#' + a.id === location.hash; })[0];
  if (hit) open(arts.indexOf(hit));

  // 목차 현재 위치
  var links = document.querySelectorAll('.toc a');
  var secs = Array.prototype.map.call(links, function (l) { return document.querySelector(l.getAttribute('href')); });
  function mark() {
    var y = window.scrollY + window.innerHeight * 0.3, cur = 0;
    secs.forEach(function (s, k) { if (s && s.offsetTop <= y) cur = k; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = secs.length - 1;
    links.forEach(function (l, k) { l.classList.toggle('on', k === cur); });
  }
  window.addEventListener('scroll', mark, { passive: true }); window.addEventListener('resize', mark); mark();
})();
