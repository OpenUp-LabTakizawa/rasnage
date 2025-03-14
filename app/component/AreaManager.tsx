import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material"
import { IconButton } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { getContentsDataClient } from "../../utilities/getContentDataClient"
import {
  createContentsData,
  deleteContentsData,
  updateContentsData,
} from "../../utilities/setContentData"
import { useOrderContext } from "./OrderContext"

function AreaManagementComponent() {
  const [contentsList, setContentsList] = useState([])
  const [displayFlg, setDisplayFlg] = useState(false)
  const [createDisplay, setCreateDisplay] = useState(false)
  const [areaName, setAreaName] = useState("")
  const [areaNameList, setAreaNameList] = useState([])
  const [error, setError] = useState("")
  const [errorPart, setErrorPart] = useState("")
  const [showError, setShowError] = useState(false)
  const [updateAreaDisplay, setUpdateAreaDisplay] = useState([])
  const { uid, isAdmin, progress, setProgress } = useOrderContext()

  useEffect(() => {
    if (
      sessionStorage.getItem("uid") &&
      sessionStorage.getItem("management") !== "true"
    ) {
      router.push("/dashboard")
    } else if (sessionStorage.getItem("uid") !== "true" && (!uid || !isAdmin)) {
      router.push("/dashboard/Login")
    }
    async function getAreaInfoData() {
      const contents = await getContentsDataClient("contents")
      contents.sort((a, b) => {
        return Number(a.areaId) - Number(b.areaId)
      })
      setContentsList(contents)
      setDisplayFlg(true)
      const displayList = []
      const areaList = []
      contents.forEach((_) => {
        displayList.push(false)
        areaList.push("")
      })
      setUpdateAreaDisplay(displayList)
      setAreaNameList(areaList)
    }
    getAreaInfoData()
  }, [progress])

  const router = useRouter()

  const updateArea = (index) => {
    const list = updateAreaDisplay.map((display, i) =>
      i == index ? !display : display,
    )
    setUpdateAreaDisplay(list)
  }

  const onClickCreate = async () => {
    if (contentsList.some((content) => content.areaName === areaName)) {
      setError("エリア名が他のエリアと重複しています")
      setErrorPart("エリア追加時のエリア名")
      setShowError(true)
      return
    }
    try {
      setProgress(true)
      await createContentsData(areaName)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const onClickUpdate = async (index) => {
    console.log(contentsList)
    if (
      contentsList.some((content) => content.areaName === areaNameList[index])
    ) {
      setError("エリア名が他のエリアと重複しています")
      setErrorPart("エリア編集時のエリア名")
      setShowError(true)
      return
    }
    try {
      setProgress(true)
      await updateContentsData(index, contentsList, areaNameList[index])
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const setAreaNames = (areaName, index) => {
    const areaList = areaNameList.map((name, i) =>
      i == index ? areaName : name,
    )
    setAreaNameList(areaList)
  }

  const handleCloseError = () => {
    setShowError(false)
  }

  const onClickRemove = async (index) => {
    try {
      setProgress(true)
      await deleteContentsData(index, contentsList)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  return (
    <>
      <Box>
        <Typography>エリア管理</Typography>
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
                  エリア追加
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
                      style={{
                        minWidth: "550px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "20px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Grid
                        item={true}
                        style={{
                          display: "flex",
                          height: "45px",
                          padding: "5px",
                          width: "50%",
                        }}
                      >
                        <Typography style={{ lineHeight: "35px" }}>
                          エリア名：{" "}
                        </Typography>
                        <input
                          type="text"
                          style={{ width: "40%" }}
                          name={"areaName"}
                          placeholder={"例：関東"}
                          onInput={(e) => setAreaName(e.target.value)}
                        />
                      </Grid>
                      <Button
                        disabled={areaName == ""}
                        variant="contained"
                        sx={{ m: 1 }}
                        onClick={onClickCreate}
                      >
                        エリア追加
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Grid>
            <Box style={{ display: "flex", flexDirection: "column" }}>
              {contentsList.map((content, index) => {
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
                          <Typography
                            style={{ lineHeight: "35px", marginRight: "20px" }}
                          >
                            エリアID： {content.areaId}
                          </Typography>
                          <Typography style={{ lineHeight: "35px" }}>
                            エリア名： {content.areaName}
                          </Typography>
                        </Grid>
                      </Grid>
                      {updateAreaDisplay[index] ? (
                        <Button
                          variant="contained"
                          sx={{ m: 1 }}
                          onClick={() => updateArea(index)}
                        >
                          閉じる
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          sx={{ m: 1 }}
                          onClick={() => updateArea(index)}
                        >
                          編集
                        </Button>
                      )}
                      {updateAreaDisplay[index] && (
                        <>
                          <input
                            type="text"
                            style={{
                              width: "20%",
                              height: "45px",
                              margin: "20px",
                            }}
                            name={"areaNameList[" + index + "]"}
                            placeholder={"例：関東"}
                            onInput={(e) => setAreaNames(e.target.value, index)}
                          />
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
          <Typography variant="body1">{errorPart}</Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AreaManagementComponent
