function Grid(scene, spaceX, spaceZ, numberInX, numberInZ) {
    //the line extention from intersection
    let shift = 0.05 * (spaceX.reduce(sum, 0) + spaceZ.reduce(sum, 0));

    //spacing in x-direction
    this.spaceX = spaceX;
    //spacing in z-direction
    this.spaceZ = spaceZ;
    //No of grids in x-direction
    this.numberInX = numberInX;
    //No of grids in z-direction
    this.numberInZ = numberInZ;

    //Variable spacing:
    this.lineLengthInX = spaceX.reduce(sum, 0) + 2 * shift;
    this.lineLengthInZ = spaceZ.reduce(sum, 0) + 2 * shift;

    //Constant spacing
    // this.lineLengthInX = spaceX * (numberInX - 1) + 2 * shift;
    // this.lineLengthInZ = spaceZ * (numberInZ - 1) + 2 * shift;

    //Create a Group of grid lines
    this.linesInX = new THREE.Group();
    this.linesInZ = new THREE.Group();

    let accumlateSpaceX = 0;
    let accumlateSpaceZ = 0;

    //Fill the horizontal Group 
    for (let i = 0; i < numberInX; i++) {
        accumlateSpaceX += spaceX[i];
        this.linesInX.add(new Line(new THREE.Vector3(accumlateSpaceX, 0, -shift), new THREE.Vector3(0, 0, 1), this.lineLengthInZ).line);
    }
    scene.add(this.linesInX); //Add line Group to the scene

    //Fill the vertical Group 
    for (let i = 0; i < numberInZ; i++) {
        accumlateSpaceZ += spaceZ[i];
        this.linesInZ.add((new Line(new THREE.Vector3(-shift, 0, accumlateSpaceZ), new THREE.Vector3(1, 0, 0), this.lineLengthInX)).line);
    }
    scene.add(this.linesInZ); //Add line Group to the scene
}

function Line(startPoint, direction, length) {
    this.startPoint = startPoint || new THREE.Vector3(0, 0, 0);
    this.direction = direction || new THREE.Vector3(1, 0, 0);
    this.length = length || 1000;
    this.endPoint = new THREE.Vector3(this.startPoint.x + this.length * this.direction.x, this.startPoint.y + this.length * this.direction.y, this.startPoint.z + this.length * this.direction.z);
    this.material = new THREE.LineDashedMaterial({
        color: 0xff33ff,
        gapSize: 0.5,
        dashSize: 3,
        scale: 1
    });
    this.geometry = new THREE.BufferGeometry().setFromPoints([this.startPoint, this.endPoint]);
    this.line = new THREE.Line(this.geometry, this.material);
    this.line.computeLineDistances();
}

// function Solid(scene, startPoint, dimensions, rotation, color) { //
//     this.startPoint = startPoint || new THREE.Vector3(0, 0, 0);
//     this.dimensions = dimensions || new THREE.Vector3(2, 0.1, 100);
//     this.rotation = rotation || new THREE.Vector3(0, 0, 0);
//     this.color = color || 0xffafaf;
//     let geometry = new THREE.BoxGeometry(1, 1, 1);
//     let material = new THREE.MeshPhongMaterial({
//         color: this.color,
//         side: THREE.DoubleSide
//     });
//     this.mesh = new THREE.Mesh(geometry, material);
//     this.mesh.position.set(this.startPoint.x, this.startPoint.y, this.startPoint.z + this.dimensions.z / 2);
//     this.mesh.scale.set(this.dimensions.x, this.dimensions.y, this.dimensions.z);
//     this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
//     this.mesh.userData = this;
//     scene.add(this.mesh);
// }

function Section(clearHeight, flangeWidth, webThickness, flangeThickness) {
    this.clearHeight = clearHeight || 2;
    this.flangeWidth = flangeWidth || 1;
    this.webThickness = webThickness || 0.1;
    this.flangeThickness = flangeThickness || 0.2;
}

function ISection(scene, section, startPoint, length , rotation , color) {
    this.startPoint = startPoint || new THREE.Vector3(0, 0, 0);
    this.rotation = rotation || new THREE.Vector3(0, 0, 0);
    this.length = length || 100;
    this.section = section || new Section();
    let material = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide
    });
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
        bevelThickness: 1,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 1
    };
    let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    this.mesh = new THREE.Mesh(geometry, material);
    this.move = function (position) {
        this.startPoint = position || this.startPoint;
        this.mesh.position.set(this.startPoint.x, this.startPoint.y, this.startPoint.z);
    };
    this.rotate = function (rotation) {
        this.rotation = rotation || this.rotation;
        this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    };
    this.move();
    this.rotate();
    scene.add(this.mesh);
}

