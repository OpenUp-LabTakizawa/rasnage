import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"
import { createFirebaseApp } from "../src/firebase/clientApp"

export const setContentData = async (content) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const contentRef = collection(db, "contents/group0/src")
  await setDoc(doc(contentRef, content.fileName), content)
}

// コンテンツ更新処理（削除含む）
export const setContentOrder = async (docId, content) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const ref = collection(db, "order")
  await setDoc(doc(ref, docId), content)
}

// コンテンツ登録処理
export const updateContentOrder = async (docId, content) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const ref = doc(db, "order", docId)
  await updateDoc(ref, content)
}

// CSSピクセルサイズの登録、またコンテンツサイズの取得
export const setContentPixelSize = async (
  orderId,
  pixelSizeId,
  width,
  height,
) => {
  if (pixelSizeId == "") {
    const app = createFirebaseApp()
    const db = getFirestore(app)
    const pixelSize = {
      width: width,
      height: height,
      pixelWidth: width,
      pixelHeight: height,
      marginTop: 0,
      marginLeft: 0,
      displayContentFlg: true,
      getPixelFlg: false,
    }
    const newDocRef = await addDoc(collection(db, "PixelSize"), pixelSize)
    const q = query(collection(db, "contents"), where("orderId", "==", orderId))
    const snapshot = await getDocs(q)
    const ids = []
    snapshot.forEach((doc) => {
      ids.push(doc.id)
    })
    const ref = collection(db, "contents")
    const content = await setDoc(
      doc(ref, ids[0]),
      {
        pixelSizeId: newDocRef.id,
      },
      { merge: true },
    )
    return pixelSize
  } else {
    const target = `PixelSize/${pixelSizeId}`
    const app = createFirebaseApp()
    const db = getFirestore(app)
    const contents = await getDoc(doc(db, target))
    if (!contents) {
      return null
    }
    const pixelSize = contents.data()
    if (!pixelSize.getPixelFlg) {
      const app = createFirebaseApp()
      const newDb = getFirestore(app)
      const ref = doc(db, "PixelSize", pixelSizeId)
      const content = await updateDoc(
        ref,
        {
          pixelWidth: width,
          pixelHeight: height,
          getPixelFlg: false,
        },
        { merge: true },
      )
    }
    return pixelSize
  }
}

// 表示画面調整画面での初期設定
export const createDisplayContent = async (orderId, pixel) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const pixelSize = {
    ...pixel,
    width: 0,
    height: 0,
    marginTop: 0,
    marginLeft: 0,
    displayContentFlg: true,
    getPixelFlg: false,
  }
  const newDocRef = await addDoc(collection(db, "PixelSize"), pixelSize)
  const q = query(collection(db, "contents"), where("orderId", "==", orderId))
  const snapshot = await getDocs(q)
  const ids = []
  snapshot.forEach((doc) => {
    ids.push(doc.id)
  })
  const ref = collection(db, "contents")
  const content = await setDoc(
    doc(ref, ids[0]),
    {
      pixelSizeId: newDocRef.id,
    },
    { merge: true },
  )
  return pixelSize
}

// 表示画面調整の項目更新
export const updateDisplayContent = async (
  pixelSizeId,
  height,
  width,
  marginTop,
  marginLeft,
) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const ref = doc(db, "PixelSize", pixelSizeId)
  await updateDoc(
    ref,
    {
      height,
      width,
      marginTop,
      marginLeft,
    },
    { merge: true },
  )
}

// ラズパイサイネージ表示画面でCSSピクセルサイズを再取得するためにロックを解除
export const resetPixelSize = async (pixelSizeId) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const ref = doc(db, "PixelSize", pixelSizeId)
  await updateDoc(
    ref,
    {
      getPixelFlg: true,
    },
    { merge: true },
  )
}

// エリア管理画面でエリア追加を実行
export const createContentsData = async (areaName) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const order = {
    hidden: [],
    set1: [],
  }
  const newDocRef = await addDoc(collection(db, "order"), order)
  const contentDocs = await getDocs(collection(db, "contents"))

  const content = {
    areaName: areaName,
    orderId: newDocRef.id,
    areaId: contentDocs.docs.length.toString(),
    delete: false,
  }
  await addDoc(collection(db, "contents"), content)
}

