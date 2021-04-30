//scripts
// global variables
var scene;
var renderer;
var boxBox;

var secobj = [];
var containerBox;
// used for drag and drop
var chairBox, sofaBox, goodsBox;
var pen, c_mesh, interactiveObj = [], rotateObj = [], groundRaycastObj = [];
var selectedObject;
var offset = new THREE.Vector3();
var objects = [];
var container, controls, clock, selection;
var obj;
var init, initializeLesson;
var canvas, scene, renderer, camera;
var GoodsBoxHelper;
var wallbackBox, wallrightBox, wallleftBox;
var raycaster; // A THREE.Raycaster for user mouse input.
var leftovergoods, totalnooggoods;
var ground; // A square base on which the cylinders stand.
var cylinder; // A cylinder that will be cloned to make the visible cylinders.
var warehousez, warehousey, warehousex;
var world, animate; // An Object3D that contains all the mesh objects in the scene.
// Rotation of the scene is done by rotating the world about its
// y-axis.  (I couldn't rotate the camera about the scene since
// the Raycaster wouldn't work with a camera that was a child
// of a rotated object.)
raycaster = new THREE.Raycaster();
var mouseAction; // currently selected mouse action
var dragItem; // the cylinder that is being dragged, during a drag operation
var intersects; //the objects intersected
var positionx = 0;
var positiony = 0;
var positionz = 0;
var plane; // An invisible object that is used as the target for raycasting while
// dragging a cylinder.  I use it to find the new location of the
// cylinder.  I tried using the ground for this purpose, but to get
// the motion right, I needed a target that is at the same height
// above the ground as the point where the user clicked the cylinder.
var container, renderer;
var camera, scene, projector, mouseVector, controls;
var mouseX, mouseY, draggable;
var pen, c_mesh, interactiveObj = [], rotateObj = [], groundRaycastObj = [];
var wallWidth = 1200;
var wallHeight = 400;
var chair_model, sofa_model;
var chair_selected = false;
var sofa_selected = false;

var raycaster;
var mouse = new THREE.Vector2(), INTERSECTED;
var radius = 100, theta = 0;
var oldIntersectPoint = new THREE.Vector3();
var newIntersectPoint = new THREE.Vector3();
var intersectOffset = new THREE.Vector3();
var ContainerOldPosition = new THREE.Vector3();
var sofaOldPosition = new THREE.Vector3();

var chair_rotate = false;
var walls;
var mesh_box;
var wallright, wallleft, wallback, wallfront, ceiling, ground;
var strDownloadMime = "Wood_Bam.jpg";
var chairBox, sofaBox;
var wallrightBox, wallleftBox, wallbackBox, wallfrontBox;

var p;
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
var collisions = [];

// Set mouse and raycaster.
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// Store movements.
var movements = [];
var playerSpeed = 5;

// Watch for double clicks.
var clickTimer = null;

// The movement destination indicator.
var indicatorTop;
var indicatorBottom;

var p = 0;


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
		camera.updateProjectionMatrix(); //today edited

	} );

	// Create a rotation point.
	rotationPoint = new THREE.Object3D();
	rotationPoint.position.set( 0, 0, 0 );
	scene.add( rotationPoint );

	walls = new THREE.Object3D();
	var groundGeo_2 = new THREE.PlaneGeometry( 500, 500 );
	var floorTexture = new THREE.MeshBasicMaterial( { color: 0xff2255 } );

	container.appendChild( renderer.domElement );

	var groundlength = 2000;
	var groundheight = 0;
	var groundwidth = 1000;
	var geometry = new THREE.BoxGeometry( groundlength, groundheight, groundwidth );
	var material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'textures/6.jpg' ) } ); //B5651D
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
	scene.add( axes );


	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.minDistance = 1;
	controls.maxDistance = 1000;
	controls.target = new THREE.Vector3( 0, 0, 0 );
	clock = new THREE.Clock();

	THREEx.WindowResize( renderer, camera );

	createcontainer( 10, 0, 10, 50, 50, 50 );
	createcontainer( 90, 0, 10, 50, 50, 50 );

	var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );

	dragControls.addEventListener( 'drag', function ( event ) {

		intersectObjMas( event.object, objects );

		event.object.userData.currentPosition.copy( event.object.position );

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

		console.log( 'new position ' + event.object.position.x );
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
	outlineContainer = new THREE.BoxHelper( container, '#3E424B' );

	container.add( outlineContainer );
	scene.add( container );
	objects.push( container );
	container.name = 'container' + p;
	var positiony = posY + 0.1 + ( height / 2 );
	var positionx = posX + 0.1 + ( length / 2 );
	var positionZ = posZ + 0.1 + ( width / 2 );
	container.position.set( positionx, positiony, positionZ );
	p = p + 1;
	console.log( ' container.name' + container.name );
	container.userData.currentPosition = new THREE.Vector3();

}

function createwarehouse() {

	 warehousex = document.getElementById( "Length" ).value;
	 warehousez = document.getElementById( "Width" ).value;
	 warehousey = document.getElementById( "height" ).value;

	var geometry = new THREE.BoxGeometry( warehousex, warehousey, warehousez ); // length height width
	var cubeMaterials = [
		new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'textures/4.jpg' ), side: THREE.DoubleSide } ), // left

		new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'textures/4.jpg' ), side: THREE.DoubleSide } ), // right

		new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'textures/3.jpg' ), side: THREE.DoubleSide } ), //bottom
		new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'textures/3.jpg' ), side: THREE.DoubleSide } ), //top
		new THREE.MeshBasicMaterial( { color: "#FF0000", side: THREE.BackSide } ), // front
		new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'textures/3.jpg' ), side: THREE.DoubleSide } ) // grgeen
	];

	var material = new THREE.MeshFaceMaterial( cubeMaterials );
	var warehouse = new THREE.Mesh( geometry, material );

	warehouse.position.x = warehousex / 2;
	warehouse.position.y = ( warehousey / 2 ) + 0.1;
	warehouse.position.z = warehousez / 2;

	scene.add( warehouse );

}




function openC( evt, cityName ) {

	var i, tabcontent, tablinks;

	// Get elements class="tabcontent" and hide
	tabcontent = document.getElementsByClassName( "tabcontent" );
	for ( i = 0; i < tabcontent.length; i ++ ) {

		tabcontent[ i ].style.display = "none";

	}



	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName( "tablinks" );
	for ( i = 0; i < tablinks.length; i ++ ) {

		tablinks[ i ].className = tablinks[ i ].className.replace( " active", "" );

	}


	// Show current and add an "active" class to the button that opened the tab
	document.getElementById( cityName ).style.display = "block";
	evt.currentTarget.className += " active";

}

function animate() {

	requestAnimationFrame( animate );
	renderer.render( scene, camera );

}
