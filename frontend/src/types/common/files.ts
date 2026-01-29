export type FileKind = "Image" | "Video" | "Other"
export const FILE_KIND: FileKind[] = ["Image", "Video", "Other"]

export type FileStatus = "Pending" | "Processing" | "Ready" | "Failed"
export const FILE_STATUS: FileStatus[] = ["Pending", "Processing", "Ready", "Failed"]
