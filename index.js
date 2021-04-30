// import * as THREE from "./three.js/build/three.js";
import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "./three.js/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "./three.js/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "./three.js/examples/jsm/controls/DragControls.js";
import Stats from "./three.js/examples/jsm/libs/stats.module.js";
// import { RectAreaLightUniformsLib } from "./jsm/lights/RectAreaLightUniformsLib.js";
// import { Clock } from "../src/core/Clock.js";
// // помощники
// import { GUI } from "https://threejsfundamentals.org/threejs/../3rdparty/dat.gui.module.js";
// import { RectAreaLightHelper } from "./jsm/helpers/RectAreaLightHelper.js";

// global variables
let selectedModel; //  модель для манипуляций
let mouse, textureLoader, texture, stats;
let nextObj = choiсeModels.models[0]; // на какой объект будет изменена модель
let currentObj;
let coord;
let cameraPersp, gltfLoader;
var p = 0;
var objects = [];
// показатели вращения камеры
let angle, angularSpeed, delta, radius, clock;
let scene, renderer, mesh2, orbit, cube, chair;
let control, controls, controlsDrag;
let statsStatus = false;
let statusCamera = {
  rotate: false,
  // lookAt:
};
// все о текстурах

// для проверки на пересечение

var MovingCube;
var collidableMeshList = [];
var keyboard = new THREEx.KeyboardState();
var raycaster = new THREE.Raycaster();

// тестовые варианты переменных
var geometry, geometry2, material, material1, mesh;

var SELECTEDOBJECT,
  lastPosition,
  collideStatus = false;
var controledObject;
var a;

var productGroup1 = new THREE.Group();
var productGroup2 = new THREE.Group();

var productGroup1Box3 = new THREE.Box3();
var productGroup2Box3 = new THREE.Box3();

var productGroup1LastPosition = new THREE.Vector3();
var productGroup2LastPosition = new THREE.Vector3();

let dragCollections = [];

function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, "x", -1000, 1000).onChange(onChangeFn);
  folder.add(vector3, "y", -1000, 1000).onChange(onChangeFn);
  folder.add(vector3, "z", -1000, 1000).onChange(onChangeFn);
  folder.open();
}

main(); // main из примера

function main() {
  initM();
  animate();
}

function initM() {
  initScene(); // +
  initLights(); // +
  initCamera(); // +
  initRenderer(); // +
  initControls(); // +
  initLoaders(); // загрузчики

  loadOneModel();
  loadOneModel2();
  // initTestedControlCUbes();

  // initWalsCubes();
  // createcontainer( 0, 0, 1, 2, 1, 1 );
  // loadModel();

  // initDragControls();

  // initRaycaster(); // +
  initFloor();
  // initCircleFloor();
  // initFigures(); // куб с текстурой и просто куб

  // loadTexture();

  initEventListeners(); // +
  canvas.appendChild(renderer.domElement);
}

function createcontainer(posX, posY, posZ, length, height, width) {
  // Create the container.
  var geometry = new THREE.BoxGeometry(length, height, width); // 0x000000, 0
  var material = new THREE.MeshBasicMaterial({ color: 0x000000 });
  var container = new THREE.Mesh(geometry, material);

  scene.add(container);
  objects.push(container);
  container.name = "container" + p;
  var positiony = posY + 0.1 + height / 2;
  var positionx = posX + 0.1 + length / 2;
  var positionZ = posZ + 0.1 + width / 2;
  container.position.set(positionx, positiony, positionZ);
  p = p + 1;
  container.userData.currentPosition = new THREE.Vector3();
}

const getTexture = (elem) => {
  texture = textureLoader.load("./img/textures/scine.jpg");
  texture.flipY = false;
  elem.traverse((o) => {
    if (o.isMesh) {
      o.material.map = texture;
    }
  });
};

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}
function initLoaders() {
  gltfLoader = new GLTFLoader();
  textureLoader = new THREE.TextureLoader();
}
const initCurrent = (elem) => {
  currentObj = elem;
};
function initClick(elem) {
  const domEvents = new THREEx.DomEvents(cameraPersp, renderer.domElement);
  domEvents.addEventListener(elem, "click", (event) => {
    console.log("click", event);
    initCurrent(elem);
    changeModel(currentObj, nextObj);

    // clickedElem.material.color.setRGB(0.8 * Math.random() + 0.2, 0, 0);
    // material.wireFrame =true;
  });
}

