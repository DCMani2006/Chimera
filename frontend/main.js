import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
window.addEventListener("error", e => {
  console.error("RUNTIME ERROR:", e.message);
});


// --- 1. ENGINE STATE ---
window.worldSettings = { gravity: -9.8, oxygenLevel: 0.5, growthRate: 1.0 };
const bodies = []; 
const visuals = []; 
const characterTemplates = []; 

// --- 2. SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const pLight = new THREE.PointLight(0x00ff88, 2, 100);
pLight.position.set(10, 20, 10);
scene.add(pLight);

const world = new CANNON.World();
world.gravity.set(0, window.worldSettings.gravity, 0);
scene.add(new THREE.GridHelper(100, 50, 0x00ff88, 0x002211));

// Visible + solid ground
const groundMesh = new THREE.Mesh(
  new THREE.BoxGeometry(50, 1, 50),
  new THREE.MeshStandardMaterial({ color: 0x003322 })
);
groundMesh.position.y = -0.5;
scene.add(groundMesh);

const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(new CANNON.Box(new CANNON.Vec3(25, 0.5, 25)));
groundBody.position.y = -0.5;
world.addBody(groundBody);


function log(msg) {
    const el = document.getElementById('console-logs');
    if(el) { el.innerHTML += `<br>> ${msg}`; el.scrollTop = el.scrollHeight; }
}
const testCube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
testCube.position.set(0, 2, 0);
scene.add(testCube);

// --- 3. THE ROBUST LOADER ---
const loader = new GLTFLoader();

// We try loading the file. If it's in the same folder as index.html, 'character.glb' is the path.
loader.load('./character.glb', 
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(20, 20, 20);
        model.position.set(0, 2, 0);
        scene.add(new THREE.BoxHelper(model, 0xffff00));

 // Make it slightly larger
        characterTemplates.push(model);
        log("DNA Sequence Verified: character.glb is LIVE.");
        // Spawn 3 right away
        for(let i=0; i<3; i++) window.spawnCharacter();
    }, 
    undefined, 
    (err) => {
        console.error("FULL ERROR OBJECT:", err);
        log("CRITICAL ERR: character.glb could not be found.");
        log("FIX: Ensure the file is named EXACTLY 'character.glb' and is in the 'frontend' folder.");
    }
);

// --- 4. SPAWN FUNCTIONS ---
console.log("spawnCube called");
window.spawnCube = () => {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1), 
        new THREE.MeshStandardMaterial({ color: 0x00ff88 })
    );
    scene.add(mesh);
    const body = new CANNON.Body({ mass: 1 });
    body.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)));
    body.position.set(Math.random()*4-2, 10, Math.random()*4-2);
    world.addBody(body);
    bodies.push(body);
    visuals.push(mesh);
    document.getElementById('creature-count').innerText = bodies.length;
};
console.log("spawnCharacter called");

window.spawnCharacter = () => {
    if (characterTemplates.length === 0) {
        log("DNA missing. Spawning placeholder primitive...");
        window.spawnCube();
        return;
    }

    const clone = characterTemplates[0].clone();
    scene.add(clone);

    const body = new CANNON.Body({ mass: 1 });
    body.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)));
    body.position.set(Math.random()*6-3, 15, Math.random()*6-3);
    world.addBody(body);

    bodies.push(body);
    visuals.push(clone);
    document.getElementById('creature-count').innerText = bodies.length;
    log("Advanced Lifeform Manifested.");
};

// --- 5. ANIMATION & UI ---
const gravSlider = document.getElementById('grav-slider');
if (gravSlider) {
  gravSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    window.worldSettings.gravity = val;
    world.gravity.set(0, val, 0);
    document.getElementById('grav-display').innerText = val;
  });
}

function animate() {
    requestAnimationFrame(animate);
    world.fixedStep();
    for (let i = 0; i < bodies.length; i++) {
        if (visuals[i] && bodies[i]) {
            visuals[i].position.copy(bodies[i].position);
            visuals[i].quaternion.copy(bodies[i].quaternion);
            
            // Scaling logic
            const g = Math.abs(window.worldSettings.gravity) / 9.8 || 0.1;
            const growth = window.worldSettings.growthRate || 1;
            visuals[i].scale.set(Math.sqrt(g)*growth, (1/Math.sqrt(g))*growth, Math.sqrt(g)*growth);
        }
    }
    const t = Date.now() * 0.0003;
    camera.position.set(Math.sin(t)*15, 10, Math.cos(t)*15);
    camera.lookAt(0, 2, 0);
    renderer.render(scene, camera);
}

window.resetWorld = () => location.reload();
window.applyAIMutation = () => { /* Logic hidden for brevity */ log("AI Optimization running..."); };

animate();