function Section(clearHeight, flangeWidth, webThickness, flangeThickness) {
    this.clearHeight = clearHeight || 2;
    this.flangeWidth = flangeWidth || 1;
    this.webThickness = webThickness || 0.1;
    this.flangeThickness = flangeThickness || 0.2;
}

function ISection(section, startPoint, length, rotation, material, id, path) {
    this.startPoint = startPoint || new THREE.Vector3(0, 0, 0);
    this.rotation = rotation || new THREE.Vector3(0, 0, 0);
    this.length = length || 5;
    this.section = section || new Section();
    let shape = new THREE.Shape();
    let shiftX = -this.section.flangeWidth / 2;
    let shiftY = -(this.section.clearHeight / 2 + this.section.flangeThickness);
    shape.moveTo(shiftX, shiftY);
    shape.lineTo(this.section.flangeWidth + shiftX, 0 + shiftY);
    shape.lineTo(this.section.flangeWidth + shiftX, this.section.flangeThickness + shiftY);
    shape.lineTo(this.section.flangeWidth - (this.section.flangeWidth - this.section.webThickness) / 2 + shiftX, this.section.flangeThickness + shiftY);
    shape.lineTo(this.section.flangeWidth - (this.section.flangeWidth - this.section.webThickness) / 2 + shiftX, this.section.flangeThickness + this.section.clearHeight + shiftY);
    shape.lineTo(this.section.flangeWidth + shiftX, this.section.flangeThickness + this.section.clearHeight + shiftY);
    shape.lineTo(this.section.flangeWidth + shiftX, this.section.flangeThickness + this.section.clearHeight + this.section.flangeThickness + shiftY);
    shape.lineTo(0 + shiftX, this.section.flangeThickness + this.section.clearHeight + this.section.flangeThickness + shiftY);
    shape.lineTo(0 + shiftX, this.section.flangeThickness + this.section.clearHeight + shiftY);
    shape.lineTo((this.section.flangeWidth - this.section.webThickness) / 2 + shiftX, this.section.flangeThickness + this.section.clearHeight + shiftY);
    shape.lineTo((this.section.flangeWidth - this.section.webThickness) / 2 + shiftX, this.section.flangeThickness + shiftY);
    shape.lineTo(0 + shiftX, this.section.flangeThickness + shiftY);
    shape.lineTo(0 + shiftX, 0 + shiftY);
    var extrudeSettings = {
        steps: 2,
        depth: this.length,
        bevelEnabled: false,
        // bevelThickness: 1,
        // bevelSize: 1,
        // bevelOffset: 0,
        // bevelSegments: 1,
        extrudePath: path
    };
    let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData.id = id;
    this.move = function (position) {
        position = position || new THREE.Vector3();
        if (!path) 
            this.mesh.position.copy(position);
    };
    this.rotate = function (rotation) {
        this.rotation = rotation || this.rotation;

        if (!path)
            this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    };
    this.move(this.startPoint);
    this.rotate(this.rotation);
    // scene.add(this.mesh);
}

function drawBeamByTwoPoints(start, end) {
    let span = null;
    //let rotation = (new THREE.Vector3()).subVectors(end , start).normalize().multiplyScalar(Math.PI/2);
    let path = new THREE.LineCurve3(start, end);
    let beam = new Beam(null, span, start, null, new THREE.MeshPhongMaterial({
        emissive: new THREE.Color(id),
        color: new THREE.Color(0, 0, 0),
        specular: new THREE.Color(0, 0, 0),
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        blending: THREE.NoBlending,
    }), ++id, path);
    scene.add(beam.section.mesh);
    idToObject[id] = beam.section.mesh;
    let pickingBeam = new PickingBeam(beam, id);
    pickingScene.add(pickingBeam.mesh)
    console.log(beam.section.mesh.userData.pickingBeam)
}

class Beam {
    constructor(section, span, startPoint, rotation, material, id, path) {
        this.section = new ISection(section, startPoint, span, rotation, material, id, path);
        this.span = span;
        this.startPoint = startPoint;
        this.endPoint = this.startPoint + span * rotation;
    }
}