// function MainBeams(scene, grid, section) {
//     this.section = section || new Section();
//     this.beams = [];
//     this.span = grid.spaceX > grid.spaceZ ? grid.spaceX : grid.spaceZ;
//     if (this.span === grid.spaceZ) {
//         let x = 0;
//         for (let i = 0; i < grid.numberInX; i++) {
//             x += grid.spaceX[i];
//             this.beams[i] = new ISection(scene, section, new THREE.Vector3(x, 0, 0), grid.spaceZ.reduce(sum, 0),null ,0xff0000);
//         }
//     } else {
//         let z = 0;
//         let rotation = new THREE.Vector3(0, Math.PI / 2, 0)
//         for (let i = 0; i < grid.numberInZ; i++) {
//             z += grid.spaceZ[i];
//             this.beams[i] = new ISection(scene, section, new THREE.Vector3(0, 0, z), grid.spaceX.reduce(sum, 0) , rotation , 0xff0000);
//         }
//     }
// }
function createMainBeams(scene, grid, section) {
    let span , rotation , startPoints = [];
    if(grid.spaceX >= grid.spaceZ){
        span = grid.spaceX.reduce(sum, 0);
        let x = 0;
        for (let i = 0; i < grid.spaceX.length; i++) {
            x += grid.spaceX[i];
            startPoints[i] = {x:x,y:0,z:0};            
        }
    }
    else{
        span = grid.spaceZ.reduce(sum, 0);
        let z = 0;
        for (let i = 0; i < grid.spaceZ.length; i++) {
            z += grid.spaceZ[i];
            startPoints[i] = {x:0,y:0,z:z};            
        }
    }
    return new Beams(scene , section , span , rotation , startPoints ,  0xff0000);
}

function Beams(scene , section , length , direction , startPoints , color){
    this.section = section || new Section();
    this.span = length;
    this.beams = [];
        for (let i = 0; i < startPoints.length; i++) {
            this.beams[i] = new ISection(scene, section, startPoints[i],length,direction ,color);
        }
}

function createSecondaryBeams(scene, grid, section) {
    let span , rotation , startPoints = [] , distribution;
    if(grid.spaceX < grid.spaceZ){
        span = grid.spaceX.reduce(sum, 0);
        distribution = grid.spaceZ.reduce(sum, 0)+2;
        let x = 0;
        for (let i = 0; x < distribution; i++) {
            startPoints[i] = {x:x,y:0,z:0};            
            x += 2;
        }
    }
    else{
        span = grid.spaceZ.reduce(sum, 0);
        distribution = grid.spaceX.reduce(sum, 0)+2;
        let z = 0;
        rotation = new THREE.Vector3(0, Math.PI / 2, 0);
        for (let i = 0; z <distribution; i++) {
            startPoints[i] = {x:0,y:0,z:z};            
            z += 2;
        }
    }
    return new Beams(scene , section , span , rotation , startPoints ,  0x00ff00);
}

// function SecondaryBeams(scene, grid, section) {
//     this.section = section || new Section();
//     this.beams = [];
//     this.span = grid.spaceZ < grid.spaceX ? grid.spaceZ : grid.spaceX;
//     if (this.span === grid.spaceZ) {
//         let x = 0;
//         let wide= grid.spaceX.reduce(sum, 0)+2;
//         for (let i = 0; x < wide; i++) {
//             this.beams[i] = new ISection(scene, section, new THREE.Vector3(x, 0, 0), grid.spaceZ.reduce(sum, 0), null , 0x00ff00);
//             x += 2;
//         }
//     } else {
//         let z = 0;
//         let rotation = new THREE.Vector3(0, Math.PI / 2, 0)
//         let wide= grid.spaceZ.reduce(sum, 0)+2;
//         for (let i = 0; z < wide; i++) {
//             this.beams[i] = new ISection(scene, section, new THREE.Vector3(0, 0, z), grid.spaceX.reduce(sum, 0),rotation, 0x00ff00);
//             z += 2;
//         }
//     }
// }

function sum(a, b) {
    return a + b;
}

function createNodes(scene, coordX, coordZ) {
    let nodes = new THREE.Group();
    let points = getPoints(coordX, coordZ);
    for (let i = 0; i < points.length; i++) {
        nodes.add(new Node(points[i]));
    }
    scene.add(nodes);
    return nodes;
}

function getPoints(coordX, coordZ) {
    let accumlateX = 0, accumlateZ = 0;
    let points = [];
    for (let i = 0; i < coordX.length; i++) {
        accumlateX += coordX[i];
        for (let j = 0; j < coordZ.length; j++) {
            accumlateZ += coordZ[j]
            points.push({ x: accumlateX, y: 0, z: accumlateZ });
        }
        accumlateZ = 0;
    }
    return points
}


function Node(point) {
    var geometry = new THREE.SphereGeometry(0.05, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x337ab7 });
    var node = new THREE.Mesh(geometry, material);
    node.position.set(point.x, point.y, point.z);
    return node;
}