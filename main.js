let camera, delta;
let clock = new THREE.Clock(false);
let controls;

let mapFrame;
let zoomFrame = [];

let container, csRenderer, csScene, object, blocker;
let controlsDiv;
let map, leafFrame, linkFrame, tribeFrame;
function Keybind(def, desc, fun, cat){
    this.default = def;
    this.desc = desc;
    this.fun = fun;
    this.cat = cat;
}
let binds = {
        "w": new Keybind("w",
            "Translate Y Up",
            function () {
                currentGroup.position.y += units * delta;
            },
            "Translation"),
        "s": new Keybind("s",
            "Translate Y Down",
            function () {
                currentGroup.position.y -= units * delta;
            },
            "Translation"),
        "a": new Keybind("a",
            "Translate X Left",
            function () {
                currentGroup.position.x -= units * delta;
            },
            "Translation"),
        "d": new Keybind("d",
            "Translate X Right",
            function () {
                currentGroup.position.x += units * delta;
            },
            "Translation"),
        "q": new Keybind("q",
            "Translate Z Back",
            function () {
                currentGroup.position.z += units * delta;
            },
            "Translation"),
        "e": new Keybind("e",
            "Translate Z Forward",
            function () {
                currentGroup.position.z -= units * delta;
            },
            "Translation"),
        "i": new Keybind("i",
            "Rotate X Up",
            function () {
                currentGroup.rotation.x += Math.PI * delta;
            },
            "Rotation"),
        "k": new Keybind("k",
            "Rotate X Down",
            function () {
                currentGroup.rotation.x -= Math.PI * delta;
            },
            "Rotation"),
        "j": new Keybind("j",
            "Rotate Y Left",
            function () {
                currentGroup.rotation.y += Math.PI * delta;
            },
            "Rotation"),
        "l": new Keybind("j",
            "Rotate Y Right",
            function () {
                currentGroup.rotation.y -= Math.PI * delta;
            },
            "Rotation"),
        "u": new Keybind("u",
            "Rotate Z Back",
            function () {
                currentGroup.rotation.z += Math.PI * delta;
            },
            "Rotation"),
        "o": new Keybind("o",
            "Rotate Z Forward",
            function () {
                currentGroup.rotation.z -= Math.PI * delta;
            },
            "Rotation"),
        "2": new Keybind("2",
            "Increase Action Speed",
            function () {
                units = Math.min(Math.max(units + 10, 0), 10000);
            },
            "Speed"),
        "1": new Keybind("1",
            "Decrease Action Speed",
            function () {
                units = Math.min(Math.max(units - 10, 0), 10000);
            },
            "Speed"),
        "3": new Keybind("3",
            "Decrease Scale",
            function () {
                let scale = Math.min(Math.max(currentGroup.scale.x - (units/1000)*delta, 0), 15);
                currentGroup.scale.copy(new THREE.Vector3(scale, scale, scale));
            },
            "Scale"),
        "4": new Keybind("4",
            "Increase Scale",
            function () {
                let scale = Math.min(Math.max(currentGroup.scale.x + (units/1000)*delta, 0), 15);
                currentGroup.scale.copy(new THREE.Vector3(scale, scale, scale));
            },
            "Scale")
};
let bindsDown = {};

let units = 500;
let currentGroup = new THREE.Group();
let leaf = new THREE.Group();
let zoom = new THREE.Group();
let interact = new THREE.Group();
let tribes = new THREE.Group();
let all = new THREE.Group();
all.add(leaf);
all.add(interact);
all.add(tribes);
all.add(zoom);
currentGroup = zoom;
zoom.position.copy(new THREE.Vector3(-2000, 0, 500));

