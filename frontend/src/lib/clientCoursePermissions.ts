import type { UserAuthServiceUserProfileResponse } from "@/types/client/auth"
import type { ReviewResponse } from "@/types/client/courseReviews"

// Client CoursePermissions
export const CCP = {
  canSetFavorite: (currentUser: UserAuthServiceUserProfileResponse | null) => {
    return Boolean(currentUser)
  },

  canCreateReview: (currentUser: UserAuthServiceUserProfileResponse | null) => {
    return Boolean(currentUser)
  },

  canModifyReview: (currentUser: UserAuthServiceUserProfileResponse | null, review: ReviewResponse) => {
    if(!currentUser) {
      return false
    }
    return review.author.isSelf
  },

  canResetProgress: (currentUser: UserAuthServiceUserProfileResponse | null) => {
    return Boolean(currentUser)
  },

  canPlayCourse: (currentUser: UserAuthServiceUserProfileResponse | null) => {
    return Boolean(currentUser)
  },
}