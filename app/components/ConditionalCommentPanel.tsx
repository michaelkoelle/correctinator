/* eslint-disable react/jsx-curly-newline */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { Collapse, Grid, Switch } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSettingsExport,
  settingsSetExport,
} from '../model/SettingsSlice';
import ConditionalCommentSettings from './ConditionalCommentSettings';

const ConditionalCommentPanel = () => {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettingsExport);
  const [showLabel, setShowLabel] = useState(
    settings.conditionalCommentEnabled
  );

  function onToggleConditionalComment() {
    dispatch(
      settingsSetExport({
        ...settings,
        conditionalCommentEnabled: !settings.conditionalCommentEnabled,
      })
    );
    // Workaround for using tooltips
    if (showLabel) {
      setShowLabel(false);
    } else {
      setTimeout(() => {
        setShowLabel(true);
      }, 300);
    }
  }

  return (
    <Grid container direction="row" justify="flex-start" alignItems="center">
      <Grid
        item
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="h6">Conditional Comment</Typography>
        </Grid>
        <Grid item>
          <Switch
            checked={settings.conditionalCommentEnabled}
            onChange={onToggleConditionalComment}
          />
        </Grid>
      </Grid>
      <Collapse
        in={settings.conditionalCommentEnabled}
        style={{ width: '100%' }}
      >
        <ConditionalCommentSettings showLabel={showLabel} />
      </Collapse>
    </Grid>
  );
};

export default ConditionalCommentPanel;
