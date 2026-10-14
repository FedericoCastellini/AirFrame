import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("model-container");

if (!container) {
throw new Error("Contenitore del modello 3D non trovato.");
}

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
35,
container.clientWidth / container.clientHeight,
0.1,
1000
);
camera.position.set(0, 0.8, 6.5);

const renderer = new THREE.WebGLRenderer({
antialias: true,
alpha: true,
powerPreference: "high-performance"
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

// Gruppo di rotazione del drone
const pivot = new THREE.Group();
scene.add(pivot);

let drone = null;
let targetRotationX = 0;
let targetRotationY = -0.45;

const loader = new GLTFLoader();

loader.load(
"./assets/models/dji-avata-2-optimized.glb",

(gltf) => {
drone = gltf.scene;

// Centra e dimensiona il modello
const box = new THREE.Box3().setFromObject(drone);
const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());
const maxDimension = Math.max(size.x, size.y, size.z);

if (!maxDimension) {
  console.error("Il modello 3D non ha dimensioni valide.");
  return;
}

drone.position.sub(center);
drone.scale.setScalar(3.2 / maxDimension);
pivot.add(drone);

camera.lookAt(0, 0, 0);

console.log("DJI Avata 2 caricato correttamente.");

},

undefined,

(error) => {
console.error("Errore durante il caricamento del DJI Avata 2:", error);
}
);

// Movimento interattivo del mouse
container.addEventListener("pointermove", (event) => {
const rect = container.getBoundingClientRect();

if (!rect.width || !rect.height) return;

const x = (event.clientX - rect.left) / rect.width;
const y = (event.clientY - rect.top) / rect.height;

targetRotationY = (x - 0.5) * 1.4 - 0.45;
targetRotationX = (y - 0.5) * 0.5;
});

// Ridimensionamento
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