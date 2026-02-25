export const FILE_KIND = ["Image", "Video", "Other"] as const
export type FileKind = typeof FILE_KIND[number];

export const FILE_STATUS = ["Pending", "Processing", "Ready", "Failed"] as const
export type FileStatus = typeof FILE_STATUS[number];

export const IMAGE_RESOLUTION_VARIANT = ['thumbnail', 'small', 'large', 'native'] as const
export type ImageResolutionVariant = typeof IMAGE_RESOLUTION_VARIANT[number];