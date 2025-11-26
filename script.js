// ============================================
// CONFIGURACIÓN DE ESCENAS
// ============================================

const scenes = window.APP_DATA?.scenes || {};

// Verificar que hay escenas disponibles
if (Object.keys(scenes).length === 0) {
  console.error('No hay escenas configuradas en APP_DATA');
  alert('Error: No se encontraron escenas. Por favor configura las escenas en data.js');
}

// ============================================
// VARIABLES GLOBALES
// ============================================

let scene, camera, renderer, sphere, hotspotObjects = [];
let currentScene = Object.keys(scenes)[0] || 'barco';
let isVRMode = false;
let currentCarouselIndex = 0;
let currentCarouselMedia = [];
let isSpeaking = false;
let currentUtterance = null;
let currentHotspotVoice = null;
let isModalAudioPlaying = false;
let currentVideoTexture = null;
let currentVideo = null;
let avatarVideoElement = null;
let isAvatarVideoPaused = false;

// ============================================
// CONFIGURACIÓN DE AVATAR
// ============================================

function setupAvatar() {
  if (window.APP_DATA?.avatarConfig?.videoUrl) {
    const avatarContainer = document.querySelector('.avatar-video-container');
    if (avatarContainer) {
      avatarContainer.innerHTML = `
        <video id="avatarVideo" loop playsinline 
               style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">
          <source src="${window.APP_DATA.avatarConfig.videoUrl}" type="video/mp4">
        </video>
      `;
      avatarVideoElement = document.getElementById('avatarVideo');
    }
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
  const container = document.getElementById('container');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0.1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  setupAvatar();
  createSphere();
  createHotspots();
  setupEventListeners();

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
  
  if (!sceneData) {
    console.error(`Escena "${currentScene}" no encontrada`);
    alert(`Error: La escena "${currentScene}" no existe. Verifica tu configuración.`);
    return;
  }

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
    video.autoplay = true;

    // Intentar reproducir automáticamente
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
    material = new THREE.MeshBasicMaterial({ color: sceneData.color || 0x4A90E2 });
  }

  if (sphere) {
    scene.remove(sphere);
  }

  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
}

// ============================================
// CREAR HOTSPOTS CON ICONOS
// ============================================

function createHotspots() {
  hotspotObjects.forEach(obj => scene.remove(obj));
  hotspotObjects = [];

  const sceneData = scenes[currentScene];
  
  if (!sceneData || !sceneData.hotspots) {
    console.warn(`No hay hotspots para la escena "${currentScene}"`);
    return;
  }

  sceneData.hotspots.forEach((hotspot, index) => {
    const iconPath = hotspot.icon || 'icon/info.png';
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
      iconPath,
      (texture) => {
        const spriteMaterial = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true,
          opacity: 0.9
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        sprite.scale.set(30, 30, 1);
        sprite.position.set(
          hotspot.position.x, 
          hotspot.position.y, 
          hotspot.position.z
        );
        
        sprite.userData = { hotspot: hotspot, index: index };
        sprite.userData.originalY = hotspot.position.y;
        sprite.userData.time = Math.random() * Math.PI * 2;
        
        scene.add(sprite);
        hotspotObjects.push(sprite);
      },
      undefined,
      (error) => {
        console.error(`Error cargando icono ${iconPath}:`, error);
      }
    );
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

  // Menú de navegación
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }
  
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const sceneId = item.dataset.scene;
      if (scenes[sceneId]) {
        changeScene(sceneId);
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        toggleMenu(); // Cerrar menú después de seleccionar
      }
    });
  });

  // Controles de avatar video
  const playAvatarBtn = document.getElementById('playAvatarBtn');
  const muteAvatarBtn = document.getElementById('muteAvatarBtn');
  const closeAvatarBtn = document.getElementById('closeAvatarBtn');
  const avatarFloatingBtn = document.getElementById('avatarFloatingBtn');
  const modalAudioBtn = document.getElementById('modalAudioBtn');
  
  if (playAvatarBtn) playAvatarBtn.addEventListener('click', toggleAvatarVideo);
  if (muteAvatarBtn) muteAvatarBtn.addEventListener('click', toggleAvatarMute);
  if (closeAvatarBtn) closeAvatarBtn.addEventListener('click', minimizeAvatarPanel);
  if (avatarFloatingBtn) avatarFloatingBtn.addEventListener('click', restoreAvatarPanel);
  if (modalAudioBtn) modalAudioBtn.addEventListener('click', playModalAudio);
  window.addEventListener('resize', onWindowResize);
}

