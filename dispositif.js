//import de toutes les ressources nécessaire au bon focntionnement du code
import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { ARButton } from './node_modules/three/examples/jsm/webxr/ARButton.js';

let scene, camera, renderer;
let controller, controls;
const raycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3(-3,0,0);
const rayDirection = new THREE.Vector3(10,0,0);
rayDirection.normalize();

raycaster.set(rayOrigin, rayDirection);
const intersect=raycaster.intersectObject

init();
function init() {
    const container = document.createElement('div');
    container.classList.add("dispositifInteractif");
    document.body.appendChild(container);
    
    // Création d'une scène ThreeJS
    scene = new THREE.Scene()
    
    //chargement du modèle Blender
    const Loader = new GLTFLoader()
    Loader.load('./ressources/models/SAE4X.glb', function (gltf) {
        const paints = gltf.scene
        scene.add(paints)
        console.log(scene);
    })
    // Initialisation de la caméra
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100)
    
    // Initialisation du point du lumière
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.2);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);
    
    // Ici on vise a rendre la scène 3D, comme un rendu sur Première mais en ThreeJS
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    controls = new OrbitControls( camera, renderer.domElement );
    
    document.body.appendChild(ARButton.createButton(renderer)).classList.add("dispositifInteractif");

    console.log('Previous Raycaster')

    function onSelect(event) {
        alert("Do not touch the paints please.")
    }
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);
    
    //
    
    window.addEventListener('resize', onWindowResize);
    
}

// Position de la caméra
camera.position.setZ(6);
camera.position.setX(0);
camera.position.setY(0);


// Là, le code ajuste l'affichage en fonction de la taille de l'écran
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}


// Fonction de rendu
function render() {
    renderer.render(scene, camera);
}

// Le navigateur refresh l'image 60 fois par secondes et c'est grace à ce qu'il y a juste en dessous
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    renderer.setAnimationLoop(render)
    controls.update();
}
// appel de la fonction animate()
animate()
