import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

/* =========================================
   AIRFRAME — 3D EXPERIENCE
========================================= */

const container = document.getElementById("model-container");
const canvas = document.getElementById("drone-canvas");

if (container && canvas) {
    initializeDrone();
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

    /* =========================================
       CINEMATIC LIGHTING
    ========================================= */

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

    /* =========================================
       DRONE MODEL
    ========================================= */

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

            if (
                !Number.isFinite(maxDimension) ||
                maxDimension <= 0
            ) {
                console.error(
                    "AIRFRAME: dimensioni del modello 3D non valide."
                );

                drone = null;
                return;
            }

            // Centra il modello rispetto al suo pivot.
            drone.position.sub(center);

            // Normalizza le dimensioni del drone.
            drone.scale.setScalar(2.5 / maxDimension);

            // Piccolo spostamento per bilanciare la composizione.
            drone.position.x += 0.20;

            pivot.add(drone);

            pivot.rotation.set(0, -0.45, 0);

            modelLoaded = true;

            console.info("AIRFRAME: modello 3D caricato.");
        },

        undefined,

        (error) => {
            console.error(
                "AIRFRAME: impossibile caricare il modello 3D.",
                error
            );
        }
    );

    /* =========================================
       INTERACTION
    ========================================= */

    let isDragging = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const rotationSensitivity = 0.008;

    canvas.style.cursor = "grab";

    canvas.addEventListener("pointerdown", (event) => {
        isDragging = true;

        pointerStartX = event.clientX;
        pointerStartY = event.clientY;

        previousPointerX = event.clientX;
        previousPointerY = event.clientY;

        canvas.style.cursor = "grabbing";

        try {
            canvas.setPointerCapture(event.pointerId);
        } catch {
            // Il browser potrebbe non supportare la cattura.
        }
    });

    canvas.addEventListener("pointermove", (event) => {
        if (!isDragging) {
            return;
        }

        const deltaX = event.clientX - previousPointerX;
        const deltaY = event.clientY - previousPointerY;

        previousPointerX = event.clientX;
        previousPointerY = event.clientY;

        targetRotationY += deltaX * rotationSensitivity;
        targetRotationX += deltaY * rotationSensitivity;

        targetRotationX = THREE.MathUtils.clamp(
            targetRotationX,
            -0.65,
            0.65
        );
    });

    function stopDragging() {
        isDragging = false;
        canvas.style.cursor = "grab";
    }

    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("lostpointercapture", stopDragging);

    // Movimento delicato quando il puntatore non sta trascinando.
    canvas.addEventListener("pointerleave", () => {
        if (!isDragging) {
            targetRotationX *= 0.98;
        }
    });

    /* =========================================
       RESPONSIVE CAMERA
    ========================================= */

    function resizeRenderer() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width <= 0 || height <= 0) {
            return;
        }

        renderer.setSize(width, height, false);

        camera.aspect = width / height;

        if (width < 700) {
            camera.position.set(0, 0.25, 7.1);
        } else {
            camera.position.set(0, 0.35, 6.5);
        }

        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resizeRenderer);

    resizeObserver.observe(container);

    window.addEventListener("resize", resizeRenderer);

    resizeRenderer();

    /* =========================================
       ANIMATION LOOP
    ========================================= */

    const clock = new THREE.Clock();

    let animationFrameId = 0;

    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        if (document.hidden) {
            return;
        }

        const elapsed = clock.getElapsedTime();

        if (modelLoaded && drone) {
            // Interpolazione per una rotazione fluida.
            currentRotationX +=
                (targetRotationX - currentRotationX) * 0.06;

            currentRotationY +=
                (targetRotationY - currentRotationY) * 0.06;

            pivot.rotation.x = currentRotationX;

            // Movimento ambientale leggero, senza interferire
            // eccessivamente con il controllo manuale.
            const idleRotation = isDragging
                ? 0
                : Math.sin(elapsed * 0.22) * 0.035;

            pivot.rotation.y = currentRotationY + idleRotation;

            // Leggero movimento verticale.
            pivot.position.y = Math.sin(elapsed * 0.8) * 0.045;
        }

        renderer.render(scene, camera);
    }

    animate();

    /* =========================================
       PERFORMANCE / CLEANUP
    ========================================= */

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && animationFrameId === 0) {
            clock.start();
            animate();
        }
    });
}

/* =========================================
   MOBILE NAVIGATION
========================================= */

const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

if (menuButton && mobileNav) {
    function closeMobileMenu() {
        mobileNav.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Apri il menu");
    }

    function openMobileMenu() {
        mobileNav.hidden = false;
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Chiudi il menu");
    }

    menuButton.addEventListener("click", () => {
        const isExpanded =
            menuButton.getAttribute("aria-expanded") === "true";

        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1000) {
            closeMobileMenu();
        }
    });
}

/* =========================================
   FOOTER YEAR
========================================= */

const yearElement = document.getElementById("current-year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}
