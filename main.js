let camera, scene, renderer, delta;
let clock = new THREE.Clock(false);
let controls;

let mapFrame;
let zoomFrame = [];

let container, csRenderer, csScene, object, blocker;
let controlsDiv;
let map;
let binds = {
        "w":
        {
            default: "w",
            desc: "translate up",
            fun: function () {
                currentGroup.position.y += units * delta;
            },
            cat: "Translation"
        },
        "s":
        {
            default: "s",
            desc: "translate down",
            fun: function () {
                currentGroup.position.y -= units * delta;
            },
            cat: "Translation"
        },
        "a":
        {
            default: "a",
            desc: "translate left",
            fun: function () {
                currentGroup.position.x -= units * delta;
            },
            cat: "Translation"
        },
        "d":
        {
            default: "d",
            desc: "translate right",
            fun: function () {
                currentGroup.position.x += units * delta;
            },
            cat: "Translation"
        },
        "q":
        {
            default: "q",
            desc: "translate back",
            fun: function () {
                currentGroup.position.z += units * delta;
            },
            cat: "Translation"
        },
        "e":
        {
            default: "e",
            desc: "translate forward",
            fun: function () {
                currentGroup.position.z -= units * delta;
            },
            cat: "Translation"
        },
        "i":
        {
            default: "i",
            desc: "rotate up",
            fun: function () {
                currentGroup.rotation.x += Math.PI * delta;
            },
            cat: "Rotation"
        },
        "k":
        {
            default: "k",
            desc: "rotate down",
            fun: function () {
                currentGroup.rotation.x -= Math.PI * delta;
            },
            cat: "Rotation"
        },
        "j":
        {
            default: "j",
            desc: "rotate left",
            fun: function () {
                currentGroup.rotation.y += Math.PI * delta;
            },
            cat: "Rotation"
        },
        "l":
        {
            default: "l",
            desc: "rotate right",
            fun: function () {
                currentGroup.rotation.y -= Math.PI * delta;
            },
            cat: "Rotation"
        },
        "u":
        {
            default: "u",
            desc: "rotate back",
            fun: function () {
                currentGroup.rotation.z += Math.PI * delta;
            },
            cat: "Rotation"
        },
        "o":
        {
            default: "o",
            desc: "rotate forward",
            fun: function () {
                currentGroup.rotation.z -= Math.PI * delta;
            },
            cat: "Rotation"
        },
        "2":
        {
            default: "2",
            desc: "increase action speed",
            fun: function () {
                units = Math.min(Math.max(units + 10, 0), 10000);
            },
            cat: "Speed"
        },
        "1":
        {
            default: "1",
            desc: "decrease action speed",
            fun: function () {
                units = Math.min(Math.max(units - 10, 0), 10000);
            },
            cat: "Speed"
        },
        "3":
        {
            default: "3",
            desc: "decrease scale",
            fun: function () {
                let scale = Math.min(Math.max(currentGroup.scale.x - (units/1000)*delta, 0), 15);
                currentGroup.scale.copy(new THREE.Vector3(scale, scale, scale));
            },
            cat: "Scale"
        },
        "4":
        {
            default: "4",
            desc: "increase scale",
            fun: function () {
                let scale = Math.min(Math.max(currentGroup.scale.x + (units/1000)*delta, 0), 15);
                currentGroup.scale.copy(new THREE.Vector3(scale, scale, scale));
            },
            cat: "Scale"
        }
};


let units = 500;
let currentGroup = new THREE.Group();
let leaf = new THREE.Group();
let zoom = new THREE.Group();
currentGroup = zoom;
zoom.position.copy(new THREE.Vector3(-2000, 0, 500));
zoom.rotation.copy(new THREE.Euler(0, 0, 0));
zoomElements = [];

window.addEventListener("load", function(){
    window.addEventListener("contextmenu", function(e){
        e.preventDefault();
        return false;
    });
    init();
    initBinds();
    clock.start();
    render();
});


