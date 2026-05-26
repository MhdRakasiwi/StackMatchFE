export const getRecommendationQuestionId = (item) => {
  const id =
    item.id ??
    item.question_id ??
    item.questionId ??
    item.questionID ??
    item.qid ??
    item.post_id ??
    item.postId ??
    item.metadata?.id ??
    item.metadata?.question_id ??
    item.metadata?.questionId ??
    item.question?.id ??
    item.question?.question_id

  return id === '' || id === null || id === undefined ? null : id
}

export const enrichRecommendationIds = async (results) => {
  if (!Array.isArray(results)) return []
  return results.map((item) => {
    let id = getRecommendationQuestionId(item)
    if (id === null || id === undefined) {
      console.warn('Item is missing id:', item)
      id = null
    }
    return {
      ...item,
      id
    }
  })
}
