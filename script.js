$(document).ready(function () {
  "use strict";
  /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
  var gBASE_URL = "https://62454a477701ec8f724fb923.mockapi.io/api/v1";
  var gSTUNDENTS_LIST = {};
  var gSUBJECTS_LIST = {};

  var gStudentDetails = {
    students: [],
    filterOrder: function (paramFilter) {
      return this.students.filter(function (student) {
        return (
          (paramFilter.studentId === 0 || student.studentId == paramFilter.studentId) &&
          (paramFilter.subjectId === 0 || student.subjectId == paramFilter.subjectId)
        );
      });
    },
  };

  // Get API database
  //Students
  $.ajax({
    url: `${gBASE_URL}/students`,
    type: "GET",
    async: false,
    success: (res) => {
      gSTUNDENTS_LIST = res;
    },
    error: (err) => console.log(err.status),
  });

  //Subjects
  $.ajax({
    url: `${gBASE_URL}/subjects`,
    type: "GET",
    async: false,
    success: (res) => {
      gSUBJECTS_LIST = res;
    },
    error: (err) => console.log(err.status),
  });

  //Grades
  $.ajax({
    url: `${gBASE_URL}/grades`,
    type: "GET",
    async: false,
    success: (res) => {
      gStudentDetails.students = res;
    },
    error: (err) => console.log(err.status),
  });

  var gColumnsName = Object.keys(gStudentDetails.students[0]);
  gColumnsName.splice(0, 0, "STT");

  var gTable = $("#student-table").DataTable({
    columns: [
      { data: gColumnsName[0] },
      { data: gColumnsName[1] },
      { data: gColumnsName[2] },
      { data: gColumnsName[3] },
      { data: gColumnsName[4] },
      {
        data: "Action",
        defaultContent: `<i class="fas fa-edit pointer" data-toggle="tooltip" data-placement="top" title="Edit"></i>
        <i class="fas fa-trash pointer" data-toggle="tooltip" data-placement="top" title="Delete"></i>`,
      },
    ],
    columnDefs: [
      {
        targets: 0,
        render: function (data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      {
        targets: 1,
        render: (data) => {
          var vStudent = gSTUNDENTS_LIST.find((element) => {
            return element.id == data;
          });
          return `${vStudent.firstname} ${vStudent.lastname}`;
        },
      },
      {
        targets: 2,
        render: (data) => {
          var vSubject = gSUBJECTS_LIST.find((element) => {
            return element.id == data;
          });
          return `${vSubject.subjectName}`;
        },
      },
    ],
  });
  var vId;
  /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */

  onPageLoading();
  $("#btn-filter").on("click", filterStudent);

  $("#student-table").on("click", ".fa-trash", function () {
    $("#delete-modal").modal("show");
    var vRowData = getValueRowTable(this, gTable);
    vId = vRowData.id;
  });

  $("#btn-delete").on("click", function () {
    $.ajax({
      url: `${gBASE_URL}/grades/${vId}`,
      type: "DELETE",
      async: false,
      success: (res) => {
        alert("Bạn đã xóa thành công");
        reloadData();
        $("#delete-modal").modal("hide");
      },
      error: (err) => console.log(err.status),
    });
  });

  $("#student-table").on("click", ".fa-edit", function () {
    $("#edit-modal").modal("show");
    //load option to select
    importOptionToSelect("#select-student-edit", gSTUNDENTS_LIST);
    $("#select-student-edit option:first-child").remove();
    importOptionToSelect("#select-subject-edit", gSUBJECTS_LIST);
    $("#select-subject-edit option:first-child").remove();

    var vRowData = getValueRowTable(this, gTable);
    vId = vRowData.id;
    $.ajax({
      url: `${gBASE_URL}/grades/${vId}`,
      type: "GET",
      async: false,
      success: (res) => {
        var vObject = res;
        importValueToFormInput("#edit-modal", vObject);
      },
      error: (err) => console.log(err.status),
    });
  });

  $("#btn-confirm").on("click", function () {
    var vObject = getValueFormInput("#edit-form");
    var isValid = validateData("#edit-form");
    if (isValid) {
      $.ajax({
        url: gBASE_URL + "/grades",
        type: "PUT",
        async: false,
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(vObject),
        success: (res) => {
          alert("Bạn đã thêm chỉnh sửa thành công");
          reloadData();
          resetForm("#edit-form");
          $("#edit-modal").modal("hide");
        },
        error: (err) => alert("Thất bại"),
      });
    }
  });

  $("#btn-add").on("click", function () {
    $("#insert-modal").modal("show");
    //load option to select
    importOptionToSelect("#select-student-insert", gSTUNDENTS_LIST);
    // $("#select-student-insert option:first-child").remove();
    $("#select-student-insert option:first-child").text("Chọn tên sinh viên");
    importOptionToSelect("#select-subject-insert", gSUBJECTS_LIST);
    $("#select-subject-insert option:first-child").text("Chọn môn học");
  });

  $("#btn-insert").on("click", function () {
    var vObject = getValueFormInput("#insert-form");
    var isValid = validateData("#insert-form");
    if (isValid) {
      $.ajax({
        url: gBASE_URL + "/grades",
        type: "POST",
        async: false,
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(vObject),
        success: (res) => {
          alert("Bạn đã thêm mới thành công");
          reloadData();
          resetForm("#insert-form");
          $("#insert-modal").modal("hide");
        },
        error: (err) => alert("Thêm mới thất bại"),
      });
    }
  });

  /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
  function reloadData() {
    $.ajax({
      url: `${gBASE_URL}/grades`,
      type: "GET",
      async: false,
      success: (response) => {
        loadTable(gTable, response);
      },
      error: function (paramErr) {
        console.log(paramErr.status);
      },
    });
  }

  function resetForm(paramSelector) {
    var vInputElements = $(`${paramSelector} [name]`);
    for (var vInput of vInputElements) {
      vInput.value = "";
    }
  }

  /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/

  function onPageLoading() {
    loadTable(gTable, gStudentDetails.students);
    importOptionToSelect("#select-student", gSTUNDENTS_LIST);
    importOptionToSelect("#select-subject", gSUBJECTS_LIST);
  }

  function loadTable(paramTable, paramArray) {
    paramTable.clear();
    paramTable.rows.add(paramArray);
    paramTable.draw();
  }

  function importOptionToSelect(paramSelect, paramObject) {
    $(`${paramSelect} option`).remove();
    var keys = Object.keys(paramObject[0]);
    var vSelect = $(paramSelect);

    $("<option/>", {
      text: "--- Chọn tất cả ---",
      value: 0,
    }).appendTo(vSelect);

    if (!paramObject[0]["username"]) {
      for (var i = 0; i < paramObject.length; i++) {
        $("<option>", {
          value: paramObject[i][keys[0]],
          text: paramObject[i][keys[2]],
        }).appendTo(vSelect);
      }
    } else {
      for (var i = 0; i < paramObject.length; i++) {
        var vFullName = `${paramObject[i].firstname} ${paramObject[i].lastname}`;
        $("<option>", {
          value: paramObject[i]["id"],
          text: vFullName,
        }).appendTo(vSelect);
      }
    }
  }

  function filterStudent() {
    var vStudenFilter = parseInt($("#select-student").val());
    var vSubjectFilter = parseInt($("#select-subject").val());
    var filterObject = {
      studentId: vStudenFilter,
      subjectId: vSubjectFilter,
    };
    var vObjectfilter = gStudentDetails.filterOrder(filterObject);
    loadTable(gTable, vObjectfilter);
  }

  function getValueRowTable(paramButton, paramTable) {
    var vTableRow = $(paramButton).parents("tr");
    var vRowData = paramTable.row(vTableRow).data();
    return vRowData;
  }

  function importValueToFormInput(paramSelector, paramObject) {
    var vInputElements = $(`${paramSelector} [name]`);
    for (var vInput of vInputElements) {
      vInput.value = paramObject[vInput.name];
    }
  }

  function getValueFormInput(paramSelector) {
    var vInputElement = $(`${paramSelector} [name]`);
    var vObject = {};
    for (var i = 0; i < vInputElement.length; i++) {
      vObject[vInputElement[i].name] = vInputElement[i].value;
    }
    return vObject;
  }

  function validateData(paramSelector) {
    var vSelects = $(`${paramSelector} select`);
    var vInputs = $(`${paramSelector} input`);
    if (vSelects[0].value == 0) {
      alert("Bạn chưa chọn Sinh viên");
      return false;
    }
    if (vSelects[1].value == 0) {
      alert("Bạn chưa chọn Môn học");
      return false;
    }
    if (!vInputs[0].value) {
      alert("Bạn chưa nhập điểm");
      return false;
    }
    if (vInputs[0].value > 10 || vInputs[0].value < 0) {
      alert("Vui lòng Nhập điểm từ 0 tới 10");
      return false;
    }
    if (!vInputs[1].value) {
      alert("Bạn chưa chọn ngày");
      return false;
    }
    return true;
  }
});
