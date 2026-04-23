export const setDocumentTitle = (title?: string, withPrefix?: boolean) => {
  if(title) {
    document.title = withPrefix
      ? `${import.meta.env.VITE_COURSE_APP_NAME} | ${title}`
      : title
  } else {
    document.title = import.meta.env.VITE_COURSE_APP_NAME 
  }
}