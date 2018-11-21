varying vec2 vUv;

varying float v_textureIndex;

void main() {

    vUv = uv;

    v_textureIndex = step(1., uv.y) + step(0., uv.x);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}