function changeModel(prevModel, nextModel) {
  gltfLoader.load(`${nextModel.url}`, (gltf) => {
    let root = gltf.scene;
    root.position.x = prevModel.position.x;
    root.position.y = prevModel.position.y;
    root.position.z = prevModel.position.z;
    root.rotation.y = nextModel.rotateY;
    getTexture(root);
    scene.add(root);
    scene.remove(currentObj);
  });
}
let testedModel;
function loadOneModel(model) {
  let root;
  gltfLoader.load("./img/models/chair_03_red.glb", (gltf) => {
    root = gltf.scene;
    root.position.set(0, 0, 0);
    // clickedElem = root;
    // testedModel = root;
    // root.userData.info = "dsdsdsd";
    // productGroup1.position.set(0,0,0);
    // productGroup1.add(root);
    scene.add(root);
    dragCollections.push(root);

  
    root.userData.currentPosition = new THREE.Vector3();
    addTransformControl(root);
    // initClick(elem);
  });
  // return root;
}
function loadOneModel2(el) {
  let root;
  gltfLoader.load("./img/models/chair_04_bezh.glb", (gltf) => {
    root = gltf.scene;
    root.position.set(0, 0, 2);
    // clickedElem = root;
    // testedModel = root;
    // root.userData.info = "dsdsdsd";
    // productGroup1.position.set(0,0,0);
    // productGroup1.add(root);
    scene.add(root);
    dragCollections.push(root);

    root.userData.currentPosition = new THREE.Vector3();
    addTransformControl(root);
    // initClick(elem);
  });
}

function loadModel() {
  dataJson.models.forEach((model) => {
    gltfLoader.load(`${model.url}`, (gltf) => {
      let root = gltf.scene;
      root.position.x = model.coordinatesX;
      root.position.y = model.coordinatesY;
      root.position.z = model.coordinatesZ;
      root.rotation.y = model.rotateY;

      root.userData.currentPosition = new THREE.Vector3();
      scene.add(root);
      // addTransformControl(root);
      // objects.push(root);
      // initClick(root);
    });
  });
}

function initTestedControlCUbes() {
  geometry = new THREE.BoxGeometry(1, 1, 1);
  material = new THREE.MeshNormalMaterial();
  material1 = new THREE.MeshNormalMaterial();
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var meshUp = new THREE.Mesh(geometry, material);
  var meshdown = new THREE.Mesh(geometry, material);
  meshUp.position.set(0, 1, 0);
  // meshdown.position.set(0, 0, 0);

  // productGroup1.add(loadOneModel());
  // productGroup1.add(meshUp);

  // scene.add(productGroup1);

  dragCollections.push(productGroup1);
  // console.log(dragCollections, ' collection')

  productGroup1Box3.setFromObject(productGroup1);
  productGroup1LastPosition.copy(productGroup1.position);

  var meshUp = new THREE.Mesh(geometry, material);
  var meshdown = new THREE.Mesh(geometry, material);
  meshUp.position.set(0, 1, 0);
  meshdown.position.set(0, 0, 0);
  productGroup2.add(meshUp, meshdown);
  productGroup2.position.set(0, 0, 2);
  // scene.add(productGroup2);

  dragCollections.push(productGroup2);

  productGroup2Box3.setFromObject(productGroup2);
  productGroup2LastPosition.copy(productGroup2.position);

  orbit = new OrbitControls(cameraPersp, renderer.domElement);
  orbit.addEventListener("change", render);

  // addTransformControl(productGroup1);
  // addTransformControl(productGroup2);
}

// addTransformControl(testedModel);

