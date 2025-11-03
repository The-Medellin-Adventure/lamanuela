<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tour Virtual 360° VR - Finca & Represa</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            background: #000;
        }

        #container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }

        /* Avatar Panel */
        .avatar-panel {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 280px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 100;
            transition: all 0.3s;
        }

        .avatar-container {
            width: 100%;
            height: 150px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            position: relative;
            overflow: hidden;
        }

        .avatar-character {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            animation: float 3s ease-in-out infinite;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .avatar-character.talking {
            animation: float 3s ease-in-out infinite, pulse 0.5s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .avatar-text {
            color: #333;
            font-size: 14px;
            line-height: 1.6;
            max-height: 100px;
            overflow-y: auto;
            margin-bottom: 10px;
        }

        .audio-visualizer {
            display: flex;
            align-items: center;
            gap: 3px;
            height: 30px;
            justify-content: center;
            margin-top: 10px;
        }

        .audio-bar {
            width: 4px;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 2px;
            transition: height 0.1s;
        }

        .avatar-controls {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .avatar-btn {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 8px;
            background: #667eea;
            color: white;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }

        .avatar-btn:hover {
            background: #764ba2;
            transform: translateY(-2px);
        }

        .avatar-btn.muted {
            background: #999;
        }

        /* Header */
        .header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        .logo {
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .vr-mode-btn {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }

        .vr-mode-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .vr-mode-btn.active {
            background: #4CAF50;
            border-color: #4CAF50;
        }

        /* Navigation */
        .navigation {
            position: absolute;
            bottom: 20px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 100;
        }

        .nav-btn {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 15px 25px;
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            cursor: pointer;
            font-weight: 600;
            color: #333;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .nav-btn:hover {
            background: white;
            transform: translateX(5px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .nav-btn.active {
            background: #4CAF50;
            color: white;
            border-color: #4CAF50;
        }

        /* Video Controls */
        .video-controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            align-items: center;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            padding: 15px 20px;
            border-radius: 50px;
            z-index: 100;
        }

        .video-control-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }

        .video-control-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }

        .video-time {
            color: white;
            font-size: 14px;
            font-weight: 600;
            min-width: 100px;
            text-align: center;
        }

        /* Info Modal */
        .info-modal {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: white;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            z-index: 200;
            transition: all 0.3s;
        }

        .info-modal.show {
            transform: translate(-50%, -50%) scale(1);
        }

        .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            font-size: 22px;
            font-weight: bold;
        }

        .modal-audio-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
            margin-right: 10px;
        }

        .modal-audio-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .modal-audio-btn.playing {
            background: #4CAF50;
            border-color: #4CAF50;
        }

        .close-modal {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 24px;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }

        .close-modal:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }

        .modal-content {
            padding: 20px;
            max-height: 60vh;
            overflow-y: auto;
        }

        .modal-text {
            color: #666;
            line-height: 1.8;
            margin-bottom: 20px;
        }

        /* Carousel */
        .carousel-container {
            position: relative;
            width: 100%;
            margin-top: 20px;
        }

        .carousel-main {
            width: 100%;
            height: 300px;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
            background: #000;
        }

        .carousel-item {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.5s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .carousel-item.active {
            opacity: 1;
        }

        .carousel-item img, .carousel-item video {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .carousel-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
        }

        .carousel-btn {
            background: #667eea;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }

        .carousel-btn:hover {
            background: #764ba2;
            transform: scale(1.1);
        }

        .carousel-indicators {
            display: flex;
            gap: 8px;
        }

        .carousel-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ddd;
            cursor: pointer;
            transition: all 0.3s;
        }

        .carousel-dot.active {
            background: #667eea;
            width: 30px;
            border-radius: 5px;
        }

        /* Loading */
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            text-align: center;
            z-index: 300;
        }

        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* VR Mode Indicator */
        .vr-indicator {
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 100;
            display: none;
        }

        .vr-indicator.show {
            display: block;
            animation: slideDown 0.5s;
        }

        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .avatar-panel {
                width: 250px;
                bottom: 10px;
                right: 10px;
                padding: 15px;
            }

            .navigation {
                left: 10px;
                bottom: 10px;
            }

            .nav-btn {
                padding: 12px 20px;
                font-size: 14px;
            }

            .header {
                padding: 15px 20px;
            }

            .logo {
                font-size: 18px;
            }

            .info-modal {
                width: 95%;
            }

            .modal-title {
                font-size: 18px;
            }
        }

        @media (max-width: 480px) {
            .avatar-panel {
                width: calc(100% - 20px);
                bottom: 10px;
                right: 10px;
                left: 10px;
            }

            .navigation {
                flex-direction: row;
                left: 10px;
                right: 10px;
                bottom: auto;
                top: 70px;
                justify-content: center;
            }

            .nav-btn {
                flex: 1;
                padding: 10px;
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div id="container"></div>

    <div class="header">
        <div class="logo">🌿 Finca & Represa Virtual Tour</div>
        <button class="vr-mode-btn" id="vrToggle">📱 Modo VR</button>
    </div>

    <div class="vr-indicator" id="vrIndicator">
        📱 Modo VR Activado - Mueve tu dispositivo
    </div>

    <div class="navigation">
        <button class="nav-btn active" data-scene="barco">⛵ Paseo en Barco</button>
        <button class="nav-btn" data-scene="entrada">🚪 Entrada</button>
    </div>

    <!-- Controles de Video 360° -->
    <div class="video-controls" id="videoControls" style="display: none;">
        <button class="video-control-btn" id="playPauseBtn">⏸️</button>
        <button class="video-control-btn" id="muteVideoBtn">🔊</button>
        <div class="video-time" id="videoTime">0:00 / 0:00</div>
    </div>

    <div class="avatar-panel">
        <div class="avatar-container">
            <div class="avatar-character" id="avatarChar">👨‍🌾</div>
        </div>
        <div class="avatar-text" id="avatarText">
            ¡Bienvenido a nuestro tour virtual! Soy tu guía. Haz clic en los puntos verdes para explorar.
        </div>
        <div class="audio-visualizer" id="audioVisualizer"></div>
        <div class="avatar-controls">
            <button class="avatar-btn" id="playAudioBtn">▶️ Escuchar</button>
            <button class="avatar-btn" id="muteBtn">🔊</button>
        </div>
    </div>

    <div class="info-modal" id="infoModal">
        <div class="modal-header">
            <div class="modal-title" id="modalTitle"></div>
            <div>
                <button class="modal-audio-btn" id="modalAudioBtn">🔊 Escuchar</button>
                <button class="close-modal" onclick="closeModal()">×</button>
            </div>
        </div>
        <div class="modal-content">
            <div class="modal-text" id="modalText"></div>
            <div class="carousel-container" id="carouselContainer" style="display: none;">
                <div class="carousel-main" id="carouselMain"></div>
                <div class="carousel-controls">
                    <button class="carousel-btn" onclick="prevSlide()">◀</button>
                    <div class="carousel-indicators" id="carouselIndicators"></div>
                    <button class="carousel-btn" onclick="nextSlide()">▶</button>
                </div>
            </div>
        </div>
    </div>

    <div class="loading" id="loading">
        <div class="spinner"></div>
        <div>Cargando experiencia 360°...</div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // ============================================
        // CONFIGURACIÓN DE ESCENAS
        // ============================================

        const scenes = {
            barco: {
                name: 'Paseo en Barco',
                // OPCIÓN 1: Foto 360° estática
                image: null, 
                video: 'videos/escena1.mp4',                 color: 0x4A90E2,
                // VISTA INICIAL: Ajusta estos valores para cambiar hacia dónde mira la cámara al inicio
                // rotation.y = girar izquierda/derecha (valores: -3.14 a 3.14)
                // rotation.x = girar arriba/abajo (valores: -1.5 a 1.5)
                // rotation.z = inclinar (valores: -3.14 a 3.14, normalmente se deja en 0)
                initialRotation: { x: 0, y: 0, z: 0 },
                avatarText: 'Bienvenidos al paseo en barco por nuestra hermosa represa. Aquí podrás disfrutar de paisajes únicos y la tranquilidad del agua.',
                hotspots: [
                    {
                        position: { x: 200, y: 0, z: -300 },
                        icon: '🌊',
                        title: 'Vista de la Represa',
                        text: 'Esta represa tiene más de 50 años de historia. Es hogar de diversas especies de aves acuáticas y peces.',
                        voiceText: 'Mirá, esta represa tiene más de cincuenta años de historia, parce. Acá viven un montón de aves acuáticas y peces. Es un lugar súper tranquilo, ¿viste?',
                        media: [
                            { type: 'image', src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800' },
                            { type: 'image', src: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800' },
                            { type: 'image', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' }
                        ]
                    },
                    {
                        position: { x: -250, y: 50, z: 200 },
                        icon: '🦜',
                        title: 'Fauna Local',
                        text: 'En esta zona puedes observar garzas, patos silvestres y ocasionalmente águilas pescadoras.',
                        voiceText: 'Uy, hermano, en esta zona podés ver garzas, patos silvestres y a veces hasta águilas pescadoras. Es un espectáculo bacano cuando vienen por la mañana.',
                        media: [
                            { type: 'image', src: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800' },
                            { type: 'image', src: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800' }
                        ]
                    }
                ]
            },
            entrada: {
                name: 'Entrada',
                // OPCIÓN 1: Foto 360° estática
                image: null, // Ejemplo: 'fotos/entrada-360.jpg'
                // OPCIÓN 2: Video 360° (si usas video, deja image en null)
                video: null, // Ejemplo: 'videos/entrada-360.mp4'
                // OPCIÓN 3: Color sólido (si image y video están en null)
                color: 0x50C878,
                // VISTA INICIAL: Ajusta estos valores para cambiar hacia dónde mira la cámara al inicio
                initialRotation: { x: 0, y: 0, z: 0 },
                avatarText: 'Esta es la entrada principal de nuestra finca recreacional. Desde aquí comienza tu aventura en la naturaleza.',
                hotspots: [
                    {
                        position: { x: 150, y: -50, z: -350 },
                        icon: '🏡',
                        title: 'Casa Principal',
                        text: 'Nuestra casa principal cuenta con 5 habitaciones, sala de estar amplia y todas las comodidades modernas en medio de la naturaleza.',
                        voiceText: 'Esta es la casa principal, parce. Tiene cinco habitaciones bien amplias, sala de estar grande y todas las comodidades que necesitás. Todo rodeado de pura naturaleza, ¿sí ve?',
                        media: [
                            { type: 'image', src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' },
                            { type: 'image', src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800' },
                            { type: 'image', src: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800' }
                        ]
                    },
                    {
                        position: { x: -200, y: 30, z: 250 },
                        icon: '🐴',
                        title: 'Caballerizas',
                        text: 'Contamos con 8 caballos de diferentes razas. Ofrecemos paseos guiados por los senderos de la finca.',
                        voiceText: 'Acá tenemos ocho caballos, hermano, de diferentes razas. Hacemos paseos guiados por todos los caminos de la finca. Es una experiencia súper chévere.',
                        media: [
                            { type: 'image', src: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800' },
                            { type: 'image', src: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800' }
                        ]
                    },
                    {
                        position: { x: 0, y: 100, z: -400 },
                        icon: '🌳',
                        title: 'Senderos Naturales',
                        text: 'Más de 3 kilómetros de senderos ecológicos que conectan diferentes puntos de interés en la finca.',
                        voiceText: 'Mirá, tenemos más de tres kilómetros de senderos ecológicos que conectan todos los sitios bacanos de la finca. Podés caminar tranquilo y disfrutar del paisaje.',
                        media: [
                            { type: 'image', src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800' },
                            { type: 'image', src: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800' },
                            { type: 'image', src: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800' }
                        ]
                    }
                ]
            }
        };

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
                75,
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
                // CARGAR VIDEO 360°
                const video = document.createElement('video');
                video.src = sceneData.video;
                video.crossOrigin = 'anonymous';
                video.loop = true;
                video.muted = false; // Puedes cambiar a true si quieres sin audio
                video.playsInline = true;
                
                // Reproducir el video
                video.play().catch(e => {
                    console.log('Esperando interacción del usuario para reproducir video');
                    // En algunos navegadores necesitas que el usuario interactúe primero
                    document.addEventListener('click', () => {
                        video.play();
                    }, { once: true });
                });

                currentVideo = video;
                
                const videoTexture = new THREE.VideoTexture(video);
                videoTexture.minFilter = THREE.LinearFilter;
                videoTexture.magFilter = THREE.LinearFilter;
                currentVideoTexture = videoTexture;
                
                material = new THREE.MeshBasicMaterial({ map: videoTexture });
                
            } else if (sceneData.image) {
                // CARGAR IMAGEN 360°
                const texture = new THREE.TextureLoader().load(sceneData.image);
                material = new THREE.MeshBasicMaterial({ map: texture });
            } else {
                // COLOR SÓLIDO
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

            // Mouse events
            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
                checkHotspotClick(e.clientX, e.clientY);
            });

            container.addEventListener('mousemove', (e) => {
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

            // Touch events
            container.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    isDragging = true;
                    const touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    previousMousePosition = touchStart;
                    checkHotspotClick(e.touches[0].clientX, e.touches[0].clientY);
                }
            });

            container.addEventListener('touchmove', (e) => {
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

            // VR Mode Toggle
            document.getElementById('vrToggle').addEventListener('click', toggleVRMode);

            // Navigation buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const sceneId = btn.dataset.scene;
                    changeScene(sceneId);

                    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });

            // Avatar controls
            document.getElementById('playAudioBtn').addEventListener('click', playAvatarAudio);
            document.getElementById('muteBtn').addEventListener('click', toggleMute);

            // Modal audio button
            document.getElementById('modalAudioBtn').addEventListener('click', playModalAudio);

            // Video controls
            document.getElementById('playPauseBtn').addEventListener('click', toggleVideoPlayPause);
            document.getElementById('muteVideoBtn').addEventListener('click', toggleVideoMute);

            // Window resize
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