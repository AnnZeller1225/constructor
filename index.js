"use strict";
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

// все о сцене и мире
let scene, cameraPersp;
let mouse;
let renderer;
let control, controls, controlsDrag;

// показатели вращения камеры
let statusCamera = {
  rotate: false,
  // lookAt:
};
let angle, angularSpeed, delta, radius, clock;


// поомщники 
let stats, orbit;
let statsStatus = false;

// отклик на события
var keyboard = new THREEx.KeyboardState();
var raycaster = new THREE.Raycaster();

// загрузчики 
let textureLoader, gltfLoader, texture;

// манипуляции с моделью
let newModel = choiсeModels.models[0]; // на какой объект будет изменена модель
let checkCollisionModels = []; // массив всех объектов для пересечения 
let selectedModel; //  модель для манипуляций

main(); 

function main() {
  initM();
  animate();
}

function initM() {
  initScene(); // +
  initLights(); // +
  initCamera(); // +
  initRenderer(); // +
  initControls(); 
  initLoaders(); 

  loadOneModel();
  loadOneModel2();

  // combinePartsOfModel(); // это нужно
  // loadAllModel();
  // initDragControls();

  initFloor();
  // initCircleFloor();
  // initFigures(); // куб с текстурой и просто куб


  initEventListeners(); // +
  canvas.appendChild(renderer.domElement);
}
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x657d83);
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
  // чтото с тенями
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSort = true;
}



function initControls() {
  stats = new Stats();
  orbit = new OrbitControls(cameraPersp, renderer.domElement);
  orbit.update();
  orbit.addEventListener("change", render);

 

  var axes = new THREE.AxesHelper(1000); //to view x y z axis
  // scene.add(axes); // линии осей
  // control.attach(sofaTest);
  // scene.add(control);
}


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

function initClick(elem) {
  const domEvents = new THREEx.DomEvents(cameraPersp, renderer.domElement);
  domEvents.addEventListener(elem, "click", (event) => {
    
    getSelectedModel(elem);

  });
}


function loadOneModel(model) {
  let root;
  gltfLoader.load("./img/models/chair_03_red.glb", (gltf) => {
    root = gltf.scene;
    root.position.set(0, 0, 0);
    root.name = "red-chair";
    scene.add(root);
    checkCollisionModels.push(root);
    root.userData.currentPosition = new THREE.Vector3();
    initClick(root);
  });
  // return root;
}
function loadOneModel2(el) {
  let root;
  gltfLoader.load("./img/models/chair_04_bezh.glb", (gltf) => {
    root = gltf.scene;
    root.position.set(0, 0, 2);
    root.name = "bezh-chair";
    // clickedElem = root;
    // testedModel = root;
    // root.userData.info = "dsdsdsd";
    // productGroup1.position.set(0,0,0);
    // productGroup1.add(root);
    scene.add(root);
    checkCollisionModels.push(root);

    root.userData.currentPosition = new THREE.Vector3();
    // addTransformControl(root);
    // initClick(elem);
  });
}


// доработать для цикла
function loadAllModel() {
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

function addTransformControl(el) {
  
  control = new TransformControls(cameraPersp, renderer.domElement);

  control.addEventListener("change", render);

  control.addEventListener("dragging-changed", onDraginigchange, false);

  control.addEventListener("objectChange", 
  function (el) {
    isCollision(el, checkCollisionModels);
  
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

  control.showY = false; // это для движения тоолько по осям x z
  scene.add(control);
  scene.add(el);
  control.attach(el);
}

function combinePartsOfModel(el){
  var group, mesh, box, mesh22, group2, box2;

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
  });
  scene.add(group);
}
function onDraginigchange(event) {
  orbit.enabled = !event.value;
}


// позиция всего бокса всесте с дочерними
function drawBox(objectwidth, objectheight, objectdepth) {
  var geometry, material, box;
  geometry = new THREE.BoxGeometry(objectwidth, objectheight, objectdepth);
  material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.2,
    // depthTest: false, // чтобы короб был внутри модели
  });
  box = new THREE.Mesh(geometry, material);
  box.position.set(0, 0.5, 0);
  return box;
}

