document.addEventListener(
  "DOMContentLoaded",
  () => {
    var elems = document.querySelectorAll(".modal");
    var modal = M.Modal.init(elems, {});

    var selectOptions = document.querySelectorAll("select");
    var selcetDropDown = M.FormSelect.init(selectOptions, {});

    const uploadButton = document.querySelector(".browse-btn");
    const fileInfo = document.querySelector(".file-info");
    const realInput = document.getElementById("real-input");

    uploadButton.addEventListener("click", e => {
      realInput.click();
    });

    realInput.addEventListener("change", () => {
      const name = realInput.value.split(/\\|\//).pop();
      const truncated = name.length > 20 ? name.substr(name.length - 20) : name;

      fileInfo.innerHTML = truncated;
    });
  },
  false
);
