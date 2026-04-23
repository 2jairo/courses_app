import { toast } from "sonner";


export const shareCourse = (courseTitle: string, currentLectureTitle?: string) => {
  const shareUrl = `${window.location.origin}${window.location.pathname}?viewSource=External`

  if (navigator.share) {
    const name = import.meta.env.VITE_COURSE_APP_NAME

    navigator.share({
      title: currentLectureTitle
        ? `${name}: ${courseTitle} - ${currentLectureTitle}`
        : `${name}: ${courseTitle}`,
      url: shareUrl,
    });
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("URL copiada al portapapeles")
    })
  }
}