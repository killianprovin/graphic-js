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
    z_near: number;
    z_far: number;
  }
  
  export function createCamera(): Camera {
    return {
      position: { x: 0, y: 0, z: 2 },
      yaw: 0,
      pitch: 0,
      fov: 60,
      z_near: 0.1,
      z_far: 30
    };
  }
  
  export function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
  