class PickingBeam {
    constructor(beam, id) {
        let material = new THREE.MeshPhongMaterial({
            emissive: new THREE.Color(id),
            color: new THREE.Color(0, 0, 0),
            specular: new THREE.Color(0, 0, 0),
            //map: texture,
            // transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
            blending: THREE.NoBlending,
        });

        this.mesh = new THREE.Mesh(beam.section.mesh.geometry, material);
        this.mesh.position.copy(beam.section.mesh.position);
        this.mesh.rotation.copy(beam.section.mesh.rotation);
        beam.section.mesh.userData.picking = this.mesh;
    }
}


function createMainBeams(scene, pickingScene, grid, section) {
    let span, rotation, commulativeSpacing = 0, mainBeams = [];
    if (grid.spaceX >= grid.spaceZ) {
        span = grid.spaceX.reduce(sum, 0);
        rotation = new THREE.Vector3(0, Math.PI / 2, 0);
        for (let i = 0; i < grid.spaceZ.length; i++) {
            let material = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                //map: texture,
                //transparent: true,
                side: THREE.DoubleSide,
                alphaTest: 0.5,
            });
            commulativeSpacing += grid.spaceZ[i];
            mainBeams.push(new Beam(section, span, { x: 0, y: 0, z: commulativeSpacing }, rotation, material, ++id));
            scene.add(mainBeams[i].section.mesh);
            mainBeams[i].section.mesh.userData.beam = mainBeams[i];
            window.idToObject[id] = mainBeams[i].section.mesh;
            pickingScene.add(new PickingBeam(mainBeams[i], id).mesh);
        }
    }
    else {
        span = grid.spaceZ.reduce(sum, 0);
        for (let i = 0; i < grid.spaceX.length; i++) {
            let material = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                //map: texture,
                //transparent: true,
                side: THREE.DoubleSide,
                alphaTest: 0.5,
            });
            commulativeSpacing += grid.spaceX[i];
            mainBeams.push(new Beam(section, span, { x: commulativeSpacing, y: 0, z: 0 }, rotation, material, ++id));
            scene.add(mainBeams[i].section.mesh);
            mainBeams[i].section.mesh.userData.beam = mainBeams[i];
            window.idToObject[id] = mainBeams[i].section.mesh;
            pickingScene.add(new PickingBeam(mainBeams[i], id).mesh);
        }
    }
    return mainBeams;
}


function createSecondaryBeams(scene, pickingScene, grid, section) {
    let span, rotation, distribution, commulativeSpacing = 0, secondaryBeams = [];
    if (grid.spaceX < grid.spaceZ) {
        span = grid.spaceX.reduce(sum, 0);
        distribution = grid.spaceZ.reduce(sum, 0) + 2; //the distance that secBeams will be distributed over
        rotation = new THREE.Vector3(0, Math.PI / 2, 0);
        for (let i = 0; commulativeSpacing < distribution; i++) {
            let material = new THREE.MeshPhongMaterial({
                color: 0x00cc55,
                //map: texture,
                //transparent: true,
                side: THREE.DoubleSide,
                alphaTest: 0.5,
            });
            secondaryBeams.push(new Beam(section, span, { x: 0, y: 0, z: commulativeSpacing }, rotation, material, ++id));
            scene.add(secondaryBeams[i].section.mesh);
            secondaryBeams[i].section.mesh.userData.beam = secondaryBeams[i];
            window.idToObject[id] = secondaryBeams[i].section.mesh;
            pickingScene.add(new PickingBeam(secondaryBeams[i], id).mesh);
            commulativeSpacing += 2;
        }
    }
    else {
        span = grid.spaceZ.reduce(sum, 0);
        distribution = grid.spaceX.reduce(sum, 0) + 2;
        for (let i = 0; commulativeSpacing < distribution; i++) {
            let material = new THREE.MeshPhongMaterial({
                color: 0x00cc55,
                //map: texture,
                //transparent: true,
                side: THREE.DoubleSide,
                alphaTest: 0.5,
            });
            secondaryBeams.push(new Beam(section, span, { x: commulativeSpacing, y: 0, z: 0 }, rotation, material, ++id))
            scene.add(secondaryBeams[i].section.mesh);
            secondaryBeams[i].section.mesh.userData.beam = secondaryBeams[i];
            window.idToObject[id] = secondaryBeams[i].section.mesh;
            pickingScene.add(new PickingBeam(secondaryBeams[i], id).mesh);
            commulativeSpacing += 2;
        }
    }
    return secondaryBeams;
}