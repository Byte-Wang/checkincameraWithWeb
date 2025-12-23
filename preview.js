const imgEl = document.getElementById('previewImage');
const textEl = document.getElementById('textOverlay');
const saveBtn = document.getElementById('saveBtn');
const modal = document.getElementById('editModal');
const editTextarea = document.getElementById('editTextarea');
const confirmEdit = document.getElementById('confirmEdit');
const cancelEdit = document.getElementById('cancelEdit');

const defaultText = '经度：118.006766\n纬度：24.524891\n坐标系：WGS84坐标系\n地址：福建省厦门市海沧区阳\n明路433号兴旺广场\n时间：2025-12-22 13:16:28\n海拔：27.5米\n备注：陈露梅   上班';

function loadImage(url) {
  return new Promise((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.src = url;
  });
}

async function cropToAspect(srcUrl, aspectW = 1260, aspectH = 1680) {
  const img = await loadImage(srcUrl);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const targetRatio = aspectW / aspectH; // 1260/1680 = 3/4
  const sourceRatio = iw / ih;

  let sw, sh, sx, sy;
  if (sourceRatio > targetRatio) {
    // 源图太宽，裁剪宽度
    sh = ih;
    sw = Math.round(ih * targetRatio);
    sx = Math.round((iw - sw) / 2);
    sy = 0;
  } else {
    // 源图太高，裁剪高度
    sw = iw;
    sh = Math.round(iw / targetRatio);
    sx = 0;
    sy = Math.round((ih - sh) / 2);
  }

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas.toDataURL('image/png');
}

async function init() {
  const dataUrl = sessionStorage.getItem('capturedImage');
  if (!dataUrl) { location.href = 'index.html'; return; }
  const cropped = await cropToAspect(dataUrl, 1260, 1680);
  imgEl.src = cropped;
  textEl.value = defaultText;
  textEl.readOnly = true;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function openModal() {
  editTextarea.value = textEl.value;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  editTextarea.focus();
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

textEl.addEventListener('click', openModal);
confirmEdit.addEventListener('click', () => {
  textEl.value = editTextarea.value;
  closeModal();
});
cancelEdit.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

editTextarea.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    confirmEdit.click();
  }
});

async function saveImage() {
  await document.fonts.ready;
  const BASE_W = 300;
  const BASE_H = 400;
  const SCALE = 1260 / BASE_W; // 4.2 与 1680/400 等比
  const OUT_W = Math.round(BASE_W * SCALE);
  const OUT_H = Math.round(BASE_H * SCALE);

  const canvas = document.createElement('canvas');
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(SCALE, SCALE);

  await new Promise(resolve => {
    if (imgEl.complete) resolve(); else imgEl.onload = resolve;
  });

  const iw = imgEl.naturalWidth;
  const ih = imgEl.naturalHeight;
  const sx = BASE_W / iw;
  const sy = BASE_H / ih;
  const s = Math.min(sx, sy);
  const dw = iw * s;
  const dh = ih * s;
  const dx = (BASE_W - dw) / 2;
  const dy = (BASE_H - dh) / 2;
  ctx.drawImage(imgEl, dx, dy, dw, dh);

  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = 1.2 * SCALE;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const cs = getComputedStyle(textEl);
  const fs = parseFloat(cs.fontSize) || 11.2;
  const overlayHeight = parseFloat(cs.height) - 2 || 131.2;
  const lhPx = parseFloat(cs.lineHeight);
  const step = Number.isFinite(lhPx) ? lhPx : fs * 1.36;
  const leftPx = parseFloat(cs.left) + 3;
  const widthPx = parseFloat(cs.width) || (BASE_W - leftPx - 2);
  const letterSpacing = parseFloat(cs.letterSpacing) - 0.1 || 0.4;

  ctx.font = `${fs}px HarmonyHeiTi-Medium, HarmonyHeiTi, sans-serif`;

  function drawWrappedLine(line, x, y, maxW) {
    let curX = x;
    for (const ch of line) {
      const w = ctx.measureText(ch).width + letterSpacing;
      if (curX + w > x + maxW) {
        y += step;
        curX = x;
      }
      ctx.fillText(ch, curX, y);
      curX += w;
    }
    return y;
  }

  let y = BASE_H - overlayHeight + fs;
  const lines = textEl.value.split(/\n/);
  for (const line of lines) {
    y = drawWrappedLine(line, leftPx, y, widthPx);
    y += step;
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
