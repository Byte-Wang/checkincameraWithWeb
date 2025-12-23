const imgEl = document.getElementById('previewImage');
const textEl = document.getElementById('textOverlay');
const saveBtn = document.getElementById('saveBtn');

const defaultText = '经度：118.006484\n纬度：24.524759\n坐标系：WGS84坐标系\n地址：福建省厦门市海沧区阳明\n路331号兴旺广场\n时间：2025-08-16 18:22:53\n海拔：19.3米\n备注：陈露梅  下班';

function init() {
  const dataUrl = sessionStorage.getItem('capturedImage');
  if (!dataUrl) { location.href = 'index.html'; return; }
  imgEl.src = dataUrl;
  textEl.value = defaultText;
}

function toggleTop(focus) {
  if (focus) textEl.classList.add('focus-top');
  else textEl.classList.remove('focus-top');
}

textEl.addEventListener('focus', () => toggleTop(true));
textEl.addEventListener('blur', () => toggleTop(false));

document.addEventListener('click', (e) => {
  if (!textEl.contains(e.target)) textEl.blur();
});

async function saveImage() {
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  await new Promise(resolve => {
    if (imgEl.complete) resolve(); else imgEl.onload = resolve;
  });

  const iw = imgEl.naturalWidth;
  const ih = imgEl.naturalHeight;
  const sx = 300 / iw;
  const sy = 400 / ih;
  const s = Math.min(sx, sy);
  const dw = iw * s;
  const dh = ih * s;
  const dx = (300 - dw) / 2;
  const dy = (400 - dh) / 2;
  ctx.drawImage(imgEl, dx, dy, dw, dh);

  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = 1.2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.font = '11px HarmonyHeiTi-Medium, HarmonyHeiTi, sans-serif';
  const lines = textEl.value.split(/\n/);
  let y = 400 - 141 + 11;
  for (const line of lines) {
    ctx.fillText(line, 3, y);
    y += 11 * 1.2;
  }
  ctx.restore();

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = 'checkin.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

saveBtn.addEventListener('click', saveImage);

init();
