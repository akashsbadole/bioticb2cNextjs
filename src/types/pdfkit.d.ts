declare module 'pdfkit' {
  import { EventEmitter } from 'events';

  interface PDFDocumentOptions {
    margin?: number;
    size?: string | [number, number];
    [key: string]: unknown;
  }

  class PDFDocument extends EventEmitter {
    constructor(options?: PDFDocumentOptions);
    font(source: string, family?: string): this;
    fontSize(size: number): this;
    text(text: string, x?: number, y?: number, options?: {
      width?: number;
      align?: 'left' | 'center' | 'right';
      [key: string]: unknown;
    }): this;
    fillColor(color: string): this;
    rect(x: number, y: number, width: number, height: number): this;
    stroke(color?: string): this;
    addPage(): this;
    end(): void;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export default PDFDocument;
}
