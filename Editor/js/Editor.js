function Grid(scene, spaceX, spaceZ, numberInX, numberInZ) {
    let shift = 50 / 2;
    this.spaceX = spaceX;
    this.spaceZ = spaceZ;
    this.numberInX = numberInX;
    this.numberInZ = numberInZ;
    this.lineLengthInX = spaceX * (numberInX - 1) + 2 * shift;
    this.lineLengthInZ = spaceZ * (numberInZ - 1) + 2 * shift;
    this.linesInX = [];
    this.linesInZ = [];
    let accumlateSpaceX = 0;
    let accumlateSpaceZ = 0;

    for (let i = 0; i < numberInX; i++) {
        this.linesInX[i] = new Line(scene, new THREE.Vector3(accumlateSpaceX, 0, -shift), new THREE.Vector3(0, 0, 1), this.lineLengthInZ);
        accumlateSpaceX += spaceX;
    }
    for (let i = 0; i < numberInZ; i++) {

        this.linesInZ[i] = new Line(scene, new THREE.Vector3(-shift, 0, accumlateSpaceZ), new THREE.Vector3(1, 0, 0), this.lineLengthInX);
        accumlateSpaceZ += spaceZ;
    }


}

function Line(scene, startPoint, direction, length) {
    this.startPoint = startPoint || new THREE.Vector3(0, 0, 0);
    this.direction = direction || new THREE.Vector3(1, 0, 0);
    this.length = length || 1000;
    this.endPoint = new THREE.Vector3(this.startPoint.x + this.length * this.direction.x, this.startPoint.y + this.length * this.direction.y, this.startPoint.z + this.length * this.direction.z);
    this.material = new THREE.LineDashedMaterial({
        color: 0xff33ff,
        gapSize: 10,
        dashSize: 3,
        scale: 1
    });
    this.geometry = new THREE.BufferGeometry().setFromPoints([this.startPoint, this.endPoint]);
    this.line = new THREE.Line(this.geometry, this.material);
    scene.add(this.line);
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

function ISection(scene, section, startPoint, length) {
    this.startPoint = startPoint || new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);
    this.length = length || 100;
    this.section = section || new Section();
    let material = new THREE.MeshPhongMaterial({
        color: 0xff0000,
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

function MainBeams(scene, grid, section) {
    this.section = section || new Section();
    this.beams = [];
    this.span = grid.spaceX > grid.spaceZ ? grid.spaceX : grid.spaceZ;
    let index = 0;
    let x = 0;
    let z = 0;
    if (this.span === grid.spaceZ) {
        for (let i = 0; i < grid.numberInX; i++) {
            for (let j = 0; j < grid.numberInZ - 1; j++) {
                this.beams[index] = new ISection(scene, section, new THREE.Vector3(x, 0, z), this.span);
                z += this.span;
                index++;
            }
            z = 0;
            x += grid.spaceX;
        }
    } else {
        console.log("else");
        let rotation = new THREE.Vector3(0, Math.PI / 2, 0)
        for (let i = 0; i < grid.numberInZ; i++) {
            for (let j = 0; j < grid.numberInX - 1; j++) {
                this.beams[index] = new ISection(scene, section, new THREE.Vector3(x, 0, z), this.span);
                this.beams[index].rotate(rotation)
                x += this.span;
                index++;
            }
            x = 0;
            z += grid.spaceZ;
        }

    }

}