function initBinds(){
    controlsDiv = document.getElementById("controls");
    let log = document.createElement("div");
    log.id = "log";
    controlsDiv.append(log);
    let controlsContainer = document.createElement("div");
    controlsContainer.id = "controlsContainer";
    controlsDiv.appendChild(controlsContainer);
    let regSpace = new RegExp(" ", "g");
    for(let bind in binds){
        if(binds.hasOwnProperty(bind)){
            let cat = document.getElementById(binds[bind].cat);
            if(!cat){
                cat = document.createElement("div");
                cat.id = binds[bind].cat;
                cat.classList.add("cat");
                let p = document.createElement("p");
                p.innerHTML = binds[bind].cat;
                p.classList.add("catDesc");
                p.setAttribute("open", "false");
                p.addEventListener("click", function(e){
                    let sibling = p.nextSibling;
                    if(p.getAttribute("open") === "true"){
                        while(sibling){
                            sibling.classList.remove("bindInput");
                            sibling.classList.add("hideInput");
                            sibling = sibling.nextSibling;
                        }
                        p.setAttribute("open", "false");
                    }
                    else{
                        while(sibling){
                            sibling.classList.add("bindInput");
                            sibling.classList.remove("hideInput");
                            sibling = sibling.nextSibling;
                        }
                        p.setAttribute("open", "true");
                    }
                });
                cat.appendChild(p);
                controlsContainer.appendChild(cat);
            }
            let div = document.createElement("div");
            div.classList.add("hideInput");
            let label = document.createElement("label");
            label.innerHTML = binds[bind]["desc"]+":";
            let desc = binds[bind]["desc"].replace(regSpace, "");
            label.for = desc;

            let input = document.createElement("input");
            input.contentEditable = "true";
            input.id = desc;
            input.type = "text";
            input.maxLength = "1";
            input.value = bind;
            div.appendChild(label);
            div.appendChild(input);
            cat.appendChild(div);
            controlsContainer.addEventListener("mousemove", function(e){
                e.stopPropagation();
            });
            div.addEventListener("click", function(e){
                e.stopPropagation();
                input.focus();
            });
            div.addEventListener("keypress", function(e){
                let html = "";
                if(!binds.hasOwnProperty(e.key)){
                    e.stopPropagation();
                    let obj = binds[input.value];
                    delete binds[input.value];
                    binds[e.key] = obj;
                    input.value = e.key;
                    input.blur();
                    window.focus();
                    log.style.maxHeight = "0";
                    log.style.visibility = "hidden";
                    log.style.borderBottom = "0 #c2c2c2 solid";
                    return true;
                }
                else{
                    html += "Bind Exists";
                    log.innerHTML = "<p>" + html + "</p>";
                    log.style.maxHeight = "18px";
                    log.style.visibility = "visible";
                    log.style.background = "gray";
                    log.style.borderBottom = "1px #c2c2c2 solid";
                    return false;
                }
            });
            div.addEventListener("keydown", function(e){
                e.stopPropagation();
                return false;
            });
            div.addEventListener("keyup", function(e){
                e.stopPropagation();
                return false;
            });
        }
    }
}

