import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Spinner } from "@/components/ui/spinner"
import { UserAvatar } from "@/components/shared/userAvatar/userAvatar"

import { useUsersByPrefixQuery } from "@/queries/dashboard/userUtils/useUsersByPrefixQuery"
import { useSetUserPermissionsMutation } from "@/mutations/dashboard/coursePermissions/useSetUserPermissionsMutation"
import type { GetCourseMembersResponse } from "@/types/dashboard/coursePermissions"
import { formatCoursePermissionsRole } from "@/lib/format"
import { Plus } from "lucide-react"
import { DebouncedInput } from "../../debouncedInput/debouncedInput"
import { CP } from "@/lib/permissions"
import { COURSE_PERMISSIONS_ROLE, type CoursePermissionsRole } from "@/types/common/coursePermissions"

interface CoursePermissionsActionsAddUserProps {
  courseId: number
  members: GetCourseMembersResponse[]
  currentUserPermission: CoursePermissionsRole
}

export function CoursePermissionsActionsAddUser({ courseId, members, currentUserPermission }: CoursePermissionsActionsAddUserProps) {
  const [dialogOpen, toggleDialogOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<CoursePermissionsRole | "">("")

  const usersByPrefix = useUsersByPrefixQuery(searchValue, dialogOpen)
  const setPermissionsMutation = useSetUserPermissionsMutation()
  
  const existingUsernames = new Set(members.map((m) => m.username))
  const filteredResults = (usersByPrefix.data ?? []).filter((user) => !existingUsernames.has(user.username))
  
  const handleResetState = () => {
    toggleDialogOpen(false)
    setSearchValue("")
    setSelectedUser(null)
    setSelectedRole("")
  }

  const handleAddUser = () => {
    if (!selectedUser || !selectedRole) return

    setPermissionsMutation.mutate(
      {
        courseId,
        username: selectedUser,
        role: selectedRole,
      },
      {
        onSuccess: () => handleResetState()
      }
    )
  }

  const canAddNewUser = selectedUser && selectedRole && !setPermissionsMutation.isLoading
  const disabled = setPermissionsMutation.isLoading || !CP.canCreateUserPermission(currentUserPermission)
  const selectOptionDisabled = (role: CoursePermissionsRole) => {
    return !CP.canSetUserPermission(currentUserPermission, null, role)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={toggleDialogOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar usuario
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar usuario al curso</DialogTitle>
          <DialogDescription>
            Busca un usuario y asígna un rol para que pueda gestionar el curso.
            Los usuarios que ya tienen un rol en el curso no aparecerán en la lista de búsqueda
          </DialogDescription>          
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Buscar usuario
            </label>

            <DebouncedInput 
              onChange={(value) => {
                setSearchValue(value)
                setSelectedUser(null)
              }}
              value={searchValue}
              placeholder="Ingresa el nombre de usuario..."
            />
          </div>

          {searchValue && (
            <div>
              {usersByPrefix.isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Spinner />
                </div>
              )}

              {!usersByPrefix.isLoading && (
                <Command className="border rounded-md">
                  <CommandList>
                    {filteredResults.length === 0 ? (
                      <CommandEmpty>
                        No se encontraron usuarios
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {filteredResults.map((user) => (
                          <CommandItem
                            key={user.username}
                            value={user.username}
                            onSelect={() => setSelectedUser(user.username)}
                            className={selectedUser === user.username ? "bg-accent" : ""}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <UserAvatar
                                avatar={user.avatar}
                                username={user.username}
                              />
                              <span className="font-medium">{user.username}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              )}
            </div>
          )}

          {selectedUser && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Rol
              </label>

              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as CoursePermissionsRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {COURSE_PERMISSIONS_ROLE.map((role) => (
                    <SelectItem key={role} value={role} disabled={selectOptionDisabled(role)}>
                      {formatCoursePermissionsRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={handleResetState} disabled={setPermissionsMutation.isLoading}>
              Cancelar
            </Button>

            <Button onClick={handleAddUser} disabled={!canAddNewUser}>
              {setPermissionsMutation.isLoading ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
