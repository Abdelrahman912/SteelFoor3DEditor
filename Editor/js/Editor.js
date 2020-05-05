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


function sum(a, b) {
    return a + b;
}


function createNodes(scene, coordX, coordZ) {
    let nodeGroup = new THREE.Group();
    let nodes = [];
    let points = getPoints(coordX, coordZ);
    for (let i = 0; i < points.length; i++) {
        nodes.push(new Node(points[i]));
        nodeGroup.add(nodes[i].mesh);
    }
    nodes.nodeGroup = nodeGroup;
    scene.add(nodeGroup);
    console.log(scene)
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



class Node {
    constructor(point , support) {
        var geometry = new THREE.SphereGeometry(0.05, 32, 32);
        var material = new THREE.MeshPhongMaterial({
            color: 0x337ab7,
            //side: THREE.DoubleSide
        });
        // var material = new THREE.MeshBasicMaterial({ color: 0x337ab7 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(point.x, point.y, point.z);
        this.support = support;
    }
}