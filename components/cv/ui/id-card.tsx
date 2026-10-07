'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { useTheme } from 'next-themes'
import { Canvas, useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier'
import type { RapierRigidBody, RigidBodyProps } from '@react-three/rapier'
import { setIdCardHover } from '@/lib/cv/id-card-cursor'
import { cn } from '@/lib/cv/utils'
import { assetPath } from '@/lib/cv/site'
const CARD_MODEL_URL = assetPath('/models/lanyard/card.glb')
const ROPE_RADIUS = 0.1
const ROPE_RADIAL_SEGMENTS = 24
const ROPE_TAPER_FRACTION = 0.06
const CARD_ROPE_ANCHOR_Y = 1.1
const ROPE_TOP_EXTENSION = -0.5
const PIN_IMAGE_URL = assetPath('/images/3d-card/pin.webp')
const PIN_IMAGE_ASPECT = 1024 / 1536
const PIN_IMAGE_BOTTOM_PAD_FRACTION = (1536 - 1432) / 1536
const CARD_TOP_EDGE_Y = 0.93
const PIN_PLANE_HEIGHT = 1.4
const PIN_PLANE_WIDTH = PIN_PLANE_HEIGHT * PIN_IMAGE_ASPECT
const PIN_PLANE_Y = CARD_TOP_EDGE_Y + PIN_PLANE_HEIGHT * -PIN_IMAGE_BOTTOM_PAD_FRACTION
const PIN_PLANE_X = 0
const PIN_PLANE_Z = ROPE_RADIUS + 0.06
const HOLE_PATCH_LOCAL_X = 0
const HOLE_PATCH_LOCAL_Y = 0.942
const HOLE_PATCH_LOCAL_SIZE = 0.055
const HOLE_PATCH_UV_OFFSET = [0.2308, 0.0443] as const
const HOLE_PATCH_UV_REPEAT = [0.0375, 0.0405] as const
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 }
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.755 }
const ACCENT_STRIPE_HEIGHT_RATIO = 0.03
type CardGltf = {
  nodes: {
    card: THREE.Mesh
  }
  materials: {
    base: THREE.MeshStandardMaterial
  }
}
type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3
}
const getLerped = (body: LanyardRigidBody) => {
  if (!body.lerped) {
    body.lerped = new THREE.Vector3().copy(body.translation())
  }
  return body.lerped
}
const buildTaperedTubeGeometry = (
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radius: number,
  radialSegments: number,
  taperFraction: number
) => {
  const frames = curve.computeFrenetFrames(tubularSegments, false)
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const vertex = new THREE.Vector3()
  const normal = new THREE.Vector3()
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments
    const point = curve.getPointAt(t)
    const N = frames.normals[i]
    const B = frames.binormals[i]
    const ringRadius = t < taperFraction ? radius * (t / taperFraction) : radius
    for (let j = 0; j <= radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2
      const sin = Math.sin(angle)
      const cos = -Math.cos(angle)
      normal.x = cos * N.x + sin * B.x
      normal.y = cos * N.y + sin * B.y
      normal.z = cos * N.z + sin * B.z
      normal.normalize()
      normals.push(normal.x, normal.y, normal.z)
      vertex.x = point.x + ringRadius * normal.x
      vertex.y = point.y + ringRadius * normal.y
      vertex.z = point.z + ringRadius * normal.z
      positions.push(vertex.x, vertex.y, vertex.z)
      uvs.push(t, j / radialSegments)
    }
  }
  for (let j = 1; j <= tubularSegments; j++) {
    for (let i = 1; i <= radialSegments; i++) {
      const a = (radialSegments + 1) * (j - 1) + (i - 1)
      const b = (radialSegments + 1) * j + (i - 1)
      const c = (radialSegments + 1) * j + i
      const d = (radialSegments + 1) * (j - 1) + i
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  return geometry
}
type BandProps = {
  frontImage: string
  isMobile: boolean
}
const Band = ({ frontImage, isMobile }: BandProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const rope = useRef<THREE.Mesh>(null!)
  const fixed = useRef<RapierRigidBody>(null!)
  const j1 = useRef<LanyardRigidBody>(null!)
  const j2 = useRef<LanyardRigidBody>(null!)
  const j3 = useRef<RapierRigidBody>(null!)
  const card = useRef<RapierRigidBody>(null!)
  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const cardQuat = new THREE.Quaternion()
  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 1.5,
    linearDamping: 1.5,
  }
  const { nodes, materials } = useGLTF(CARD_MODEL_URL) as unknown as CardGltf
  const frontTexture = useTexture(frontImage)
  const pinTexture = useTexture(PIN_IMAGE_URL)
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture
    const baseImage = baseMap.image as HTMLImageElement
    const width = baseImage.width
    const height = baseImage.height
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return baseMap
    ctx.drawImage(baseImage, 0, 0, width, height)
    const image = frontTexture.image as HTMLImageElement
    for (const uvRect of [FRONT_UV_RECT, BACK_UV_RECT]) {
      const rx = uvRect.x * width
      const ry = uvRect.y * height
      const rw = uvRect.w * width
      const rh = uvRect.h * height
      const scale = Math.max(rw / image.width, rh / image.height)
      const dw = image.width * scale
      const dh = image.height * scale
      const dx = rx + (rw - dw) / 2
      const dy = ry + (rh - dh) / 2
      ctx.save()
      ctx.beginPath()
      ctx.rect(rx, ry, rw, rh)
      ctx.clip()
      ctx.drawImage(image, dx, dy, dw, dh)
      ctx.fillStyle = '#ff5c00'
      ctx.fillRect(rx, ry, rw, rh * ACCENT_STRIPE_HEIGHT_RATIO)
      ctx.restore()
    }
    const composite = new THREE.CanvasTexture(canvas)
    composite.colorSpace = THREE.SRGBColorSpace
    composite.flipY = baseMap.flipY
    composite.anisotropy = 16
    composite.needsUpdate = true
    return composite
  }, [frontTexture, materials.base.map])
  const holePatchTexture = useMemo(() => {
    const texture = cardMap.clone()
    texture.offset.set(...HOLE_PATCH_UV_OFFSET)
    texture.repeat.set(...HOLE_PATCH_UV_REPEAT)
    texture.needsUpdate = true
    return texture
  }, [cardMap])
  const [curve] = useState(() => {
    const rope = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ])
    rope.curveType = 'chordal'
    return rope
  })
  const [dragged, drag] = useState<THREE.Vector3 | false>(false)
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.85])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.85])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.85])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, CARD_ROPE_ANCHOR_Y, 0],
  ])
  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      })
    }
    if (fixed.current) {
      ;[j1, j2].forEach((ref) => {
        const lerped = getLerped(ref.current)
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, lerped.distanceTo(ref.current.translation()))
        )
        lerped.lerp(ref.current.translation(), delta * 50 * clampedDistance)
      })
      const cardPos = card.current.translation()
      const cardRot = card.current.rotation()
      cardQuat.set(cardRot.x, cardRot.y, cardRot.z, cardRot.w)
      curve.points[0]
        .set(0, CARD_ROPE_ANCHOR_Y + ROPE_TOP_EXTENSION, 0)
        .applyQuaternion(cardQuat)
        .add(vec.set(cardPos.x, cardPos.y, cardPos.z))
      curve.points[1].copy(getLerped(j2.current))
      curve.points[2].copy(getLerped(j1.current))
      curve.points[3].copy(fixed.current.translation())
      const oldRopeGeometry = rope.current.geometry
      rope.current.geometry = buildTaperedTubeGeometry(
        curve,
        isMobile ? 16 : 32,
        ROPE_RADIUS,
        ROPE_RADIAL_SEGMENTS,
        ROPE_TAPER_FRACTION
      )
      oldRopeGeometry.dispose()
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation() as unknown as THREE.Vector3)
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true)
    }
  })
  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.425, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.85, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.275, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1.7, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[1.42, 2.0, 0.018]} />
          <group
            scale={4}
            position={[0, -3.16, -0.09]}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              ;(e.target as Element).releasePointerCapture(e.pointerId)
              drag(false)
              document.body.style.userSelect = ''
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              ;(e.target as Element).setPointerCapture(e.pointerId)
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current!.translation())))
              document.body.style.userSelect = 'none'
            }}
            onPointerOver={() => setIdCardHover(true)}
            onPointerOut={() => setIdCardHover(false)}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshBasicMaterial map={cardMap} toneMapped={false} />
            </mesh>

            <mesh position={[HOLE_PATCH_LOCAL_X, HOLE_PATCH_LOCAL_Y, 0.006]}>
              <planeGeometry args={[HOLE_PATCH_LOCAL_SIZE, HOLE_PATCH_LOCAL_SIZE]} />
              <meshBasicMaterial map={holePatchTexture} toneMapped={false} />
            </mesh>
          </group>

          <mesh position={[PIN_PLANE_X, PIN_PLANE_Y, PIN_PLANE_Z]}>
            <planeGeometry args={[PIN_PLANE_WIDTH, PIN_PLANE_HEIGHT]} />
            <meshBasicMaterial map={pinTexture} transparent alphaTest={0.1} toneMapped={false} />
          </mesh>
        </RigidBody>
      </group>

      <mesh ref={rope} frustumCulled={false}>
        <meshStandardMaterial
          color={isDark ? '#d4d4d8' : '#262626'}
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>
    </>
  )
}
const StudioLighting = () => (
  <Environment blur={0.75}>
    <Lightformer
      intensity={2}
      color="white"
      position={[0, -1, 5]}
      rotation={[0, 0, Math.PI / 3]}
      scale={[100, 0.1, 1]}
    />
    <Lightformer
      intensity={3}
      color="white"
      position={[-1, -1, 1]}
      rotation={[0, 0, Math.PI / 3]}
      scale={[100, 0.1, 1]}
    />
    <Lightformer
      intensity={3}
      color="white"
      position={[1, 1, 1]}
      rotation={[0, 0, Math.PI / 3]}
      scale={[100, 0.1, 1]}
    />
    <Lightformer
      intensity={10}
      color="white"
      position={[-10, 0, 14]}
      rotation={[0, Math.PI / 2, Math.PI / 3]}
      scale={[100, 10, 1]}
    />
  </Environment>
)
const REFERENCE_HEIGHT_PX = 520
const CAMERA_Z = 20
const CAMERA_FOV_DEG = 20
const WORLD_UNITS_PER_PX = (2 * CAMERA_Z * Math.tan((CAMERA_FOV_DEG / 2) * (Math.PI / 180))) ** -1
const PX_PER_WORLD_UNIT = REFERENCE_HEIGHT_PX * WORLD_UNITS_PER_PX
const TARGET_FROM_RIGHT_PX = 240
const CameraAlign = () => {
  useFrame((state) => {
    state.camera.position.x = (TARGET_FROM_RIGHT_PX - state.size.width / 2) / PX_PER_WORLD_UNIT
    state.camera.position.z = CAMERA_Z * (state.size.height / REFERENCE_HEIGHT_PX)
  })
  return null
}
export type IdCardProps = {
  frontImage: string
  className?: string
}
const IdCard = ({ frontImage, className }: IdCardProps) => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  )
  const eventSourceRef = useRef<HTMLElement | null>(
    typeof document !== 'undefined' ? document.body : null
  )
  useEffect(
    () => () => {
      document.body.style.userSelect = ''
      setIdCardHover(false)
    },
    []
  )
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return (
    <div className={cn('pointer-events-none drop-shadow-xl', className)}>
      <Canvas
        eventSource={eventSourceRef as RefObject<HTMLElement>}
        camera={{ position: [0, 0, 20], fov: 20 }}
        dpr={[1, isMobile ? 1.25 : 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
        onCreated={(state) => {
          state.gl.setClearColor(new THREE.Color(0x000000), 0)
          state.gl.domElement.addEventListener('webglcontextlost', (event) =>
            event.preventDefault()
          )
          state.setEvents({
            compute: (event, s) => {
              const rect = s.gl.domElement.getBoundingClientRect()
              const x = event.clientX - rect.left
              const y = event.clientY - rect.top
              s.pointer.set((x / s.size.width) * 2 - 1, -(y / s.size.height) * 2 + 1)
              s.raycaster.setFromCamera(s.pointer, s.camera)
            },
          })
        }}
      >
        <CameraAlign />
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band frontImage={frontImage} isMobile={isMobile} />
        </Physics>
        <StudioLighting />
      </Canvas>
    </div>
  )
}
export default IdCard
