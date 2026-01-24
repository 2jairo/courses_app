import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface UserAvatarProps {
  username?: string
  avatar?: string | null
  className?: string
}

export const UserAvatar = ({ avatar, username, className = "h-9 w-9" }: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatar as string | undefined} alt="User avatar" />
      <AvatarFallback>
        {username
          ? username[0].toUpperCase()
          : <User />
        }
      </AvatarFallback>
    </Avatar>
  )
}