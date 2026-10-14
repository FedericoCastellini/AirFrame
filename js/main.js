import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

/* =========================================
AIRFRAME — MAIN JS
========================================= */

const container = document.getElementById("model-container");
const canvas = document.getElementById("drone-canvas");

if (container && canvas) {
initializeDrone();
} else {
console.error("AIRFRAME: contenitore o canvas 3D non trovato.");
}

function initializeDrone() {
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    35,
    1,
    0.1,
    100
);

camera.position.set(0, 0.35, 6.5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setClearColor(0x000000, 0);

/* LIGHTING */

const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x303746,
    2
);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(
    0xffffff,
    3
);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(
    0x8daeff,
    2.5
);
rimLight.position.set(-5, 3, -4);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(
    0xd8d0c2,
    1.5
);
fillLight.position.set(0, -2, 4);
scene.add(fillLight);

const topLight = new THREE.DirectionalLight(
    0xffffff,
    1.2
);
topLight.position.set(0, 7, 0);
scene.add(topLight);

/* MODEL */

const pivot = new THREE.Group();
scene.add(pivot);

let drone = null;
let modelLoaded = false;

let targetRotationX = 0;
let targetRotationY = -0.45;

let currentRotationX = 0;
let currentRotationY = -0.45;

const loader = new GLTFLoader();

loader.setMeshoptDecoder(MeshoptDecoder);

loader.load(
    "./assets/models/dji-avata-2-ultra.glb",

    (gltf) => {
        drone = gltf.scene;

        const bounds = new THREE.Box3().setFromObject(drone);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());

        const maxDimension = Math.max(
            size.x,
            size.y,
            size.z
        );

        if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
            console.error(
                "AIRFRAME: dimensioni del modello non valide."
            );
            drone = null;
            return;
        }


        drone.position.sub(center);
        drone.scale.setScalar(2.5 / maxDimension);

        // Allineamento visivo con il cerchio
        drone.position.x += 0.20;

        pivot.add(drone);

        pivot.rotation.set(0, -0.45, 0);

        modelLoaded = true;

        console.info("AIRFRAME: modello 3D caricato correttamente.");
    },

    undefined,

    (error) => {
        console.error(
            "AIRFRAME: errore durante il caricamento del modello 3D.",
            error
        );
    }
);

/* INTERACTION */

let isDragging = false;
let lastPointerX = 0;
let lastPointerY = 0;

canvas.style.cursor = "grab";

canvas.addEventListener("pointerdown", (event) => {
    isDragging = true;

    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    canvas.style.cursor = "grabbing";

    try {
        canvas.setPointerCapture(event.pointerId);
    } catch {
        // Pointer capture non disponibile.
    }
});

canvas.addEventListener("pointermove", (event) => {
    const rect = container.getBoundingClientRect();

    if (isDragging) {
        const deltaX = event.clientX - lastPointerX;
        const deltaY = event.clientY - lastPointerY;

        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;

        targetRotationX = THREE.MathUtils.clamp(
            targetRotationX,
            -0.65,
            0.65
        );

        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
    } else if (event.pointerType === "mouse") {
        const normalizedX =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        const normalizedY =
            ((event.clientY - rect.top) / rect.height) * 2 - 1;

        targetRotationY = -0.45 + normalizedX * 0.28;
        targetRotationX = normalizedY * 0.12;
    }
});

function stopDragging(event) {
    isDragging = false;
    canvas.style.cursor = "grab";

    if (
        event &&
        canvas.hasPointerCapture &&
        canvas.hasPointerCapture(event.pointerId)
    ) {
        try {
            canvas.releasePointerCapture(event.pointerId);
        } catch {
            // Il puntatore potrebbe essere già stato rilasciato.
        }
    }
}

canvas.addEventListener("pointerup", stopDragging);
canvas.addEventListener("pointercancel", stopDragging);
canvas.addEventListener("lostpointercapture", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
});

canvas.addEventListener("pointerleave", () => {
    if (!isDragging) {
        targetRotationX = 0;
        targetRotationY = -0.45;
    }
});

/* RESPONSIVE RESIZE */

function resizeRenderer() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width <= 0 || height <= 0) {
        return;
    }

    camera.aspect = width / height;

    if (width < 700) {
        camera.position.set(0, 0.25, 7.1);
    } else {
        camera.position.set(0, 0.35, 6.5);
    }

    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(width, height, false);
}

const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(container);

window.addEventListener("resize", resizeRenderer);

resizeRenderer();

/* ANIMATION */

const clock = new THREE.Clock();

let animationFrameId = null;
let isPageVisible = !document.hidden;

function animate() {
    if (!isPageVisible) {
        return;
    }

    animationFrameId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    if (modelLoaded && drone) {
        currentRotationX +=
            (targetRotationX - currentRotationX) * 0.045;

        currentRotationY +=
            (targetRotationY - currentRotationY) * 0.045;

        pivot.rotation.x = currentRotationX;
        pivot.rotation.y = currentRotationY;

        pivot.position.y = Math.sin(elapsed * 0.8) * 0.045;
    }

    renderer.render(scene, camera);
}

animate();

/* SAVE RESOURCES WHEN TAB IS HIDDEN */

document.addEventListener("visibilitychange", () => {
    isPageVisible = !document.hidden;

    if (!isPageVisible) {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    } else {
        clock.start();

        if (animationFrameId === null) {
            animate();
        }
    }
});

}

/* =========================================
MOBILE NAVIGATION
========================================= */

const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

if (menuButton && mobileNav) {
function closeMenu() {
mobileNav.hidden = true;
menuButton.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute(
        "aria-expanded",
        String(!isOpen)
    );

    mobileNav.hidden = isOpen;
}

menuButton.addEventListener("click", toggleMenu);

mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 700) {
        closeMenu();
    }
});

}

/* =========================================
CURRENT YEAR
========================================= */

const yearElement = document.getElementById("current-year");

if (yearElement) {
yearElement.textContent = new Date().getFullYear();
}