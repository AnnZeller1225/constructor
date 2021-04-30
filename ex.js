import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";
import { DragControls }  from "./three.js/examples/jsm/controls/DragControls.js";

//scripts
// global variables
var scene;
var renderer;
var groundBox;
var objects = [];
var container, controls, clock, selection;
var  scene, renderer, camera;

var raycaster; // A THREE.Raycaster for user mouse input.

raycaster = new THREE.Raycaster();

var container, renderer;
var camera, scene, controls, groundRaycastObj = [];


var raycaster;

var walls;

/****/
/**
 * Set our global variables.
 */
var camera, // We need a camera.
	scene, // The camera has to see something.
	renderer, // Render our graphics.
	controls, // Our Orbit Controller for camera magic.
	container, // Our HTML container for the program.
	rotationPoint; // The point in which our camera will rotate around.

var characterSize = 50;
var outlineSize = characterSize * 0.05;

// Track all objects and collisions.
var objects = [];

// Set mouse and raycaster.
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();


var p = 0;

initializeLesson();
function initializeLesson() {

	init();

}

function init() {

	    // Prepare container
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 100;
	camera.position.y = 100;
	camera.position.x = 50;// added to get a better control on screen
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );


	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( "#e5e5e5" ); //setting a grey color on the screen
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight ); //adjusting the black screen on the browser
	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', () => {

		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;
		// camera.updateProjectionMatrix(); //today edited

	} );



	walls = new THREE.Object3D();

	container.appendChild( renderer.domElement );

	var groundlength = 2000;
	var groundheight = 0;
	var groundwidth = 1000;
	var geometry = new THREE.BoxGeometry( groundlength, groundheight, groundwidth );
	var material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( './img/textures/scine.jpg' ) } ); //B5651D
	var ground = new THREE.Mesh( geometry, material );
	ground.position.x = groundlength / 2;
	ground.position.z = groundwidth / 2;
	ground.position.y = - 0.5;
	 walls.add( ground );
	groundBox = new THREE.BoundingBoxHelper( ground );
	groundBox.update( ground );
	scene.add( walls );
	groundRaycastObj.push( walls );

	var axes = new THREE.AxesHelper( 1000 ); //to view x y z axis
	scene.add( axes ); // линии осей 


	controls =   new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 1;
	controls.maxDistance = 1000;
	controls.target = new THREE.Vector3( 0, 0, 0 );
	clock = new THREE.Clock();

	THREEx.WindowResize( renderer, camera );

	createcontainer( 10, 0, 10, 50, 50, 50 );
	createcontainer( 90, 0, 10, 50, 50, 50 );
	// createcontainer( 70, 0, 10, 50, 50, 50 );

	var dragControls = new DragControls( objects, camera, renderer.domElement );

	dragControls.addEventListener( 'drag', function ( event ) {

		intersectObjMas( event.object, objects );
		event.object.userData.currentPosition.copy( event.object.position );
		
		console.log(event.object.userData.currentPosition);


		function intersectObjMas( obj, mas ) {

			for ( var i = 0; i < mas.length; i ++ ) {

				if ( event.object != mas[ i ] ) {

					var firstObject = event.object;

					var secondObject = mas[ i ];

					var firstBB = new THREE.Box3().setFromObject( firstObject );
					var secondBB = new THREE.Box3().setFromObject( secondObject );

					var collision = firstBB.intersectsBox( secondBB );

					if ( collision ) {

						event.object.position.copy( event.object.userData.currentPosition );

					}


				}

			}

		}

	} );

	dragControls.addEventListener( 'dragstart', function ( event ) {

		controls.enabled = false;

	} );

	dragControls.addEventListener( 'dragend', function ( event ) {

		controls.enabled = true;

	} );

	animate();

}

function createcontainer( posX, posY, posZ, length, height, width ) {

	// Create the container.
	var geometry = new THREE.BoxGeometry( length, height, width );
	var material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'textures/Translucent_Glass_Corrugated.jpg' ) } );

	var container = new THREE.Mesh( geometry, material );
	//outlineContainer = new THREE.BoxHelper( container,'#828282');
	// outlineContainer = new BoxHelper( container, '#3E424B' );

	// container.add( outlineContainer );
	scene.add( container );
	objects.push( container );
	container.name = 'container' + p;
	var positiony = posY + 0.1 + ( height / 2 );
	var positionx = posX + 0.1 + ( length / 2 );
	var positionZ = posZ + 0.1 + ( width / 2 );
	container.position.set( positionx, positiony, positionZ );
	p = p + 1;
	// console.log( ' container.name' + container.name );
	container.userData.currentPosition = new THREE.Vector3();

}




function animate() {

	requestAnimationFrame( animate );
	renderer.render( scene, camera );

}
