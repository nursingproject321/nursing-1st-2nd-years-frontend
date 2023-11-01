import React, {
    useCallback, useEffect, useMemo, useRef, useState
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LoadingButton from "../common/LoadingButton";
import SelectBox from "../common/SelectBox";
import { useStore } from "../../store";
import ShowSnackbarAlert from "../common/SnackBarAlert";
import SkeletonLoader from "../common/SkeletonLoader";
import { StudyYearList, getYearsList, isValidEmailAddress, TermsList } from "../utils";
import { EVENTS, GlobalEventEmitter } from "../../services";
import axios from "axios";


export default function MoveStudents() {
    const { studentStore } = useStore();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [editObj, setEditObj] = useState(null);

    const studyYearRef = useRef(null);
    const yearRef = useRef(null);
    const termRef = useRef(null);

    // const fetchDetailsIfNeeded = useCallback(async () => {
    //     if (editId) {
    //         const student = await studentStore.get(editId);
    //         setEditObj(student);
    //     }

    //     setLoading(false);
    // }, []);

    const goBack = useCallback(() => {
        navigate("/students");
    }, []);

    const validate = useCallback((value, el, errMsg) => {
        let err = null;

        if (!value) {
            err = errMsg;
        }

        el.setError(err);
        return err === null;
    }, []);

    const handleSubmit = useCallback(async () => {
        const study_year = studyYearRef.current.getSelectedValue();
        const year = yearRef.current.getSelectedValue();
        const term = termRef.current.getSelectedValue();
        
        const isstudyYearValid = validate(year, studyYearRef.current, "Please select the year");
        const isYearValid = validate(year, yearRef.current, "Please select the year");
        const isTermValid = validate(term, termRef.current, "Please select the term");

        if (!isstudyYearValid || !isYearValid || !isTermValid) {
            ShowSnackbarAlert({
                message: "Please fill valid details!!",
                severity: "error"
            });
            return;
        }

        const params = {
            study_year, term, year
        };

        try {
            const response = await axios.post("/students/moveStudents", params);
            ShowSnackbarAlert({
                message: response.data.message,
                severity: "success"
            });
            studentStore.refetch();
            goBack();
        } catch (error) {
            ShowSnackbarAlert({
                message: error.response.data.message,
                severity: "error"
            });
        }
        
    }, []);

    function renderContent() {
        return (
            <Stack sx={{ width: "50%", my: 2 }} spacing={2}>
                <SelectBox
                    label="Study Year"
                    ref={studyYearRef}
                    selected={""}
                    required
                    options={StudyYearList}
                />
                
                <Stack spacing={2} direction="row">
                    <SelectBox
                        label="Select Term"
                        ref={termRef}
                        selected={""}
                        options={TermsList}
                        required
                />
                    <SelectBox
                        label="Term Year"
                        ref={yearRef}
                        selected={""}
                        required
                        options={getYearsList()}
                />
                </Stack>
            </Stack>
        );
    }

    function renderActions() {
        return (
            <Box sx={{ mb: 2 }}>
                <LoadingButton
                    label={"Move Students"}
                    onClick={handleSubmit}
                    sx={{ mr: 1 }}
                />
                <Button
                    onClick={goBack}
                    color="grey"
                    variant="outlined"
                >
                    Cancel
                </Button>
            </Box>
        );
    }

    function renderTabs() {
        return (
            <>
                {renderContent()}
                {renderActions()}
            </>
        );
    }

    // useEffect(() => {
    //     fetchDetailsIfNeeded();

    //     GlobalEventEmitter.emit(EVENTS.UPDATE_TOP_BAR, {
    //         text: editId ? "Edit Student" : "Add Student",
    //         navigateBackTo: "/students"
    //     });
    // }, []);

    useEffect(() => {
        GlobalEventEmitter.emit(EVENTS.UPDATE_TOP_BAR, {
            text: "Move Students to Next Term",
            navigateBackTo: "/students"
        });
    }, [editObj]);

    return (
        <Box sx={{ overflow: "auto", height: "calc(100vh - 60px)", px: 2 }}>
            {renderTabs()}
        </Box>
    );
}
