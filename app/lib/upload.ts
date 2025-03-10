import {
  arrayUnion,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore"
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage"
import { createFirebaseApp } from "../src/firebase/clientApp"
import { updateContentOrder } from "./setContentData"

// コンテンツ登録時のfirebase接続等処理
export const postContent = async (
  docId,
  content,
  type,
  duration,
  callbackfn = undefined,
) => {
  if (content.name) {
    const app = createFirebaseApp()
    const storage = getStorage(app)
    const db = getFirestore(app)
    const q = query(
      collection(db, "contents"),
      where("delete", "==", false),
      where("orderId", "==", docId),
    )
    const contentDocs = await getDocs(q)
    if (!contentDocs) {
      return null
    }
    const contents = contentDocs.docs.map((doc) => doc.data())
    console.log(ref)
    console.log(storage)
    console.log(contents[0].areaId.toString())
    //        const storageRef = firebase.storage().ref();
    const storageRef = ref(storage, `${contents[0].areaId}`)
    const fullPath = content.name
    const uploadRef = ref(storageRef, fullPath)
    let viewTime = 2000
    if (duration != 0) {
      viewTime = duration
    }
    const uploadTask = uploadBytesResumable(uploadRef, content)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log("Upload is " + progress + "% done")
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused")
            break
          case "running":
            console.log("Upload is running")
            break
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          updateContentOrder(docId, {
            hidden: arrayUnion({
              fileName: content.name,
              path: downloadUrl,
              type: type,
              viewTime: viewTime,
            }),
          })
        })
      },
    )
  }
}
