import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================================================
   AIRFRAME — THREE.JS / DJI AVATA 2
   ========================================================= */

const container = document.getElementById("model-container");
const canvas = document.getElementById("drone-canvas");

if (!container || !canvas) {
  console.error("AIRFRAME: contenitore o canvas 3D non trovato.");
} else {
  initializeDrone();
}

function initializeDrone() {
  /* -------------------------------------------------------
     SCENA
     ------------------------------------------------------- */

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    1,
    0.1,
    100
  );

  camera.position.set(0, 0.35, 6.5);
  camera.lookAt(0, 0, 0);

  /* -------------------------------------------------------
     RENDERER
     Utilizza il canvas già presente nell'HTML.
     ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     ILLUMINAZIONE CINEMATOGRAFICA
     ------------------------------------------------------- */

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
    0x8baaff,
    2.5
  );

  rimLight.position.set(-5, 3, -4);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(
    0xc7b89b,
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

  /* -------------------------------------------------------
     MODELLO 3D
     ------------------------------------------------------- */

  const pivot = new THREE.Group();
  scene.add(pivot);

  let drone = null;
  let modelLoaded = false;

  let targetRotationX = 0;
  let targetRotationY = -0.45;

  let currentRotationX = 0;
  let currentRotationY = -0.45;

  const loader = new GLTFLoader();

  loader.load(
    "./assets/models/dji-avata-2-optimized.glb",

    (gltf) => {
      drone = gltf.scene;

      // Calcola le dimensioni reali del modello.
      const bounds = new THREE.Box3().setFromObject(drone);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());

      const maxDimension = Math.max(
        size.x,
        size.y,
        size.z
      );

      if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
        console.error("AIRFRAME: dimensioni del modello non valide.");
        drone = null;
        return;
      }

      // Centra il modello sul proprio punto di rotazione.
      drone.position.sub(center);

      // Mantiene proporzioni e orientamento originali.
      drone.scale.setScalar(3.2 / maxDimension);

      pivot.add(drone);

      // Imposta l'inquadratura iniziale.
      pivot.rotation.set(0, -0.45, 0);

      modelLoaded = true;

      console.info("AIRFRAME: modello 3D caricato.");
    },

    undefined,

    (error) => {
      // Nessun messaggio tecnico viene mostrato nella pagina.
      console.error(
        "AIRFRAME: impossibile caricare il modello DJI Avata 2.",
        error
      );
    }
  );

  /* -------------------------------------------------------
     INTERAZIONE CON IL MOUSE E IL TOUCH
     ------------------------------------------------------- */

  let isDragging = false;
  let activePointerId = null;

  let previousPointerX = 0;
  let previousPointerY = 0;

  const rotationSensitivity = 0.008;

  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") {
      isDragging = true;
      activePointerId = event.pointerId;

      previousPointerX = event.clientX;
      previousPointerY = event.clientY;

      canvas.style.cursor = "grabbing";

      canvas.setPointerCapture(event.pointerId);
    } else {
      isDragging = true;
      activePointerId = event.pointerId;

      previousPointerX = event.clientX;
      previousPointerY = event.clientY;

      canvas.setPointerCapture(event.pointerId);
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!modelLoaded) return;

    if (event.pointerType === "mouse" && !isDragging) {
      // Movimento fluido quando si sposta il mouse
      // sopra il modello, senza richiedere un clic.
      const rect = container.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      targetRotationY = (x - 0.5) * 1.4 - 0.45;
      targetRotationX = (y - 0.5) * 0.5;

      return;
    }

    if (
      !isDragging ||
      event.pointerId !== activePointerId
    ) {
      return;
    }

    const deltaX = event.clientX - previousPointerX;
    const deltaY = event.clientY - previousPointerY;

    targetRotationY += deltaX * rotationSensitivity;
    targetRotationX += deltaY * rotationSensitivity;

    targetRotationX = THREE.MathUtils.clamp(
      targetRotationX,
      -0.65,
      0.65
    );

    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
  });

  function stopDragging(event) {
    if (event.pointerId !== activePointerId) return;

    isDragging = false;
    activePointerId = null;

    if (event.pointerType === "mouse") {
      canvas.style.cursor = "grab";
    }
  }

  canvas.addEventListener("pointerup", stopDragging);
  canvas.addEventListener("pointercancel", stopDragging);
  canvas.addEventListener("lostpointercapture", stopDragging);

  canvas.addEventListener("pointerleave", () => {
    if (!isDragging) {
      canvas.style.cursor = "grab";
    }
  });

  /* -------------------------------------------------------
     RIDIMENSIONAMENTO RESPONSIVE
     ------------------------------------------------------- */

  function resizeRenderer() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width <= 0 || height <= 0) return;

    camera.aspect = width / height;

    // Allontana leggermente la camera sugli schermi stretti.
    if (width < 700) {
      camera.position.z = 7.1;
      camera.position.y = 0.25;
    } else {
      camera.position.z = 6.5;
      camera.position.y = 0.35;
    }

    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(width, height, false);
  }

  const resizeObserver = new ResizeObserver(() => {
    resizeRenderer();
  });

  resizeObserver.observe(container);

  window.addEventListener("resize", resizeRenderer);

  resizeRenderer();

  /* -------------------------------------------------------
     ANIMAZIONE
     ------------------------------------------------------- */

  const clock = new THREE.Clock();

  let animationFrameId = null;
  let isPageVisible = !document.hidden;

  function animate() {
    if (!isPageVisible) return;

    animationFrameId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    if (modelLoaded && drone) {
      // Interpolazione morbida della rotazione.
      currentRotationX +=
        (targetRotationX - currentRotationX) * 0.045;

      currentRotationY +=
        (targetRotationY - currentRotationY) * 0.045;

      pivot.rotation.x = currentRotationX;
      pivot.rotation.y = currentRotationY;

      // Leggera sospensione cinematografica.
      pivot.position.y = Math.sin(elapsed * 0.8) * 0.045;
    }

    renderer.render(scene, camera);
  }

  animate();

  /* -------------------------------------------------------
     OTTIMIZZAZIONE QUANDO LA PAGINA NON È VISIBILE
     ------------------------------------------------------- */

  document.addEventListener("visibilitychange", () => {
    isPageVisible = !document.hidden;

    if (isPageVisible) {
      clock.start();
      animate();
    } else {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });

  /* -------------------------------------------------------
     MENU MOBILE
     ------------------------------------------------------- */

  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (menuToggle && mobileNav) {
    function closeMenu() {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Apri il menu");
      mobileNav.hidden = true;
    }

    menuToggle.addEventListener("click", () => {
      const isExpanded =
        menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute(
        "aria-expanded",
        String(!isExpanded)
      );

      menuToggle.setAttribute(
        "aria-label",
        isExpanded ? "Apri il menu" : "Chiudi il menu"
      );

      mobileNav.hidden = isExpanded;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  /* -------------------------------------------------------
     ANNO AUTOMATICO NEL FOOTER
     ------------------------------------------------------- */

  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
