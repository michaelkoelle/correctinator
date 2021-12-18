/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import * as YAML from 'yaml';
import AssignmentIcon from '@material-ui/icons/Assignment';
import {
  Button,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import { clipboard } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { denormalize } from 'normalizr';
import {
  selectSchemaComments,
  selectSchemaEntities,
  selectSchemaRatings,
  selectSchemaSelectedSheetId,
  selectSchemaTasks,
} from '../../model/SchemaSlice';
import CommentEntity from '../../model/CommentEntity';
import RatingEntity from '../../model/RatingEntity';
import SheetEntity from '../../model/SheetEntity';
import {
  getMaxValueForTasks,
  getTotalValueOfRatings,
} from '../../utils/Formatter';
import TaskEntity from '../../model/TaskEntity';
import { getTopLevelTasks, hasTasksWithZeroMax } from '../../utils/TaskUtil';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import { selectSettingsGeneral } from '../../model/SettingsSlice';
import { useModal } from '../../modals/ModalProvider';
import ConfirmationDialog from '../../dialogs/ConfirmationDialog';
import OverwriteSchemaDialog, {
  onInitializeSheet,
} from '../../dialogs/OverwriteSchemaDialog';
import { TasksSchema, RatingsSchema } from '../../model/NormalizationSchema';
import { selectAllSheets } from '../../model/SheetSlice';

interface SchemaGeneratorToolbarProps {
  setSkipCheck: (value: boolean) => void;
}

export default function SchemaGeneratorToolbar(
  props: SchemaGeneratorToolbarProps
) {
  const { setSkipCheck } = props;
  const dispatch = useDispatch();
  const showModal = useModal();
  const { autosave } = useSelector(selectSettingsGeneral);
  const commentsEntity: CommentEntity[] = useSelector(selectSchemaComments);
  const sheets: SheetEntity[] = useSelector(selectAllSheets);
  const selectedSheetId: string = useSelector(selectSchemaSelectedSheetId);
  const tasksEntity: TaskEntity[] = useSelector(selectSchemaTasks);
  const ratingsEntity: RatingEntity[] = useSelector(selectSchemaRatings);
  const entities = useSelector(selectSchemaEntities);
  const selectedSheet: SheetEntity | undefined = sheets.find(
    (s) => s.id === selectedSheetId
  );
  const tasks: Task[] = denormalize(
    tasksEntity.map((t) => t.id),
    TasksSchema,
    entities
  );
  const ratings: Rating[] = denormalize(
    ratingsEntity.map((t) => t.id),
    RatingsSchema,
    entities
  );
  const maxValueTasks: number = tasks
    ? getMaxValueForTasks(getTopLevelTasks(tasks))
    : 0;
  const maxValue: number = selectedSheet?.maxValue || maxValueTasks;

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

  const getErrorMessage = () => {
    if (hasTasksWithZeroMax(tasksEntity)) {
      return `Tasks with zero max ${selectedSheet?.valueType}`;
    }

    if (selectedSheet && selectedSheet?.maxValue - maxValueTasks !== 0) {
      return `${Math.abs(selectedSheet?.maxValue - maxValueTasks)} ${
        selectedSheet?.valueType
      } ${
        selectedSheet?.maxValue - maxValueTasks < 0 ? 'too much' : 'remaining'
      }`;
    }

    return '';
  };

  if (!selectedSheet) {
    return null;
  }

  /* <Grid
        item
        container
        alignItems="center"
        direction="column"
        spacing={0}
        // style={{ padding: 0 }}
      >
        {selectedSheet && selectedSheet?.maxValue - maxValueTasks !== 0 && (
          <Grid item>
            <Typography color="error">
              {`${Math.abs(selectedSheet?.maxValue - maxValueTasks)} ${
                selectedSheet?.valueType
              } ${
                selectedSheet?.maxValue - maxValueTasks < 0
                  ? 'too much'
                  : 'remaining'
              }`}
            </Typography>
          </Grid>
        )}
        {hasTasksWithZeroMax(tasksEntity) && (
          <Grid item>
            <Typography color="error">
              {`Tasks with zero max ${selectedSheet?.valueType}`}
            </Typography>
          </Grid>
        )}
      </Grid> */

  /* <Grid
        item
        container
        alignItems="center"
        direction="row"
        spacing={2}
        style={{ width: 'fit-content' }}
      >
        <Grid item>
          <TextField
            variant="outlined"
            type="number"
            label="Value"
            size="small"
            style={{ width: '6em' }}
            disabled
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
            disabled
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
            value={selectedSheet?.valueType}
            disabled
            style={{ width: '110px' }}
          />
        </Grid>
      </Grid> */

  /* <Grid item style={{ width: 'fit-content' }}>
        <Typography>
          {`${selectedSheet.name}: ${getTotalValueOfRatings(
            ratings
          )} / ${maxValue} ${selectedSheet.valueType}`}
        </Typography>
      </Grid> */

  return (
    <Grid
      item
      container
      justify="space-between"
      alignItems="center"
      direction="row"
      spacing={2}
    >
      <Grid
        item
        container
        alignItems="center"
        direction="row"
        spacing={2}
        style={{ width: 'fit-content' }}
      >
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
            value={selectedSheet?.valueType}
            InputProps={{
              readOnly: true,
            }}
            style={{ width: '110px' }}
          />
        </Grid>
      </Grid>
      <Grid item style={{ width: 'fit-content' }}>
        <Typography color="error">{getErrorMessage()}</Typography>
      </Grid>
      <Grid
        item
        container
        alignItems="center"
        direction="row"
        spacing={2}
        style={{ width: 'fit-content' }}
      >
        {selectedSheet && (
          <Grid item>
            <Button
              variant="contained"
              color="primary"
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
  );
}
