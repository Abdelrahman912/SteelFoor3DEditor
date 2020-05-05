function Section(clearHeight, flangeWidth, webThickness, flangeThickness) {
    this.clearHeight = clearHeight || 2;
    this.flangeWidth = flangeWidth || 1;
    this.webThickness = webThickness || 0.1;
    this.flangeThickness = flangeThickness || 0.2;
}

function ISection( section, startPoint, length , rotation , color) {
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
    // scene.add(this.mesh);
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

class Beam{
    constructor(section , span , startPoint , rotation , color){
        this.section = new ISection(section , startPoint , span , rotation , color);
        this.span = span;
        this.startPoint = startPoint;
        this.endPoint = this.startPoint + span * rotation;
    }
}

function createMainBeams(scene, grid, section) {
    let span , rotation , startPoints = [] , commulativeSpacing = 0 , mainBeams = [];
    if(grid.spaceX >= grid.spaceZ){
        span = grid.spaceX.reduce(sum, 0);
        for (let i = 0; i < grid.spaceX.length; i++) {
            commulativeSpacing += grid.spaceX[i];
            mainBeams.push(new Beam(section , span , {x:commulativeSpacing,y:0,z:0} , rotation , 0xff0000));
            scene.add(mainBeams[i].section.mesh);
        }
    }
    else{
        span = grid.spaceZ.reduce(sum, 0);
        rotation = new THREE.Vector3(0, Math.PI / 2, 0);
        for (let i = 0; i < grid.spaceZ.length; i++) {
            commulativeSpacing += grid.spaceZ[i];
            mainBeams.push(new Beam(section , span , {x:0,y:0,z:commulativeSpacing} , rotation , 0xff0000));
            scene.add(mainBeams[i].section.mesh);
        }
    }
    return mainBeams;
}


function createSecondaryBeams(scene, grid, section) {
    let span , rotation , startPoints = [] , distribution , commulativeSpacing = 0 , secondaryBeams = [];
    if(grid.spaceX < grid.spaceZ){
        span = grid.spaceX.reduce(sum, 0);
        distribution = grid.spaceZ.reduce(sum, 0)+2; //the distance that secBeams will be distributed over
        for (let i = 0; commulativeSpacing < distribution; i++) {
            secondaryBeams.push(new Beam(section , span , {x:commulativeSpacing,y:0,z:0} , rotation , 0x00ff00));
            scene.add(secondaryBeams[i].section.mesh);            
            commulativeSpacing += 2;
        }
    }
    else{
        span = grid.spaceZ.reduce(sum, 0);
        distribution = grid.spaceX.reduce(sum, 0)+2;
        rotation = new THREE.Vector3(0, Math.PI / 2, 0);
        for (let i = 0; commulativeSpacing <distribution; i++) {
            secondaryBeams.push(new Beam(section , span , {x:0,y:0,z:commulativeSpacing} , rotation , 0x00ff00))
            scene.add(secondaryBeams[i].section.mesh);            
            commulativeSpacing += 2;
        }
    }
    return secondaryBeams;
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
