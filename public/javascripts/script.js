document.addEventListener(
  "DOMContentLoaded",
  () => {
    var elems = document.querySelectorAll(".modal");
    var modal = M.Modal.init(elems, {});

    var selectOptions = document.querySelectorAll("select");
    var selcetDropDown = M.FormSelect.init(selectOptions, {});
  },
  false
);