// кастомный код на перемещение модели, пока не нужен
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

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}
// не нужен, оставим для примера
function initFigures() {
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry3 = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const material3 = new THREE.MeshBasicMaterial({ color: 0x46ff0 }); // greenish blue

  const cube2 = new THREE.Mesh(geometry3, material3);
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

  const box = new THREE.Box3().setFromObject(cube6);

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
btnChangeTexture.addEventListener("click", () => changeTexture(selectedModel));
btnProductivity.addEventListener("click", () => getProductivity());
btnRotateCamera.addEventListener("click", getRotateCamera);
btnDragModel.addEventListener('click', getDragModel);
btnReplaceModel.addEventListener('click',()=> replaceModel(selectedModel, newModel));



function replaceModel(prevModel, nextModel) {
  if(control) {
    control.detach(prevModel);
  }
 
  checkCollisionModels = checkCollisionModels.filter(item => item.name !== prevModel.name );


  gltfLoader.load(`${nextModel.url}`, (gltf) => {
    let root = gltf.scene;
    root.position.x = prevModel.position.x;
    root.position.y = prevModel.position.y;
    root.position.z = prevModel.position.z;
    root.rotation.y = nextModel.rotateY;
   

    scene.add(root);
    scene.remove(prevModel);
    selectedModel = root;
    root.userData.currentPosition = new THREE.Vector3();
    initClick(root);
  });
}

function getRotateCamera() {
  statusCamera.rotate = !statusCamera.rotate;
}

function getDragModel(el) {
  addTransformControl(selectedModel);
}


function deleteModel(el) {

  if(control) {
    control.detach(el);
  }
  scene.remove( selectedModel );
}
function changeTexture(el) {
  texture = textureLoader.load("./img/textures/jeans.jpg");
  texture.flipY = false;
  el.traverse((o) => {
    if (o.isMesh) {
      o.material.map = texture;
    }
  });
}
// индикатор FPS памяти и тд
function getProductivity() {
  if (!statsStatus) {
    stats.showPanel(1);
    canvas.appendChild(stats.dom);
  } else {
    canvas.removeChild(stats.dom);
  }
  statsStatus = !statsStatus;
}

function getSelectedModel(el) {
  // console.log(el, ' is selected');
  if (selectedModel !== el) {
    selectedModel = el;
    selectedModelText.innerHTML = selectedModel.name;
    el.add(drawBox(1, 1, 1));
  }

}
// что то с квадратом, пока не надо
function getColorSelected(el) {
  const objects = [];
  const spread = 15;
  {
    const width = 1.5;
    const height = 1.5;
    const widthSegments = 2;
    const heightSegments = 2;
    addSolidGeometry(
      0,
      0,
      new THREE.PlaneGeometry(width, height, widthSegments, heightSegments)
    );
  }
  function createMaterial() {
    // const material = new THREE.MeshPhongMaterial({
    //   side: THREE.DoubleSide,
    // });
    const material = new THREE.MeshBasicMaterial({
      color: 0xfaf768,
      transparent: true,
      opacity: 0.5,
      depthTest: false,
    });

    // const hue = Math.random();
    // const saturation = 1;
    // const luminance = .5;
    // material.color.setHSL(hue, saturation, luminance);

    return material;
  }
  function addSolidGeometry(x, y, geometry) {
    const mesh = new THREE.Mesh(geometry, createMaterial());
    addObject(x, y, mesh);
  }
  function addObject(x, y, obj) {
    obj.position.x = 0;
    obj.position.y = 0;

    obj.rotation.x = -0.5 * Math.PI;
    // root.position.z = prevModel.position.z;
    // root.rotation.y = nextModel.rotateY;

    el.add(obj);
  }
}