// エリア管理画面でエリア編集を実行
export const updateContentsData = async (index, contents, areaName) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const orderId = contents[index].orderId
  const q = query(collection(db, "contents"), where("orderId", "==", orderId))
  const snapshot = await getDocs(q)
  const ids = []
  snapshot.forEach((doc) => {
    ids.push(doc.id)
  })
  const ref = collection(db, "contents")
  await setDoc(
    doc(ref, ids[0]),
    {
      areaName: areaName,
    },
    { merge: true },
  )
}

// エリア管理画面でエリア編集を実行
export const deleteContentsData = async (index, contents) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const orderId = contents[index].orderId
  const q = query(collection(db, "contents"), where("orderId", "==", orderId))
  const snapshot = await getDocs(q)
  const ids = []
  snapshot.forEach((doc) => {
    ids.push(doc.id)
  })
  const ref = collection(db, "contents")
  await setDoc(
    doc(ref, ids[0]),
    {
      delete: true,
    },
    { merge: true },
  )
}

// アカウント一覧管理画面でアカウント作成を実行
export const createAccountData = async (email, password, user) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const auth = getAuth()

  console.log(email)
  const providers = await fetchSignInMethodsForEmail(auth, email)
  if (
    providers.findIndex(
      (p) => p === EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
    ) !== -1
  ) {
    console.log(providers)
    console.log("登録されています")
    return
  }
  // Firebaseで用意されているユーザー登録の関数
  const account = await createUserWithEmailAndPassword(auth, email, password)

  await sendEmailVerification(account.user)
  //    const contentDocs = await getDocs(collection(db, "users"));
  //
  //    const content = {
  //        ...user,
  //    }
  const target = `users/${account.user.uid}`
  await setDoc(doc(db, target), user)
}

// アカウント一覧管理画面でアカウント編集を実行
export const updateAccountData = async (
  uid,
  user,
  email,
  nowPassword,
  newPassword,
) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  if (newPassword) {
    const auth = getAuth()
    var currentUser = auth.currentUser
    //      console.log(currentUser);
    //      console.log(auth.EmailAuthProvider);
    var credential = await EmailAuthProvider.credential(email, nowPassword)
    console.log(credential)
    await reauthenticateWithCredential(currentUser, credential)
      .then(async () => {
        console.log("チェック完了")
        // パスワードチェック成功時の処理
        await updatePassword(currentUser, newPassword)
          .then(async () => {
            console.log("チェック完了")
            // パスワードチェック成功時の処理
          })
          .catch((error) => {
            // パスワードチェック失敗時の処理
            console.log(error)
          })
      })
      .catch((error) => {
        // パスワードチェック失敗時の処理
        console.log(error)
      })
  }
  const target = `users/${uid}`
  await setDoc(
    doc(db, target),
    {
      ...user,
    },
    { merge: true },
  )
}

// アカウント一覧管理画面でアカウント削除を実行
export const deleteAccountData = async (uid) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const target = `users/${uid}`
  await setDoc(
    doc(db, target),
    {
      delete: true,
    },
    { merge: true },
  )
}

// アカウント一覧管理画面でアカウント編集を実行
export const resetAccountPassword = async (uid, newPassword) => {
  const app = createFirebaseApp()
  const db = getFirestore(app)
  const auth = getAuth()
  //      var currentUser = auth.currentUser;
  ////      console.log(currentUser);
  ////      console.log(auth.EmailAuthProvider);
  //      var credential = await EmailAuthProvider.credential(
  //          email,
  //          nowPassword
  //      );
  //      console.log(credential);
  await updatePassword(uid, newPassword)
    .then(async () => {
      console.log("チェック完了")

      // パスワードチェック成功時の処理
      //          await updatePassword(currentUser, newPassword)
      //          .then(async function() {
      //            console.log("チェック完了");
      //            // パスワードチェック成功時の処理
      //        })
      //        .catch(function(error) {
      //            // パスワードチェック失敗時の処理
      //            console.log(error);
      //        });;
    })
    .catch((error) => {
      // パスワードチェック失敗時の処理
      console.log(error)
    })
  const target = `users/${uid}`
  await setDoc(
    doc(db, target),
    {
      passFlg: true,
    },
    { merge: true },
  )
}
