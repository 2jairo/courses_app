export class DndUtils {
  static courseSectionId(id: number) {
    return 'section' + id
  }

  static lectureId(id: number) {
    return 'lecture' + id
  }

  static dialogQuizQuestionId(idx: number) {
    return 'dialog_q' + idx
  }
  static quizQuestionId(idx: number) {
    return 'default_q' + idx
  }
}