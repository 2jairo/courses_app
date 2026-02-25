export const COURSE_PERMISSIONS_ROLE = ["Owner", "Admin", "Write", "Read"] as const
export type CoursePermissionsRole = typeof COURSE_PERMISSIONS_ROLE[number];
