const sketches = [
  {
    title: '점의 궤도', english: 'Motion is a rule.', tag: '01 / MOTION',
    intro: '하나의 점도 위치가 매 프레임 바뀌면 살아 움직입니다. 각도와 반지름으로 궤도를 만들며 움직임을 구성하는 숫자를 관찰해 봅니다.',
    concept: '각도(angle)와 시간(frame)을 이용해 원을 따라 이동하는 점을 만듭니다. p5.js의 draw()가 반복 호출된다고 상상하세요.',
    code: `let angle = 0;\n\nfunction draw() {\n  const x = width / 2 + cos(angle) * radius;\n  const y = height / 2 + sin(angle) * radius;\n  circle(x, y, 18);\n  angle += speed;\n}`,
    controls: [{key:'speed',label:'속도',min:.01,max:.12,step:.01,value:.05},{key:'radius',label:'궤도 반지름',min:25,max:120,step:1,value:78}],
    draw(ctx,v,state){const w=ctx.canvas.width,h=ctx.canvas.height;state.angle+=v.speed;const mouseAngle=Math.atan2(state.mouse.y-h/2,state.mouse.x-w/2);const steer=(mouseAngle-state.angle)*.025;const liveAngle=state.angle+steer*8;const x=w/2+Math.cos(liveAngle)*v.radius,y=h/2+Math.sin(liveAngle)*v.radius;ctx.fillStyle='#ff4f81';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3155f5';ctx.globalAlpha=.22;ctx.beginPath();ctx.arc(w/2,h/2,v.radius,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  },
  {
    title: '마우스 파동', english: 'Touch changes a field.', tag: '02 / INTERACTION',
    intro: '작품은 관객의 움직임을 재료로 삼을 수 있습니다. 캔버스 위를 움직이면 가까운 점들이 커지고 밝아지는 반응장을 만들어 봅니다.',
    concept: '마우스 위치와 점 사이의 거리를 계산합니다. 거리가 가까울수록 크기를 키우면 입력이 시각적 결과로 번역됩니다.',
    code: `function draw() {\n  for (let x = 20; x < width; x += gap) {\n    const distance = dist(mouseX, mouseY, x, y);\n    const size = map(distance, 0, 180, 26, 3);\n    circle(x, y, size);\n  }\n}`,
    controls: [{key:'gap',label:'점 사이 간격',min:18,max:48,step:1,value:30},{key:'energy',label:'반응 에너지',min:40,max:220,step:1,value:130}],
    draw(ctx,v,state){const w=ctx.canvas.width,h=ctx.canvas.height;ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,w,h);for(let y=20;y<h;y+=v.gap){for(let x=20;x<w;x+=v.gap){const d=Math.hypot(state.mouse.x-x,state.mouse.y-y),size=Math.max(3,Math.min(25,26-(d/v.energy)*23));ctx.fillStyle=`hsl(${215+(1-d/v.energy)*120},86%,56%)`;ctx.beginPath();ctx.arc(x,y,size/2,0,Math.PI*2);ctx.fill();}}}
  },
  {
    title: '색의 격자', english: 'Rules make patterns.', tag: '03 / PATTERN',
    intro: '반복문은 패턴을 만드는 좋은 시작점입니다. 행과 열의 순서가 색과 크기에 영향을 주도록 하며 간단한 규칙이 복잡한 장면이 되는 과정을 봅니다.',
    concept: '두 개의 반복문이 x와 y를 훑습니다. 각 위치를 색상값으로 바꾸면 같은 코드가 계속 다른 타일을 만들어냅니다.',
    code: `for (let y = 0; y < rows; y++) {\n  for (let x = 0; x < cols; x++) {\n    const hue = x * 12 + y * 8;\n    fill(hue, 80, 70);\n    square(x * cell, y * cell, cell - 2);\n  }\n}`,
    controls: [{key:'cols',label:'격자 밀도',min:5,max:18,step:1,value:10},{key:'hue',label:'색상 이동',min:0,max:360,step:5,value:210}],
    draw(ctx,v,state){const w=ctx.canvas.width,h=ctx.canvas.height;ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,w,h);const cell=w/v.cols;for(let y=0;y<v.cols;y++){for(let x=0;x<v.cols;x++){const px=x*cell+cell/2,py=y*cell+cell/2,d=Math.hypot(state.mouse.x-px,state.mouse.y-py),wave=Math.sin(d*.065-state.mouse.x*.012)*10*(1-Math.min(d/330,1));const hue=(v.hue+x*12+y*8+state.mouse.x*.18+state.mouse.y*.08)%360;const tile=Math.max(3,cell-3+wave*.22);ctx.fillStyle=`hsl(${hue},86%,${58+Math.max(0,12-d*.035)}%)`;ctx.fillRect(px-tile/2,py-tile/2,tile,tile);}}}
  }
];

const root=document.querySelector('#sketches');
const states=sketches.map(()=>({angle:0,mouse:{x:240,y:140}}));
const canvases=[];

function makePanel(s,i){
  const p=document.createElement('article');
  p.className='sketch-panel'; p.id=`sketch-panel-${i}`; p.setAttribute('role','tabpanel'); p.hidden=i!==0;
  p.innerHTML=`<div class="sketch-info"><p class="kicker">${s.tag}</p><h3>${s.title}<i>${s.english}</i></h3><p>${s.intro}</p><div class="concept"><b>WHAT IS HAPPENING?</b><span>${s.concept}</span></div></div><div class="sketch-workbench"><div class="code-window"><div class="window-bar"><span>SKETCH.JS</span><span>● ● ●</span></div><pre><code>${s.code}</code></pre></div><div class="canvas-window"><div class="window-bar"><span>LIVE OUTPUT</span><span>drag / move / watch</span></div><canvas width="480" height="280" aria-label="${s.title} 인터랙티브 결과"></canvas><p class="canvas-note">캔버스 위에서 마우스를 움직여 보세요.</p></div></div><div class="control-row"></div>`;
  root.append(p);
  const row=p.querySelector('.control-row'),canvas=p.querySelector('canvas');
  canvases[i]={canvas,ctx:canvas.getContext('2d'),panel:p};
  s.controls.forEach(c=>{const l=document.createElement('label');l.innerHTML=`<span>${c.label} <output>${c.value}</output></span><input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}">`;row.append(l);l.querySelector('input').addEventListener('input',()=>l.querySelector('output').value=l.querySelector('input').value);});
  canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();states[i].mouse.x=(e.clientX-r.left)*canvas.width/r.width;states[i].mouse.y=(e.clientY-r.top)*canvas.height/r.height;});
  canvas.addEventListener('pointerleave',()=>{states[i].mouse.x=240;states[i].mouse.y=140;});
}
sketches.forEach(makePanel);

function values(i){const v={};sketches[i].controls.forEach((c,n)=>{v[c.key]=Number(canvases[i].panel.querySelectorAll('input[type=range]')[n].value);});return v;}
function frame(){sketches.forEach((s,i)=>{if(!canvases[i].panel.hidden)s.draw(canvases[i].ctx,values(i),states[i]);});requestAnimationFrame(frame);}
function activate(i){document.querySelectorAll('.sketch-tabs [role=tab]').forEach((t,n)=>{t.setAttribute('aria-selected',n===i);canvases[n].panel.hidden=n!==i;});}
document.querySelectorAll('.sketch-tabs [role=tab]').forEach((t,i)=>{t.addEventListener('click',()=>activate(i));t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();activate((i+1)%3);}if(e.key==='ArrowLeft'){e.preventDefault();activate((i+2)%3);}});});
requestAnimationFrame(frame);