function addTransformControl(el) {
  control = new TransformControls(cameraPersp, renderer.domElement);

  control.addEventListener("change", render);

  control.addEventListener("dragging-changed", onDraginigchange, false);

  control.addEventListener("objectChange", 
  function (el) {
    isCollision(el, dragCollections);
  
    el.target.children[0].object.userData.currentPosition.copy(el.target.children[0].object.position);

  function isCollision(el, mas) {
    for (var i = 0; i < mas.length; i++) {
      if (el.target.children[0].object != mas[i]) {
        var firstObject = el.target.children[0].object;

        var secondObject = mas[i];
        // рисуем рамку
        var firstBB = new THREE.Box3().setFromObject(firstObject);
        var secondBB = new THREE.Box3().setFromObject(secondObject);
        // проверка на пересечение
        var collision = firstBB.intersectsBox(secondBB);

        if (collision) {
          el.target.children[0].object.position.copy(el.target.children[0].object.userData.currentPosition)

        }
      }
    }
  }
}, false);


  // window.addEventListener("wheel", onWheel, false);

  control.showY = false; // это для движения тоолько по осям
  scene.add(control);
  scene.add(el);
  control.attach(el);
}

function onWheel() {
  orbit.enableZoom = false;
}

var aabb1 = new THREE.Box3();
var aabb2 = new THREE.Box3();

// проверка на совп
function boxIsCollised(el) {
  // console.log(el.target.children[0].object.userData, ' рамка ');

  aabb1.copy(productGroup1Box3).applyMatrix4(productGroup1.matrixWorld);
  aabb2.copy(productGroup1Box3).applyMatrix4(productGroup2.matrixWorld);

  // console.log(aabb1.intersectsBox( aabb2 ));
  if (aabb1.intersectsBox(aabb2) === true) {
    productGroup1.position.copy(productGroup1LastPosition);
    productGroup2.position.copy(productGroup2LastPosition);
  } else {
    console.log(" не совп");
    productGroup1LastPosition.copy(productGroup1.position);
    productGroup2LastPosition.copy(productGroup2.position);
  }

  // isCollision(event.object, dragCollections);
  //   event.object.userData.currentPosition.copy(event.dragCollections.position);

  // function isCollision(obj, mas) {
  //   for (var i = 0; i < mas.length; i++) {
  //     if (event.object != mas[i]) {
  //       var firstObject = event.object;

  //       var secondObject = mas[i];
  //       // рисуем рамку
  //       var firstBB = new THREE.Box3().setFromObject(firstObject);
  //       var secondBB = new THREE.Box3().setFromObject(secondObject);
  //       // проверка на пересечение
  //       var collision = firstBB.intersectsBox(secondBB);

  //       if (collision) {
  //         event.object.position.copy(event.object.userData.currentPosition);
  //       }
  //     }
  //   }
  // }
}

function test(el) {
  console.log(el.target.children[0].object.userData);

  // check(el, dragCollections);
  // el.target.children[0].object.userData.currentPosition.copy(el.target.children[0].object.userData);

  // function check(obj, mas) {
  //   for (var i = 0; i < mas.length; i++) {
  //     if (el != mas[i]) {
  //       var firstObject = el;

  //       var secondObject = mas[i];
  //       // рисуем рамку
  //       var firstBB = new THREE.Box3().setFromObject(firstObject);
  //       var secondBB = new THREE.Box3().setFromObject(secondObject);
  //       // проверка на пересечение
  //       var collision = firstBB.intersectsBox(secondBB);

  //       if (collision) {
  //         el.position.copy(el.userData.currentPosition);
  //       }
  //     }
  //   }
  // }
}

function onDraginigchange(event) {
  orbit.enabled = !event.value;
}

var dragobjects = [];
var group, mesh, box, mesh22, group2, box2;
//add following code in init function
// var gltfobject = addChair();
var sofaTest = addSofa();
// addTransformControl(sofaTest);

// addTransformControl(gltfobject);

// scene.add(gltfobject);
// scene.add(sofaTest);
sofaTest.position.x = 3;

// позиция всего бокса всесте с дочерними
function drawBox(objectwidth, objectheight, objectdepth) {
  var geometry, material, box;
  geometry = new THREE.BoxGeometry(objectwidth, objectheight, objectdepth);
  material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.3,
    depthTest: false,
  });
  box = new THREE.Mesh(geometry, material);
  dragobjects.push(box);
  // box.position.set(0, 0, 0);
  return box;
}

