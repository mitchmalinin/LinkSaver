document.addEventListener(
  "DOMContentLoaded",
  () => {
    var elems = document.querySelectorAll(".modal");
    var modal = M.Modal.init(elems, {});
    var elems = document.querySelectorAll(".dropdown-trigger");
    var dropdown = M.Dropdown.init(elems, {});
  },
  false
);
