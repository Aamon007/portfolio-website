(function () {
  var root = document.documentElement;
  var revealElements = document.querySelectorAll('.scroll-reveal');
  var emailInput = document.getElementById('emailInput');
  var newsletterForm = document.getElementById('newsletterForm');
  var watchVideoBtn = document.getElementById('watchVideoBtn');
  var exploreMapBtn = document.getElementById('exploreMapBtn');
  var statCards = document.querySelectorAll('.stat-card');
  var hasAnimatedStats = false;

  function handleMouseMove(event) {
    var x = (event.clientX / window.innerWidth - 0.5) * 18;
    var y = (event.clientY / window.innerHeight - 0.5) * 18;
    root.style.setProperty('--mouse-x', x.toFixed(2));
    root.style.setProperty('--mouse-y', y.toFixed(2));
  }

  function animateCount(element, target, suffix) {
    var current = 0;
    var isDecimal = String(target).indexOf('.') > -1;
    var increment = isDecimal ? 0.05 : Math.max(1, Math.floor(target / 70));
    var step = setInterval(function () {
      if (isDecimal) {
        current = parseFloat((current + increment).toFixed(2));
      } else {
        current += increment;
      }
      if (current >= target) {
        element.textContent = target + suffix;
        clearInterval(step);
        return;
      }
      element.textContent = isDecimal ? current.toFixed(1) + suffix : Math.floor(current) + suffix;
    }, 20);
  }

  function startStatsAnimation() {
    if (hasAnimatedStats) {
      return;
    }
    statCards.forEach(function (card) {
      var strong = card.querySelector('strong');
      var targetValue = card.getAttribute('data-target');
      if (!strong || !targetValue) {
        return;
      }
      if (targetValue.indexOf('.') > -1) {
        strong.textContent = '0.0';
      } else {
        strong.textContent = '0';
      }
      var target = parseFloat(targetValue);
      var suffix = card.getAttribute('data-suffix') || '';
      animateCount(strong, target, suffix);
    });
    hasAnimatedStats = true;
  }

  function handleReveal(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.closest('#stats')) {
          startStatsAnimation();
        }
      }
    });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(handleReveal, {
      threshold: 0.16,
    });
    revealElements.forEach(function (element) {
      observer.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add('visible');
    });
  }

  document.addEventListener('mousemove', handleMouseMove);

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = emailInput.value.trim();
      if (!email || email.indexOf('@') === -1) {
        emailInput.value = '';
        emailInput.placeholder = 'Enter a valid email';
        return;
      }
      emailInput.value = '';
      emailInput.placeholder = 'Subscribed — thank you!';
    });
  }

  if (watchVideoBtn) {
    watchVideoBtn.addEventListener('click', function () {
      watchVideoBtn.textContent = 'Opening...';
      watchVideoBtn.disabled = true;
      setTimeout(function () {
        watchVideoBtn.textContent = 'Watch Demo';
        watchVideoBtn.disabled = false;
      }, 1800);
    });
  }

  if (exploreMapBtn) {
    exploreMapBtn.addEventListener('click', function () {
      exploreMapBtn.classList.add('btn-pulse');
      setTimeout(function () {
        exploreMapBtn.classList.remove('btn-pulse');
      }, 700);
    });
  }
})();

