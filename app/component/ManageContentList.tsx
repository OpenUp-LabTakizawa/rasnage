import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material"
import { IconButton } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { getContentDataClient } from "../../utilities/getContentDataClient"
import { setContentOrder } from "../../utilities/setContentData"
import { useOrderContext } from "./OrderContext"

function ManageContentsView() {
  // display / hidden : 表示/非表示コンテンツのArray
  const [display, setDisplay] = useState([])
  const [hidden, setHidden] = useState([])
  const [contentsList, setContentsList] = useState({})
  const [error, setError] = useState("")
  const [errorPart, setErrorPart] = useState("")
  const [showError, setShowError] = useState(false)

  // tempDisplay / tempHidden : display / hiddenに対しての一時的な変更を保持するMap
  //  const [tempDisplay, setTempDisplay] = useState(new Map());
  //  const [tempHidden, setTempHidden] = useState(new Map());
  const { uid, orderId, progress, setProgress } = useOrderContext()

  useEffect(() => {
    if (!sessionStorage.getItem("uid") && !uid) {
      router.push("/dashboard/Login")
    }
  }, [])

  useEffect(() => {
    async function featchData() {
      if (orderId == null) return
      const obj = await getContentDataClient(`/order/${orderId}`)
      const displayFiltered = obj["set1"]
        .filter((obj) => !obj.delete)
        .filter((obj) => Object.keys(obj).length)
      const hiddenFiltered = obj["hidden"]
        .filter((obj) => !obj.delete)
        .filter((obj) => Object.keys(obj).length)
      setDisplay(displayFiltered)
      setHidden(hiddenFiltered)
    }
    featchData()
  }, [orderId, progress])
  //  useEffect(() => {
  //    const displayMap = new Map();
  //    // displayのディープコピーを作成しないとdisplayMapの変更と連動してしまう
  //    const tmpDisplay = display.map(obj => ({ ...obj }));
  //    tmpDisplay.forEach((elem, i) => {
  //      displayMap.set("d" + i, elem);
  //    })
  //    setTempDisplay(displayMap);
  //
  //    const hiddenMap = new Map();
  //    const tmpHidden = hidden.map(obj => ({ ...obj }));
  //    tmpHidden.forEach((elem, i) => {
  //      hiddenMap.set("h" + i, elem);
  //    })
  //    setTempHidden(hiddenMap);
  //
  //  }, [display, hidden])
  const router = useRouter()

  const changeTempDisplay = (e, i) => {
    if (!e.target.value) return
    //tmpDisplayのディープコピーを作成して変更を加える
    //    const tmp = new Map();
    //    [...tempDisplay.keys()].forEach(elem => {
    //      tmp.set(elem, tempDisplay.get(elem));
    //    });

    //    const targetObj = tmp.get(e.target.name);
    setDisplay(
      display.map((item, index) => {
        return {
          ...item,
          viewTime: i == index ? e.target.value * 1000 : item.viewTime,
        }
      }),
    )
    //    tmp.set(e.target.name, targetObj);
    //    setTempDisplay(tmp);
  }

  const changeTempHidden = (e, i) => {
    if (!e.target.value) return
    setHidden(
      hidden.map((item, index) => {
        return {
          ...item,
          viewTime: i == index ? e.target.value * 1000 : item.viewTime,
        }
      }),
    )
  }

  const onClickSubmit = async () => {
    //    let validationFlg = false;
    //    display.forEach((item, index) => {
    //      console.log(item);
    //      if (item.viewTime) {
    //        setStatus({
    //          open: true,
    //          type: "error",
    //          message: `動画（MP4,MOV,WMV）以外が選択されています`
    //        });
    //        validationFlg = true;
    //      }
    //    });
    //    hidden.forEach((item, index) => {
    //      console.log(item);
    //      if (item.viewTime) {
    //        setStatus({
    //          open: true,
    //          type: "error",
    //          message: `動画（MP4,MOV,WMV）以外が選択されています`
    //        });
    //        validationFlg = true;
    //      }
    //    });
    //    if (validationFlg) return;
    try {
      setProgress(true)
      ////    console.log(display);
      ////    console.log(tempDisplay);
      //    let sortedDisplay = [...display.values()];
      //    sortedDisplay.sort((a, b) => {
      //      return a.order - b.order;
      //    })
      //    console.log(sortedDisplay);
      //    sortedDisplay.forEach((elem, index) => {
      //      sortedDisplay[index]["order"] = index;
      //    })

      const submitObj = {
        ...contentsList,
        set1: [...display.values()],
        hidden: [...hidden.values()],
      }
      await setContentOrder(orderId, submitObj)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const onClickRemove = async (checked, index) => {
    try {
      setProgress(true)
      if (checked) {
        display[index].delete = true
      } else {
        hidden[index].delete = true
      }

      const submitObj = {
        ...contentsList,
        set1: [...display.values()],
        hidden: [...hidden.values()],
      }
      await setContentOrder(orderId, submitObj)
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const onChangeCheckBox = (name) => {
    const [target, index] = [name[0], Number(name.slice(1))]

    if (target === "d") {
      setHidden([display[index], ...hidden])
      setDisplay(display.filter((_, i) => i !== index))
    } else {
      setDisplay([...display, hidden[index]])
      setHidden(hidden.filter((_, i) => i !== index))
    }
  }

  const handleDragEnd = (result, provided, name) => {
    if (!result.destination) {
      return
    }
    if (name == "d") {
      const itemsCopy = [...display]
      const [reorderedItem] = itemsCopy.splice(result.source.index, 1)
      itemsCopy.splice(result.destination.index, 0, reorderedItem)

      setDisplay(itemsCopy)
    } else if (name == "h") {
      const itemsCopy = [...hidden]
      const [reorderedItem] = itemsCopy.splice(result.source.index, 1)
      itemsCopy.splice(result.destination.index, 0, reorderedItem)

      setHidden(itemsCopy)
    }
  }

  const handleCloseError = () => {
    setShowError(false)
  }

  const createContentCard = (name, content, i, eventHandler, checked) => {
    if (content === null || content === undefined) return
    return (
      <Draggable
        key={"drag_key" + i}
        draggableId={"drag" + i}
        index={i}
        isCombineEnabled={true}
      >
        {(provided) => (
          <ListItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Paper
              sx={{ height: 1 / 5, m: 1 }}
              key={"key" + i}
              style={{
                position: "relative",
                minWidth: "400px",
                height: "100%",
              }}
            >
              <Grid container={true}>
                <Grid
                  item={true}
                  xs={1}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: "2rem",
                    minWidth: "45px",
                  }}
                >
                  <FormControlLabel
                    label="表示"
                    labelPlacement="top"
                    control={
                      <Checkbox
                        name={name + i}
                        checked={checked}
                        onChange={(e) => onChangeCheckBox(e.target.name)}
                      />
                    }
                  />
                </Grid>
                <Grid item={true} xs={3} style={{ minWidth: "280px" }}>
                  {content.type === "image" ? (
                    <img
                      src={content.path}
                      style={{
                        width: "30vh",
                        objectFit: "contain",
                        margin: "1rem",
                      }}
                      alt="image file"
                    />
                  ) : (
                    <video
                      src={content.path}
                      style={{
                        width: "30vh",
                        objectFit: "contain",
                        margin: "1rem",
                      }}
                      muted={true}
                      autoPlay={true}
                      loop={true}
                      playsInline={true}
                    />
                  )}
                </Grid>
                <Grid
                  item={true}
                  xs={6}
                  container={true}
                  style={{ padding: "20px" }}
                >
                  <Grid item={true} style={{ padding: "5px" }}>
                    <Typography>ファイル名: {content.fileName}</Typography>
                  </Grid>
                  <Grid item={true} container={true} direction="column">
                    <Grid
                      item={true}
                      style={{
                        display: "flex",
                        minWidth: "550px",
                        height: "45px",
                        padding: "5px",
                      }}
                    >
                      <Typography style={{ width: "20%", lineHeight: "35px" }}>
                        表示時間(秒):{" "}
                      </Typography>
                      <input
                        type="number"
                        style={{ width: "20%" }}
                        name={name + i}
                        disabled={content.type === "video"}
                        placeholder={Number(content.viewTime / 1000)}
                        onInput={(event) => eventHandler(event, i)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <IconButton
                aria-label="delete image"
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "#aaa",
                }}
                onClick={(e) => onClickRemove(checked, i)}
              >
                <CancelIcon />
              </IconButton>
            </Paper>
          </ListItem>
        )}
      </Draggable>
    )
  }

  return (
    <>
      <Box>
        <Typography>並び替え</Typography>
        <Button variant="contained" sx={{ m: 1 }} onClick={onClickSubmit}>
          送信
        </Button>
      </Box>
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Typography>ー 表示コンテンツ</Typography>
        <DragDropContext
          onDragEnd={(e, provided) => handleDragEnd(e, provided, "d")}
        >
          <Droppable droppableId="my-list">
            {(provided) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {display.map((content, i) =>
                  createContentCard("d", content, i, changeTempDisplay, true),
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
        <Typography>ー 非表示コンテンツ</Typography>
        <DragDropContext
          onDragEnd={(e, provided) => handleDragEnd(e, provided, "h")}
        >
          <Droppable droppableId="my-list">
            {(provided) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {hidden.map((content, i) =>
                  createContentCard("h", content, i, changeTempHidden, false),
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
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

export default ManageContentsView
