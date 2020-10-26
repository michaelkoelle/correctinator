/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import AceEditor from 'react-ace';
import YAML from 'yaml';
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
import TaskSchemeList from './TaskSchemeList';
import {
  getSubmissionsOfSheet,
  hasTasksWithZeroMax,
  isSubmissionFromSheet,
  saveSubmissions,
  sumParam,
} from '../../utils/FileAccess';

function sheetToString(s) {
  if (s) {
    return s.sheet.name + s.school + s.course + s.term + s.rated_by;
  }
  return undefined;
}

export default function SchemeGenerator(props: any) {
  const {
    sheets,
    submissions,
    reload,
    setTab,
    setSheetToCorrect,
    schemaSheet,
  } = props;
  const [schema, setSchema] = useState([]) as any;
  const [taskCounter, setTaskCounter] = useState(0) as any;
  const [selected, setSelected] = useState({}) as any;
  const [, setOpen] = useState(false) as any;
  const [openDialog, setOpenDialog] = useState(false) as any;
  const [, setMessage] = useState('Test Message') as any;
  const [selectedSheet, setSelectedSheet] = useState(schemaSheet);
  const [selectValue, setSelectValue] = useState<string>(
    sheetToString(schemaSheet) || 'custom'
  );
  const [type, setType] = useState('points') as any;
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [schemaString, setSchemaString] = useState('');
  const [openStartCorrectionDialog, setOpenStartCorrectionDialog] = useState(
    false
  );

  const defaultTask = {
    id: taskCounter,
    name: `Task ${taskCounter + 1}`,
    max: '0',
    value: '0',
    step: '0.5',
    comment: '',
    tasks: [],
  };

  function getSheetFromValue(value) {
    const res = sheets?.filter((s) => value === sheetToString(s));
    if (res && res.length === 1) {
      return res[0];
    }
    return undefined;
  }

  function onSelectSheet(event) {
    setSelectValue(event.target.value);
    setSelectedSheet(getSheetFromValue(event.target.value));
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
    setOpenStartCorrectionDialog(false);
  }

  function onStartCorrection() {
    if (selectedSheet !== '' && selectedSheet !== undefined) {
      setSheetToCorrect(selectedSheet);
      setTab(3);
    }
  }

  function onAssignSchema() {
    setOpenConfirmDialog(false);
    const temp: any[] = [];
    submissions.forEach((sub) => {
      if (isSubmissionFromSheet(sub, selectedSheet)) {
        const subT = { ...sub };
        subT.tasks = schema;
        subT.points = sumParam(schema, 'value');
        temp.push(subT);
      } else {
        temp.push(sub);
      }
    });
    saveSubmissions(temp);
    reload();
    setOpenStartCorrectionDialog(true);
  }

  function onCopyToClipboard() {
    clipboard.writeText(YAML.stringify(schema));
  }

  function addTask(task: any, parent: any) {
    const duplicates = parent?.filter((t: any) => t.name === task.name);
    if (duplicates?.length > 0) {
      throw new Error('');
    }
    if (parent) {
      parent.tasks.push(task);
      setSchema(schema);
      setSchemaString(YAML.stringify(schema));
    } else {
      setSchema((old: any) => [...old, task]);
      setSchemaString(YAML.stringify([...schema, task]));
    }
  }

  function setTasks(tasks: any) {
    setSchema(tasks);
    setSchemaString(YAML.stringify(tasks));
  }

  function onAddTask() {
    try {
      addTask(defaultTask, null);
      setTaskCounter(taskCounter + 1);
      console.log('Added task');
    } catch (error) {
      console.error(error);
    }
  }

  function clearAllTasks() {
    setSchema([]);
    setSchemaString('');
    setSelected({});
    console.log('All tasks cleared!');
  }

  function fireSnack(msg: string) {
    setMessage(msg);
    setOpen(true);
  }

  function updateTask(tasksArray: any, task: any) {
    for (let i = 0; i < tasksArray.length; i += 1) {
      if (tasksArray[i].id === task.id) {
        tasksArray[i] = task;
        return;
      }
      updateTask(tasksArray[i].tasks, task);
    }
  }

  function deleteTask(tasksArray: any, task: any, parent: any, fullArray: any) {
    for (let i = 0; i < tasksArray.length; i += 1) {
      if (tasksArray[i].id === task.id) {
        tasksArray.splice(i, 1);
        if (tasksArray.length <= 0 && parent) {
          console.log('Restoring parent');
          updateTask(fullArray, {
            ...parent,
            max: '0',
            value: '0',
            step: '0.5',
            comment: '',
          });
        }
        fireSnack(`Deleted task "${task.name}"`);
        return;
      }
      deleteTask(tasksArray[i].tasks, task, tasksArray[i], fullArray);
    }
  }

  function onDeleteSelected() {
    const temp = [...schema];
    deleteTask(temp, selected, null, temp);
    setSchema(temp);
    setSchemaString(YAML.stringify(temp));
    setSelected({});
  }

  function onAddSubTask() {
    const tempTask = {
      id: selected.id,
      name: selected.name,
      type: selected.type,
      tasks: selected.tasks,
    };
    tempTask.tasks?.push(defaultTask);
    setTaskCounter(taskCounter + 1);
    const temp = [...schema];
    updateTask(temp, tempTask);
    setSchema(temp);
    setSchemaString(YAML.stringify(temp));
  }

  function onChange(newValue: any) {
    if (newValue !== null) {
      try {
        const tasks = YAML.parse(newValue);
        setSchema(tasks);
      } catch (error) {
        console.log('YAML Parse Error');
        setSchema([]);
      }
    }
    setSchemaString(newValue);
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  function onAssignToSheet() {
    const uniqueSheetsForScheme = sheets.filter(
      (s) => s.sheet.grading.max === sumParam(schema, 'max')
    );

    if (uniqueSheetsForScheme.length === 0) {
      alert('No sheets availiable with the same max value');
    } else {
      setOpenDialog(true);
    }
  }

  function handleListItemClick(sheet) {
    setOpenDialog(false);
    const temp: any[] = [];
    submissions.forEach((sub) => {
      if (isSubmissionFromSheet(sub, sheet)) {
        const subT = { ...sub };
        subT.tasks = schema;
        subT.points = sumParam(schema, 'value');
        temp.push(subT);
      } else {
        temp.push(sub);
      }
    });
    saveSubmissions(temp);
    reload();
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
              disabled={
                Object.keys(selected).length === 0 &&
                selected.constructor === Object
              }
            >
              Add subtask
            </Button>
            <Button
              type="button"
              onClick={onDeleteSelected}
              disabled={
                Object.keys(selected).length === 0 &&
                selected.constructor === Object
              }
            >
              Delete selected task
            </Button>
            <Button type="button" onClick={clearAllTasks}>
              Clear Tasks
            </Button>
            <Button type="button" onClick={onAssignToSheet}>
              Assign scheme to sheet
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
                        value={selectValue}
                        onChange={onSelectSheet}
                      >
                        <MenuItem value="custom">Custom shema</MenuItem>
                        {sheets.map((s) => {
                          return (
                            <MenuItem
                              key={sheetToString(s)}
                              value={sheetToString(s)}
                            >
                              {s.sheet.name}
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
                      value={sumParam(schema, 'value')}
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
                        selectedSheet?.sheet?.grading?.max ||
                        sumParam(schema, 'max')
                      }
                      error={
                        (selectedSheet &&
                          (sumParam(schema, 'max') !==
                            selectedSheet?.sheet?.grading?.max ||
                            hasTasksWithZeroMax(schema) ||
                            sumParam(schema, 'max') <= 0)) ||
                        (!selectedSheet &&
                          (hasTasksWithZeroMax(schema) ||
                            sumParam(schema, 'max') <= 0))
                      }
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      variant="outlined"
                      label="Type"
                      size="small"
                      value={selectedSheet?.sheet?.grading?.type || type}
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
                          getSubmissionsOfSheet(selectedSheet).filter(
                            (s) => s?.tasks?.length > 0
                          ).length > 0
                            ? onOverwriteSchema
                            : onAssignSchema
                        }
                        disabled={
                          sumParam(schema, 'max') !==
                            selectedSheet?.sheet?.grading?.max ||
                          hasTasksWithZeroMax(schema) ||
                          sumParam(schema, 'max') <= 0
                        }
                      >
                        {getSubmissionsOfSheet(selectedSheet).filter(
                          (s) => s?.tasks?.length > 0
                        ).length > 0
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
                            hasTasksWithZeroMax(schema) ||
                            sumParam(schema, 'max') <= 0
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
                  selectedSheet?.sheet?.grading?.max -
                    sumParam(schema, 'max') !==
                    0 && (
                    <Grid
                      item
                      container
                      xs={12}
                      justify="center"
                      alignItems="center"
                      style={{
                        paddingBottom: hasTasksWithZeroMax(schema)
                          ? '0px'
                          : '8px',
                      }}
                    >
                      <Grid item>
                        <Typography color="error">
                          {`${Math.abs(
                            selectedSheet?.sheet?.grading?.max -
                              sumParam(schema, 'max')
                          )} ${selectedSheet?.sheet?.grading?.type || type} ${
                            selectedSheet?.sheet?.grading?.max -
                              sumParam(schema, 'max') <
                            0
                              ? 'too much'
                              : 'remaining'
                          }`}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                {hasTasksWithZeroMax(schema) && (
                  <Grid
                    item
                    container
                    xs={12}
                    justify="center"
                    alignItems="center"
                    style={{
                      paddingTop:
                        selectedSheet &&
                        selectedSheet?.sheet?.grading?.max -
                          sumParam(schema, 'max') !==
                          0
                          ? '0px'
                          : '8px',
                    }}
                  >
                    <Grid item>
                      <Typography color="error">
                        {`Some of the tasks have zero max ${
                          selectedSheet?.sheet?.grading?.type || type
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
                tasks={schema}
                setTasks={setTasks}
                selectedTask={selected}
                setSelected={setSelected}
                type={selectedSheet?.sheet?.grading?.type || type}
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
      <Dialog
        onClose={handleCloseDialog}
        aria-labelledby="simple-dialog-title"
        open={openDialog}
        fullWidth
      >
        <DialogTitle id="simple-dialog-title">Choose sheet</DialogTitle>
        <List>
          {sheets
            .filter((s) => s.sheet.grading.max === sumParam(schema, 'max'))
            .map((sheet) => (
              <ListItem
                button
                onClick={() => handleListItemClick(sheet)}
                key={
                  sheet.term + sheet.school + sheet.course + sheet.sheet.name
                }
              >
                <ListItemText
                  primary={sheet.sheet.name}
                  secondary={`${sheet.course} ${sheet.term}`}
                />
              </ListItem>
            ))}
        </List>
      </Dialog>
      <Dialog open={openConfirmDialog} onClose={onCloseConfirmDialog}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to assign this schema to the sheet "${selectedSheet?.sheet?.name}"?
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
      <Dialog
        open={openStartCorrectionDialog}
        onClose={onCloseStartCorrectionDialog}
      >
        <DialogTitle>Start correcting?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you want to start correcting the sheet "${selectedSheet?.sheet?.name}" now?`}
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
