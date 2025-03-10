import { getAuth, onAuthStateChanged } from "@firebase/auth"
import { useRouter } from "next/router"
import { createContext, useContext, useEffect, useState } from "react"
import { createFirebaseApp } from "../../src/firebase/clientApp"

const OrderContext = createContext({
  currentUser: undefined,
})

export function useOrderContext() {
  return useContext(OrderContext)
}

export function OrderProvider({ children }) {
  const [orderId, setOrderId] = useState()
  //    const [isLogin, setIsLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState(undefined)
  const [uid, setUid] = useState(undefined)
  const [userName, setUserName] = useState()
  const [coverageArea, setCoverageArea] = useState([])
  const [progress, setProgress] = useState(false)

  const router = useRouter()
  const isAvailableForViewing = router.pathname === "/dashboard/Login"
  const value = {
    currentUser,
  }
  const firebaseApp = createFirebaseApp()
  const auth = getAuth(firebaseApp)

  // authはnullの可能性があるので、useEffectの第二引数にauthを指定しておく
  useEffect(() => {
    const authStateChanged = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      //       console.log(auth);
      if (!user && !isAvailableForViewing) {
        router.push("/dashboard/Login")
      }
    })
    return () => {
      //       console.log(auth);
      authStateChanged()
    }
  }, [auth, router.pathname])

  return (
    <OrderContext.Provider
      value={{
        orderId,
        setOrderId,
        isAdmin,
        setIsAdmin,
        currentUser,
        uid,
        setUid,
        userName,
        setUserName,
        coverageArea,
        setCoverageArea,
        progress,
        setProgress,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
