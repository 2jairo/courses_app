import { IMAGE_RESOLUTION_VARIANT, type ImageResolutionVariant } from "@/types/common/files";

type ImagesMetadata = {
  [K in ImageResolutionVariant]?: {
    path: string
    w: number
    h: number
  }
}

export const chooseClosestImageResolution = (metadata: ImagesMetadata, res: ImageResolutionVariant) => {
  if (metadata[res]) {
    return metadata[res];
  }

  const variants = Object.keys(metadata) as ImageResolutionVariant[];
  if (variants.length === 0) {
    return undefined;
  }

  const targetIndex = IMAGE_RESOLUTION_VARIANT.indexOf(res);

  let closest: ImageResolutionVariant | undefined;
  let minDiff = Number.MAX_SAFE_INTEGER;

  for (const variant of variants) {
    const idx = IMAGE_RESOLUTION_VARIANT.indexOf(variant);
    if (idx === -1) continue;
    const diff = Math.abs(idx - targetIndex);
    if (diff < minDiff) {
      minDiff = diff;
      closest = variant;
    }
  }

  return closest ? metadata[closest] : undefined;
}