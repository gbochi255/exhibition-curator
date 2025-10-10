import '@testing-library/jest-dom'

export {}
if(typeof (globalThis as any).TextEncoder === 'undefined') {
    (globalThis as any).TextEncoder = class {
        encode(input = ''): Uint8Array {
            const str = String(input);
            const utf8 = unescape(encodeURIComponent(str));
            const arr = new Uint8Array(utf8.length);
            for (let i = 0; i<utf8.length; i++) {
                arr[i] = utf8.charCodeAt(i);
            }
            return arr;
            
        }
    };
}

if (typeof (globalThis as any).TextDecoder === 'undefined') {
    (globalThis as any).TextDecoder = class {
        decode(input: Uint8Array | ArrayBuffer = new Uint8Array()): string {
            let bytes: Uint8Array;
            if(input instanceof ArrayBuffer) {
                bytes = new Uint8Array(input);
            }else {
                bytes = input as Uint8Array;
            }
            let raw = '';
            for(let i=0; i< bytes.length; i++) {
                raw += String.fromCharCode(bytes[i]);
            }
            try{
                return decodeURIComponent(escape(raw));
            }catch{
                return raw;
            }
            
        }
    };
}

if (typeof navigator !== 'undefined' && typeof (navigator as any).clipboard === 'undefined') {
   Object.defineProperty(navigator as any, 'clipboard', {
    configurable: true,
    value: {
        writeText: async (_text: string): Promise<void> => {
            return Promise.resolve();
        },
    },
   });
}