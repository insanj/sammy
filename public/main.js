
import Stats from './stats.module.js';

THREE.Cache.enabled = true;

let container, stats, camera, scene, renderer, controls, group;

let activeSandwich;

let activeSandwichScene;
let activeSandwichMaterials;

let sandwichOpened = false;

const sammyLayers = [{
    name: 'bottom_bun.gltf',
    open: 0,
    closed: 0
}, {
    name: 'bottom_patty.gltf',
    open: 0.5,
    closed: 0.5
 }, {
    name: 'cheese.gltf',
    open: 1,
    closed: 0.78
  }, {
    name: 'lettuce.gltf',
    open: 1.5,
    closed: 1.15
}, { 
    name: 'tomatoes.gltf',
    open: 2,
    closed: 1.4
}, {  
    name: 'sauce.gltf',
    open: 2.5,
    closed: 1.7
}, {
    name: 'top_patty.gltf',
    open: 3,
    closed: 2.1
}, { 
    name: 'top_bun.gltf',
    open: 3.5,
    closed: 2.4
}];

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

    var grid = new THREE.GridHelper(100, 10, new THREE.Color(0xc4c4c4), new THREE.Color(0xc4c4c4));
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
    loadSammy();

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
        onSammyStartedGrabbing();
    }, false);

    window.addEventListener( 'pointerup', () => {
        container.style.cursor = 'grab';
        onSammyStoppedGrabbing();
    }, false);
}

let turnAllMaterials = (thing, hex='ffacac', checkActive=true) => {};
turnAllMaterials = (thing, hex='ffacac', checkActive=true) => {
    if (!thing || !thing.children || thing.children.length < 1) {
        return;
    }

    if (checkActive) {
        if (activeSandwichScene && activeSandwichMaterials) {
            const materialsToChange = activeSandwichMaterials;
            activeSandwichMaterials = {};

            for (let childUUID of Object.keys(materialsToChange)) {
                turnAllMaterials(activeSandwichScene, materialsToChange[childUUID], false)
            }
        } else {
            activeSandwichMaterials = {};
        }

        activeSandwichScene = thing;
    }
    
    for (let child of thing.children) {
        turnAllMaterials(child, hex, checkActive);

        if (child.material) {
            if (checkActive) {
                activeSandwichMaterials[child.uuid] = child.material.color.getHexString();
            }

            const hexNum = parseInt(hex, 16);
            child.material.color.setHex(hexNum);
        }
    }
}

function loadSammy() {
    let loader = new THREE.GLTFLoader();

    const promises = sammyLayers.map(layer => {
        return new Promise((resolve, reject) => {
            loader.load(layer.name, function(gltf) {
                resolve({
                    layer,
                    scene: gltf.scene
                });
            });
        });
    });

    var raycaster = new THREE.Raycaster();

    Promise.all(promises).then(objects => {
        const sandwichGroup = new THREE.Scene();

        const isOpen = sandwichOpened;
        
        // let objectScenes = [];
        // const eventListeners = window.getEventListeners(renderer.domElement);
        // for (let eventListener of eventListeners) {
        //     if (eventListener.name !== "click") {
        //         continue;
        //     }

        //     renderer.domElement.removeEventListener("click", eventListener.listener, eventListener.useCapture);
        // }

        for (let object of objects) {
            const objectScene = object.scene;
            objectScene.position.set(0, isOpen ? object.layer.open : object.layer.closed, 0);
            sandwichGroup.add(objectScene);

            // objectScenes.push(objectScene);

            renderer.domElement.addEventListener("click", function (event) {
                const mouse = new THREE.Vector2();
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
                raycaster.setFromCamera(mouse, camera);
    
                const intersects = raycaster.intersectObjects([objectScene], true);
                if (intersects.length > 0) {
                    // alert("Selected " + object.layer.name);
                    turnAllMaterials(objectScene);
                }
            }, true);
        }

        sandwichGroup.scale.set(10, 10, 10);

        if (activeSandwich) {
            scene.remove(activeSandwich); 
        }

        activeSandwich = sandwichGroup;

        scene.add(sandwichGroup);
    }).catch(error => {
        alert(error);
    });
}

function onSammyStoppedGrabbing() {
    if (!activeSandwich) {
        return; 
    }

    sandwichOpened = !sandwichOpened;

    let i = 0;
    for (let layer of activeSandwich.children) {
        const sammyLayer = sammyLayers[i];

        const endPosition = new THREE.Vector3(0, sandwichOpened ? sammyLayer.open : sammyLayer.closed, 0);
        
        const animationTween = new TWEEN.Tween(layer.position).to(endPosition, 1000); 
		animationTween.start();

        // layer.position.set(0, sandwichOpened ? sammyLayer.open : sammyLayer.closed, 0);
        i++;
    }

}

function onSammyStartedGrabbing() {
//     if (sandwichOpened) {
//         return;
//     }

//     // scene.remove(activeSandwich); 

//     // loadSammy();
}
  
// function onDocumentMouseDown( e, object, layer ) {
//     var vectorMouse = new THREE.Vector3( //vector from camera to mouse
//         -(window.innerWidth/2-e.clientX)*2/window.innerWidth,
//         (window.innerHeight/2-e.clientY)*2/window.innerHeight,
//         -1/Math.tan(22.5*Math.PI/180)); //22.5 is half of camera frustum angle 45 degree
//     vectorMouse.applyQuaternion(camera.quaternion);
//     vectorMouse.normalize();  

//     var vectorObject = new THREE.Vector3(); //vector from camera to object
//     vectorObject.set(object.position.x - camera.position.x,
//                      object.position.y - camera.position.y,
//                      object.position.z - camera.position.z);
//     vectorObject.normalize();
//     if (vectorMouse.angleTo(vectorObject)*180/Math.PI < 1) {
//         //mouse's position is near object's position
//         alert("clicked " + layer.name);
//     }
// }

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate( time ) {

    requestAnimationFrame( animate );

    TWEEN.update( time );

    render();
    stats.update();

}

function render() {

    controls.update();

    renderer.clear();
    renderer.render( scene, camera );

}
