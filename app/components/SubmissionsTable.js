// @flow
import React from 'react';
import MUIDataTable from "mui-datatables";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setCurrentRow } from '../actions/actionCreators';

function SubmissionsTable(props) {
  const columns = [
    {
      name: 'id',
      label: 'Submission-Id'
    },
    {
      name: 'state',
      label: 'State'
    },
    {
      name: 'score',
      label: 'Score'
    },
    {
      name: 'maxPoints',
      label: 'Max. Points'
    },
    {
      name: 'exerciseName',
      label: 'Exercise Sheet'
    },
    {
      name: 'lectureName',
      label: 'Lecture'
    },
    {
      name: 'correctorName',
      label: 'Corrector'
    },
    {
      name: 'correctorEmail',
      label: 'E-Mail'
    },
    {
      name: 'fileCount',
      label: 'Attached Files'
    },
    {
      name: 'directory',
      label: 'Path'
    }
  ];

  const options = {
    filterType: 'dropdown',
    responsive: 'scroll',
    pagination: false,
    selectableRows: 'none',
    onRowClick: (rowData: string[], rowMeta: { dataIndex: number, rowIndex: number }) => {
      props.setCurrentRow(rowMeta.dataIndex);
    }
  };

  return (
    <MUIDataTable
      title="Submissions"
      data={props.submissions}
      columns={columns}
      options={options}
    />
  );
}

const mapStateToProps = (state) => {

  if(state.db && state.db.entities){
    console.log("mapStateToProps");
    const submissionCorrections = state.db.entities;
    return {
      submissions: submissionCorrections.map(submissionCorrection => ({
        id: "N/A",
        state: submissionCorrection.state,
        score: "N/A",
        maxPoints: submissionCorrection.exercise.maxPoints,
        exerciseName: submissionCorrection.exercise.name,
        lectureName: submissionCorrection.exercise.lecture.name,
        correctorName: "N/A",
        correctorEmail: "N/A",
        fileCount: submissionCorrection.filePaths,
        directory: submissionCorrection.ratingFilePath,
      }))
    };
  }

};

const mapDispatchToProps = (dispatch) => bindActionCreators({ setCurrentRow }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionsTable)
