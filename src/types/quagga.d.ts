/**
 * QuaggaJS Type Definitions
 * Custom types for QuaggaJS barcode scanner library
 */

declare module 'quagga' {
  export interface QuaggaJSConfigObject {
    inputStream: {
      name?: string;
      type?: string;
      target?: HTMLElement | string;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
        aspectRatio?: {
          min?: number;
          max?: number;
        };
      };
      area?: {
        top?: string;
        right?: string;
        left?: string;
        bottom?: string;
      };
      singleChannel?: boolean;
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
    numOfWorkers?: number;
    frequency?: number;
    decoder: {
      readers: string[];
      debug?: {
        showCanvas?: boolean;
        showPatches?: boolean;
        showFoundPatches?: boolean;
        showSkeleton?: boolean;
        showLabels?: boolean;
        showPatchLabels?: boolean;
        showRemainingPatchLabels?: boolean;
        boxFromPatches?: {
          showTransformed?: boolean;
          showTransformedBox?: boolean;
          showBB?: boolean;
        };
      };
    };
    locate?: boolean;
    src?: string;
  }

  export interface QuaggaJSResultObject {
    codeResult: {
      code: string;
      format: string;
      start: number;
      end: number;
      codeset?: number;
      startInfo?: {
        error: number;
        code: number;
        start: number;
        end: number;
      };
      decodedCodes?: Array<{
        code: number;
        start: number;
        end: number;
        error?: number;
      }>;
      endInfo?: {
        error: number;
        code: number;
        start: number;
        end: number;
      };
      direction?: number;
    };
    line?: {
      x: number;
      y: number;
    }[];
    angle?: number;
    pattern?: number[];
    box?: number[][];
    boxes?: number[][][];
  }

  export interface QuaggaJSStatic {
    init(config: QuaggaJSConfigObject, callback?: (err?: Error) => void): void;
    start(): void;
    stop(): void;
    pause(): void;
    onDetected(callback: (result: QuaggaJSResultObject) => void): void;
    onProcessed(callback: (result: QuaggaJSResultObject) => void): void;
    offDetected(callback: (result: QuaggaJSResultObject) => void): void;
    offProcessed(callback: (result: QuaggaJSResultObject) => void): void;
    decodeSingle(config: QuaggaJSConfigObject, callback: (result: QuaggaJSResultObject) => void): void;
    canvas?: {
      ctx: {
        overlay: CanvasRenderingContext2D;
        image: CanvasRenderingContext2D;
      };
      dom: {
        overlay: HTMLCanvasElement;
        image: HTMLCanvasElement;
      };
    };
    ImageLoader?: object;
    ImageWrapper?: object;
    ResultCollector?: object;
  }

  const Quagga: QuaggaJSStatic;
  export default Quagga;
}
