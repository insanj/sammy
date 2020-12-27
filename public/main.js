
import Stats from './stats.module.js';

THREE.Cache.enabled = true;

let container, stats, camera, scene, renderer, controls, group;

init();
animate();
	
function init() {
    container = document.createElement( 'div' );
    container.style.cursor = 'grab';
    document.body.appendChild( container );

    // CAMERA
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 10000);

    camera.position.x = 0;
    camera.position.y = 20;
    camera.position.z = 100;

    camera.lookAt (new THREE.Vector3(0,0,0));

    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 250, 1400 );

    var grid = new THREE.GridHelper(100, 10);
    grid.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
    scene.add(grid);

    // LIGHTS
    // const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    // dirLight.castShadow = true;
    // scene.add( dirLight );

    // const pointLight1 = new THREE.PointLight(0xc4c4c4,0.5);
    // pointLight1.position.set(-100,100,1);
    // scene.add(pointLight1);
    
    // const pointLight2 = new THREE.PointLight(0xc4c4c4,0.5);
    // pointLight1.position.set(100,0,1);
    // scene.add(pointLight2);

    // const pointLight3 = new THREE.PointLight(0xc4c4c4,0.5);
    // pointLight3.position.set(0,100,-100);
    // scene.add(pointLight3);

    // const pointLight4 = new THREE.PointLight(0xffffff,2.2);
    // pointLight4.position.set(300,300,0);
    // scene.add(pointLight4);

    // const light = new THREE.PointLight(0xc4c4c4,10);
    // light.position.set(0,300,500);
    // scene.add(light);

    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(-30, 0, 0);
    scene.add(pointLight);

    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(30, 0, 0);
    scene.add(pointLight);

    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(0, 30, 0);
    scene.add(pointLight);

    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(0, -30, 0);
    scene.add(pointLight);

    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(0, 0, 30);
    scene.add(pointLight);


    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(0, 0, -30);
    scene.add(pointLight);
 
    // SAMMY
    let loader = new THREE.GLTFLoader();
    loader.load('scene(1).gltf', function(gltf){
        group = gltf.scene;
        group.position.set(0, 0, 0);
        group.scale.set(10, 10, 10);

        // for (let child of group.children) {
        //     child.scale.set(100,100,100);
        // }

        scene.add(group);
    });

    // RENDERER
    renderer = new THREE.WebGLRenderer({ 
        antialias: true 
    });

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // CONTROLS
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.autoRotate = true;
    controls.autoRotateSpeed = 5;

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 1;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    // STATS
    stats = new Stats();
    // container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize, false );

    window.addEventListener( 'pointerdown', () => {
        container.style.cursor = 'grabbing';
    }, false);

    window.addEventListener( 'pointerup', () => {
        container.style.cursor = 'grab';
    }, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}

function render() {

    controls.update();

    renderer.clear();
    renderer.render( scene, camera );

}
