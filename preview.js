const imgEl = document.getElementById('previewImage');
const textEl = document.getElementById('textOverlay');
const saveBtn = document.getElementById('saveBtn');
const modal = document.getElementById('editModal');
const editTextarea = document.getElementById('editTextarea');
const confirmEdit = document.getElementById('confirmEdit');
const cancelEdit = document.getElementById('cancelEdit');

const defaultText = '经度：118.006484\n纬度：24.524759\n坐标系：WGS84坐标系\n地址：福建省厦门市海沧区阳明\n路331号兴旺广场\n时间：2025-08-16 18:22:53\n海拔：19.3米\n备注：陈露梅  下班';

function init() {
  const dataUrl = sessionStorage.getItem('capturedImage');
  if (!dataUrl) { location.href = 'index.html'; return; }
  imgEl.src = dataUrl;
  textEl.value = defaultText;
  textEl.readOnly = true;
  modal.classList.add('hidden');
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
  const SCALE = 1080 / BASE_W; // 3.6，与 1440/400 等比
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
  ctx.font = '11px HarmonyHeiTi-Medium, HarmonyHeiTi, sans-serif';
  const lines = textEl.value.split(/\n/);
  let y = BASE_H - 141 + 11;
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
