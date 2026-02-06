export type FileKind = "Image" | "Video" | "Other"
export const FILE_KIND: FileKind[] = ["Image", "Video", "Other"]

export type FileStatus = "Pending" | "Processing" | "Ready" | "Failed"
export const FILE_STATUS: FileStatus[] = ["Pending", "Processing", "Ready", "Failed"]

export type ImageResolutionVariant = 'thumbnail' | 'small' | 'large' | 'native'
export const IMAGE_RESOLUTION_VARIANT: ImageResolutionVariant[]  = ['thumbnail', 'small', 'large', 'native']