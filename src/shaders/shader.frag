varying vec2 vUv;

varying float v_textureIndex;
uniform sampler2D currentImage;
uniform sampler2D nextImage;

void main() {

	vec4 color = mix(texture2D(currentImage, vUv), texture2D(nextImage, vUv), v_textureIndex);
	gl_FragColor = color;

}