function initAuroraGlobe() {
  var container = document.getElementById('globeContainer');
  if (!container || typeof THREE === 'undefined') {
    return;
  }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
  camera.position.set(0, 0, 3.5);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  var ambientLight = new THREE.AmbientLight(0x8df8ff, 0.7);
  scene.add(ambientLight);

  var pointLightA = new THREE.PointLight(0x84ffce, 1.1, 10, 2);
  pointLightA.position.set(4, 4, 3);
  scene.add(pointLightA);

  var pointLightB = new THREE.PointLight(0xc26dff, 0.65, 10, 2);
  pointLightB.position.set(-4, -2, 3);
  scene.add(pointLightB);

  var globeGeometry = new THREE.SphereGeometry(1.02, 64, 64);
  var globeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x091826,
    transparent: true,
    opacity: 0.34,
    roughness: 0.45,
    metalness: 0.1,
    emissive: 0x1c5b82,
    emissiveIntensity: 0.24,
    transmission: 0.5,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
  });
  var globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  var wireGeometry = new THREE.SphereGeometry(1.06, 56, 56);
  var wireMaterial = new THREE.LineBasicMaterial({ color: 0x75ffd9, opacity: 0.35, transparent: true });
  var wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(wireGeometry), wireMaterial);
  scene.add(wireframe);

  var atmosphereGeometry = new THREE.SphereGeometry(1.18, 64, 64);
  var atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x76ffdb,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  });
  var atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  var markerGroup = new THREE.Group();
  var markerData = [
    { lat: 64.8, lon: -147.7, color: 0x8effd2 },
    { lat: 69.6, lon: 18.9, color: 0xd388ff },
    { lat: 22.0, lon: 114.2, color: 0x8dffb9 },
  ];

  function latLonToVector3(lat, lon, radius) {
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lon + 180) * (Math.PI / 180);
    var x = -radius * Math.sin(phi) * Math.cos(theta);
    var z = radius * Math.sin(phi) * Math.sin(theta);
    var y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  markerData.forEach(function (item) {
    var dotGeo = new THREE.SphereGeometry(0.04, 12, 12);
    var dotMat = new THREE.MeshBasicMaterial({
      color: item.color,
      emissive: item.color,
      emissiveIntensity: 1,
    });
    var dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(latLonToVector3(item.lat, item.lon, 1.08));
    markerGroup.add(dot);

    var pulseGeo = new THREE.RingGeometry(0.06, 0.12, 32);
    var pulseMat = new THREE.MeshBasicMaterial({
      color: item.color,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    var pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulse.position.copy(latLonToVector3(item.lat, item.lon, 1.09));
    pulse.lookAt(new THREE.Vector3(0, 0, 0));
    pulse.userData = { baseScale: 1 };
    markerGroup.add(pulse);
  });
  scene.add(markerGroup);

  var isDragging = false;
  var previousMouse = { x: 0, y: 0 };
  var rotation = { x: 0.1, y: 0 };
  var targetRotation = { x: 0.1, y: 0 };

  function resizeGlobe() {
    var width = container.clientWidth;
    var height = container.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  container.style.touchAction = 'none';
  container.style.cursor = 'grab';

  container.addEventListener('pointerdown', function (event) {
    isDragging = true;
    previousMouse.x = event.clientX;
    previousMouse.y = event.clientY;
    container.style.cursor = 'grabbing';
    container.setPointerCapture(event.pointerId);
  });

  container.addEventListener('pointermove', function (event) {
    if (!isDragging) {
      return;
    }
    var deltaX = event.clientX - previousMouse.x;
    var deltaY = event.clientY - previousMouse.y;
    targetRotation.y += deltaX * 0.004;
    targetRotation.x += deltaY * 0.004;
    previousMouse.x = event.clientX;
    previousMouse.y = event.clientY;
  });

  container.addEventListener('pointerup', function (event) {
    isDragging = false;
    container.style.cursor = 'grab';
    container.releasePointerCapture(event.pointerId);
  });

  container.addEventListener('pointerleave', function () {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  window.addEventListener('resize', resizeGlobe);

  var clock = new THREE.Clock();

  function animateGlobe() {
    requestAnimationFrame(animateGlobe);
    var delta = clock.getDelta();
    if (!isDragging) {
      targetRotation.y += delta * 0.2;
    }

    rotation.x += (targetRotation.x - rotation.x) * 0.08;
    rotation.y += (targetRotation.y - rotation.y) * 0.08;

    globe.rotation.x = rotation.x;
    globe.rotation.y = rotation.y;
    wireframe.rotation.x = rotation.x;
    wireframe.rotation.y = rotation.y;
    atmosphere.rotation.x = rotation.x;
    atmosphere.rotation.y = rotation.y;
    markerGroup.rotation.x = rotation.x;
    markerGroup.rotation.y = rotation.y;

    var elapsed = clock.elapsedTime;
    markerGroup.children.forEach(function (child) {
      if (child.geometry.type === 'SphereGeometry') {
        var scale = 1 + 0.1 * Math.sin(elapsed * 3 + child.position.y * 8);
        child.scale.setScalar(scale);
      }
      if (child.geometry.type === 'RingGeometry') {
        var pulse = 1 + 0.15 * Math.sin(elapsed * 2 + child.position.y * 6);
        child.scale.set(pulse, pulse, pulse);
        child.material.opacity = 0.15 + 0.08 * Math.sin(elapsed * 2 + child.position.y * 6);
      }
    });

    renderer.render(scene, camera);
  }

  resizeGlobe();
  animateGlobe();
}

function initSignInModal() {
  var modal = document.getElementById('signin-modal');
  var openButton = document.querySelector('.btn.btn-ghost');
  var closeButton = modal ? modal.querySelector('.modal-close') : null;
  var modalContent = modal ? modal.querySelector('.modal-content') : null;
  var signinForm = document.getElementById('signinForm');

  if (!modal || !openButton || !closeButton || !modalContent) {
    return;
  }

  function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  openButton.addEventListener('click', function (event) {
    event.preventDefault();
    openModal();
  });

  closeButton.addEventListener('click', function () {
    closeModal();
  });

  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (signinForm) {
    signinForm.addEventListener('submit', function (event) {
      event.preventDefault();
      closeModal();
    });
  }
}

window.addEventListener('load', initAuroraGlobe);
window.addEventListener('load', initSignInModal);