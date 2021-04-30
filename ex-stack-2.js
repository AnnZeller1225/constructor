import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "./three.js/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "./three.js/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "./three.js/examples/jsm/controls/DragControls.js";
import Stats from "./three.js/examples/jsm/libs/stats.module.js";


var camera, scene, renderer, orbit, control;
var geometry, geometry2, material,material1, mesh;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
var objects = [],SELECTEDOBJECT,lastPosition, collideStatus=false;
var controledObject;
var a;

var productGroup1 = new THREE.Group();
var productGroup2 = new THREE.Group();

var productGroup1Box3 = new THREE.Box3();
var productGroup2Box3 = new THREE.Box3();

var productGroup1LastPosition = new THREE.Vector3();
var productGroup2LastPosition = new THREE.Vector3();

init();
animate();
function init() {
	camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,10000);
	camera.position.set( -5,5,5 );
	scene = new THREE.Scene();
	geometry = new THREE.BoxGeometry(1, 1, 1);
	material = new THREE.MeshNormalMaterial();
	material1 = new THREE.MeshNormalMaterial();
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);


	var meshUp = new THREE.Mesh(geometry, material);
	var meshdown = new THREE.Mesh(geometry, material);
	meshUp.position.set(0, 1, 0);
	meshdown.position.set(0, 0, 0);
	productGroup1.add(meshUp,meshdown);
	scene.add(productGroup1);


	objects.push(productGroup1);
	
	productGroup1Box3.setFromObject( productGroup1 );
	productGroup1LastPosition.copy( productGroup1.position );

	var meshUp = new THREE.Mesh(geometry, material);
	var meshdown = new THREE.Mesh(geometry, material);
	meshUp.position.set(0, 1, 0);
	meshdown.position.set(0, 0, 0);
	productGroup2.add(meshUp,meshdown);
	productGroup2.position.set(0,0,2);
	scene.add(productGroup2);
	objects.push(productGroup2);

	productGroup2Box3.setFromObject( productGroup2 );
	productGroup2LastPosition.copy( productGroup2.position );

	orbit = new OrbitControls(camera, renderer.domElement);
	orbit.addEventListener( 'change', render );

	
    // control.attach(productGroup1);
    getControl(productGroup1);
    getControl(productGroup2);
}
function onDraginigchange(event){
	orbit.enabled = ! event.value;
  }

function getControl(el) {
    control = new TransformControls(camera, renderer.domElement);
	control.addEventListener( 'change', render );

	control.addEventListener( 'dragging-changed', onDraginigchange,false);

	control.addEventListener('objectChange', onObjectChange,false);

	// window.addEventListener( 'mousedown', onMouseDown,false);
	window.addEventListener( 'keyup', onKeyUp,false );
	window.addEventListener( 'wheel', onWheel,false );
	window.addEventListener( 'keydown', onKeyDown,false );
	control.showY = false;
	scene.add( control );
    control.attach(el);
}


var aabb1 = new THREE.Box3();
var aabb2 = new THREE.Box3();

function onObjectChange(){      
	
	aabb1.copy( productGroup1Box3 ).applyMatrix4( productGroup1.matrixWorld );
	aabb2.copy( productGroup1Box3 ).applyMatrix4( productGroup2.matrixWorld );
	
	if ( aabb1.intersectsBox( aabb2 ) === true ) {
	
		productGroup1.position.copy( productGroup1LastPosition );
		productGroup2.position.copy( productGroup2LastPosition );
	
	} else {
	
		productGroup1LastPosition.copy( productGroup1.position );
		productGroup2LastPosition.copy( productGroup2.position );
	
	}

}
function onMouseDown(event){
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects,true );
	//console.log(intersects.length);
	if (intersects.length > 0) {
		for (var i = 0; i < objects.length; i++) { 
			if (intersects[ 0 ].object.parent === objects[ i ]) {
				control.attach( intersects[0].object.parent);
				SELECTEDOBJECT = [objects[ i ],i];
				// SELECTEDOBJECT[0].updateMatrixWorld( true );
				orbit.enabled = false;
			}
		}
	}
}

function onKeyDown(){
	switch ( event.keyCode ) {
		case 17: // Ctrl
			control.setTranslationSnap( null );
			control.setRotationSnap( null );
			control.setScaleSnap( null );
			break;
		case 68: // d
			//console.log('q');
			//scene.remove(SELECTEDOBJECT);
			break;
		case 82: // d
			//console.log('r');
			SELECTEDOBJECT[0].rotation.y += Math.PI / 2;
			SELECTEDOBJECT[0].position.clone();
			break;
	}
}
function onKeyUp(){}
function onWheel(){orbit.enableZoom = false; }



function animate() {
	requestAnimationFrame(animate);
	/* mesh.rotation.x += 0.01;
            // mesh.rotation.y += 0.02; */
	renderer.render(scene, camera);
}
function render() {
	if(collideStatus == true){
		let op = Object.entries(lastPosition);
		SELECTEDOBJECT[0].position.set(op[0][1],op[1][1],op[2][1]);
		collideStatus = false;
		orbit.enabled = false;
	}
	renderer.render(scene, camera);
}