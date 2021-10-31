import * as THREE from "../lib/Three.js";
import { OrbitControls } from "../lib/OrbitControls.js";
import { GLTFLoader } from "../lib/GLTFLoader.js";
import "./../lib/cannon.js"
import CannonDebugRenderer from "./../utils/CannonDebugRenderer.js";
import * as CannonUtils from "./../utils/CannonUtils.js";
var width, height;
var scene, renderer, camera, mesh;
var model3D = null;
var position;
let monkeyMeshes = [];
let monkeyBodies = [];
let monkeyLoaded = false;
var world;

function init() {
    const container = document.getElementById("container");
    width = window.innerWidth;
    height = window.innerHeight;
    //clear scene
    scene = new THREE.Scene();
    scene.background = null;

    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);


    position = new THREE.Vector3();
    //set camera
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000000);
    camera.position.set(0, 5000, 0);

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
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);

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
        // Copy coordinates from Cannon.js to Three.js
        if (monkeyLoaded) {
            monkeyMeshes.forEach((m, i) => {
                m.position.set(
                    monkeyBodies[i].position.x,
                    monkeyBodies[i].position.y,
                    monkeyBodies[i].position.z
                );
                m.quaternion.set(
                    monkeyBodies[i].quaternion.x,
                    monkeyBodies[i].quaternion.y,
                    monkeyBodies[i].quaternion.z,
                    monkeyBodies[i].quaternion.w
                );
            });
        }
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
                let monkeyMesh;
                let monkeyCollisionMesh;
                model3D = gltf.scene;
                model3D.scale.set(100, 100, 100);
                model3D.position.set(Math.random() - 0.5, 100, Math.random() - 0.5);
                //đổ bóng
                model3D.castShadow = true;
                model3D.traverse(function (model) {
                    if (model.isMesh) {
                        model.castShadow = true;
                    }
                    monkeyMesh = model;
                    monkeyCollisionMesh = model;
                });
                var monkeyMeshClone = monkeyMesh.clone();
                monkeyMeshClone.position.x = Math.floor(Math.random() * 10) - 5;
                monkeyMeshClone.position.z = Math.floor(Math.random() * 10) - 5;
                monkeyMeshClone.position.y = 5 + 1;
                scene.add(monkeyMeshClone);
                monkeyMeshes.push(monkeyMeshClone);
                console.log(monkeyCollisionMesh);
                var monkeyShape = CannonUtils.CreateConvexPolyhedron(monkeyCollisionMesh.geometry);
                var monkeyBody = new CANNON.Body({ mass: 1 });
                monkeyBody.addShape(monkeyShape);
                monkeyBody.position.x = monkeyMeshClone.position.x;
                monkeyBody.position.y = monkeyMeshClone.position.y;
                monkeyBody.position.z = monkeyMeshClone.position.z;
                world.addBody(monkeyBody);
                monkeyBodies.push(monkeyBody);
                monkeyLoaded = true;
                scene.add(model3D);
            },
            undefined,
            function (e) {
                console.error(e);
            }
        );
    })
}
// https://codesandbox.io/s/fcfz2?file=/src/client/client.ts