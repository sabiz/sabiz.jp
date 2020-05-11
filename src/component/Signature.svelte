<script>
import * as THREE from 'three'
import { onMount } from 'svelte'
import { createEnvironment, createShaderMesh } from './Signature'
import postVert from '../shader/post.vert'
import postFrag from '../shader/post.frag'

let time
let mesh
let env
onMount(() => {
  const elementWrapper = document.querySelector('.signature-wrapper')
  const elementCanvas = document.querySelector('.signature')
  env = createEnvironment(elementCanvas, elementWrapper.clientWidth, elementWrapper.clientHeight)
  const logoTexture = new THREE.TextureLoader().load('logo.svg')
  const uniforms = {
    uTex: {
      type: 't',
      value: logoTexture
    },
    uTime: {
      type: 'f',
      value: time
    },
    uResolution: {
      type: 'vec2',
      value: new THREE.Vector2(env.width, env.height)
    }
  }

  mesh = createShaderMesh(env, uniforms, postVert, postFrag)
  env.scene.add(mesh)
  render()
})

const render = () => {
  time = env.clock.getElapsedTime()
  mesh.material.uniforms.uTime.value = time
  env.renderer.render(env.scene, env.camera)
  requestAnimationFrame(render)
}
</script>


<div>
  <div class="signature-wrapper">
    <canvas class="signature"></canvas>
  </div>
</div>

<style lang="scss">
  .signature-wrapper {
    width: 50vw;
    height: 50vw/(16/9);
    border-radius: 15px;
    overflow: hidden;
  }
</style>
