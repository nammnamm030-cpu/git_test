// ORBIT / LAB — dependency-free creative coding studies.
const palette = ['#c2a6ff', '#d2f879', '#ffa9d0', '#8fdcf3'];
const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function seed(n) { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); }
function dot(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.1, radius), 0, TAU);
  ctx.fill();
}
function star(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius * 0.24, y - radius * 0.24);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x + radius * 0.24, y + radius * 0.24);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius * 0.24, y + radius * 0.24);
  ctx.lineTo(x - radius, y);
  ctx.lineTo(x - radius * 0.24, y - radius * 0.24);
  ctx.closePath();
  ctx.fill();
}
function sky(ctx) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0e1120';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < 70; i++) {
    dot(ctx, seed(i + 1) * ctx.canvas.width, seed(i + 201) * ctx.canvas.height,
      0.4 + seed(i + 401) * 0.7, '#56627e');
  }
}

// The same functions power gallery thumbnails, the live output, and displayed source.
function orbit(ctx, v, s) {
  sky(ctx);
  const cx = ctx.canvas.width / 2 + (s.pointer.x - 360) * 0.18;
  const cy = ctx.canvas.height / 2 + (s.pointer.y - 220) * 0.15;
  for (let i = 1; i <= 4; i++) {
    const radius = v.radius * i / 4;
    const angle = s.time * v.speed / i + i * 1.7;
    ctx.strokeStyle = '#706595';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.55, -0.32, 0, TAU);
    ctx.stroke();
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.55;
    const px = cx + x * Math.cos(-0.32) - y * Math.sin(-0.32);
    const py = cy + x * Math.sin(-0.32) + y * Math.cos(-0.32);
    dot(ctx, px, py, 3 + i * 1.6, palette[i - 1]);
  }
  ctx.shadowColor = '#c2a6ff';
  ctx.shadowBlur = 28;
  star(ctx, cx, cy, 27, '#e3d7ff');
  ctx.shadowBlur = 0;
}

function constellation(ctx, v, s) {
  sky(ctx);
  const points = [];
  for (let i = 0; i < v.count; i++) {
    points.push({
      x: 40 + seed(i + 11) * 640 + Math.sin(s.time * 0.35 + i) * 9,
      y: 35 + seed(i + 91) * 365 + Math.cos(s.time * 0.4 + i) * 9
    });
  }
  points.push(s.pointer);
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    for (let j = i + 1; j < points.length; j++) {
      const b = points[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < v.reach) {
        ctx.globalAlpha = (1 - distance / v.reach) * 0.8;
        ctx.strokeStyle = '#bea9ff';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    star(ctx, a.x, a.y, i === points.length - 1 ? 10 : 3.5, '#e6dfff');
  }
}

function starfield(ctx, v, s) {
  sky(ctx);
  for (let y = 35; y < 430; y += v.gap) {
    for (let x = 35; x < 710; x += v.gap) {
      const distance = Math.hypot(s.pointer.x - x, s.pointer.y - y);
      const near = Math.max(0, 1 - distance / 170);
      const wave = Math.sin(s.time * 2 - distance * 0.035);
      const size = 3 + near * 10 + (wave + 1) * 1.2;
      const hue = (v.hue + x * 0.12 + near * 70) % 360;
      star(ctx, x, y + wave * near * 12, size, 'hsl(' + hue + ', 85%, 78%)');
    }
  }
}

function meteors(ctx, v, s) {
  sky(ctx);
  const tilt = (s.pointer.x - 360) / 360 * 0.8;
  for (let i = 0; i < v.count; i++) {
    const progress = (s.time * v.speed * 0.12 + seed(i + 54)) % 1;
    const y = progress * 650 - 100;
    const x = (seed(i + 15) * 900 + y * tilt + 900) % 900 - 90;
    const tail = 35 + seed(i + 8) * 45;
    const gradient = ctx.createLinearGradient(x - tilt * tail, y - tail, x, y);
    gradient.addColorStop(0, 'rgba(194,166,255,0)');
    gradient.addColorStop(1, '#d9c9ff');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x - tilt * tail, y - tail);
    ctx.lineTo(x, y);
    ctx.stroke();
    star(ctx, x, y, 3.5, '#f4edff');
  }
}

