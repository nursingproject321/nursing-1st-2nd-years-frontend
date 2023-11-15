import React, { forwardRef } from "react";
import MUIDataTable from "mui-datatables";

const Table = forwardRef(({ options = {}, ...otherProps }, ref) => (
    <MUIDataTable
        ref={ref}
        options={{
            tableBodyHeight: "calc(100vh - 180px)",
            // tableBodyMaxWidth: "calc(100vh - 180px)", // Added for vertical scrollbar
            rowsPerPage: 50,
            rowsPerPageOptions: [50],
            print: false,
            textLabels: {
                body: {
                    noMatch: "No records found"
                }
            },
            // css: {
            //     // Added to enable horizontal scrollbar
            //     overflowX: "auto"
            // },
            ...options
        }}
        {...otherProps}
    />
));

export default Table;
