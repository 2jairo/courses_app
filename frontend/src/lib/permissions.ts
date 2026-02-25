import type { CoursePermissionsRole } from "@/types/common/coursePermissions";

const roleRank: Record<CoursePermissionsRole, number> = {
  Owner: 4,
  Admin: 3,
  Write: 2,
  Read: 1,
}


// CoursePermissions
export const CP = {
  // basic props
  canModifyCourseProps: (role: CoursePermissionsRole) => {
    return roleRank[role] >= roleRank['Write']
  },

  // course permissions
  canCreateUserPermission: (self: CoursePermissionsRole) => {
    return roleRank[self] >= roleRank['Admin']
  },
  canSetUserPermission: (self: CoursePermissionsRole, other: CoursePermissionsRole | null, newOtherRole: CoursePermissionsRole) => {
    return roleRank[self] >= roleRank['Admin'] &&     // at least admin
      (!other || roleRank[self] > roleRank[other]) && // other role has to be lower
      newOtherRole !== 'Owner' &&                     // can't assign owner
      (newOtherRole !== 'Admin' || self === 'Owner')  // only owner can promote to admin
  },
  canDeleteUserPermissions: (self: CoursePermissionsRole, other: CoursePermissionsRole) => {
    return roleRank[self] >= roleRank['Admin'] && roleRank[self] > roleRank[other]
  },

  // course sections
  canModifyCourseSections: (role: CoursePermissionsRole) => {
    return roleRank[role] >= roleRank['Write']
  },

  // lectures
  canModifyLecture: (role: CoursePermissionsRole) => {
    return roleRank[role] >= roleRank['Write']
  },
  
  // lectures
  canUploadFiles: (role: CoursePermissionsRole) => {
    return roleRank[role] >= roleRank['Write']
  },

  // quizzes
  canModifyQuizzes: (role: CoursePermissionsRole) => {
    return roleRank[role] >= roleRank['Write']
  },
}