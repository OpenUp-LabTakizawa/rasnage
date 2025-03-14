import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
} from "@mui/material"
import { IconButton } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import {
  getContentsDataClient,
  getUserAccountList,
} from "../../utilities/getContentDataClient"
import {
  createAccountData,
  deleteAccountData,
  resetAccountPassword,
  updateAccountData,
} from "../../utilities/setContentData"
import { useOrderContext } from "./OrderContext"

function UserAccountManagementComponent() {
  const [userList, setUserList] = useState([])
  const [contentList, setContentList] = useState([])
  const [displayFlg, setDisplayFlg] = useState(false)
  const [createDisplay, setCreateDisplay] = useState(false)

  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [management, setManagement] = useState("user")
  const [area, setArea] = useState([])

  const [users, setUsers] = useState([])

  const [error, setError] = useState("")
  const [errorPart, setErrorPart] = useState("")
  const [showError, setShowError] = useState(false)

  const [detailDisplay, setDetailDisplay] = useState([])
  const [settingDisplay, setSettingDisplay] = useState([])

  const { isAdmin, uid, setCoverageArea, progress, setProgress } =
    useOrderContext()

  const router = useRouter()

  useEffect(() => {
    if (sessionStorage.getItem("uid") && !isAdmin) {
      router.push("/dashboard")
    } else if (!sessionStorage.getItem("uid") && !uid) {
      router.push("/dashboard/Login")
    }
    async function getInfoData() {
      const getUserList = await getUserAccountList("users")
      const contents = await getContentsDataClient("contents")
      setUserList(getUserList)
      setContentList(contents)
      setDisplayFlg(true)
      const displayList = []
      const areaList = []
      setUsers(
        getUserList.map((item) => {
          const list = contents.map(
            (content, index) =>
              item.coverageArea && item.coverageArea.includes(content.areaId),
          )
          return {
            userName: item.userName,
            userNameFlg: true,
            management: item.management ? "management" : "user",
            coverageArea: list,
            delete: item.delete,
          }
        }),
      )
      contents.forEach((_) => {
        displayList.push(false)
        areaList.push(false)
      })
      setDetailDisplay(displayList)
      setSettingDisplay(displayList)
      setArea(areaList)
    }
    getInfoData()
  }, [progress])

  useEffect(() => {
    const areaList = contentList.map((item) => false)
    setEmail("")
    setUserName("")
    setPassword("")
    setArea(areaList)
  }, [createDisplay])

  const handleDetail = (index) => {
    const list = detailDisplay.map((display, i) =>
      i == index ? !display : display,
    )
    setDetailDisplay(list)
  }
  const handleSetting = (index) => {
    const list = settingDisplay.map((display, i) =>
      i == index ? !display : display,
    )
    setUsers(
      users.map((item, i) => {
        if (index != i) return item
        const areaList = contentList.map(
          (content) =>
            userList[index].coverageArea &&
            userList[index].coverageArea.includes(content.areaId),
        )
        return {
          ...userList[i],
          userNameFlg: true,
          coverageArea: areaList,
          management: userList[index].management ? "management" : "user",
        }
      }),
    )
    setSettingDisplay(list)
  }

  const onClickCreate = async () => {
    try {
      setProgress(true)
      //      if (userList.some(user => user.userId === userId)) {
      //        setError("ユーザーIDが重複しています");
      //        setShowError(true);
      //        return;
      //      }
      const list = area
        .map((item, index) => {
          if (item) {
            return contentList[index].areaId
          }
        })
        .filter((item) => item)
      const user = {
        email: email,
        userName: userName,
        management: management == "management" ? true : false,
        coverageArea: list,
        passFlg: true,
        delete: false,
      }
      await createAccountData(email, password, user)
      setCreateDisplay(false)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const onClickUpdate = async (index) => {
    try {
      setProgress(true)
      const list = users[index].coverageArea
        .map((item, i) => {
          if (item) {
            return contentList[i].areaId
          }
        })
        .filter((item) => item)
      const user = {
        userName: users[index].userNameFlg
          ? userList[index].userName
          : users[index].userName,
        management: users[index].management == "management" ? true : false,
        coverageArea: list,
      }

      await updateAccountData(users[index].uid, user)
      if (users[index].uid == uid) {
        setCoverageArea(list)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
    //    router.reload();
  }

  const onClickResetAccountPassword = async (index) => {
    try {
      setProgress(true)
      const uid = users[index].uid
      await resetAccountPassword(users[index].uid, "sample")
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const handleCloseError = () => {
    setShowError(false)
  }

  const onClickRemove = async (index) => {
    try {
      setProgress(true)
      await deleteAccountData(userList[index].uid)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
    //    router.reload();
  }

  // 管理者・利用者入れかえ
  const handleOptionChange = (event) => {
    setManagement(event.target.value)
  }

  const handleSettingOptionChange = (event, index) => {
    setUsers(
      users.map((item, i) => {
        return {
          ...item,
          management: index == i ? event.target.value : item.management,
        }
      }),
    )
  }

  // エリア設定
  const onChangeCheckBox = (index) => {
    const list = area.map((item, i) => (index == i ? !item : item))
    setArea(list)
  }

  // エリア設定
  const onSettingChangeCheckBox = (index, i) => {
    setUsers(
      users.map((item, j) => {
        return {
          ...item,
          coverageArea:
            index == j
              ? item.coverageArea.map((body, k) => (i == k ? !body : body))
              : item.coverageArea,
        }
      }),
    )
  }

  const onSettingChangeUserName = (e, index) => {
    setUsers(
      users.map((item, i) => {
        if (index != i) return item
        return {
          ...users[i],
          userName: e.target.value,
        }
      }),
    )
  }

  const onSettingUserNameCheckBox = (index) => {
    setUsers(
      users.map((item, i) => {
        if (index != i) return item
        return {
          ...users[i],
          userNameFlg: !users[i].userNameFlg,
        }
      }),
    )
  }

  return (
    <>
      <Box>
        <Typography>アカウント一覧管理</Typography>
        {displayFlg ? (
          <>
            <Grid>
              {createDisplay ? (
                <Button
                  variant="contained"
                  sx={{ m: 1 }}
                  onClick={() => setCreateDisplay(false)}
                >
                  閉じる
                </Button>
              ) : (
                <Button
                  variant="contained"
                  sx={{ m: 1 }}
                  onClick={() => setCreateDisplay(true)}
                >
                  アカウント追加
                </Button>
              )}
              {createDisplay && (
                <Paper
                  sx={{ height: 1 / 5, m: 1 }}
                  key={"key"}
                  style={{ position: "relative" }}
                >
                  <Grid container={true}>
                    <Grid
                      item={true}
                      xs={8}
                      container={true}
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        item={true}
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          メールアドレス（ログイン用）：{" "}
                        </Typography>
                        <input
                          type="text"
                          style={{ width: "50%" }}
                          name={"email"}
                          placeholder={"email"}
                          onInput={(e) => setEmail(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item={true}
                      xs={8}
                      container={true}
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        item={true}
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          パスワード：{" "}
                        </Typography>
                        <input
                          type="password"
                          style={{ width: "50%" }}
                          name={"password"}
                          placeholder={"パスワード"}
                          onInput={(e) => setPassword(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item={true}
                      xs={8}
                      container={true}
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        item={true}
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          ユーザー名：{" "}
                        </Typography>
                        <input
                          type="text"
                          style={{ width: "50%" }}
                          name={"userName"}
                          placeholder={"名前"}
                          onInput={(e) => setUserName(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item={true}
                      xs={8}
                      container={true}
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        item={true}
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          権限：{" "}
                        </Typography>
                        <FormControlLabel
                          label={"管理者"}
                          labelPlacement="start"
                          control={
                            <input
                              type="radio"
                              style={{ width: "20%" }}
                              name={"management"}
                              value={"management"}
                              checked={management === "management"}
                              onChange={handleOptionChange}
                            />
                          }
                          style={{ marginRight: "0px", width: "75px" }}
                        />
                        <FormControlLabel
                          label={"利用者"}
                          labelPlacement="start"
                          control={
                            <input
                              type="radio"
                              style={{ width: "20%" }}
                              name={"management"}
                              value={"user"}
                              checked={management === "user"}
                              onChange={handleOptionChange}
                            />
                          }
                          style={{ marginRight: "0px", width: "75px" }}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item={true}
                      xs={8}
                      container={true}
                      direction="column"
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                      }}
                    >
                      <Grid
                        item={true}
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          エリア設定：{" "}
                        </Typography>
                        <Grid style={{ display: "flex", flexWrap: "wrap" }}>
                          {contentList.map((content, index) => {
                            return (
                              <FormControlLabel
                                label={content.areaName}
                                labelPlacement="start"
                                key={"area_check" + index}
                                control={
                                  <Checkbox
                                    name={"area[" + index + "]"}
                                    checked={area[index]}
                                    onChange={(e) => onChangeCheckBox(index)}
                                    style={{ width: "20px" }}
                                  />
                                }
                                style={{ marginRight: "0px" }}
                              />
                            )
                          })}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Button
                    disabled={email == "" || userName == "" || password == ""}
                    variant="contained"
                    sx={{ m: 1 }}
                    onClick={onClickCreate}
                  >
                    追加
                  </Button>
                </Paper>
              )}
            </Grid>
            <Box style={{ display: "flex", flexDirection: "column" }}>
              {userList.map((user, index) => {
                const areas = user.coverageArea
                  .map((area) => {
                    const list = contentList.filter(
                      (content) => content.areaId == area,
                    )
                    return list[0]?.areaName
                  })
                  .filter((item) => item)
                return (
                  <Paper
                    sx={{ height: 1 / 5, m: 1 }}
                    key={"key" + index}
                    style={{ position: "relative" }}
                  >
                    <Grid container={true}>
                      <Grid
                        item={true}
                        xs={5}
                        container={true}
                        direction="column"
                        style={{
                          minWidth: "550px",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          padding: "20px",
                        }}
                      >
                        <Grid
                          item={true}
                          style={{
                            display: "flex",
                            height: "45px",
                            padding: "5px",
                          }}
                        >
                          <Typography style={{ lineHeight: "35px" }}>
                            ユーザー名： {user.userName}
                          </Typography>
                        </Grid>
                      </Grid>
                      {!settingDisplay[index] &&
                        (detailDisplay[index] ? (
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => handleDetail(index)}
                          >
                            閉じる
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => handleDetail(index)}
                          >
                            詳細
                          </Button>
                        ))}

                      {detailDisplay[index] && (
                        <>
                          <Grid container={true}>
                            <Grid
                              item={true}
                              xs={8}
                              container={true}
                              direction="column"
                              style={{
                                minWidth: "550px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "20px",
                              }}
                            >
                              <Grid
                                item={true}
                                style={{
                                  display: "flex",
                                  height: "45px",
                                  padding: "5px",
                                }}
                              >
                                <Typography style={{ lineHeight: "35px" }}>
                                  権限： {user.management ? "管理者" : "利用者"}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid
                              item={true}
                              xs={8}
                              container={true}
                              direction="column"
                              style={{
                                minWidth: "550px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "20px",
                              }}
                            >
                              <Grid
                                item={true}
                                style={{
                                  display: "flex",
                                  height: "45px",
                                  padding: "5px",
                                }}
                              >
                                <Typography
                                  style={{
                                    lineHeight: "35px",
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  エリア設定：{" "}
                                  {areas.length > 0 ? (
                                    areas.map((area, i) => (
                                      <Grid
                                        key={"areaList_" + i}
                                        style={{ padding: "0 10px" }}
                                      >
                                        {area}
                                      </Grid>
                                    ))
                                  ) : (
                                    <Grid
                                      style={{
                                        lineHeight: "35px",
                                        padding: "0 10px",
                                      }}
                                    >
                                      設定なし
                                    </Grid>
                                  )}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {!detailDisplay[index] &&
                        (settingDisplay[index] ? (
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => handleSetting(index)}
                          >
                            閉じる
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => handleSetting(index)}
                          >
                            編集
                          </Button>
                        ))}
                      {settingDisplay[index] && (
                        <>
                          <Grid container={true}>
                            <Grid
                              item={true}
                              xs={8}
                              container={true}
                              direction="column"
                              style={{
                                minWidth: "550px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "20px",
                              }}
                            >
                              <Grid
                                item={true}
                                style={{
                                  display: "flex",
                                  height: "45px",
                                  padding: "5px",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography style={{ lineHeight: "35px" }}>
                                  ユーザー名：{" "}
                                </Typography>
                                <input
                                  type="text"
                                  style={{ width: "50%" }}
                                  name={"users[" + index + "].userName"}
                                  placeholder={user.userName}
                                  disabled={users[index].userNameFlg}
                                  onInput={(e) =>
                                    onSettingChangeUserName(e, index)
                                  }
                                />
                              </Grid>
                              <FormControlLabel
                                label={"変更しない"}
                                labelPlacement="start"
                                control={
                                  <Checkbox
                                    name={"users[" + index + "].userNameFlg"}
                                    checked={
                                      users[index] && users[index].userNameFlg
                                    }
                                    onChange={(e) =>
                                      onSettingUserNameCheckBox(index)
                                    }
                                    style={{ width: "20px" }}
                                  />
                                }
                                style={{ marginRight: "0px" }}
                              />
                            </Grid>
                            <Grid
                              item={true}
                              xs={8}
                              container={true}
                              direction="column"
                              style={{
                                minWidth: "550px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "20px",
                              }}
                            >
                              <Grid
                                item={true}
                                style={{
                                  display: "flex",
                                  height: "45px",
                                  padding: "5px",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography style={{ lineHeight: "35px" }}>
                                  権限：{" "}
                                </Typography>
                                <FormControlLabel
                                  label={"管理者"}
                                  labelPlacement="start"
                                  control={
                                    <input
                                      type="radio"
                                      style={{ width: "20%" }}
                                      name={"users[" + index + "].management"}
                                      value={"management"}
                                      disabled={true}
                                      checked={
                                        users[index] &&
                                        users[index].management === "management"
                                      }
                                      onChange={(e) =>
                                        handleSettingOptionChange(e, index)
                                      }
                                    />
                                  }
                                  style={{ marginRight: "0px", width: "75px" }}
                                />
                                <FormControlLabel
                                  label={"利用者"}
                                  labelPlacement="start"
                                  control={
                                    <input
                                      type="radio"
                                      style={{ width: "20%" }}
                                      name={"users[" + index + "].management"}
                                      value={"user"}
                                      disabled={true}
                                      checked={
                                        users[index] &&
                                        users[index].management === "user"
                                      }
                                      onChange={(e) =>
                                        handleSettingOptionChange(e, index)
                                      }
                                    />
                                  }
                                  style={{ marginRight: "0px", width: "75px" }}
                                />
                              </Grid>
                            </Grid>
                            <Grid
                              item={true}
                              xs={8}
                              container={true}
                              direction="column"
                              style={{
                                minWidth: "550px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: "20px",
                              }}
                            >
                              <Grid
                                item={true}
                                style={{
                                  display: "flex",
                                  height: "45px",
                                  padding: "5px",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography style={{ lineHeight: "35px" }}>
                                  エリア設定：{" "}
                                </Typography>
                                <Grid
                                  style={{ display: "flex", flexWrap: "wrap" }}
                                >
                                  {contentList.map((content, i) => {
                                    return (
                                      <FormControlLabel
                                        label={content.areaName}
                                        labelPlacement="start"
                                        key={"areaName_" + i}
                                        control={
                                          <Checkbox
                                            name={
                                              "users[" +
                                              index +
                                              "].coverageArea"
                                            }
                                            checked={
                                              users[index] &&
                                              users[index].coverageArea[i]
                                            }
                                            onChange={(e) =>
                                              onSettingChangeCheckBox(index, i)
                                            }
                                            style={{ width: "20px" }}
                                          />
                                        }
                                        style={{ marginRight: "0px" }}
                                      />
                                    )
                                  })}
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Button
                            variant="contained"
                            sx={{ m: 1 }}
                            onClick={() => onClickUpdate(index)}
                          >
                            編集
                          </Button>
                        </>
                      )}
                    </Grid>
                    <IconButton
                      aria-label="delete image"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        color: "#aaa",
                      }}
                      onClick={(e) => onClickRemove(index)}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Paper>
                )
              })}
            </Box>
          </>
        ) : (
          <>
            <Typography>データ取得中</Typography>
          </>
        )}
      </Box>
      <Dialog open={showError} onClose={handleCloseError}>
        <DialogContent>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Typography variant="body1">対象箇所</Typography>
          <Typography variant="body1">エリア追加時のエリア名</Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserAccountManagementComponent
