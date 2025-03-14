"use client"
import { getAuth, signOut } from "@firebase/auth"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import LogoutIcon from "@mui/icons-material/Logout"
import MenuIcon from "@mui/icons-material/Menu"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import MuiAppBar from "@mui/material/AppBar"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import Divider from "@mui/material/Divider"
import MuiDrawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { ThemeProvider, createTheme, styled } from "@mui/material/styles"
import { useRouter } from "next/router"
import * as React from "react"
import { getContentList } from "../../utilities/getContentDataClient"
import { MainListItems } from "./ListItems"
import { OrderProvider, useOrderContext } from "./OrderContext"

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit">ラボ</Link> {new Date().getFullYear()}
      {"."}
    </Typography>
  )
}

const drawerWidth = 240

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}))

const mdTheme = createTheme()

function DashboardContent({
  areaDisplay,
  isPass,
  children,
  title = "defaoult title",
}) {
  const [open, setOpen] = React.useState(false)
  const {
    isAdmin,
    setOrderId,
    uid,
    setUid,
    userName,
    setUserName,
    coverageArea,
    progress,
  } = useOrderContext()
  const [contentsObjArr, setContentsObjArr] = React.useState([])
  const [area, setArea] = React.useState("")
  const [name, setName] = React.useState("")
  //  const [u_id, setU_id] = React.useState();
  const toggleDrawer = () => {
    setOpen(!open)
  }
  const router = useRouter()

  const handleOnAreaChange = (event) => {
    setArea(event.target.value)
    const selectedIndex = contentsObjArr
      .map((obj) => obj.areaName)
      .indexOf(event.target.value)
    setOrderId(contentsObjArr[selectedIndex].orderId)
  }

  //  React.useEffect(() => {
  //    setU_id(sessionStorage.getItem('uid') ? sessionStorage.getItem('uid') : uid);
  //  }, [uid])
  React.useEffect(() => {
    async function getContentAreaData() {
      const coverageAreaList = sessionStorage.getItem("coverageArea")
        ? sessionStorage.getItem("coverageArea").split(",")
        : coverageArea
      if (coverageAreaList.length > 0) {
        const contents = await getContentList(coverageAreaList)
        setContentsObjArr(contents)
        setArea(contents[0].areaName)
        setOrderId(contents[0].orderId)
      } else {
        setArea("設定なし")
        setContentsObjArr(["設定なし"])
        setOrderId(null)
      }
    }
    getContentAreaData()
  }, [coverageArea])

  React.useEffect(() => {
    if (sessionStorage.getItem("uid")) {
      setUid(sessionStorage.getItem("uid"))
    }
    if (uid)
      setName(
        sessionStorage && sessionStorage.getItem("userName")
          ? sessionStorage.getItem("userName")
          : userName,
      )
  }, [uid, userName])

  const onClickLogout = async () => {
    setName("")
    const auth = getAuth()
    await signOut(auth)
      .then(() => {
        sessionStorage.clear()
        setUid("")
        setUserName("")
        router.push("/dashboard/Login")
      })
      .catch((e) => {
        alert("ログアウトに失敗しました")
        console.log(e)
      })
  }

  const classDrop = "color: #fff"

  return (
    <ThemeProvider theme={mdTheme}>
      {progress ? (
        <Backdrop
          className={classDrop}
          open={progress}
          style={{ zIndex: "100" }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: "24px", // keep right padding when drawer closed
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "36px",
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap={true}
                sx={{ flexGrow: 1 }}
              >
                サイネージダッシュボード{name && <>　ユーザー名：{name}</>}
              </Typography>
              {areaDisplay && (
                <FormControl variant="standard" sx={{ minWidth: 120 }}>
                  <InputLabel id="area-label" sx={{ color: "white" }}>
                    エリア選択
                  </InputLabel>
                  <Select
                    labelId="area-label"
                    id="area-select"
                    value={area}
                    onChange={handleOnAreaChange}
                    label="エリア選択"
                    disabled={contentsObjArr.length == 0}
                    sx={{ color: "white" }}
                  >
                    {contentsObjArr.length > 0 &&
                      contentsObjArr.map((obj, i) => (
                        <MenuItem value={obj.areaName} key={i}>
                          {obj.areaName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            {!isPass && uid && (
              <>
                <List component="nav" style={{ height: "100%" }}>
                  <MainListItems isAdmin={isAdmin} />
                  <Divider sx={{ my: 1 }} />
                </List>
                <List component="nav"></List>
                <ListItemButton
                  onClick={onClickLogout}
                  style={{ display: "flex", alignItems: "end" }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary={"ログアウト"} />
                </ListItemButton>
              </>
            )}
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
            }}
          >
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              {children}
              <Copyright sx={{ pt: 4 }} />
            </Container>
          </Box>
        </Box>
      )}
    </ThemeProvider>
  )
}

export default function Dashboard({
  areaDisplay,
  isPass = false,
  children,
  title,
}) {
  return (
    <OrderProvider>
      <DashboardContent
        areaDisplay={areaDisplay}
        isPass={isPass}
        title="defalut title"
      >
        {children}
      </DashboardContent>
    </OrderProvider>
  )
}
