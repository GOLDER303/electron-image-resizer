const form = document.querySelector<HTMLFormElement>("#img-form")!;
const img = document.querySelector<HTMLInputElement>("#img")!;
const outputPath = document.querySelector<HTMLSpanElement>("#output-path")!;
const filename = document.querySelector<HTMLSpanElement>("#filename")!;
const heightInput = document.querySelector<HTMLInputElement>("#height")!;
const widthInput = document.querySelector<HTMLInputElement>("#width")!;

const { os, path, toastify, ipcRenderer } = window.api;

const isFileImage = (file: File) => {
  const acceptedImageTypes = ["image/git", "image/png", "image/jpeg"];

  return file && acceptedImageTypes.includes(file.type);
};

const sendAlert = (message: string, type: "ERROR" | "SUCCESS") => {
  toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: type == "ERROR" ? "red" : "green",
      color: "white",
      textAlign: "center",
    },
  });
};

const loadImage = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (!target.files) {
    return;
  }

  const file = target.files[0];

  if (!isFileImage(file)) {
    sendAlert("Please select an image", "ERROR");
    return;
  }

  const tempImage = new Image();
  tempImage.src = URL.createObjectURL(file);
  tempImage.onload = () => {
    widthInput.value = tempImage.naturalWidth.toString();
    heightInput.value = tempImage.naturalHeight.toString();
  };

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), "image_resizer");
};

const sendImage = (event: Event) => {
  event.preventDefault();

  if (!img.files || !img.files[0]) {
    sendAlert("Please upload an image", "ERROR");
    return;
  }

  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  if (!width || !height) {
    sendAlert("Please fill in hight and width", "ERROR");
    return;
  }

  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
};

ipcRenderer.on("image:done", () => {
  sendAlert(
    `Image resized to ${widthInput.value} x ${heightInput.value}`,
    "SUCCESS"
  );
});
img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
