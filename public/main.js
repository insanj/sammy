
import Stats from './stats.module.js';

THREE.Cache.enabled = true;

let container, stats, camera, scene, renderer, controls, group;

let activeSandwich;
let activeSandwichObjects;

let selectedSandwichObject;
let selectedSandwichScene;
let selectedSandwichMaterials;

let sandwichOpened = false;

let hiddenSandwichObjects;

let swappedSandwichObjects = {};

let sammyHasInteracted = false;
let sammySoundtrackCurrentlyPlaying = {};
let sammySoundtrackRuntimeRunning = false;
let sammySoundtrackRuntimeRunAgain = false;
let sammySoundtrackLoadedAudios = {};

const sammyLayers = [{
    name: 'bottom_bun.gltf',
    open: 0,
    closed: 0,
    sound: 'bottom_bun.mp3',
    swaps: [{
        name: 'bottom_bagel.gltf',
        open: 0.08,
        closed: 0.08,
        sound: 'bottom_bagel.mp3'
    }]
}, {
    name: 'bottom_patty.gltf',
    open: 0.58,
    closed: 0.5,
    sound: 'bottom_patty.mp3',
    swaps: [{
        name: 'sausages.gltf',
        open: 0.08,
        closed: 0.02,
        sound: 'sausages.mp3',
    }]
 }, {
    name: 'cheese.gltf',
    open: 1,
    closed: 0.78,
    sound: 'cheese.mp3'
  }, {
    name: 'lettuce.gltf',
    open: 1.5,
    closed: 1.15,
    sound: 'lettuce.mp3',
    swaps: [{
        name: 'bacon.gltf',
        open: 0.2,
        closed: -0.2,
        sound: 'bacon.mp3'
    }]
  }, { 
    name: 'tomatoes.gltf',
    open: 2,
    closed: 1.4,
    sound: 'tomatoes.mp3',
    swaps: [{
        name: 'eggs.gltf',
        open: 0.5,
        closed: -0.1,
        sound: 'eggs.mp3'
    }]
}, { 
    name: 'sauce.gltf',
    open: 2.5,
    closed: 1.7,
    sound: 'sauce.mp3'
}, {
    name: 'top_patty.gltf',
    open: 3,
    closed: 2.1,
    sound: 'top_patty.mp3',
    swaps: [{
        name: 'tbone.gltf',
        open: 0.93,
        closed: 0,
        sound: 'tbone.mp3'
    }]
}, { 
    name: 'top_bun.gltf',
    open: 3.5,
    closed: 2.4,
    sound: 'top_bun.mp3',
    swaps: [{
        name: 'top_bagel.gltf',
        open: 1.1,
        closed: 0.05,
        sound: 'top_bagel.mp3'
    }]
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
    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(-30, 0, 0);
    scene.add(pointLight);

    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(30, 0, 0);
    scene.add(pointLight);

    var pointLight = new THREE.PointLight(0xc4c4c4);
    pointLight.position.set(0, 50, 0);
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
    controls.enablePan = false;
    
    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    // STATS
    stats = new Stats();
    // container.appendChild( stats.dom );

    // SOUNDS
    window.addEventListener( 'resize', onWindowResize, false );

    window.addEventListener( 'pointerdown', () => {
        checkFirstTimeSammySoundtrackPlay();
        container.style.cursor = 'grabbing';
        onSammyStartedGrabbing();
    }, false);

    window.addEventListener( 'pointerup', () => {
        checkFirstTimeSammySoundtrackPlay();
        container.style.cursor = 'grab';
        onSammyStoppedGrabbing();
    }, false);

    window.addEventListener( 'keydown', onKeyPress, false );
}

async function playSammySoundtrackRuntime() {
    if (sammySoundtrackRuntimeRunning) {
        sammySoundtrackRuntimeRunAgain = true;
        return;
    }

    if (!sammyHasInteracted) {
        return; // prevent autoplay block
    }

    sammySoundtrackRuntimeRunning = true;

    if (!sandwichOpened) {
        const playingAudios = Object.values(sammySoundtrackCurrentlyPlaying);
        for (let audio of playingAudios) {
            // stop playing
            audio.pause();
            audio.volume = 0;
            audio.currentTime = 0;
        }

        sammySoundtrackCurrentlyPlaying = {};
        sammySoundtrackRuntimeRunning = false;
        return;
    }

    const loadSoundtrackSound = function (name) {
        return new Promise((resolve, reject) => {
            const exists = sammySoundtrackLoadedAudios[name];
            if (exists) {
                resolve(exists);
                return;
            }

            const soundURL = `soundtrack/${name}`;
            const audio = new Audio(soundURL);
            audio.load();

            audio.addEventListener("canplaythrough", () => {
                sammySoundtrackLoadedAudios[name] = audio;
                resolve(audio);
            });
        });
    };
    
    const currentPlayingNames = Object.keys(sammySoundtrackCurrentlyPlaying);

    let preparedAudios = [];
    let shouldBePlayingNames = [];
    for (let object of activeSandwichObjects) {
        const sound = object.layer.sound;
        if (!sound) {
            continue;
        }

        if (hiddenSandwichObjects && hiddenSandwichObjects.length > 0) {
            const isHidden = hiddenSandwichObjects.find((object) => {
                return object.layer.sound && object.layer.sound === sound;
            });
            
            if (isHidden) {
                continue;
            }
        }

        shouldBePlayingNames.push(sound);

        if (currentPlayingNames.includes(sound)) {
            continue;
        }

        // needs to start playing
        const audio = await loadSoundtrackSound(sound);
        audio.volume = 1.0;
        preparedAudios.push({
            object, audio
        });
    }

    let currentPlaybackTime = 0;
    if (currentPlayingNames.length > 0) {
        const firstPlayingAudio = Object.values(sammySoundtrackCurrentlyPlaying)[0];
        currentPlaybackTime = firstPlayingAudio.currentTime;
    }    

    for (let prepared of preparedAudios) {
        const audio = prepared.audio;
        audio.loop = true;
        audio.play();
        audio.currentTime = currentPlaybackTime;

        const object = prepared.object;
        sammySoundtrackCurrentlyPlaying[object.layer.sound] = audio;
    }

    for (let existing of currentPlayingNames) {
        const shouldBePlaying = shouldBePlayingNames.find((name) => {
            return name === existing;
        });

        if (shouldBePlaying) {
            continue;
        }

        // stop playing
        const audio = sammySoundtrackCurrentlyPlaying[existing];
        audio.pause();
        audio.volume = 0;
        audio.currentTime = 0;

        delete sammySoundtrackCurrentlyPlaying[existing];
    }

    sammySoundtrackRuntimeRunning = false;
    if (sammySoundtrackRuntimeRunAgain) {
        sammySoundtrackRuntimeRunAgain = false;
        playSammySoundtrack();
    }
}

function playSammySoundtrack() {
    playSammySoundtrackRuntime()
        .then((soundtrackResponse) => {})
        .catch((soundtrackError) => {
            console.log(soundtrackError);
        });
}

function checkFirstTimeSammySoundtrackPlay() {
    if (!sammyHasInteracted) {
        sammyHasInteracted = true;
    }

    const playingNames = Object.keys(sammySoundtrackCurrentlyPlaying);
    if (playingNames.length > 0) {
        return; // already assume we're playing (won't work if all layers hidden, but that's fine...)
    }

    playSammySoundtrack();
}

let turnAllMaterials = (thing, hex='ffacac', checkSelected=true) => {};
turnAllMaterials = (thing, hex='ffacac', checkSelected=true) => {
    if (!thing) {
        return;
    } 

    // if (thing.material) {
    //     if (checkSelected) {
    //         selectedSandwichMaterials[thing.uuid] = thing.material.color.getHexString();
    //     }

    //     const hexNum = parseInt(hex, 16);
    //     thing.material.color.setHex(hexNum);
    // }
    
    if (!thing.children || thing.children.length < 1) {
        if (!thing.material) {
            return;
        }

        if (checkSelected) {
            selectedSandwichMaterials[thing.uuid] = thing.material.color.getHexString();
        }

        const hexNum = parseInt(hex, 16);
        thing.material.color.setHex(hexNum);
        return;
    }

    if (checkSelected) {
        if (selectedSandwichScene && selectedSandwichMaterials) {
            const materialsToChange = selectedSandwichMaterials;
            selectedSandwichMaterials = {};

            for (let childUUID of Object.keys(materialsToChange)) {
                turnAllMaterials(selectedSandwichScene, 'ffffff', false);
            }
        } else {
            selectedSandwichMaterials = {};
        }

        selectedSandwichScene = thing;
    }
    
    for (let child of thing.children) {
        turnAllMaterials(child, hex, checkSelected);
    }
}

let fadeAllMaterials = (thing, opacity) => {};
fadeAllMaterials = (thing, opacity) => {
    if (!thing) {
        return;
    }

    if (thing.material) {
        thing.material.transparent = opacity !== 1.0;
        thing.material.opacity = opacity;
    }

    if (!thing.children || thing.children.length < 1) {
        return;
    }
    
    for (let child of thing.children) {
        fadeAllMaterials(child, opacity);

        if (child.material) {
            child.material.transparent = opacity !== 1.0;
            child.material.opacity = opacity;
        }
    }
}

function loadSammy() {
    let loader = new THREE.GLTFLoader();

    const promises = sammyLayers.map(layer => {
        return new Promise((resolve, reject) => {
            let sammyLayer = layer;
            if (swappedSandwichObjects[layer.name]) {
                sammyLayer = swappedSandwichObjects[layer.name];
            }

            loader.load(sammyLayer.name, function(gltf) {
                resolve({
                    layer: sammyLayer,
                    scene: gltf.scene
                });
            });
        });
    });

    var raycaster = new THREE.Raycaster();

    Promise.all(promises).then(objects => {
        const sandwichGroup = new THREE.Scene();

        const isOpen = sandwichOpened;
        
        // const eventListeners = window.getEventListeners(renderer.domElement);
        // for (let eventListener of eventListeners) {
        //     if (eventListener.name !== "click") {
        //         continue;
        //     }

        //     renderer.domElement.removeEventListener("click", eventListener.listener, eventListener.useCapture);
        // }

        let selectCompletionBlock;

        for (let object of objects) {
            const objectScene = object.scene;
            objectScene.position.set(0, isOpen ? object.layer.open : object.layer.closed, 0);
            sandwichGroup.add(objectScene);

            if (selectedSandwichObject) {
                if (selectedSandwichObject.layer.name === object.layer.name || (selectedSandwichObject.layer.swaps && selectedSandwichObject.layer.swaps.find(s => object.layer.name === s.name)) || (object.layer.swaps && object.layer.swaps.find(s => selectedSandwichObject.layer.name === s.name))) {
                    selectedSandwichObject = object;
                    turnAllMaterials(objectScene);
                }
            }

            if (hiddenSandwichObjects) {
                const isHidden = hiddenSandwichObjects.find(hidden => {
                    return object.layer.name === hidden.layer.name;
                });

                if (isHidden) {
                    fadeAllMaterials(objectScene, 0.2);
                }
            }

            renderer.domElement.addEventListener("click", function (event) {
                const mouse = new THREE.Vector2();
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
                raycaster.setFromCamera(mouse, camera);
    
                const intersects = raycaster.intersectObjects([objectScene], true);
                if (intersects.length > 0) {
                    // alert("Selected " + object.layer.name);
                    selectedSandwichObject = object;
                    turnAllMaterials(objectScene);
                }
            }, true);
        }

        sandwichGroup.scale.set(10, 10, 10);

        if (activeSandwich) {
            scene.remove(activeSandwich); 
        }

        activeSandwich = sandwichGroup;
        activeSandwichObjects = objects;

        scene.add(sandwichGroup);

        // if (selectCompletionBlock) {
        //     selectCompletionBlock();
        // }

        playSammySoundtrack();

        const loadinDiv = document.getElementById('sammy-loadin');
        if (loadinDiv) {
            loadinDiv.outerHTML = '';
        }
    }).catch(error => {
        alert(error);
    });
}

function onSammyStoppedGrabbing() {
}

function openOrCloseSammy() {
    if (!activeSandwich) {
        return; 
    }

    sandwichOpened = !sandwichOpened;
    playSammySoundtrack();

    let i = 0;
    for (let layer of activeSandwich.children) {
        let sammyLayer = sammyLayers[i];
        if (swappedSandwichObjects[sammyLayer.name]) {
            sammyLayer = swappedSandwichObjects[sammyLayer.name];
        }

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

function onSammyPartSelect(offset) {
    let objectToSelect;
    if (!selectedSandwichScene || !activeSandwichObjects) { // nothing selected yet
        if (offset >= 0) {
            objectToSelect = activeSandwichObjects[0];
        } else {
            objectToSelect = activeSandwichObjects[activeSandwichObjects.length-1];
        }
    }

    else { // something is selected
        const currentIndex = activeSandwichObjects.findIndex((object) => {
            const uuid = object.scene.uuid;
            const selectedUUID = selectedSandwichObject.scene.uuid;
            return uuid === selectedUUID;
        }); // find index using uuid 

        let nextIndex = currentIndex + offset;

        if (nextIndex >= activeSandwichObjects.length) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = activeSandwichObjects.length-1;
        } // make sure we wrap around properly if we're at end of sammy

        objectToSelect = activeSandwichObjects[nextIndex];
    }
    
    selectedSandwichObject = objectToSelect;
    turnAllMaterials(objectToSelect.scene); // select using same method as clicking
}

function onSammyPartHide() {
    if (!selectedSandwichObject) { // nothing selected, nothing to hide
        return;
    }

    if (hiddenSandwichObjects && hiddenSandwichObjects.length > 0) {
        const filtered = hiddenSandwichObjects.filter(object => {
            return selectedSandwichObject.layer.name !== object.layer.name;
        });
        
        if (filtered.length !== hiddenSandwichObjects.length) {
            // we have now SHOWN something that was already hidden
            fadeAllMaterials(selectedSandwichObject.scene, 1.0);
            hiddenSandwichObjects = filtered;
            playSammySoundtrack();
            return;
        }
    }

    // we now need to HIDE the thing
    if (!hiddenSandwichObjects) {
        hiddenSandwichObjects = [];
    }

    let added = hiddenSandwichObjects;
    added.push(selectedSandwichObject);
    fadeAllMaterials(selectedSandwichObject.scene, 0.2);
    hiddenSandwichObjects = added;
    playSammySoundtrack();
}

function onSammySwapSelect() {
    if (!selectedSandwichObject) {
        return;
    }

    let isNotSwapped = true;
    let swappedKey;
    const swaps = Object.keys(swappedSandwichObjects);
    for (let swapped of swaps) {
        const swapLayer = swappedSandwichObjects[swapped];
        if (swapLayer.name === selectedSandwichObject.layer.name) {
            isNotSwapped = false;
            swappedKey = swapped;
        }
    }

    if (isNotSwapped && !selectedSandwichObject.layer.swaps) {
        return;
    }

    if (isNotSwapped) {
        // time to swap
        swappedSandwichObjects[selectedSandwichObject.layer.name] = selectedSandwichObject.layer.swaps[0];
        scene.remove(activeSandwich)
        loadSammy();
    } else {
        // time to bring original back
        delete swappedSandwichObjects[swappedKey];
        scene.remove(activeSandwich)
        loadSammy();
    }
}

const panel = document.getElementById("sammy-panel");

function onPanelClick() {
    if (!panel.style.opacity || panel.style.opacity >= 1.0) {
        panel.style.opacity = 0.1;
    }

    else {
        panel.style.opacity = 1.0;
    }
}

panel.addEventListener("click", (event) => {
    if (event.target.nodeName === 'A' ) {
        return;
    }

    if (event.target.className === 'panel-button') {
        return;
    }

    let parent = event.target.parentElement;
    while (parent) {
        if (parent.className.includes('panel-toolbar') || parent.className.includes('print')) {
            return;
        }

        parent = parent.parentElement;
    }

    onPanelClick();
}, false);

function onKeyPress( event ) {
    checkFirstTimeSammySoundtrackPlay();

    // esc
    if (event.keyCode === 27) {
        onPanelClick();
    }

    // space
    else if (event.keyCode === 32) {
        openOrCloseSammy();
    }

    // up or down arrow key
    else if (event.keyCode === 38) {
        onSammyPartSelect(1);
    }
    
    else if (event.keyCode === 40) {
        onSammyPartSelect(-1);
    }

    // left or right arrow key
    else if (event.keyCode === 37 || event.keyCode === 39) {
        onSammySwapSelect();
    }

    // enter key
    else if (event.keyCode === 13) {
        onSammyPartHide();
    }

}

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
