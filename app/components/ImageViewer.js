import React from 'react';
import PropTypes from 'prop-types';
import styles from './ImageViewer.module.css';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { Icon } from '@material-ui/core';

export default class ImageViewer extends React.Component {

  constructor(props){
    super(props);
    this.state = {

    }
  }

  render() {
    const { path, scale, rotation } = this.props;
    let width = window.innerWidth * 0.9;

    if(rotation === 90 || rotation === 270){
      width = window.innerHeight * 0.9;
    }

    const dyn = {
      transform: `rotate(${rotation}deg)`,
      width: width * scale,
    };

    return (
      <div className={styles.container}>
        <img src={path} className={styles.image} style={dyn} alt={path}/>
      </div>
    );
  }
}

ImageViewer.propTypes = {
  path: PropTypes.string.isRequired,
  scale: PropTypes.number.isRequired,
  rotation: PropTypes.number.isRequired
};
