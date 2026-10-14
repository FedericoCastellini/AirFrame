import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("model-container");
const status = document.getElementById("status");
const modelStatus = document.getElementById("model-status");

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 1.2, 7);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// Illuminazione cinematografica
scene.add(new THREE.HemisphereLight(0xffffff, 0x303746, 2));

const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x8baaff, 2.5);
rimLight.position.set(-5, 3, -4);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xc7b89b, 1.5);
fillLight.position.set(0, -2, 4);
scene.add(fillLight);

// Gruppo per controllare la rotazione del drone
const pivot = new THREE.Group();
scene.add(pivot);

let drone = null;
let targetRotationX = 0;
let targetRotationY = -0.45;

const loader = new GLTFLoader();

loader.load(
  "./assets/models/dji-avata-2.glb",

  (gltf) => {
    drone = gltf.scene;

    // Centra il modello e lo adatta alla scena
    const box = new THREE.Box3().setFromObject(drone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    drone.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z);
    if (!maxDimension) {
      throw new Error("Il modello 3D non ha dimensioni valide.");
    }

    drone.scale.setScalar(3.2 / maxDimension);
    pivot.add(drone);

    // Inquadratura iniziale
    camera.position.set(0, 0.8, 6.5);
    camera.lookAt(0, 0, 0);

    status.style.display = "none";
    modelStatus.textContent = "MODELLO 3D CARICATO";
    modelStatus.style.color = "#8bc9a1";

    console.log("DJI Avata 2 caricato correttamente.", size);
  },

  (progress) => {
    if (progress.total > 0) {
      const percent = Math.round(
        (progress.loaded / progress.total) * 100
      );
      status.textContent = `CARICAMENTO MODELLO ${percent}%`;
    }
  },

  (error) => {
    console.error("Errore caricamento DJI Avata 2:", error);
    status.textContent =
      "ERRORE DI CARICAMENTO — CONTROLLA IL FILE GLB";
    modelStatus.textContent = "MODELLO NON DISPONIBILE";
    modelStatus.style.color = "#e17d7d";
  }
);

// Movimento del mouse
container.addEventListener("pointermove", (event) => {
  const rect = container.getBoundingClientRect();

  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  targetRotationY = (x - 0.5) * 1.4 - 0.45;
  targetRotationX = (y - 0.5) * 0.5;
});

// Ridimensionamento della scena
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);

// Animazione
function animate() {
  requestAnimationFrame(animate);

  if (drone) {
    pivot.rotation.y += (targetRotationY - pivot.rotation.y) * 0.035;
    pivot.rotation.x += (targetRotationX - pivot.rotation.x) * 0.035;
    pivot.position.y = Math.sin(performance.now() * 0.0008) * 0.06;
  }

  renderer.render(scene, camera);
}

animate();