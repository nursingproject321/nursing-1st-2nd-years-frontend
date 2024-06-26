import React, {
    useCallback, useEffect, useMemo, useRef, useState
} from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import { observer } from "mobx-react";
import { toJS, observable, action, makeObservable } from "mobx";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/EditRounded";
import { useNavigate } from "react-router-dom";
import UploadIcon from "@mui/icons-material/Upload";
import GroupsIcon from "@mui/icons-material/Groups";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useStore } from "../../store";
import Table from "../common/Table";
import ShowConfirmDialog from "../common/ConfirmDialog";
import ShowSnackbarAlert, { ShowErrorAlert, ShowSuccessAlert } from "../common/SnackBarAlert";
import ShowDialog from "../common/Dialog";
import UploadFile from "../common/UploadFile";
import {
    FETCH_LIMIT, getYearsList, STUDENT_IMPORT_REQUIRED_HEADERS, StudyYearList, TermsList
} from "../utils";
import StudentStore from "../../store/student-store";
import axios from "axios";

function Students() {
    const { studentStore } = useStore();
    const uploadFileRef = useRef(null);
    const navigate = useNavigate();

    const { list, totalCount } = studentStore;

    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    const handleAddClick = useCallback(() => {
        navigate({ pathname: "add" });
    }, []);

    const handleMoveStudentsClick = useCallback(() => {
        ShowDialog({
            title: "Move Students to next Term",
            actionBtnName: "Move",
            content: (
                <>
                    <Alert severity="warning" sx={{ my: 1 }}>
                        <Typography variant="subtitle1">
                            <Typography variant="subtitle2"
                                mr={1}
                                component="span">
                                Note:
                            </Typography>
                            Once Students are moved to the next Term, you can't move them back.
                        </Typography>
                    </Alert>
                    <Typography variant="subtitle2" color="error">
                        Are you sure you want to move all students to the next term? Click Move to confirm.
                    </Typography>
                </>
            ),
            onConfirm: async () => {
                try {
                    const response = await axios.post("/students/moveStudents");
                    ShowSnackbarAlert({
                        message: response.data.message,
                        severity: "success"
                    });
                    // await studentStore.refetch(); 
                    // list = studentStore.list;
                    // setCurrentPage(0);
                    // setLoading(false);
                    window.location.reload();
                } catch (error) {
                    ShowSnackbarAlert({
                        message: error.response.data.message,
                        severity: "error"
                    });
                }
            }
        });
    }, []);

    const handleImportClick = useCallback(() => {
        ShowDialog({
            title: "Import Students",
            actionBtnName: "Import",
            content: (
                <>
                    <UploadFile
                        ref={uploadFileRef}
                        headers={STUDENT_IMPORT_REQUIRED_HEADERS}
                    />
                    <Alert severity="warning" sx={{ my: 1 }}>
                        <Typography variant="subtitle1">
                            <Typography
                                variant="subtitle2"
                                mr={1}
                                component="span"
                            >
                                Note:
                            </Typography>
                            Rows with Student ID that already exists will be skipped
                        </Typography>
                    </Alert>
                </>
            ),
            onConfirm: async () => {
                const fileData = await uploadFileRef.current.getFileData();
                if (fileData) {
                    try {
                        await studentStore.import(fileData);
                        ShowSuccessAlert("Imported successfully");
                    } catch (err) {
                        ShowErrorAlert(err.message);
                    }
                } else {
                    ShowErrorAlert("Please select the file", 3000);
                }
            }
        });
    }, []);

    const handleFilterChange = useCallback(async (column, value) => {
        const newFilters = { ...filters };
        if (value) {
            newFilters[column] = value;
        } else {
            delete newFilters[column];
        }

        setLoading(true);

        await studentStore.fetch({
            start: 0,
            ...newFilters
        });

        setCurrentPage(0);
        setFilters(newFilters);
        setLoading(false);
    }, [filters]);

    const handleEditRow = useCallback((index) => {
        const studentList = toJS(studentStore.list);
        navigate(`/students/${studentList[index]._id}`);
    }, []);

    const handleDeleteRow = useCallback((index, event) => {
        event.stopPropagation();
        ShowConfirmDialog({
            title: "Delete Student",
            description: "Are you sure you want to delete this student?",
            actionBtnName: "Delete",
            onConfirm: async () => {
                try {
                    await studentStore.delete(index);
                    ShowSnackbarAlert({
                        message: "Deleted successfully"
                    });
                } catch (err) {
                    ShowSnackbarAlert({
                        message: err.message, severity: "error"

                    });
                }
            }
        });
    }, []);

    const handleDeleteSelectedRows = useCallback((selectedRows) => {
        ShowConfirmDialog({
            title: "Delete Students",
            description: `Are you sure you want to delete these ${selectedRows.length} student(s)?`,
            actionBtnName: "Delete",
            onConfirm: async () => {
                try {
                    await studentStore.deleteMultiple(selectedRows);
                    ShowSnackbarAlert({
                        message: "Deleted successfully"
                    });
                } catch (err) {
                    ShowSnackbarAlert({
                        message: err.message, severity: "error"

                    });
                }
            }
        });
    }, []);

    const getToolBarActions = useCallback(() => (
        <Box>
            <Button
                startIcon={<AddIcon />}
                onClick={handleAddClick}
            >
                Add
            </Button>
            <Button
                startIcon={<UploadIcon />}
                onClick={handleImportClick}
            >
                Import
            </Button>
            <Button
                startIcon={<GroupsIcon />}
                onClick={handleMoveStudentsClick}
            >
                Move Students
            </Button>
        </Box>
    ), []);

    
    const CustomTableCell = ({ value }) => {
        return (
            <Tooltip 
                title={value} 
                arrow 
                placement="top"
            >
                <div 
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                        // maxWidth: "100px" 
                    }}
                >
                    {value}
                </div>
            </Tooltip>
        );
    };
    
    const columns = useMemo(() => [
        {
            name: "studentId", label: "Student ID", options: { filter: false, setCellProps: () => ({ style: { minWidth: "120px", maxWidth: "120px", width: "120px" }}), customBodyRender: (value) => (
                <div style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    boxSizing: "border-box"
                }}>
                    <CustomTableCell value={value} />
                </div>
            ) }
        },
        {
            name: "fname", label: "First name", options: { filter: false, setCellProps: () => ({ style: { minWidth: "120px", maxWidth: "120px", width: "120px" }}), customBodyRender: (value) => (
                <div style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>
                    <CustomTableCell value={value} />
                </div>
            ) }
        },
        {
            name: "lname", label: "Last name", options: { filter: false, setCellProps: () => ({ style: { minWidth: "120px", maxWidth: "120px", width: "120px" }}), customBodyRender: (value) => (
                <div style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>
                    <CustomTableCell value={value} />
                </div>
            ) }
        },
        {
            name: "email", label: "Email", options: { filter: false, setCellProps: () => ({ style: { minWidth: "200px", maxWidth: "200px", width: "200px" }}), customBodyRender: (value) => (
                <div style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>
                    <CustomTableCell value={value} />
                </div>
            ) }
        },
        // {
        //     name: "phoneNumber", label: "Phone number"
        // },
        // { name: "school", label: "School" },
        {
            name: "study_year",
            label: "Study Year",
            options: {
                filter: true,
                filterType: "dropdown",
                filterOptions: { names: StudyYearList },
                filterList: filters.study_year ? [filters.study_year] : [],
                setCellProps: () => ({ style: { textAlign:"center", minWidth: "85px", maxWidth: "85px", width: "85px" }})
            }
        },               
        {
            name: "year",
            label: "Term year",
            options: {
                filter: true,
                filterType: "dropdown",
                filterOptions: { names: getYearsList() },
                filterList: filters.year ? [filters.year] : [],
                setCellProps: () => ({ style: { minWidth: "80px", maxWidth: "80px", width: "80px" }})
            }
        },
        {
            name: "term",
            label: "Term",
            options: {
                filter: true,
                filterType: "dropdown",
                filterOptions: { names: TermsList },
                filterList: filters.term ? [filters.term] : [],
                setCellProps: () => ({ style: { minWidth: "100px", maxWidth: "100px", width: "100px" }})
            }
        },
        {
            name: "placementsHistoryLength",
            label: "Placements",
            options: {
                filter: false,
                setCellProps: () => ({ style: { minWidth: "100px", maxWidth: "100px", width: "100px", textAlign: "center" }}),
                // eslint-disable-next-line react/no-unstable-nested-components
                customBodyRender: (value) => (value > 0 ? value : <em>None</em>)
            }
        },
        {
            name: "notes", label: "Notes", options: { filter: false, setCellProps: () => ({ style: { 
                minWidth: "200px", maxWidth: "200px", width: "200px" }}), overflowTooltip: true, 
            customBodyRender: (value) => (
                <div style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>
                    <CustomTableCell value={value} />
                </div>
            )
            }
        },
        {
            name: "",
            options: {
                filter: false,
                viewColumns: false,
                setCellProps: () => ({ style: { width: "100px" } }),
                // eslint-disable-next-line react/no-unstable-nested-components
                customBodyRender: (value, tableMeta) => (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Tooltip
                            title="Edit"
                            arrow
                            placement="left"
                        >
                            <EditIcon
                                color="action"
                                className="actionIcon"
                                fontSize="small"
                                sx={{ cursor: "pointer" }}
                                onClick={() => handleEditRow(tableMeta.rowIndex)}
                            />
                        </Tooltip>
                        <Tooltip
                            title="Delete"
                            arrow
                            placement="right"
                        >
                            <DeleteIcon
                                color="error"
                                className="actionIcon"
                                fontSize="small"
                                sx={{ cursor: "pointer" }}
                                onClick={(event) => handleDeleteRow(tableMeta.rowIndex, event)}
                            />
                        </Tooltip>
                    </Box>
                ),
                width: "100px"
            }
        }
    ], [filters]);

    const handlePagination = useCallback(async (page) => {
        setLoading(true);
        if (list.length < page * FETCH_LIMIT + 1) {
            await studentStore.fetch({
                start: page * FETCH_LIMIT,
                ...filters
            });
        }
        setCurrentPage(page);
        setLoading(false);
    }, [list]);

    useEffect(() => {
        const fetchStudents = async () => {
            await studentStore.fetch({
                start: 0,
                ...filters
            });
            setCurrentPage(0);
            setLoading(false);
        };

        fetchStudents();
    }, []);

    // const tableData = toJS(list).map((obj) => ({
    //     ...obj,
    //     school: `${obj.school.name}, ${obj.school.campus}`
    // }));

    const tableData = toJS(list).slice(currentPage * FETCH_LIMIT, (currentPage * FETCH_LIMIT) + FETCH_LIMIT);
    const isFilterValueExist = Object.values(filters).filter((val) => val).length > 0;

    return (
        <Box className="table-container" sx={{ overflowX: "auto", width: "calc(100vw - 300px)" }}>
            <Table
                key={`${Date.now()}`}
                data={tableData}
                columns={columns}
                title={getToolBarActions()}
                options={{
                    // filter: false,
                    search: false,
                    pagination: true,
                    serverSide: true,
                    sortFilterList: false,
                    count: totalCount,
                    page: currentPage,
                    tableBodyHeight: isFilterValueExist ? "calc(100vh - 215px)" : "calc(100vh - 180px)",
                    onTableChange: (action, tableState) => {
                        if (action === "changePage") {
                            handlePagination(tableState.page);
                        }
                    },
                    onRowsDelete: ({ data }) => {
                        const indexes = data.map((obj) => obj.index);
                        handleDeleteSelectedRows(indexes);
                        return false;
                    },
                    downloadOptions: {
                        filename: "Students"
                    },
                    onFilterChange: (column, valueArr, type) => {
                        if (type === "reset") {
                            setFilters({});
                        } else {
                            let value;
                            if(column === "term"){
                                value =  valueArr[6][0]
                            }else{
                                value = column === "year" ? valueArr[5][0] : valueArr[4][0];
                            }
                            handleFilterChange(column, value);
                        }
                    },
                    textLabels: {
                        body: {
                            noMatch: loading ? "Fetching..." : "No records found"
                        }
                    },
                    onRowClick: (data, tableMeta) => handleEditRow(tableMeta.rowIndex),
                    setCellProps: (cellProps) => ({
                        style: { width: cellProps.columnDef.options.width }
                    }),
                    center: true
                }}
            />
        </Box>
    );
}

export default observer(Students);
