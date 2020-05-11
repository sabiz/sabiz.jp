import * as THREE from 'three'
import { getCssVariable } from '../utils/css'

const BACKGROUND_COLOR = getCssVariable('--bg-color')
const RESOLUTION = 32

export const createEnvironment = (canvas, requestWidth, requestHeight) => {
  const width = requestWidth
  const height = requestHeight
  const pixelRatio = window.devicePixelRatio
  const scaledWidth = width * pixelRatio
  const scaledHeight = height * pixelRatio
  const aspect = width / height
  const clock = new THREE.Clock()
  canvas.width = scaledWidth
  canvas.height = scaledHeight

  // Renderer -----------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setClearColor(BACKGROUND_COLOR)
  renderer.setPixelRatio(pixelRatio)
  renderer.setSize(width, height)

  // Scene ---------------------------------------------------------------
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000)
  camera.position.set(0, 0, +1000)
  const light = new THREE.AmbientLight('#FFFFFF')
  scene.add(light)
  const renderTarget = new THREE.WebGLRenderTarget(scaledWidth, scaledHeight)

  return {
    renderer,
    width: scaledWidth,
    height: scaledHeight,
    aspect,
    clock,
    scene,
    camera,
    light,
    renderTarget
  }
}

export const createShaderMesh = (env, uniform, vertex, fragment) => {
  const geometry = new THREE.PlaneGeometry(
    env.width,
    env.height,
    RESOLUTION * env.aspect,
    RESOLUTION * env.aspect
  )
  const material = new THREE.ShaderMaterial({
    uniforms: uniform,
    vertexShader: vertex,
    fragmentShader: fragment
  })
  return new THREE.Mesh(geometry, material)
}
