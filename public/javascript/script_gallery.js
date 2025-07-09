// Button
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const returnBtn = document.getElementById("returnBtn");

  if (scrollTop + windowHeight >= scrollHeight - 10) {
    returnBtn.classList.remove("opacity-0", "pointer-events-none", "-translate-x-10");
    returnBtn.classList.add("opacity-100", "pointer-events-auto", "translate-x-0");
  } else {
    returnBtn.classList.remove("opacity-100", "pointer-events-auto", "translate-x-0");
    returnBtn.classList.add("opacity-0", "pointer-events-none", "-translate-x-10");
  }
});

// Animasi Images
window.addEventListener("load", () => {
  const lenis = new Lenis();
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const images = [];
  let loadedImageCount = 0;

  function loadImages() {
    for (let i = 1; i <= 7; i++) {
      const img = new Image();
      img.onload = () => {
        images.push(img);
        loadedImageCount++;
        if (loadedImageCount === 7) initializeScene();
      };
      img.onerror = () => {
        loadedImageCount++;
        if (loadedImageCount === 7) initializeScene();
      };
      img.src = `./assests/img/gallery/p${i}.webp`;
    }
  }

  function initializeScene() {
    const scene = new THREE.Scene();
    const fov = window.innerWidth < 768 ? 60 : 45;
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("canvas"),
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);

    const parentWidth = 20;
    const parentHeight = 75;
    const curvature = 35;
    const segmentsX = 200;
    const segmentsY = 200;

    const parentGeometry = new THREE.PlaneGeometry(parentWidth, parentHeight, segmentsX, segmentsY);
    const positions = parentGeometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      const distanceFromCenter = Math.abs(y / parentHeight / 2);
      positions[i + 2] = -Math.pow(distanceFromCenter, 2) * curvature;
    }

    parentGeometry.computeVertexNormals();

    const textureCanvas = document.createElement("canvas");
    const ctx = textureCanvas.getContext("2d", {
      alpha: false,
      willReadFrequently: false,
    });

    textureCanvas.width = 640;
    textureCanvas.height = 2560;

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = Math.min(2, renderer.capabilities.getMaxAnisotropy());

    const parentMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.1,
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(0, 20, 20);
    scene.add(ambientLight, directionalLight);

    const parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
    parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
    parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
    scene.add(parentMesh);

    const distance = 17.5;
    const heightOffset = 5;
    const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
    const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));
    camera.position.set(offsetX, heightOffset, offsetZ);
    camera.lookAt(0, -2, 0);
    camera.rotation.z = THREE.MathUtils.degToRad(-5);

    const totalSlides = 7;
    const slideHeight = 25;

    const gap = 2.5;
    const cycleHeight = totalSlides * (slideHeight + gap);

    function updateTexture(offset = 0) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

      const extraSlides = 2;

      for (let i = -extraSlides; i < totalSlides + extraSlides; i++) {
        let slideY = -i * (slideHeight + gap);
        slideY += offset * cycleHeight;

        const textureY = (slideY / cycleHeight) * textureCanvas.height;
        let wrappedY = textureY % textureCanvas.height;
        if (wrappedY < 0) wrappedY += textureCanvas.height;

        let slideIndex = ((i % totalSlides) + totalSlides) % totalSlides;

        const slideRect = {
          x: textureCanvas.width * 0.05,
          y: wrappedY,
          width: textureCanvas.width * 0.9,
          height: (slideHeight / cycleHeight) * textureCanvas.height,
        };

        const img = images[slideIndex];
        if (img) {
          const imgAspect = img.width / img.height;
          const rectAspect = slideRect.width / slideRect.height;

          let drawWidth, drawHeight, drawX, drawY;
          if (imgAspect > rectAspect) {
            drawHeight = slideRect.height;
            drawWidth = drawHeight * imgAspect;
            drawX = slideRect.x + (slideRect.width - drawWidth) / 2;
            drawY = slideRect.y;
          } else {
            drawWidth = slideRect.width;
            drawHeight = drawWidth / imgAspect;
            drawX = slideRect.x;
            drawY = slideRect.y + (slideRect.height - drawHeight) / 2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(slideRect.x, slideRect.y, slideRect.width, slideRect.height);
          ctx.clip();

          const centerY = textureCanvas.height / 2;
          const distanceToCenter = Math.abs(wrappedY + slideRect.height / 2 - centerY);
          const fadeZone = textureCanvas.height * 0.2;
          const alpha = Math.max(0, 1 - distanceToCenter / fadeZone);

          ctx.globalAlpha = alpha;
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      texture.needsUpdate = true;
    }

    let currentScroll = 0;
    let lastOffset = -1;

    lenis.on("scroll", ({ scroll, limit }) => {
      currentScroll = scroll / limit;
    });

    function renderLoop() {
      const offset = -currentScroll;
      if (offset !== lastOffset) {
        updateTexture(offset);
        lastOffset = offset;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(renderLoop);
    }
    renderLoop();

    window.addEventListener("resize", () => {
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      camera.aspect = window.innerWidth / viewportHeight;

      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        camera.aspect = window.innerWidth / viewportHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, viewportHeight);
      }, 200); // kasih delay sedikit biar stabil
    });

    // Fade-in canvas animation
    const canvas = document.querySelector("canvas");
    canvas.style.opacity = 0;
    canvas.style.transform = "translateY(50px)";
    canvas.style.transition = "all 1s ease";
    setTimeout(() => {
      canvas.style.opacity = 1;
      canvas.style.transform = "translateY(0)";
    }, 300);
  }

  loadImages();
});
