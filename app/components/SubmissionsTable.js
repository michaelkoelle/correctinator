// @flow
import React from 'react';
import MUIDataTable from "mui-datatables";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setCurrentRow } from '../actions/actionCreators';

function SubmissionsTable(props) {
  const columns = [
    {
      name: 'submissionId',
      label: 'Submission-Id'
    },
    {
      name: 'state',
      label: 'State'
    },
    {
      name: 'rating',
      label: 'Rating'
    },
    {
      name: 'maxpoints',
      label: 'Max. Points'
    },
    {
      name: 'exercise',
      label: 'Exercise Sheet'
    },
    {
      name: 'lecture',
      label: 'Lecture'
    },
    {
      name: 'corrector',
      label: 'Corrector'
    },
    {
      name: 'email',
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

const mapStateToProps = (state) => ({
  submissions: state.project.submissions
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ setCurrentRow }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionsTable)
