import * as THREE from "../lib/Three.js";
import { OrbitControls } from "../lib/OrbitControls.js";
import { GLTFLoader } from "../lib/GLTFLoader.js";
import "./../lib/cannon.js"
import CannonDebugRenderer from "./../utils/CannonDebugRenderer.js";
import CannonUtils from "./../utils/CannonUtils.js";
import { DragControls } from "./../lib/DragControls.js";
var width, height;
var scene, renderer, camera, mesh;
var model3D = null;
var position;
let monkeyMeshes = [];
let monkeyBodies = [];
let monkeyLoaded = false;
var world;
var dragables = [];
init();
function init() {
    const container = document.getElementById("container");
    width = window.innerWidth;
    height = window.innerHeight;
    //clear scene
    scene = new THREE.Scene();
    scene.background = null;

    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    scene.add(new THREE.AxesHelper(5))

    //set camera
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 10, 0);

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
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement);

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enablePan = true;
    // controls.enableZoom = true;
    // controls.target.set(0, 1, 0);
    // controls.update();
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.screenSpacePanning = true;

    loadModel(1);
    const planeGeometry = new THREE.PlaneGeometry(25, 25)
    const planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
    planeMesh.rotateX(-Math.PI / 2)
    planeMesh.receiveShadow = true
    scene.add(planeMesh)
    const planeShape = new CANNON.Plane()
    const planeBody = new CANNON.Body({ mass: 0 })
    planeBody.addShape(planeShape)
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    world.addBody(planeBody)

    const clock = new THREE.Clock()
    window.addEventListener('resize', onWindowResize, false)
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    }
    // const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

    let draggingId = -1;
    const dragControls = new DragControls(dragables, camera, renderer.domElement);
    dragControls.addEventListener("dragstart", function (event) {
        console.log(event);
        draggingId = event.object.userData.i;
        orbitControls.enabled = false;
    });
    dragControls.addEventListener("dragend", function (event) {
        console.log(event);
        draggingId = -1;
        orbitControls.enabled = true;
    });

    function animate() {
        // Render loop
        // cannonDebugRenderer.update()
        requestAnimationFrame(animate);
        let delta = clock.getDelta();
        if (delta > 0.1) delta = 0.1;
        world.step(delta);
        if (monkeyLoaded) {
            monkeyMeshes.forEach((m, i) => {
                if (i !== draggingId) {
                    m.position.set(
                        monkeyBodies[i].position.x,
                        monkeyBodies[i].position.y,
                        monkeyBodies[i].position.z
                    )
                    m.quaternion.set(
                        monkeyBodies[i].quaternion.x,
                        monkeyBodies[i].quaternion.y,
                        monkeyBodies[i].quaternion.z,
                        monkeyBodies[i].quaternion.w
                    )
                } else {
                    monkeyBodies[i].position.x = m.position.x;
                    monkeyBodies[i].position.y = m.position.y;
                    monkeyBodies[i].position.z = m.position.z;
                    monkeyBodies[i].quaternion.x = m.quaternion.x;
                    monkeyBodies[i].quaternion.y = m.quaternion.y;
                    monkeyBodies[i].quaternion.z = m.quaternion.z;
                    monkeyBodies[i].quaternion.w = m.quaternion.w;
                    monkeyBodies[i].velocity.set(0, 10, 0);
                    monkeyBodies[i].angularVelocity.set(0, 0, 0);
                }
            })

            render()
        }
    }
    animate();
}
function render() {
    renderer.render(scene, camera);
}
function loadModel(idModel) {
    const gltfLoader = new GLTFLoader();
    objList.map((obj) => {
        var jsonString = JSON.stringify(obj.data);
        gltfLoader.parse(
            jsonString,
            "",
            (gltf) => {
                // let monkeyMesh;
                model3D = gltf.scene;
                model3D.scale.set(1, 1, 1);
                model3D.position.set(Math.random() - 0.5, 1, Math.random() - 0.5);
                //đổ bóng
                model3D.traverse(model => {
                    if (model.isMesh) {
                        model.castShadow = true;
                    }
                });

                for (let i = 0; i < 2; i++) {
                    const monkeyMeshClone = model3D.clone()
                    monkeyMeshClone.position.x = Math.floor(Math.random() * 10) - 5
                    monkeyMeshClone.position.z = Math.floor(Math.random() * 10) - 5
                    monkeyMeshClone.position.y = 5 + i
                    scene.add(monkeyMeshClone)
                    monkeyMeshes.push(monkeyMeshClone)
                    dragables.push(monkeyMeshClone)
                    const monkeyBody = new CANNON.Body({ mass: 1 })
                    monkeyBody.addShape(
                        new CANNON.Sphere(0.4),
                        new CANNON.Vec3(0, 0.2, 0)
                    ) // head,
                    // monkeyBody.addShape(
                    //     new CANNON.Sphere(0.05),
                    //     new CANNON.Vec3(0, -0.97, 0.46)
                    // ) // chin,
                    // monkeyBody.addShape(
                    //     new CANNON.Sphere(0.05),
                    //     new CANNON.Vec3(-1.36, 0.29, -0.5)
                    // ) //left ear
                    // monkeyBody.addShape(
                    //     new CANNON.Sphere(0.05),
                    //     new CANNON.Vec3(1.36, 0.29, -0.5)
                    // ) //right ear
                    monkeyBody.position.x = monkeyMeshClone.position.x
                    monkeyBody.position.y = monkeyMeshClone.position.y
                    monkeyBody.position.z = monkeyMeshClone.position.z
                    world.addBody(monkeyBody)
                    monkeyBodies.push(monkeyBody)
                }
                monkeyLoaded = true
                // scene.add(model3D);
            },
            undefined,
            (e) => {
                console.error(e);
            }
        );
    })
}
// https://codesandbox.io/s/fcfz2?file=/src/client/client.ts
