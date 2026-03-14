import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, Text } from '@react-three/drei'

function BottleModel() {
  return (
    <group scale={1.2}>
      {/* BADAN BOTOL (Kaca Bening) */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.2, 0.6]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.25} 
          roughness={0} 
          metalness={0.15} 
        />
      </mesh>

      {/* TUTUP BOTOL (Hitam Matte) */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.45, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.85} />
      </mesh>

      {/* LABEL PUTIH DI TENGAH */}
      <mesh position={[0, -0.05, 0.301]}>
        <planeGeometry args={[0.78, 0.85]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* --- LABELING SESUAI REFERENSI (VERSI AMAN) --- */}
      
      <Text
        position={[0, 0.25, 0.31]}
        fontSize={0.09}
        color="black"
        fontWeight="bold"
      >
        ROXOR
      </Text>

      <Text
        position={[0, 0.16, 0.31]}
        fontSize={0.032}
        color="#333"
      >
        CAVALIER SCENT
      </Text>

      <Text
        position={[0, -0.02, 0.31]}
        fontSize={0.065}
        color="black"
        fontWeight="bold"
        textAlign="center"
      >
        RXX{"\n"}VALIANT
      </Text>

      <Text
        position={[0, -0.32, 0.31]}
        fontSize={0.028}
        color="#444"
      >
        EXTRAIT DE PARFUM 30 ML
      </Text>
    </group>
  )
}

export default function Valiant3D() {
  return (
    <div style={{ height: '450px', width: '100%', cursor: 'grab' }}>
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
        {/* Fallback diganti biar lo tau kalau dia lagi kerja */}
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} contactShadow={true}>
            <BottleModel />
          </Stage>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
        </Suspense>
      </Canvas>
    </div>
  )
}