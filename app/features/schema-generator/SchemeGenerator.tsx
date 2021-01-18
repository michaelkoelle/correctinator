/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
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
import TaskSchemeList from './TaskSchemeList';
import {
  denormalizeTasks,
  getSubmissionsOfSheet,
  hasTasksWithZeroMax,
  isSubmissionFromSheet,
  saveSubmissions,
  sumParam,
} from '../../utils/FileAccess';
import {
  schemaAddTask,
  schemaRemoveAllTasks,
  schemaRemoveTask,
  schemaSetSelectedSheet,
  selectSchema,
} from '../../model/SchemaSlice';
import {
  selectAllTasks,
  selectTaskEntities,
  tasksAddOne,
  tasksAddOneSubtask,
  tasksRemoveOne,
  tasksUpdateMany,
  tasksUpdateOne,
} from '../../model/TaskSlice';
import Task from '../../model/TaskEntity';
import { selectAllSheets } from '../../model/SheetSlice';
import Sheet from '../../model/Sheet';
import { correctionsInitializeTasksForSheet } from '../../model/CorrectionsSlice';
import Schema from '../../model/Schema';

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

export default function SchemeGenerator(props: any) {
  const {
    sheets,
    submissions,
    reload,
    setTab,
    setSheetToCorrect,
    schemaSheet,
    setSchemaSheet,
  } = props;
  const workspacePath = useSelector((state: any) => state.workspace.path);
  const [schema, setSchema] = useState([]) as any;
  const [taskCounter, setTaskCounter] = useState(0) as any;
  const [selected, setSelected] = useState({}) as any;
  const [, setOpen] = useState(false) as any;
  const [openDialog, setOpenDialog] = useState(false) as any;
  const [, setMessage] = useState('Test Message') as any;
  const [selectValue, setSelectValue] = useState<string>(
    sheetToString(schemaSheet) || 'custom'
  );
  const [type, setType] = useState('points') as any;
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [schemaString, setSchemaString] = useState('');
  const [openStartCorrectionDialog, setOpenStartCorrectionDialog] = useState(
    false
  );

  const defaultTask: Task = {
    id: uuidv4(),
    name: `Task ${taskCounter + 1}`,
    max: 0,
    value: 0,
    step: 0.5,
    tasks: [],
  };

  const [selectedSheetId, setSelectedSheetId] = useState<string>(
    initialSheet?.id || 'custom'
  );

  const getSchemaString = () => {
    try {
      return YAML.stringify(schemaTasks);
    } catch (error) {
      return '';
    }
  };

  useEffect(() => setSchemaString(getSchemaString()), [tasks]);

  function onSelectSheet(event) {
    setSelectedSheetId(event.target.value);
    const s = sheets.find((sheet) => sheet.id === event.target.value);
    if (event.target.value !== 'custom' && s !== undefined) {
      dispatch(schemaSetSelectedSheet(s));
    }
  }

  function onTypeChange(event) {
    setType(event.target.value);
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
    if (selectedSheetId !== '' && selectedSheetId !== undefined) {
      // TODO:
      // setSheetToCorrect(schemaSheet);
      // setTab(3);
    }
  }

  function onAssignSchema() {
    setOpenConfirmDialog(false);
    dispatch(
      correctionsInitializeTasksForSheet({
        tasks: schema.tasks,
        sheet: selectedSheetId,
      })
    );
    setCorrectionDialog(true);
  }

  function onCopyToClipboard() {
    clipboard.writeText(YAML.stringify(schema));
  }

  function addTask(task: Task) {
    dispatch(schemaAddTask(task));
    // setSchemaString(YAML.stringify(schemaTasks));
  }

  function onAddTask() {
    try {
      addTask({ ...defaultTask });
      setTaskCounter(taskCounter + 1);
      console.log('Added task');
    } catch (error) {
      console.error(error);
    }
  }

  function clearAllTasks() {
    dispatch(schemaRemoveAllTasks());
    setSchemaString('');
    console.log('All tasks cleared!');
  }

  function onDeleteSelected() {
    if (schema.selectedTask) {
      dispatch(schemaRemoveTask({ id: schema.selectedTask }));
    }
    // setSchemaString(YAML.stringify([...schema, task]));
  }

  function onAddSubTask() {
    dispatch(
      tasksAddOneSubtask({
        id: schema.selectedTask,
        subTask: { ...defaultTask },
      })
    );
    // setSchemaString(YAML.stringify(schemaTasks));
  }

  function onChange(newValue: any) {
    if (newValue !== null) {
      try {
        const parsedTasks: any[] = YAML.parse(newValue);
        dispatch(
          tasksUpdateMany(
            parsedTasks.map((t) => {
              return { id: t.id, changes: t };
            })
          )
        );
      } catch (error) {
        console.log('YAML Parse Error');
      }
      setSchemaString(newValue);
    }
  }

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
              disabled={schema.selectedTask === undefined}
            >
              Add subtask
            </Button>
            <Button
              type="button"
              onClick={onDeleteSelected}
              disabled={schema.selectedTask === undefined}
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
                        value={selectedSheetId}
                        onChange={onSelectSheet}
                      >
                        <MenuItem value="custom">Custom schema</MenuItem>
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
                      value={sumParam(schemaTasks, 'value')}
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
                      value={
                        schema.selectedSheet?.grading?.max ||
                        sumParam(schemaTasks, 'max')
                      }
                      error={
                        (schema.selectedSheet &&
                          (sumParam(schemaTasks, 'max') !==
                            schema.selectedSheet?.grading?.max ||
                            hasTasksWithZeroMax(
                              denormalizeTasks(schema.tasks, tasks)
                            ) ||
                            sumParam(schemaTasks, 'max') <= 0)) ||
                        (!schema.selectedSheet &&
                          (hasTasksWithZeroMax(
                            denormalizeTasks(schema.tasks, tasks)
                          ) ||
                            sumParam(schemaTasks, 'max') <= 0))
                      }
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      variant="outlined"
                      label="Type"
                      size="small"
                      value={schema.selectedSheet?.grading?.type || type}
                      onChange={onTypeChange}
                      InputProps={{
                        readOnly: schema.selectedSheet === undefined,
                      }}
                      style={{ width: '110px' }}
                    />
                  </Grid>
                  {schema.selectedSheet && (
                    <Grid item>
                      <Button
                        onClick={
                          getSubmissionsOfSheet(
                            schemaSheet,
                            workspacePath
                          ).filter((s) => s?.tasks?.length > 0).length > 0
                            ? onOverwriteSchema
                            : onAssignSchema
                        }
                        disabled={
                          sumParam(schemaTasks, 'max') !==
                            schema.selectedSheet?.grading?.max ||
                          hasTasksWithZeroMax(schemaTasks) ||
                          sumParam(schemaTasks, 'max') <= 0
                        }
                      >
                        {getSubmissionsOfSheet(
                          schemaSheet,
                          workspacePath
                        ).filter((s) => s?.tasks?.length > 0).length > 0
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
                            hasTasksWithZeroMax(schemaTasks) ||
                            sumParam(schemaTasks, 'max') <= 0
                          }
                          size="small"
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>

                {schema.selectedSheet &&
                  schema.selectedSheet?.grading?.max -
                    sumParam(schemaTasks, 'max') !==
                    0 && (
                    <Grid
                      item
                      container
                      xs={12}
                      justify="center"
                      alignItems="center"
                      style={{
                        paddingBottom: hasTasksWithZeroMax(schemaTasks)
                          ? '0px'
                          : '8px',
                      }}
                    >
                      <Grid item>
                        <Typography color="error">
                          {`${Math.abs(
                            schema.selectedSheet?.grading?.max -
                              sumParam(schemaTasks, 'max')
                          )} ${schema.selectedSheet?.grading?.type || type} ${
                            schema.selectedSheet?.grading?.max -
                              sumParam(schemaTasks, 'max') <
                            0
                              ? 'too much'
                              : 'remaining'
                          }`}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                {hasTasksWithZeroMax(schemaTasks) && (
                  <Grid
                    item
                    container
                    xs={12}
                    justify="center"
                    alignItems="center"
                    style={{
                      paddingTop:
                        schema.selectedSheet &&
                        schema.selectedSheet?.grading?.max -
                          sumParam(schemaTasks, 'max') !==
                          0
                          ? '0px'
                          : '8px',
                    }}
                  >
                    <Grid item>
                      <Typography color="error">
                        {`Some of the tasks have zero max ${
                          schema.selectedSheet?.grading?.type || type
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
                schemaTasks={schemaTasks}
                selectedTask={schema.selectedTask}
                type={schema.selectedSheet?.grading?.type || type}
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
              value={schemaString}
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
            {`Are you sure you want to assign this schema to the sheet "${schema.selectedSheet?.name}"?
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
            {`Are you want to start correcting the sheet "${schema.selectedSheet?.name}" now?`}
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
    </Grid>
  );
}