// ============================================
// FUNCIONES DE MENÚ
// ============================================

function toggleMenu() {
  const menu = document.getElementById('sceneMenu');
  const isOpen = menu.classList.contains('open');
  
  if (isOpen) {
    menu.classList.remove('open');
  } else {
    menu.classList.add('open');
  }
}

// ============================================
// FUNCIONES DE AVATAR VIDEO
// ============================================

function toggleAvatarVideo() {
  if (!avatarVideoElement) return;
  
  const btn = document.getElementById('playAvatarBtn');
  
  if (avatarVideoElement.paused) {
    avatarVideoElement.play();
    btn.textContent = '⏸️';
    isAvatarVideoPaused = false;
  } else {
    avatarVideoElement.pause();
    btn.textContent = '▶️';
    isAvatarVideoPaused = true;
  }
}

function toggleAvatarMute() {
  if (!avatarVideoElement) return;
  
  const btn = document.getElementById('muteAvatarBtn');
  avatarVideoElement.muted = !avatarVideoElement.muted;
  btn.textContent = avatarVideoElement.muted ? '🔇' : '🔊';
}

function minimizeAvatarPanel() {
  if (avatarVideoElement && !avatarVideoElement.paused) {
    avatarVideoElement.pause();
    isAvatarVideoPaused = true;
  }
  
  document.getElementById('avatarPanel').style.display = 'none';
  document.getElementById('avatarFloatingBtn').style.display = 'flex';
}

function restoreAvatarPanel() {
  document.getElementById('avatarPanel').style.display = 'block';
  document.getElementById('avatarFloatingBtn').style.display = 'none';
  
  if (avatarVideoElement && isAvatarVideoPaused) {
    avatarVideoElement.play();
    document.getElementById('playAvatarBtn').textContent = '⏸️';
    isAvatarVideoPaused = false;
  }
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
  if (!scenes[sceneId]) {
    console.error(`Escena "${sceneId}" no encontrada`);
    return;
  }
  currentScene = sceneId;
  createSphere();
  createHotspots();
}

function animate() {
  requestAnimationFrame(animate);
  animateHotspots();
  renderer.render(scene, camera);
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
// AUDIO CON ACENTO COLOMBIANO
// ============================================

function playModalAudio() {
  if (!currentHotspotVoice) return;
  speakText(currentHotspotVoice);
}

function speakText(text) {
  if (!('speechSynthesis' in window)) {
    return alert('Tu navegador no soporta síntesis de voz.');
  }
  
  isSpeaking = true;
  const utter = new SpeechSynthesisUtterance(text);
  
  const voiceLang = window.APP_DATA?.avatarConfig?.voiceLang || 'es-CO';
  utter.lang = voiceLang;
  utter.rate = 0.95;
  utter.pitch = 1.1;
  
  utter.onend = () => {
    isSpeaking = false;
  };
  
  speechSynthesis.speak(utter);
}

// ============================================
// ANIMACIÓN DE HOTSPOTS
// ============================================

function animateHotspots() {
  hotspotObjects.forEach(obj => {
    if (obj.userData.time !== undefined) {
      obj.userData.time += 0.01;
      obj.position.y = obj.userData.originalY + Math.sin(obj.userData.time) * 5;
      obj.quaternion.copy(camera.quaternion);
    }
  });
}

// ============================================
// INICIO
// ============================================

window.addEventListener('load', init);