function galaxy(ctx, v, s) {
  sky(ctx);
  const cx = 360 + (s.pointer.x - 360) * 0.22;
  const cy = 220 + (s.pointer.y - 220) * 0.22;
  for (let i = 0; i < v.count; i++) {
    const radius = Math.sqrt(seed(i + 44)) * 225;
    const arm = i % 3 * TAU / 3;
    const angle = arm + radius * v.twist / 90 + s.time * 0.15;
    const scatter = (seed(i + 64) - 0.5) * 40;
    const x = cx + Math.cos(angle) * radius + scatter;
    const y = cy + Math.sin(angle) * radius * 0.58 + scatter * 0.55;
    dot(ctx, x, y, 0.6 + seed(i + 104) * 1.6, palette[i % 4]);
  }
  ctx.shadowColor = '#c2a6ff';
  ctx.shadowBlur = 32;
  star(ctx, cx, cy, 20, '#f5eaff');
  ctx.shadowBlur = 0;
}

function vortex(ctx, v, s) {
  sky(ctx);
  const cx = 360 + (s.pointer.x - 360) * 0.4;
  const cy = 220 + (s.pointer.y - 220) * 0.4;
  for (let i = 0; i < v.count; i++) {
    const phase = (seed(i + 71) + s.time * v.pull * 0.035) % 1;
    const radius = 30 + (1 - phase) * 240;
    const angle = i * 2.4 + phase * 9;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.65;
    ctx.globalAlpha = 0.2 + phase * 0.8;
    dot(ctx, x, y, 1 + phase * 1.6, palette[i % 3]);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#c2a6ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#a083ff';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 33, 22, -0.15, 0, TAU);
  ctx.stroke();
  ctx.shadowBlur = 0;
  dot(ctx, cx, cy, 20, '#070810');
}

function aurora(ctx, v, s) {
  sky(ctx);
  const heightShift = (s.pointer.y - 220) * 0.3;
  for (let layer = 0; layer < 24; layer++) {
    ctx.beginPath();
    for (let x = 0; x <= 720; x += 5) {
      const y = 210 + heightShift + layer * 2
        + Math.sin(x * 0.012 + s.time * v.speed + layer * 0.1) * v.height
        + Math.sin(x * 0.026 - s.time * 0.3) * 18;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const hue = 155 + layer * 3 + s.pointer.x * 0.1;
    ctx.strokeStyle = 'hsla(' + hue + ', 85%, 72%, 0.17)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function brush(ctx, v, s) {
  sky(ctx);
  for (let i = 0; i < s.stars.length; i++) {
    const point = s.stars[i];
    const twinkle = 0.75 + Math.sin(s.time * 2 + i) * 0.25;
    ctx.globalAlpha = twinkle;
    star(ctx, point.x, point.y, v.size * point.scale, 'hsl(' + v.hue + ', 90%, 80%)');
  }
  ctx.globalAlpha = 0.45;
  star(ctx, s.pointer.x, s.pointer.y, v.size, '#e6dfff');
  ctx.globalAlpha = 1;
}

const sketches = [
  {
    id: 'orbit', title: '행성의 궤도', en: 'PLANETARY ORBITS', level: 'beginner', tags: ['변수', '좌표', '삼각함수'], draw: orbit,
    summary: '마우스를 따라 움직이는 작은 태양계',
    intro: '하나의 중심과 네 개의 궤도. 반지름과 속도를 바꾸며 숫자가 위치로 바뀌는 과정을 관찰하세요.',
    interaction: '마우스·터치로 궤도 중심 이동 · 방향키로도 조작 가능',
    art: '하나의 중심에서 서로 다른 속도로 움직이는 오브젝트로 화면의 리듬을 설계할 수 있어요.',
    controls: [{key:'speed',label:'공전 속도',min:0.1,max:2,step:0.1,value:0.7},{key:'radius',label:'궤도 반지름',min:80,max:240,step:10,value:210}],
    notes: [['Math.cos / Math.sin','각도를 가로·세로 위치로 바꿉니다. 반지름을 곱하면 중심에서 떨어진 거리를 정할 수 있어요.'],['s.time * v.speed / i','시간에 속도를 곱합니다. i로 나누므로 바깥쪽 행성일수록 천천히 움직입니다.'],['s.pointer','마우스 좌표 변화의 일부만 중심에 더해 부드럽게 따라오는 느낌을 만듭니다.']],
    quiz: ['반지름을 키우면 무엇이 바뀔까요?', ['행성의 궤도가 넓어진다','행성의 개수가 늘어난다','시간이 빨라진다'],0,'반지름은 중심에서의 거리입니다. 값이 커질수록 궤도가 넓어집니다.']
  },
  {
    id:'constellation',title:'이어지는 별자리',en:'CONSTELLATION',level:'beginner',tags:['배열','조건문','거리'],draw:constellation,
    summary:'가까워진 별 사이에 생기는 연결',
    intro:'별을 배열에 담고 가까운 쌍을 선으로 연결합니다. 포인터도 하나의 별이 되어 새로운 별자리를 만듭니다.',
    interaction:'별 사이로 마우스·손가락 이동 · 연결 거리 조절',
    art:'관객의 위치에 따라 연결 관계가 달라지는 네트워크 작품으로 확장할 수 있습니다.',
    controls:[{key:'count',label:'별의 개수',min:12,max:60,step:2,value:34},{key:'reach',label:'연결 거리',min:45,max:180,step:5,value:125}],
    notes:[['points.push()','별의 x, y 위치를 배열에 추가합니다. 마지막에는 현재 포인터 좌표도 넣어요.'],['Math.hypot(dx, dy)','두 위치의 가로·세로 차이로 직선거리를 계산합니다.'],['if (distance < v.reach)','설정한 거리보다 가까운 별만 연결합니다. 반복문과 조건문이 함께 패턴을 만듭니다.']],
    quiz:['연결 거리를 줄이면 선은 어떻게 될까요?',['항상 더 많아진다','멀리 있는 별 사이의 선이 사라진다','모든 별이 커진다'],1,'더 가까운 별만 조건을 만족하므로 멀리 떨어진 별의 연결이 사라집니다.']
  },
  {
    id:'starfield',title:'반짝이는 별의 격자',en:'STELLAR FIELD',level:'beginner',tags:['반복문','색상','거리'],draw:starfield,
    summary:'손끝에서 퍼지는 별빛과 색의 물결',
    intro:'기존 색의 격자를 별 모양으로 바꾼 실험입니다. 포인터 주변의 별이 커지고, 파동을 따라 위아래로 움직입니다.',
    interaction:'별 위에서 움직이기 · 간격과 색상 바꾸기',
    art:'동일한 도형의 반복에 작은 차이를 더하면 살아 있는 표면이 됩니다.',
    controls:[{key:'gap',label:'별 사이 간격',min:28,max:70,step:2,value:44},{key:'hue',label:'기준 색상',min:0,max:360,step:5,value:245}],
    notes:[['중첩 for 반복문','가로와 세로 위치를 일정 간격으로 훑으며 격자를 만듭니다.'],['Math.max(0, 1 - distance / 170)','170픽셀 안의 별만 가까움의 영향을 받습니다. 멀리 있으면 0으로 제한합니다.'],['Math.sin()','시간과 거리를 함께 넣으면 별들이 서로 다른 타이밍으로 흔들립니다.']],
    quiz:['별 사이 간격을 늘리면 화면 속 별의 수는?',['줄어든다','늘어난다','항상 같다'],0,'같은 화면 안에서 간격이 커지면 반복 횟수가 줄어들어 별이 적게 그려집니다.']
  },
  {
    id:'meteors',title:'쏟아지는 유성우',en:'METEOR SHOWER',level:'beginner',tags:['시간','나머지 연산','그라디언트'],draw:meteors,
    summary:'마우스로 바람의 방향을 바꿔보세요',
    intro:'시간이 흐르면 별똥별이 화면을 가로지릅니다. 가로로 움직여 유성의 방향을 바꾸고, 속도와 개수로 장면의 밀도를 조절하세요.',
    interaction:'좌우로 움직여 낙하 방향 변경 · 속도 조절',
    art:'빛의 꼬리와 반복되는 이동만으로도 장면에 속도와 깊이를 만들 수 있습니다.',
    controls:[{key:'count',label:'유성 개수',min:8,max:60,step:2,value:26},{key:'speed',label:'낙하 속도',min:0.3,max:2,step:0.1,value:0.8}],
    notes:[['% 1','값의 소수 부분을 사용해 진행도를 0 이상 1 미만으로 반복시킵니다.'],['s.pointer.x','마우스가 중심에서 얼마나 떨어졌는지에 따라 낙하 방향을 기울입니다.'],['createLinearGradient()','꼬리의 시작은 투명하게, 끝은 밝게 만들어 빛이 흐르는 느낌을 냅니다.']],
    quiz:['progress 값에 % 1을 사용하는 이유는?',['별을 두 배로 키우기 위해','진행도를 반복시켜 다시 등장하게 하려고','색을 흰색으로 고정하려고'],1,'진행도가 1에 도달하면 다시 0 근처로 돌아오므로 유성이 반복해서 나타납니다.']
  },
  {
    id:'galaxy',title:'회전하는 나선 은하',en:'SPIRAL GALAXY',level:'intermediate',tags:['입자','삼각함수','분포'],draw:galaxy,
    summary:'작은 점 수백 개가 만드는 커다란 흐름',
    intro:'수백 개의 입자를 세 갈래 나선에 배치합니다. 나선의 감김과 별의 수를 조절하며 규칙에서 생겨나는 복잡함을 탐색하세요.',
    interaction:'마우스로 은하 중심 이동 · 나선 감김 조절',
    art:'개별 입자가 아니라 전체 분포의 규칙을 설계하는 생성형 이미지의 기초입니다.',
    controls:[{key:'count',label:'입자 수',min:180,max:900,step:60,value:600},{key:'twist',label:'나선 감김',min:0.5,max:3,step:0.1,value:1.6}],
    notes:[['i % 3','입자를 세 그룹으로 나눠 세 개의 나선팔에 배치합니다.'],['Math.sqrt(seed(...))','난수에 제곱근을 적용해 반지름을 정합니다. 단순한 난수 반지름보다 바깥 면적에도 입자가 분포합니다.'],['radius * v.twist / 90','중심에서 멀수록 각도를 더 돌려 나선을 만듭니다. twist가 커지면 더 많이 감깁니다.']],
    quiz:['i % 3으로 나누어지는 그룹의 수는?',['2개','3개','4개'],1,'나머지가 0, 1, 2로 반복되므로 세 그룹이 만들어집니다.']
  },
  {
    id:'vortex',title:'빛을 끌어당기는 소용돌이',en:'COSMIC VORTEX',level:'intermediate',tags:['보간','극좌표','입자'],draw:vortex,
    summary:'포인터를 따라 이동하는 우주의 소용돌이',
    intro:'입자들이 회전하며 중심으로 가까워집니다. 블랙홀에서 영감을 받은 시각 실험이며 실제 중력 시뮬레이션은 아닙니다.',
    interaction:'마우스로 중심 이동 · 흡입 속도 바꾸기',
    art:'반복적인 이동 경로와 밝기 변화로 가상의 힘을 시각적으로 표현합니다.',
    controls:[{key:'count',label:'입자 수',min:80,max:400,step:20,value:240},{key:'pull',label:'흡입 속도',min:0.3,max:3,step:0.1,value:1.3}],
    notes:[['(1 - phase) * 240','진행도가 커질수록 반지름이 작아져 입자가 중심에 가까워집니다.'],['angle = i * 2.4 + phase * 9','입자마다 출발 각도를 다르게 하고, 진행도에 따라 회전시킵니다.'],['ctx.globalAlpha','입자가 중심에 다가올수록 밝아지도록 투명도를 바꿉니다. 그린 뒤 1로 복원합니다.']],
    quiz:['phase가 커질 때 (1 - phase)는?',['작아진다','커진다','항상 1이다'],0,'진행도 phase가 커지면 1 - phase는 작아져 중심에서의 거리가 줄어듭니다.']
  },
  {
    id:'aurora',title:'흐르는 오로라',en:'AURORA WAVES',level:'intermediate',tags:['사인파','투명도','레이어'],draw:aurora,
    summary:'겹쳐지는 빛의 선으로 그리는 하늘',
    intro:'투명한 곡선을 여러 겹 겹쳐 빛의 장막을 만듭니다. 포인터를 가로로 움직이면 색이, 세로로 움직이면 위치가 달라집니다.',
    interaction:'좌우로 색상, 위아래로 높이 변경 · 파도 조절',
    art:'복잡한 형태도 간단한 파동을 겹치는 방식으로 만들 수 있습니다.',
    controls:[{key:'height',label:'파도 높이',min:15,max:100,step:5,value:58},{key:'speed',label:'흐름 속도',min:0.1,max:1.5,step:0.1,value:0.5}],
    notes:[['Math.sin(x * 0.012 + 시간)','x 위치에 따라 곡선을 만들고 시간으로 파도를 이동시킵니다.'],['layer * 0.1','각 선의 위상을 조금씩 바꿔 완전히 겹치지 않게 합니다.'],['hsla(..., 0.17)','투명도 0.17인 여러 선이 겹치면서 더 밝은 부분을 만듭니다.']],
    quiz:['투명한 선 여러 개를 겹치면 어떤 효과가 생길까요?',['모두 보이지 않는다','겹치는 부분이 더 밝고 진해진다','선이 자동으로 원이 된다'],1,'낮은 투명도의 밝은 선도 여러 번 겹치면 빛이 쌓인 듯한 결과를 만듭니다.']
  },
  {
    id:'brush',title:'나만의 별빛 드로잉',en:'STARDUST BRUSH',level:'beginner',tags:['이벤트','배열','함수'],draw:brush,
    summary:'클릭하고 드래그하며 채우는 밤하늘',
    intro:'마우스를 누른 채 움직이며 별을 남겨보세요. 찍은 별의 위치를 배열에 저장하고, 시간이 지날 때마다 반짝이게 합니다.',
    interaction:'클릭·드래그로 별 그리기 · 방향키 이동 + Enter로 찍기',
    art:'직접 만든 도형을 브러시로 사용하면 코드가 나만의 드로잉 도구가 됩니다.',
    controls:[{key:'size',label:'별 크기',min:3,max:22,step:1,value:10},{key:'hue',label:'별빛 색상',min:0,max:360,step:5,value:275}],
    notes:[['s.stars','사용자가 찍은 별의 좌표가 담긴 배열입니다. 성능을 위해 최근 450개를 유지합니다.'],['star(ctx, x, y, 크기, 색)','공통 도구 star를 호출해 사각형 대신 네 갈래 별을 그립니다.'],['0.75 + sin(...) * 0.25','투명도를 0.5와 1 사이로 바꿉니다. 별마다 타이밍을 다르게 해서 반짝임을 만듭니다.']],
    quiz:['별을 여러 개 그린 뒤에도 기억하려면 무엇에 위치를 담을까요?',['배열','배경색','글꼴'],0,'좌표를 배열에 저장하면 매 프레임 다시 그릴 때 이전에 찍은 별도 함께 보여줄 수 있습니다.']
  }
];

function initialState() {
  return {
    time: 0, pointer: {x:360,y:220}, down: false,
    stars: Array.from({length:22}, (_,i) => ({x:70+seed(i+808)*580,y:65+seed(i+909)*310,scale:0.5+seed(i+404)}))
  };
}
const defaults = sketch => Object.fromEntries(sketch.controls.map(c => [c.key,c.value]));
let selected = 0;
let values = defaults(sketches[0]);
let state = initialState();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reducedMotion;
let heroPaused = reducedMotion;
let activeFilter = 'all';
const $ = selector => document.querySelector(selector);
const canvas = $('#lab-canvas');
const ctx = canvas.getContext('2d');
const heroCanvas = $('#hero-canvas');
const heroContext = heroCanvas.getContext('2d');
const heroState = initialState();
const galleryCards = [];

function renderLab() {
  ctx.save();
  sketches[selected].draw(ctx, values, state);
  ctx.restore();
}
function renderHero() {
  heroContext.save();
  orbit(heroContext, {speed:0.24,radius:260}, heroState);
  heroContext.restore();
}
function showStatus(message) { $('#action-status').textContent = message; }
function scrollToSection(selector) { $(selector).scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'}); }
function pauseLabels() {
  $('#pause').textContent = paused ? '재생' : '일시정지';
  $('#pause').setAttribute('aria-pressed', String(paused));
  $('#hero-pause').textContent = heroPaused ? '재생' : '일시정지';
  $('#hero-pause').setAttribute('aria-pressed', String(heroPaused));
}

function buildGallery() {
  sketches.forEach((sketch,index) => {
    const card = document.createElement('article');
    card.className = 'gallery-card';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-link';
    button.setAttribute('aria-label', sketch.title + ' 예제 열기');
    button.innerHTML = '<div class="thumbnail"><span class="card-number">' + String(index+1).padStart(2,'0') + ' / EXPERIMENT</span><canvas width="720" height="440" aria-hidden="true"></canvas><span class="open-icon" aria-hidden="true">↗</span></div><div class="card-meta"><h3>' + sketch.title + '</h3><span class="badge ' + sketch.level + '">' + (sketch.level==='beginner'?'초급':'중급') + '</span></div><p class="card-description">' + sketch.summary + '</p><p class="card-tags">' + sketch.tags.join(' · ') + '</p>';
    button.addEventListener('click', () => {
      selectSketch(index);
      scrollToSection('#studio');
      $('#sketch-select').focus({preventScroll:true});
    });
    card.append(button);
    $('#gallery').append(card);
    const previewState = initialState();
    previewState.time = 7;
    sketch.draw(card.querySelector('canvas').getContext('2d'), defaults(sketch), previewState);
    galleryCards.push(card);
    const option = document.createElement('option');
    option.value = index;
    option.textContent = String(index+1).padStart(2,'0') + ' / ' + sketch.title;
    $('#sketch-select').append(option);
  });
}
function filterGallery() {
  const query = $('#search').value.trim().toLowerCase();
  let count = 0;
  sketches.forEach((sketch,index) => {
    const match = (activeFilter==='all'||sketch.level===activeFilter) &&
      [sketch.title,sketch.en,sketch.summary,...sketch.tags].join(' ').toLowerCase().includes(query);
    galleryCards[index].hidden = !match;
    if (match) count++;
  });
  $('#empty-state').hidden = count > 0;
  $('#gallery-count').textContent = count + '개의 예제';
}
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed',String(active));
  });
  filterGallery();
}
function selectSketch(index) {
  if (!Number.isInteger(index) || !sketches[index]) return;
  selected = index;
  const sketch = sketches[index];
  values = defaults(sketch);
  state = initialState();
  $('#sketch-select').value = index;
  $('#studio-name').textContent = sketch.title;
  $('#studio-intro').textContent = sketch.intro;
  $('#lesson-level').textContent = (sketch.level==='beginner'?'초급':'중급') + ' / ' + sketch.en;
  $('#lesson-level').className = 'badge ' + sketch.level;
  $('#interaction-guide').textContent = sketch.interaction;
  canvas.setAttribute('aria-label', sketch.title + '. ' + sketch.interaction);
  canvas.classList.toggle('brush',sketch.id==='brush');
  $('#source-code').textContent = sketch.draw.toString();
  $('#art-connection').textContent = sketch.art;
  $('#code-notes').replaceChildren();
  sketch.notes.forEach(([term,description]) => {
    const item=document.createElement('div'), dt=document.createElement('dt'), dd=document.createElement('dd');
    dt.textContent=term; dd.textContent=description; item.append(dt,dd); $('#code-notes').append(item);
  });
  $('#controls').replaceChildren();
  sketch.controls.forEach(control => {
    const label=document.createElement('label');
    label.className='control';
    const caption=document.createElement('span');
    caption.textContent=control.label;
    const output=document.createElement('output');
    output.value=control.value;
    caption.append(output);
    const input=document.createElement('input');
    input.type='range'; input.min=control.min; input.max=control.max; input.step=control.step; input.value=control.value;
    input.id='parameter-'+control.key; label.htmlFor=input.id;
    output.setAttribute('for',input.id);
    input.addEventListener('input',() => {
      values[control.key]=Number(input.value); output.value=input.value; renderLab();
    });
    label.append(caption,input); $('#controls').append(label);
  });
  $('#quiz-question').textContent=sketch.quiz[0];
  $('#quiz-choices').replaceChildren();
  sketch.quiz[1].forEach((choice,i) => {
    const label=document.createElement('label'), radio=document.createElement('input'), text=document.createElement('span');
    radio.type='radio'; radio.name='quiz-answer'; radio.value=i;
    text.textContent=choice; label.append(radio,text); $('#quiz-choices').append(label);
  });
  $('#quiz-feedback').textContent='';
  $('#quiz-feedback').className='';
  showStatus('');
  renderLab();
}

function pointerAt(event, target) {
  const bounds=target.getBoundingClientRect();
  return {x:clamp((event.clientX-bounds.left)*target.width/bounds.width,0,target.width),
    y:clamp((event.clientY-bounds.top)*target.height/bounds.height,0,target.height)};
}
function stamp() {
  const last=state.stars[state.stars.length-1];
  if (last && Math.hypot(last.x-state.pointer.x,last.y-state.pointer.y)<8) return;
  state.stars.push({x:state.pointer.x,y:state.pointer.y,scale:0.6+seed(state.stars.length+Math.round(state.pointer.x))*0.8});
  if(state.stars.length>450)state.stars.shift();
}
canvas.addEventListener('pointermove',event => {
  state.pointer=pointerAt(event,canvas);
  if(sketches[selected].id==='brush'&&state.down)stamp();
  renderLab();
});
canvas.addEventListener('pointerdown',event => {
  state.pointer=pointerAt(event,canvas); state.down=true;
  if(sketches[selected].id==='brush') {canvas.setPointerCapture(event.pointerId);stamp();}
  renderLab();
});
function releasePointer() {state.down=false;}
canvas.addEventListener('pointerup',releasePointer);
canvas.addEventListener('pointercancel',releasePointer);
canvas.addEventListener('lostpointercapture',releasePointer);
canvas.addEventListener('pointerleave',() => {
  if(!state.down){state.pointer={x:360,y:220};renderLab();}
});
canvas.addEventListener('keydown',event => {
  const moves={ArrowLeft:[-18,0],ArrowRight:[18,0],ArrowUp:[0,-18],ArrowDown:[0,18]};
  if(moves[event.key]) {
    event.preventDefault();
    state.pointer.x=clamp(state.pointer.x+moves[event.key][0],0,720);
    state.pointer.y=clamp(state.pointer.y+moves[event.key][1],0,440);
    renderLab();
  } else if(event.key==='Enter'&&sketches[selected].id==='brush') {
    event.preventDefault();stamp();renderLab();
  }
});
heroCanvas.addEventListener('pointermove',event => {
  const point=pointerAt(event,heroCanvas);
  heroState.pointer={x:point.x,y:point.y*440/520};
  renderHero();
});
heroCanvas.addEventListener('pointerleave',() => {heroState.pointer={x:360,y:220};renderHero();});
$('#sketch-select').addEventListener('change',event => selectSketch(Number(event.target.value)));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>setFilter(button.dataset.filter)));
document.querySelectorAll('[data-path]').forEach(button=>button.addEventListener('click',()=>{
  $('#search').value='';setFilter(button.dataset.path);scrollToSection('#explore');
}));
$('#search').addEventListener('input',filterGallery);
$('#first-lesson').addEventListener('click',()=>selectSketch(0));
$('#pause').addEventListener('click',()=>{paused=!paused;pauseLabels();});
$('#hero-pause').addEventListener('click',()=>{heroPaused=!heroPaused;pauseLabels();});
$('#reset').addEventListener('click',()=>{
  selectSketch(selected);
  if(sketches[selected].id==='brush'){state.stars=[];renderLab();}
  showStatus('설정과 시간을 초기화했습니다.');
});
$('#copy-code').addEventListener('click',async()=>{
  try {
    if(!navigator.clipboard)throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(sketches[selected].draw.toString());
    showStatus('그리기 함수를 복사했습니다. 공통 도구와 입력값 설명도 함께 확인하세요.');
  } catch (_) {
    const range=document.createRange();range.selectNodeContents($('#source-code'));
    const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
    showStatus('코드를 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요.');
  }
});
$('#save-image').addEventListener('click',()=>{
  renderLab();
  try {
    const link=document.createElement('a');
    link.download='orbit-lab-'+sketches[selected].id+'.png';link.href=canvas.toDataURL('image/png');link.click();
    showStatus('현재 장면의 PNG 다운로드를 요청했습니다.');
  } catch (_) {showStatus('이미지를 저장하지 못했습니다. 브라우저의 다운로드 설정을 확인해 주세요.');}
});
$('#quiz').addEventListener('submit',event=>{
  event.preventDefault();
  const answer=$('#quiz input:checked');
  const feedback=$('#quiz-feedback');
  if(!answer){feedback.className='';feedback.textContent='답을 하나 선택해 주세요.';return;}
  const question=sketches[selected].quiz;
  const correct=Number(answer.value)===question[2];
  feedback.className=correct?'correct':'incorrect';
  feedback.textContent=(correct?'정답이에요! ':'다시 생각해 보세요. ')+question[3];
});

$('#helper-code').textContent =
  'const palette = '+JSON.stringify(palette)+';\nconst TAU = Math.PI * 2;\n\n'+
  [seed,dot,star,sky].map(fn=>fn.toString()).join('\n\n')+
  '\n\n// 실행 구조 예시\n// state.time += 프레임 사이 경과 시간(초);\n// 선택한그리기함수(ctx, values, state);\n// requestAnimationFrame(다음프레임);';
buildGallery();
filterGallery();
selectSketch(0);
pauseLabels();
renderHero();
let labVisible=true, heroVisible=true;
if ('IntersectionObserver' in window) {
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.target===canvas)labVisible=entry.isIntersecting;
      if(entry.target===heroCanvas)heroVisible=entry.isIntersecting;
    });
  },{rootMargin:'80px'});
  observer.observe(canvas);observer.observe(heroCanvas);
}
let previous=0;
function frame(now) {
  const dt=previous?Math.min((now-previous)/1000,0.05):0;
  previous=now;
  if(!document.hidden){
    if(!paused&&labVisible){state.time+=dt;renderLab();}
    if(!heroPaused&&heroVisible){heroState.time+=dt;renderHero();}
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
