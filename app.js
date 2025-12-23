const cameraBtn = document.getElementById('cameraBtn');
const albumBtn = document.getElementById('albumBtn');
const cameraInput = document.getElementById('cameraInput');
const albumInput = document.getElementById('albumInput');

function toPreview(dataUrl) {
  try { sessionStorage.setItem('capturedImage', dataUrl); } catch (e) {}
  location.href = 'preview.html';
}

cameraBtn.addEventListener('click', () => {
  cameraInput.click();
});

albumBtn.addEventListener('click', () => {
  albumInput.click();
});

function handleFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => toPreview(reader.result);
  reader.readAsDataURL(file);
}

cameraInput.addEventListener('change', () => handleFile(cameraInput));
albumInput.addEventListener('change', () => handleFile(albumInput));
