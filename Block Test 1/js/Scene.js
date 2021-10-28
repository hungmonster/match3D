import * as THREE from "../lib/Three.js";

import { OrbitControls } from "../lib/OrbitControls.js";

import { GLTFLoader } from "../lib/GLTFLoader.js";
import { DragControls } from "../lib/DragControl.js";

let controls, group;
var width, height, checkOrientation;
let scene, renderer, camera, stats;
let model, skeleton, mixer, clock;
const objects = [];
const crossFadeControls = [];
let enableSelection = false;
let model3D = null;
const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
init();
function init() {
    const container = document.getElementById("container");
    width = window.innerWidth;
    height = window.innerHeight;

    $("#choose")
        .append("<img src=" + textChooseB64 + '  style="width: 70%; display: flex; margin: auto; margin-top: 1em;"  />')
        .appendTo("#choose");
    $("#1")
        .append("<img src=" + model1IconB64 + " />")
        .appendTo("#1");
    $("#2")
        .append("<img src=" + model2IconB64 + " />")
        .appendTo("#2");
    $("#3")
        .append("<img src=" + model3IconB64 + " />")
        .appendTo("#3");
    $("#4")
        .append("<img src=" + model1IconB64 + " />")
        .appendTo("#4");
    $("#5")
        .append("<img src=" + model2IconB64 + " />")
        .appendTo("#5");
    $("#6")
        .append("<img src=" + model3IconB64 + " />")
        .appendTo("#6");
    $("#7")
        .append("<img src=" + model1IconB64 + " />")
        .appendTo("#7");

    if (window.innerHeight > window.innerWidth) {
        checkOrientation = "poit";
        $("img").addClass("resizeImg");
        $(".card-carousel").removeAttr("style");
        $(".card-carousel").css("width", "600px");
        $(".card-carousel").css("height", "140px");
        $(".card-carousel").css("display", "flex");
        $(".my-card").removeAttr("style");
        $(".my-card").css("width", "50%");
        $(".my-card").css("margin-top", "0.5em");
        $("#container").css("background-image", "url(" + areaPoitrailB64 + ")");
        $("#container").addClass("backgroundPoitrait");
        $("#slideContainer").addClass("containerPoit");
        $("#startBtn")
            .append("<img src=" + startBtnB64 + ' class="startPoitrailBtn"/>')
            .appendTo("#startBtn");
        $(".startPoitrailBtn").css("left", 0);
    } else {
        $("#downloadBtn")
            .append('<img style="width: 80%" src=' + iconB64 + " />")
            .append('<img id="downloadIcon" style="margin-top: 7px; width:80%" src=' + downloadB64 + " />")
            .appendTo("#downloadBtn");
        checkOrientation = "land";
        $(".card-carousel").removeAttr("style");
        $(".card-carousel").css("width", "auto");
        $(".card-carousel").css("display", "grid");
        $(".my-card").removeAttr("style");
        $(".my-card").css("width", "100%");
        $(".my-card").css("margin-top", "-1em");
        $("#gameSection").addClass("gameSection");
        $("#container").css("background-image", "url(" + areaLandscapeB64 + ")");
        $("#container").addClass("backgroundLandscape");
        $("#slideContainer").addClass("containerLand");
        $("#startBtn")
            .append("<img src=" + startBtnB64 + ' class="startLandScapeBtn"/>')
            .appendTo("#startBtn");
        $(".startLandScapeBtn").css("left", $("#gameSection").width() / 3);
    }

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(10, 10, 10);

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = null;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(30, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-2.358, 5.837, 8.641);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enablePan = true;
    // controls.enableZoom = true;
    // controls.target.set(0, 1, 0);
    // controls.update();

    window.addEventListener("resize", onWindowResize);
    window.onorientationchange = function (event) {
        if (event.target.screen.orientation.angle == 0) {
            model3D.position.set(0, 0.5, 0);
            $("img").addClass("resizeImg");
            $(".card-carousel").removeAttr("style");
            $(".card-carousel").css("width", "600px");
            $(".card-carousel").css("height", "140px");
            $(".card-carousel").css("display", "flex");
            $(".my-card").removeAttr("style");
            $(".my-card").css("width", "50%");
            $(".my-card").css("margin-top", "0.5em");
            $("#gameSection").removeClass("gameSection");
            $("#container").addClass("backgroundPoitrait");
            $("#container").removeClass("backgroundLandscape");
            $("#container").css("background-image", "url(" + areaPoitrailB64 + ")");
            $("#slideContainer").addClass("containerPoit");
            $("#slideContainer").removeClass("containerLand");
            $("#startBtn")
                .empty()
                .append("<img src=" + startBtnB64 + ' class="startPoitrailBtn"/>')
                .appendTo("#startBtn");
            $("#downloadBtn")
                .empty();
            $(".startPoitrailBtn").css("left", 0);
        } else {
            model3D.position.set(1, 0.5, 0);
            $("#downloadBtn")
                .append('<img style="width: 80%" src=' + iconB64 + " />")
                .append('<img id="downloadIcon" style="margin-top: 7px; width:80%" src=' + downloadB64 + " />")
                .appendTo("#downloadBtn");
            $("img").removeClass("resizeImg");
            $(".card-carousel").removeAttr("style");
            $(".card-carousel").css("width", "auto");
            $(".card-carousel").css("display", "grid");
            $(".my-card").removeAttr("style");
            $(".my-card").css("width", "100%");
            $(".my-card").css("margin-top", "-1em");
            $("#gameSection").addClass("gameSection");
            $("#container").addClass("backgroundLandscape");
            $("#container").removeClass("backgroundPoitrait");
            $("#container").css("background-image", "url(" + areaLandscapeB64 + ")");
            $("#slideContainer").addClass("containerLand");
            $("#slideContainer").removeClass("containerPoit");
            $("#startBtn")
                .empty()
                .append("<img src=" + startBtnB64 + ' class="startLandScapeBtn""/>')
                .appendTo("#startBtn");
            $(".startLandScapeBtn").css("left", $("#gameSection").width() / 1.35);
        }
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    };
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    controls = new DragControls([...objects], camera, renderer.domElement);
    controls.addEventListener('drag', render);
    slide();
    loadModel(1);

    document.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

}

