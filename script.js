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
  $.ajax({
    url: `${gBASE_URL}/students`,
    type: "GET",
    async: false,
    success: (res) => {
      gSTUNDENTS_LIST = res;
    },
    error: (err) => console.log(err.status),
  });

  $.ajax({
    url: `${gBASE_URL}/subjects`,
    type: "GET",
    async: false,
    success: (res) => {
      gSUBJECTS_LIST = res;
    },
    error: (err) => console.log(err.status),
  });

  $.ajax({
    url: `${gBASE_URL}/grades`,
    type: "GET",
    async: false,
    success: (res) => {
      gStudentDetails.students = res;
    },
    error: (err) => console.log(err.status),
  });

  console.log(gSTUNDENTS_LIST);
  console.log(gSUBJECTS_LIST);
  console.log(gStudentDetails.students);

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
  /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */

  onPageLoading();
  $("#btn-filter").on("click", filterStudent);
  /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */

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
});
