/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-props-no-spreading */
import React, { ChangeEvent, useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import YAML from 'yaml';
import { v4 as uuidv4 } from 'uuid';
import AssignmentIcon from '@material-ui/icons/Assignment';
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { clipboard, remote } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { denormalize } from 'normalizr';
import {
  schemaClearSelectedSheet,
  schemaReset,
  schemaSetSelectedSheet,
  selectSchemaSelectedSheetId,
  removeSchemaTaskById,
  schemaUpsertTask,
  schemaUpsertComment,
  schemaUpsertRating,
  selectSchemaSelectedTaskId,
  schemaAddSubtask,
  selectSchemaTasks,
  selectSchemaComments,
  selectSchemaRatings,
  selectSchemaEntities,
  schemaSetEntities,
  selectSchemaClipboard,
  schemaSetClipboard,
} from '../../model/SchemaSlice';
import { tasksUpsertMany } from '../../model/TaskSlice';
import { selectAllSheets, sheetsUpsertOne } from '../../model/SheetSlice';
import RateableTask from '../../model/RateableTask';
import CommentEntity from '../../model/CommentEntity';
import RatingEntity from '../../model/RatingEntity';
import { setTabIndex } from '../../model/HomeSlice';
import { correctionPageSetSheetId } from '../../model/CorrectionPageSlice';
import SheetEntity from '../../model/SheetEntity';
import {
  getMaxValueForTasks,
  getRatingValueForTasks,
} from '../../utils/Formatter';
import { RatingsSchema, TasksSchema } from '../../model/NormalizationSchema';
import TaskEntity from '../../model/TaskEntity';
import {
  getTopLevelTasks,
  hasTaskEntitiesWithZeroMax,
} from '../../utils/TaskUtil';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import TaskSchemeList from './TaskSchemeList';
import ConfirmDialog from '../../components/ConfirmDialog';
import { correctionsUpsertMany } from '../../model/CorrectionsSlice';
import { commentsUpsertMany } from '../../model/CommentSlice';
import CorrectionEntity from '../../model/CorrectionEntity';
import { ratingsUpsertMany } from '../../model/RatingSlice';

// TODO:
// entweder eigene datensturkur für schema tasks machen oder tasks in tasks löschen wenn ein task/subtask gelöscht wird

/*
export default function SchemeGenerator(props: { initialSheet: Sheet }) {
  const { initialSheet } = props;
  console.log('RERENDER: SchemaGenerator');
  const dispatch = useDispatch();
  const tasks: Task[] = useSelector(selectAllTasks);
  const schema: Schema = useSelector(selectSchema);
  const sheets: Sheet[] = useSelector(selectAllSheets);
  const schemaTasks: Task[] = denormalizeTasks(schema.tasks, tasks);

  const [taskCounter, setTaskCounter] = useState<number>(0);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [correctionDialog, setCorrectionDialog] = useState<boolean>(false);
  const [type, setType] = useState<string>('points');
  const [schemaString, setSchemaString] = useState(
    YAML.stringify(schemaTasks) || ''
    */

function initializeSheet(
  sheetId: string,
  tasks: TaskEntity[],
  ratings: RatingEntity[],
  comments: CommentEntity[],
  topLevelTaskIds: string[]
) {
  return (dispatch, getState) => {
    const state = getState();

    dispatch(tasksUpsertMany(tasks));
    // dispatch(commentsUpsertMany(comments));
    // dispatch(ratingsUpsertMany(ratings));

    const sheet = state.sheets.entities[sheetId];
    if (sheet) {
      const temp = { ...sheet };
      temp.tasks = topLevelTaskIds;
      dispatch(sheetsUpsertOne(temp));
    }

    const correctionsOfSheet = Object.entries<CorrectionEntity>(
      state.corrections.entities
    )
      .map(([, v]) => v)
      .filter(
        (c) => state.submissions.entities[c.submission].sheet === sheetId
      );

    const allComments: CommentEntity[] = [];
    const allRatings: RatingEntity[] = [];

    const allCorrections: CorrectionEntity[] = [];
    correctionsOfSheet.forEach((c) => {
      const ratingsForCorrection: RatingEntity[] = [];
      ratings.forEach((r) => {
        const newComment = comments.find((comment) => comment.id === r.comment);
        const tempRating = { ...r };
        if (newComment) {
          const tempComment = { ...newComment };
          tempComment.id = uuidv4();
          allComments.push(tempComment);
          tempRating.comment = tempComment.id;
        }
        tempRating.id = uuidv4();
        ratingsForCorrection.push(tempRating);
        allRatings.push(tempRating);
      });
      const tempCorrection = { ...c };
      tempCorrection.ratings = ratingsForCorrection.map((r) => r.id);
      allCorrections.push(tempCorrection);
    });
    dispatch(commentsUpsertMany(allComments));
    dispatch(ratingsUpsertMany(allRatings));
    dispatch(correctionsUpsertMany(allCorrections));
  };
}

export default function SchemeGenerator() {
  const dispatch = useDispatch();
  // const workspace: string = useSelector<string>(selectWorkspacePath);
  const sheets: SheetEntity[] = useSelector(selectAllSheets);
  const selectedSheetId: string = useSelector(selectSchemaSelectedSheetId);
  const selectedTaskId: string = useSelector(selectSchemaSelectedTaskId);
  const tasksEntity: TaskEntity[] = useSelector(selectSchemaTasks);
  const ratingsEntity: RatingEntity[] = useSelector(selectSchemaRatings);
  const commentsEntity: CommentEntity[] = useSelector(selectSchemaComments);
  const clipboardOld = useSelector(selectSchemaClipboard);
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
  const [taskCounter, setTaskCounter] = useState<number>(0);
  const [type, setType] = useState('points');
  const maxValueTasks: number = tasks ? getMaxValueForTasks(tasks) : 0;
  const maxValue: number = selectedSheet?.maxValue || maxValueTasks;
  const [skipCheck, setSkipCheck] = useState<boolean>(false);

  // Dialogs
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [openConfirmPaste, setOpenConfirmPaste] = useState<boolean>(false);
  const [correctionDialog, setCorrectionDialog] = useState<boolean>(false);

  /*
  const [schema, setSchema] = useState([]) as any;

  const [selected, setSelected] = useState({}) as any;
  const [, setOpen] = useState(false) as any;
  const [openDialog, setOpenDialog] = useState(false) as any;
  const [, setMessage] = useState('Test Message') as any;
  const [selectValue, setSelectValue] = useState<string>(
    sheetToString(schemaSheet) || 'custom'
  );
  const [type, setType] = useState('points') as any;

  const [schemaString, setSchemaString] = useState('');
    const [selectedSheetId, setSelectedSheetId] = useState<string>(
    initialSheet?.id || 'custom'
  );

  */

  const getDefaultTask = (): RateableTask => {
    return {
      id: uuidv4(),
      name: `Task ${taskCounter + 1}`,
      max: 0,
      step: 0.5,
    };
  };

  const getDefaultComment = (task: TaskEntity): CommentEntity => {
    return {
      id: uuidv4(),
      task: task.id,
      text: '',
    };
  };

  const getDefaultRating = (
    task: TaskEntity,
    comment: CommentEntity
  ): RatingEntity => {
    return {
      id: uuidv4(),
      task: task.id,
      value: 0,
      comment: comment.id,
    };
  };

  /*
  const getSchemaString = () => {
    try {
      return YAML.stringify(schemaTasks);
    } catch (error) {
      return '';
    }
  };

  useEffect(() => setSchemaString(getSchemaString()), [tasks]);
*/
  function onSelectSheet(event) {
    const sheetId = event.target.value;
    if (event.target.value !== 'custom') {
      dispatch(schemaSetSelectedSheet(sheetId));
    } else {
      dispatch(schemaClearSelectedSheet());
    }
  }

  function onTypeChange(event: ChangeEvent<{ value: unknown }>) {
    setType(event.target.value as string);
  }

  function onOverwriteSchema() {
    setOpenConfirmDialog(true);
  }

  function onCloseConfirmDialog() {
    setOpenConfirmDialog(false);
  }

  function onCloseStartCorrectionDialog() {
    setCorrectionDialog(false);
  }

  function onStartCorrection() {
    if (selectedSheetId !== undefined) {
      dispatch(correctionPageSetSheetId(selectedSheetId));
      dispatch(setTabIndex(3));
    }
  }

  function onAssignSchema() {
    setOpenConfirmDialog(false);
    dispatch(
      initializeSheet(
        selectedSheetId,
        tasksEntity,
        ratingsEntity,
        commentsEntity,
        getTopLevelTasks(tasks).map((t) => t.id)
      )
    );
    setCorrectionDialog(true);
  }

  function onCopyToClipboard() {
    setSkipCheck(true);
    clipboard.writeText(YAML.stringify(entities));
  }

  function onPasteFromClipboard() {
    const text = clipboard.readText();
    try {
      const newEntities = YAML.parse(text);
      if (newEntities.tasks && newEntities.ratings && newEntities.comments) {
        dispatch(schemaSetEntities(newEntities));
        dispatch(schemaSetClipboard(text));
      }
    } catch (error) {
      console.log('YAML Parse Error');
    }
  }

  function checkClipboard() {
    const text = clipboard.readText();

    if (text.trim() === YAML.stringify(entities).trim()) {
      dispatch(schemaSetClipboard(text));
    }

    if (
      text.trim().length === 0 ||
      text === clipboardOld ||
      text.trim() === YAML.stringify(entities).trim()
    ) {
      return;
    }
    try {
      const newEntities = YAML.parse(text);
      if (newEntities.tasks && newEntities.ratings && newEntities.comments) {
        dispatch(schemaSetClipboard(text));
        if (!skipCheck) {
          setOpenConfirmPaste(true);
        } else {
          setSkipCheck(false);
        }
      }
    } catch (error) {
      console.log('YAML Parse Error');
    }
  }

  function clearClipborad() {
    const text = clipboard.readText();
    dispatch(schemaSetClipboard(text));
  }

  function addDefaultTask() {
    const dTask = getDefaultTask();
    const dComment = getDefaultComment(dTask);
    const dRating = getDefaultRating(dTask, dComment);
    dispatch(schemaUpsertTask(dTask));
    dispatch(schemaUpsertComment(dComment));
    dispatch(schemaUpsertRating(dRating));
  }

  function onAddTask() {
    addDefaultTask();
    setTaskCounter(taskCounter + 1);
  }

  function clearAllTasks() {
    dispatch(schemaReset());
  }

  function onDeleteSelected() {
    if (selectedTaskId) {
      dispatch(removeSchemaTaskById(selectedTaskId));
    }
  }

  function onAddSubTask() {
    if (selectedTaskId) {
      const dTask = getDefaultTask();
      const dComment = getDefaultComment(dTask);
      const dRating = getDefaultRating(dTask, dComment);
      dispatch(
        schemaAddSubtask({
          parentId: selectedTaskId,
          task: dTask,
        })
      );
      dispatch(schemaUpsertComment(dComment));
      dispatch(schemaUpsertRating(dRating));
      setTaskCounter(taskCounter + 1);
    }
  }

  function onChange(newValue: any) {
    if (newValue !== null) {
      try {
        const newEntities = YAML.parse(newValue);
        if (newEntities.tasks && newEntities.ratings && newEntities.comments) {
          dispatch(schemaSetEntities(newEntities));
        }
      } catch (error) {
        console.log('YAML Parse Error');
      }
    }
  }

  useEffect(() => {
    const id = setInterval(() => checkClipboard(), 1000);
    return () => {
      clearInterval(id);
    };
  }, [clipboardOld, skipCheck, entities]);

  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      spacing={4}
      style={{ height: 'calc(100% - 45px)', marginTop: '16px' }}
    >
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item style={{ margin: '0px 16px' }}>
          <Typography variant="h3">Schema Generator</Typography>
        </Grid>
        <Grid item style={{ margin: '0px 16px' }}>
          <ButtonGroup size="small">
            <Button type="button" onClick={onAddTask}>
              Add Task
            </Button>
            <Button
              type="button"
              onClick={onAddSubTask}
              disabled={selectedTaskId === undefined}
            >
              Add subtask
            </Button>
            <Button
              type="button"
              onClick={onDeleteSelected}
              disabled={selectedTaskId === undefined}
            >
              Delete selected task
            </Button>
            <Button type="button" onClick={clearAllTasks}>
              Clear Tasks
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <Grid
        item
        container
        wrap="nowrap"
        style={{ flex: '1 1 0%', height: '0px' }}
      >
        <Grid
          item
          container
          direction="column"
          xs={8}
          style={{
            flex: '1 1 0%',
            marginRight: '16px',
          }}
        >
          <Grid
            item
            style={{
              marginBottom: '8px',
            }}
          >
            <Paper
              elevation={3}
              style={{
                padding: '16px',
              }}
            >
              <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                spacing={2}
              >
                <Grid
                  item
                  container
                  justify="space-between"
                  // wrap="nowrap"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item>
                    <FormControl size="small" variant="outlined">
                      <InputLabel id="sheet-select-label">
                        Schema for
                      </InputLabel>
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
                      value={getRatingValueForTasks(tasks, ratings)}
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
                          (getMaxValueForTasks(tasks) !==
                            selectedSheet?.maxValue ||
                            hasTaskEntitiesWithZeroMax(tasksEntity) ||
                            getMaxValueForTasks(tasks) <= 0)) ||
                        (!selectedSheet &&
                          (hasTaskEntitiesWithZeroMax(tasksEntity) ||
                            getMaxValueForTasks(tasks) <= 0))
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
                          hasTaskEntitiesWithZeroMax(tasksEntity) ||
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
                            hasTaskEntitiesWithZeroMax(tasksEntity) ||
                            maxValueTasks <= 0
                          }
                          size="small"
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>

                {selectedSheet &&
                  selectedSheet?.maxValue - maxValueTasks !== 0 && (
                    <Grid
                      item
                      container
                      xs={12}
                      justify="center"
                      alignItems="center"
                      style={{
                        paddingBottom: hasTaskEntitiesWithZeroMax(tasksEntity)
                          ? '0px'
                          : '8px',
                      }}
                    >
                      <Grid item>
                        <Typography color="error">
                          {`${Math.abs(
                            selectedSheet?.maxValue - maxValueTasks
                          )} ${selectedSheet?.valueType || type} ${
                            selectedSheet?.maxValue - maxValueTasks < 0
                              ? 'too much'
                              : 'remaining'
                          }`}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                {hasTaskEntitiesWithZeroMax(tasksEntity) && (
                  <Grid
                    item
                    container
                    xs={12}
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
            </Paper>
          </Grid>
          <Grid item style={{ flex: '1 1 0%' }}>
            <Paper
              elevation={3}
              style={{
                flex: '1 1 0%',
                height: '0px',
                minHeight: 'calc(100%)',
                overflow: 'auto',
                padding: '16px',
              }}
            >
              <TaskSchemeList
                tasks={tasks}
                ratings={ratings}
                ratingEntities={ratingsEntity}
                comments={commentsEntity}
                type={selectedSheet ? selectedSheet.type : type}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={4} style={{ flex: '1 1 0%', marginRight: '16px' }}>
          <Paper
            elevation={3}
            style={{
              flex: '1 1 0%',
              height: '0px',
              minHeight: 'calc(100%)',
              overflow: 'auto',
            }}
          >
            <AceEditor
              mode="yaml"
              theme={
                remote.nativeTheme.shouldUseDarkColors ? 'twilight' : 'textmate'
              }
              width="100%"
              height="100%"
              maxLines={Infinity}
              value={entities.tasks === {} ? '' : YAML.stringify(entities)}
              onChange={onChange}
              name="editor"
              editorProps={{ $blockScrolling: true }}
              style={{ flex: '1 1 0%', minHeight: '100%' }}
              showPrintMargin={false}
            />
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={openConfirmDialog} onClose={onCloseConfirmDialog}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to assign this schema to the sheet "${selectedSheet?.name}"?
            All progress will be lost!`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onAssignSchema} color="primary" autoFocus>
            Yes
          </Button>
          <Button onClick={onCloseConfirmDialog} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={correctionDialog} onClose={onCloseStartCorrectionDialog}>
        <DialogTitle>Start correcting?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you want to start correcting the sheet "${selectedSheet?.name}" now?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onStartCorrection} color="primary" autoFocus>
            Yes
          </Button>
          <Button onClick={onCloseStartCorrectionDialog} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        title="Paste from Clipboard?"
        text="Do you want to paste the correction schema from you clipboard?"
        open={openConfirmPaste}
        setOpen={setOpenConfirmPaste}
        onConfirm={onPasteFromClipboard}
        onReject={clearClipborad}
      />
    </Grid>
  );
}