function addChair() {
  group = new THREE.Group();
  var loader = new GLTFLoader();
  loader.load("./img/models/chair_02.glb", (gltf) => {
    mesh = gltf.scene;
    mesh.scale.set(1, 1, 1);

    var gltfbox = new THREE.Box3().setFromObject(mesh);
    const width = new THREE.Vector3();

    let size = gltfbox.getSize(width);
    var objectwidth = Math.floor(size.x);
    var objectheight = Math.floor(size.y);
    var objectdepth = Math.floor(size.z);
    objectwidth = objectwidth + parseInt(1);
    objectheight = objectheight + parseInt(1);
    objectdepth = objectdepth + parseInt(1);

    mesh.position.set(0, -objectheight / 2, 0);
    box = drawBox(objectwidth, objectheight, objectdepth);
    group.add(box);
    group.name = "quadrant";
    box.add(mesh);
    box.userData.movingOnly = "floor";
    //  box2.position.set(mesh22.position.x,mesh22.position.y, mesh22.position.z );
    box.userData.currentPosition = new THREE.Vector3();
    objects.push(box);
  });
  return group;
}
function addSofa() {
  group2 = new THREE.Group();
  var loader = new GLTFLoader();

  loader.load("./img/models/sofa_02.glb", (gltf) => {
    mesh22 = gltf.scene;
    // mesh22.scale.set(1, 1, 1);

    var gltfbox = new THREE.Box3().setFromObject(mesh22);
    const width = new THREE.Vector3();

    let size = gltfbox.getSize(width);
    var objectwidth = Math.floor(size.x);
    var objectheight = Math.floor(size.y);
    var objectdepth = Math.floor(size.z);
    objectwidth = objectwidth + parseInt(1);
    objectheight = objectheight + parseInt(1);
    objectdepth = objectdepth + parseInt(1);

    mesh22.position.set(0, -objectheight / 2, 0);
    box2 = drawBox(objectwidth, objectheight, objectdepth);
    group2.add(box2);
    group2.name = "quadrant";
    box2.userData.movingOnly = "wall";
    box2.userData.needPosition = -objectheight / 2;
    box2.add(mesh22);
    //  box2.position.set(mesh22.position.x,mesh22.position.y, mesh22.position.z );

    box2.userData.currentPosition = new THREE.Vector3();
    objects.push(box2);
  });
  return group2;
}
function initDragControls() {
  var dragControls = new DragControls(
    objects,
    cameraPersp,
    renderer.domElement
  );

  dragControls.addEventListener("drag", function (event) {
    isCollision(event.object, objects);

    event.object.userData.currentPosition.copy(event.object.position);

    function isCollision(obj, mas) {
      for (var i = 0; i < mas.length; i++) {
        if (event.object != mas[i]) {
          var firstObject = event.object;

          var secondObject = mas[i];
          // рисуем рамку
          var firstBB = new THREE.Box3().setFromObject(firstObject);
          var secondBB = new THREE.Box3().setFromObject(secondObject);
          // проверка на пересечение
          var collision = firstBB.intersectsBox(secondBB);

          if (collision) {
            event.object.position.copy(event.object.userData.currentPosition);
          }
        }
      }
    }
    if (event.object.userData.movingOnly === "floor") {
      // console.log(event.object)
      event.object.position.y = 1;
    }
    if (event.object.userData.movingOnly === "wall") {
      event.object.position.x = -2;
    }
  });

  dragControls.addEventListener("dragstart", function (event) {
    // console.log( 'new position ' + event.object.position.x );
    orbit.enabled = false;
  });

  dragControls.addEventListener("dragend", function (event) {
    orbit.enabled = true;
  });
}

function initControls() {
  stats = new Stats();
  orbit = new OrbitControls(cameraPersp, renderer.domElement);
  orbit.update();
  orbit.addEventListener("change", render);
  // контроллеры для ящика
  control = new TransformControls(cameraPersp, renderer.domElement);

  control.addEventListener("change", render);
  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });
  control.addEventListener(
    "objectChange",
    (event) => boxIsCollised(event),
    false
  );
  var axes = new THREE.AxesHelper(1000); //to view x y z axis
  // scene.add(axes); // линии осей
  // control.attach(sofaTest);
  scene.add(control);
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // console.log(" resize ");
  render();
}

