import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import gsap from "gsap";
export function MouseLight() {
  const lightRef: any = useRef();

  return <pointLight position={[0, 4, 0]} intensity={8} color={"pink"} />;
}
