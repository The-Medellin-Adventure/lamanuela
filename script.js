// ============================================
// CONFIGURACIÓN DE ESCENAS
// ============================================

const scenes = window.APP_DATA.scenes;

// ============================================
// VARIABLES GLOBALES
// ============================================

let scene, camera, renderer, sphere, hotspotObjects = [];
let currentScene = 'barco';
let isVRMode = false;
let currentCarouselIndex = 0;
let currentCarouselMedia = [];
let isSpeaking = false;
let currentUtterance = null;
let currentHotspotVoice = null;
let isModalAudioPlaying = false;
let currentVideoTexture = null;
let currentVideo = null;

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
  const container = document.getElementById('container');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0.1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  createSphere();
  createHotspots();
  setupEventListeners();
  updateAvatarText();

  setTimeout(() => {
    document.getElementById('loading').style.display = 'none';
  }, 1500);

  animate();
}

// ============================================
// CREAR ESFERA 360°
// ============================================

function createSphere() {
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  const sceneData = scenes[currentScene];
  let material;

  // Limpiar video anterior si existe
  if (currentVideo) {
    currentVideo.pause();
    currentVideo = null;
  }

  // Prioridad: Video > Imagen > Color
  if (sceneData.video) {
    const video = document.createElement('video');
    video.src = sceneData.video;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = false;
    video.playsInline = true;

    video.play().catch(() => {
      console.log('Esperando interacción del usuario para reproducir video');
      document.addEventListener(
        'click',
        () => {
          video.play();
        },
        { once: true }
      );
    });

    currentVideo = video;

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    currentVideoTexture = videoTexture;

    material = new THREE.MeshBasicMaterial({ map: videoTexture });
  } else if (sceneData.image) {
    const texture = new THREE.TextureLoader().load(sceneData.image);
    material = new THREE.MeshBasicMaterial({ map: texture });
  } else {
    material = new THREE.MeshBasicMaterial({ color: sceneData.color });
  }

  if (sphere) {
    scene.remove(sphere);
  }

  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
}

// ============================================
// CREAR HOTSPOTS
// ============================================

function createHotspots() {
  hotspotObjects.forEach(obj => scene.remove(obj));
  hotspotObjects = [];

  const sceneData = scenes[currentScene];

  sceneData.hotspots.forEach((hotspot, index) => {
    const geometry = new THREE.SphereGeometry(15, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x4CAF50,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(hotspot.position.x, hotspot.position.y, hotspot.position.z);
    mesh.userData = { hotspot: hotspot, index: index };
    scene.add(mesh);
    hotspotObjects.push(mesh);
  });
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  const container = document.getElementById('container');
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Mouse
  container.addEventListener('mousedown', e => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    checkHotspotClick(e.clientX, e.clientY);
  });

  container.addEventListener('mousemove', e => {
    if (!isDragging || isVRMode) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    camera.rotation.y += deltaX * 0.003;
    camera.rotation.x += deltaY * 0.003;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch
  container.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      checkHotspotClick(e.touches[0].clientX, e.touches[0].clientY);
    }
  });

  container.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1 || isVRMode) return;

    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    camera.rotation.y += deltaX * 0.003;
    camera.rotation.x += deltaY * 0.003;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Botones
  document.getElementById('vrToggle').addEventListener('click', toggleVRMode);
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sceneId = btn.dataset.scene;
      changeScene(sceneId);
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('playAudioBtn').addEventListener('click', playAvatarAudio);
  document.getElementById('muteBtn').addEventListener('click', toggleMute);
  document.getElementById('modalAudioBtn').addEventListener('click', playModalAudio);
  document.getElementById('playPauseBtn').addEventListener('click', toggleVideoPlayPause);
  document.getElementById('muteVideoBtn').addEventListener('click', toggleVideoMute);
  window.addEventListener('resize', onWindowResize);
}

// ============================================
// VR MODE (GIROSCOPIO)
// ============================================

function toggleVRMode() {
  isVRMode = !isVRMode;
  const btn = document.getElementById('vrToggle');
  const indicator = document.getElementById('vrIndicator');

  if (isVRMode) {
    btn.classList.add('active');
    btn.textContent = '📱 VR Activado';
    indicator.classList.add('show');

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  } else {
    btn.classList.remove('active');
    btn.textContent = '📱 Modo VR';
    indicator.classList.remove('show');
    window.removeEventListener('deviceorientation', handleOrientation);
  }
}

