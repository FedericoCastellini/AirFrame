
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.querySelector('#drone-stage');

if (container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#08090b');

  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );

  camera.position.set(0, 1.1, 7.5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // Illuminazione ambientale morbida.
  scene.add(new THREE.HemisphereLight(
    0xcbd9ff,
    0x101015,
    2.0
  ));

  // Luce principale: effetto studio cinematografico.
  const keyLight = new THREE.DirectionalLight(0xffffff, 4);
  keyLight.position.set(3, 5, 5);
  scene.add(keyLight);

  // Luce fredda laterale per delineare il profilo.
  const rimLight = new THREE.DirectionalLight(0x82baff, 5);
  rimLight.position.set(-5, 2, -3);
  scene.add(rimLight);

  // Riflesso caldo sul lato opposto.
  const warmLight = new THREE.PointLight(0xffd6ad, 18, 12);
  warmLight.position.set(4, 0, -3);
  scene.add(warmLight);

  // Fondo scenografico: alone luminoso discreto.
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshBasicMaterial({
      color: '#161c25',
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    })
  );

  halo.position.set(0, 0, -2.2);
  scene.add(halo);

  const droneGroup = new THREE.Group();
  scene.add(droneGroup);

  let mixer = null;
  let rotorParts = [];
  let modelReady = false;

  const loader = new GLTFLoader();

  loader.load(
    'assets/models/dji-avata-2.glb',

    (gltf) => {
      const model = gltf.scene;

      // Centra il modello e lo adatta alla scena.
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);

      model.position.sub(center);
      model.scale.setScalar(3.1 / maxDimension);

      // Migliora l'aspetto dei materiali.
      model.traverse((object) => {
        if (!object.isMesh) return;

        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material) {
          object.material = object.material.clone();

          if ('envMapIntensity' in object.material) {
            object.material.envMapIntensity = 1.2;
          }

          object.material.needsUpdate = true;
        }

        // Individua eventuali eliche in base ai nomi del modello.
        if (
          /propeller|rotor|elica|blade/i.test(object.name) &&
          object.parent
        ) {
          rotorParts.push(object);
        }
      });

      droneGroup.add(model);

      // Riproduce eventuali animazioni già presenti nel GLB.
      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);

        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }

      modelReady = true;

      // Inquadra automaticamente il drone.
      camera.position.set(0, 0.8, 5.6);
      camera.lookAt(0, 0, 0);
    },

    undefined,

    (error) => {
      console.error('Impossibile caricare il modello 3D:', error);
      container.dataset.error = 'true';
    }
  );

  // Interazione mouse.
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  container.addEventListener('pointermove', (event) => {
    const rect = container.getBoundingClientRect();

    pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    targetY = pointerX * 0.38;
    targetX = pointerY * 0.16;
  });

  container.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
  });

  // Loop di animazione.
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;

    if (mixer) {
      mixer.update(delta);
    }

    if (modelReady) {
      // Movimento sospeso, lento e cinematografico.
      droneGroup.position.y = Math.sin(elapsed * 0.8) * 0.045;

      // Rotazione naturale e risposta al mouse.
      droneGroup.rotation.y +=
        (targetY + Math.sin(elapsed * 0.25) * 0.04 -
          droneGroup.rotation.y) * 0.035;

      droneGroup.rotation.x +=
        (targetX - droneGroup.rotation.x) * 0.035;

      // Animazione eliche.
      // Funziona soltanto se il GLB contiene oggetti separati
      // per le eliche, identificabili dai loro nomi.
      rotorParts.forEach((rotor, index) => {
        rotor.rotation.y += delta * 45 * (index % 2 ? -1 : 1);
      });
    }

    renderer.render(scene, camera);
  }

  animate();

  // Adattamento alla dimensione del contenitore.
  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  });

  resizeObserver.observe(container);

  // Evita lavoro grafico quando la scena è fuori schermo.
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    container.dataset.visible = String(entry.isIntersecting);
  });

  visibilityObserver.observe(container);
}
