import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. ENGINE STATE
window.worldSettings = { 
    gravity: -9.8, 
    oxygenLevel: 0.5, 
    growthRate: 1.0 
};

const bodies = []; // Physics bodies
const visuals = []; // 3D Meshes (Both cubes and characters)
let characterTemplate = null;

// 2. SCENE SETUP
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0x00ff88, 2);
light.position.set(5, 10, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// Physics
const world = new CANNON.World();
world.gravity.set(0, window.worldSettings.gravity, 0);

// Ground
const grid = new THREE.GridHelper(100, 50, 0x00ff88, 0x002211);
scene.add(grid);
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
world.addBody(groundBody);

// 3. LOAD CHARACTER DNA
const loader = new GLTFLoader();
loader.load('./character.glb', (gltf) => {
    characterTemplate = gltf.scene;
    log("Advanced DNA Loaded (character.glb)");
}, undefined, (err) => {
    log("Warning: character.glb not found. Primitive DNA active.");
});

// 4. CORE ENGINE FUNCTIONS
function log(msg) {
    const el = document.getElementById('console-logs');
    el.innerHTML += `<br>> ${msg}`;
    el.scrollTop = el.scrollHeight;
}

// Function to Spawn Primitive Cubes
window.spawnCube = () => {
    const mut = window.worldSettings.growthRate;
    
    // Geometry logic from previous version
    let geo = mut > 2 ? new THREE.IcosahedronGeometry(0.5) : new THREE.BoxGeometry(0.8, 0.8, 0.8);
    let mat = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
        emissive: new THREE.Color().setHSL(Math.random(), 0.8, 0.2),
        wireframe: mut > 2.5
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const body = new CANNON.Body({ mass: 1 });
    body.addShape(new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4)));
    body.position.set(Math.random()*4-2, 12, Math.random()*4-2);
    world.addBody(body);

    bodies.push(body);
    visuals.push(mesh);
    updateCount();
    log("Primitive Lifeform Synthesized.");
};

// Function to Spawn Advanced Characters
window.spawnCharacter = () => {
    if(!characterTemplate) {
        log("DNA missing. Spawning primitive instead.");
        window.spawnCube();
        return;
    }
    
    const clone = characterTemplate.clone();
    scene.add(clone);

    const body = new CANNON.Body({ mass: 1 });
    body.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)));
    body.position.set(Math.random()*4-2, 12, Math.random()*4-2);
    world.addBody(body);

    bodies.push(body);
    visuals.push(clone);
    updateCount();
    log("Advanced Lifeform Synthesized.");
};

function updateCount() {
    document.getElementById('creature-count').innerText = bodies.length;
}

function calculateStability() {
    const gDiff = Math.abs(window.worldSettings.gravity - (-9.8));
    const oDiff = Math.abs(window.worldSettings.oxygenLevel - 0.5);
    const score = Math.max(0, Math.floor(100 - (gDiff * 5) - (oDiff * 20)));
    document.getElementById('stability-val').innerText = `${score}%`;
}

// 5. UI LISTENERS
document.getElementById('grav-slider').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    window.worldSettings.gravity = val;
    world.gravity.set(0, val, 0);
    document.getElementById('grav-display').innerText = val;
    calculateStability();
});

document.getElementById('oxy-slider').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    window.worldSettings.oxygenLevel = val;
    document.getElementById('oxy-display').innerText = val.toFixed(2);
    calculateStability();
});

document.getElementById('growth-slider').addEventListener('input', (e) => {
    window.worldSettings.growthRate = parseFloat(e.target.value);
    document.getElementById('growth-display').innerText = window.worldSettings.growthRate.toFixed(1);
});

// 6. AI OPTIMIZER
window.applyAIMutation = () => {
    log("AI: Stabilizing biological parameters...");
    const interval = setInterval(() => {
        let stable = true;
        if (Math.abs(window.worldSettings.gravity - (-9.8)) > 0.1) {
            window.worldSettings.gravity += (-9.8 - window.worldSettings.gravity) * 0.2;
            stable = false;
        }
        if (Math.abs(window.worldSettings.oxygenLevel - 0.5) > 0.01) {
            window.worldSettings.oxygenLevel += (0.5 - window.worldSettings.oxygenLevel) * 0.2;
            stable = false;
        }
        
        // Sync UI
        document.getElementById('grav-slider').value = window.worldSettings.gravity;
        document.getElementById('grav-display').innerText = window.worldSettings.gravity.toFixed(1);
        document.getElementById('oxy-slider').value = window.worldSettings.oxygenLevel;
        document.getElementById('oxy-display').innerText = window.worldSettings.oxygenLevel.toFixed(2);
        
        world.gravity.set(0, window.worldSettings.gravity, 0);
        calculateStability();

        if(stable) {
            clearInterval(interval);
            log("AI: Ecosystem parameters restored.");
        }
    }, 50);
};

// 7. ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);
    world.fixedStep();

    for (let i = 0; i < bodies.length; i++) {
        const mesh = visuals[i];
        const body = bodies[i];

        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);

        // --- MORPHING LOGIC (Applied to everything!) ---
        const gravFactor = Math.abs(window.worldSettings.gravity) / 9.8;
        const squash = 1 / Math.sqrt(gravFactor); 
        const stretch = Math.sqrt(gravFactor);   
        const growth = window.worldSettings.growthRate;

        mesh.scale.set(
            stretch * growth, 
            squash * growth, 
            stretch * growth
        );

        if(body.position.y < -15) body.position.set(0, 15, 0);
    }

    // Cinematic Camera
    const time = Date.now() * 0.0003;
    camera.position.x = Math.sin(time) * 15;
    camera.position.z = Math.cos(time) * 15;
    camera.position.y = 10;
    camera.lookAt(0, 2, 0);

    renderer.render(scene, camera);
}

window.resetWorld = () => location.reload();
animate();

// Spawn 3 primitives and 2 advanced to start
setTimeout(() => {
    for(let i=0; i<3; i++) window.spawnCube();
    for(let i=0; i<2; i++) window.spawnCharacter();
}, 1000);