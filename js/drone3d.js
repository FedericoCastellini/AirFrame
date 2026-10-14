
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.querySelector('#model-container');
const status = document.querySelector('#status');
const statusDot = document.querySelector('#status-dot');
const loaderElement = document.querySelector('#loader');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 1000);
camera.position.set(0, 0.5, 5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

container.appendChild(renderer.domElement);

// Illuminazione ambientale.
scene.add(new THREE.HemisphereLight(0xe4edff, 0x17131a, 2.1));

// Key light: luce principale morbida.
const keyLight = new THREE.DirectionalLight(0xfff2df, 4);
keyLight.position.set(3, 5, 5);
scene.add(keyLight);

// Rim light: profilo freddo del drone.
const rimLight = new THREE.DirectionalLight(0x83b9ff, 5);
rimLight.position.set(-5, 2, -4);
scene.add(rimLight);

// Fill light laterale.
const fillLight = new THREE.PointLight(0xffd8b0, 35, 15);
fillLight.position.set(3, -1, 3);
scene.add(fillLight);

// Luce dall'alto.
const topLight = new THREE.SpotLight(
  0xffffff,
  65,
  20,
  Math.PI / 5,
  0.7,
  1.5
);

topLight.position.set(0, 6, 2);
topLight.target.position.set(0, 0, 0);
scene.add(topLight, topLight.target);

const dronePivot = new THREE.Group();
scene.add(dronePivot);

let drone = null;
let mixer = null;
let rotors = [];
let modelScale = 1;

let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

const clock = new THREE.Clock();

const loader = new GLTFLoader();

status.textContent = 'CARICAMENTO MODELLO';

loader.load(
  './assets/models/dji-avata-2.glb',

  (gltf) => {
    drone = gltf.scene;

    // Calcola le dimensioni del modello.
    const bounds = new THREE.Box3().setFromObject(drone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);

    if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
      throw new Error('Il modello non ha dimensioni valide.');
    }

    // Porta il modello a una dimensione standard.
    modelScale = 2.8 / maxDimension;
    drone.scale.setScalar(modelScale);

    // Centra il modello dopo la scalatura.
    drone.position.set(
      -center.x * modelScale,
      -center.y * modelScale,
      -center.z * modelScale
    );

    drone.traverse((object) => {
      if (!object.isMesh) return;

      object.castShadow = true;
      object.receiveShadow = true;

      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        for (const material of materials) {
          // Mantiene i materiali originali del GLB.
          material.needsUpdate = true;
        }
      }

      // Cerca oggetti che potrebbero essere eliche.
      if (/prop|rotor|elica|blade|hélice/i.test(object.name)) {
        rotors.push(object);
      }
    });

    dronePivot.add(drone);

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(drone);

      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }

    // Inquadra il modello usando le sue dimensioni.
    const sphere = new THREE.Box3()
      .setFromObject(drone)
      .getBoundingSphere(new THREE.Sphere());

    const radius = Math.max(sphere.radius, 0.1);
    const fov = THREE.MathUtils.degToRad(camera.fov);

    camera.position.set(
      0,
      radius * 0.15,
      Math.max(radius / Math.sin(fov / 2) * 0.82, 2.5)
    );

    camera.near = Math.max(radius / 1000, 0.01);
    camera.far = Math.max(radius * 100, 100);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    loaderElement.style.display = 'none';

    status.textContent = 'MODELLO 3D ONLINE';
    statusDot.classList.add('ready');

    console.info('Modello caricato:', gltf);
    console.info(
      'Possibili eliche trovate:',
      rotors.map((rotor) => rotor.name)
    );
  },

  (progress) => {
    if (progress.total > 0) {
      const percentage = Math.round(
        (progress.loaded / progress.total) * 100
      );

      status.textContent = `CARICAMENTO ${percentage}%`;
    }
  },

  (error) => {
    console.error('Errore caricamento GLB:', error);

    status.textContent = 'ERRORE DI CARICAMENTO';
    statusDot.classList.add('error');

    loaderElement.classList.add('error');
    loaderElement.querySelector('p').textContent =
      'CONTROLLA IL FILE GLB E IL PERCORSO';
  }
);

// Il mouse controlla delicatamente la prospettiva.
container.addEventListener('pointermove', (event) => {
  const rect = container.getBoundingClientRect();

  pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;

  targetY = pointerX * 0.4;
  targetX = pointerY * 0.18;
});

container.addEventListener('pointerleave', () => {
  targetX = 0;
  targetY = 0;
});

// Dimensioni responsive.
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (!width || !height) return;

  renderer.setSize(width, height, false);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(container);
resize();

// Animazione principale.
let frameId = 0;

function animate() {
  frameId = requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  if (mixer) mixer.update(delta);

  if (drone) {
    // Galleggiamento leggero.
    dronePivot.position.y = Math.sin(elapsed * 0.8) * 0.035;

    // Rotazione cinematografica lenta.
    const idleRotation = Math.sin(elapsed * 0.25) * 0.045;

    dronePivot.rotation.y +=
      (targetY + idleRotation - dronePivot.rotation.y) * 0.035;

    dronePivot.rotation.x +=
      (targetX - dronePivot.rotation.x) * 0.035;

    // Rotazione di prova delle eliche individuate.
    // L'asse dovrà essere verificato sul modello reale.
    rotors.forEach((rotor, index) => {
      rotor.rotation.y += delta * 45 * (index % 2 ? -1 : 1);
    });
  }

  renderer.render(scene, camera);
}

animate();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(frameId);
  } else {
    clock.getDelta();
    animate();
  }
});
