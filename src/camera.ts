// src/camera.ts

export interface Vector3D {
    x: number;
    y: number;
    z: number;
  }
  
  export interface Camera {
    position: Vector3D;
    yaw: number;
    pitch: number;
    fov: number;
  }
  
  export function createCamera(): Camera {
    return {
      position: { x: 0, y: 0, z: 20 },
      yaw: 0,
      pitch: 0,
      fov: 60,
    };
  }
  
  export function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
  