import CancelIcon from "@mui/icons-material/Cancel"
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import { postContent } from "../../utilities/upload"
import { useOrderContext } from "./OrderContext"

function UploadContents() {
  const [images, setImages] = useState([])
  const [type, setType] = useState("image")
  const [error, setError] = useState("")
  const [errorPart, setErrorPart] = useState("")
  const [showError, setShowError] = useState(false)
  const { isLogin, orderId, uid, progress, setProgress } = useOrderContext()
  const maxImageUpload = 4
  const inputId = Math.random().toString(32).substring(2)

  const router = useRouter()
  useEffect(() => {
    if (!sessionStorage.getItem("uid") && !uid) {
      router.push("/dashboard/Login")
    }
  }, [progress])

  const handleOnUpload = async (e) => {
    e.preventDefault()
    try {
      setProgress(true)
      //          setShowError(true);
      images.forEach((image, i) => {
        let duration = 0
        if (type == "video") {
          const videoElement = document.getElementById("video_" + i)
          duration = Math.round(videoElement.duration) * 1000
        }
        postContent(orderId, image, type, duration)
      })
      setImages([])
    } catch (e) {
      console.log(e)
    } finally {
      setProgress(false)
    }
  }

  const handleOnAddImage = (e) => {
    if (!e.target.files) return
    let validationFlg = false
    if (type == "image") {
      // 画像の場合
      for (var i = 0; i < e.target.files.length; i++) {
        // 拡張子チェック
        if (
          e.target.files[i].type != "image/png" &&
          e.target.files[i].type != "image/jpeg"
        ) {
          setError("画像（PNG,JPEG）以外が選択されています")
          setErrorPart("画像")
          setShowError(true)
          validationFlg = true
          break
        }
      }
    } else if (type == "video") {
      // 動画の場合
      for (var i = 0; i < e.target.files.length; i++) {
        // 拡張子チェック
        if (
          e.target.files[i].type != "video/mp4" &&
          e.target.files[i].type != "video/quicktime" &&
          e.target.files[i].type != "video/x-ms-wmv"
        ) {
          setError("動画（MP4,MOV,WMV）以外が選択されています")
          setErrorPart("動画")
          setShowError(true)
          validationFlg = true
          break
        }
      }
    }
    if (validationFlg) return
    setImages([...images, ...e.target.files])
  }

  const handleOnRemoveImage = (index) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const toggleUploadType = (e, newString) => {
    if (newString == null) {
      newString = type
      return
    }
    setType(newString)
    setImages([])
  }

  const handleCloseError = () => {
    setShowError(false)
  }

  return (
    <div>
      <Box sx={{ display: "flex", m: 2, fontSize: "1rem" }}>
        最大４つまでの画像/動画を選択してアップロード
      </Box>
      <ToggleButtonGroup
        color="primary"
        value={type}
        exclusive={true}
        onChange={toggleUploadType}
        aria-label="type"
        sx={{ height: "2rem" }}
      >
        <ToggleButton sx={{ width: "4rem" }} value="image">
          画像
        </ToggleButton>
        <ToggleButton sx={{ width: "4rem" }} value="video">
          動画
        </ToggleButton>
      </ToggleButtonGroup>
      <form action="" style={{ marginTop: "0.5rem" }}>
        <label htmlFor={inputId}>
          <Button
            variant="contained"
            disabled={images.length >= maxImageUpload || orderId == null}
            component="span"
            style={{ width: "8rem" }}
          >
            {type === "image" ? "画像追加" : "動画追加"}
          </Button>
          <input
            id={inputId}
            type="file"
            multiple={true}
            disabled={images.length >= maxImageUpload || orderId == null}
            onChange={(e) => handleOnAddImage(e)}
            style={{ display: "none" }}
          />
        </label>
        <Button
          variant="contained"
          onClick={(e) => handleOnUpload(e)}
          disabled={images.length < 1 || orderId == null}
          style={{ width: "8rem", margin: "1rem" }}
        >
          アップロード
        </Button>
        <div style={{ display: "flex" }}>
          {images.map((image, i) => {
            const id = "video_" + i
            return (
              <div
                key={i}
                style={{ position: "relative", width: "40%", margin: "0.5rem" }}
              >
                <IconButton
                  aria-label="delete image"
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    color: "#aaa",
                  }}
                  onClick={() => handleOnRemoveImage(i)}
                >
                  <CancelIcon />
                </IconButton>
                {type == "image" ? (
                  <img
                    src={URL.createObjectURL(image)}
                    style={{ width: "100%" }}
                    alt="preview"
                  />
                ) : (
                  <video
                    id={id}
                    src={URL.createObjectURL(image)}
                    style={{ width: "100%" }}
                    alt="preview"
                  />
                )}
              </div>
            )
          })}
        </div>
      </form>
      <Dialog open={showError} onClose={handleCloseError}>
        <DialogContent>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Typography variant="body1">対象箇所</Typography>
          <Typography variantx="body1">{errorPart}</Typography>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UploadContents
