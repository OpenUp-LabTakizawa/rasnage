import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore"
import { createFirebaseApp } from "../src/firebase/clientApp"

export const getContentsDataClient = async (target) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const q = query(collection(db, target), where("delete", "==", false))
  const contentDocs = await getDocs(q)
  if (!contentDocs) {
    return null
  }
  return contentDocs.docs.map((doc) => doc.data())
}

// コンテンツのリスト取得
export const getContentDataClient = async (target) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const contentDoc = await getDoc(doc(db, target))
  if (!contentDoc) {
    return null
  }
  return contentDoc.data()
}

export const getOrderIdClient = async (areaId) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const q = query(collection(db, "contents"), where("areaId", "==", areaId))
  let orderId = ""
  const snapshot = await getDocs(q)
  snapshot.forEach((doc) => {
    orderId = doc.data().orderId
  })
  return orderId
}

// 表示画面調整コンテンツの取得
export const getContentPixelSizeId = async (orderId) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const q = query(collection(db, "contents"), where("orderId", "==", orderId))
  let pixelSizeId = ""
  const snapshot = await getDocs(q)
  snapshot.forEach((doc) => {
    pixelSizeId = doc.data().pixelSizeId
  })
  return pixelSizeId
}

// ピクセルサイズ情報の取得
export const getContentPixelSize = async (pixelSizeId) => {
  const target = `PixelSize/${pixelSizeId}`
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const contents = await getDoc(doc(db, target))
  if (!contents) {
    return null
  }
  return contents.data()
}

export const getUserAccountList = async (target) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const q = query(collection(db, target), where("delete", "==", false))
  const contentDocs = await getDocs(q)
  if (!contentDocs) {
    return null
  }
  return contentDocs.docs.map((doc) => {
    const user = {
      ...doc.data(),
      uid: doc.id,
    }
    return user
  })
}

// アカウント管理画面でアカウントを1件取得する方法
export const getAccountDataClient = async (uid) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const target = `users/${uid}`
  const contentDoc = await getDoc(doc(db, target))
  if (!contentDoc) {
    return null
  }
  return contentDoc.data()
}

// ログイン(auth⇒UIDをドキュメントのキーに)
export const getAccountLoginData = async (email, password) => {
  const app = createFirebaseApp()
  const auth = getAuth()
  const account = await signInWithEmailAndPassword(auth, email, password)
  if (!account.user.emailVerified) return null
  const target = `users/${account.user.uid}`
  const db = getFirestore(app)
  const contentDoc = await getDoc(doc(db, target))
  if (!contentDoc || contentDoc.data().delete) {
    return null
  }
  return {
    ...contentDoc.data(),
    uid: account.user.uid,
  }
}

// パスワード初期化チェック
export const checkAccountPassKey = async (email) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const q = query(
    collection(db, "users"),
    where("delete", "==", false),
    where("email", "==", email),
    where("passFlg", "==", true),
  )
  const contentDocs = await getDocs(q)
  if (!contentDocs) {
    return null
  }
  console.log(contentDocs.docs)
  const userList = contentDocs.docs.map((doc) => doc.data())
  return userList[0]
}

export const getContentList = async (coverageAreaList) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const q = query(
    collection(db, "contents"),
    where("delete", "==", false),
    where("areaId", "in", coverageAreaList),
  )
  const contentDocs = await getDocs(q)
  if (!contentDocs) {
    return null
  }
  const userList = contentDocs.docs.map((doc) => doc.data())
  return userList
}
