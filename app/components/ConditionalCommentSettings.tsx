/* eslint-disable react/jsx-curly-newline */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Typography from '@material-ui/core/Typography';
import {
  Fade,
  Grid,
  IconButton,
  Paper,
  Slider,
  Tooltip,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import ConditionalCommentTextInput from './ConditionalCommentTextInput';
import {
  selectSettingsExport,
  settingsAddConditionalComment,
  settingsUpdateConditionalCommentValue,
} from '../model/SettingsSlice';

const PrimaryTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.default,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

function ValueLabelComponent(props: any) {
  const { children, open, value, comments } = props;
  return (
    <PrimaryTooltip
      open={open}
      hidden={!open}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 0 }}
      placement="top"
      title={`${comments[children.props['data-index']]} ≥ ${Math.round(
        value
      )}%`}
      arrow
    >
      {children}
    </PrimaryTooltip>
  );
}

const ConditionalCommentSettings = (props: { showLabel: boolean }) => {
  const { showLabel } = props;
  const dispatch = useDispatch();
  const settings = useSelector(selectSettingsExport);

  return (
    <>
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item style={{ width: '100%' }}>
          <Paper
            variant="outlined"
            style={{
              padding: '50px 50px 10px',
              marginTop: '16px',
              marginBottom: '16px',
              width: 'calc(100%)',
            }}
          >
            <Slider
              value={settings.conditionalComments.map((c) =>
                Math.round(c.minPercentage * 100)
              )}
              valueLabelDisplay={showLabel ? 'on' : 'off'}
              track={false}
              marks={[...Array(5).keys()]
                .map((i, _ind, arr) => i * (100 / (arr.length - 1)))
                .map((v) => {
                  return { value: Math.round(v), label: `${Math.round(v)}%` };
                })}
              onChange={(_event, values) =>
                dispatch(
                  settingsUpdateConditionalCommentValue(
                    (values as number[]).map((v) => v / 100.0)
                  )
                )
              }
              ValueLabelComponent={(p) => (
                <ValueLabelComponent
                  {...p}
                  comments={settings.conditionalComments.map((c) => c.text)}
                />
              )}
            />
          </Paper>
        </Grid>
        <Grid item justify="flex-start" style={{ width: '100%' }}>
          <Typography>Options:</Typography>
        </Grid>
        <Grid container item justify="flex-start" wrap="nowrap">
          {settings.conditionalComments.map((c, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Grid key={`comment-${i}`} item>
              <ConditionalCommentTextInput c={c} i={i} />
            </Grid>
          ))}
          {settings.conditionalComments.length < 4 && (
            <Grid item style={{ marginTop: '19px' }}>
              <IconButton
                onClick={() =>
                  dispatch(
                    settingsAddConditionalComment({
                      text: '',
                      minPercentage: 1,
                    })
                  )
                }
                style={{ padding: '0px' }}
              >
                <AddCircleIcon fontSize="large" />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default ConditionalCommentSettings;