// свет
function initLights() {
  // прямой свет
  const directionalLight = (color, intensity) => {
    // const color = 0xffffff;
    // const intensity = 1.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 5, 0);
    light.target.position.set(0, 1, 0);
    scene.add(light);
    scene.add(light.target);

    const helper = new THREE.DirectionalLightHelper(light);
    // scene.add(helper);
    function updateLight() {
      light.target.updateMatrixWorld();
      helper.update();
    }
    updateLight();
  };
  // потолок
  const RectAreaLight = (color, intensity) => {
    // const color4 = 0x45f500;
    // const color4 = 0xffffff;
    // const color4 = "white";
    // const intensity4 = 4;
    const width4 = 8;
    const height4 = 8;
    const light4 = new THREE.RectAreaLight(color, intensity, width4, height4);
    light4.position.set(0, 5, 0);
    light4.rotation.y = THREE.MathUtils.degToRad(-180);
    light4.rotation.x = THREE.MathUtils.degToRad(90);
    scene.add(light4);

    const helper = new RectAreaLightHelper(light4);
    light4.add(helper);
  };
  const RectLightLeft = (color, intensity) => {
    const width = 8;
    const height = 5;
    const light = new THREE.RectAreaLight(color, intensity, width, height);
    light.position.set(-2.5, 2, 0);
    light.rotation.y = THREE.MathUtils.degToRad(-90);
    scene.add(light);
    const helper = new RectAreaLightHelper(light);
    // light.add(helper);
  };
  const RectLightRight = (color, intensity) => {
    const width = 8;
    const height = 5;
    const light = new THREE.RectAreaLight(color, intensity, width, height);
    light.position.set(3, 2, 0);
    light.rotation.y = THREE.MathUtils.degToRad(90);
    scene.add(light);
    const helper = new RectAreaLightHelper(light);
    // light.add(helper);
  };

  const RectLightFront = (color, intensity) => {
    const width = 8;
    const height = 5;
    const light = new THREE.RectAreaLight(color, intensity, width, height);
    light.position.set(0, 0, -3);
    light.rotation.y = THREE.MathUtils.degToRad(-180);
    scene.add(light);
    const helper = new RectAreaLightHelper(light);
    // light.add(helper);
  };

  const RectLightBack = (color, intensity) => {
    const width = 6;
    const height = 4;
    const light = new THREE.RectAreaLight(color, intensity, width, height);
    light.position.set(0, 2, 3);
    // light.rotation.y = THREE.MathUtils.degToRad(-180);
    scene.add(light);
    const helper = new RectAreaLightHelper(light);
    // light.add(helper);
  };

  // RectLightFront("white", 4);
  directionalLight("white", 1);
  // RectAreaLight('white', 8);
  // RectLightLeft("white", 4);
  // RectLightRight("white", 3);
  // RectLightBack("white", 3);

  // const gui = new GUI();
  // gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
  // gui.add(light, "intensity", 0, 2, 0.01);

  // makeXYZGUI(gui, light.position, "position", updateLight);
  // makeXYZGUI(gui, light.target.position, "target", updateLight);
}

