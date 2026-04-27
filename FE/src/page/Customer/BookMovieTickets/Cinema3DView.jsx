import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Reflector, MeshReflectorMaterial, Text } from "@react-three/drei";
import * as THREE from "three";

// Animation camera bay đến vị trí ghế - tối ưu hóa
const AnimatedCamera = ({ seatPos, screen }) => {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(seatPos.x, seatPos.y + 2, seatPos.z + 4));
  
  useEffect(() => {
    target.current.set(seatPos.x, seatPos.y + 2, seatPos.z + 4);
  }, [seatPos]);
  
  useFrame(() => {
    camera.position.lerp(target.current, 0.05); // Giảm tốc độ để mượt hơn
    camera.lookAt(screen.x, screen.y, screen.z);
  });
  return null;
};

// Component ghế tối ưu hóa với instancing
const CinemaSeat = React.memo(({ position, isSelected }) => (
  <group position={position} rotation={[0, Math.PI, 0]}>
    {/* Đệm ngồi bo tròn */}
    <RoundedBox
      args={[0.5, 0.18, 0.5]}
      radius={0.08}
      smoothness={4}
      position={[0, 0.05, 0]}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={isSelected ? "#e53935" : "#3a3a4d"}
        metalness={0.3}
        roughness={0.4}
        clearcoat={0.5}
        clearcoatRoughness={0.2}
      />
    </RoundedBox>
    {/* Lưng tựa bo tròn */}
    <RoundedBox
      args={[0.5, 0.32, 0.12]}
      radius={0.09}
      smoothness={4}
      position={[0, 0.22, -0.18]}
      rotation={[-0.18, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={isSelected ? "#ff5252" : "#5c5c7a"}
        metalness={0.2}
        roughness={0.5}
        clearcoat={0.6}
        clearcoatRoughness={0.1}
      />
    </RoundedBox>
    {/* Tay vịn trái */}
    <RoundedBox
      args={[0.06, 0.22, 0.36]}
      radius={0.03}
      smoothness={3}
      position={[-0.26, 0.09, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#222" metalness={0.3} roughness={0.4} />
    </RoundedBox>
    {/* Tay vịn phải */}
    <RoundedBox
      args={[0.06, 0.22, 0.36]}
      radius={0.03}
      smoothness={3}
      position={[0.26, 0.09, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#222" metalness={0.3} roughness={0.4} />
    </RoundedBox>
    {/* Chân ghế - tối ưu hóa */}
    {[
      [-0.15, -0.09, 0.15],
      [0.15, -0.09, 0.15],
      [-0.15, -0.09, -0.15],
      [0.15, -0.09, -0.15]
    ].map((pos, i) => (
      <mesh key={i} position={pos} castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
    ))}
  </group>
));

const Cinema3DView = ({ seatPos, screen, room, movie }) => {
  const [canLoadPoster, setCanLoadPoster] = useState(false);

  useEffect(() => {
    if (!movie?.poster) {
      setCanLoadPoster(false);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = movie.poster;
    img.onload = () => setCanLoadPoster(true);
    img.onerror = () => setCanLoadPoster(false);
  }, [movie?.poster]);

  const posterTexture = canLoadPoster
    ? useLoader(THREE.TextureLoader, movie.poster)
    : undefined;

  // Tạo gradient texture tối ưu hóa
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; // Giảm kích thước để tối ưu
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ff8c42');    // Cam sáng
    gradient.addColorStop(0.3, '#e67e22');  // Cam đậm
    gradient.addColorStop(0.5, '#d35400');  // Cam tối
    gradient.addColorStop(0.7, '#a04000');  // Cam đen
    gradient.addColorStop(1, '#2c3e50');    // Xám đen
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    return texture;
  }, []);

  // Tạo ghế tối ưu hóa với useMemo
  const allSeats = useMemo(() => {
    const seats = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10; col++) {
        // Tính độ cao của sàn cho hàng này
        const floorHeight = 0.18 * row; // Mỗi bậc cao hơn 0.18
        
        seats.push({
          x: 1 + col * 0.8,
          y: 0.5 + floorHeight, // Ghế được nâng lên theo độ cao của sàn
          z: -room.depth / 2 + 2 + row * 1.1,
          isSelected: seatPos &&
            Math.abs(seatPos.x - (1 + col * 0.8)) < 0.01 &&
            Math.abs(seatPos.z - (-room.depth / 2 + 2 + row * 1.1)) < 0.01,
        });
      }
    }
    return seats;
  }, [seatPos, room.depth]);

  return (
    <Canvas
      style={{ height: 400, background: "#181824" }}
      shadows
      camera={{ fov: 60, position: [room.width / 2, 8, room.depth / 2 + 6] }}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
    >
      {/* Ánh sáng môi trường và đèn chiếu sáng tối ưu */}
      <ambientLight intensity={0.5} color="#f0f0f0" />
      <directionalLight
        position={[0, 10, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        color="#fff"
      />
      
      {/* Ánh sáng phụ để tạo hiệu ứng ấm áp */}
      <directionalLight
        position={[10, 5, -5]}
        intensity={0.3}
        color="#ffd580"
      />
      
      <AnimatedCamera seatPos={seatPos} screen={screen} />
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate 
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={20}
      />

      {/* Sàn phòng chiếu với phản chiếu tối ưu */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[room.width / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[room.width, room.depth]} />
        <MeshReflectorMaterial
          blur={[50, 50]}
          resolution={256}
          mirror={0.2}
          mixBlur={1}
          mixStrength={1.5}
          color="#23232b"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>

      {/* Room outline tối ưu */}
      <mesh position={[room.width / 2, room.height / 2 - 1, -room.depth / 2]} receiveShadow>
        <boxGeometry args={[room.width, room.height, room.depth]} />
        <meshStandardMaterial color="#e0e0e0" wireframe transparent opacity={0.05} />
      </mesh>

      {/* Screen tối ưu */}
      <mesh position={[screen.x, screen.y, screen.z]} castShadow receiveShadow>
        <boxGeometry args={[screen.width, screen.height * 1.5, 0.2]} />
        <meshPhysicalMaterial
          map={posterTexture || gradientTexture}
          color={posterTexture ? undefined : "#ff8c42"}
          metalness={0.2}
          roughness={0.5}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
          reflectivity={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Chữ SIX CINEMA tối ưu */}
      <Text
        position={[screen.x, screen.y, screen.z + 0.12]}
        rotation={[0, 0, 0]}
        fontSize={0.7}
        color="#ff8c42"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="#000"
      >
        SIX CINEMA
      </Text>

      {/* Ghế tối ưu */}
      {allSeats.map((s, i) => (
        <CinemaSeat
          key={i}
          position={[s.x, s.y, s.z]}
          isSelected={s.isSelected}
        />
      ))}

      {/* Tầng bậc tối ưu */}
      {[...Array(6)].map((_, row) => (
        <mesh
          key={row}
          position={[
            room.width / 2,
            0.18 * row,
            -room.depth / 2 + 2 + row * 1.1
          ]}
          receiveShadow
        >
          <boxGeometry args={[room.width - 0.2, 0.18, 1.1]} />
          <meshStandardMaterial color="#2d2d36" metalness={0.1} roughness={0.8} />
        </mesh>
      ))}

      {/* Tường tối ưu */}
      {[
        { pos: [0, room.height / 2 - 1, 0], args: [0.2, room.height, room.depth] },
        { pos: [room.width, room.height / 2 - 1, 0], args: [0.2, room.height, room.depth] },
        { pos: [room.width / 2, room.height / 2 - 1, screen.z - 0.2], args: [room.width, room.height, 0.2] }
      ].map((wall, i) => (
        <mesh key={i} position={wall.pos} receiveShadow>
          <boxGeometry args={wall.args} />
          <meshStandardMaterial color="#181824" />
        </mesh>
      ))}

      {/* Trần nhà tối ưu */}
      <mesh
        position={[room.width / 2, room.height - 0.1, 0]}
        receiveShadow
      >
        <boxGeometry args={[room.width, 0.2, room.depth]} />
        <meshStandardMaterial color="#181824" />
      </mesh>

      {/* Đèn LED tối ưu - giảm số lượng */}
      {[...Array(4)].map((_, i) => (
        <React.Fragment key={i}>
          <pointLight
            position={[0.15, 0.5 + i * 1.5, -room.depth / 2 + 2 + i * 1.5]}
            intensity={0.6}
            distance={3}
            color="#ffd580"
          />
          <pointLight
            position={[room.width - 0.15, 0.5 + i * 1.5, -room.depth / 2 + 2 + i * 1.5]}
            intensity={0.6}
            distance={3}
            color="#ffd580"
          />
        </React.Fragment>
      ))}

      {/* Đèn chiếu màn hình tối ưu */}
      <spotLight
        position={[room.width / 2, room.height - 0.2, screen.z + 2]}
        angle={0.4}
        penumbra={0.8}
        intensity={1.0}
        distance={8}
        color="#fffbe6"
        target-position={[screen.x, screen.y, screen.z]}
        castShadow
      />

      {/* Ánh sáng cam cho màn hình */}
      <pointLight
        position={[screen.x, screen.y, screen.z + 0.5]}
        intensity={0.6}
        distance={3}
        color="#ff8c42"
      />

      {/* Đèn trần tối ưu */}
      <pointLight
        position={[room.width / 2, room.height - 0.05, 0]}
        intensity={0.2}
        distance={room.depth}
        color="#b3e0ff"
      />
    </Canvas>
  );
};

export default Cinema3DView;