import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AddBusinessIcon from "@mui/icons-material/AddBusiness"
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle"
import DisplayIcon from "@mui/icons-material/DisplaySettings"
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts"
import UploadIcon from "@mui/icons-material/Upload"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { useRouter } from "next/router"
import * as React from "react"

export const MainListItems = (props) => {
  const router = useRouter()
  const CustomlistItem = ({ onClick, text, children }) => {
    return (
      <ListItemButton onClick={onClick}>
        <ListItemIcon>{children}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    )
  }

  const management = false
  //  const management = (sessionStorage.getItem("management") === "true") ? true: false;

  return (
    <React.Fragment>
      <CustomlistItem
        onClick={() => router.push("/dashboard")}
        text="アップロード"
      >
        <UploadIcon />
      </CustomlistItem>
      <CustomlistItem
        onClick={() => router.push("/dashboard/ManageContents")}
        text="コンテンツ変更"
      >
        <ChangeCircleIcon />
      </CustomlistItem>
      <CustomlistItem
        onClick={() => router.push("/dashboard/ViewPosition")}
        text="表示画面調整"
      >
        <DisplayIcon />
      </CustomlistItem>
      {(management || props.isAdmin) && (
        <CustomlistItem
          onClick={() => router.push("/dashboard/AreaManagement")}
          text="エリア管理"
        >
          <AddBusinessIcon />
        </CustomlistItem>
      )}
      {(management || props.isAdmin) && (
        <CustomlistItem
          onClick={() => router.push("/dashboard/UserAccountManagement")}
          text="アカウント一覧管理"
        >
          <AccountBalanceIcon />
        </CustomlistItem>
      )}
      <CustomlistItem
        onClick={() => router.push("/dashboard/AccountSettingManagement")}
        text="アカウント詳細管理"
      >
        <ManageAccountsIcon />
      </CustomlistItem>
    </React.Fragment>
  )
}