function initCamera() {
  clock = new THREE.Clock();
  angle = 2;
  angularSpeed = THREE.Math.degToRad(18);
  delta = 0;
  radius = 3;
  cameraPersp = new THREE.PerspectiveCamera(
    95,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  cameraPersp.position.set(0, 5, 3);
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // хз што это
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSort = true;
}

function initFigures() {
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry3 = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const material3 = new THREE.MeshBasicMaterial({ color: 0x46ff0 }); // greenish blue

  const cube2 = new THREE.Mesh(geometry3, material3);
  // clickedElem = cube2;
  scene.add(cube2);

  control = new TransformControls(cameraPersp, renderer.domElement);
  control.addEventListener("change", render);

  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });

  control.attach(cube2);
  scene.add(control);

  const geometry6 = new THREE.BoxGeometry(2, 2, 3);
  const geometry1 = new THREE.BoxGeometry(2, 2, 3);
  // const blueCube = new THREE.BoxGeometry(2, 2, 3);
  const material6 = new THREE.MeshBasicMaterial({ color: 0x1a8 }); // greenish blue

  const cube6 = new THREE.Mesh(geometry1, material6);
  cube6.position.x = 4;

  scene.add(cube6);

  // контроллеры для ящика

  // compute the box that contains all the stuff
  // from root and below
  const box = new THREE.Box3().setFromObject(cube6);
  const boxSize = box.getSize(new THREE.Vector3()).length();
  const boxCenter = box.getCenter(new THREE.Vector3());

  // set the camera to frame the box
  // frameArea(boxSize * 2, boxSize, boxCenter, cameraPersp);
  control = new TransformControls(cameraPersp, renderer.domElement);
  control.addEventListener("change", render);

  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });
  // update the Trackball controls to handle the new size
  // controls.maxDistance = boxSize * 10;
  // controls.target.copy(boxCenter);
  // controls.update();
  // control.attach(cube6);
  // scene.add(control);

  // mesh2 = new THREE.Mesh(geometry2, new THREE.MeshNormalMaterial());
}

function initFloor() {
  const texture = new THREE.TextureLoader().load(
    "./img/textures/seamless-wood-texture-hardwood-floor-texture_123766-126.jpg",
    render
  );

  const material = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
  });

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // texture.scale=22;
  const timesToRepeatHorizontally = 3;
  const timesToRepeatVertically = 3;
  texture.rotation = THREE.MathUtils.degToRad(90);
  texture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);

  var floorGeometry = new THREE.PlaneGeometry(8, 8);
  var floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3f3f3f }); //color: 0x3f3f3f
  var floor = new THREE.Mesh(floorGeometry, material);
  floor.receiveShadow = true;
  floor.rotation.x = -0.5 * Math.PI;
  floor.position.x = 0;
  floor.position.y = 0;
  floor.position.z = 0;
  scene.add(floor);
}

function initCircleFloor() {
  const texture = new THREE.TextureLoader().load(
    "../../../img/textures/ed04190d14a450515e8d0124a6297ee9.jpg",
    render
  );

  const material = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // texture.scale=22;
  const timesToRepeatHorizontally = 4;
  const timesToRepeatVertically = 1;
  texture.rotation = THREE.MathUtils.degToRad(90);
  texture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);

  var radius = 3;
  var segments = 102; //<-- Increase or decrease for more resolution I guess

  var circleGeometry = new THREE.CircleGeometry(radius, segments);
  var circle = new THREE.Mesh(circleGeometry, material);
  circle.position.set(0, 0, 0);
  circle.rotation.x = -Math.PI / 2;
  scene.add(circle);
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x657d83);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function initEventListeners() {
  mouse = new THREE.Vector2();
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onMouseMove, false);
  onWindowResize();
}

function animate() {
  if (statusCamera.rotate) {
    delta = clock.getDelta();
    cameraPersp.position.x = Math.cos(angle) * radius;
    cameraPersp.position.z = Math.sin(angle) * radius;
    angle += angularSpeed * delta;
  }

  cameraPersp.lookAt(0, 0, 0); // вокруг чего крутится камера?
  requestAnimationFrame(animate);

  render();
  stats.update();
  // console.log(" animate");
}

function render() {
  renderer.render(scene, cameraPersp);
}

scene.add(new THREE.GridHelper(10, 10, 0x888888, 0x444444)); // сетка пола

btnDelete.addEventListener("click", () => deleteModel());
btnChangeTexture.addEventListener("click", () => changeTexture());
btnProductivity.addEventListener("click", () => getProductivity());
btnRotateCamera.addEventListener("click", getRotateCamera);

function getRotateCamera() {
  statusCamera.rotate = !statusCamera.rotate;
}

function deleteModel() {
  console.log(" del ");
}
function changeTexture() {
  console.log(" changeTexture ");
}
function getProductivity() {
  if (!statsStatus) {
    stats.showPanel(1);
    canvas.appendChild(stats.dom);
  } else {
    canvas.removeChild(stats.dom);
  }
  statsStatus = !statsStatus;
}
