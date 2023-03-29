//import de toutes les ressources nécessaire au bon focntionnement du code
import * as THREE from 'three'
import { Sprite, Vector2 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { ARButton } from 'three/addons/webxr/ARButton.js'
// import * as howl from 'howl';

let scene, camera, renderer;
let controller, controls;

let allDatas = [];

fetch("./data.json")
    .then((res) => res.json())
    .then((data) => data.map((data) => {
        allDatas.push(data)
    }));


const raycaster = new THREE.Raycaster();

const width = window.innerWidth;
const height = window.innerHeight;

init();
function init() {
    const container = document.createElement('div');
    container.classList.add("dispositifInteractif");
    document.body.appendChild(container);

    // Création d'une scène ThreeJS
    scene = new THREE.Scene()

    //chargement du modèle Blender
    const Loader = new GLTFLoader()
    Loader.load('./ressources/models/ThreeSAE4.glb', function (gltf) {
        scene.add(gltf.scene)
    })

    const WINTER = "./ressources/texture/routeVersailles.webp";
    const AUTUMN = "./ressources/texture/autumnLeaves.webp";
    const SUMMER = "./ressources/texture/jourEte.webp";
    const SPRING = "./ressources/texture/springtime.webp";

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const winterTexture = textureLoader.load(WINTER);
    const autumnTexture = textureLoader.load(AUTUMN);
    const summerTexture = textureLoader.load(SUMMER);
    const springTexture = textureLoader.load(SPRING);

    const winterGeometry = new THREE.PlaneGeometry(3, 2, 1, 1);
    const winterMaterial = new THREE.MeshBasicMaterial({
        // Add the texture to the material
        map: winterTexture,
    });

    const winter = new THREE.Mesh(winterGeometry, winterMaterial);
    winter.rotation.y = +Math.PI * 0.5;
    winter.position.y = 0.5;
    winter.position.z = 0;
    winter.position.x = -5.91;
    winter.name = "routeVersailles"

    const autumnGeometry = new THREE.PlaneGeometry(3, 2, 1, 1);
    const autumnMaterial = new THREE.MeshBasicMaterial({
        // Add the texture to the material
        map: autumnTexture,
    });

    const autumn = new THREE.Mesh(autumnGeometry, autumnMaterial);
    autumn.position.y = 0.6;
    autumn.position.z = -5.95;
    autumn.position.x = 0;
    autumn.name = "autumnLeaves"

    const summerGeometry = new THREE.PlaneGeometry(3.5, 2.5, 1, 1);
    const summerMaterial = new THREE.MeshBasicMaterial({
        // Add the texture to the material
        map: summerTexture,
    });

    const summer = new THREE.Mesh(summerGeometry, summerMaterial);
    summer.position.y = 0.9;
    summer.position.z = 0;
    summer.position.x = 5.91;
    summer.rotation.y = -Math.PI * 0.5;
    summer.name = "jourEte"

    const springGeometry = new THREE.PlaneGeometry(3.5, 2.5, 1, 1);
    const springMaterial = new THREE.MeshBasicMaterial({
        // Add the texture to the material
        map: springTexture,
    });

    const spring = new THREE.Mesh(springGeometry, springMaterial);
    spring.position.y = 0.8;
    spring.position.z = 5.91;
    spring.position.x = -0.3;
    spring.rotation.y = -Math.PI * 1;
    spring.name = "springtime"

    const pictures = [winter, autumn, summer, spring]
    scene.add(winter, autumn, summer, spring);


    // Initialisation de la caméra
    camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100)

    // Initialisation du point du lumière
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);
    const aLight = new THREE.AmbientLight(0x404040);
    scene.add(aLight);

    // Ici on vise a rendre la scène 3D, comme un rendu sur Première mais en ThreeJS
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer)).classList.add("dispositifInteractif");
    document.addEventListener('click', onSelect);
    console.log(camera);


    function onSelect(select) {
        const pointer = new THREE.Vector2();
        pointer.set((select.clientX / width) * 2 - 1, - (select.clientY / height) * 2 + 1);

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(pictures, false);

        if (intersects.length > 0) {
            const intersect = intersects.find(intersect => intersect.object.name !== undefined)?.object.name;
            if (!intersect) return;

            console.log(intersect);

            const existingSprite = scene.getObjectByName('sprite');
            if (existingSprite) {

                scene.remove(existingSprite);
                return;
            }

            const result = allDatas.find(data => data.name === intersect);
            if (!result) return;

            const CARTEL = result.image;
            console.log(CARTEL);

            const map = new THREE.TextureLoader().load(CARTEL);
            const material = new THREE.SpriteMaterial({ map: map });

            const sprite = new THREE.Sprite(material);
            sprite.name = 'sprite';
            sprite.scale.set(0.5, 0.8).multiplyScalar(1 / 15);
            scene.add(sprite);


        }

    }

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize);
}

// Position de la caméra
camera.position.set(0, 0, 1);
camera.lookAt(0, 0, 0);
camera.up.set(0, 1, 0);


// Là, le code ajuste l'affichage en fonction de la taille de l'écran
function onWindowResize() {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    // renderer.setSize(width, height)
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
animate();

// const SPEAKER = './speaker.png';

// const map = new THREE.TextureLoader().load(SPEAKER);
// const material = new THREE.SpriteMaterial({ map: map });

// const spriteSpeaker = new THREE.Sprite(material);
// spriteSpeaker.name = 'speaker';
// spriteSpeaker.scale.set(1, 1, 1).multiplyScalar(1 / 8);
// spriteSpeaker.position.set(1, 1, 0)
// scene.add(spriteSpeaker);

// var sound = new Howl({
//     src: ['./sounds/goSolo.mp3'],
//     loop: true,
//     volume: 0.2,
// });

// var isPlaying = false;

// spriteSpeaker.addEventListener('click', () => {
//   if (!isPlaying) {
//     sound.play();
//     isPlaying = true;
//   }else{
//     sound.pause();
//   }
// });



// const sound = new Howl({
//     src: ['./sounds/goSolo.mp3'],
//     loop: true,
//     volume: 0.5
// });

// spriteSpeaker.addEventListener('click', () => {
//     if (speaker.classList.contains('unmute')) {
//         speaker.classList.remove('unmute');
//         sound.pause()
//         console.log('muted');
//     } else {
//         speaker.classList.add('unmute');
//         sound.play();
//         console.log('unmuted');
//     }
// });
