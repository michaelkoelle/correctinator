/* eslint-disable react/jsx-curly-newline */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Typography from '@material-ui/core/Typography';
import {
  Grid,
  IconButton,
  Paper,
  Slider,
  Theme,
  useTheme,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import ConditionalCommentTextInput from './ConditionalCommentTextInput';
import {
  selectSettingsExport,
  settingsAddConditionalComment,
  settingsUpdateConditionalCommentValue,
} from '../slices/SettingsSlice';

function ValueLabelComponent(props: {
  children;
  value: number;
  comments: string[];
  theme: Theme;
}) {
  const { children, value, comments, theme } = props;
  return (
    <>
      {children}
      <span
        style={{
          position: 'absolute',
          display: 'flex',
          left: `${value}%`,
        }}
      >
        <span
          style={{
            position: 'relative',
            left: '-50%',
          }}
        >
          <span
            style={{
              position: 'relative',
              bottom: '39px',
              padding: '5px',
              borderRadius: '5px',
              background: theme.palette.primary.main,
              color: 'white',
              whiteSpace: 'nowrap',
              boxShadow: '0px 0px 10px -3px rgba(0,0,0,0.4)',
              fontSize: '13px',
            }}
          >
            {`${comments[children.props['data-index']]} ≥ ${Math.round(
              value
            )}%`}
          </span>
        </span>
        <span
          style={{
            position: 'absolute',
            left: '-10px',
            bottom: '29px',
            width: '0',
            height: '0',
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: `6px solid ${theme.palette.primary.dark}`,
          }}
        />
      </span>
    </>
  );
}

const ConditionalCommentSettings = (props: { showLabel: boolean }) => {
  const { showLabel } = props;
  const dispatch = useDispatch();
  const theme = useTheme();
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
                  theme={theme}
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
