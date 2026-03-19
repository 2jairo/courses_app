import { type GetCourseMembersResponse } from "@/types/dashboard/coursePermissions"
import { COURSE_PERMISSIONS_ROLE, type CoursePermissionsRole } from "@/types/common/coursePermissions"
import { formatCoursePermissionsRole } from "@/lib/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserAvatar } from "@/components/shared/userAvatar/userAvatar"
import { useSetUserPermissionsMutation } from "@/mutations/dashboard/coursePermissions/useSetUserPermissionsMutation"
import { useContext } from "react"
import { UserContext } from "@/context/user/createUserContext"
import { useDeleteUserPermissionsMutation } from "@/mutations/dashboard/coursePermissions/useDeleteUserPermissionsMutation"
import { DialogDelete } from "@/components/shared/dialogs/dialogDelete"
import { DCP } from "@/lib/dashboardCoursePermissions"
import { toast } from "sonner"

interface CoursePermissionsManagerProps {
  courseId: number
  members: GetCourseMembersResponse[]
  currentUserPermission: CoursePermissionsRole
}

export const CoursePermissions = ({ courseId, members, currentUserPermission }: CoursePermissionsManagerProps) => {
  const { user } = useContext(UserContext)
  const setPermissionsMutation = useSetUserPermissionsMutation()
  const deleteMutation = useDeleteUserPermissionsMutation()

  const handleChangeRole = (username: string, newRole: CoursePermissionsRole) => {
    setPermissionsMutation.mutate({
      courseId,
      username,
      role: newRole,
    }, {
      onSuccess: () => {
        toast.success("Usuario actualizado correctamente")
      }
    })
  }

  const handleConfirmDelete = (username: string) => {
    if (deleteMutation.isLoading) return
    deleteMutation.mutate({
      courseId: courseId,
      username
    }, {
      onSuccess: () => {
        toast.success("Usuario eliminado correctamente")
      }
    })
  }

  const selectDisabled = (member: GetCourseMembersResponse) => {
    if(setPermissionsMutation.isLoading || member.username === user?.username) {
      return true
    }
    return COURSE_PERMISSIONS_ROLE.every((r) => {
      return selectOptionDisabled(member, r)
    })
  }

  const selectOptionDisabled = (member: GetCourseMembersResponse, role: CoursePermissionsRole) => {
    return !DCP.canSetUserPermission(currentUserPermission, member.role, role)
  }

  const deleteDisabled = (member: GetCourseMembersResponse) => {
    return deleteMutation.isLoading || 
      member.username === user?.username || 
      !DCP.canDeleteUserPermissions(currentUserPermission, member.role)
  }
  

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.username}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar avatar={member.avatar} username={member.username}/>
                    <span className="font-medium">{member.username}</span>
                  </div>
                </TableCell>
                <TableCell className="flex-1">
                  <Select
                    value={member.role}
                    onValueChange={(newRole) => handleChangeRole(member.username, newRole as CoursePermissionsRole)}
                    disabled={selectDisabled(member)}
                  >
                    <SelectTrigger className="w-50">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {COURSE_PERMISSIONS_ROLE.map((role) => (
                        <SelectItem key={role} value={role} disabled={selectOptionDisabled(member, role)}>
                          {formatCoursePermissionsRole(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <DialogDelete
                    entity="usuario"
                    trigger="text"
                    handleDelete={() => handleConfirmDelete(member.username)}
                    isLoading={deleteDisabled(member)}
                  >
                    El usuario "{member.username}" ya no podrá gestionar el curso.
                  </DialogDelete>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}