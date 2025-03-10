import admin from "../src/firebase/nodeApp"

// オーダーに紐づくリスト一覧
export const getContentDataAdmin = async (orderId) => {
  const target = `order/${orderId}`
  const db = admin.firestore()
  const contents = await db.doc(target).get()

  if (!contents) {
    return null
  }
  return contents.data()
}

// オーダーID取得
export const getOrderIdAdmin = async (areaId) => {
  const db = admin.firestore()
  let orderId = ""
  let pixelSizeId = ""
  const snapshot = await db
    .collection("contents")
    .where("areaId", "==", areaId)
    .get()
  snapshot.forEach((doc) => {
    orderId = doc.data().orderId
    pixelSizeId = doc.data().pixelSizeId
  })
  return {
    orderId,
    pixelSizeId,
  }
}
