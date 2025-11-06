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
let currentScene = Object.keys(scenes)[0] || 'barco'; // Tomar la primera escena disponible
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

// ============================================
// CONFIGURACIÓN DE AVATAR
// ============================================

function setupAvatar() {
  if (window.APP_DATA?.avatarConfig?.videoUrl) {
    const avatarContainer = document.querySelector('.avatar-container');
    if (avatarContainer) {
      avatarContainer.innerHTML = `
        <video id="avatarVideo" autoplay loop muted playsinline 
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
  
  // Validar que la escena existe
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
    
    // Mostrar controles de video
    document.getElementById('videoControls').style.display = 'flex';
  } else if (sceneData.image) {
    const texture = new THREE.TextureLoader().load(sceneData.image);
    material = new THREE.MeshBasicMaterial({ map: texture });
    document.getElementById('videoControls').style.display = 'none';
  } else {
    material = new THREE.MeshBasicMaterial({ color: sceneData.color || 0x4A90E2 });
    document.getElementById('videoControls').style.display = 'none';
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
    // Crear sprite con icono
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
        
        // Tamaño del icono
        sprite.scale.set(30, 30, 1);
        sprite.position.set(
          hotspot.position.x, 
          hotspot.position.y, 
          hotspot.position.z
        );
        
        sprite.userData = { hotspot: hotspot, index: index };
        
        // Animación de flotación
        sprite.userData.originalY = hotspot.position.y;
        sprite.userData.time = Math.random() * Math.PI * 2;
        
        scene.add(sprite);
        hotspotObjects.push(sprite);
      },
      undefined,
      (error) => {
        console.error(`Error cargando icono ${iconPath}:`, error);
        // Fallback: crear esfera si el icono falla
        createFallbackHotspot(hotspot, index);
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

  // Botones de navegación
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sceneId = btn.dataset.scene;
      if (scenes[sceneId]) {
        changeScene(sceneId);
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else {
        alert(`La escena "${sceneId}" no existe`);
      }
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
  updateAvatarText();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function updateAvatarText() {
  const sceneData = scenes[currentScene];
  if (sceneData && sceneData.avatarText) {
    document.getElementById('avatarText').textContent = sceneData.avatarText;
  }
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

function playAvatarAudio() {
  if (isSpeaking) return;
  const sceneData = scenes[currentScene];
  if (sceneData && sceneData.avatarText) {
    speakText(sceneData.avatarText);
  }
}

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
  
  // Usar configuración de voz colombiana
  const voiceLang = window.APP_DATA?.avatarConfig?.voiceLang || 'es-CO';
  utter.lang = voiceLang;
  utter.rate = 0.95; // Un poco más lento para acento colombiano
  utter.pitch = 1.1; // Tono ligeramente más alto
  
  utter.onend = () => {
    isSpeaking = false;
    if (avatarVideoElement) {
      avatarVideoElement.style.filter = 'none';
    } else {
      const avatarChar = document.getElementById('avatarChar');
      if (avatarChar) avatarChar.classList.remove('talking');
    }
  };
  
  if (avatarVideoElement) {
    avatarVideoElement.style.filter = 'brightness(1.3) saturate(1.5)';
  } else {
    const avatarChar = document.getElementById('avatarChar');
    if (avatarChar) avatarChar.classList.add('talking');
  }
  
  speechSynthesis.speak(utter);
}

function toggleMute() {
  speechSynthesis.cancel();
  isSpeaking = false;
  if (avatarVideoElement) {
    avatarVideoElement.style.filter = 'none';
  } else {
    const avatarChar = document.getElementById('avatarChar');
    if (avatarChar) avatarChar.classList.remove('talking');
  }
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
// ANIMACIÓN DE HOTSPOTS
// ============================================

function animateHotspots() {
  hotspotObjects.forEach(obj => {
    if (obj.userData.time !== undefined) {
      obj.userData.time += 0.01;
      obj.position.y = obj.userData.originalY + Math.sin(obj.userData.time) * 5;
      
      // Rotación suave hacia la cámara
      obj.quaternion.copy(camera.quaternion);
    }
  });
}

// ============================================
// INICIO
// ============================================

window.addEventListener('load', init);
