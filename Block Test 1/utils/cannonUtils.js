import * as THREE from "./../lib/Three.js";
var CannonUtils = /** @class */ (function () {
    function CannonUtils() {
    }
    CannonUtils.CreateTrimesh = function (geometry) {
        if (!geometry.attributes) {
            geometry = new THREE.BufferGeometry().fromGeometry(geometry);
        }
        var vertices = (geometry.attributes.position.array);
        var indices = Object.keys(vertices).map(Number);
        return new CANNON.Trimesh(vertices, indices);
    };
    CannonUtils.CreateConvexPolyhedron = function (geometry) {
        if (!geometry.vertices) {
            geometry = new THREE.Geometry().fromBufferGeometry(geometry);
            geometry.mergeVertices();
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
        }
        var points = geometry.vertices.map(function (v) {
            return new CANNON.Vec3(v.x, v.y, v.z);
        });
        var faces = geometry.faces.map(function (f) {
            return [f.a, f.b, f.c];
        });
        return new CANNON.ConvexPolyhedron(points, faces);
    };
    return CannonUtils;
}());
export default CannonUtils;