window.addEventListener("load", function(){
    window.addEventListener("contextmenu", function(e){
        e.preventDefault();
        return false;
    });
    init();
    initBinds();
    render();
    clock.start();
    animate();
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
    camera = new THREE.PerspectiveCamera(105, window.innerWidth / window.innerHeight, 1, 7500);
    camera.position.z = 3500 + (2100 - window.innerWidth);
    csScene = new THREE.Scene();
    csScene.add(all);

    let halfHeight = window.innerHeight/2;
    // map
    leafFrame = create("2500px", "1400px", "transparent", "0", "mapFrame", "html/leaf.html", [0, -halfHeight, 0], [0, 0, 0], [2, 2, 2], leaf)[0];
    // links
    linkFrame = create("2500px", "700px", "transparent", "0", "interactFrame", "html/interact.html", [0, 1850-halfHeight, 500], [Math.PI/4, 0, 0], [2, 2, 2], interact)[0];
    // tribes
    tribeFrame = create("1050px", "1750px", "transparent", "0", "tribeFrame", "html/tribes.html", [-3025, -halfHeight-175, 900], [0, Math.PI/3, 0], [2, 2, 2], tribes)[0];
    // zoombox front and back
    create("150px", "400px", "transparent", "0", "zoomFrame", "html/leafZoom.html", [0, 0, 0], [0, 0, 0], [1, 1, 1], zoom);
    create("150px", "400px", "transparent", "0", "zoomFrame1", "html/leafZoom.html", [0, 0, -100], [0, 0, 0], [1, 1, 1], zoom);
    // zoombox left and right
    create("100px", "400px", "transparent", "0", "zoomFrame2", "html/leafZoom.html", [-75, 0, -50], [0, Math.PI/2, 0], [1, 1, 1], zoom);
    create("100px", "400px", "transparent", "0", "zoomFrame3", "html/leafZoom.html", [75, 0, -50], [0, Math.PI/2, 0], [1, 1, 1], zoom);
    // zoombox top and bottom
    create("150px", "100px", "transparent", "0", "zoomFrame4", "html/leafZoomMove.html", [0, 200, -50], [Math.PI/2, 0, 0], [1, 1, 1], zoom);
    create("150px", "100px", "transparent", "0", "zoomFrame5", "html/leafZoomMove.html", [0, -200, -50], [Math.PI/2, 0, 0], [1, 1, 1], zoom);
    zoom.position.setY(-halfHeight);

    csRenderer = new THREE.CSS3DRenderer();
    csRenderer.setSize(window.innerWidth, window.innerHeight);
    csRenderer.domElement.style.position = "absolute";
    csRenderer.domElement.style.top = "0";

    container.appendChild(csRenderer.domElement);

    controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 2;
    controls.panSpeed = 2;
    controls.staticMoving = true;
    controls.addEventListener("change", render);
    window.addEventListener("resize", onWindowResize);

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

function create(width, height, background, border, id, src, position, rotation, scale, group){
    let iframe = document.createElement("iframe");
    iframe.style.width = width;
    iframe.style.height = height;
    iframe.style.background = background;
    iframe.style.border = border;
    iframe.id = id;
    iframe.src = src;
    let object = new THREE.CSS3DObject(iframe);
    group.add(object);
    object.position.set(position[0], position[1], position[2]);
    object.rotation.set(rotation[0], rotation[1], rotation[2]);
    object.scale.set(scale[0], scale[1], scale[2]);
    return [iframe, object];
}

function addKey(e){
    if(binds.hasOwnProperty(e.key))
        bindsDown[e.key] = binds[e.key];
}

function removeKey(e){
    if(bindsDown.hasOwnProperty(e.key))
        delete bindsDown[e.key];
}

function setMap(e){
    map = e;
}

function zoomIn(){
    if(map)
        map.zoomIn();
}

function zoomOut(){
    if(map)
        map.zoomOut();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    csRenderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function checkKeys(){
    for(let bind in bindsDown){
        if(bindsDown.hasOwnProperty(bind)){
            bindsDown[bind].fun();
            render();
        }
    }
}

function setCurrentGroup(name){
    if(name === "leaf")
        currentGroup = leaf;
    else if(name === "zoom")
        currentGroup = zoom;
    else if(name === "interact")
        currentGroup = interact;
    else if(name === "tribes")
        currentGroup = tribes;
}

function animate(){
    requestAnimationFrame(animate);
    delta = clock.getDelta();
    checkKeys();
    controls.update();
}

function setTribes(e){
    let ul = tribeFrame.contentDocument.getElementById("content");
    while (ul.hasChildNodes()) {
        ul.removeChild(ul.firstChild);
    }
    e.forEach(function(item){
        if(item.propContent !== null) {
            let li = tribeFrame.contentDocument.createElement("li");
            li.innerHTML += item.propName + ": ";
            let tribes = item.propContent.split(";");
            tribes.forEach(function(tribe){
                let a = tribeFrame.contentDocument.createElement("a");
                a.onclick = function () {
                    leafFrame.contentWindow.highlightTribe(item.propName, tribe);
                };
                a.innerHTML = tribe;
                a.classList.add("tribe");
                li.appendChild(a);
            });
            ul.appendChild(li);
        }
    });
}

function setLinks(e){
    let ul = linkFrame.contentDocument.getElementById("content");
    while (ul.hasChildNodes()) {
        ul.removeChild(ul.firstChild);
    }
    e.forEach(function(item){
        if(item.link !== null) {
            let li = linkFrame.contentDocument.createElement("li");
            li.innerHTML += item.propName + ":";
            let a = linkFrame.contentDocument.createElement("a");
            a.onclick = function () {
                window.open(item.link);
            };
            a.innerHTML = item.propContent;
            a.classList.add("link");
            li.appendChild(a);
            ul.appendChild(li);
        }
    });
}

function render() {
    csRenderer.render(csScene, camera);
}
