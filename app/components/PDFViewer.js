import { Document, Page, pdfjs } from 'react-pdf';
import React from 'react';
import PropTypes from 'prop-types';
import styles from './PDFViewer.module.css';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { Icon } from '@material-ui/core';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default class PDFViewer extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      numPages: null,
    }
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

  onDocumentLoadError = ( error ) => {
    console.error(`Fehler:${  error.message}`);
  };

  render() {
    const { numPages } = this.state;
    const { path, scale, rotation } = this.props;
    const pages = [];
    const width = window.innerWidth * 0.9;

    for(let i = 0; i < numPages; i){
      i += 1;
      pages.push(<Page pageNumber={i}  scale={scale} rotate={rotation} width={width} className={[numPages!==i?styles.Pages:"", styles.PageCenter]}/>);
    }

    return (
      <Document
        file={path}
        onLoadSuccess={this.onDocumentLoadSuccess}
        error={<Backdrop open><Icon className={["fas fa-exclamation-triangle", styles.errorIcon]}/><Typography variant="h6" className={styles.errorText}> PDF could not be loaded!</Typography></Backdrop>}
        loading={<Backdrop open><CircularProgress color="inherit" /></Backdrop>}
      >
        {pages}
      </Document>
    );
  }
}

PDFViewer.propTypes = {
  path: PropTypes.string.isRequired,
  scale: PropTypes.number.isRequired,
  rotation: PropTypes.number.isRequired
};
