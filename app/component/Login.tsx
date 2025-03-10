import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import FormControlLabel from "@mui/material/FormControlLabel"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/router"
import { useState } from "react"

import Snackbar from "@mui/material/Snackbar"
//import SnackBar from './CustomizedSnackbars';
import { getAccountLoginData } from "../../utilities/getContentDataClient"
import { useOrderContext } from "./OrderContext"

function LoginComponent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginFlg, setLoginFlg] = useState(false)
  const [status, setStatus] = useState({ open: false, type: "", message: "" })

  const [error, setError] = useState("")
  const [errorPart, setErrorPart] = useState("")
  const [showError, setShowError] = useState(false)

  const { setIsAdmin, uid, setUid, setUserName, setCoverageArea, setProgress } =
    useOrderContext()

  const router = useRouter()

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setStatus({ ...status, open: false })
  }

  // Submitボタンを押したときの処理
  const onSubmit = async (event) => {
    event.preventDefault()
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/
    const isValidEmail = regex.test(email)
    if (!isValidEmail) {
      setError("メールアドレスの形式が異なっています")
      setErrorPart("メールアドレス欄")
      setShowError(true)
      return
    }
    setProgress(true) // スピナーを表示
    try {
      const user = await getAccountLoginData(email, password)
      if (user != null) {
        setUid(user.uid)
        console.log(user)
        if (user.passFlg) {
          router.push("/dashboard/PasswordReset")
          return
        }
        setUserName(user.userName)
        setCoverageArea(user.coverageArea)
        if (user.management) setIsAdmin(true)
        if (loginFlg) {
          sessionStorage.setItem("uid", user.uid)
          sessionStorage.setItem("userName", user.userName)
          sessionStorage.setItem("management", user.management)
          sessionStorage.setItem(
            "coverageArea",
            user.coverageArea ? user.coverageArea.join() : "",
          )
        } else {
          sessionStorage.setItem("uid", "")
          sessionStorage.setItem("userName", "")
          sessionStorage.setItem("management", "")
          sessionStorage.setItem("coverageArea", "")
        }

        router.push("/dashboard")
      }
    } catch (e) {
      console.log(e)
      setError("ログイン失敗しました。メールアドレスかパスワードが異なります")
      setErrorPart("ログイン")
      setShowError(true)
    } finally {
      setProgress(false) // スピナーを表示
    }
  }

  const handleCloseError = () => {
    setShowError(false)
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          ログイン
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required={true}
            fullWidth={true}
            id="email"
            label="e-mail"
            name="email"
            autoComplete="email"
            onInput={(e) => setEmail(e.target.value)}
            autoFocus={true}
          />
          <TextField
            margin="normal"
            required={true}
            fullWidth={true}
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onInput={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                name={"loginFlg"}
                checked={loginFlg}
                onChange={(e) => setLoginFlg(!loginFlg)}
                color="primary"
              />
            }
            label="ログインを維持する"
          />
          <Button
            type="submit"
            fullWidth={true}
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            ログイン
          </Button>
          <Grid container={true}>
            <Grid item={true} xs={true}>
              <Link
                href="#"
                variant="body2"
                onClick={() => {
                  setStatus({
                    open: true,
                    type: "error",
                    message: `管理者に問い合わせてください`,
                  })
                }}
              >
                パスワードを忘れた?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Snackbar
        open={status.open}
        onClose={handleClose}
        autoHideDuration={3000}
        message={status.message}
        style={{ position: "relative" }}
      />
      <Dialog open={showError} onClose={handleCloseError}>
        <DialogContent>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Typography variant="body1">対象箇所</Typography>
          <Typography variant="body1">{errorPart}</Typography>
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default LoginComponent