function onWindowResize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

function animate() {
    // Render loop
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    // mixer.update(delta);
    render();
}

function render() {
    renderer.render(scene, camera);
}

function slide() {
    var num = $(".my-card").length;
    var even = num / 2;
    var odd = (num + 1) / 2;
    let idModel = $(".active").attr("id");
    if (num % 2 == 0) {
        $(".my-card:nth-child(" + even + ")").addClass("active");
        $(".my-card:nth-child(" + even + ")")
            .prev()
            .addClass("prev");
        $(".my-card:nth-child(" + even + ")")
            .next()
            .addClass("next");
        loadModel(idModel);
    } else {
        $(".my-card:nth-child(" + odd + ")").addClass("active");
        $(".my-card:nth-child(" + odd + ")")
            .prev()
            .addClass("prev");
        $(".my-card:nth-child(" + odd + ")")
            .next()
            .addClass("next");
        loadModel(idModel);
    }

    $(".my-card").click(function () {
        var slideWidth = $(".active").width();
        var slideHeight = $(".active").height();
        if (window.innerHeight > window.innerWidth) {
            if ($(this).hasClass("next")) {
                $(".card-carousel")
                    .stop(false, true)
                    .animate({ left: "-=" + slideWidth });
            } else if ($(this).hasClass("prev")) {
                $(".card-carousel")
                    .stop(false, true)
                    .animate({ left: "+=" + slideWidth });
            }
        } else {
            if ($(this).hasClass("next")) {
                $(".card-carousel")
                    .stop(false, true)
                    .animate({ top: "-=" + slideHeight });
            } else if ($(this).hasClass("prev")) {
                $(".card-carousel")
                    .stop(false, true)
                    .animate({ top: "+=" + slideHeight });
            }
        }

        $(this).removeClass("prev next");
        $(this).siblings().removeClass("prev active next");

        $(this).addClass("active");
        $(this).prev().addClass("prev");
        $(this).next().addClass("next");
        let idModel = $(".active").attr("id");
        if (idModel == 1) {
            loadModel(idModel);
        } else if (idModel == 2) {
            loadModel(idModel);
        } else if (idModel == 3) {
            loadModel(idModel);
        } else if (idModel == 4) {
            loadModel(idModel);
        } else if (idModel == 5) {
            loadModel(idModel);
        } else if (idModel == 6) {
            loadModel(idModel);
        } else if (idModel == 7) {
            loadModel(idModel);
        }
    });
}

function onClick(event) {

    event.preventDefault();
    console.log(enableSelection);
    if (enableSelection === true) {

        const draggableObjects = controls.getObjects();
        draggableObjects.length = 0;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersections = raycaster.intersectObjects(objects, true);

        if (intersections.length > 0) {

            const object = intersections[0].object;

            if (group.children.includes(object) === true) {

                object.material.emissive.set(0x000000);
                scene.attach(object);

            } else {

                object.material.emissive.set(0xaaaaaa);
                group.attach(object);

            }

            controls.transformGroup = true;
            draggableObjects.push(group);

        }

        if (group.children.length === 0) {

            controls.transformGroup = false;
            draggableObjects.push(...objects);

        }

    }

    // render();

}


function onKeyDown(event) {

    enableSelection = (event.keyCode === 16) ? true : false;

}

function onKeyUp() {

    enableSelection = false;

}

function loadModel(idModel) {
    const loader1 = new GLTFLoader();
    if (model3D != null) {
        scene.remove(model3D);
    }
    var jsonString = JSON.stringify(model1);
    if (idModel == 1 || idModel == 4 || idModel == 7) {
        jsonString = JSON.stringify(model1);
    } else if (idModel == 2 || idModel == 5) {
        jsonString = JSON.stringify(model2);
    } else if (idModel == 3 || idModel == 6) {
        jsonString = JSON.stringify(model3);
    }
    loader1.parse(
        jsonString,
        "",
        function (gltf) {
            model3D = gltf.scene;
            if (window.innerHeight > window.innerWidth) {
                model3D.position.set(0, 0.5, 0);
            } else {
                model3D.position.set(1, 0.5, 0);
            }
            model3D.scale.set(1, 1, 1);
            scene.add(model3D);

            objects.push(model3D);
            animate();
            // mixer = new THREE.AnimationMixer(model3D);
            // mixer.clipAction(gltf.animations[0]).play();

        },
        undefined,
        function (e) {
            console.error(e);
        }
    );
}
