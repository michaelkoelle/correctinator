/* eslint-disable react/jsx-no-duplicate-props */
import React, { ChangeEvent } from 'react';
import * as YAML from 'yaml';
import AssignmentIcon from '@material-ui/icons/Assignment';
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import { clipboard } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import {
  schemaClearSelectedSheet,
  schemaSetSelectedSheet,
  selectSchemaComments,
  selectSchemaEntities,
} from '../../model/SchemaSlice';
import CommentEntity from '../../model/CommentEntity';
import RatingEntity from '../../model/RatingEntity';
import SheetEntity from '../../model/SheetEntity';
import { getTotalValueOfRatings } from '../../utils/Formatter';
import TaskEntity from '../../model/TaskEntity';
import { hasTasksWithZeroMax } from '../../utils/TaskUtil';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import { selectSettingsGeneral } from '../../model/SettingsSlice';
import { useModal } from '../../modals/ModalProvider';
import ConfirmationDialog from '../../dialogs/ConfirmationDialog';
import OverwriteSchemaDialog, {
  onInitializeSheet,
} from '../../dialogs/OverwriteSchemaDialog';

interface SchemaGeneratorToolbarProps {
  sheets: SheetEntity[];
  selectedSheetId: string;
  ratings: Rating[];
  maxValue: number;
  selectedSheet: SheetEntity | undefined;
  tasksEntity: TaskEntity[];
  ratingsEntity: RatingEntity[];
  maxValueTasks: number;
  tasks: Task[];
  type: string;
  setType: (type: string) => void;
  setSkipCheck: (skipCheck: boolean) => void;
}

export default function SchemaGeneratorToolbar(
  props: SchemaGeneratorToolbarProps
) {
  const {
    sheets,
    selectedSheetId,
    ratings,
    maxValue,
    selectedSheet,
    tasksEntity,
    tasks,
    ratingsEntity,
    maxValueTasks,
    type,
    setType,
    setSkipCheck,
  } = props;
  const dispatch = useDispatch();
  const showModal = useModal();
  const { autosave } = useSelector(selectSettingsGeneral);
  const entities = useSelector(selectSchemaEntities);
  const commentsEntity: CommentEntity[] = useSelector(selectSchemaComments);

  const onSelectSheet = (event) => {
    const sheetId = event.target.value;
    if (event.target.value !== 'custom') {
      dispatch(schemaSetSelectedSheet(sheetId));
    } else {
      dispatch(schemaClearSelectedSheet());
    }
  };

  const onTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    setType(event.target.value as string);
  };

  const onAssignSchema = () => {
    onInitializeSheet(
      dispatch,
      showModal,
      autosave,
      selectedSheet,
      tasks,
      tasksEntity,
      ratingsEntity,
      commentsEntity
    );
  };

  const onOverwriteSchema = () => {
    showModal(
      ConfirmationDialog,
      OverwriteSchemaDialog(
        showModal,
        autosave,
        selectedSheet,
        tasks,
        tasksEntity,
        ratingsEntity,
        commentsEntity
      )
    );
  };

  const onCopyToClipboard = () => {
    setSkipCheck(true);
    clipboard.writeText(YAML.stringify(entities));
  };

  return (
    <Paper
      elevation={3}
      style={{
        padding: '16px',
      }}
    >
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
      >
        <Grid
          item
          container
          justify="space-between"
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <Grid
            container
            item
            alignItems="center"
            direction="row"
            spacing={2}
            style={{ width: 'fit-content' }}
          >
            <Grid item>
              <FormControl size="small" variant="outlined">
                <InputLabel id="sheet-select-label">Schema for</InputLabel>
                <Select
                  labelId="sheet-select-label"
                  label="Schema for"
                  value={selectedSheetId || 'custom schema'}
                  onChange={onSelectSheet}
                >
                  <MenuItem value="custom schema">Custom schema</MenuItem>
                  {sheets.map((s) => {
                    return (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <TextField
                variant="outlined"
                type="number"
                label="Value"
                size="small"
                style={{ width: '6em' }}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{
                  min: 0,
                  step: 0.5,
                }}
                value={getTotalValueOfRatings(ratings)}
              />
            </Grid>
            <Grid item>
              <TextField
                variant="outlined"
                type="number"
                label="Max"
                size="small"
                style={{ width: '6em' }}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{
                  min: 0,
                  step: 0.5,
                }}
                value={maxValue}
                error={
                  (selectedSheet &&
                    (maxValue !== selectedSheet?.maxValue ||
                      hasTasksWithZeroMax(tasksEntity) ||
                      maxValue <= 0)) ||
                  (!selectedSheet &&
                    (hasTasksWithZeroMax(tasksEntity) || maxValue <= 0))
                }
              />
            </Grid>
            <Grid item>
              <TextField
                variant="outlined"
                label="Type"
                size="small"
                value={selectedSheet?.valueType || type}
                onChange={onTypeChange}
                InputProps={{
                  readOnly: selectedSheet === undefined,
                }}
                style={{ width: '110px' }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            item
            alignItems="center"
            direction="row"
            spacing={2}
            style={{ width: 'fit-content', padding: 0 }}
          >
            {selectedSheet && selectedSheet?.maxValue - maxValueTasks !== 0 && (
              <Grid
                item
                container
                justify="center"
                alignItems="center"
                style={{
                  paddingBottom: hasTasksWithZeroMax(tasksEntity)
                    ? '0px'
                    : '8px',
                }}
              >
                <Grid item>
                  <Typography color="error">
                    {`${Math.abs(selectedSheet?.maxValue - maxValueTasks)} ${
                      selectedSheet?.valueType || type
                    } ${
                      selectedSheet?.maxValue - maxValueTasks < 0
                        ? 'too much'
                        : 'remaining'
                    }`}
                  </Typography>
                </Grid>
              </Grid>
            )}
            {hasTasksWithZeroMax(tasksEntity) && (
              <Grid
                item
                container
                justify="center"
                alignItems="center"
                style={{
                  paddingTop:
                    selectedSheet &&
                    selectedSheet?.maxValue - maxValueTasks !== 0
                      ? '0px'
                      : '8px',
                }}
              >
                <Grid item>
                  <Typography color="error">
                    {`Some of the tasks have zero max ${
                      selectedSheet?.valueType || type
                    }`}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Grid>
          <Grid
            container
            item
            alignItems="center"
            direction="row"
            spacing={2}
            style={{ width: 'fit-content' }}
          >
            {selectedSheet && (
              <Grid item>
                <Button
                  onClick={
                    selectedSheet &&
                    selectedSheet.tasks &&
                    selectedSheet.tasks.length > 0
                      ? onOverwriteSchema
                      : onAssignSchema
                  }
                  disabled={
                    maxValueTasks !== selectedSheet?.maxValue ||
                    hasTasksWithZeroMax(tasksEntity) ||
                    maxValueTasks <= 0
                  }
                >
                  {selectedSheet &&
                  selectedSheet.tasks &&
                  selectedSheet.tasks.length > 0
                    ? 'Overwrite'
                    : 'Assign'}
                </Button>
              </Grid>
            )}
            <Grid item>
              <Tooltip title="Copy to clipboard">
                <span>
                  <IconButton
                    onClick={onCopyToClipboard}
                    disabled={
                      hasTasksWithZeroMax(tasksEntity) || maxValueTasks <= 0
                    }
                    size="small"
                  >
                    <AssignmentIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