function handleOrientation(event) {
  const { alpha, beta, gamma } = event;
  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(beta - 90),
    THREE.MathUtils.degToRad(alpha),
    THREE.MathUtils.degToRad(gamma),
    'YXZ'
  );
  camera.quaternion.setFromEuler(euler);
}

// ============================================
// UTILIDADES VARIAS
// ============================================

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function changeScene(sceneId) {
  currentScene = sceneId;
  createSphere();
  createHotspots();
  updateAvatarText();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function updateAvatarText() {
  const text = scenes[currentScene].avatarText;
  document.getElementById('avatarText').textContent = text;
}

// ============================================
// HOTSPOTS (clic)
// ============================================

function checkHotspotClick(clientX, clientY) {
  const mouse = new THREE.Vector2();
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(hotspotObjects);
  if (intersects.length > 0) {
    const hotspot = intersects[0].object.userData.hotspot;
    openModal(hotspot);
  }
}

// ============================================
// MODAL DE INFORMACIÓN
// ============================================

function openModal(hotspot) {
  const modal = document.getElementById('infoModal');
  document.getElementById('modalTitle').textContent = hotspot.title;
  document.getElementById('modalText').textContent = hotspot.text;
  modal.classList.add('show');

  if (hotspot.media && hotspot.media.length > 0) {
    buildCarousel(hotspot.media);
  } else {
    document.getElementById('carouselContainer').style.display = 'none';
  }

  currentHotspotVoice = hotspot.voiceText;
}

function closeModal() {
  const modal = document.getElementById('infoModal');
  modal.classList.remove('show');
}

function buildCarousel(media) {
  const container = document.getElementById('carouselContainer');
  const main = document.getElementById('carouselMain');
  const indicators = document.getElementById('carouselIndicators');
  main.innerHTML = '';
  indicators.innerHTML = '';
  container.style.display = 'block';

  currentCarouselMedia = media;
  currentCarouselIndex = 0;

  media.forEach((item, index) => {
    const slide = document.createElement(item.type === 'video' ? 'video' : 'img');
    slide.src = item.src;
    slide.className = 'carousel-item' + (index === 0 ? ' active' : '');
    if (item.type === 'video') slide.controls = true;
    main.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
    dot.addEventListener('click', () => showSlide(index));
    indicators.appendChild(dot);
  });
}

function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.carousel-dot');
  slides.forEach(s => (s.className = 'carousel-item'));
  dots.forEach(d => (d.className = 'carousel-dot'));
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  currentCarouselIndex = index;
}

function nextSlide() {
  currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselMedia.length;
  showSlide(currentCarouselIndex);
}

function prevSlide() {
  currentCarouselIndex =
    (currentCarouselIndex - 1 + currentCarouselMedia.length) % currentCarouselMedia.length;
  showSlide(currentCarouselIndex);
}

// ============================================
// AUDIO
// ============================================

function playAvatarAudio() {
  if (isSpeaking) return;
  const text = scenes[currentScene].avatarText;
  speakText(text);
}

function playModalAudio() {
  if (!currentHotspotVoice) return;
  speakText(currentHotspotVoice);
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return alert('Tu navegador no soporta síntesis de voz.');
  isSpeaking = true;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  utter.rate = 1;
  utter.pitch = 1;
  utter.onend = () => {
    isSpeaking = false;
    document.getElementById('avatarChar').classList.remove('talking');
  };
  document.getElementById('avatarChar').classList.add('talking');
  speechSynthesis.speak(utter);
}

function toggleMute() {
  speechSynthesis.cancel();
  isSpeaking = false;
  document.getElementById('avatarChar').classList.remove('talking');
}

// ============================================
// VIDEO CONTROLS
// ============================================

function toggleVideoPlayPause() {
  if (!currentVideo) return;
  if (currentVideo.paused) {
    currentVideo.play();
  } else {
    currentVideo.pause();
  }
}

function toggleVideoMute() {
  if (!currentVideo) return;
  currentVideo.muted = !currentVideo.muted;
}

// ============================================
// INICIO
// ============================================

window.addEventListener('load', init);
