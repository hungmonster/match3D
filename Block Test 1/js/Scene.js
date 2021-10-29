import * as THREE from "../lib/Three.js";
import { OrbitControls } from "../lib/OrbitControls.js";
import { GLTFLoader } from "../lib/GLTFLoader.js";

import { OimoPhysics } from '../lib/Oimo.min.js';

var width, height;
var scene, renderer, camera, mesh, mixer;
var model3D = null;
var physics, position;

async function init() {
    const container = document.getElementById("container");
    width = window.innerWidth;
    height = window.innerHeight;
    
    physics = await OimoPhysics();
    position = new THREE.Vector3();
    //set camera
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000000);
    camera.position.set(0, 5000, 0);
    //clear scene
    scene = new THREE.Scene();
    scene.background = null;

    //add light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 180;
    directionalLight.shadow.camera.bottom = - 100;
    directionalLight.shadow.camera.left = - 120;
    directionalLight.shadow.camera.right = 120;
    scene.add(directionalLight);

    //add ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    physics.addMesh(ground);

    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.target.set(0, 1, 0);
    controls.update();

    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    function animate() {
        // Render loop
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    loadModel(1);
    animate();
}
init();
function loadModel(idModel) {
    const loader1 = new GLTFLoader();
    if (model3D != null) {
        scene.remove(model3D);
    }
    console.log(objList);
    objList.map((obj) => {
        var jsonString = JSON.stringify(obj.data);
        loader1.parse(
            jsonString,
            "",
            function (gltf) {
                model3D = gltf.scene;
                model3D.scale.set(100, 100, 100);
                model3D.position.set(Math.random() - 0.5, 100, Math.random() - 0.5);
                const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                mesh = new THREE.Mesh(model3D, material);
                mesh.position.y = 25;
                //đổ bóng
                model3D.castShadow = true;
                model3D.traverse(function (object) {
                    if (object.isMesh) object.castShadow = true;
                });
                scene.add(model3D);
                physics.addMesh( model3D, 1 );
                mixer = new THREE.AnimationMixer(model3D);
                // mixer.clipAction(gltf.animations[0]).play()
            },
            undefined,
            function (e) {
                console.error(e);
            }
        );
    })
}
// https://github.com/mrdoob/three.js/blob/master/examples/physics_oimo_instancing.html