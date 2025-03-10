import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage"
import { createFirebaseApp } from "../firebase/clientApp"

export const downLoadURLList = async ({ areaId }) => {
  const urlList: string[] = []

  const app = createFirebaseApp()

  const storage = getStorage(app)
  const storageRef = ref(storage, areaId)
  const refList = await (await listAll(storageRef)).items
  for (const ref of refList) {
    await getDownloadURL(ref)
      .then((url) => {
        urlList.push(url)
      })
      .catch((err) => alert(err))
  }
  return urlList
}
