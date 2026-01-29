declare module "node-webvtt" {
  export interface VttCue {
    identifier?: string;
    start: number;
    end: number;
    text: string;
    styles?: string;
  }

  export interface VttParseResult {
    valid: boolean;
    errors: Array<{
      message: string;
      error?: unknown;
    }>;
    cues: VttCue[];
  }

  interface WebVtt {
    parse(
      input: string,
      options?: {
        strict?: boolean;
      }
    ): VttParseResult;

    compile(
      cues: VttCue[],
      options?: {
        strict?: boolean;
      }
    ): string;
  }

  const webvtt: WebVtt;
  export default webvtt;
}
