import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ className, size = "md" }: UserAvatarProps) {
  const { user } = useAuth()
  
  // Obtener foto de Google si existe
  const avatarUrl = user?.user_metadata?.avatar_url
  
  // Obtener iniciales del restaurante o nombre
  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0].toUpperCase() || '?'
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {avatarUrl && (
        <AvatarImage 
          src={avatarUrl} 
          alt={user?.user_metadata?.full_name || "Avatar"}
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  )
}