function init() {
    container = document.getElementById("container");
    camera = new THREE.PerspectiveCamera(89, window.innerWidth / window.innerHeight, 1, 7500);
    camera.position.z = 1250 / (Math.max(window.innerWidth, window.innerHeight) / (2500));
    scene = new THREE.Scene();
    csScene = new THREE.Scene();

    // map
    (function(){
        let div = document.createElement("div");
        div.style.width = "2500px";
        div.style.height = "1400px";
        div.style.opacity = "1";
        div.style.background = "transparent";
        let iframe = document.createElement("iframe");
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "0";
        iframe.id = "mapFrame";
        iframe.src = "leaf.html";
        iframe.addEventListener("load", function(){
            mapFrame = document.getElementById("mapFrame").contentWindow;
        });
        div.appendChild(iframe);
        object = new THREE.CSS3DObject(div);
        leaf.add(object);
        leaf.scale.set(2, 2, 2);
        csScene.add(leaf);
    })();

    // zoom control
    (function(){
        let div = document.createElement("div");
        div.style.width = "150px";
        div.style.height = "400px";
        let iframe = document.createElement("iframe");
        iframe.style.width = "150px";
        iframe.style.height = "400px";
        iframe.id = "zoomFrame";
        iframe.src ="leafZoom.html";
        iframe.addEventListener("load", function(){
            zoomFrame[0] = document.getElementById("zoomFrame").contentWindow;
        });
        div.appendChild(iframe);
        let object = new THREE.CSS3DObject(div);
        zoom.add(object);
        zoomElements[0] = object;
    })();

    // zoom control box back
    (function(){
        let div = document.createElement("div");
        div.style.width = "150px";
        div.style.height = "400px";
        div.style.background = "#ffffff";
        let iframe = document.createElement("iframe");
        iframe.style.width = "150px";
        iframe.style.height = "400px";
        iframe.id = "zoomFrame1";
        iframe.src ="leafZoom.html";
        iframe.addEventListener("load", function(){
            zoomFrame[1] = document.getElementById("zoomFrame1").contentWindow;
        });
        div.appendChild(iframe);
        let object = new THREE.CSS3DObject(div);
        object.position.set(0, 0, -100);
        object.rotation.set(zoom.rotation.x, zoom.rotation.y, zoom.rotation.z);
        zoom.add(object);
        zoomElements[1] = object;
    })();

    // zoom control box left
    (function() {
        let div = document.createElement("div");
        div.style.width = "100px";
        div.style.height = "400px";
        div.style.background = "#ffffff";
        let iframe = document.createElement("iframe");
        iframe.style.width = "100px";
        iframe.style.height = "400px";
        iframe.id = "zoomFrame2";
        iframe.src ="leafZoom.html";
        iframe.addEventListener("load", function(){
            zoomFrame[2] = document.getElementById("zoomFrame2").contentWindow;
        });
        div.appendChild(iframe);
        let object = new THREE.CSS3DObject(div);
        object.position.set(-75, 0, -50);
        object.rotation.set(0, Math.PI/2, 0);
        zoom.add(object);
        zoomElements[2] = object;
    })();

    // zoom control box right
    (function() {
        let div = document.createElement("div");
        div.style.width = "100px";
        div.style.height = "400px";
        div.style.background = "#ffffff";
        let iframe = document.createElement("iframe");
        iframe.style.width = "100px";
        iframe.style.height = "400px";
        iframe.id = "zoomFrame3";
        iframe.src ="leafZoom.html";
        iframe.addEventListener("load", function(){
            zoomFrame[3] = document.getElementById("zoomFrame3").contentWindow;
        });
        div.appendChild(iframe);
        let object = new THREE.CSS3DObject(div);
        object.position.set(75, 0, -50);
        object.rotation.set(0, Math.PI/2, 0);
        zoom.add(object);
        zoomElements[3] = object;
    })();

    // zoom control box top
    (function() {
        let div = document.createElement("div");
        div.style.width = "150px";
        div.style.height = "100px";
        div.style.background = "#ffffff";
        let iframe = document.createElement("iframe");
        iframe.style.width = "150px";
        iframe.style.height = "100px";
        iframe.id = "zoomFrame4";
        iframe.src ="leafZoomMove.html";
        iframe.addEventListener("load", function(){
            zoomFrame[4] = document.getElementById("zoomFrame4").contentWindow;
        });
        div.appendChild(iframe);
        let object = new THREE.CSS3DObject(div);
        object.position.set(0, 200, -50);
        object.rotation.set(Math.PI/2, 0, 0);
        zoom.add(object);
        zoomElements[4] = object;
    })();

    // zoom control box bottom
    (function() {
        let div = document.createElement("div");
        div.style.width = "150px";
        div.style.height = "100px";
        div.style.background = "#ffffff";
        let iframe = document.createElement("iframe");
        iframe.style.width = "150px";
        iframe.style.height = "100px";
        iframe.id = "zoomFrame5";
        iframe.src ="leafZoomMove.html";
        iframe.addEventListener("load", function(){
            zoomFrame[5] = document.getElementById("zoomFrame5").contentWindow;
        });
        div.appendChild(iframe);
        let object = new THREE.CSS3DObject(div);
        object.position.set(0, -200, -50);
        object.rotation.set(Math.PI/2, 0, 0);
        zoom.add(object);
        zoomElements[5] = object;
    })();
    csScene.add(zoom);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    csRenderer = new THREE.CSS3DRenderer();
    csRenderer.setSize(window.innerWidth, window.innerHeight);
    csRenderer.domElement.style.position = "absolute";
    csRenderer.domElement.style.top = "0";

    container.appendChild(renderer.domElement);
    container.appendChild(csRenderer.domElement);

    controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 2;
    controls.panSpeed = 1;

    window.addEventListener("resize", onWindowResize, false);

    blocker = document.getElementById("blocker");
    blocker.style.display = "none";

    container.addEventListener("mousedown", function(){
        blocker.style.display = "block";
    });

    document.addEventListener("mouseup", function(){
        blocker.style.display = "none";
    });

    document.addEventListener("keydown", addKey);
    document.addEventListener("keyup", removeKey);

}

function addKey(e){
    if(binds.hasOwnProperty(e.key))
        binds[e.key]["down"] = true;
}

function removeKey(e){
    if(binds.hasOwnProperty(e.key))
        binds[e.key]["down"] = false;
}

function setMap(e){
    map = e;
}

function zoomIn(){
    if(map)
        map.zoomIn(1);
}

function zoomOut(){
    if(map)
        map.zoomOut(1);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    csRenderer.setSize(window.innerWidth, window.innerHeight);
}

function checkKeys(){
    for(let bind in binds){
        if(binds.hasOwnProperty(bind)){
            if(binds[bind].hasOwnProperty("down")){
                if(binds[bind]["down"])
                    binds[bind].fun();
            }
        }
    }
}

function setCurrentGroup(name){
    if(name === "leaf")
        currentGroup = leaf;
    else if(name === "zoom")
        currentGroup = zoom;
}

function render() {
    delta = clock.getDelta();
    controls.update();
    checkKeys();
    renderer.render(scene, camera);
    csRenderer.render(csScene, camera);
    requestAnimationFrame(render);
}
