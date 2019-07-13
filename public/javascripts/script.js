document.addEventListener(
  "DOMContentLoaded",
  () => {
    var elems = document.querySelectorAll(".modal");
    var instances = M.Modal.init(elems, {});
  },
  false
);
