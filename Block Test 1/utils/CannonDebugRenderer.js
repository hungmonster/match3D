
// MIT License
// Original file https://github.com/schteppe/cannon.js/blob/908aa1e954b54d05a43dd708584e882dfe30ae29/tools/threejs/CannonDebugRenderer.js CopyRight https://github.com/schteppe
// Differences Copyright 2020 Sean Bradley : https://sbcode.net/threejs/
// - Added import statements for THREE
// - Converted to a class with a default export,
// - Converted to TypeScript
// - Added cylinder geometry, particle geometry and material
// - Highlight faces that the CONVEXPOLYHEDRON thinks are pointing into the shape.
import * as THREE from "./../lib/Three.js";
var CannonDebugRenderer = /** @class */ (function () {
    function CannonDebugRenderer(scene, world, options) {
        this._particleMaterial = new THREE.PointsMaterial();
        this.tmpVec0 = new CANNON.Vec3();
        this.tmpVec1 = new CANNON.Vec3();
        this.tmpVec2 = new CANNON.Vec3();
        this.tmpQuat0 = new CANNON.Quaternion();
        options = options || {};
        this.scene = scene;
        this.world = world;
        this._meshes = [];
        this._material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true
        });
        this._particleMaterial = new THREE.PointsMaterial({
            color: 0xff0000,
            size: 10,
            sizeAttenuation: false,
            depthTest: false
        });
        this._sphereGeometry = new THREE.SphereGeometry(1);
        this._boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        this._planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
        this._cylinderGeometry = new THREE.CylinderGeometry(1, 1, 10, 10);
        this._particleGeometry = new THREE.Geometry();
        this._particleGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    }
    CannonDebugRenderer.prototype.update = function () {
        var bodies = this.world.bodies;
        var meshes = this._meshes;
        var shapeWorldPosition = this.tmpVec0;
        var shapeWorldQuaternion = this.tmpQuat0;
        var meshIndex = 0;
        for (var i = 0; i !== bodies.length; i++) {
            var body = bodies[i];
            for (var j = 0; j !== body.shapes.length; j++) {
                var shape = body.shapes[j];
                this._updateMesh(meshIndex, body, shape);
                var mesh = meshes[meshIndex];
                if (mesh) {
                    // Get world position
                    body.quaternion.vmult(body.shapeOffsets[j], shapeWorldPosition);
                    body.position.vadd(shapeWorldPosition, shapeWorldPosition);
                    // Get world quaternion
                    body.quaternion.mult(body.shapeOrientations[j], shapeWorldQuaternion);
                    // Copy to meshes
                    mesh.position.x = shapeWorldPosition.x;
                    mesh.position.y = shapeWorldPosition.y;
                    mesh.position.z = shapeWorldPosition.z;
                    mesh.quaternion.x = shapeWorldQuaternion.x;
                    mesh.quaternion.y = shapeWorldQuaternion.y;
                    mesh.quaternion.z = shapeWorldQuaternion.z;
                    mesh.quaternion.w = shapeWorldQuaternion.w;
                }
                meshIndex++;
            }
        }
        for (var i = meshIndex; i < meshes.length; i++) {
            var mesh = meshes[i];
            if (mesh) {
                this.scene.remove(mesh);
            }
        }
        meshes.length = meshIndex;
    };
    CannonDebugRenderer.prototype._updateMesh = function (index, body, shape) {
        var mesh = this._meshes[index];
        if (!this._typeMatch(mesh, shape)) {
            if (mesh) {
                this.scene.remove(mesh);
            }
            mesh = this._meshes[index] = this._createMesh(shape);
        }
        this._scaleMesh(mesh, shape);
    };
    CannonDebugRenderer.prototype._typeMatch = function (mesh, shape) {
        if (!mesh) {
            return false;
        }
        var geo = mesh.geometry;
        return ((geo instanceof THREE.SphereGeometry && shape instanceof CANNON.Sphere) ||
            (geo instanceof THREE.BoxGeometry && shape instanceof CANNON.Box) ||
            (geo instanceof THREE.PlaneGeometry && shape instanceof CANNON.Plane) ||
            (geo.id === shape.geometryId &&
                shape instanceof CANNON.ConvexPolyhedron) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.Trimesh) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.Heightfield));
    };
    CannonDebugRenderer.prototype._createMesh = function (shape) {
        var mesh;
        var geometry;
        var v0;
        var v1;
        var v2;
        var material = this._material;
        switch (shape.type) {
            case CANNON.Shape.types.SPHERE:
                mesh = new THREE.Mesh(this._sphereGeometry, material);
                break;
            case CANNON.Shape.types.BOX:
                mesh = new THREE.Mesh(this._boxGeometry, material);
                break;
            case CANNON.Shape.types.PLANE:
                mesh = new THREE.Mesh(this._planeGeometry, material);
                break;
            case CANNON.Shape.types.CYLINDER:
                mesh = new THREE.Mesh(this._cylinderGeometry, material);
                break;
            case CANNON.Shape.types.PARTICLE:
                mesh = new THREE.Points(this._particleGeometry, this._particleMaterial);
                break;
            case CANNON.Shape.types.CONVEXPOLYHEDRON:
                // Create mesh
                geometry = new THREE.Geometry();
                // Add vertices
                for (var i = 0; i < shape.vertices.length; i++) {
                    var v = shape.vertices[i];
                    geometry.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
                }
                for (var i = 0; i < shape.faces.length; i++) {
                    var face = shape.faces[i];
                    // add triangles
                    var a = face[0];
                    for (var j = 1; j < face.length - 1; j++) {
                        var b = face[j];
                        var c = face[j + 1];
                        geometry.faces.push(new THREE.Face3(a, b, c));
                    }
                }
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                mesh = new THREE.Mesh(geometry, material);
                shape.geometryId = geometry.id;
                //highlight faces that the CONVEXPOLYHEDRON thinks are pointing into the shape.
                geometry.faces.forEach(function (f) {
                    var n = f.normal;
                    n.negate();
                    f.normal = n;
                    var v1 = geometry.vertices[f.a];
                    if (n.dot(v1) > 0) {
                        var v2_1 = geometry.vertices[f.b];
                        var v3 = geometry.vertices[f.c];
                        var p = new THREE.Vector3();
                        p.x = (v1.x + v2_1.x + v3.x) / 3;
                        p.y = (v1.y + v2_1.y + v3.y) / 3;
                        p.z = (v1.z + v2_1.z + v3.z) / 3;
                        var g = new THREE.Geometry();
                        g.vertices.push(v1, v2_1, v3);
                        g.faces.push(new THREE.Face3(0, 1, 2));
                        g.computeFaceNormals();
                        var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
                        mesh.add(m);
                    }
                });
                break;
            case CANNON.Shape.types.TRIMESH:
                geometry = new THREE.Geometry();
                v0 = this.tmpVec0;
                v1 = this.tmpVec1;
                v2 = this.tmpVec2;
                for (var i = 0; i < shape.indices.length / 3; i++) {
                    shape.getTriangleVertices(i, v0, v1, v2);
                    geometry.vertices.push(new THREE.Vector3(v0.x, v0.y, v0.z), new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z));
                    var j = geometry.vertices.length - 3;
                    geometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
                }
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                mesh = new THREE.Mesh(geometry, material);
                shape.geometryId = geometry.id;
                break;
            case CANNON.Shape.types.HEIGHTFIELD:
                geometry = new THREE.Geometry();
                v0 = this.tmpVec0;
                v1 = this.tmpVec1;
                v2 = this.tmpVec2;
                for (var xi = 0; xi < shape.data.length - 1; xi++) {
                    for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
                        for (var k = 0; k < 2; k++) {
                            shape.getConvexTrianglePillar(xi, yi, k === 0);
                            v0.copy(shape.pillarConvex.vertices[0]);
                            v1.copy(shape.pillarConvex.vertices[1]);
                            v2.copy(shape.pillarConvex.vertices[2]);
                            v0.vadd(shape.pillarOffset, v0);
                            v1.vadd(shape.pillarOffset, v1);
                            v2.vadd(shape.pillarOffset, v2);
                            geometry.vertices.push(new THREE.Vector3(v0.x, v0.y, v0.z), new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z));
                            var i = geometry.vertices.length - 3;
                            geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
                        }
                    }
                }
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                mesh = new THREE.Mesh(geometry, material);
                shape.geometryId = geometry.id;
                break;
        }
        if (mesh) {
            this.scene.add(mesh);
        }
        return mesh;
    };
    CannonDebugRenderer.prototype._scaleMesh = function (mesh, shape) {
        switch (shape.type) {
            case CANNON.Shape.types.SPHERE:
                var radius = shape.radius;
                mesh.scale.set(radius, radius, radius);
                break;
            case CANNON.Shape.types.BOX:
                var halfExtents = shape.halfExtents;
                mesh.scale.copy(new THREE.Vector3(halfExtents.x, halfExtents.y, halfExtents.z));
                mesh.scale.multiplyScalar(2);
                break;
            case CANNON.Shape.types.CONVEXPOLYHEDRON:
                mesh.scale.set(1, 1, 1);
                break;
            case CANNON.Shape.types.TRIMESH:
                var scale = shape.scale;
                mesh.scale.copy(new THREE.Vector3(scale.x, scale.y, scale.z));
                break;
            case CANNON.Shape.types.HEIGHTFIELD:
                mesh.scale.set(1, 1, 1);
                break;
        }
    };
    return CannonDebugRenderer;
}());
export default CannonDebugRenderer;
