export class Canvas {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public screenWidth: number;
    public screenHeight: number;
  
    constructor(canvasId: string) {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        throw new Error(`Canvas with id "${canvasId}" not found`);
      }
  
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      if (!ctx) {
        throw new Error(`2D context for canvas "${canvasId}" could not be created`);
      }
  
      this.canvas = canvas;
      this.ctx = ctx;
  
      this.screenWidth = canvas.width;
      this.screenHeight = canvas.height;
  
      this.resizeCanvas();
      window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
  
    resizeCanvas(): void {
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
  
      const scale = window.devicePixelRatio || 1;
  
      this.canvas.width = cssWidth * scale;
      this.canvas.height = cssHeight * scale;
  
      this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
  
      this.screenWidth = cssWidth;
      this.screenHeight = cssHeight;
    }
  
    clear(): void {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  